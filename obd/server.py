import obdio
import socketio
import uvicorn
from datetime import datetime
from src import Configuration, API

sio = socketio.AsyncServer(cors_allowed_origins='*',
                           json=obdio, async_mode='asgi')
config = Configuration()

static_files = {
    '/view/obd.log': {'filename': 'obd.log', 'content_type': 'text/plain'},
    '/download/obd.log': 'obd.log',
    '/view/oap.log': {'filename': 'oap.log', 'content_type': 'text/plain'},
    '/download/oap.log': 'oap.log'
}


def on_startup():
    print("========== OnBoardPi OBD Server Startup - {} ===========".format(
        datetime.now().strftime("%m/%d/%Y, %H:%M:%S")))
    api = API(sio)
    api.mount()


def on_shutdown():
    config.obd_io.close()
    print("========== OnBoardPi OBD Server Shutdown - {} ===========".format(
        datetime.now().strftime("%m/%d/%Y, %H:%M:%S")))


def main():
    app = socketio.ASGIApp(sio, static_files=static_files,
                           on_startup=on_startup, on_shutdown=on_shutdown)
    uvicorn.run(app, host='0.0.0.0', port=60000)


if __name__ == '__main__':
    main()
