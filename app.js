// Server and socketio
const express = require("express");
const app = express();
const httpServer = require("http").createServer(app);
const io = require("socket.io")(httpServer);
const port = process.env.PORT || 8080;

// Lib modules
const SysInfo = require('./lib/sys-info');
const OBDServer = require('./lib/obd-server');

// Database 
const database = require('./db/config');
const Settings = require('./db/crud/settings');
const Dashboard = require('./db/crud/dashboard');
const KnexCrud = require('./db/crud/knex-crud');


// Middleware
app.use(express.static(__dirname + '/public'));
app.use(express.json());


database.configure((config) => {

    httpServer.listen(port, () => {
        console.log("Server lisenting on port: " + port);
    });

    const settingsCrud = new Settings(io, config.path);
    const dashboardCrud = new Dashboard(io, config.knex);
    const commandsCrud = new KnexCrud('commands', io, config.knex);
    const maintenanceCrud = new KnexCrud('maintenance', io, config.knex);

    const sysInfo = new SysInfo(io);
    const obdServer = new OBDServer(io, settingsCrud);

    io.on("connection", (socket) => {
        console.log("Client connected.");
        sysInfo.connect(socket);
        maintenanceCrud.connect(socket);
        settingsCrud.connect(socket);
        commandsCrud.connect(socket);
        dashboardCrud.connect(socket);
        obdServer.connect(socket);
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
    
    // process.on('uncaughtException', () => {
    //     obdServer.close();
    // });

});
