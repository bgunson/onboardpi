
exports.up = function(knex) {
    return knex.schema.createTable('sensor', table => {
        table.increments('id'),
        table.integer('index'),
        table.string('type'),   // gauge.full | gauge.semi | gauge.arch | numeric | curve
        table.string('command')
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('sensor');
};
