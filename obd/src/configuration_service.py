import os
import logging
import json
import obd

from .logger import register_logger

class ConfigurationService():

    def __init__(self, sio):
        self.__register_events(sio)
        self.logger = register_logger(__name__, file_logger=False)
        self.logger.setLevel(logging.INFO)
        self.load_connection_params()


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
            logger = logging.getLogger(logger_name)
            logger.setLevel(level)
