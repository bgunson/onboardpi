const env = process.env.NODE_ENV || 'development';
const knex = require('knex');
const knexConfig = require('./knexfile');
const fs = require('fs').promises;

const config = knexConfig[env];

let db;

module.exports.configure = async function(callback) {

    try {
        db = knex(config);
        await db.migrate.latest();
        await db.seed.run();
        callback(db);
    } catch(e) {
        console.log("Unable to connect to the database")
        console.log(e);
        process.exit(1);
    }
}

module.exports.cleanup = async function() {
    if (process.env.NODE_ENV == 'test') {
        await db.destroy();
        return fs.rm(config.connection);
    } else {
        return Promise.reject(new Error("DO not try to remove the database if not testing"));
    }
}