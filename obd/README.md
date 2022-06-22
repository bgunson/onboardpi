# OnBoardPi OBD-Server

## Development

The OBD Server must be run from the project root:
```
python obd/server.py
```
(python 3 or greater)

Be sure to init the submodules (obd-socketio)
```
git submodule update --init
```

For a desk test setup you can use [ELM-emulator](https://github.com/Ircama/ELM327-emulator).
Open another terminal and run:
```
python3 -m pip install ELM327-emulator
elm -s car
```
Take note of the pseudo port it uses, an example is `/dev/pts/6`. You need to configure the server
to use that serial port explicitly in `settings.json` to properly connect to the simulation.

Example `settings.json` where protocol and baudrate are not required from my experience (w/ ELM327-emulator):
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
  ...
}
```
The `settings.json` file should be located wherever `server.py` is ran from.
If testing the web application alongside the OBD server, then it should be located in the project root (back on directory) and ran as `python obd/server.py`. If just testing the OBD server the settings in `./tests/test_configs/settings.json` can be used but you will need to configure the environment variable `SETTINGS_DIR` to point to that file. Otherwise copy the template from `../web/data/app/settings.json` into this directory. 


## Testing
Install `pytest`
```
pip install pytest
```
From this directory run:
```
python -m pytest
```