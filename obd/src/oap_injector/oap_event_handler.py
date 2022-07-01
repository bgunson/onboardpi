import logging
import threading
import socketio
from . import Api_pb2 as oap_api
import os

logger = logging.getLogger('oap')

class OAPEventHandler:

    def __init__(self, client, active):
        self._client = client
        self._icon_visible = False
        self._active = active
        self.notification_thread = threading.Thread(target=self._wait_for_notifications, daemon=True)
        self.notification_thread.start()
        

    def on_hello_response(self, client, message):
        logger.debug("Received hello response, result: {}, oap version: {}.{}, api version: {}.{}"
                     .format(message.result, message.oap_version.major,
                             message.oap_version.minor, message.api_version.major,
                             message.api_version.minor))

        register_status_icon_request = oap_api.RegisterStatusIconRequest()
        register_status_icon_request.name = "OnBoardPi Status Icon"
        register_status_icon_request.description = "OBD connection status from OnBoardPi"

        with open(os.path.join(os.path.dirname(__file__), "assets/favicon.ico"), 'rb') as icon_file:
            register_status_icon_request.icon = icon_file.read()

        client.send(oap_api.MESSAGE_REGISTER_STATUS_ICON_REQUEST, 0,
                    register_status_icon_request.SerializeToString())

    def on_register_status_icon_response(self, client, message):
        logger.debug("register status icon response, result: {}, icon id: {}".format(message.result, message.id))
        self._icon_id = message.id

        if message.result == oap_api.RegisterStatusIconResponse.REGISTER_STATUS_ICON_RESULT_OK:
            logger.debug("icon successfully registered")
            self.toggle_icon_visibility(client)

    def toggle_icon_visibility(self, client):
        self._icon_visible = not self._icon_visible

        change_status_icon_state = oap_api.ChangeStatusIconState()
        change_status_icon_state.id = self._icon_id
        change_status_icon_state.visible = self._icon_visible
        client.send(oap_api.MESSAGE_CHANGE_STATUS_ICON_STATE, 0,
                    change_status_icon_state.SerializeToString())


    def _wait_for_notifications(self):

        self._active.wait()

        sio = socketio.Client()

        @sio.event
        def connect():
            sio.emit("join_notifications")

        @sio.event
        def obd_connection_status(message):
            print(message)

        while not sio.connected:
            try:
                sio.connect("http://localhost:60000", transports=['websocket'])
            except Exception:
                pass

        while self._active.is_set():
            continue

        sio.emit("leave_notifications")
        sio.disconnect()



    