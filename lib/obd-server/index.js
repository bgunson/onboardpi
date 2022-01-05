const { spawn } = require('child_process');

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
        this.server = spawn('python', [__dirname + '/server.py', parameters]);

        this.io.emit('obd:start');

        this.server.stdout.on('data', (data) => console.log(data.toString()))
        this.server.stderr.on('data', (data) => console.log(data.toString()))
        this.server.on('close', () => console.log("OBD Server closed by main application"))
    }
    
    close() {
        if (this.server && this.server.pid) {
            console.log(this.server.pid);
            process.kill(this.server.pid);
            this.server = null;
        }
    }

    reconnect() {
        this.close();
        this.start();
    }

}

module.exports = OBDServer;