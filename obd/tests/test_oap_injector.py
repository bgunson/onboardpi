from src.injectors import OAPInjector

oap_injector = OAPInjector()

def test_get_commands():
    oap_cmds = oap_injector.get_commands()
    assert len(oap_cmds) == 5
    assert oap_cmds[0] == 'ENGINE_LOAD'
    assert oap_cmds[1] == 'COOLANT_TEMP'
    assert oap_cmds[2] == 'FUEL_PRESSURE'
    assert oap_cmds[3] == 'INTAKE_PRESSURE'
    assert oap_cmds[4] == 'RPM'