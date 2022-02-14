import os
import json

SETTINGS_PATH = os.environ.get('SETTINGS_DIR', os.getcwd()) + '/settings.json'

class Configure():

    @staticmethod
    def get_params():
        if os.path.isfile(SETTINGS_PATH):
            file = open(SETTINGS_PATH)
            data = json.load(file)
            if data['connection']['auto'] == False:
                return data['connection']['parameters']
        return {}

    @staticmethod
    def get_log_level():
        if not os.path.isfile(SETTINGS_PATH):
            return 'INFO'
        else:
            file = open(SETTINGS_PATH)
            data = json.load(file)
            return data['connection']['log_level']