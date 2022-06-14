"""
    Adapted from https://github.com/bluewave-studio/openauto-pro-api/blob/main/api_examples/python/ObdInject.py#L2

    The OAPInjector passes OBD values from python-OBD to OpenAuto Pro via its protobuf API

"""
from ..injector import Injector
import src.injectors.oap.Api_pb2 as oap_api
from src.injectors.oap.Client import Client, ClientEventHandler
import configparser
import os
import obd
import threading
import signal

MAX_CONNECT_ATTEMPTS = 5

class OAPInjector(Injector):

    def __init__(self, host="127.0.0.1", port=44405):
        print("Initializing an OpenAuto Pro injector.")
        self.__host = host
        self.__port = port
        self.__init_cmds()
        self.__client = Client("OnBoardPi OBD Injector")
        self.__active = threading.Event()
        self.__oap_inject = None    

    def start(self):
        connection_attempts = 0
        if self.__active.is_set():
            self.stop()
        while not self.__client._connected and connection_attempts < MAX_CONNECT_ATTEMPTS:
            print("Attempting to connect to the OAP API")
            try:
                self.__client.connect(self.__host, self.__port)
                self.__oap_inject = oap_api.ObdInjectGaugeFormulaValue()
                self.__active.set()
                self.__wait_thread = threading.Thread(target=self.__wait, args=(self.__client, ), daemon=True)
                self.__wait_thread.start()
                signal.signal(signal.SIGINT, self.stop)
                signal.signal(signal.SIGTERM, self.stop)
            except Exception as e:
                print("OAP Injector error on start:", e)
                self.__error = e
                connection_attempts += 1

    def stop(self, *args):
        self.__oap_inject = None
        self.__active.clear()
        self.__client.disconnect()

    def status(self):
        return {
            'connected': self.__client._connected,
            'error': self.__error
        }

    def __wait(self, client):
        while self.__active:
            client.wait_for_message()

    def __init_cmds(self):
        """
        Parse the OAP PID configuration file and construct a list of python-OBD OBDCommands which 
        correspond to the OpenAuto pids in the order they appear in the file.
        """
        pid_config_path = os.path.join(os.environ.get('OAP_CONFIG_DIR', "/home/pi/.openauto/config"), "openauto_obd_pids.ini")
        if not os.path.isfile(pid_config_path):
            print("Could not load OAP PID configuration file located at '{}'".format(pid_config_path))
            return []

        config = configparser.ConfigParser()
        config.read(pid_config_path)
        
        num_pids = int(config['ObdPids']['Count'])
        self.__commands = []

        for i in range(num_pids):
            query = config['ObdPid_{}'.format(i)]['Query']
            mode = int(query[:2])   
            pid = int(query[2:], 16)    # pid in decimal

            try:
                cmd = obd.commands[mode][pid]   # get the PID as OBDCommand object
                self.__commands.append(cmd.name)
            except KeyError:
                # This pid 'Query' is not defined by (python-)OBD. We still need something at this index though
                # since we are injecting based on index from the oap pid config.
                self.__commands.append(None)

        return self.__commands

    def get_commands(self):
        """ Give the list of OAP commands by name """
        return self.__commands

    def inject(self, obd_response):
        """
            Inject obd reponse to the openauto API.
        """
        if self.__oap_inject is None:
            return 
        try:
            self.__oap_inject.formula = "getPidValue({})".format(self.__commands.index(obd_response.command.name))      # may raise a ValueError
            self.__oap_inject.value = obd_response.value.magnitude                                                      # may raise a KeyError
            self.__client.send(oap_api.MESSAGE_OBD_INJECT_GAUGE_FORMULA_VALUE, 0,
                            self.__oap_inject.SerializeToString())
        except ValueError:
            # This OBD response is for a command not needed by OAP. i.e. the obd_response.command is not contained in self.__commands
            pass
        except KeyError:
            # Non-numeric response from trying to grab the magnitude. i.e. the obd_reponse is for an O2 sensor or similar w/ a non-primitive value
            # which does not have a Pint magnitude so we are not interested since OAP only needs numeric values for its gauges(? only assuming since thats all I've seen)
            pass
