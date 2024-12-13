from src.injector_service import InjectorService

def test_get_injectors(injector_service: InjectorService):
    injectors = injector_service.get_injectors()
    for _, i in injectors.items():
        # make sure each injector is properly implement Injector
        assert hasattr(i, "start")
        assert hasattr(i, "stop")
        assert hasattr(i, "get_commands")
        assert hasattr(i, "status")
        assert hasattr(i, "inject")
