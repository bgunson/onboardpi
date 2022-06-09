from obpi import *

def test_get_log_level():
    assert "ERROR" == get_log_level()

def test_get_params():
    params = get_params()
    assert params['delay_cmds'] == 0.1