import obd
import obdio
from obpi import *

class OBDServer():

    io = None
    socket = None
    watching = {}
    watch_loop_running = False
    params = {}

    def __init__(self):
        """ Immedieately attempt to connect to the vehcile on instantiation and define the socketio events and handlers """
        obd.logger.setLevel(get_log_level())
        self.io = obdio.OBDio()
        self.params = get_params()
        self.io.connect_obd(**self.params)
        sio = self.io.create_server(cors_allowed_origins='*', json=obdio)

        """ Begin mounting additional events and overrides """

        @sio.event
        async def join_watch(sid):
            sio.enter_room(sid, 'watch')

        @sio.event
        async def leave_watch(sid):
            sio.leave_room(sid, 'watch')

        @sio.event
        async def unwatch(sid, commands):
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

            # This is to tell every other clients that someone else has unwatched these commands
            # Affected clients will re-emit a 'watch' for the commands they continue to need and our watch loop will be restarted
            await sio.emit('unwatch', commands, room='watch', skip_sid=sid)

        @sio.event
        async def watch(sid, commands):
            # Stop the obd-async worker, add each cmd to the watch and then restart the worker
            self.io.connection.stop()
            for cmd in commands:
                self.io.connection.watch(obd.commands[cmd], self.cache)
            self.io.connection.start()

            # Restart our watch loop if not started already
            if not self.watch_loop_running:
                self.watch_loop_running = True
                await sio.start_background_task(self.watch_loop)

        @sio.event
        async def all_protocols(sid):
            all = [
                obd.protocols.ISO_14230_4_5baud,
                obd.protocols.ISO_14230_4_fast,
                obd.protocols.ISO_15765_4_11bit_250k,
                obd.protocols.ISO_15765_4_11bit_500k,
                obd.protocols.ISO_15765_4_29bit_250k,
                obd.protocols.ISO_15765_4_29bit_500k,
                obd.protocols.ISO_9141_2,
                obd.protocols.SAE_J1850_PWM,
                obd.protocols.SAE_J1850_VPW,
                obd.protocols.SAE_J1939
            ]
            await sio.emit('all_protocols', sorted(all, key=lambda p: p.ELM_ID), room=sid)

        @sio.event
        async def all_dtcs(sid):
            await sio.emit('all_dtcs', obd.codes.DTC, room=sid)
                
        @sio.event
        async def all_commands(sid):
            all = list(obd.commands.modes)
            all[0] = obd.commands.base_commands()
            await sio.emit('all_commands', all, room=sid)

        @sio.event
        async def get_command(sid, cmd):
            await sio.emit('get_command', obd.commands[cmd], room=sid)

        @sio.event
        async def connect_obd(sid):
            await sio.emit('obd_connecting')
            self.params = get_params()
            self.io.connect_obd(**self.params)

        """ End of events """

        self.socket = sio

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
            # data = dict(self.watching)      # Copy the watching dictionary
            await self.socket.sleep(self.params['delay_cmds'])
            await self.socket.emit('watching', self.watching, room='watch')

    def cache(self, response):
        """ Every response from obd-async will ba cached in this class's watching dictionary keyed by the OBDCommand name """
        self.watching[response.command.name] = response

    def start(self):
        """ This starts the socketio assgi server """
        self.io.serve_static({
            '/view/obd-log': {'filename': 'obd.log', 'content_type': 'text/plain'},
            '/download/obd-log': 'obd.log'
        })
        self.io.run_server(host='0.0.0.0', port=60000, log_level='critical')


if __name__ == '__main__':
    server = OBDServer()
    server.start()