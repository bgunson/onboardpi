const { createServer } = require("http");
const { Server } = require("socket.io");
const Client = require("socket.io-client");
const assert = require("chai").assert;
const SysInfo = require("../lib/sys-info.js");

const serializedKeys = ['time', 'cpu', 'mem', 'network', 'storage'];    // see SysInfo._serializeData

describe("sys info", () => {
    let io, serverSocket, clientSocket, sysInfo;

    before((done) => {
        const httpServer = createServer();
        io = new Server(httpServer);
        sysInfo = new SysInfo(io);
        httpServer.listen(() => {
            const port = httpServer.address().port;
            clientSocket = new Client(`http://localhost:${port}`);
            io.on("connection", (socket) => {
                serverSocket = socket;
            });
            clientSocket.on("connect", done);
        });
    });

    after(() => {
        io.close();
        clientSocket.close();
    });

    it('should return the room name', () => {
        assert.equal(sysInfo.roomName, 'sysInfo');
    });

    it('should return the value object', () => {
        const expected = {
            time: '*',
            currentLoad: 'currentLoad',
            cpuTemperature: 'main',
            cpuCurrentSpeed: 'avg',
            mem: '*',
            fsSize: '*',
            networkInterfaces: '*',
            networkStats: '*'   
        }
        assert.deepEqual(sysInfo.valueObject, expected);
    });

    it('should let client join room and increment roomSize', async () => {
        await sysInfo.join(serverSocket);
        assert.equal(sysInfo.roomSize, 1);
    });

    it('should serialize info object with all keys', (done) => {
        clientSocket.once('sysInfo', info => {
            serializedKeys.forEach(key => {
                assert.exists(info[key]);
            });
            done();
        });
    });
    

    it('should leave the room and decrement roomSize', async () => {
        await sysInfo.leave(serverSocket);
        assert.equal(sysInfo.roomSize, 0);
    });

});