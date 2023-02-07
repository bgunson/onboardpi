const si = require('systeminformation');

class SysInfo {

    constructor(io) {
        this.socket = io;
        this.roomSize = 0;
        this.observer = undefined;
    }

    /**
     * returns room name = 'sysInfo'
     */
    get roomName() {
        return 'sysInfo';
    }

    get valueObject() {
        return {
            time: '*',
            currentLoad: 'currentLoad',
            cpuTemperature: 'main',
            cpuCurrentSpeed: 'avg',
            mem: '*',
            fsSize: '*',
            networkInterfaces: '*', // get ip of host
            networkStats: '*'   // get rx_sec/tx_sec bytes (rx_bytes/tx_bytes for total)
            // networkInterfaceDefault: '*' // name of default; where networkStats['iface'] == this
        }
    }

    _serializeData(data) {
        var info = {}
        info.time = data.time;
        info.cpu = {
            load: data.currentLoad.currentLoad,
            speed: data.cpuCurrentSpeed.avg,
            temp: data.cpuTemperature.main
        };
        info.mem = {
            total: data.mem.total,
            free: data.mem.free,
            used: data.mem.used,
            active: data.mem.active
        }
        info.network = [];
        data.networkStats.forEach(iface => {
            let interfaceInfo = data.networkInterfaces.find(i => i.iface == iface.iface);
            info.network.push(Object.assign(interfaceInfo, iface));
        });
        info.storage = data.fsSize;
        return info;
    }

    /**
     * Add a client socket ref to the sys info room where they will be given data once per second.
     * Increments the room size as well
     * @param {Socket} client the Server's reference to the client socket
     * @returns a resolve promise after finished
     */
    join(client) {
        client.join(this.roomName);
        this.roomSize++;
        if (!this.observer) {
            this.observer = si.observe(this.valueObject, 1000, (data) => {
                let info = this._serializeData(data);
                this.socket.to(this.roomName).emit(this.roomName, info);
            });
        }
        return Promise.resolve();
    }

    /**
     * Removes a client from the info room, and decrements room size counter. If no clients are in the room
     * then the observer on system parameters in cancelled.
     * @param {Socket} client - the Server's reference to the client socket who is leaving 
     * @returns a resolved promise once finished 
     */
    leave(client) {
        client.leave(this.roomName);
        this.roomSize = Math.max(0, this.roomSize - 1);
        if (this.roomSize == 0) {
            clearInterval(this.observer);
            this.observer = null;
        }
        return Promise.resolve();
    }

}

module.exports = SysInfo;
