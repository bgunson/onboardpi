"""
    Adapted from https://github.com/bluewave-studio/openauto-pro-api/blob/main/api_examples/python/ObdInject.py#L2

    The OAPInjector passes OBD values from python-OBD to OpenAuto Pro via its protobuf API

"""
import time
import common.Api_pb2 as oap_api
from common.Client import Client, ClientEventHandler

class OAPInjector():

    def __init__(self):
        pass

    def inject_values(self, obd_values):
        """
            Inject obd values to the openauto API. This is called in the servers4's backgrdound watch emit loop.
        """
        pass