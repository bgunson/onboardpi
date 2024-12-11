import os
import asyncio
import logging


from .Message import Message
from . import Api_pb2 as oap_api

from src.response_callback import ResponseCallback
from src.obd_service import OBDService

logger = logging.getLogger('oap')


class EventHandler():
    """
    The event handler manages OpenAuto Pro injection of status icon, notifications, obd values to the protobuf api.
    """

    def __init__(self, obd: OBDService, injector):
        self.obd = obd
        self.injector = injector
        self._notification_channel_id = None
        self.running = asyncio.Event()

    async def on_hello_response(self, client, message):
        logger.debug("Received hello response, result: {}, oap version: {}.{}, api version: {}.{}"
                     .format(message.result, message.oap_version.major,
                             message.oap_version.minor, message.api_version.major,
                             message.api_version.minor))

        register_notification_channel_request = oap_api.RegisterNotificationChannelRequest()
        register_notification_channel_request.name = "OnBoardPi"
        register_notification_channel_request.description = "OnBoardPi OBD connection status channel"

        msg = Message(oap_api.MESSAGE_REGISTER_NOTIFICATION_CHANNEL_REQUEST, 0, register_notification_channel_request.SerializeToString())
        await client.message_queue.put((1, msg))

        register_status_icon_request = oap_api.RegisterStatusIconRequest()
        register_status_icon_request.name = "OnBoardPi Status Icon"
        register_status_icon_request.description = "OBD connection status from OnBoardPi"

        with open(os.path.join(os.path.dirname(__file__), "assets/car.svg"), 'rb') as icon_file:
            register_status_icon_request.icon = icon_file.read()

        msg = Message(oap_api.MESSAGE_REGISTER_STATUS_ICON_REQUEST, 0, register_status_icon_request.SerializeToString())
        await client.message_queue.put((1, msg))


    async def on_ping(self, client):
        logger.debug("OAP server pinged us.")
        if not self.obd.connection.is_connected():
            await self.obd.connect(None)
            await self.obd.watch_commands(self.injector.get_commands(), ResponseCallback(self.injector.id, self.injector.inject))

    async def on_register_status_icon_response(self, client, message):
        logger.debug("register status icon response, result: {}, icon id: {}".format(
            message.result, message.id))
        self._icon_id = message.id

        if message.result == oap_api.RegisterStatusIconResponse.REGISTER_STATUS_ICON_RESULT_OK:
            logger.debug("icon successfully registered")
            change_status_icon_state = oap_api.ChangeStatusIconState()
            change_status_icon_state.id = self._icon_id
            change_status_icon_state.visible = True

            msg = Message(oap_api.MESSAGE_CHANGE_STATUS_ICON_STATE, 0, change_status_icon_state.SerializeToString())
            await client.message_queue.put((1, msg))

    async def on_register_notification_channel_response(self, client, message):
        logger.debug(
            "register notification channel response, result: {}, icon id: {}".
            format(message.result, message.id))
        self._notification_channel_id = message.id

    async def on_phone_connection_status(self, client, message):
        pass

    async def on_phone_levels_status(self, client, message):
        pass

    async def on_phone_voice_call_status(self, client, message):
        pass

    async def on_navigation_status(self, client, message):
        pass

    async def on_navigation_maneuver_details(self, client, message):
        pass

    async def on_navigation_maneuver_distance(self, client, message):
        pass

    async def on_register_audio_focus_receiver_response(self, client, message):
        pass

    async def on_audio_focus_change_response(self, client, message):
        pass

    async def on_audio_focus_action(self, client, message):
        pass

    async def on_audio_focus_media_key(self, client, message):
        pass

    async def on_media_status(self, client, message):
        pass

    async def on_media_metadata(self, client, message):
        pass

    async def on_projection_status(self, client, message):
        pass

    async def on_subscribe_obd_gauge_change_response(self, client, message):
        pass

    async def on_obd_gauge_value_changed(self, client, message):
        pass

    async def on_obd_connection_status(self, client, message):
        pass

    async def on_temperature_status(self, client, message):
        pass

    async def show_notification(self, client, message):
        if self._notification_channel_id is None:
            return
        show_notification = oap_api.ShowNotification()
        show_notification.channel_id = self._notification_channel_id
        show_notification.title = "OnBoardPi"
        show_notification.description = message
        show_notification.single_line = "OnBoardPi - {}".format(message)

        with open(os.path.join(os.path.dirname(__file__), "assets/car.svg"), 'rb') as icon_file:
            show_notification.icon = icon_file.read()
        msg = Message(oap_api.MESSAGE_SHOW_NOTIFICATION, 0, show_notification.SerializeToString())
        await client.message_queue.put((1, msg))


    async def handle_message(self, client, message):
        can_continue = True

        if message is None:
            return can_continue

        if message.id == oap_api.MESSAGE_PING:
            pong = (0, Message(oap_api.MESSAGE_PONG, 0, bytes()))
            await client.message_queue.put(pong)
        elif message.id == oap_api.MESSAGE_BYEBYE:
            can_continue = False

        match message.id:
            case oap_api.MESSAGE_HELLO_RESPONSE:
                hello_response = oap_api.HelloResponse()
                hello_response.ParseFromString(message.payload)
                await self.on_hello_response(client, hello_response)

            case oap_api.MESSAGE_PING:
                await self.on_ping(client)

            case oap_api.MESSAGE_REGISTER_STATUS_ICON_RESPONSE:
                register_status_icon_response = oap_api.RegisterStatusIconResponse()
                register_status_icon_response.ParseFromString(message.payload)
                await self.on_register_status_icon_response(client, register_status_icon_response)

            case oap_api.MESSAGE_REGISTER_NOTIFICATION_CHANNEL_RESPONSE:
                register_notification_channel_response = oap_api.RegisterNotificationChannelResponse()
                register_notification_channel_response.ParseFromString(message.payload)
                await self.on_register_notification_channel_response(client, register_notification_channel_response)

            case oap_api.MESSAGE_PHONE_CONNECTION_STATUS:
                phone_connection_status = oap_api.PhoneConnectionStatus()
                phone_connection_status.ParseFromString(message.payload)
                await self.on_phone_connection_status(client, phone_connection_status)

            case oap_api.MESSAGE_PHONE_LEVELS_STATUS:
                phone_levels_status = oap_api.PhoneLevelsStatus()
                phone_levels_status.ParseFromString(message.payload)
                await self.on_phone_levels_status(client, phone_levels_status)

            case oap_api.MESSAGE_PHONE_VOICE_CALL_STATUS:
                phone_voice_call_status = oap_api.PhoneVoiceCallStatus()
                phone_voice_call_status.ParseFromString(message.payload)
                await self.on_phone_voice_call_status(client, phone_voice_call_status)

            case oap_api.MESSAGE_NAVIGATION_STATUS:
                navigation_status = oap_api.NavigationStatus()
                navigation_status.ParseFromString(message.payload)
                await self.on_navigation_status(client, navigation_status)

            case oap_api.MESSAGE_NAVIGATION_MANEUVER_DETAILS:
                navigation_maneuver_details = oap_api.NavigationManeuverDetails()
                navigation_maneuver_details.ParseFromString(message.payload)
                await self.on_navigation_maneuver_details(client, navigation_maneuver_details)

            case oap_api.MESSAGE_NAVIGATION_MANEUVER_DISTANCE:
                navigation_maneuver_distance = oap_api.NavigationManeuverDistance()
                navigation_maneuver_distance.ParseFromString(message.payload)
                await self.on_navigation_maneuver_distance(client, navigation_maneuver_distance)

            case oap_api.MESSAGE_REGISTER_AUDIO_FOCUS_RECEIVER_RESPONSE:
                register_audio_focus_receiver_response = oap_api.RegisterAudioFocusReceiverResponse()
                register_audio_focus_receiver_response.ParseFromString(message.payload)
                await self.on_register_audio_focus_receiver_response(client, register_audio_focus_receiver_response)

            case oap_api.MESSAGE_AUDIO_FOCUS_CHANGE_RESPONSE:
                audio_focus_change_response = oap_api.AudioFocusChangeResponse()
                audio_focus_change_response.ParseFromString(message.payload)
                await self.on_audio_focus_change_response(client, audio_focus_change_response)

            case oap_api.MESSAGE_AUDIO_FOCUS_ACTION:
                audio_focus_action = oap_api.AudioFocusAction()
                audio_focus_action.ParseFromString(message.payload)
                await self.on_audio_focus_action(client, audio_focus_action)

            case oap_api.MESSAGE_AUDIO_FOCUS_MEDIA_KEY:
                audio_focus_media_key = oap_api.AudioFocusMediaKey()
                audio_focus_media_key.ParseFromString(message.payload)
                await self.on_audio_focus_media_key(client, audio_focus_media_key)

            case oap_api.MESSAGE_MEDIA_STATUS:
                media_status = oap_api.MediaStatus()
                media_status.ParseFromString(message.payload)
                await self.on_media_status(client, media_status)

            case oap_api.MESSAGE_MEDIA_METADATA:
                media_metadata = oap_api.MediaMetadata()
                media_metadata.ParseFromString(message.payload)
                await self.on_media_metadata(client, media_metadata)

            case oap_api.MESSAGE_PROJECTION_STATUS:
                projection_status = oap_api.ProjectionStatus()
                projection_status.ParseFromString(message.payload)
                await self.on_projection_status(client, projection_status)

            case oap_api.MESSAGE_SUBSCRIBE_OBD_GAUGE_CHANGE_RESPONSE:
                subscribe_obd_gauge_change_response = oap_api.SubscribeObdGaugeChangeResponse()
                subscribe_obd_gauge_change_response.ParseFromString(message.payload)
                await self.on_subscribe_obd_gauge_change_response(client, subscribe_obd_gauge_change_response)

            case oap_api.MESSAGE_OBD_GAUGE_VALUE_CHANGED:
                obd_gauge_value_changed = oap_api.ObdGaugeValueChanged()
                obd_gauge_value_changed.ParseFromString(message.payload)
                await self.on_obd_gauge_value_changed(client, obd_gauge_value_changed)

            case oap_api.MESSAGE_OBD_CONNECTION_STATUS:
                obd_connection_status = oap_api.ObdConnectionStatus()
                obd_connection_status.ParseFromString(message.payload)
                await self.on_obd_connection_status(client, obd_connection_status)

            case oap_api.MESSAGE_TEMPERATURE_STATUS:
                temperature_status = oap_api.TemperatureStatus()
                temperature_status.ParseFromString(message.payload)
                await self.on_temperature_status(client, temperature_status)

        return can_continue
