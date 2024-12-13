import sys
from datetime import datetime

import socketio
import uvicorn

from src.obd_service import OBDService
from src.injector_service import InjectorService
from src.container import inject

static_files = {
    '/view/obd.log': {'filename': 'obd.log', 'content_type': 'text/plain'},
    '/download/obd.log': 'obd.log',
    '/view/oap.log': {'filename': 'oap.log', 'content_type': 'text/plain'},
    '/download/oap.log': 'oap.log'
}


@inject
async def on_startup(injector_service: InjectorService):
    print(f'========== OnBoardPi OBD Server Startup - {datetime.now().strftime("%m/%d/%Y, %H:%M:%S")} ===========')
    await injector_service.startup()


@inject
async def on_shutdown(sio_server: socketio.AsyncServer, obd_service: OBDService, injector_service: InjectorService):
    await injector_service.shutdown()
    await obd_service.shutdown()
    await sio_server.shutdown()
    print(f'========== OnBoardPi OBD Server Shutdown - {datetime.now().strftime("%m/%d/%Y, %H:%M:%S")} ===========')


@inject
def main(sio_server: socketio.AsyncServer):
    app = socketio.ASGIApp(sio_server, static_files=static_files, on_startup=on_startup, on_shutdown=on_shutdown)
    uvicorn.run(app, host='0.0.0.0', port=60000, log_level="info")

if __name__ == "__main__":
    main()