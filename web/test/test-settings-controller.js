const chai = require('chai');
const chaiAsPromised = require('chai-as-promised'); 
const deepEqualInAnyOrder = require('deep-equal-in-any-order');
chai.use(deepEqualInAnyOrder);
chai.use(chaiAsPromised);
const assert = chai.assert;

const fs = require('fs');
const path = require('path');
const Settings = require('../controllers/settings');
const stockSettings = require('../data/app/settings.json');

describe('settings controller', () => {

    let controller = new Settings();
    const settingsPath = path.join(process.env.SETTINGS_DIR, 'settings.json');

    after(() => {
        fs.rmSync(controller.settingsPath);
    })

    it('should have the correct path to the file', () => {
        assert.equal(settingsPath, controller.settingsPath);
    });

    it('should create settings file', () => {
        assert(fs.existsSync(settingsPath));
    });

    it('should default to stock settings', (done) => {
        controller.read().then(settings => {
            assert.deepEqualInAnyOrder(stockSettings, settings);
            done();
        });
    });  

    it('should not be able to create settings', () => {
        return assert.isRejected(controller.create());
    });

    it('should update settings', (done) => {
        let update = stockSettings;
        update.vehicle.make = "test";
        update.vehicle.model = "updated";

        controller.update(null, update).then(settings => {
            assert.deepEqual(update, settings);
            done();
        });
    });

    it('should not be able to delete settings', () => {
        return assert.isRejected(controller.delete());
    });

});