const env = process.env.NODE_ENV || 'development';
const knex = require('knex');
const knexConfig = require('./knexfile');
const fs = require('fs').promises;
const path = require('path');

module.exports.configure = async function(callback) {

    const config = knexConfig[env];

    try {
        const db = knex(config);
        await db.migrate.latest();
        await db.seed.run();
        callback(db);
    } catch(e) {
        console.log("Unable to connect to the database")
        console.log(e);
        process.exit(1);
    }
}