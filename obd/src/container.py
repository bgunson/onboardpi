import socketio
from dependency_injector import containers, providers
import obdio

from .configuration_service import ConfigurationService
from .obd_service import OBDService
from .injector_service import InjectorService


def create_async_server() -> socketio.AsyncServer:
    """
    Factory function to create and return an instance of socketio.AsyncServer.
    """
    return socketio.AsyncServer(
        cors_allowed_origins='*',
        json=obdio,
        async_mode='asgi'
    )


class Container(containers.DeclarativeContainer):
    
    sio_server = providers.Singleton(create_async_server)

    config_service = providers.Singleton(ConfigurationService, sio_server)

    obd_service = providers.Singleton(OBDService, sio_server, config_service)

    injector_service = providers.Singleton(InjectorService, sio_server, config_service, obd_service)

