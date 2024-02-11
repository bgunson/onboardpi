import sys
from datetime import datetime

import socketio
import uvicorn
from dependency_injector.wiring import Provide, inject

from src.configuration_service import ConfigurationService
from src.obd_service import OBDService
from src.injector_service import InjectorService
from src.ioc_container import Container

static_files = {
    '/view/obd.log': {'filename': 'obd.log', 'content_type': 'text/plain'},
    '/download/obd.log': 'obd.log',
    '/view/oap.log': {'filename': 'oap.log', 'content_type': 'text/plain'},
    '/download/oap.log': 'oap.log'
}

def on_startup():
    print("========== OnBoardPi OBD Server Startup - {} ===========".format(
        datetime.now().strftime("%m/%d/%Y, %H:%M:%S")))
    # API(sio).mount()


def on_shutdown():
    # config.obd_io.close()
    print("========== OnBoardPi OBD Server Shutdown - {} ===========".format(
        datetime.now().strftime("%m/%d/%Y, %H:%M:%S")))

@inject
def main(
    config_service: ConfigurationService = Provide[Container.config_service],
    obd_serivice: OBDService = Provide[Container.obd_service],
    injector_service: InjectorService = Provide[Container.injector_service],
    sio: socketio.AsyncServer = Provide[Container.sio_server]):

    app = socketio.ASGIApp(sio, static_files=static_files, on_startup=on_startup, on_shutdown=on_shutdown)
    uvicorn.run(app, host='0.0.0.0', port=60000, log_level="info")

if __name__ == "__main__":
    container = Container()

    container.init_resources()
    container.wire(modules=[__name__])

    main(*sys.argv[1:])