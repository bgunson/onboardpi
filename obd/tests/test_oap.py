from oap import OAPInjector

oap_injector = OAPInjector()

def test_get_oap_cmds():
    oap_cmds = oap_injector.commands
    assert len(oap_cmds) == 5
    assert oap_cmds[0].name == 'ENGINE_LOAD'
    assert oap_cmds[1].name == 'COOLANT_TEMP'
    assert oap_cmds[2].name == 'FUEL_PRESSURE'
    assert oap_cmds[3].name == 'INTAKE_PRESSURE'
    assert oap_cmds[4].name == 'RPM'