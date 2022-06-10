from obpi import *
import obd

def test_connection_params():
    params = connection_params()
    assert params['delay_cmds'] == 0.1

def test_log_level():
    _ = connection_params()
    print(obd.logger.getEffectiveLevel())
    assert obd.logger.getEffectiveLevel() == logging.INFO
