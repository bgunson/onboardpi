
const Client = require("socket.io-client");
const assert = require("chai").assert;

const protocols = require('../../data/obd/all_protocols.json');
const dtcs = require('../../data/obd/dtc.json');

const port = 60000;

describe("obd api", () => {

    let socket, emulatorPort;

    before((done) => {

        socket = new Client(`http://localhost:${port}`);

        socket.on("connect", () => {
            socket.emit('start_emulator');
            socket.once('emulator_port', (pty) => {
                emulatorPort = pty;
                // socket.emit('connect_obd', pty);
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

    it('should *connect_obd*', (done) => {
        socket.emit('connect_obd', emulatorPort);
        socket.once('connect_obd', (connected) => {
            assert.isTrue(connected);
            done();
        });
    });

    it('should be connected on second attempt to *connect_obd*', (done) => {
        socket.emit('connect_obd');
        socket.once('connect_obd', (connected) => {
            assert.isTrue(connected);
            done();
        });
    });

    it('should return true for *is_connected* to the emulator', (done) => {
        socket.emit('is_connected');
        socket.once('is_connected', (connected) => {
            assert.equal(connected, true);
            done();
        });
    });

    it('should *supports* "RPM" command', (done) => {
        socket.emit('supports', 'RPM');
        socket.once('supports', (supports) => {
            assert.equal(supports, true);
            done();
        });
    });

    it('should not *supports* bad command', (done) => {
        socket.emit('supports', 'fake');
        socket.once('supports', (supports) => {
            assert.equal(supports, false);
            done();
        });
    });

    it('should *watch* "RPM/SPEED" commands', (done) => {
        var received = [];
        socket.emit('watch', ['RPM', 'SPEED']);
        socket.on('watching', (watching) => {
            received.push(watching.command.name);
            if (received.length == 2) {
                assert.notEqual(received.indexOf("RPM"), -1);
                assert.notEqual(received.indexOf("SPEED"), -1)
                done();
            }
        });
    });

    it('should *unwatch* "RPM" commands', (done) => {
        socket.emit('unwatch', ['RPM']);
        socket.once('watching', (watching) => {
            assert.notEqual(watching.command.name, "RPM");
            assert.equal(watching.command.name, "SPEED")
            done();
        });
    });

    it('should *unwatch_all* commands', (done) => {
        socket.emit('unwatch_all');
        var responded = 0;
        socket.on('watching', _ => {
            responded++;
        });

        // due to things we cannot control w/ asyncio vs. uvloop scheduling
        // expect there to be no more than one extra response after unwaching
        // since we were only watching one command at this point
        setTimeout(() => {
            assert.isAtMost(responded, 1)
            done();
        }, 1000)
    });

    it('should not *query* a bad command', (done) => {
        socket.emit('query', 'baposdnfkj');
        socket.once('query', (res) => {
            assert.isUndefined(res);
            done();
        });
    });

    it('should get the *port_name*', (done) => {
        socket.emit('port_name');
        socket.once('port_name', (pty) => {
            assert.equal(emulatorPort, pty);
            done();
        });
    });

    it('should return correct *protocol_id* and *protocol_name*', (done) => {
        socket.emit('protocol_id');
        socket.once('protocol_id', (id) => {
            socket.emit('protocol_name');
            socket.once('protocol_name', (name) => {
                assert.equal(name, protocols.find(p => p.id === id).name);
                done();
            });
        });
    });

    it('should return *all_protocols*', (done) => {
        socket.emit('all_protocols');
        socket.once('all_protocols', (all) => {
            assert.deepEqual(protocols, all);
            done();
        });
    });

    it('should return *all_dtcs*', (done) => {
        socket.emit('all_dtcs');
        socket.once('all_dtcs', (all) => {
            assert.deepEqual(dtcs, all);
            done();
        });
    });

    it('should return true for *has_name*', (done) => {
        socket.emit('has_name', 'RPM');
        socket.once('has_name', (has) => {
            assert.isTrue(has);
            done();
        });
    });

    it('should return false for *has_name*', (done) => {
        socket.emit('has_name', 'bad');
        socket.once('has_name', (has) => {
            assert.isFalse(has);
            done();
        });
    });

    it('should *query* CLEAR_DTC', (done) => {
        socket.emit('clear_dtc', (res) => {
            assert.isNull(res);
            done();
        });
    });

    it('should *close* the obd connection', (done) => {
        socket.emit('close');
        socket.emit('is_connected');
        socket.once('is_connected', (connected) => {
            assert.isFalse(connected);
            done();
        });
    });

});