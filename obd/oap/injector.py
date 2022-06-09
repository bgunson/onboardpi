"""
    Adapted from https://github.com/bluewave-studio/openauto-pro-api/blob/main/api_examples/python/ObdInject.py#L2

    The OAPInjector passes OBD values from python-OBD to OpenAuto Pro via its protobuf API

"""
import oap.Api_pb2 as oap_api
from oap.Client import Client, ClientEventHandler
import configparser
import os
import obd

class OAPInjector():

    def __init__(self):
        self.commands = self.get_oap_cmds()

    def get_oap_cmds(self):
        """
        Parse the OAP PID configuration file and construct a list of python-OBD OBDCommands which 
        correspond to the OpenAuto pids in the order they appear in the file.
        """
        config = configparser.ConfigParser()
        config.read(os.environ.get('OAP_PID_CONFIG_PATH', '/home/pi/.openauto/config/openauto_obd_pids.in'))
        
        num_pids = int(config['ObdPids']['Count'])
        obd_commands = []

        for i in range(num_pids):
            query = config['ObdPid_' + str(i)]['Query']
            mode = int(query[:2])   
            pid = int(query[2:], 16)    # pid in decimal

            try:
                cmd = obd.commands[mode][pid]   # get the PID as OBDCommand object
                obd_commands.append(cmd)
            except KeyError:
                # This pid 'Query' is not defined by (python-)OBD
                obd_commands.append(None)

        # print(pids)
        return obd_commands

    def inject_values(self, obd_values):
        """
            Inject obd values to the openauto API. This is called in the servers4's backgrdound watch emit loop.
        """
        pass