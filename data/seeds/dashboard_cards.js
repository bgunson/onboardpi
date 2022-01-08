const cards = require('../app/dashboard_cards.json');

exports.seed = async function(knex) {
  return knex('dashboard_cards')
    .then(rows => {
      if (rows.length === 0) {
        return knex('dashboard_cards').insert(cards);
      }
    });
};
