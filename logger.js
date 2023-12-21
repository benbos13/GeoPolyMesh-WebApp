/**
 * @file Logger file that makes code easier to read.
 * @author Kevin Fedyna <kevin.fedyna@etu.univ-amu.fr> [https://github.com/fedyna-k/]
 * @version 0.0.1
 */


import { readFileSync } from "fs";
import { inspect } from "util";


/**
 * Logs data in the console.
 * @param  {...any} data The data to log.
 */
export function log(...data) {
    for (let piece of data) {
        if (piece == "") {
            console.log("");
        } else {
            piece = typeof piece == "object" ?  inspect(piece, false, null, true) : piece;
            console.log(`\x1b[1m[LOG]\x1b[0m\t\t`, piece);
        }
    }
}

/**
 * Logs data in the console, adding warning tag.
 * @param  {...any} data The data to log.
 */
export function warn(...data) {
    for (let piece of data) {
        if (piece == "") {
            console.log("");
        } else {
            piece = typeof piece == "object" ?  inspect(piece, false, null, true) : piece;
            console.warn(`\x1b[1m\x1b[33m[WARNING]\x1b[0m\x1b[33m\t`, piece, "\x1b[0m");
        }
    }
}

/**
 * Logs data in the console, adding error tag.
 * @param  {...any} data The data to log.
 */
export function error(...data) {
    for (let piece of data) {
        if (piece == "") {
            console.log("");
        } else {
            piece = typeof piece == "object" ?  inspect(piece, false, null, true) : piece;
            console.error(`\x1b[1m\x1b[31m[ERROR]\x1b[0m\x1b[31m\t\t`, piece, "\x1b[0m");
        }
    }
}

/**
 * Tests a condition, if false logs an error message and throw the error.
 * @param {boolean} condition The condition to check.
 * @param {Error} errorClass The error class to call after logging the message.
 * @param {string} message The message to log with error.
 */
export function assert(condition, errorClass, message) {
    if (!condition) {
        error("During assertion...", message, "");
        throw errorClass(message);
    }
}

/**
 * Displays a progressbar in the console.
 * @param {number} progress A number between 0 and total.
 * @param {number} total The total amout corresponding to 100%.
 * @param {number} width The with of the progressbar.
 */
export function progressbar(progress, total, width) {
    let done = Math.floor(width * progress / total);
    let part = Math.floor((width * progress / total - done) * 3);
    let char = ["░", "▒", "▓"][part];
    let done_percent = Math.floor(100 * progress / total);
    
    if (progress == 0) {
        console.log(`\x1b[1m\x1b[34m[PROGRESS]\x1b[0m\t \x1b[0m${"█".repeat(width)}\x1b[0m  0% `);
    }

    if (progress < total) {
        process.stdout.write(`\r\x1b[1m\x1b[34m[PROGRESS]\x1b[0m\t \x1b[34m\x1b[1m${"█".repeat(done)}${char}\x1b[0m${"░".repeat(width - 1 - done)}\x1b[0m  ${done_percent}% `);
    }

    if (progress >= total) {
        process.stdout.write(`\r`);
        console.log(`\x1b[1m\x1b[34m[PROGRESS]\x1b[0m\t \x1b[34m\x1b[1m${"█".repeat(width)}\x1b[0m  100% `);
    }
}


/**
 * Displays help message.
 */
export function help() {
    console.log(readFileSync("./help.txt", { encoding: "utf-8" }));
}

/**
 * Displays version message.
 */
export function version() {
    let full_message = readFileSync("./help.txt", { encoding: "utf-8" });
    // We add \r? to handle both unix and windows.
    console.log(full_message.split(/(\r?\n){3}/)[0], "\n");
}