const KnexCrud = require("./knex-crud");


class Dashboard extends KnexCrud {

    constructor(io, knex) {
        super('dashboard_cards', io, knex);
        this.io = io;
        this.knex = knex;
    }

    connect(client) {
        super.connect(client);
        client.on('dashboard_cards:reorder', cards => this.reorder(cards));
    }

    reorder(cards) {
        const queries = [];
        cards.forEach(card => {
            const query = this.getTable()
                .where({ id: card.id })
                .update(card)
            queries.push(query);   
        });
        Promise.all(queries).then(() => this.updateAll());
    }

}

module.exports = Dashboard;