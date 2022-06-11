import os
import json
import obd
import logging

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
        pass

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

    def connection_params(self):
        """ Configure the OBD connection parameters given in settings.json file and set the logger. """
        log_level = 'INFO'      # default to info
        params = {}
        if os.path.isfile(SETTINGS_PATH):
            file = open(SETTINGS_PATH)
            data = json.load(file)
            log_level = data['connection']['log_level']
            if data['connection']['auto'] == False:
                params = data['connection']['parameters']
        # delay is defined whether manual or auto; convert delay from ms to seconds
        params['delay_cmds'] = data['connection']['parameters']['delay_cmds'] / 1000  

        obd.logger.setLevel(log_level)     
        logging.basicConfig(filename='obd.log', filemode='w', level=log_level)
        return params    