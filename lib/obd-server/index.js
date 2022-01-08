const { spawn } = require('child_process');
const fs = require('fs');

class OBDServer {

    constructor(io, settings) {
        this.io = io;
        this.settings = settings;
    }

    connect(client) {
        client.on('obd:reconnect', () => this.reconnect());
        client.on('obd:disconnect', () => this.close());
    }

    start() {
        var connection = this.settings.read('connection');
        var parameters = {};
        if (!connection.auto) {
            parameters = connection.parameters;
        }
        parameters = JSON.stringify(parameters);
        console.log("OBD Server started by main application");
        this.server = spawn('python', [__dirname + '/server.py', connection.log_level || 'WARNING', parameters]);

        this.io.emit('obd:start');

        const obdStream = fs.createWriteStream('./obd.log');
        this.server.stdout.pipe(obdStream);
        this.server.stderr.pipe(obdStream);

        this.server.on('close', (code) => {
            obdStream.end();
            console.log("OBD Server closed by main application w/ code", code)
        });
    }
    
    close() {
        if (this.server && this.server.pid) {
            // console.log(this.server.pid);
            process.kill(this.server.pid);
            this.server = null;
        }
    }

    reconnect() {
        this.close();
        setTimeout(() => this.start(), 500);
    }

}

module.exports = OBDServer;