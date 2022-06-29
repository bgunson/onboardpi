import os
import logging
import json
import obd
from .oap_injector import OAPInjector

SETTINGS_PATH = os.path.join(os.environ.get("SETTINGS_DIR", os.getcwd()), "settings.json")

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
        self.__injectors = {}
        self.__read_settings()
        self.loggers = {}
        self.__register_logger(obd.__name__, self.__settings['connection']['log_level'])

    def __init__(self):
        pass

    def init_obd_connection(self):
        """ Steps to connect to vehicle and any other local operations which are needed after successful/unsuccessful connection """
        params = self.connection_params()
        self.obd_io.connect_obd(**params)
        if self.obd_io.connection.is_connected():
            self.init_injectors()   

    def set_obd_connection(self, obd_io):
        self.obd_io = obd_io 

    def get_obd_connection(self):
        return self.obd_io

    def init_injectors(self):
        """ Init injectors defined in the settings file, start those that are labeled enabled in the settings file """
        if not 'injectors' in self.__settings:
            return
        self.__injector_settings = self.__settings['injectors']
        for injector_type, injector_config in self.__injector_settings.items():
            if injector_config['enabled'] == True:
                self.enable_injector(injector_type)

    def enable_injector(self, injector_type):
        """ Enable a particular injector by calling it's start method. If this injector type is not already known to the configuration, create and store it. """
        if injector_type in self.__injectors:
            # This injector is already registered with configuration so start it up again
            self.__injectors[injector_type].enabled = True
            self.__injectors[injector_type].start()
            return

        # This injector is being enabled for the first time this session, create a new one
        injector_settings = self.__settings['injectors'][injector_type]
        logger = self.__register_logger(injector_type, injector_settings['log_level'])
        i = injector_map[injector_type](logger=logger, connect_callback=self._watch_injector_cmds,**injector_settings['parameters'])
        self.__injectors[injector_type] = i
        i.start()

    def _watch_injector_cmds(self, injector):
        """ Used as a callback when an injector indicates it is ready and when other socketio clients unwatch commands this method will make sure injector commands are not forgotten """
        self.obd_io.connection.stop()
        for cmd in injector.get_commands():
            if cmd is not None:
                # watch the command and subscribe callback to inject, python-OBD handles multiple command callbacks
                self.obd_io.connection.watch(obd.commands[cmd], injector.inject, self.force_cmds)
        self.obd_io.connection.start()

    def on_unwatch_event(self):
        """ When a socketio client unwatches some commands we need to rewatch and re-register the injector commands and callback"""
        for _, injector in self.__injectors.items():
            if injector.status()['active'] and injector.enabled:
                self._watch_injector_cmds(injector)

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
        self.delay = connection['parameters']['delay_cmds'] / 1000      # convert delay from ms to seconds
        params['delay_cmds'] = self.delay
        
        return params

    def __register_logger(self, name, level=logging.INFO):
        """ Register a modules logger with config so it can be accessed and modified later. Example: log level altered by a socketio client, see self.set_logger_level """
        logger = logging.getLogger(name)
        logger.setLevel(level)
        file_handler = logging.FileHandler("{}.log".format(name), mode='w')
        file_handler.setFormatter(logging.Formatter("%(asctime)s %(message)s"))
        logger.addHandler(file_handler)

        console_handler = logging.StreamHandler()
        console_handler.setFormatter(logging.Formatter("[%(name)s] %(message)s"))
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
        