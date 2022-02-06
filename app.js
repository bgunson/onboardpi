// Server and socketio
const express = require("express");
const app = express();
const httpServer = require("http").createServer(app);
const io = require("socket.io")(httpServer);
const port = process.env.PORT || 8080;
const compression = require('compression');

// Lib modules
const SysInfo = require('./lib/sys-info');
const OBDServer = require('./lib/obd-server');
const Settings = require('./controllers/settings');
const Dashboard = require('./controllers/dashboard');
const Crud = require('./controllers');

// Database 
const database = require('./data/config');

// Middleware
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(compression());

database.configure((config) => {

    httpServer.listen(port, () => {
        console.log("Server lisenting on port: " + port);
    });

    const socketAPIs = {};

    const settings = new Settings(io, config.path);
    socketAPIs.settings = settings;
    socketAPIs.dashboard_cards = new Dashboard(io, config.knex);
    socketAPIs.maintenance = new Crud('maintenance', io, config.knex);
    socketAPIs.sysInfo = new SysInfo(io);
    const obdServer = new OBDServer(io, settings);
    socketAPIs.obd = obdServer;   // OBD server needs settings for parameters, log_level

    app.set('API', socketAPIs);
    app.use(require('./routes'));

    io.on("connection", (socket) => {
        console.log(`Client connected from ${socket.handshake.address}`);
        socket.onAny((eventName, args) => {
            let [api, action] = eventName.split(':');
            if (api && action) {
                socketAPIs[api][action](args)
                    .then((res) => {
                         io.emit(`${api}:response`, res)
                    })
                    .catch((err) => socket.emit(`${api}:error`, err));      // tell the individual client what they did failed  
            }
        });
    });

    process.on('SIGINT', () => {
        obdServer.close();
        process.exit();
    });
    
    process.on('SIGTERM', () => {
        obdServer.close();
        httpServer.close();
        process.exit();
    });
    
    process.on('uncaughtException', () => {
        obdServer.close();
    });

});
