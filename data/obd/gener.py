import obd
import json
import obdio
from obd.codes import DTC
import elm

import obd_dictionary
elm.interpreter.Cmd

connection = obd.OBD('/dev/pts/4')

# print(obdio.dumps(obd_dictionary., indent=2))