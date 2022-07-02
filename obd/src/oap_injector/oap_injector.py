"""
    Adapted from https://github.com/bluewave-studio/openauto-pro-api/blob/main/api_examples/python/ObdInject.py#L2

    The OAPInjector passes OBD values from python-OBD to OpenAuto Pro via its protobuf API

"""
from .oap_event_handler import OAPEventHandler
from .Message import Message
from src.injector import Injector
from .Api_pb2 import ObdInjectGaugeFormulaValue, MESSAGE_OBD_INJECT_GAUGE_FORMULA_VALUE, MESSAGE_BYEBYE
from .Client import Client
import configparser
import os
import obd
import threading
import time

MAX_RESTARTS = 10

class OAPInjector(Injector):

    """Conrols data injection and connection to the OpenAuto Pro protobuf API (obd gauges, notifications, status icon)
    """

    def __init__(self, logger, callback, *args, **kwargs):
        self._client = Client("OnBoardPi OBD Injector")
        self.callback = callback
        self.logger = logger
        self.logger.info(
            "======================================================")
        self.logger.info("Initializing an OpenAuto Pro injector.")

        self.__init_cmds()
        self.event_handler = None
        self._oap_api_port = self.__parse_oap_api_port()
        self.__oap_inject = ObdInjectGaugeFormulaValue()
        self.__connection_attempts = 0
        self.__n_restarts = 0
        self._enabled = threading.Event()
        self._enabled.set()
        self.__init_connection()

    def __init_connection(self):
        """Initiiate a connection interval 
        """
        if not self._enabled.is_set() or self._client.is_connected():
            return
        try:
            self.__connect_attempt()
        except Exception as e:
            self.logger.error("OAP injector error on start (in OAPInjector.__init_connection()): {}".format(e))
            self.__connection_attempts += 1
            threading.Thread(target=self.__init_connection, daemon=True).start()
        else:
            if self._client.is_connected():
                self.event_handler = OAPEventHandler(self._client, self._restart)
                self._client.set_event_handler(self.event_handler)
                self.event_handler.start()
                self.callback('connected', self)

    def __connect_attempt(self):
        """Attempt to connect to the API, ran on another thread with larger intervals as unsuccessful attempts persist
        """
        time.sleep(self.__connection_attempts * 0.25)
        if not self._enabled.is_set():
            # If user disabled injector between delay and actual attempt
            return
        host = os.environ.get("OAP_HOST", "127.0.0.1")
        self.logger.info("Attempting to connect to the OAP protobuf API at {}:{}".format(
            host, self._oap_api_port))
        self._client.connect(host, self._oap_api_port)

    def _restart(self, oap_fault):
        """On OAP event handler failure restart if still enabled and not reached max restart attempts

        Args:
            oap_fault (bool): True if the event handler stopped because of an exception from OAP socket, false otherwise.
        """
        self.logger.info("OAP injector stopped unexpectedly")
        self.__connection_attempts = 0  # reset connection attempts for next try
        self.callback('disconnected', self)
        
        if self._enabled.is_set() and self.__n_restarts < MAX_RESTARTS:
            self.logger.info("OAP injector restarting...")
            self.start()
            if oap_fault == True:
                # Only increment num restarts if the event handler stopped because of oap, not the notifications socketio connection
                self.__n_restarts += 1

        if self.__n_restarts >= MAX_RESTARTS:
            self.logger.info("OAP injector exceeded maxmium number of restarts. Make sure OpenAuto Pro is running and manually disable/enable me")

    def start(self):
        """Start the injector from a disabled state. Not called on __init__, called at some point during runtime usually from an async event 
        """
        self._enabled.set()
        self.logger.debug("OAP injector started by user")
        self.__init_connection()

    def stop(self):
        """Stop and disable the running injection
        """
        self.logger.info("OAP injector stopped by user")
        self.logger.info(
            "======================================================")
        self._enabled.clear()
        self._client.message_queue.put(Message(MESSAGE_BYEBYE, 0, bytes()))

    def status(self):
        """Return the injector's status object

        Returns:
            dict: a dictionary containing connected flag, active flag and list of commands it is injecting
        """
        return {
            'commands': self.__commands,
            'connected': self._client.is_connected(),
            'active': True if self.event_handler is not None and self.event_handler.active.is_set() else False
        }

    def is_enabled(self):
        """Whether the injecotr is currently enabled but not neccesarily active.

        Returns:
            bool: True if enabled, from settings file at start or was anabled from disabled state by user. False otherwise.
        """
        return self._enabled.is_set()

    def get_commands(self):
        """Get the list of OBD command names used by this injector

        Returns:
            list: List of commands in order as defined in `/home/pi/.openauto/config/openauto_obd_pids.ini`. Example: ['RPM', 'SPEED', ...] 
                    Note: some commands may be None if the injector could not cross reference it with python-obd.
        """
        return self.__commands

    def inject(self, obd_response):
        """Inject an obd response value to its OAP gauge

        Args:
            obd_response obd.OBDResponse: The response object returned in python-obd callback
        """
        if obd_response.is_null() or not self._client.is_connected():
            self.logger.debug("OAP injection skipped. OBDResponse is null: {}. injector enabled: {}".format(
                obd_response.is_null(), self.event_handler.active.is_set()))
            return
        try:
            # The index of the command as defined in the openauto config file, may raise a ValueError
            cmd_index = self.__commands.index(obd_response.command.name)
            self.__oap_inject.formula = "getPidValue({})".format(cmd_index)
            # may raise a KeyError
            self.__oap_inject.value = obd_response.value.magnitude
            self.logger.debug("Injecting value: {} to PID: {} ({})".format(
                self.__oap_inject.value, obd_response.command.name, cmd_index))

            msg = Message(MESSAGE_OBD_INJECT_GAUGE_FORMULA_VALUE, 0, self.__oap_inject.SerializeToString())
            self._client.message_queue.put(msg)
            
            # self._client.send(MESSAGE_OBD_INJECT_GAUGE_FORMULA_VALUE,
            #                   0, self.__oap_inject.SerializeToString())
        except ValueError:
            # This OBD response is for a command not needed by OAP. i.e. the obd_response.command is not contained in self.__commands
            pass
        except KeyError:
            # Non-numeric response from trying to grab the magnitude. i.e. the obd_reponse is for an O2 sensor or similar w/ a non-primitive value
            # which does not have a Pint magnitude so we are not interested since OAP only needs numeric values for its gauges(? only assuming since thats all I've seen)
            pass
        except Exception as e:
            self.logger.error("OAP injector error on inject: {}".format(e))

    def __parse_oap_api_port(self):
        """We can try to determine the OpenAuto Pro API port from the opanauto_system config file. This file may not exist if the user has not altered 
        any settings in the OpenAuto GUI so in that case assume the port is 44405.

        Returns:
            int: The API port from the confdig file, or 44405 if not found.
        """
        config = configparser.ConfigParser()
        oap_sys_conf_path = os.path.join(os.path.join(os.environ.get(
            'OAP_CONFIG_DIR', "/home/pi/.openauto/config"), "openauto_system.ini"))
        config.read(oap_sys_conf_path)
        return config.getint('Api', 'EndpointListenPort', fallback=44405)

    def __init_cmds(self):
        """Parse the OAP PID configuration file and construct a list of pythonOBD OBDCommands which 
        correspond to the OpenAuto pids in the order they appear in the file. These are not expected to change at runtime.

        Raises:
            ValueError: When a command from the file is not defined by pythonOBD, but is caught and replaced with None in this injector's command list
        """
        pid_config_path = os.path.join(os.environ.get(
            'OAP_CONFIG_DIR', "/home/pi/.openauto/config"), "openauto_obd_pids.ini")
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
                cmd = next(filter(lambda c: c.command ==
                           query.encode(), obd.commands.base_commands()), None)

            if cmd is not None and hasattr(cmd, 'name'):
                self.__commands.append(cmd.name)
            else:
                self.logger.warning(
                    "OAP injector could not determine a valid OBD command for ObdPid_{} with query: {}".format(i, query))
                self.__commands.append(None)

        self.logger.info(
            "OAP injector commands are: {}".format(self.__commands))