import os
import json
import obd
import logging

from injectors import *

SETTINGS_PATH = os.environ.get('SETTINGS_DIR', os.getcwd()) + '/settings.json'

class Singleton(object):
        def __new__(cls, *args, **kwds):
            it = cls.__dict__.get("__it__")
            if it is not None:
                return it
            cls.__it__ = it = object.__new__(cls)
            it.init(*args, **kwds)
            return it
        def init(self, *args, **kwds):
            pass

class Configuration(Singleton):

    def init(self):
        print("Initializing configuration")
        self.__read_settings()
        self.__init_injectors()

    def __init__(self):
        pass

    def set_socket(self, socket):
        self.socket = socket

    def get_socket(self):
        return self.socket

    def set_obd_connection(self, obd_io):
        self.obd_io = obd_io

    def get_obd_connection(self):
        return self.obd_io

    def __init_injectors(self):
        self.__injectors = []
        for injector in self.__settings['injectors']:
            if injector['type'] == 'oap':
                oap = OAPInjector()
                self.__injectors.append(oap)
                if injector['enabled'] == True:
                    oap.start()

    def get_injectors(self):
        return self.__injectors

    def connection_params(self):
        """ Configure the OBD connection parameters given in settings.json file and set the logger. """
        log_level = 'INFO'      # default to info
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
        params['delay_cmds'] = self.__settings['connection']['parameters']['delay_cmds'] / 1000

        # Let's also set up the logger here. This method is only called prior to obd connection
        # so we get a fresh log file each time  
        obd.logger.setLevel(log_level)     
        logging.basicConfig(filename='obd.log', filemode='w', level=log_level)
        
        return params

    def __read_settings(self):
        """ Try to open and parse the settings json file store it in memory """
        try:
            settings_file = open(SETTINGS_PATH)
            self.__settings = json.load(settings_file)
        except FileNotFoundException:
            self.__settings = {}
        