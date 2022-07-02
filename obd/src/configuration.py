import threading
import os
import logging
import json
import obd
from .oap_injector import OAPInjector

SETTINGS_PATH = os.path.join(os.environ.get(
    "SETTINGS_DIR", os.getcwd()), "settings.json")

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

        # register python-obd logger with onboardpi
        self.__register_logger(
            obd.__name__, self.__settings['connection']['log_level'])

        # Create dict to store injectors and init them
        self.__injectors = {}
        self.__init_injectors()

    def __init__(self):
        pass

    def connect_obd(self):
        """ Steps to connect to vehicle and any other local operations which are needed after successful/unsuccessful connection. Try twice times to fully connect to vehicle """
        if self.obd_io is not None and self.obd_io.is_connected():
            self.logger.info("OBD is already connected")
            return 

        self.logger.info("Connecting to OBD interface")
        params = self.connection_params()
        attempts = 0
        connected = False
        while not connected and attempts < 2:
            # self.obd_io.connect_obd(**params) # Blocks server which is ok since no socketio handlers should respond unless there is some sort of connection
            self.obd_io = obd.Async(**params)
            connected = self.obd_io.is_connected()
            attempts += 1

        if connected:
            for injector in self.__injectors.values():
                self.watch_injector_cmds(injector)

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
            callback=self.handle_injector_event,
            **injector_config['parameters'])
        # cache the instance with self
        self.__injectors[injector_type] = injector

        # self.watch_injector_cmds(injector)

        return injector

    def handle_injector_event(self, event, injector):
        if event == 'connected' or event == 'watch':
            self.obd_io.stop()
            for cmd in injector.get_commands():
                if cmd is not None:
                    # watch the command and subscribe callback to inject, python-OBD handles multiple command callbacks
                    self.obd_io.watch(
                        obd.commands[cmd], injector.inject, self.force_cmds)
            self.obd_io.start()
        elif event == 'disconnected' or event == 'stop':
            self.obd_io.stop()
            for cmd in injector.get_commands():
                if cmd is not None:
                    self.obd_io.unwatch(obd.commands[cmd])
            self.obd_io.start()

    def watch_injector_cmds(self, injector):
        """ Used as a callback when an injector indicates it is ready and when other socketio clients unwatch commands this method will make sure injector commands are not forgotten """
        self.obd_io.stop()
        for cmd in injector.get_commands():
            if cmd is not None:
                # watch the command and subscribe callback to inject, python-OBD handles multiple command callbacks
                self.obd_io.watch(
                    obd.commands[cmd], injector.inject, self.force_cmds)
        self.obd_io.start()

    def on_unwatch_event(self):
        """ When a socketio client unwatches some commands we need to rewatch and re-register the injector commands and callback"""
        for _, injector in self.__injectors.items():
            if injector.is_enabled():
                self.handle_injector_event('watch', injector)

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
            with open(SETTINGS_PATH, mode='r') as settings_file:
                self.__settings = json.load(settings_file)
        except FileNotFoundError:
            self.__settings = {}
