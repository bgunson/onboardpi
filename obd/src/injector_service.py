import uuid

import obd

from .injector_base import InjectorBase
from .logger import register_logger
from .oap_injector import OAPInjector
from .obd_service import OBDService
from .configuration_service import ConfigurationService

injector_map = {
    'oap': OAPInjector
}

class InjectorService():

    def __init__(self, sio, config, obd):
        self.__register_events(sio)
        self.logger = register_logger(__name__)
        """ Init injectors defined in the settings file which are enabled """
        self.config: ConfigurationService = config
        self.obd: OBDService = obd
        self.__injectors = {}
        self.logger.info("Initializing OnBoardPi data injectors")
        if not 'injectors' in self.config.settings:
            return
        self.__injector_settings = self.config.settings['injectors']
        for injector_type, injector_config in self.__injector_settings.items():
            # If the injector is to be enabled at startup (enabled == True in settings file) cache it
            if injector_config['enabled'] == True:
                self.register_injector(injector_type)


    def register_injector(self, injector_type):
        """ Create and cache a new injector instance of type. The new injectgor is assumed to be enabled """
        injector_config = self.config.settings['injectors'][injector_type]
        # create a logger for this injector
        logger = self.__register_logger(
            injector_type, injector_config['log_level'])
        # create a new instance of this injector type via the injector map
        injector = injector_map[injector_type](
            logger=logger,
            **injector_config['parameters'])
        # TODO: injector id, un/watch with id sync callback etc.
        injector_id = str(uuid.uuid4())
        # cache the instance with self
        self.__injectors[injector_id] = injector

        return injector_id
    

    def handle_injector_event(self, event, injector: InjectorBase):
        self.obd.stop()
        for cmd in injector.get_commands():
            if cmd is not None and obd.commands.has_name(cmd):
                if event == 'connected' or event == 'watch':
                    self.obd.watch_command(obd.commands[cmd], (injector.inject, None))
                elif event == 'disconnected' or event == 'stop' or event == 'unwatch':
                    self.obd.unwatch_command(obd.commands[cmd], callback=injector.inject)
        self.obd.start()


    def get_injectors(self):
        return self.__injectors
    
    
    def __register_events(self, sio):

        @sio.event
        async def enable_injector(sid, injector_type):
            injector = None
            if injector_type in self.get_injectors():
                injector = self.get_injectors()[injector_type]
                # This injector is already registered with configuration so start it up again
                injector.start()
                self.handle_injector_event('watch', injector)
            else:
                injector = self.register_injector(injector_type)

        @sio.event
        async def disable_injector(sid, injector_type):
            if injector_type in self.get_injectors():
                injector = self.get_injectors()[injector_type]
                self.handle_injector_event('stop', injector)
                injector.stop()

        @sio.event
        async def unwatch_injector(sid, injector_type):
            if injector_type in self.get_injectors():
                injector = self.get_injectors()[injector_type]
                self.handle_injector_event('unwatch', injector)
            

        @sio.event
        async def injector_state(sid, injector_type):
            injector_state = {}
            if injector_type in self.get_injectors():
                injector = self.get_injectors()[injector_type]
                injector_state = injector.status()
            await sio.emit('injector_state', injector_state, room=sid)
