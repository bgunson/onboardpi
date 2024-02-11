import socketio
from dependency_injector import containers, providers
import obdio

from .configuration_service import ConfigurationService
from .obd_service import OBDService
from .injector_service import InjectorService

class Container(containers.DeclarativeContainer):
    
    sio_server = providers.Object(socketio.AsyncServer(cors_allowed_origins='*', json=obdio, async_mode='asgi'))

    config_service = providers.Singleton(ConfigurationService, sio_server)

    obd_service = providers.Singleton(OBDService, sio_server, config_service)

    injector_service = providers.Singleton(InjectorService, sio_server, config_service, obd_service)

