import logging
import os
import json


SETTINGS_PATH = os.path.join(os.environ.get("SETTINGS_DIR", os.getcwd()), "settings.json")
settings = {}
with open(SETTINGS_PATH, mode='r') as settings_file:
    settings = json.load(settings_file)


def test_is_singleton(container):
    config1 = container.config_service()
    config2 = container.config_service()
    assert config1 is config2


def test_logger_level_is_set(container):
    config = container.config_service()
    assert config.logger.getEffectiveLevel() == logging.INFO
    

def test_connection_params(container):
    config = container.config_service()
    params = config.load_connection_params()
    assert params['portstr'] == settings['connection']['parameters']['portstr']
    assert params['delay_cmds'] == settings['connection']['parameters']['delay_cmds'] / 1000
