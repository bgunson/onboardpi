const cards = require('../app/sensor.json');

exports.seed = function(knex) {
  return knex('sensor')
    .then(rows => {
      if (rows.length === 0) {
        return knex('sensor').insert(cards);
      }
    });
};
