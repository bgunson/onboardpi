from src.injectors import OAPInjector
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
    assert params['baudrate'] == 115200
    assert params['delay_cmds'] == 0.1

def test_log_level():
    _ = config.connection_params()
    print(obd.logger.getEffectiveLevel())
    assert obd.logger.getEffectiveLevel() == logging.INFO

def test_get_injectors():
    injectors = config.get_injectors()
    assert len(injectors) == 1
    assert isinstance(injectors[0], OAPInjector)
