// Server and socketio
const express = require("express");
const app = express();
const httpServer = require("http").createServer(app);
const io = require("socket.io")(httpServer);
const port = process.env.PORT || 8080;
const compression = require('compression');

// Lib modules
const SysInfo = require('./lib/sys-info.js');

// API Controllers
const Controller = require('./controllers/controller');    // Parent/base
const Sensor = require('./controllers/sensor');
const Settings = require('./controllers/settings');

// Database 
const database = require('./data/config');

// Middleware
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(compression());

database.configure(knex => {

    httpServer.listen(port, () => {
        console.log("Server lisenting on port: " + port);
    });

    const socketAPIs = {};

    socketAPIs.settings = new Settings();
    socketAPIs.sensor = new Sensor(knex);
    socketAPIs.maintenance = new Controller('maintenance', knex);
    socketAPIs.sysInfo = new SysInfo(io);

    app.set('API', socketAPIs);
    // app.use(require('./routes'));

    io.on("connection", (socket) => {
        console.log(`Client connected from ${socket.handshake.address}`);
        socket.onAny((eventName, args) => {
            let [api, action] = eventName.split(':');
            if (socketAPIs[api] && action) {
                socketAPIs[api][action](socket, args)
                    .then((res) => {
                        if (action === 'read') {
                            // If request was a read then we only need to respond to the individual client
                            socket.emit(`${api}:response`, res);
                        } else {
                            // Tell every client of the changes
                            io.emit(`${api}:response`, res);
                        }
                    })
                    .catch((err) => socket.emit(`${action}:error`, { ...err, api: api }));      // tell the individual client what they did failed 
            }
        });
    });

});

process.on('SIGTERM', () => {
    httpServer.close();
    process.exit();
});
