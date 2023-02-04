const Controller = require("./controller");

class Sensor extends Controller {

    constructor(knex) {
        super('sensor', knex);
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

module.exports = Sensor;