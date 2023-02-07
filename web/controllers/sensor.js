const Controller = require("./controller");

class Sensor extends Controller {

    constructor(knex) {
        super('sensor', knex);
        this.knex = knex;
    }

    /**
     * 
     * @param {*} _  
     * @param {Sensor[]} cards - the dashboard cards in order 
     * @returns a Promise when the reorder resolves
     */
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