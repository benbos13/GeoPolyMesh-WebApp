/**
 * @file Parser that reads a JSON configuration file and returns a configuration object.
 * @author Kevin Fedyna <kevin.fedyna@etu.univ-amu.fr> [https://github.com/fedyna-k/]
 * @author Benjamin Bosco <benjamin.bosco@etu.univ-amu.fr> [https://github.com/benbos13/]
 * @version 0.0.1
 */


import * as fs from "fs";
import * as Types from "./types.js";
import * as Logger from "./logger.js";


/**
 * Load the JSON configuration file and parse it.
 * @param {string} file_url The JSON configuration file url.
 * @returns {{tags: Types.Tag[], file_structure: Types.Node}} The fully loaded configuration file.
 */
function configure(file_url) {
    Logger.assert(fs.existsSync(file_url), SyntaxError, "Given file does not exist : " + file_url);

    let file_stream = fs.readFileSync(file_url, {encoding: "utf-8"});
    let data = JSON.parse(file_stream);

    Types.checkType(data.tags, "tags", "array", false);
    Types.checkType(data.fileStructure, "fileStructure", "object", false);

    let tags = [];
    let root_tag = "";
    for (let tag_constructor of data.tags) {
        let tag = new Types.Tag(tag_constructor);
        tags.push(tag);
        
        if (tag.isRoot) {
            if (root_tag != "") {
                throw SyntaxError("Only one tag should be root tag.");
            }
            root_tag = tag.name;
        }
    }

    Logger.assert(root_tag != "", SyntaxError, "One tag should be marked as root tag.");

    let file_structure = new Types.Node(data.fileStructure, tags);

    Logger.assert(file_structure.tag == root_tag, SyntaxError, `First node in file structure should be the root tag ("${root_tag}" tag).`);

    return {tags, file_structure};
}


export { configure };