import obd
import json
import obdio
from obd.codes import DTC
import elm

import json
import obd
from obd.OBDResponse import Monitor, Status, StatusTest, MonitorTest
from obd import Unit
from obd.decoders import *
from obd.protocols.protocol import Message, Frame

class OBDEncoder(json.JSONEncoder):
    def get_decoder(*args):
        try:
            return args[1].__name__
        except:
            try:
                return '0x' + hex(args[1].keywords['id_'])[2:].zfill(2)
            except: return None
    """
        A JSON encoder made for python-OBD types.
        Has not been tested on vehicle yet.
    """
    def default(self, o):

        if isinstance(o, StatusTest):
            return {
                'available': o.available,
                'complete': o.complete,
                'name': o.name
            }

        if isinstance(o, MonitorTest):
            return {
                'tid': o.tid,
                'name': o.name,
                'desc': o.desc,
                'value': o.value,
                'min': o.min,
                'max': o.max
            }

        if isinstance(o, Frame):
            return {
                'rx_id': o.rx_id,
                'addr_mode': o.addr_mode,
                'data': o.data,
                'data_len': o.data_len,
                'priority': o.priority,
                'raw': o.raw,
                'seq_index': o.seq_index,
                'rx_id': o.rx_id,
                'tx_id': o.tx_id,
                'type': o.type
            }

        if isinstance(o, Message):
            return {
                'data': o.data,
                'ecu': o.ecu,
                'frames': o.frames
            }

        if isinstance(o, Status):
            return {
                'MIL': o.MIL,
                'DTC_COUNT': o.DTC_count,
                'ignition_type': o.ignition_type
            }

        if isinstance(o, Unit.Quantity):
            return o.magnitude

        if isinstance(o, obd.ECU):  # this may not be needed
            return str(o)  

        if isinstance(o, set):
            return list(o)

        if isinstance(o, obd.OBDResponse):
            if o.is_null():
                return None
            else:
                return {
                    'value': o.value,       
                    'command': o.command,
                    'time': int(o.time * 1000),
                    'unit': o.unit
                }

                
        if isinstance(o, obd.OBDCommand):
            return {
                'name': o.name,
                'desc': o.desc,
                'decoder': self.get_decoder(o.decode),
                'mode': o.mode
                # the rest of this is not human readable/may not provide much info to a client
                # 'fast': o.fast,
                # 'command': o.command,    
                # 'bytes': str(o.bytes),
                # 'ecu': o.ecu,
            }

        try:
            # obd.OBDCommand sets caught here
            iterable = iter(o)
            return list(iterable)
        except TypeError:
            pass
       
        return f'Object of type {o.__class__.__name__} is not JSON serializable'

        # Opt not to raise TypeError for now
        # return json.JSONEncoder.default(self, o)

def loads(*args, **kwargs):
    return json.loads(*args, **kwargs)

def dumps(*args, **kwargs):
    return json.dumps(*args, **kwargs, cls=OBDEncoder)

connection = obd.OBD('/dev/pts/4')

snapshot = {}
for mode in obd.commands:
    for cmd in mode:
        if cmd is not None:
            snapshot[cmd.name] = connection.query(cmd)

print(dumps(snapshot, indent=2))



