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
const Settings = require('./lib/crud/settings');
const Dashboard = require('./lib/crud/dashboard');
const Crud = require('./lib/crud');

// Database 
const database = require('./data/config');

// Middleware
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(compression());

app.get('/view-obd-log', (req, res) => {
    res.sendFile(__dirname + '/obd.log');
});

app.get('/download-obd-log', (req, res) => {
    res.download(__dirname + '/obd.log');
});


database.configure((config) => {

    httpServer.listen(port, () => {
        console.log("Server lisenting on port: " + port);
    });

    const socketAPIs = [];

    const settings = new Settings(io, config.path);
    socketAPIs.push(settings);
    socketAPIs.push(new Dashboard(io, config.knex));
    socketAPIs.push(new Crud('maintenance', io, config.knex));
    socketAPIs.push(new SysInfo(io));

    const obdServer = new OBDServer(io, settings);
    socketAPIs.push(obdServer);   // OBD server needs settings for parameters, log_level

    io.on("connection", (socket) => {
        console.log("Client connected.");
        // Connect new clients to each api
        socketAPIs.forEach(api => api.connect(socket));
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
