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
        self.obd_io = self.config.get_obd_connection()

    def cache(self, response):
        """ Every response from obd-async will be cached in this object's watching dictionary keyed by the OBDCommand name """
        if not response.is_null():
            self.watching[response.command.name] = response

    async def emit_loop(self, socket):
        """ 
        The watch loop continuosly emits the latest watched command responses to clients in the watch room every quarter second and is 
        started as a socketio background task.

        Loop invariant: The obd-async worker thread is running AND the car is connected. 

        Rationale: The obd-async worker thread itself is a loop continuously querying commands that have been watched by the user. 
        python-OBD handles the loop nicely in that:
            - If no commands are currently being watched then the loop is not started
            - If there is no connection to the then no commands can be watched

        There seems to be no easy way to join a background task started with python-socketio. 
        This watch loop is started (if not already running) with the during a watch sio event and if the worker thread continues
        but the vehicle is turned off this loop invariant will fail no matter what and this process can be terminated more 
        quickly and easily.
        """
        while self.obd_io.connection.running and self.obd_io.connection.is_connected():
            await socket.emit("watching", self.watching, room="watch")
            await socket.sleep(self.config.delay)
        self.loop_running = False