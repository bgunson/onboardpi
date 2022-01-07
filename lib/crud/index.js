

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

    connect(client) {
        client.on(`${this.tableName}:create`, item => this.create(item));
        client.on(`${this.tableName}:read`, () => this.read().then(list => client.emit(`${this.tableName}:response`, list)));
        client.on(`${this.tableName}:update`, item => this.update(item));
        client.on(`${this.tableName}:delete`, item => this.delete(item));
    }

    updateAll() {
        this.getTable().then(all => this.io.emit(`${this.tableName}:response`, all));
    }

    get(id) {
        return this.getTable().where({id: id});
    }

    create(item) {
        this.getTable()
            .insert(item)
            .then(() => this.updateAll());
    }

    read() {
        return this.getTable()
    }

    update(item) {
        this.getTable()
            .where({ id: item.id })
            .update(item)
            .then(() => this.updateAll());
    }

    delete(item) {
        this.getTable()
            .where({ id: item.id })
            .del()
            .then(() => this.updateAll());
    }
}

module.exports = Crud;