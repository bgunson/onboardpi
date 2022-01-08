// Update with your config settings.
module.exports = {

  development: {
    client: 'sqlite3',
    connection: {
      filename: './data/dev/dev.db'
    },
    seeds: {
      directory: './data/seeds'
    },
    migrations: {
      directory: './data/migrations'
    },
    useNullAsDefault: true
  },

  production: {
    client: 'sqlite3',
    connection: {
      filename: '/etc/obpi/obpi.db'
    },
    seeds: {
      directory: './data/seeds'
    },
    migrations: {
      directory: './data/migrations'
    },
    useNullAsDefault: true
  }

};
