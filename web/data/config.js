const env = process.env.NODE_ENV || 'development';
const knex = require('knex');
const knexConfig = require('./knexfile');
const fs = require('fs').promises;
const path = require('path');

module.exports.configure = async function(callback) {

    const config = knexConfig[env];

    const dataPath = path.dirname(path.resolve(config.connection.filename));
    await fs.mkdir(dataPath, {recursive: true});

    const db = knex(config);

    await db.migrate.latest();
    await db.seed.run();

    callback({
        knex: db,
        path: dataPath
    });
}