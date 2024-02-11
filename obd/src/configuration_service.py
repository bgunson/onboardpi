import os
import logging
import json
import obd

from .logger import register_logger

class ConfigurationService():

    def __init__(self, sio):
        self.__register_events(sio)
        self.logger = register_logger(__name__)
        self.logger.setLevel(logging.INFO)
        self.load_connection_params()



    def connect_obd(self, portstr=None):
        """ Blocks for min two attempts vs connect_obd_async which will sleep before each attempt which may be problematic and cause race conditions on the serial port and obd server in general, this may be the safer approach. 
        """
        if self.obd_io is not None and self.obd_io.is_connected():
            self.logger.info("OBD is already connected")
        else:
            if portstr is None:
                params = self.load_connection_params()
            else:
                params = { 'portstr': portstr }
            self.logger.info("Connecting to OBD interface")
            self.logger.info(params)
            attempts = 0
            connected = False
            while not connected and attempts < 2:
                self.obd_io = obd.Async(**params)
                connected = self.obd_io.is_connected()
                attempts += 1

        for injector in self.__injectors.values():
            if injector.is_active():
                self.handle_injector_event('watch', injector)
        

    async def connect_obd_async(self, sio):
        """ Steps to connect to vehicle and any other local operations which are needed after successful/unsuccessful connection. Try two times to fully connect to vehicle """
        if self.obd_io is not None and self.obd_io.is_connected():
            self.logger.info("OBD is already connected")
        else:
            self.logger.info("Connecting to OBD interface")
            params = self.load_connection_params()
            attempts = 0
            connected = False
            while not connected and attempts < 2:
                await sio.sleep(attempts)
                self.obd_io = obd.Async(**params)
                connected = self.obd_io.is_connected()
                attempts += 1

        for injector in self.__injectors.values():
            if injector.is_active():
                self.handle_injector_event('watch', injector)


    def load_connection_params(self):
        """ Configure the OBD connection parameters given in settings.json file and set the logger. """
        params = {}
        self.__read_settings()

        if not 'connection' in self.__settings:
            # Either we could not read settings file or something else. Return nothing and allow
            # python-OBD to do its thing and connect automatically
            return {}

        connection = self.__settings['connection']
        if 'force_cmds' in connection:
            self.force_cmds = connection['force_cmds']
        else:
            self.force_cmds = False

        params = connection['parameters']
        # convert delay from ms to seconds
        self.delay = connection['parameters']['delay_cmds'] / 1000
        params['delay_cmds'] = self.delay

        return params

    @property
    def use_imperial_units(self):
        return bool(self.__settings.get('imperial_units'))

    @property
    def settings(self):
        return self.__settings

    def __read_settings(self):
        """ Try to open and parse the settings json file store it in memory """
        try:
            settings_path = os.path.join(os.environ.get("SETTINGS_DIR", os.getcwd()), "settings.json")
            with open(settings_path, mode='r') as settings_file:
                self.__settings = json.load(settings_file)
        except FileNotFoundError:
            self.__settings = {}


    def __register_events(self, sio):
        
        @sio.event
        async def set_logger_level(sid, logger_name, level):
            # self.set_logger_level(logger_name, level)
            pass

