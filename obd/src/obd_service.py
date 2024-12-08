import os
import obd
import elm
import signal
import threading

from collections import defaultdict

from .response_callback import ResponseCallback
from .configuration_service import ConfigurationService
from .logger import register_logger
from .unit_systems import imperial

class OBDService():

    def __init__(self, sio, config):
        register_logger(obd.__name__, config.settings["connection"]["log_level"], file_logger=True)

        self.__register_events(sio)

        self.sio = sio
        self.__emulator = None
        self.__lock = threading.RLock()
        self.config: ConfigurationService = config

        self.__loop = None
        self.__commands = defaultdict(obd.OBDResponse)   # key = OBDCommand, value = Response
        self.__callbacks = defaultdict(dict)  # key = OBDCommand, value = list of Functions
        self.__is_running = threading.Event()
        self.__is_connecting_now = threading.Event()
        self.connection = obd.OBD("fake")


    def connect(self, portstr):
        with self.__lock:
            if self.connection.is_connected() or self.__is_connecting_now.is_set():
                return
            
            if portstr is None:
                params = self.config.load_connection_params()
            else:
                params = { "portstr": portstr }

            self.__is_connecting_now.set()
            attempts = 0
            connected = False
            while not connected and attempts < 2:    
                self.connection = obd.OBD(params.get("portstr"), params.get("baudrate"), params.get("protocol"), check_voltage=True, start_low_power=False)
                connected = self.connection.is_connected()
                attempts += 1

            self.__is_connecting_now.clear()


    def disconnect(self):
        self.connection.close()


    async def start(self):
        with self.__lock:
            if not self.connection.is_connected() or len(self.__commands) == 0:
                return

            if self.__loop is None and not self.__is_running.is_set():
                self.__is_running.set()
                self.__loop = await self.sio.start_background_task(self.__watch_loop)


    def stop(self):
        with self.__lock:
            if self.__is_running.is_set():
                self.__is_running.clear()
                self.__loop = None


    def unwatch_all(self, client_id: str):
        with self.__lock:
            for c in list(self.__commands):
                self.unwatch_command(c, client_id)


    def watch_command(self, c: obd.OBDCommand, callback: ResponseCallback, force=False):
        with self.__lock:
            if self.__is_running.is_set():
                raise Exception("watch_command called while loop is running.")
            
            if not self.connection.is_connected():
                self.connect(None)
           
            if not force and not self.connection.test_cmd(c):
                # self.test_cmd() will print warnings
                return

            # new command being watched, store the command
            if c not in self.__commands:
                self.__commands[c] = obd.OBDResponse()  # give it an initial value

            if callback not in self.__callbacks[c]:
                self.__callbacks[c][callback.client_id] = callback


    def unwatch_command(self, c: obd.OBDCommand, client_id: str):
        with self.__lock:
            if self.__is_running.is_set():
                return
            if c in self.__commands and client_id in self.__callbacks[c]:
                self.__callbacks[c].pop(client_id)

                if len(self.__callbacks[c]) == 0:
                    self.__commands.pop(c)
                        

    async def __watch_loop(self):
        self.__is_running.wait()
        while self.__is_running.is_set():
            if len(self.__commands) > 0:
                # loop over the requested commands, send, and collect the response
                for c in list(self.__commands):
                    # force, since commands are checked for support in watch()
                    r = self.connection.query(c, force=True)

                    # check empty response
                    if r.is_null():
                        continue

                    if self.config.use_imperial_units and (r.command.mode == 1 or 2):
                        r = imperial.convert(r)

                    # check if value has changed
                    if self.__commands[c].value == r.value:
                        continue

                    # store the response
                    self.__commands[c] = r

                    # fire the callbacks, if there are any
                    for callback in list(self.__callbacks[c].values()):
                        await callback.run(r)
                        
                await self.sio.sleep(self.config.delay)

            else:
                await self.sio.sleep(0.25)  # idle


    def __register_events(self, sio):

        @sio.event
        async def disconnect(sid):
            self.stop()
            self.unwatch_all((None, sid))

        @sio.event
        async def watch(sid, commands):
            self.stop()
            for cmd in commands:
                if cmd is not None and obd.commands.has_name(cmd):

                    async def sid_emit(r):
                        await sio.emit("watching", r, to=sid)

                    self.watch_command(obd.commands[cmd], ResponseCallback(sid, sid_emit, is_async=True))
                    
            await self.start()

        
        @sio.event
        async def unwatch(sid, commands):
            self.stop()
            for cmd in commands:
                if cmd is not None and obd.commands.has_name(cmd):
                    self.unwatch_command(obd.commands[cmd], sid)

            await self.start()


        @sio.event
        async def unwatch_all(sid):
            self.stop()
            self.unwatch_all(sid)
            await self.start()
        
        
        @sio.event
        async def status(sid):
            await sio.emit('status', self.connection.status(), room=sid)


        @sio.event
        async def is_connected(sid):
            await sio.emit('is_connected', self.connection.is_connected(), room=sid)


        @sio.event
        async def port_name(sid):
            await sio.emit('port_name', self.connection.port_name(), room=sid)


        @sio.event
        async def supports(sid, cmd):
            if obd.commands.has_name(cmd):
                await sio.emit('supports', self.connection.supports(obd.commands[cmd]), room=sid)
            else:
                await sio.emit('supports', False, room=sid)


        @sio.event
        async def protocol_id(sid):
            await sio.emit('protocol_id', self.connection.protocol_id(), room=sid)


        @sio.event
        async def protocol_name(sid):
            await sio.emit('protocol_name', self.connection.protocol_name(), room=sid)


        @sio.event
        async def supported_commands(sid):
            await sio.emit('supported_commands', self.connection.supported_commands, room=sid)


        @sio.event
        async def query(sid, cmd):
            if obd.commands.has_name(cmd):
                self.stop()
                await sio.emit('query', self.connection.query(obd.commands[cmd]), room=sid)
                await self.start()
            else:
                await sio.emit('query', None, room=sid)


        @sio.event
        async def has_name(sid, name):
            await sio.emit('has_name', obd.commands.has_name(name), room=sid)


        @sio.event
        async def close(sid):
            self.stop()
            self.connection.close()
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
            res = self.connection.query(obd.commands['CLEAR_DTC'])
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
            await sio.emit("connect_obd", self.connection.is_connected())


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
            os.kill(os.getpid(), signal.SIGTERM)