import logging
import struct
import threading
import socketio
from .Message import Message
from . import Api_pb2 as oap_api
import os

logger = logging.getLogger('oap')


class OAPEventHandler(threading.Thread):

    def __init__(self, client, callback):
        super().__init__(daemon=True)
        self._client = client
        self.callback = callback
        self.active = threading.Event()
        self._notification_channel_id = None
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

        client.message_queue.put(Message(oap_api.MESSAGE_REGISTER_NOTIFICATION_CHANNEL_REQUEST, 0,
                    register_notification_channel_request.SerializeToString()))

        register_status_icon_request = oap_api.RegisterStatusIconRequest()
        register_status_icon_request.name = "OnBoardPi Status Icon"
        register_status_icon_request.description = "OBD connection status from OnBoardPi"

        with open(os.path.join(os.path.dirname(__file__), "assets/car.svg"), 'rb') as icon_file:
            register_status_icon_request.icon = icon_file.read()

        client.message_queue.put(Message(oap_api.MESSAGE_REGISTER_STATUS_ICON_REQUEST, 0,
                    register_status_icon_request.SerializeToString()))

    def on_register_status_icon_response(self, client, message):
        logger.debug("register status icon response, result: {}, icon id: {}".format(
            message.result, message.id))
        self._icon_id = message.id

        if message.result == oap_api.RegisterStatusIconResponse.REGISTER_STATUS_ICON_RESULT_OK:
            logger.debug("icon successfully registered")
            change_status_icon_state = oap_api.ChangeStatusIconState()
            change_status_icon_state.id = self._icon_id
            change_status_icon_state.visible = True
            self._client.message_queue.put(Message(oap_api.MESSAGE_CHANGE_STATUS_ICON_STATE, 0,
                          change_status_icon_state.SerializeToString()))

    def show_notification(self, message):
        if self._notification_channel_id is None:
            return
        show_notification = oap_api.ShowNotification()
        show_notification.channel_id = self._notification_channel_id
        show_notification.title = "OnBoardPi"
        show_notification.description = message
        show_notification.single_line = "Hello World - This is an example"

        with open(os.path.join(os.path.dirname(__file__), "assets/car.svg"), 'rb') as icon_file:
            show_notification.icon = icon_file.read()

        self._client.message_queue.put(Message(oap_api.MESSAGE_SHOW_NOTIFICATION, 0,
                          show_notification.SerializeToString()))

    def on_register_notification_channel_response(self, client, message):
        logger.debug(
            "register notification channel response, result: {}, icon id: {}".
            format(message.result, message.id))
        self._notification_channel_id = message.id

    def run(self):

        self._client._connected.wait()  # make sure client is connected successfully

        can_continue = True

        # this is a socketio client for our own notifications from OnBoardPi to be relayed to OpenAuto Pro
        sio = socketio.Client()

        @sio.event
        def connect():
            sio.emit("join_notifications")
            # on connect join notifications room
            if self._first_connect.is_set():
                sio.emit("connect_obd")
                self._first_connect.clear()

        @sio.event
        def obd_connection_status(message):
            self.show_notification(message['status'])

        # connection for OnBoardPi notifications API
        try:
            sio.connect("http://localhost:60000", transports=['websocket'])
        except Exception:
            # we may not connect to the onboardpi socketio api if the injector starts
            # before uvicorn is accepting connections. If this happens we won't continue and instead
            # disconnect from the OAP api and callback to the injector who will restart if enabled and hopefully uvicorn will be up by then
            can_continue = False

        while can_continue:
            rlist, wlist, elist = self._client.get_streams()
            if len(rlist) > 0:
                try:
                    can_continue = self._client.wait_for_message()
                except struct.error:
                    # this happens when the tcp connection closes unexpectedly server side like 
                    # if OAP were to crash and reboot this thread will be let to die on its own
                    # and we shoudnt try to comunicate with the connection anymore
                    can_continue = False
            elif len(wlist) > 0:
                can_continue = self._client.send_message()
            elif len(elist) > 0:
                can_continue = False

        if sio.connected:
            sio.disconnect()
        
        self.active.clear()
        self._client.disconnect()
        self.callback()
