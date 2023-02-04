const Settings = require('../../controllers/settings.js');

exports.up = async function(knex) {
    const settings = new Settings();
    let s = await settings.read(null);
    delete s.connection.supported_only;     // This setting can also be removed
    delete s.connection.auto;
    return await settings.update(null, s);
};

exports.down = function(knex) {
    return Promise.resolve();
};
