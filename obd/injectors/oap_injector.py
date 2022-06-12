"""
    Adapted from https://github.com/bluewave-studio/openauto-pro-api/blob/main/api_examples/python/ObdInject.py#L2

    The OAPInjector passes OBD values from python-OBD to OpenAuto Pro via its protobuf API

"""
from .injector import Injector
import injectors.oap.Api_pb2 as oap_api
from injectors.oap.Client import Client, ClientEventHandler
import configparser
import os
import obd
import threading
import signal

class OAPInjector(Injector):

    def __init__(self):
        print("Initializing an OpenAuto Pro injector.")
        self.__init_cmds()
        self.__client = Client("OnBoardPi OBD Injector")
        self.__oap_inject = oap_api.ObdInjectGaugeFormulaValue()
        self.__active = threading.Event()

    def start(self):
        if self.__active.is_set():
            self.stop()
        self.__client.connect('127.0.0.1', 44405)
        self.__active.set()
        self.__wait_thread = threading.Thread(target=self.__wait, args=(self.__client, ), daemon=True)
        self.__wait_thread.start()
        signal.signal(signal.SIGINT, self.stop)
        signal.signal(signal.SIGTERM, self.stop)

    def stop(self, *args):
        self.__active.clear()
        self.__client.disconnect()

    def __wait(self, client):
        while self.__active:
            client.wait_for_message()

    def __init_cmds(self):
        """
        Parse the OAP PID configuration file and construct a list of python-OBD OBDCommands which 
        correspond to the OpenAuto pids in the order they appear in the file.
        """
        config_path = os.environ.get('OAP_PID_CONFIG_PATH', '/home/pi/.openauto/config/openauto_obd_pids.ini')
        if not os.path.isfile(config_path):
            print("Could not load OAP PID configuration file located at '{}'".format(config_path))
            return []

        config = configparser.ConfigParser()
        config.read(config_path)
        
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
        try:
            self.__oap_inject.formula = "getPidValue({})".format(self.__commands.index(obd_response.command.name))
            self.__oap_inject.value = obd_response.value.magnitude
            self.__client.send(oap_api.MESSAGE_OBD_INJECT_GAUGE_FORMULA_VALUE, 0,
                            self.__oap_inject.SerializeToString())
        except ValueError:
            # This OBD response is form a command not needed by OAP
            pass
        except KeyError:
            # Non-numeric response from trying to grab the magnitude
            pass
