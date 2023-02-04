import os
import logging
import json
import obd
import obdio
import socketio
from .oap_injector import OAPInjector


injector_map = {
    'oap': OAPInjector
}


class Configuration:

    def __new__(cls, *args, **kwds):
        """ Makes config singleton """
        it = cls.__dict__.get("__it__")
        if it is not None:
            return it
        cls.__it__ = it = object.__new__(cls)
        it.init(*args, **kwds)
        return it

    def init(self):
        # Create dict for our loggers
        self.loggers = {}
        self.logger = self.__register_logger(__name__, logging.INFO)
        self.logger.info("Initializing OnBoardPi configuration")

        _ = self.connection_params()
        # create a temporary psuedo connection to some non-existent descriptor so the api endpoint can reference something for self.obd_io
        self.obd_io = obd.Async("TEMP")
        self.sio = socketio.AsyncServer(cors_allowed_origins='*', json=obdio, async_mode='asgi')

        # register python-obd logger with onboardpi
        self.__register_logger(
            obd.__name__, self.__settings['connection']['log_level'])

        # Create dict to store injectors and init them
        self.__injectors = {}
        self.__init_injectors()

    def __init__(self):
        pass

    def connect_obd(self):
        """ Blocks for min two attempts vs connect_obd_async which will sleep before each attempt which may be problematic and cause race conditions on the serial port and obd server in general, this may be the safer approach. 
        """
        if self.obd_io is not None and self.obd_io.is_connected():
            self.logger.info("OBD is already connected")
        else:
            self.logger.info("Connecting to OBD interface")
            params = self.connection_params()
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
            params = self.connection_params()
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

    def get_obd_io(self):
        """ return the python-obd connection """
        return self.obd_io

    def __init_injectors(self):
        """ Init injectors defined in the settings file which are enabled """
        self.logger.info("Initializing OnBoardPi data injectors")
        if not 'injectors' in self.__settings:
            return
        self.__injector_settings = self.__settings['injectors']
        for injector_type, injector_config in self.__injector_settings.items():
            # If the injector is to be enabled at startup (enabled == True in settings file) cache it
            if injector_config['enabled'] == True:
                self.register_injector(injector_type)

    def register_injector(self, injector_type):
        """ Create and cache a new injector instance of type. The new injectgor is assumed to be enabled """
        injector_config = self.__settings['injectors'][injector_type]
        # create a logger for this injector
        logger = self.__register_logger(
            injector_type, injector_config['log_level'])
        # create a new instance of this injector type via the injector map
        injector = injector_map[injector_type](
            logger=logger,
            **injector_config['parameters'])
        # cache the instance with self
        self.__injectors[injector_type] = injector

        return injector

    def handle_injector_event(self, event, injector):
        self.obd_io.stop()
        for cmd in injector.get_commands():
            if cmd is not None and obd.commands.has_name(cmd):
                if event == 'connected' or event == 'watch':
                    self.obd_io.watch(obd.commands[cmd], callback=injector.inject)
                elif event == 'disconnected' or event == 'stop' or event == 'unwatch':
                    self.obd_io.unwatch(obd.commands[cmd], callback=injector.inject)
        self.obd_io.start()

    def get_injectors(self):
        return self.__injectors

    def connection_params(self):
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

    def __register_logger(self, name, level=logging.INFO):
        """ Register a modules logger with config so it can be accessed and modified later. Example: log level altered by a socketio client, see self.set_logger_level """
        logger = logging.getLogger(name)

        # remove existing handlers from external modules to use our own
        for handler in logger.handlers:
            logger.removeHandler(handler)

        logger.setLevel(level)
        file_handler = logging.FileHandler("{}.log".format(name), mode='w')
        file_handler.setFormatter(logging.Formatter("%(asctime)s %(message)s"))
        logger.addHandler(file_handler)

        console_handler = logging.StreamHandler()
        console_handler.setFormatter(
            logging.Formatter("[%(name)s] %(message)s"))
        logger.addHandler(console_handler)

        self.loggers[name] = logger
        return logger

    def set_logger_level(self, name, level):
        if name in self.loggers:
            logger = self.loggers[name]
            logger.setLevel(level)

    def __read_settings(self):
        """ Try to open and parse the settings json file store it in memory """
        try:
            settings_path = os.path.join(os.environ.get("SETTINGS_DIR", os.getcwd()), "settings.json")
            with open(settings_path, mode='r') as settings_file:
                self.__settings = json.load(settings_file)
        except FileNotFoundError:
            self.__settings = {}
