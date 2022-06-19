import obd
import logging
import obdio
from src import Configuration, API

class OBDServer():

    def __init__(self):
        self.config = Configuration()
        self.io = obdio.OBDio()
        # Attempt to connect to the vehicle
        params = self.config.connection_params()
        self.io.connect_obd(**params)
        self.config.set_obd_connection(self.io)

        sio = self.io.create_server(cors_allowed_origins='*', json=obdio)

        obd_logger_handler = logging.FileHandler("obd.log", mode='w')
        obd_logger_handler.setFormatter(logging.Formatter("%(asctime)s %(message)s"))
        obd.logger.addHandler(obd_logger_handler)

        api = API(sio)
        api.mount()

    def start(self):
        """ This starts the socketio asgi server """
        self.io.serve_static({
            '/view/obd.log': {'filename': 'obd.log', 'content_type': 'text/plain'},
            '/download/obd.log': 'obd.log',
            '/view/oap.log': {'filename': 'oap.log', 'content_type': 'text/plain'},
            '/download/oap.log': 'oap.log'
        })
        self.io.run_server(host='0.0.0.0', port=60000, log_level='critical')


if __name__ == '__main__':
    server = OBDServer()
    server.start()
