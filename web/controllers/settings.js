const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const seed = require('../data/app/settings.json');

class Settings {

    constructor() {
        this.settingsPath = path.join(process.env.SETTINGS_DIR || process.cwd(), 'settings.json');
        console.log(`Using ${this.settingsPath} for settings configuration.`);
        if (!fs.existsSync(this.settingsPath)) {
            console.log("Settings file does not exist, creating default.")
            fs.writeFileSync(this.settingsPath, JSON.stringify(seed, null, 2));
        }
        this.settings = require(this.settingsPath);
    }

    create(client) {
        Promise.reject(new Error("Settings can only be read or updated"));
    }

    read(client=null) {
        return Promise.resolve(this.settings);
    }

    update(client=null, updated) {
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

    delete(client) {
        return Promise.reject(new Error("Settings cannot be deleted"));
    }

}

module.exports = Settings;