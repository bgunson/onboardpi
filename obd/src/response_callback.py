from typing import Callable, Any

from obd import OBDResponse

class ResponseCallback():

    def __init__(self, client_id: str, callback: Callable, is_async: bool = False):
        """
        Initialize the OBDCallback.

        :param client_id: The client who registered the callback
        :param callback: The callback function, can be sync or async.
        :param is_async: Flag indicating if the callback is asynchronous.
        """
        if not callable(callback):
            raise ValueError("callback must be callable")
        
        self.client_id = client_id
        self.callback = callback
        self.is_async = is_async


    async def run(self, response: OBDResponse) -> Any:
        """
        Execute the callback. If it's async, await it. If it's sync, execute normally.
        """
        if self.is_async:
            return await self.callback(response)
        else:
            return self.callback(response)