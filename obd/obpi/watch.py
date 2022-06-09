import obd
import socketio
from .configure import *

class Watch():

    def __init__(self, obd_connection, sio):
        self.watching = {}
        self.watch_loop_running = False
        self.delay = 100     # default to 100ms
        self.socket = sio
        self.io = obd_connection

    async def watch_cmds(self, commands):
        # Stop the obd-async worker, add each cmd to the watch and then restart the worker
        self.io.connection.stop()
        for cmd in commands:
            self.io.connection.watch(obd.commands[cmd], self.cache)
        self.io.connection.start()

        # Restart our watch loop if not started already
        if not self.watch_loop_running:
            self.watch_loop_running = True
            await self.socket.start_background_task(self.watch_loop)

    async def unwatch_cmds(self, commands):
        # Indicate that ourt watch loop is not running since it terminates when obd-async worker is not running
        # A subsequent 'watch' event will have the loop restarted if needed.
        self.watch_loop_running = False

        # Stop obd-async worker, unwatch each cmd, then restart the obd-async worker
        self.io.connection.stop()
        for cmd in commands:
            self.io.connection.unwatch(obd.commands[cmd])
            if cmd in self.watching:
                self.watching.pop(cmd)
        self.io.connection.start()      # obd-async handles the case where a loop if started with no cmds gracefully so no need to implement a check


    def cache(self, response):
        """ Every response from obd-async will be cached in this object's watching dictionary keyed by the OBDCommand name """
        self.watching[response.command.name] = response

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
            await self.socket.emit('watching', self.watching, room='watch')
            await self.socket.sleep(self.delay)

    def set_delay(self, delay_ms):
        self.delay = delay_ms