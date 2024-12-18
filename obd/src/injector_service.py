import socketio

from .injector_base import InjectorBase
from .logger import register_logger
from .oap import OAPInjector
from .obd_service import OBDService
from .configuration_service import ConfigurationService

injector_map = {
    'oap': OAPInjector
}

class InjectorService():

    def __init__(self, sio: socketio.AsyncServer, config: ConfigurationService, obd_service: OBDService):
        self.__register_events(sio)
        self.logger = register_logger(__name__, file_logger=False)
        self.sio = sio
        self.config: ConfigurationService = config
        self.obd: OBDService = obd_service
        self.__injectors: dict[str, InjectorBase] = {}
        self.logger.info("Initializing OnBoardPi data injectors")
        if not 'injectors' in self.config.settings:
            return
        
        for injector_type, injector_config in self.config.settings['injectors'].items():
            # If the injector is to be enabled at startup (enabled == True in settings file) cache it
            if injector_config['enabled'] == True:
                self.register_injector(injector_type)


    async def startup(self):
        enabled_injectors = self.get_enabled_injectors()
        if len(enabled_injectors) > 0:
            for injector in enabled_injectors:
                self.sio.start_background_task(injector.start)


    async def shutdown(self):
        for injector in self.get_enabled_injectors():
            await injector.stop()
        

    def register_injector(self, injector_type:  str) -> InjectorBase:
        """ Create and cache a new injector instance of type. The new injector is assumed to be enabled """
        injector_config = self.config.settings['injectors'][injector_type]
        # create a logger for this injector
        logger = register_logger(injector_type, injector_config['log_level'], file_logger=True)
        # create a new instance of this injector type via the injector map
        injector = injector_map[injector_type](
            obd=self.obd,
            logger=logger,
            **injector_config['parameters'])
        # cache the instance with self
        self.__injectors[injector_type] = injector

        return injector
    

    def get_injectors(self) -> dict[str, InjectorBase]:
        return self.__injectors
    

    def get_enabled_injectors(self) -> list[InjectorBase]:
        return [i for i in self.__injectors.values() if i.is_enabled()]
    
    
    def __register_events(self, sio: socketio.AsyncServer):

        @sio.event
        async def enable_injector(sid, injector_type):
            if injector_type in self.get_injectors():
                # this injector is already registered with configuration so start it up again
                injector = self.get_injectors()[injector_type] 
            else:
                injector = self.register_injector(injector_type)
            sio.start_background_task(injector.start)

        @sio.event
        async def disable_injector(sid, injector_type):
            if injector_type in self.get_injectors():
                injector = self.get_injectors()[injector_type]
                await injector.stop()

        @sio.event
        async def injector_state(sid, injector_type):
            injector_state = {}
            if injector_type in self.get_injectors():
                injector = self.get_injectors()[injector_type]
                injector_state = {
                    'commands': [c.name for c in injector.get_commands()],
                    'active': injector.is_active()
                }
            await sio.emit('injector_state', injector_state, to=sid)
