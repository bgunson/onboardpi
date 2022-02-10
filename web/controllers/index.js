

class Crud {

    constructor(tableName, io, knex) {
        this.tableName = tableName;
        this.io = io;
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

    create(item) {
        return this.getTable()
            .insert(item)
            .then(() => this.getTable());
    }

    read() {
        return this.getTable();
    }

    update(item) {
        return this.getTable()
            .where({ id: item.id })
            .update(item)
            .then(() => this.getTable());
    }

    delete(item) {
        return this.getTable()
            .where({ id: item.id })
            .del()
            .then(() => this.getTable());
    }
}

module.exports = Crud;