
exports.up = function(knex) {
    return knex.schema.createTable('maintenance', table => {
      table.increments('id'),
      table.date('date'),
      table.string('description'),
      table.integer('odometer'),
      table.string('notes')
    });
  };
  
  exports.down = function(knex) {
    
  };