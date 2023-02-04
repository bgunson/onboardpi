const Controller = require('../controllers/controller');
const assert = require("chai").assert;
const db = require('../data/config');

describe('db controller (maintenance)', () => {

    let testController, knex, table;

    let testRecord = {
        date: new Date(),
        description: "Test Job",
        odometer: 999999,
        notes: "test notes"
    };

    before((done) => {
        db.configure(k => {
            knex = k;
            testController = new Controller('maintenance', knex);
            done();
        });
    });

    after(async () => {
        await knex.migrate.rollback();
        await knex.destroy();
    }); 

    it('should create a record', (done) => {
        testController.create(null, testRecord).then(t => {
            table = t;
            const exists = table.find(r => r.description == 'Test Job');
            assert.exists(exists);
            testRecord.id = exists.id;
            done();
        });
    });

    it('should read all records', (done) => {
        testController.read(null).then(records => {
            assert.equal(records.length, table.length);
            done();
        });
    });

    it('should update a record', (done) => {
        testRecord.notes = 'updated';
        testController.update(null, testRecord).then(t => {
            const updated = t.find(r => r.id == testRecord.id);
            assert.equal(testRecord.notes, updated.notes);
            done();
        });
    });

    it('should destroy a record', (done) => {
        testController.delete(null, testRecord).then(t => {
            const dne = t.find(r => r.id == testRecord.id);
            assert.notExists(dne);
            done();
        });
    }); 

});