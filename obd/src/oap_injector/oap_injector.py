"""
    Adapted from https://github.com/bluewave-studio/openauto-pro-api/blob/main/api_examples/python/ObdInject.py#L2

    The OAPInjector passes OBD values from python-OBD to OpenAuto Pro via its protobuf API

"""
from src.injector import Injector
from .Api_pb2 import ObdInjectGaugeFormulaValue, MESSAGE_OBD_INJECT_GAUGE_FORMULA_VALUE
from .Client import Client, ClientEventHandler
import configparser
import os
import obd
import threading
import time
import struct

MAX_CONNECT_ATTEMPTS = 5


class OAPInjector(Injector, Client):

    enabled = True

    def __init__(self, logger, connect_callback=None, *args, **kwargs):
        Client.__init__(self, "OnBoardPi OBD Injector")

        self.connect_callback = connect_callback

        self.logger = logger       
        self.logger.info("======================================================")
        self.logger.info("Initializing an OpenAuto Pro injector.")

        self.__init_cmds()

        self.set_event_handler(self)

        self._oap_api_port = self.__parse_oap_api_port()
        self.__oap_inject = ObdInjectGaugeFormulaValue()
        self.__connection_attempts = 0
        self.__active = threading.Event()


    def on_hello_response(self, client, message):
        self.logger.info("Received hello response, result: {}, oap version: {}.{}, api version: {}.{}"
            .format(message.result, message.oap_version.major,
                    message.oap_version.minor, message.api_version.major,
                    message.api_version.minor))
        # Receiving this message indicates the API is ready for injection
        self.__active.set() 


    def start(self):
        if not self.enabled:
            return
        try:
            self.__connect_attempt()
        except Exception as e:
            self.logger.error("OAP injector error on start: {}".format(e))
            self.__connection_attempts += 1
            threading.Thread(target=self.start, daemon=True).start()

        if self._connected:
            self.logger.info("Starting OAP injector")
            threading.Thread(target=self.__listen, daemon=True).start()
            if self.connect_callback is not None:
                self.connect_callback(self)
            
    
    def __connect_attempt(self):
        """ Attempt to connect to the API, ran on another thread with larger intervals as unsuccessful attempts persist """
        time.sleep(self.__connection_attempts * 0.25)
        if not self.enabled:
            # If user disabled injector between delay and actual attempt
            return
        host = os.environ.get("OAP_HOST", "127.0.0.1")
        self.logger.info("Attempt {} to connect to the OAP protobuf API at {}:{}".format(self.__connection_attempts+1, host, self._oap_api_port))
        self.connect(host, self._oap_api_port)


    def stop(self):
        self.logger.info("Stopping OAP injector")
        self.logger.info("======================================================")
        self.__active.clear()
        self.enabled = False
        self.disconnect()
        self.__connection_attempts = 0


    def status(self):
        return {
            'connected': self._connected,
            'active': self.__active.is_set(),
        }


    def get_commands(self):
        """ Give the list of OAP commands by name """
        return self.__commands


    def inject(self, obd_response):
        """ Inject obd reponse to the openauto API. """
        if obd_response.is_null() or not self.__active.is_set():
            return 
        try:
            cmd_index = self.__commands.index(obd_response.command.name)        # The index of the command as defined in the openauto config file, may raise a ValueError
            self.__oap_inject.formula = "getPidValue({})".format(cmd_index)      
            self.__oap_inject.value = obd_response.value.magnitude                                                      # may raise a KeyError
            self.logger.info("Injecting value: {} to PID: {} ({})".format(self.__oap_inject.value, obd_response.command.name, cmd_index))
            self.send(MESSAGE_OBD_INJECT_GAUGE_FORMULA_VALUE, 0, self.__oap_inject.SerializeToString())
        except ValueError:
            # This OBD response is for a command not needed by OAP. i.e. the obd_response.command is not contained in self.__commands
            pass
        except KeyError:
            # Non-numeric response from trying to grab the magnitude. i.e. the obd_reponse is for an O2 sensor or similar w/ a non-primitive value
            # which does not have a Pint magnitude so we are not interested since OAP only needs numeric values for its gauges(? only assuming since thats all I've seen)
            pass
        except Exception as e:
            self.logger.error("OAP injector error on inject: {}".format(e))


    def __listen(self):
        """ 
        On another thread listen for messages from OAP API which may indicate it has gone offline or there is an unpacking error which can lead to a broken pipe. 
        If the listening thread breaks out of its loop then deactivate any subsequent injection and try to restart
        """
        self.logger.debug("OAP injector started receiving thread daemon")
        can_continue = True
        while can_continue:
            try:
                can_continue = self.wait_for_message()
            except struct.error:
                # This happens when client disconnects while trying to receivce, user disabled injector 
                can_continue = False

        # API said bye-bye or user disabled injector
        self.logger.debug("OAP injector reveiving thread is no longer active")
        self.__active.clear()
        self.start()

    def __parse_oap_api_port(self):
        """ 
        We can try to determine the OpenAuto Pro API port from the opanauto_system config file. This file may not exist if the user has not altered 
        any settings in the OpenAuto GUI so in that case assume the port is 44405.
        """
        config = configparser.ConfigParser()
        oap_sys_conf_path = os.path.join(os.path.join(os.environ.get('OAP_CONFIG_DIR', "/home/pi/.openauto/config"), "openauto_system.ini"))
        config.read(oap_sys_conf_path)
        return config.getint('Api', 'EndpointListenPort', fallback=44405)


    def __init_cmds(self):
        """
        Parse the OAP PID configuration file and construct a list of python-OBD OBDCommands which 
        correspond to the OpenAuto pids in the order they appear in the file.
        """
        pid_config_path = os.path.join(os.environ.get('OAP_CONFIG_DIR', "/home/pi/.openauto/config"), "openauto_obd_pids.ini")
        config = configparser.ConfigParser()
        config.read(pid_config_path)
        
        self.__commands = []

        num_pids = config.getint('ObdPids', 'Count', fallback=0)
        for i in range(num_pids):
            query = config.get('ObdPid_{}'.format(i), 'Query', fallback=None)

            if query is None:
                self.__commands.append(None)
                continue

            # Try to parse the PID from the openauto config
            try:    
                mode = int(query[:2])   
                pid = int(query[2:], 16)    # pid in decimal

                if mode < 0 or mode > 9:
                    # This pid is not part of a valid mode
                    raise ValueError
                if pid > len(obd.commands[mode]):
                    # This pid is not contained in the mode
                    raise ValueError

                cmd = obd.commands[mode][pid]
            except ValueError:
                # Check if the command is a base command such as ELM_VOLTAGE whose query is b'ATRV' (cannot be indexed from obd.commands), fallback to none
                cmd = next(filter(lambda c: c.command == query.encode(), obd.commands.base_commands()), None)
            
            if cmd is not None and hasattr(cmd, 'name'):
                self.__commands.append(cmd.name)
            else:
                self.logger.warning("OAP injector could not determine a valid OBD command for ObdPid_{} with query: {}".format(i, query))
                self.__commands.append(None)

        self.logger.info("OAP injector commands are: {}".format(self.__commands))
 