
exports.up = function(knex) {
    return knex.schema.createTable('dashboard_cards', table => {
        table.increments('id'),
        table.integer('index'),
        table.string('type'),   // gauge.full | gauge.semi | gauge.arch | numeric | curve
        table.string('command')
    });
};

exports.down = function(knex) {
  
};
