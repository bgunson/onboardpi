const Settings = require('../../controllers/settings.js');

exports.up = async function(knex) {
    const settings = new Settings();
    let s = await settings.read(null);
    s.injectors = {};
    s.injectors['oap'] = {
        enabled: false,
        parameters: {},
        log_level: "INFO"
    }
    return await settings.update(null, s);
};

exports.down = function(knex) {
  
};
