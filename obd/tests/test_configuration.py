from src.oap_injector import OAPInjector
from src import Configuration
import obd
import logging

config = Configuration()

def test_is_singleton():
    config2 = Configuration()
    assert config is config2

def test_connection_params():
    params = config.connection_params()
    assert params['portstr'] == "/dev/pts/9"
    assert params['delay_cmds'] == 0.1

def test_log_level():
    _ = config.connection_params()
    assert obd.logger.getEffectiveLevel() == logging.WARNING

def test_get_injectors():
    injectors = config.get_injectors()
    for _, i in injectors.items():
        # make sure each injector is properly implement Injector
        assert hasattr(i, "start")
        assert hasattr(i, "stop")
        assert hasattr(i, "get_commands")
        assert hasattr(i, "status")
        assert hasattr(i, "inject")
