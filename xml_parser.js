/**
 * @file Parser that writes/reads XML files.
 * @author Kevin Fedyna <kevin.fedyna@etu.univ-amu.fr> [https://github.com/fedyna-k/]
 * @author Benjamin Bosco <benjamin.bosco@etu.univ-amu.fr> [https://github.com/benbos13/]
 * @version 0.0.1
 */


import * as fs from "fs";
import * as Logger from "./logger.js";
import { checkType } from "./types.js";


/**
 * @typedef IOTag
 * @property {string} name The tag name.
 * @property {{[argName: string]: string}} args The tag arguments.
 * @property {IOTag[]} children The tag children.
 * @property {string} value The tag value.
 * @property {boolean} is_closing Is the tag a closing tag ?
 * @property {boolean} is_self_closed Is the tag a self-closed ?
 */


/**
 * Read an XML file.
 * @param {string} file_url The XML file to read.
 * @returns {IOTag} The root tag.
 * @throws {SyntaxError} If the XML is not well-formed.
 */
export function read(file_url) {
    let file = fs.readFileSync(file_url, {encoding: "utf-8"}).trim();
    let index = 0;

    let root = "";
    let tag;
    let tag_stack = [];
    let current_value = "";

    while(file[index]) {
        if (file[index] == "<") {
            if (tag_stack.length) {
                tag_stack.at(-1).value += current_value + " ";
                current_value = "";
            }

            [index, tag] = readTag(file, index);
            
            // Choice is to not take into account XML prolog as most XML are now in utf-8.
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

    throw SyntaxError("Root tag was not closed.");
}


/**
 * Reads a tag from file.
 * @param {string} file The file body in string.
 * @param {number} start The index from which we read bytes.
 * @returns {[index: number, tag: IOTag]} The index at the end of tag and the tag.
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

    // Choice is to not take into account XML prolog as most XML are now in utf-8.
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


/**
 * Write JSON data into xml file.
 * @param {string} file_url The file URL in which we want to write the data.
 * @param {IOTag} data The data to parse into XML
 */
export function write(file_url, data) {
    let content = `<?xml version="1.0" encoding="utf-8" standalone="yes"?>\n`;
    content += createToken(data);

    fs.writeFileSync(file_url, content);
}


/**
 * Parse JSON IOTag to XML tag string.
 * @param {IOTag} data The data to parse into XML
 * @param {number} shift The shift in spaces to apply
 */
function createToken(data, shift=0) {
    checkType(data.name, "name", "string", false);
    checkType(data.value, "value", "string");
    checkType(data.children, "children", "array");
    checkType(data.args, "args", "object");

    data.value = data.value ?? "";
    data.children = data.children ?? [];
    data.args = data.args ?? {};

    let space = " ".repeat(shift);

    let args = "";
    for (let argName in data.args) {
        let value = data.args[argName].toString();
        value = value.replaceAll("\"", "&quot;")

        args += ` ${argName}="${value}"`;
    }

    if (!data.value && data.children.length == 0) {
        return `${space}<${data.name}${args}/>`;
    }

    let content = `${space}<${data.name}${args}>\n`;
    if (data.value) {
        content += `${space}    ${data.value}\n`;
    }
    
    for (let child of data.children) {
        content += createToken(child, shift + 4) + "\n";
    }

    content += `${space}</${data.name}>`;
    
    return content;
}