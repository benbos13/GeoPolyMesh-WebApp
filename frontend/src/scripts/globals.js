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


/**
 * All hard coded limits as JavaScript works only with doubles.
 * Input min and max are coded as strings.
 */
const LIMITS = {
    float: {
        min: "-3.402823466e38",
        max: "3.402823466e38"
    },
    double: {
        min: "-1.7976931348623158e308",
        max: "1.7976931348623158e308"
    },
    int8: {
        min: "-128",
        max: "127",
        unsigned_max: "255" 
    },
    int16: {
        min: "-32768",
        max: "32767",
        unsigned_max: "65535"
    },
    int32: {
        min: "-2147483648",
        max: "2147483647",
        unsigned_max: "4294967295"
    },
    int64: {
        min: "-9223372036854775808",
        max: "9223372036854775809",
        unsigned_max: "18446744073709551615"
    }
}