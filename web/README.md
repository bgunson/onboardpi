# OnBoardPi Web Server

Note that the web server should be run from the project root:
```
node web/server.js
```
The development `settings.json` file is shared with the OBD server so needs to be relative to both and should be present in the project root.

To build/watch the client during development:
```
cd client
npm run watch
```

To spin up an instance of postgres/timescaledb for testing/development it is easiest done with docker:
```
docker pull timescale/timescaledb:latest-pg14
docker run -d --name onboardpi-devdb -p 5432:5432 -e POSTGRES_PASSWORD=password -e POSTGRES_DB=onboardpi-dev timescale/timescaledb:latest-pg14
```