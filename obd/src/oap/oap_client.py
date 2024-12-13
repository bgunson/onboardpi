import asyncio
import logging
import struct

from . import Api_pb2 as oap_api
from .Message import Message

logger = logging.getLogger("oap")

class OAPClient:

    def __init__(self, event_handler):
        self.name = "OnBoardPi OAP Client"
        self.event_handler = event_handler
        self.is_connected = asyncio.Event()
        self.message_queue = asyncio.PriorityQueue()
        

    async def connect(self, hostname, port):
        logger.debug("OAP Client connecting")
        if self.is_connected.is_set():
            return
        self.reader, self.writer = await asyncio.open_connection(hostname, port)
        self.is_connected.set()
        await self._send_hello()

        # Start background tasks for sending and receiving
        asyncio.create_task(self.receive_messages())
        asyncio.create_task(self.send_messages())

        await self.event_handler.trigger("connected")


    async def disconnect(self, restart = False):
        self.is_connected.clear()
        try:
            self.writer.close()
            await self.writer.wait_closed()
        except Exception:
            pass

        # empty the current messgae queue
        while not self.message_queue.empty():
            _ = await self.message_queue.get()

        await self.event_handler.trigger("disconnect", restart)
        logger.info("OAP Client disconnected")


    async def _send(self, id, flags, payload):
        header = struct.pack('<III', len(payload), id, flags)
        self.writer.write(header + payload)
        await self.writer.drain()


    async def send_messages(self):
        while self.is_connected.is_set():
            _, msg = await self.message_queue.get()
            try:
                await self._send(msg.id, msg.flags, msg.payload)
                if msg.id == oap_api.MESSAGE_BYEBYE:
                    logger.error("OAP Client disconnecting willingly")
                    await self.disconnect(restart=False)
            except ConnectionResetError:
                logger.error("OAP Client ConnectionResetError")
                await self.disconnect(restart=True)
            except Exception as e:
                logger.error(f"OAP Client Write error: {e}")
                await self.disconnect(restart=True)


    async def _send_hello(self):
        hello_request = oap_api.HelloRequest()
        hello_request.name = self.name
        hello_request.api_version.major = oap_api.API_MAJOR_VERSION
        hello_request.api_version.minor = oap_api.API_MINOR_VERSION
        await self._send(oap_api.MESSAGE_HELLO_REQUEST, 0, hello_request.SerializeToString())


    async def _receive(self):
        header_data = await self.reader.readexactly(12)
        payload_size, id, flags = struct.unpack('<III', header_data)
        payload = await self.reader.readexactly(payload_size)
        message = Message(id, flags, payload)
        if not await self.event_handler.handle_message(self, message):
            await self.disconnect(restart=False)


    async def receive_messages(self):
        while self.is_connected.is_set():
            try:
                await self._receive()
            except asyncio.IncompleteReadError:
                logger.error("OAP Client IncompleteReadError")
                break
            except Exception as e:
                logger.error(f"OAP Client read error: {e}")
                break
                
    