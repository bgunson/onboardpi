import threading
import socketio
import logging
import time

logger = logging.getLogger('oap')

class Notifications(threading.Thread):

    def __init__(self, oap_client):
        super().__init__(daemon=True)
        self.oap_client = oap_client


    def run(self):
        sio = socketio.Client()

        @sio.event
        def connect():
            logger.info("OAP notifications socket connected successfully")
            sio.emit("join_notifications")      # on connect join notifications room
            # the sio client can try initiate the obd connection to the car
            sio.emit("connect_obd")


        @sio.event
        def disconnect():
            logger.warning("OAP notifications socket disconnected")

        @sio.event 
        def injector_enabled(injector_type):
            """When user toggles oap injector to on while server is running. If car is not already connected we can try to connect so the oap injection OBD response can take place.

            Args:
                injector_type (str): Only interested if the type is 'oap'
            """
            if injector_type == 'oap':
                sio.emit("get_obd_connection_status")
                # the sio client can try initiate the obd connection to the car on behalf of oap client
                sio.emit("connect_obd")

        @sio.event
        def obd_connection_status(message):
            # get the current event handler
            event_handler = self.oap_client.get_event_handler()
            event_handler.show_notification(message['status'])

        while not sio.connected:
            time.sleep(1)
            try: 
                logger.info("OAP event handler attempting to connect to notifications socket")
                sio.connect("http://localhost:60000", transports=['websocket'])
                sio.wait()
            except socketio.exceptions.ConnectionError:
                logger.error("OAP event handler could not connect to the notifications socket, perhaps the server is not up yet")



        