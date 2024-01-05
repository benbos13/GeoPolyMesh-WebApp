/**
 * @file For all the global variables and constants.
 * @version 1.0.0
 * @author Kevin Fedyna <kevin.fedyna@etu.univ-amu.fr> [https://github.com/fedyna-k]
 * 
 * Note that file specific constants should remain in their proper file.
 */


/**
 * @typedef BufferedConfiguration
 * @property {string} name
 * @property {boolean} isRoot
 * @property {BufferedArgument[]} args
 * 
 * @typedef BufferedArgument
 * @property {string} name
 * @property {string} type
 * @property {boolean} isMandatory
 * @property {string[]} possibleValues
 * @property {{[argName: string]: string}} bindings
 */

/**
 * @type {BufferedConfiguration} Global variable that stores the configuration JSON.
 */
let buffered_configuration = {
    name: "",
    isRoot: false,
    args: []
};

/**
 * @type {BufferedArgument} Global variable that stores an argument of buffered configuaration.
 */
let buffered_argument = {
    name: "",
    type: "",
    isMandatory: false,
    possibleValues: [],
    bindings: {}
};
