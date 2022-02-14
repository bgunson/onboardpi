

class Controller {

    constructor(tableName, knex) {
        this.tableName = tableName;
        this.knex = knex;
    }

    getTable() {
        let table = this.knex(this.tableName);
        return table;
    }

    // respond() {
    //     this.getTable().then(table => this.io.emit(`${this.tableName}:response`, table));
    // }

    // get(id) {
    //     return this.getTable().where({id: id});
    // }

    create(client, item) {
        return this.getTable()
            .insert(item)
            .then(() => this.getTable());
    }

    read(client) {
        return this.getTable();
    }

    update(client, item) {
        return this.getTable()
            .where({ id: item.id })
            .update(item)
            .then(() => this.getTable());
    }

    delete(client, item) {
        return this.getTable()
            .where({ id: item.id })
            .del()
            .then(() => this.getTable());
    }
}

module.exports = Controller;