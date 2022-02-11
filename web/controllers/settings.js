const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const seed = require('../data/app/settings.json');

class Settings {

    constructor(io) {
        this.io = io;
        this.settingsPath = path.join(process.env.SETTINGS_DIR || process.cwd(), 'settings.json');
        console.log(`Using ${this.settingsPath} for settings configuration.`);
        if (!fs.existsSync(this.settingsPath)) {
            console.log("Settings file does not exist, creating default.")
            fs.writeFileSync(this.settingsPath, JSON.stringify(seed, null, 2));
        }
        this.settings = require(this.settingsPath);
    }

    create() {
        throw new Error("Settings can only be read or updated");
    }

    /**
     * Fix this.
     * Pluck the current settings by property 
     * @param  {string[]} properties array of properties to pluck
     * @returns The value of the current settings for the given properties, if any 
     */
    read(...properties) {
        // let current = this.settings;
        // properties.forEach(p => {
        //     current = current[p];
        // });
        return Promise.resolve(this.settings);
    }

    update(updated) {
        return new Promise((resolve, reject) => {
            var reconnect = false;
            if (!_.isEqual(this.settings.connection, updated.connection)) 
                reconnect = true; 
            
            this.settings = updated;
            fs.writeFile(this.settingsPath, JSON.stringify(this.settings, null, 2), (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.settings);
                }
            });
        });
    }

    delete() {
        throw new Error("Settings cannot be deleted");
    }

}

module.exports = Settings;