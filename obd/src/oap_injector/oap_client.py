import asyncio
import struct

from . import Api_pb2 as oap_api
from .Message import Message

class OAPClient:

    def __init__(self, event_handler):
        self.name = "OnBoardPi OAP Client"
        self.event_handler = event_handler
        self.is_connected = asyncio.Event()
        self.message_queue = asyncio.PriorityQueue()

    async def connect(self, hostname, port):
        if self.is_connected.is_set():
            await self.disconnect()
        self.reader, self.writer = await asyncio.open_connection(hostname, port)
        self.is_connected.set()
        await self._send_hello()

        # Start background tasks for sending and receiving
        asyncio.create_task(self.receive_messages())
        asyncio.create_task(self.send_messages())


    async def disconnect(self, restart = False):
        self.is_connected.clear()
        while not self.message_queue.empty():
            _ = await self.message_queue.get()
        if self.writer:
            self.writer.close()
            await self.writer.wait_closed()

        await self.event_handler.on_disconnect(restart)


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
                    await self.disconnect(restart=False)
            except ConnectionResetError:
                await self.disconnect(restart=True)
            except Exception as e:
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
        payload = await asyncio.wait_for(self.reader.readexactly(payload_size), 5)
        message = Message(id, flags, payload)
        await self.event_handler.handle_message(self, message)


    async def receive_messages(self):
        while self.is_connected.is_set():
            try:
                await self._receive()
            except asyncio.TimeoutError:
                await self.disconnect(restart=True)
            except asyncio.IncompleteReadError:
                await self.disconnect(restart=True)
            except Exception as e:
                await self.disconnect(restart=True)
                
    