import asyncio
import struct

from . import Api_pb2 as oap_api
from .Message import Message

class OAPClient:

    def __init__(self, name, start_background_task, handle_message):
        self.name = name
        self.start_background_task = start_background_task
        self.handle_message = handle_message
        self.is_connected = asyncio.Event()
        self.message_queue = asyncio.PriorityQueue()

    async def connect(self, hostname, port):
        if self.is_connected.is_set():
            await self.disconnect()
        self.reader, self.writer = await asyncio.open_connection(hostname, port)
        self.is_connected.set()

        await self._send_hello()

        # Start background tasks for sending and receiving
        self.start_background_task(self.receive_messages)
        self.start_background_task(self.send_messages)


    async def disconnect(self):
        while not self.message_queue.empty():
            _ = await self.message_queue.get()
        if self.writer:
            self.writer.close()
            await self.writer.wait_closed()
        self.is_connected.clear()


    async def _send(self, id, flags, payload):
        header = struct.pack('<III', len(payload), id, flags)
        self.writer.write(header + payload)
        await self.writer.drain()


    async def send_messages(self):
        while self.is_connected.is_set():
            _, msg = await self.message_queue.get()
            await self._send(msg.id, msg.flags, msg.payload)
            if msg.id == oap_api.MESSAGE_BYEBYE:
                self.writer.close()
                await self.writer.wait_closed()
                self.is_connected.clear()


    async def _send_hello(self):
        hello_request = oap_api.HelloRequest()
        hello_request.name = self.name
        hello_request.api_version.major = oap_api.API_MAJOR_VERSION
        hello_request.api_version.minor = oap_api.API_MINOR_VERSION
        await self._send(oap_api.MESSAGE_HELLO_REQUEST, 0, hello_request.SerializeToString())


    async def receive_messages(self):
        while self.is_connected.is_set():
            await self.receive_message()

    async def receive_message(self):
        try:
            header_data = await self.reader.readexactly(12)
            payload_size, id, flags = struct.unpack('<III', header_data)
            payload = await self.reader.readexactly(payload_size)
            message = Message(id, flags, payload)
            await self.handle_message(self, message)
        except asyncio.IncompleteReadError:
            await self.disconnect()
        except Exception as e:
            print(f"Error receiving messages: {e}")
            await self.disconnect()