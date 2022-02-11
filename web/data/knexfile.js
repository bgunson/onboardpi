// Update with your config settings.
module.exports = {

    development: {
        client: 'pg',
        connection: {
            host: process.env.POSTGRES_HOST || 'localhost',
            port: 5432,
            user: 'postgres',
            password: 'password',
            database: 'onboardpi-dev'
        },
        seeds: {
            directory: `${__dirname}/seeds`
        },
        migrations: {
            directory: `${__dirname}/migrations`
        },
        useNullAsDefault: true
    },

    production: {
        client: 'pg',
        connection: {
            host: process.env.POSTGRES_HOST || 'localhost',
            port: 5432,
            user: 'postgres',
            password: 'password',
            database: 'onboardpi'
        },
        seeds: {
            directory: `${__dirname}/seeds`
        },
        migrations: {
            directory: `${__dirname}/migrations`
        },
        useNullAsDefault: true
    }

};
