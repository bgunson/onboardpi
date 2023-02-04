
const Client = require("socket.io-client");
const assert = require("chai").assert;

const port = 60000;

describe("obd api", () => {

    let socket;

    before((done) => {

        socket = new Client(`http://localhost:${port}`);

        socket.on("connect", () => {
            socket.emit('start_emulator');
            socket.once('emulator_port', (pty) => {
                socket.emit('connect_obd', pty);
                done();
            })
        });
    });

    after((done) => {
        socket.emit('stop_emulator');
        socket.once('stop_emulator', () => {
            socket.emit('kill');
            socket.close();
            done();
        })
    });

    it('should connect to the obd socket', () => {
        assert.equal(socket.connected, true);
    });

    it('should connect to the emulator', (done) => {
        socket.emit('is_connected');
        socket.once('is_connected', (connected) => {
            assert.equal(connected, true);
            done();
        });
    });

    it('should support "RPM" command', (done) => {
        socket.emit('supports', 'RPM');
        socket.once('supports', (supports) => {
            assert.equal(supports, true);
            done();
        });
    });

    it('should not support bad command', (done) => {
        socket.emit('supports', 'fake');
        socket.once('supports', (supports) => {
            assert.equal(supports, false);
            done();
        });    
    });

    it('should watch "RPM" command', (done) =>{
        socket.emit("join_watch");
        socket.emit('watch', ['RPM']);
        socket.once('watching', (watching) => {
            assert.exists(watching['RPM']);
            done();
        });
    });

    it('should unwatch "RPM" command', (done) => {
        socket.emit('unwatch', ['RPM', 'SPEED']);
        socket.once('watching', (watching) => {
            assert.notExists(watching['RPM']);
            done();
        })
    });

    it('should unwatch all commands', (done) => {
        socket.emit('unwatch_all', ['SPEED']);
        socket.once('watching', (watching) => {
            assert.notExists(watching['SPEED']);
            done();
        });
    });
    
});