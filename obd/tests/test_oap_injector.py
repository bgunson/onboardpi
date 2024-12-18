
from src.injector_service import InjectorService


def test_oap_api_port(injector_service: InjectorService):
    oap_injector = injector_service.register_injector('oap')
    assert oap_injector._oap_api_port == 44405

def test_get_commands(injector_service: InjectorService):
    oap_injector = injector_service.register_injector('oap')
    oap_cmds = oap_injector.get_commands()
    assert len(oap_cmds) == 6
    assert oap_cmds[0].name == 'ENGINE_LOAD'
    assert oap_cmds[1].name == 'COOLANT_TEMP'
    assert oap_cmds[2].name == 'FUEL_PRESSURE'
    assert oap_cmds[3].name == 'INTAKE_PRESSURE'
    assert oap_cmds[4].name == 'RPM'
    assert oap_cmds[5].name == 'ELM_VOLTAGE'