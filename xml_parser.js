/**
 * @file Parser that uses JSON configuration file to write/read XML files.
 * @author Kevin Fedyna <kevin.fedyna@etu.univ-amu.fr> [https://github.com/fedyna-k/]
 * @version 0.0.1
 */


import * as fs from "fs";
import * as Types from "./types.js";
import * as Logger from "./logger.js";


/**
 * Read a XML file given a JSON configuration file.
 * @param {string} file_url The XML file to read.
 */
function read(file_url) {
    let raw_data = fs.readFileSync(file_url, {encoding: "utf-8"}).trim();


}


/**
 * Reads a tag from file.
 * @param {string} file The file body in string.
 * @param {number} start The index from which we read bytes.
 * @returns {[index: number, tag]} The index at the end of tag and the tag.
 */
function readTag(file, start) {
    let tag = { name: "", args: {} };
    let index = start + 1;

    let current_token = "";
    let current_string = "";
    let token_count = 0;
    
    let is_affecting = false;
    let is_self_closed = false;
    let is_closing = false;
    
    Logger.assert(file[start] == "<", SyntaxError, "\"start\" should be the index of the first \"<\" character.");

    while (file[index] != ">") {
        Logger.assert(file[index] && file[index] != "<", SyntaxError, "Tag should always be closed by \">\" character.");

        if (file[index] == "/") {
            if (token_count == 0) {
                is_closing = true;
            } else {
                is_self_closed = true;
            }

            index++;
        }

        if (file[index] == " ") {
            index++;
            continue;
        }

        if (file[index].match(/[0-9a-zA-Z_\-]/)) {
            Logger.assert(!is_self_closed, SyntaxError, "Tag can not contain caracters other than \" \" or \">\" after beeing self-closed.");
            Logger.assert(!is_closing || token_count < 1, SyntaxError, "Closing Tag must only contain the tag's name.");

            [index, current_token] = readToken(file, index);
            token_count++;

            if (token_count == 1) {
                tag.name = current_token;
            }
        }

        if (file[index] == "=") {
            Logger.assert(!is_self_closed, SyntaxError, "Tag can not contain caracters other than \" \" or \">\" after beeing self-closed.");
            Logger.assert(token_count > 1, SyntaxError, "Affectation should start from second token.");

            is_affecting = true;
            index++;
        }

        if (file[index].match(/[\"\']/)) {
            Logger.assert(!is_self_closed, SyntaxError, "Tag can not contain caracters other than \" \" or \">\" after beeing self-closed.");
            Logger.assert(is_affecting, SyntaxError, "Strings should be in the right hand side of affectation.");

            [index, current_string] = readString(file, index);

            tag.args[current_token] = current_string;
            is_affecting = false;
        }
    }

    Logger.assert(token_count, SyntaxError, "Tag should have a name.")

    tag.is_closing = is_self_closed || is_closing

    return [index, tag];
}


/**
 * Reads a token from xml.
 * @param {string} file The file body in string.
 * @param {number} start The index from which we read bytes.
 * @returns {[index: number, token: string]} The read token
 */
function readToken(file, start) {
    let token = "";
    let index = start;

    while (file[index].match(/[0-9a-zA-Z_\-]/)) {
        token += file[index];
        index++;
    }

    return [index, token];
}


/**
 * Reads a string from xml.
 * @param {string} file The file body in string.
 * @param {number} start The index from which we read bytes.
 * @returns {[index: number, string: string]} The read token
 */
function readString(file, start) {
    let string = "";
    let index = start + 1;
    let delimiter = file[start];

    while (file[index] && (file[index] != delimiter || file[index - 1] == "\\")) {
        string += file[index];
        index++;
    }

    return [index + 1, string];
}

