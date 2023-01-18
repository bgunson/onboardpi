import obd
from .configuration import Configuration
from .watch import Watch
import threading


class API:
    """
    This class defines the public socketio API listeners for the OBD-Server. Default events are defined by obd-socketio and can be 
    found here: https://github.com/bgunson/obd-socketio or ../../obd-socketio/README.md (git submodule)
    """

    def __init__(self, sio):
        self.socket = sio
        self.config = Configuration()
        # self.obd_io = self.config.get_obd_io()
        self.watch = Watch()

    def mount(self):
        """ Mount socketio event listeners for the OnBoardPi-OBD API """
        sio = self.socket

        # region Watch event listeners

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
            self.config.obd_io.stop()
            for cmd in commands:
                if obd.commands.has_name(cmd):
                    self.config.obd_io.unwatch(obd.commands[cmd], callback=self.watch.cache)
                    if cmd in self.watch.watching:
                        self.watch.watching.pop(cmd)

            self.config.obd_io.start()
            # This is to tell every other clients that someone else has unwatched these commands
            # Affected clients will re-emit a 'watch' for the commands they continue to need and our watch loop will be restarted
            await sio.emit('unwatch', commands, room='watch', skip_sid=sid)

        @sio.event
        async def watch(sid, commands):
            self.config.obd_io.stop()
            for cmd in commands:
                if obd.commands.has_name(cmd):
                    self.config.obd_io.watch(obd.commands[cmd], callback=self.watch.cache)
            self.config.obd_io.start()

            if not self.watch.loop_running:
                await sio.start_background_task(self.watch.emit_loop, sio)

        # endregion

        # region Logger event listeners

        @sio.event
        async def set_logger_level(sid, logger_name, level):
            self.config.set_logger_level(logger_name, level)

        # endregion

        # region Injector event listeners

        @sio.event
        async def enable_injector(sid, injector_type):
            injector = None
            if injector_type in self.config.get_injectors():
                injector = self.config.get_injectors()[injector_type]
                # This injector is already registered with configuration so start it up again
                injector.start()
                self.config.handle_injector_event('watch', injector)
            else:
                injector = self.config.register_injector(injector_type)

        @sio.event
        async def disable_injector(sid, injector_type):
            if injector_type in self.config.get_injectors():
                injector = self.config.get_injectors()[injector_type]
                self.config.handle_injector_event('stop', injector)
                injector.stop()

        @sio.event
        async def unwatch_injector(sid, injector_type):
            if injector_type in self.config.get_injectors():
                injector = self.config.get_injectors()[injector_type]
                self.config.handle_injector_event('unwatch', injector)
            

        @sio.event
        async def injector_state(sid, injector_type):
            injector_state = {}
            if injector_type in self.config.get_injectors():
                injector = self.config.get_injectors()[injector_type]
                injector_state = injector.status()
            await sio.emit('injector_state', injector_state, room=sid)

        # endregion

        # region OBD/ELM event listeners

        @sio.event
        async def status(sid):
            await sio.emit('status', self.config.obd_io.status(), room=sid)

        @sio.event
        async def is_connected(sid):
            await sio.emit('is_connected', self.config.obd_io.is_connected(), room=sid)

        @sio.event
        async def port_name(sid):
            await sio.emit('port_name', self.config.obd_io.port_name(), room=sid)

        @sio.event
        async def supports(sid, cmd):
            if obd.commands.has_name(cmd):
                await sio.emit('supports', self.config.obd_io.supports(obd.commands[cmd]), room=sid)
            else:
                await sio.emit('suuports', False, room=sid)

        @sio.event
        async def protocol_id(sid):
            await sio.emit('protocol_id', self.config.obd_io.protocol_id(), room=sid)

        @sio.event
        async def protocol_name(sid):
            await sio.emit('protocol_name', self.config.obd_io.protocol_name(), room=sid)

        @sio.event
        async def supported_commands(sid):
            await sio.emit('supported_commands', self.config.obd_io.supported_commands, room=sid)

        @sio.event
        async def query(sid, cmd):
            if obd.commands.has_name(cmd):
                await sio.emit('query', self.config.obd_io.query(obd.commands[cmd]), room=sid)
            else:
                await sio.emit('query', None, room=sid)

        @sio.event
        async def unwatch_all(sid):
            self.config.obd_io.stop()
            self.config.obd_io.unwatch_all()

        @sio.event
        async def has_name(sid, name):
            await sio.emit('has_name', obd.commands.has_name(name), room=sid)

        @sio.event
        async def close(sid):
            self.config.obd_io.close()
            await sio.emit("obd_connection_status", self.get_obd_connection_status(), room="notifications")
            await sio.emit('obd_closed')

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
            if obd.commands.has_name(cmd):
                await sio.emit('get_command', obd.commands[cmd], room=sid)
            else:
                await sio.emit('get_command', None, room=sid)

        @sio.event
        async def connect_obd(sid):
            # await sio.start_background_task(self.config.connect_obd, sio)
            self.config.connect_obd()
            await sio.emit("obd_connection_status", self.get_obd_connection_status(), room="notifications")
            if not self.watch.loop_running:
                await sio.start_background_task(self.watch.emit_loop, sio)

        # endregion

        @sio.event
        async def join_notifications(sid):
            sio.enter_room(sid, 'notifications')
            await sio.emit("obd_connection_status", self.get_obd_connection_status(), room=sid)

        @sio.event
        async def leave_notifications(sid):
            sio.leave_room(sid, 'notifications')

        @sio.event
        async def get_obd_connection_status(sid):
            await sio.emit("obd_connection_status", self.get_obd_connection_status(), room=sid)

    def get_obd_connection_status(self):
        return {
            'connected': self.config.obd_io.is_connected(),
            'status': self.config.obd_io.status(),
        }
