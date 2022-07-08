from .configuration import Configuration

class Watch():
    """ 
    The watch class stores the most recent OBD responses which are needed by socketio clients and 
    emits them back to those who are in the 'watch' room in a background thread 
    """

    def __init__(self):
        self.loop_running = False
        self.watching = {}      # a dict to store the latses OBD responses from the vehicle

        self.config = Configuration()
        # self.obd_io = self.config.get_obd_io()

    def cache(self, response):
        """ Every response from obd-async will be cached in this object's watching dictionary keyed by the OBDCommand name """
        if not response.is_null():
            self.watching[response.command.name] = response

    async def emit_loop(self, socket):
        """ 
        The watch loop continuosly emits the latest watched command responses to clients in the watch room every quarter second and is 
        started as a socketio background task.
        """
        while self.config.obd_io.is_connected():
            await socket.emit("watching", self.watching, room="watch")
            await socket.sleep(self.config.delay)
        self.loop_running = False