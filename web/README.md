# OnBoardPi Web Server

Before all,
```
npm instal
```

## Development
Note that the web server should be run from the project root:
```
node web/server.js
```
The development `settings.json` file is shared with the OBD server so needs to be relative to both and should be present in the project root.

To build/watch the client during development:
```
cd client
npm install
npm run watch
```

To spin up an instance of postgres/timescaledb for testing/development it is easiest done with docker:
```
docker pull timescale/timescaledb:latest-pg14
docker run -d --name onboardpi-devdb -p 5432:5432 -e POSTGRES_PASSWORD=password -e POSTGRES_DB=onboardpi-dev timescale/timescaledb:latest-pg14
```

## Testing

The web server test framework uses mocha. There are two test paradigms implemented in the `test` directory. The first is for the web server node app. To run the tests:

```
npm test
```

The test directory also includes `test/obd` which has a test suite for connecting to an OBD server instance and testing the socketio handlers. For this to work the obd server needs to be ran in a separate terminal manually, or using the script below which spawns the server in a background process. The test socketio client will emit an event which terminates the obd server process after it is finished.

```
# start from the project root (cd ..)
export SETTINGS_DIR=./obd/tests/test_configs
python obd/server.py & 
cd web
npm run test-obd
```

These are the same commands ran by the github workflow in `../.github/workflows/tests.yml`.

## Build
See `Dockerfile`. 

To test a staging env, from the project root:
```
docker compose -f docker-compose.staging.yml up -d
```

The web client will be served on port 80 in the staging environment.