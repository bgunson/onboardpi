import pytest

from src.injector_service import InjectorService
from src.obd_service import OBDService
from src.configuration_service import ConfigurationService
from src.container import Container


@pytest.fixture(scope='session')
def container():
    return Container()

@pytest.fixture
def config_service(container):
    return container.get(ConfigurationService)

@pytest.fixture
def obd_service(container):
    return container.get(OBDService)

@pytest.fixture
def injector_service(container):
    return container.get(InjectorService)