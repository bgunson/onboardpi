// Update with your config settings.
module.exports = {

    development: {
        client: 'pg',
        connection: {
            host: 'localhost',
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
            password: process.env.POSTGRES_PASSWORD,
            database: process.env.POSTGRES_DB
        },
        seeds: {
            directory: `${__dirname}/seeds`
        },
        migrations: {
            directory: `${__dirname}/migrations`
        },
        useNullAsDefault: true
    },

    test: {
        client: 'sqlite3',
        connection: `${__dirname}/test.db`,
        useNullAsDefault: true,
        seeds: {
            directory: `${__dirname}/seeds`
        },
        migrations: {
            directory: `${__dirname}/migrations`
        }
    }

};
