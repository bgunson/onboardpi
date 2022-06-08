const Settings = require('../../controllers/settings.js');

exports.up = async function (knex) {
    const settings = new Settings();
    let s = await settings.read(null);
    s.connection.parameters.delay_cmds = 100;
    await settings.update(null, s);
};

exports.down = function (knex) {

};
