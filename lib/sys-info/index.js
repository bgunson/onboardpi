const si = require('systeminformation');

class SysInfo {

    constructor(io) {
        this.socket = io;
        this.roomSize = 0;
        this.observer = undefined;
    }

    get roomName() {
        return 'sysInfo';
    }

    get valueObject() {
        return {
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

    serializeData(data) {
        var info = {}
        // console.log(data)
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

    connect(client) {
        client.on('getSysInfo', () => {
            client.join(this.roomName);
            this.roomSize++;
            if (!this.observer) {
                this.observer = si.observe(this.valueObject, 1000, (data) => {
                    let info = this.serializeData(data);
                    this.socket.to(this.roomName).emit(this.roomName, info);
                });
            }
        });
        client.on('stopSysInfo', () => {
            client.leave(this.roomName);
            this.roomSize = Math.max(0, this.roomSize - 1);
            if (this.roomSize == 0) {
                clearInterval(this.observer);
                this.observer = null;
            }
        });
    }

}

module.exports = SysInfo;
