import os
import logging
import json
import obd
from .oap_injector import OAPInjector

obd_logger_handler = logging.FileHandler("obd.log", mode='w')
obd_logger_handler.setFormatter(logging.Formatter("%(asctime)s %(message)s"))
obd.logger.addHandler(obd_logger_handler)

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
        self.__read_settings()

    def __init__(self):
        pass

    def set_obd_connection(self, obd_io):
        self.obd_io = obd_io
        self.__init_injectors()    

    def get_obd_connection(self):
        return self.obd_io

    def __init_injectors(self):
        self.__injectors = []
        if not 'injectors' in self.__settings:
            return

        self.__injector_config = self.__settings['injectors']
        for type, injector in self.__injector_config.items():
            if injector['enabled'] == True:
                i = injector_map[type](injector['parameters'])
                self.__injectors.append(i)
                i.start(self._watch_injector_cmds)

    def _watch_injector_cmds(self, injector):
        for cmd in injector.get_commands():
            if cmd is not None:
                # watch the command and subscribe callback to inject, python-OBD handles multiple command callbacks
                self.obd_io.connection.watch(obd.commands[cmd], injector.inject)
        self.obd_io.connection.start()

    def on_unwatch_event(self):
        """ When a socketio client unwatches some commands we need to rewatch and re-register the injector commands and callback"""
        for injector in self.__injectors:
            if injector.status()['active']:
                self._watch_injector_cmds(injector)

    def get_injectors(self):
        return self.__injectors

    def get_delay(self):
        """ Delay is passed to python-OBD as well as used for delay between watch loop emissions """
        return self.__delay

    def connection_params(self):
        """ Configure the OBD connection parameters given in settings.json file and set the logger. """
        params = {}
        self.__read_settings()

        if not 'connection' in self.__settings:
            # Either we could not read settings file or something else. Return nothing and allow
            # python-OBD to do its thing and connect automatically
            return {}   

        # At this point its safe to assume the settings file exits and is not malformed 
        if self.__settings['connection']['auto'] == False:
                params = self.__settings['connection']['parameters']
        # delay is defined whether manual or auto; convert delay from ms to seconds
        self.__delay = self.__settings['connection']['parameters']['delay_cmds'] / 1000
        params['delay_cmds'] = self.__delay
        
        return params

    def __read_settings(self):
        """ Try to open and parse the settings json file store it in memory """
        try:
            with open(SETTINGS_PATH, mode='r') as settings_file:
                self.__settings = json.load(settings_file)
                obd.logger.setLevel(self.__settings['connection']['log_level'])             
        except FileNotFoundError:
            self.__settings = {}
        