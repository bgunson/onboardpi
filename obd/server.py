import obdio
import socketio
import uvicorn
from src import Configuration, API

config = None
sio = socketio.AsyncServer(cors_allowed_origins='*', json=obdio, async_mode='asgi')

static_files = {
            '/view/obd.log': {'filename': 'obd.log', 'content_type': 'text/plain'},
            '/download/obd.log': 'obd.log',
            '/view/oap.log': {'filename': 'oap.log', 'content_type': 'text/plain'},
            '/download/oap.log': 'oap.log'
        }


def on_shutdown():
    obd_io = config.get_obd_io()
    obd_io.close()


async def on_startup():
    config = Configuration()
    config.set_socket(sio)
    api = API(sio)
    api.mount()
    await sio.start_background_task(config.init_obd_connection)
    # await config.init_obd_connection()    # a blocking call may be more suitable


def main():
    app = socketio.ASGIApp(sio, static_files=static_files, on_startup=on_startup, on_shutdown=on_shutdown)
    uvicorn.run(app, host='0.0.0.0', port=60000)


if __name__ == '__main__':
    main()