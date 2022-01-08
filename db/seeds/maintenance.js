const seed = require('../app/maintenance.json');

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('maintenance')
    .then(rows => {
      if (rows.length === 0) {
        // Inserts seed entries
        return knex('maintenance').insert(seed);
      }
    });
};
