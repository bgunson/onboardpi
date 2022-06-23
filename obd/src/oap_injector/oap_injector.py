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
import signal
import time

MAX_CONNECT_ATTEMPTS = 5

class EventHandler(ClientEventHandler):

    def __init__(self, logger):
        self.__active = threading.Event()
        self.logger = logger
        signal.signal(signal.SIGINT, self.deactivate)
        signal.signal(signal.SIGTERM, self.deactivate)
    
    def on_hello_response(self, client, message):
        self.logger.info("Received hello response, result: {}, oap version: {}.{}, api version: {}.{}"
            .format(message.result, message.oap_version.major,
                    message.oap_version.minor, message.api_version.major,
                    message.api_version.minor))
        self.__active.set()
        threading.Thread(target=self.wait, args=(client, ), daemon=True).start()

    def deactivate(self, *args):
        self.__active.clear()

    def is_active(self):
        return self.__active.is_set()

    def wait(self, client):
        self.logger.debug("OAP Injector started receiving thread daemon")
        can_continue = True
        while can_continue and self.__active.is_set():
            can_continue = client.wait_for_message()

        # API said bye-bye or user disabled injector
        self.__active.clear()
        self.logger.debug("OAP Injector reveiving thread is no longer active")

class OAPInjector(Injector, Client):

    def __init__(self, logger, *args, **kwargs):
        Client.__init__(self, "OnBoardPi OBD Injector")
        self.logger = logger       
        self.logger.info("======================================================")
        self.logger.info("Initializing an OpenAuto Pro injector.")
        self.set_event_handler(EventHandler(self.logger))
        self._oap_api_port = self.__parse_oap_api_port()
        self.__init_cmds()
        self.__oap_inject = ObdInjectGaugeFormulaValue()  


    def start(self, connect_callback):
        connection_attempts = 0
        if self._connected:
            self.stop()
        host = os.environ.get("OAP_HOST", "127.0.0.1")
        self.logger.info("Attempting to connect to the OAP protobuf API at {}:{}".format(host, self._oap_api_port))
        while not self._connected and connection_attempts < MAX_CONNECT_ATTEMPTS:
            try:
                self.connect(host, self._oap_api_port)
                connect_callback(self)
            except Exception as e:
                self.logger.error("OAP Injector error on start: {}".format(e))
                connection_attempts += 1


    def stop(self):
        self.logger.info("Disconnecting OAP Injector")
        self.logger.info("======================================================")
        self._event_handler.deactivate()
        self.disconnect()


    def status(self):
        return {
            'connected': self._connected,
            'active': self._event_handler.is_active(),
        }

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
                # Check if the command is a base command, fallback to none
                cmd = next(filter(lambda c: c.command == query.encode(), obd.commands.base_commands()), None)
            
            if cmd is not None and hasattr(cmd, 'name'):
                self.__commands.append(cmd.name)
            else:
                self.__commands.append(None)

        self.logger.info("OAP injector commands are: {}".format(self.__commands))


    def get_commands(self):
        """ Give the list of OAP commands by name """
        return self.__commands


    def inject(self, obd_response):
        """ Inject obd reponse to the openauto API. """
        if obd_response.is_null() or not self._event_handler.is_active():
            return 
        try:
            self.__oap_inject.formula = "getPidValue({})".format(self.__commands.index(obd_response.command.name))      # may raise a ValueError
            self.__oap_inject.value = obd_response.value.magnitude                                                      # may raise a KeyError
            self.logger.info("Injecting value: {} to PID: {} ({})".format(self.__oap_inject.value, self.__oap_inject.formula, obd_response.command.name))
            self.send(MESSAGE_OBD_INJECT_GAUGE_FORMULA_VALUE, 0, self.__oap_inject.SerializeToString())
        except ValueError:
            # This OBD response is for a command not needed by OAP. i.e. the obd_response.command is not contained in self.__commands
            pass
        except KeyError:
            # Non-numeric response from trying to grab the magnitude. i.e. the obd_reponse is for an O2 sensor or similar w/ a non-primitive value
            # which does not have a Pint magnitude so we are not interested since OAP only needs numeric values for its gauges(? only assuming since thats all I've seen)
            pass
        except Exception as e:
            self.logger.error("OAP Injector error on inject: {}".format(e))
 