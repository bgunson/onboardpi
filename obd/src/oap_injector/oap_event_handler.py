import logging
import threading
import socketio
from . import Api_pb2 as oap_api
import os

logger = logging.getLogger('oap')


class OAPEventHandler(threading.Thread):

    def __init__(self, client, enabled, callback):
        super().__init__(daemon=True)
        self._client = client
        self.callback = callback
        self.active = threading.Event()
        self.enabled = enabled
        self._first_connect = threading.Event()
        self._first_connect.set()

    def on_hello_response(self, client, message):
        logger.debug("Received hello response, result: {}, oap version: {}.{}, api version: {}.{}"
                     .format(message.result, message.oap_version.major,
                             message.oap_version.minor, message.api_version.major,
                             message.api_version.minor))
        self.active.set()

        register_notification_channel_request = oap_api.RegisterNotificationChannelRequest()
        register_notification_channel_request.name = "OnBoardPi"
        register_notification_channel_request.description = "OnBoardPi OBD connection status channel"

        client.send(oap_api.MESSAGE_REGISTER_NOTIFICATION_CHANNEL_REQUEST, 0,
                    register_notification_channel_request.SerializeToString())

        register_status_icon_request = oap_api.RegisterStatusIconRequest()
        register_status_icon_request.name = "OnBoardPi Status Icon"
        register_status_icon_request.description = "OBD connection status from OnBoardPi"

        with open(os.path.join(os.path.dirname(__file__), "assets/car.svg"), 'rb') as icon_file:
            register_status_icon_request.icon = icon_file.read()

        client.send(oap_api.MESSAGE_REGISTER_STATUS_ICON_REQUEST, 0,
                    register_status_icon_request.SerializeToString())

    def on_register_status_icon_response(self, client, message):
        logger.debug("register status icon response, result: {}, icon id: {}".format(
            message.result, message.id))
        self._icon_id = message.id

        if message.result == oap_api.RegisterStatusIconResponse.REGISTER_STATUS_ICON_RESULT_OK:
            logger.debug("icon successfully registered")
            change_status_icon_state = oap_api.ChangeStatusIconState()
            change_status_icon_state.id = self._icon_id
            change_status_icon_state.visible = True
            self._client.send(oap_api.MESSAGE_CHANGE_STATUS_ICON_STATE, 0,
                          change_status_icon_state.SerializeToString())

    def show_notification(self, message):
        show_notification = oap_api.ShowNotification()
        show_notification.channel_id = self._notification_channel_id
        show_notification.title = "OnBoardPi"
        show_notification.description = message
        show_notification.single_line = "Hello World - This is an example"

        with open(os.path.join(os.path.dirname(__file__), "assets/car.svg"), 'rb') as icon_file:
            show_notification.icon = icon_file.read()

        self._client.send(oap_api.MESSAGE_SHOW_NOTIFICATION, 0,
                          show_notification.SerializeToString())

    def on_register_notification_channel_response(self, client, message):
        logger.debug(
            "register notification channel response, result: {}, icon id: {}".
            format(message.result, message.id))
        self._notification_channel_id = message.id

    def run(self):

        self._client._connected.wait()
        # block and wait for initial message, we are expecting api hello
        self._client.wait_for_message()

        # this is a socketio client for our own notifications from OnBoardPi to be relayed bto OpenAuto Pro
        sio = socketio.Client()

        @sio.event
        def connect():
            # on connect join notifications room
            if self._first_connect.is_set():
                sio.emit("connect_obd")
                self._first_connect.clear()
            sio.emit("join_notifications")

        @sio.event
        def obd_connection_status(message):
            self.show_notification(message['status'])

        # connection for OnBoardPi notifications API
        sio.connect("http://localhost:60000", transports=['websocket'])

        can_continue = True
        while can_continue and self.enabled.is_set():
            try:
                can_continue = self._client.wait_for_message()
            except Exception as e:
                # This happens when client disconnects while trying to receivce, user disabled injector
                logger.error(
                    "An exception occurred on the OAP injector receiving thread: {}. The socket was most likely disconnected while trying to receive bytes because the injector was stopped by the user.".format(e))
                can_continue = False

        self._client.disconnect()
        sio.emit("leave_notifications")
        sio.disconnect()
        # self.toggle_icon_visibility()
        self.active.clear()
        self.callback()
