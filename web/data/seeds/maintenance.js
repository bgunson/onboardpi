const seed = require('../app/maintenance.json');

exports.seed = function(knex) {
  return knex('maintenance')
    .then(rows => {
      if (rows.length === 0) {
        // Inserts seed entries
        return knex('maintenance').insert(seed);
      }
    });
};
