import logging
import threading
import socketio
from . import Api_pb2 as oap_api
import os

logger = logging.getLogger('oap')


class OAPEventHandler:

    def __init__(self, client, enabled, callback):
        self._client = client
        self._icon_visible = False
        self.callback = callback
        self.active = threading.Event()
        self.enabled = enabled

        # self.notification_thread = threading.Thread(
        #     target=self._wait_for_events, daemon=True)
        # self.notification_thread.start()

    def start_listening(self):
        # threading.Thread(target=self._client.wait_for_message, daemon=True).start()
        self.notification_thread = threading.Thread(
            target=self._wait_for_events, args=(self._client, ), daemon=True)
        self.notification_thread.start()

    def on_hello_response(self, client, message):
        logger.debug("Received hello response, result: {}, oap version: {}.{}, api version: {}.{}"
                     .format(message.result, message.oap_version.major,
                             message.oap_version.minor, message.api_version.major,
                             message.api_version.minor))
        self.active.set()

        register_status_icon_request = oap_api.RegisterStatusIconRequest()
        register_status_icon_request.name = "OnBoardPi Status Icon"
        register_status_icon_request.description = "OBD connection status from OnBoardPi"

        with open(os.path.join(os.path.dirname(__file__), "assets/favicon.ico"), 'rb') as icon_file:
            register_status_icon_request.icon = icon_file.read()

        client.send(oap_api.MESSAGE_REGISTER_STATUS_ICON_REQUEST, 0,
                    register_status_icon_request.SerializeToString())

    def on_register_status_icon_response(self, client, message):
        logger.debug("register status icon response, result: {}, icon id: {}".format(
            message.result, message.id))
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

    def _wait_for_events(self, oap_client):

        oap_client._connected.wait()
        oap_client.wait_for_message()     # block and wait for initial message, we are expecting api hello

        sio = socketio.Client()     # this is a socketio client for our own notifications from OnBoardPi to be relayed bto OpenAuto Pro

        @sio.event
        def connect():
            # on connect join notifications room
            sio.emit("join_notifications")

        @sio.event
        def obd_connection_status(message):
            print(message)

        sio.connect("http://localhost:60000", transports=['websocket'])     # connection for OnBoardPi notifications API

        can_continue = True
        while can_continue and self.enabled.is_set():
            try:
                can_continue = oap_client.wait_for_message()
            except Exception as e:
                # This happens when client disconnects while trying to receivce, user disabled injector
                logger.error(
                    "An exception occurred on the OAP injector receiving thread: {}. The socket was most likely disconnected while trying to receive bytes because the injector was stopped by the user.".format(e))
                can_continue = False

        oap_client.disconnect()

        sio.emit("leave_notifications")
        sio.disconnect()

        self.active.clear()
        self.callback()