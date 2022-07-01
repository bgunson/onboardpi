import obdio
import obd
import socketio
import uvicorn
from src import Configuration, API

config = Configuration()
sio = socketio.AsyncServer(cors_allowed_origins='*', json=obdio, async_mode='asgi')

def on_shutdown():
    obd_io = config.get_obd_io()
    obd_io.close()


async def on_startup():
    await sio.start_background_task(config.init_obd_connection)
    # await config.init_obd_connection()    # a blocking call may be better


def main():
    
    # Initiate a pseudo obd connection prior to app startup
    tmp_connection = obd.Async("/dev/null")  
    config.set_obd_io(tmp_connection)

    api = API(sio)
    api.mount()

    app = socketio.ASGIApp(sio, static_files=api.static_files(), on_shutdown=on_shutdown, on_startup=on_startup)
    uvicorn.run(app, host='0.0.0.0', port=60000)


if __name__ == '__main__':
    main()