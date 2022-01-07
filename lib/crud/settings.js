const path = require('path');
const fs = require('fs');
const _ = require('lodash');

class Settings {

    constructor(io, settingsPath) {
        this.io = io;
        this.settingsPath = path.join(path.resolve(settingsPath), 'settings.json');
        if (!fs.existsSync(this.settingsPath)) {
            fs.writeFileSync(this.settingsPath, JSON.stringify(SEED, null, 2));
        }
        this.settings = require(this.settingsPath);
    }

    /**
     * Expose the settings CRUD API to a specific client socket
     * @param {Socket} client Individual client connection to the server
     */
    connect(client) {
        client.on('settings:create', () => {});
        client.on('settings:read', () => client.emit('settings:response', this.settings));
        client.on('settings:update', settings => this.update(settings));
        client.on('settings:delete', () => {});
    }

    create() {
        throw new Error("Settings can only be read or updated")
    }

    /**
     * Fix this.
     * Pluck the current settings by property 
     * @param  {string[]} properties array of properties to pluck
     * @returns The value of the current settings for the given properties, if any 
     */
    read(...properties) {
        let current = this.settings;
        properties.forEach(p => {
            current = current[p];
        });
        return current;
    }

    update(updated) {
        var reconnect = false;
        if (!_.isEqual(this.settings.connection, updated.connection)) 
            reconnect = true; 
          
        this.settings = updated;
        fs.writeFile(this.settingsPath, JSON.stringify(this.settings, null, 2), (err) => {
            if (err) {
                // respond error
            } else {
                this.io.emit('settings:response', this.settings);
            }
            if (reconnect) {
                this.io.emit('obd:reconnect', "Connection parameters have been changed. Would you like to reconnect to the vehicle?");
            }
        });
    }

    delete() {
        throw new Error("Settings cannot be deleted");
    }

}

module.exports = Settings;

const SEED = {
    vehicle: {
        make: null,
        model: null,
        year: null,
        vin: null,
    },

    connection: {
        auto: true,
        parameters: {
            portstr: null,
            baudrate: null,
            protocol: null
        },
        log_level: 'NOTSET'
    }
}