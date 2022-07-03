import logging
import struct
import threading
import socketio
from .Message import Message, QueuedMessage
from . import Api_pb2 as oap_api
import os

logger = logging.getLogger('oap')


class OAPEventHandler(threading.Thread):

    """The event handler manages OpenAuto Pro injection of status icon, notifications, obd values to the protobuf api.

    To relay OnBoardPi notifications, it creates a socketio client which connects to OnBoardPi's server on the main thread, 
    listens for events and queues notification messages to be sent by the OAP client. While the sio client is waiting for events
    the event handler checks if the OAP socket is readable and/or writable and specifies to the OAP client what to do.
    The OAP client if readable will call the handlers in this class for corresponding messages and return true/false based on
    the health iof the OAP server (ex. recv bye bye from server). If the OAP socket is writable the event handler will tell the 
    client to send messages from its message queue.
    
    If this thread is alive it means the OAP injection is active and connected. When it dies it calls back to its parent thread
    who will decide whether the OAP injector should restart.
    """

    def __init__(self, client, callback):
        super().__init__(daemon=True)
        self._client = client
        self.callback = callback
        self._notification_channel_id = None
        self._first_connect = threading.Event()
        self._first_connect.set()

    def on_hello_response(self, client, message):
        logger.debug("Received hello response, result: {}, oap version: {}.{}, api version: {}.{}"
                     .format(message.result, message.oap_version.major,
                             message.oap_version.minor, message.api_version.major,
                             message.api_version.minor))

        register_notification_channel_request = oap_api.RegisterNotificationChannelRequest()
        register_notification_channel_request.name = "OnBoardPi"
        register_notification_channel_request.description = "OnBoardPi OBD connection status channel"

        msg = QueuedMessage(1, Message(oap_api.MESSAGE_REGISTER_NOTIFICATION_CHANNEL_REQUEST, 0, register_notification_channel_request.SerializeToString()))
        client.message_queue.put(msg)

        register_status_icon_request = oap_api.RegisterStatusIconRequest()
        register_status_icon_request.name = "OnBoardPi Status Icon"
        register_status_icon_request.description = "OBD connection status from OnBoardPi"

        with open(os.path.join(os.path.dirname(__file__), "assets/car.svg"), 'rb') as icon_file:
            register_status_icon_request.icon = icon_file.read()

        msg = QueuedMessage(1, Message(oap_api.MESSAGE_REGISTER_STATUS_ICON_REQUEST, 0, register_status_icon_request.SerializeToString()))
        client.message_queue.put(msg)

    def on_register_status_icon_response(self, client, message):
        logger.debug("register status icon response, result: {}, icon id: {}".format(
            message.result, message.id))
        self._icon_id = message.id

        if message.result == oap_api.RegisterStatusIconResponse.REGISTER_STATUS_ICON_RESULT_OK:
            logger.debug("icon successfully registered")
            change_status_icon_state = oap_api.ChangeStatusIconState()
            change_status_icon_state.id = self._icon_id
            change_status_icon_state.visible = True

            msg = QueuedMessage(1, Message(oap_api.MESSAGE_CHANGE_STATUS_ICON_STATE, 0, change_status_icon_state.SerializeToString()))
            self._client.message_queue.put(msg)

    def show_notification(self, message):
        if self._notification_channel_id is None:
            return
        show_notification = oap_api.ShowNotification()
        show_notification.channel_id = self._notification_channel_id
        show_notification.title = "OnBoardPi"
        show_notification.description = message
        show_notification.single_line = "OnBoardPi - {}".format(message)

        with open(os.path.join(os.path.dirname(__file__), "assets/car.svg"), 'rb') as icon_file:
            show_notification.icon = icon_file.read()
        msg = QueuedMessage(1, Message(oap_api.MESSAGE_SHOW_NOTIFICATION, 0, show_notification.SerializeToString()))
        self._client.message_queue.put(msg)

    def on_register_notification_channel_response(self, client, message):
        logger.debug(
            "register notification channel response, result: {}, icon id: {}".
            format(message.result, message.id))
        self._notification_channel_id = message.id

    def run(self):

        """Do two main things:
        1. Try to connect to the OnBoardPi notifications api by acting as a socketio client, listen for incoming notifications and show them on the OpenAuto Pro UI.
        2. Attempt to either read incoming messages from OAP if the socket is readable, or send queued messages if the socket is writable.
        """

        self._client._connected.wait()  # make sure client is connected successfully

        can_continue = True
        # this is a socketio client for our own notifications from OnBoardPi to be relayed to OpenAuto Pro
        sio = socketio.Client()

        @sio.event
        def connect():
            logger.info("OAP event handler notifications socket connected successfully")
            sio.emit("join_notifications")
            # on connect join notifications room
            if self._first_connect.is_set():
                # the sio client can try initiate the obd connection to the car
                sio.emit("connect_obd")
                self._first_connect.clear()

        @sio.event
        def obd_connection_status(message):
            self.show_notification(message['status'])

        while can_continue:
            rlist, wlist = self._client.get_streams()
            try:
                if len(rlist) > 0:      # read incoming messages first
                    can_continue = self._client.wait_for_message()
                elif len(wlist) > 0: 
                    can_continue = self._client.send_messages()
                    # can_continue = self._client.send_message()    # or send a single message only
                if not sio.connected:
                    sio.connect("http://localhost:60000", transports=['websocket'])

            except socketio.exceptions.ConnectionError:
                # notifications socket could not connect, try again next pass
                continue

            except struct.error as e:
                # couldnt receive/unpack message on the oap socket, server probably crashed
                logger.error("OAP could not unpack message. {}. Deactivating...".format(e))
                can_continue = False

            except ConnectionResetError as e:
                # oap server reset our connection
                logger.error("OAP connection reset by peer. {}. Deactivating...".format(e))
                can_continue = False

            except Exception as e:
                # this happens when the tcp connection closes unexpectedly server side like 
                # if OAP were to crash and reboot this thread will be let to die on its own
                # and we shoudnt try to comunicate with this socket anymore
                logger.error("OAP event handler caught an exception: {}. Deactivating...".format(e))
                can_continue = False

        if sio.connected:
            sio.disconnect()
        
        self._client.disconnect()
        self.callback()
