// JsonManipulator.js
class JsonManipulator {
    constructor(json) {
        this.json = json;  // Store the initial JSON object
    }

    // Retrieve the value associated with a given path
    getValue(path) {
        const keys = this._parsePath(path);
        let result = this.json;
        for (let key of keys) {
            if (result[key] === undefined) {
                return undefined;
            }
            result = result[key];
        }
        return result;
    }

    // Set a value for a given path
    setValue(path, value) {
        const keys = this._parsePath(path);
        let result = this.json;
        for (let i = 0; i < keys.length - 1; i++) {
            if (result[keys[i]] === undefined) {
                result[keys[i]] = isNaN(keys[i + 1]) ? {} : [];  // Create an object or array
            }
            result = result[keys[i]];
        }
        result[keys[keys.length - 1]] = value;
    }

    // Remove the value from a given path
    removeValue(path) {
        const keys = this._parsePath(path);
        let result = this.json;
        for (let i = 0; i < keys.length - 1; i++) {
            if (result[keys[i]] === undefined) {
                return;
            }
            result = result[keys[i]];
        }
        delete result[keys[keys.length - 1]];
    }

    // Add a value to an array or object at the given path
    addValue(path, value) {
        const keys = this._parsePath(path);
        let result = this.json;
        for (let i = 0; i < keys.length - 1; i++) {
            if (result[keys[i]] === undefined) {
                result[keys[i]] = isNaN(keys[i + 1]) ? {} : [];
            }
            result = result[keys[i]];
        }
        if (Array.isArray(result)) {
            result.push(value);
        } else {
            result[keys[keys.length - 1]] = value;
        }
    }

    // Private function to convert a path into an array of keys
    _parsePath(path) {
        return path.replace(/\[(\d+)\]/g, '.$1').split('.');  // Convert "imp[0].bidfloor" to ["imp", "0", "bidfloor"]
    }

    // Optional: Check if a path exists
    has(path) {
        return this.getValue(path) !== undefined;
    }

    // Get the entire JSON object
    get() {
        return this.json;
    }
}

module.exports = JsonManipulator;
