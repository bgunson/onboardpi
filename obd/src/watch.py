from distutils.command.config import config
import obd
from .configuration import Configuration

class Watch():
    """ 
    The watch class handles interaction with the python-OBD async API. Adding/removing OBDCommands
    to be queried from the vehicle and emitting values back to external clients or injectors who join the watch room.  
    """

    def __init__(self):
        self.config = Configuration()
        self.watching = {}
        self.loop_running = False
        self.delay = 0.1     # default to 100ms
        self.socket = self.config.get_socket()
        self.io = self.config.get_obd_connection()

        # Watch the commands needed by each injector
        for injector in self.config.get_injectors():
            self.watch_cmds(injector.get_commands())

    def watch_cmds(self, commands):
        # Stop the obd-async worker, add each cmd to the watch and then restart the worker
        self.io.connection.stop()
        for cmd in commands:
            self.io.connection.watch(obd.commands[cmd], self.cache)
        self.io.connection.start()
            

    def unwatch_cmds(self, commands):
        # Indicate that our watch loop is not running since it terminates when obd-async worker is not running
        # A subsequent 'watch' event will have the loop restarted if needed.
        self.loop_running = False

        # Stop obd-async worker, unwatch each cmd, then restart the obd-async worker
        self.io.connection.stop()
        for cmd in commands:
            self.io.connection.unwatch(obd.commands[cmd])
            if cmd in self.watching:
                self.watching.pop(cmd)
        
        # Re-watch commands for each injector
        for injector in self.config.get_injectors():
            self.watch_cmds(injector.get_commands())

        # self.io.connection.start()      # obd-async handles the case where a loop if started with no cmds gracefully so no need to implement a check


    def cache(self, response):
        """ Every response from obd-async will be cached in this object's watching dictionary keyed by the OBDCommand name """
        self.watching[response.command.name] = response
        for i in self.config.get_injectors():
            i.inject(response)

    async def watch_loop(self):
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
        while self.io.connection.running and self.io.connection.is_connected():
            await self.socket.emit("watching", self.watching, room="watch")
            await self.socket.sleep(self.config.get_delay())