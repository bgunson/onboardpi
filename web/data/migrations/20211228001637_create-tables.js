
exports.up = async function(knex) {
    await knex.schema.createTable("maintenance", table => {
        table.increments('id').primary(),
        table.date('date'),
        table.string('description'),
        table.integer('odometer'),
        table.string('notes')
    });
    await knex.schema.createTable("dashboard_cards", table => {
        table.increments('id').primary(),
        table.integer('index'),
        table.string('type')   // gauge.full | gauge.semi | gauge.arch | numeric | curve
        table.string('command')
    });
};

exports.down = function(knex) {
  
};
