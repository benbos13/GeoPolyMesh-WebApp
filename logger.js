/**
 * @file Logger file that makes code easier to read.
 * @author Kevin Fedyna <kevin.fedyna@etu.univ-amu.fr> [https://github.com/fedyna-k/]
 * @version 0.0.1
 */


/**
 * Logs data in the console.
 * @param  {...any} data The data to log.
 */
export function log(...data) {
    for (let piece of data) {
        console.log(`\x1b[1m[LOG]\x1b[0m  ${piece}`);
    }
    console.log("");
}

/**
 * Logs data in the console, adding warning tag.
 * @param  {...any} data The data to log.
 */
export function warn(...data) {
    for (let piece of data) {
        console.log(`\x1b[1m\x1b[33m[WARNING]\x1b[0m  ${piece}`);
    }
    console.log("");
}

/**
 * Logs data in the console, adding error tag.
 * @param  {...any} data The data to log.
 */
export function error(...data) {
    for (let piece of data) {
        console.log(`\x1b[1m\x1b[31m[ERROR]\x1b[0m  ${piece}`);
    }
    console.log("");
}

/**
 * Tests a condition, if false logs an error message and throw the error.
 * @param {boolean} condition The condition to check.
 * @param {Error} errorClass The error class to call after logging the message.
 * @param {string} message The message to log with error.
 */
export function assert(condition, errorClass, message) {
    if (!condition) {
        error("During assertion...", message);
        throw errorClass(message);
    }
}