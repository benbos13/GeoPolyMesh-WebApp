/**
 * @file Parser that uses JSON configuration file to write/read XML files.
 * @author Kevin Fedyna <kevin.fedyna@etu.univ-amu.fr> [https://github.com/fedyna-k/]
 * @version 0.0.1
 */


import * as fs from "fs";
import * as Types from "./types.js";
import * as Logger from "./logger.js";


/**
 * @typedef ReadTag
 * @property {string} name The tag name
 * @property {{[argName: string]: string}} args The tag arguments
 * @property {boolean} is_closing Is the tag a closing tag ?
 * @property {boolean} is_self_closed Is the tag a self-closed ?
 */


/**
 * Read a XML file given a JSON configuration file.
 * @param {string} file_url The XML file to read.
 */
function read(file_url) {
    let file = fs.readFileSync(file_url, {encoding: "utf-8"}).trim();
    let root = "";
    let tag;
    let tag_stack = [];
    let current_value = "";
    let index = 0;

    while(file[index]) {
        if (file[index] == "<") {
            if (tag_stack.length) {
                tag_stack.at(-1).value += current_value + " ";
                current_value = "";
            }

            [index, tag] = readTag(file, index);
            
            if (tag == null) {
                continue;
            }

            if (root == "") {
                root = tag.name;
            }

            tag.children = [];
            tag.value = "";

            if (!tag.is_closing && !tag.is_self_closed) {
                tag_stack.push(tag);
            }

            if (tag.is_closing) {
                Logger.assert(tag.name == tag_stack.at(-1).name, SyntaxError, "XML tags can not be intertwined.");

                tag = tag_stack.pop();
                delete tag.is_closing;
                delete tag.is_self_closed;
                tag.value = tag.value.trim().replaceAll("\n", " ");

                if (tag.name == root) {
                    return tag;
                }

                tag_stack.at(-1).children.push(tag);
            }

            if (tag.is_self_closed) {
                delete tag.is_closing;
                delete tag.is_self_closed;
                tag.value = tag.value.trim().replaceAll("\n", " ");

                if (tag.name == root) {
                    return tag;
                }

                tag_stack.at(-1).children.push(tag);
            }
        } else {
            current_value += file[index];
        }

        index++;
    }
}


/**
 * Reads a tag from file.
 * @param {string} file The file body in string.
 * @param {number} start The index from which we read bytes.
 * @returns {[index: number, tag: ReadTag]} The index at the end of tag and the tag.
 */
function readTag(file, start) {
    let tag = { name: "", args: {}, is_closing: false, is_self_closed: false };
    let index = start + 1;

    let current_token = "";
    let current_string = "";
    let token_count = 0;
    
    let is_affecting = false;
    let is_self_closed = false;
    let is_closing = false;
    
    Logger.assert(file[start] == "<", SyntaxError, "\"start\" should be the index of the first \"<\" character.");

    if (file[index] == "?") {
        let end = file.indexOf("?>", start + 2)
        Logger.assert(end != -1, SyntaxError, "Missing \"?>\" closing sequence for XML prolog.");

        return [end + 2, null];
    }

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

    Logger.assert(token_count, SyntaxError, "Tag should have a name.");

    tag.is_closing = is_closing;
    tag.is_self_closed = is_self_closed;

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

Logger.log("Fichier XML input.xml")
Logger.log(read("pattern/input.xml"));