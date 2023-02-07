const Sensor = require('../controllers/sensor');

const chai = require('chai');
const deepEqualInAnyOrder = require('deep-equal-in-any-order');
chai.use(deepEqualInAnyOrder);
const assert = chai.assert;

const dbConfig = require('../data/config');
const testSensors = require('../data/app/sensor.json');

describe('sensor controller', () => {

    let testController, knex;

    before((done) => {
        dbConfig.configure(k => {
            knex = k;
            testController = new Sensor(knex);
            done();
        });
    });

    after(async () => {
        await knex.migrate.rollback();
        await dbConfig.cleanup();
    });

    it('should reorder sensors on dashboard', (done) => {

        testController.read().then(dashboard => {
            dashboard.push(dashboard.splice(Math.random() * (dashboard.length - 1), 1)[0]);   // move random card to back of array to sim a reorder

            // re index each card - TODO: make the controller do this (server-side)
            dashboard = dashboard.map((s, i) => ({ ...s, index: i }));

            testController.reorder(null, dashboard).then(reordered => {
                assert.deepEqualInAnyOrder(dashboard, reordered);
                done();
            });
        });

    });

});