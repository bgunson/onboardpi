import obdio
import socketio
import threading
import uvicorn
from src import Configuration, API
import time

sio = socketio.AsyncServer(cors_allowed_origins='*', json=obdio, async_mode='asgi')

static_files = {
            '/view/obd.log': {'filename': 'obd.log', 'content_type': 'text/plain'},
            '/download/obd.log': 'obd.log',
            '/view/oap.log': {'filename': 'oap.log', 'content_type': 'text/plain'},
            '/download/oap.log': 'oap.log'
        }


async def on_startup():
    _ = Configuration()
    api = API(sio)
    api.mount()

def main():
    app = socketio.ASGIApp(sio, static_files=static_files, on_startup=on_startup)
    uvicorn.run(app, host='0.0.0.0', port=60000)


if __name__ == '__main__':
    main()