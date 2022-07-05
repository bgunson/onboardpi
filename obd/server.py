import obdio
import socketio
import uvicorn
from datetime import datetime
from src import Configuration, API

sio = socketio.AsyncServer(cors_allowed_origins='*', json=obdio, async_mode='asgi')

static_files = {
            '/view/obd.log': {'filename': 'obd.log', 'content_type': 'text/plain'},
            '/download/obd.log': 'obd.log',
            '/view/oap.log': {'filename': 'oap.log', 'content_type': 'text/plain'},
            '/download/oap.log': 'oap.log'
        }


app = socketio.ASGIApp(sio, static_files=static_files)
_ = Configuration()
api = API(sio)
api.mount()


if __name__ == '__main__':
    print("========== OnBoardPi OBD Server Startup - {} ===========".format(datetime.now().strftime("%m/%d/%Y, %H:%M:%S")))
    uvicorn.run(app, host='0.0.0.0', port=60000)