// Server and socketio
const express = require("express");
const app = express();
const httpServer = require("http").createServer(app);
const io = require("socket.io")(httpServer);
const port = process.env.PORT || 8080;
const compression = require('compression');

// Lib modules
const SysInfo = require('./lib/sys-info');
const Settings = require('./controllers/settings');
const Dashboard = require('./controllers/dashboard');
const Crud = require('./controllers');

// Database 
const database = require('./data/config');

// Middleware
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(compression());

const isCrud = (action) => ['create', 'read', 'update', 'delete'].includes(action);

database.configure(knex => {

    httpServer.listen(port, () => {
        console.log("Server lisenting on port: " + port);
    });

    const socketAPIs = {};

    socketAPIs.settings = new Settings(io);;
    socketAPIs.dashboard_cards = new Dashboard(io, knex);
    socketAPIs.maintenance = new Crud('maintenance', io, knex);
    socketAPIs.sysInfo = new SysInfo(io);

    app.set('API', socketAPIs);
    app.use(require('./routes'));

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
