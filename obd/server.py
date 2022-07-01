import obdio
import socketio
import threading
import uvicorn
from src import Configuration, API
import time

config = None
sio = socketio.AsyncServer(cors_allowed_origins='*', json=obdio, async_mode='asgi')

static_files = {
            '/view/obd.log': {'filename': 'obd.log', 'content_type': 'text/plain'},
            '/download/obd.log': 'obd.log',
            '/view/oap.log': {'filename': 'oap.log', 'content_type': 'text/plain'},
            '/download/oap.log': 'oap.log'
        }


def wait_for_server():
    ping_client = socketio.Client()
    ping_client.connect("http://localhost:60000", transports=['websocket'])
    


    config = Configuration()
    config.set_socket(sio)
    api = API(sio)
    api.mount()
    config.init_obd_connection()

async def on_startup():
    threading.Thread(target=wait_for_server, daemon=True).start()

def main():
    app = socketio.ASGIApp(sio, static_files=static_files, on_startup=on_startup)
    uvicorn.run(app, host='0.0.0.0', port=60000)


if __name__ == '__main__':
    main()