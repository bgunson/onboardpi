import obd
import elm
import sys
import threading

from collections import defaultdict

from .logger import register_logger
from .configuration_service import ConfigurationService

class OBDService(obd.OBD):

    def __init__(self, sio, config):
        register_logger(obd.__name__, config.settings["connection"]["log_level"], file_logger=True)
        super().__init__()  

        self.__register_events(sio)

        self.sio = sio
        self.__emulator = None
        self.__lock = threading.RLock()
        self.config: ConfigurationService = config

        self.__loop = None
        self.__commands = defaultdict(obd.OBDResponse)   # key = OBDCommand, value = Response
        self.__callbacks = defaultdict(dict)  # key = OBDCommand, value = list of Functions
        self.__async_callbacks = defaultdict(dict)
        self.__running = False


    def connect(self, portstr):
        with self.__lock:
            if self.is_connected():
                return
            
            if portstr is None:
                params = self.config.load_connection_params()
            else:
                params = { "portstr": portstr }
                
            self._OBD__connect(params.get("portstr"), params.get("baudrate"), params.get("protocol"), check_voltage=True, start_low_power=False)
            self._OBD__load_commands()


    async def start(self):
        with self.__lock:
            if not self.is_connected() or len(self.__commands) == 0:
                return

            if self.__loop is None and not self.__running:
                self.__running = True
                self.__loop = await self.sio.start_background_task(self.__watch_loop)


    def stop(self):
        with self.__lock:
            if self.__running:
                self.__running = False
                self.__loop = None


    def unwatch_all(self, client_id):
        with self.__lock:
            for c in list(self.__commands):
                self.unwatch_command(c, client_id)


    def watch_command(self, c: obd.OBDCommand, callback: tuple, client_id: str, force=False):
        with self.__lock:
            if self.__running:
                return
           
            if not force and not self.test_cmd(c):
                # self.test_cmd() will print warnings
                return

            # new command being watched, store the command
            if c not in self.__commands:
                self.__commands[c] = obd.OBDResponse()  # give it an initial value

            match callback:
                case (callback, None):
                    pass
                case (None, async_callback):
                    self.__async_callbacks[c][client_id] = async_callback
                case (a, b):
                    raise Exception("Cannot specifiy both sync/async callbacks")
                case _:
                    raise Exception("Neither a syncronous or async callback were specified to watch.")


    def unwatch_command(self, c: obd.OBDCommand, client_id: tuple):
        with self.__lock:
            if self.__running:
                return
            if c in self.__commands:
                match client_id:
                    case (cid, None):
                        pass
                    case (None, cid):
                        if cid in self.__async_callbacks[c]:
                            self.__async_callbacks[c].pop(cid)
                    case (a, b):
                        raise Exception("Cannot specifiy both sync/async callbacks")
                    case _:
                        raise Exception("Neither a syncronous or async callback were specified to unwatch.")

                if len(self.__async_callbacks[c]) == 0 and len(self.__callbacks[c]) == 0:
                    self.__commands.pop(c)
                        

    async def __watch_loop(self):
        while self.__running:
            if len(self.__commands) > 0:
                # loop over the requested commands, send, and collect the response
                for c in list(self.__commands):
                    if not self.is_connected():
                        # logger.info("Async thread terminated because device disconnected")
                        self.stop()
                        return

                    # force, since commands are checked for support in watch()
                    r = self.query(c, force=True)

                    # check empty response or if valus has changed
                    if r.is_null() or self.__commands[c].value == r.value:
                        continue

                    # store the response
                    self.__commands[c] = r

                    # # fire the callbacks, if there are any
                    for callback in list(self.__callbacks[c].values()):
                        callback(r)
                    for callback in list(self.__async_callbacks[c].values()):
                        await callback(r)
                        
                await self.sio.sleep(self.config.delay)

            else:
                await self.sio.sleep(0.25)  # idle


    def __register_events(self, sio):

        @sio.event
        async def disconnect(sid):
            self.stop()
            self.unwatch_all((None, sid))
            await self.start()

        @sio.event
        async def watch(sid, commands):
            self.stop()
            for cmd in commands:
                if obd.commands.has_name(cmd):

                    async def sid_emit(r):
                        await sio.emit("watching", r, to=sid)

                    self.watch_command(obd.commands[cmd], (None, sid_emit), sid)
                    
            await self.start()

        
        @sio.event
        async def unwatch(sid, commands):
            self.stop()
            for cmd in commands:
                if obd.commands.has_name(cmd):
                    self.unwatch_command(obd.commands[cmd], (None, sid))

            await self.start()


        @sio.event
        async def unwatch_all(sid):
            self.stop()
            self.unwatch_all((None, sid))
            await self.start()
        
        
        @sio.event
        async def status(sid):
            await sio.emit('status', self.status(), room=sid)


        @sio.event
        async def is_connected(sid):
            await sio.emit('is_connected', self.is_connected(), room=sid)


        @sio.event
        async def port_name(sid):
            await sio.emit('port_name', self.port_name(), room=sid)


        @sio.event
        async def supports(sid, cmd):
            if obd.commands.has_name(cmd):
                await sio.emit('supports', self.supports(obd.commands[cmd]), room=sid)
            else:
                await sio.emit('supports', False, room=sid)


        @sio.event
        async def protocol_id(sid):
            await sio.emit('protocol_id', self.protocol_id(), room=sid)


        @sio.event
        async def protocol_name(sid):
            await sio.emit('protocol_name', self.protocol_name(), room=sid)


        @sio.event
        async def supported_commands(sid):
            await sio.emit('supported_commands', self.supported_commands, room=sid)


        @sio.event
        async def query(sid, cmd):
            if obd.commands.has_name(cmd):
                self.stop()
                await sio.emit('query', self.query(obd.commands[cmd]), room=sid)
                await self.start()
            else:
                await sio.emit('query', None, room=sid)


        @sio.event
        async def has_name(sid, name):
            await sio.emit('has_name', obd.commands.has_name(name), room=sid)


        @sio.event
        async def close(sid):
            self.stop()
            self.close()
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
        async def clear_dtc(sid):
            self.stop()
            res = self.query(obd.commands['CLEAR_DTC'])
            await self.start()
            return res


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
        async def connect_obd(sid, portstr=None):
            self.connect(portstr)  
            await sio.emit("connect_obd", self.is_connected())


        @sio.event
        async def start_emulator(sid):
            if self.__emulator is None:
                self.__emulator = elm.Elm()
                threading.Thread(target=self.__emulator.run, daemon=True).start()
                await sio.emit('emulator_port', self.__emulator.get_pty())


        @sio.event
        async def stop_emulator(sid):
            if not self.__emulator is None:
                self.__emulator.terminate()
                self.__emulator = None
                await sio.emit('stop_emulator')
            

        @sio.event
        async def kill(sid):
            sys.exit(0)