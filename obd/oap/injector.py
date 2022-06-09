"""
    Adapted from https://github.com/bluewave-studio/openauto-pro-api/blob/main/api_examples/python/ObdInject.py#L2

    The OAPInjector passes OBD values from python-OBD to OpenAuto Pro via its protobuf API

"""
import oap.common.Api_pb2 as oap_api
from oap.common.Client import Client, ClientEventHandler
import configparser
import os
import obd

can_inject = False

class OAPInjector():

    def __init__(self):
        self.__client = Client("OnBoardPi OBD Injector")
        event_handler = EventHandler()
        self.__client.set_event_handler(event_handler)

        if os.environ.get('APP_ENV', '') == "production":
            self.__client.connect('127.0.0.1', 44405)
        
        self.commands = self.get_oap_cmds()
        self.__oap_inject = oap_api.ObdInjectGaugeFormulaValue()


    def get_oap_cmds(self):
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
        obd_commands = []

        for i in range(num_pids):
            query = config['ObdPid_{}'.format(i)]['Query']
            mode = int(query[:2])   
            pid = int(query[2:], 16)    # pid in decimal

            try:
                cmd = obd.commands[mode][pid]   # get the PID as OBDCommand object
                obd_commands.append(cmd)
            except KeyError:
                # This pid 'Query' is not defined by (python-)OBD
                obd_commands.append(None)

        print("Read OpenAUto Pro OBD PID configuration and resulted in the following OBDCOmmands:")
        print(obd_commands)
        return obd_commands

    def inject_values(self, obd_values):
        """
            Inject obd values to the openauto API. This is called in the servers4's backgrdound watch emit loop.
        """
        global can_inject
        if can_inject == False:
            return

        for i, cmd in enumerate(self.commands):
            self.__oap_inject.formula = "getPidValue({})".format(i)

            if cmd is not None:
                try:
                    self.__oap_inject.value = obd_values[cmd.name]['value']['magnitude']
                    self.__client.send(oap_api.MESSAGE_OBD_INJECT_GAUGE_FORMULA_VALUE, 0,
                            obd_inject.SerializeToString())
                except KeyError:
                    # Command was not returned by python-OBD so is not supported, or
                    # the value is not numeric (no magnitude) so do not send
                    continue


class EventHandler(ClientEventHandler):

    def on_hello_response(self, client, message):
        print(
            "received hello response, result: {}, oap version: {}.{}, api version: {}.{}"
            .format(message.result, message.oap_version.major,
                    message.oap_version.minor, message.api_version.major,
                    message.api_version.minor))
        global can_inject
        can_inject = True