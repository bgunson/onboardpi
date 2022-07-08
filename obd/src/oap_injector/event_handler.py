import logging
import threading
import time
from .notifications import Notifications
from .Message import Message, QueuedMessage
from . import Api_pb2 as oap_api
import os

logger = logging.getLogger('oap')


class EventHandler(threading.Thread):

    """The event handler manages OpenAuto Pro injection of status icon, notifications, obd values to the protobuf api.

    To relay OnBoardPi notifications, it creates a socketio client (see notifications.py) which connects to OnBoardPi's server on the main thread, 
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

    def on_register_notification_channel_response(self, client, message):
        logger.debug(
            "register notification channel response, result: {}, icon id: {}".
            format(message.result, message.id))
        self._notification_channel_id = message.id

    def on_phone_connection_status(self, client, message):
        pass

    def on_phone_levels_status(self, client, message):
        pass

    def on_phone_voice_call_status(self, client, message):
        pass

    def on_navigation_status(self, client, message):
        pass

    def on_navigation_maneuver_details(self, client, message):
        pass

    def on_navigation_maneuver_distance(self, client, message):
        pass

    def on_register_audio_focus_receiver_response(self, client, message):
        pass

    def on_audio_focus_change_response(self, client, message):
        pass

    def on_audio_focus_action(self, client, message):
        pass

    def on_audio_focus_media_key(self, client, message):
        pass

    def on_media_status(self, client, message):
        pass

    def on_media_metadata(self, client, message):
        pass

    def on_projection_status(self, client, message):
        pass

    def on_subscribe_obd_gauge_change_response(self, client, message):
        pass

    def on_obd_gauge_value_changed(self, client, message):
        pass

    def on_obd_connection_status(self, client, message):
        pass

    def on_temperature_status(self, client, message):
        pass

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

    def run(self):

        """Try to read/write to the oap socket 
        """
        self._client._connected.wait()  # make sure client is connected successfully
        can_continue = True

        while can_continue:
            rlist, wlist = self._client.get_streams()
            try:
                if len(rlist) > 0:      # read incoming messages first
                    can_continue = self._client.wait_for_message()
                if len(wlist) > 0: 
                    can_continue = self._client.send_messages()
                    # can_continue = self._client.send_message()    # or send a single message only
                time.sleep(0.1)
            except:
                can_continue = False
        
        self._client.disconnect()
        self.callback()
