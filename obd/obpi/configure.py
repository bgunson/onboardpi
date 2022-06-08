import os
import json

SETTINGS_PATH = os.environ.get('SETTINGS_DIR', os.getcwd()) + '/settings.json'

def get_params():
    if os.path.isfile(SETTINGS_PATH):
        file = open(SETTINGS_PATH)
        data = json.load(file)
        data['connection']['parameters']['delay_cmds'] = data['connection']['parameters']['delay_cmds'] / 1000  # convert delay from ms to seconds
        if data['connection']['auto'] == False:
            return data['connection']['parameters']
    return {
        'delay_cmds': data['connection']['parameters']['delay_cmds']    # only send delay
    }

def get_log_level():
    if not os.path.isfile(SETTINGS_PATH):
        return 'INFO'
    else:
        file = open(SETTINGS_PATH)
        data = json.load(file)
        return data['connection']['log_level']