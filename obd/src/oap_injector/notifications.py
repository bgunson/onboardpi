import threading
import socketio
import logging
import time

logger = logging.getLogger('oap')

class Notifications(threading.Thread):

    def __init__(self, event_handler):
        super().__init__(daemon=True)
        self.event_handler = event_handler
        self._first_connection = threading.Event()


    def run(self):
        sio = socketio.Client()

        @sio.event
        def connect():
            logger.info("OAP event handler notifications socket connected successfully")
            sio.emit("join_notifications")      # on connect join notifications room
            if not self._first_connection.is_set():
                # the sio client can try initiate the obd connection to the car
                sio.emit("connect_obd")
                self._first_connection.set()


        @sio.event
        def obd_connection_status(message):
            self.event_handler.show_notification(message['status'])

        while not sio.connected:
            time.sleep(1)
            try: 
                logger.info("OAP event handler attempting to connect to notifications socket")
                sio.connect("http://localhost:60000", transports=['websocket'])
            except socketio.exceptions.ConnectionError:
                logger.error("OAP event handler could not connect to the notifications socket, perhaps the server is not up yet")


        while self.event_handler.is_alive():
            time.sleep(1)
        
        logger.info("notifications disconnecting")
        sio.disconnect()


        