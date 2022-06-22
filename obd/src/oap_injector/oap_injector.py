"""
    Adapted from https://github.com/bluewave-studio/openauto-pro-api/blob/main/api_examples/python/ObdInject.py#L2

    The OAPInjector passes OBD values from python-OBD to OpenAuto Pro via its protobuf API

"""
from src.injector import Injector
from .Api_pb2 import ObdInjectGaugeFormulaValue, MESSAGE_OBD_INJECT_GAUGE_FORMULA_VALUE
from .Client import Client
import configparser
import os
import obd
import threading
import signal

MAX_CONNECT_ATTEMPTS = 5

class OAPInjector(Injector, Client):

    def __init__(self, logger, *args, **kwargs):
        Client.__init__(self, "OnBoardPi OBD Injector")
        self.logger = logger       
        self.logger.info("======================================================")
        self.logger.info("Initializing an OpenAuto Pro injector.")
        self._oap_api_port = self.__parse_oap_api_port()
        self.__init_cmds()
        self.logger.info("OAP injector commands are: {}".format(self.__commands))
        self.__active = threading.Event()
        self.__oap_inject = ObdInjectGaugeFormulaValue()  
        signal.signal(signal.SIGINT, self.stop)
        signal.signal(signal.SIGTERM, self.stop)
        self.__error = None  

    def start(self, connect_callback):
        connection_attempts = 0
        if self.__active.is_set():
            self.stop()
        host = os.environ.get("OAP_HOST", "127.0.0.1")
        while not self._connected and connection_attempts < MAX_CONNECT_ATTEMPTS:
            self.logger.info("Attempting to connect to the OAP protobuf API at {}:{}".format(host, self._oap_api_port))
            try:
                self.connect(host, self._oap_api_port)
                self.__active.set()
                self.__wait_thread = threading.Thread(target=self.__wait, daemon=True)
                self.__wait_thread.start()
                connect_callback(self)
            except Exception as e:
                self.logger.error("OAP Injector error on start: {}".format(e))
                self.__error = e
                connection_attempts += 1

    def stop(self, *args):
        self.logger.info("Disconnecting OAP Injector")
        self.logger.info("======================================================")
        self.__active.clear()
        self.disconnect()

    def status(self):
        return {
            'connected': self._connected,
            'active': self.__active.is_set(),
            'error': str(self.__error)
        }

    def __parse_oap_api_port(self):
        """ 
        We can try to determine the OpenAuto Pro API port from the opanauto_system config file. This file may not exist if the user has not altered 
        any settings in the OpenAuto GUI so in that case assume the port is 44405.
        """
        config = configparser.ConfigParser()
        oap_sys_conf_path = os.path.join(os.path.join(os.environ.get('OAP_CONFIG_DIR', "/home/pi/.openauto/config"), "openauto_system.ini"))
        config.read(oap_sys_conf_path)
        try:
            return int(config['Api']['EndpointListenPort'])
        except KeyError:
            # Default as defined by BlueWave Studio
            return 44405

    def __wait(self):
        while self.__active:
            try:
                self.wait_for_message()
            except Exception:
                continue

    def __init_cmds(self):
        """
        Parse the OAP PID configuration file and construct a list of python-OBD OBDCommands which 
        correspond to the OpenAuto pids in the order they appear in the file.
        """
        pid_config_path = os.path.join(os.environ.get('OAP_CONFIG_DIR', "/home/pi/.openauto/config"), "openauto_obd_pids.ini")
        config = configparser.ConfigParser()
        config.read(pid_config_path)
        
        self.__commands = []

        try:
            num_pids = int(config['ObdPids']['Count'])
            for i in range(num_pids):
                query = config['ObdPid_{}'.format(i)]['Query']
                mode = int(query[:2])   
                pid = int(query[2:], 16)    # pid in decimal        
                cmd = obd.commands[mode][pid]   # get the PID as OBDCommand object
                self.__commands.append(cmd.name)
        except KeyError:
            # This pid 'Query' is not defined by (python-)OBD. We still need something at this index though
            # since we are injecting based on index from the oap pid config.
            self.__commands.append(None)


    def get_commands(self):
        """ Give the list of OAP commands by name """
        return self.__commands

    def inject(self, obd_response):
        """ Inject obd reponse to the openauto API. """
        if not self.__active.is_set():
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
            self.__error = e
