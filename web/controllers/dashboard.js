const Crud = require(".");

class Dashboard extends Crud {

    constructor(io, knex) {
        super('dashboard_cards', io, knex);
        this.io = io;
        this.knex = knex;
    }

    reorder(_, cards) {
        const queries = [];
        cards.forEach(card => {
            const query = this.getTable()
                .where({ id: card.id })
                .update(card)
            queries.push(query);   
        });
        return Promise.all(queries).then(() => this.getTable());
    }

}

module.exports = Dashboard;