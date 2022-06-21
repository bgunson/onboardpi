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

    def set_obd_connection(self, obd_io):
        self.obd_io = obd_io
        self.__init_injectors()    

    def get_obd_connection(self):
        return self.obd_io

    def __init_injectors(self):
        if not 'injectors' in self.__settings:
            return
        self.__injector_config = self.__settings['injectors']
        for injector_type, injector in self.__injector_config.items():
            if injector['enabled'] == True:
                self.enable_injector(injector_type)

    def enable_injector(self, injector_type):
        """ Enable a particular injector by calling it's start method. If this injector type is not already known to the configuration, store it. """
        if injector_type in self.__injectors:
            self.__injectors[injector_type].start(self._watch_injector_cmds)
            return
        injector_settings = self.__settings['injectors'][injector_type]
        logger = self.__register_logger(injector_type, injector_settings['log_level'])
        i = injector_map[injector_type](**injector_settings['parameters'], logger=logger)
        self.__injectors[injector_type] = i
        i.start(self._watch_injector_cmds)

    def _watch_injector_cmds(self, injector):
        for cmd in injector.get_commands():
            if cmd is not None:
                # watch the command and subscribe callback to inject, python-OBD handles multiple command callbacks
                self.obd_io.connection.watch(obd.commands[cmd], injector.inject, self.force_cmds)
        self.obd_io.connection.start()

    def on_unwatch_event(self):
        """ When a socketio client unwatches some commands we need to rewatch and re-register the injector commands and callback"""
        for _, injector in self.__injectors.items():
            if injector.status()['active']:
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
        handler = logging.FileHandler("{}.log".format(name), mode='w')
        handler.setFormatter(logging.Formatter("%(asctime)s %(message)s"))
        logger.addHandler(handler)
        self.loggers[name] = logger
        return logger

    def set_logger_level(self, name, level):
        logger = self.loggers[name]
        logger.setLevel(level)

    def __read_settings(self):
        """ Try to open and parse the settings json file store it in memory """
        try:
            with open(SETTINGS_PATH, mode='r') as settings_file:
                self.__settings = json.load(settings_file)
        except FileNotFoundError:
            self.__settings = {}
        