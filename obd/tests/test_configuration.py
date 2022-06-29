from src.oap_injector import OAPInjector
from src import Configuration
import obd
import os
import json

config = Configuration()

SETTINGS_PATH = os.path.join(os.environ.get("SETTINGS_DIR", os.getcwd()), "settings.json")
settings = {}
with open(SETTINGS_PATH, mode='r') as settings_file:
    settings = json.load(settings_file)


def test_is_singleton():
    config2 = Configuration()
    assert config is config2

def test_connection_params():
    params = config.connection_params()
    assert params['portstr'] == settings['connection']['parameters']['portstr']
    assert params['delay_cmds'] == settings['connection']['parameters']['delay_cmds'] / 1000

def test_log_level():
    assert obd.logger.getEffectiveLevel() == config.loggers['obd'].getEffectiveLevel()

def test_get_injectors():
    injectors = config.get_injectors()
    for _, i in injectors.items():
        # make sure each injector is properly implement Injector
        assert hasattr(i, "enabled")
        assert hasattr(i, "start")
        assert hasattr(i, "stop")
        assert hasattr(i, "get_commands")
        assert hasattr(i, "status")
        assert hasattr(i, "inject")
