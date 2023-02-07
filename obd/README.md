# OnBoardPi OBD-Server

## Development

The OBD Server must be run from the project root:
```
python obd/server.py
```
(python 3.8 preferred - use a venv)

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
If testing the web application alongside the OBD server, then it should be located in the project root (back on directory) and ran as `python obd/server.py`. If just testing the OBD server the settings in `./tests/test_configs/settings.json` can be used but you will need to configure the environment variable `SETTINGS_DIR` to point to that file. Otherwise copy the template from `../web/data/app/settings.json` into this directory or run the web server first who will create one if it doesn't exist already. 


## Testing
Install `pytest`
```
pip install pytest
```
From this directory run:
```
python -m pytest
```

For testing the socketio handlers see `../web/README.md#Testing`.

## Build
See `Dockerfile`. 

To test a staging env, from the project root:
```
docker compose -f docker-compose.staging.yml up -d
```

The web client will be served on port 80 in the staging environment.