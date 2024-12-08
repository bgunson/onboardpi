import pytest
import os
from obd.src.container import Container

@pytest.fixture(scope="session")
def container():
    # Initialize the container
    container = Container()
    container.init_resources()
    # Wire the container to the test modules if necessary
    container.wire(modules=["tests"])
    return container

# test evn vars set here
os.environ['SETTINGS_DIR'] = os.getcwd() + "/tests/test_configs"
os.environ['OAP_CONFIG_DIR'] = os.getcwd() + "/tests/test_configs"