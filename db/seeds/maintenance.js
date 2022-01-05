
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('maintenance')
    .then(rows => {
      if (rows.length === 0) {
        // Inserts seed entries
        return knex('maintenance').insert([
          {id: 1, date: new Date().toISOString(), description: 'Example Job', odometer: 110000, notes: 'Add part numbers or any other info here'},
        ]);
      }
    });
};
