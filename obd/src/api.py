import obd
from .configuration import Configuration
from .watch import Watch

class API:
    """
    This class defines the public socketio API listeners for the OBD-Server. Default events are defined by obd-socketio and can be 
    found here: https://github.com/bgunson/obd-socketio or ../../obd-socketio/README.md (git submodule)
    """
    def __init__(self, sio):
        self.socket = sio
        self.config = Configuration()
        self.obd_io = self.config.get_obd_connection()
        self.watch = Watch()

    def mount(self):
        """ Mount socketio event listeners for the OnBoardPi-OBD API """
        sio = self.socket

        #region Watch event listeners

        @sio.event
        async def join_watch(sid):
            sio.enter_room(sid, 'watch')

        @sio.event
        async def leave_watch(sid):
            sio.leave_room(sid, 'watch')

        @sio.event
        async def unwatch(sid, commands):
            # Indicate that our watch loop is not running since it terminates when obd-async worker is not running
            # A subsequent 'watch' event will have the loop restarted if needed.
            self.watch.loop_running = False

            # Stop obd-async worker, unwatch each cmd, then restart the obd-async worker
            self.obd_io.connection.stop()
            for cmd in commands:
                self.obd_io.connection.unwatch(obd.commands[cmd])
                if cmd in self.watch.watching:
                    self.watch.watching.pop(cmd)
            # This is to tell every other clients that someone else has unwatched these commands
            # Affected clients will re-emit a 'watch' for the commands they continue to need and our watch loop will be restarted
            await sio.emit('unwatch', commands, room='watch', skip_sid=sid)
            # Also tell config who will rewatch for each active injector
            self.config.on_unwatch_event()

        @sio.event
        async def watch(sid, commands):
            self.obd_io.connection.stop()
            for cmd in commands:
                self.obd_io.connection.watch(obd.commands[cmd], self.watch.cache)
            self.obd_io.connection.start()
            # Restart our watch loop if not started already
            if not self.watch.loop_running:
                self.watch.loop_running = True
                await sio.start_background_task(self.watch.emit_loop, sio)

        #endregion

        #region Injector event listeners

        @sio.event
        async def enable_injector(sid):
            pass

        @sio.event
        async def disable_injector(sid):
            pass

        #endregion

        #region OBD/ELM generic event listeners

        @sio.event
        async def available_ports(sid):
            await sio.emit('available_ports', obd.scan_serial(), room=sid)

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
            self.config.get_obd_connection().connect_obd(**params)

        #endregion