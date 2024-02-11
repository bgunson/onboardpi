
def test_get_injectors(container):
    config = container.injector_service()
    injectors = config.get_injectors()
    for _, i in injectors.items():
        # make sure each injector is properly implement Injector
        assert hasattr(i, "start")
        assert hasattr(i, "stop")
        assert hasattr(i, "get_commands")
        assert hasattr(i, "status")
        assert hasattr(i, "inject")
