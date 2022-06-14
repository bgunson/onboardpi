import obd
import obdio
from src import Watch, Configuration

class OBDServer():

    def __init__(self):
        """ Immedieately attempt to connect to the vehcile on instantiation and define the socketio events and handlers """

        self.config = Configuration()
        self.io = obdio.OBDio()
        self.config.set_obd_connection(self.io)

        sio = self.io.create_server(cors_allowed_origins='*', json=obdio)
        self.socket = sio
        self.config.set_socket(self.socket)

        # Attempt to connect to the vehicle
        params = self.config.connection_params()
        self.io.connect_obd(**params)
        
        self.watch = Watch()

        """ Begin mounting additional events and overrides """

        @sio.event
        async def join_watch(sid):
            sio.enter_room(sid, 'watch')

        @sio.event
        async def leave_watch(sid):
            sio.leave_room(sid, 'watch')

        @sio.event
        async def unwatch(sid, commands):
            self.watch.unwatch_cmds(commands)
            # This is to tell every other clients that someone else has unwatched these commands
            # Affected clients will re-emit a 'watch' for the commands they continue to need and our watch loop will be restarted
            await self.socket.emit('unwatch', commands, room='watch', skip_sid=sid)

        @sio.event
        async def watch(sid, commands):
            self.watch.watch_cmds(commands)
            # Restart our watch loop if not started already
            if not self.watch.loop_running:
                self.watch.loop_running = True
                await self.socket.start_background_task(self.watch.watch_loop)

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
            params = self.config.connection_params()
            self.io.connect_obd(**params)

        """ End of events """

    def start(self):
        """ This starts the socketio asgi server """
        self.io.serve_static({
            '/view/obd.log': {'filename': 'obd.log', 'content_type': 'text/plain'},
            '/download/obd.log': 'obd.log'
        })
        self.io.run_server(host='0.0.0.0', port=60000, log_level='critical')


if __name__ == '__main__':
    server = OBDServer()
    server.start()
