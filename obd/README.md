# OnBoardPi OBD-Server

The OBD Server must be run from the project root:
```
python obd/server.py
```

From the web client, the obd log view/download is retreivable wehn you run:
```
python obd/server.py &> obd/obd.log
```

For a desk test setup you can use [ELM-emulator](https://github.com/Ircama/ELM327-emulator).
Open another terminal and run:
```
python3 -m pip install ELM327-emulator
elm -s car
```
Take not of the pseudo port it uses, an example is `/dev/pts/6`. You need to configure the server
to use that serial port explicitly in `settings.json` to properly connect to the simulation.

Example `settings.json` (located in the project root):
```
{
  "vehicle": {
    "make": null,
    "model": null,
    "year": null,
    "vin": null
  },
  "connection": {
    "auto": false,
    "parameters": {
      "portstr": "/dev/pts/7",
      "baudrate": null,
      "protocol": null
    },
    "log_level": "INFO"
  }
}
```
Protocol and baudrate are not required from my experience.