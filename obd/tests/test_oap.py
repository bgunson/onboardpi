from oap import *

oap_injector = OAPInjector()

def test_test():
    assert 3 == 3

def test_get_oap_cmds():
    oap_cmds = oap_injector.get_oap_cmds()
    assert True