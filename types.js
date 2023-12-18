/**
 * @file Type file. It contains all class definitions used throughout the program.
 * @author Kevin Fedyna <kevin.fedyna@etu.univ-amu.fr> [https://github.com/fedyna-k/]
 * @version 0.0.1
 */

/**
 * @typedef TagConstructorObject
 * @property {string} name The name of the XML tag.
 * @property {boolean} [isRoot] Must be true for only one Tag.
 * @property {ArgumentConstructorObject[]} [args] Array of Argument describers.
 * 
 * @typedef TagObject
 * @property {string} name The name of the XML tag.
 * @property {boolean} isRoot Must be true for only one Tag.
 * @property {Argument[]} args Array of Argument describers.
 * 
 * @typedef { "string"|
*      "float"|"double"|
*      "int8"|"uint8"|
*      "int16"|"uint16"|
*      "int32"|"uint32"|
*      "int64"|"uint64"
* } CppType
* 
* @typedef ArgumentConstructorObject
* @property {string} name The name of the tag argument.
* @property {CppType} type The value required type.
* @property {boolean} [isMandatory] Is the argument required for validation ?
* @property {string[]} [possibleValues] Enumeration of possible values for the argument.
* @property {{[argName: string]: string}} [bindings] Values required for other arguments for this one to be valid.
* 
* @typedef ArgumentObject
* @property {string} name The name of the tag argument.
* @property {CppType} type The value required type.
* @property {boolean} isMandatory Is the argument required for validation ?
* @property {string[]} possibleValues Enumeration of possible values for the argument.
* @property {{[argName: string]: string}} bindings Values required for other arguments for this one to be valid.
* 
* @typedef NodeConstructorObject
* @property {string} tag The tag associated to the node.
* @property {boolean} [isMandatory] Is the node mandatory ?
* @property {(NodeConstructorObject|EnumConstructorObject)[]} [children] List of the node's children.
* 
* @typedef NodeObject
* @property {string} tag The tag associated to the node.
* @property {boolean} isMandatory Is the node mandatory ?
* @property {(NodeObject|EnumObject)[]} children List of the node's children.
* 
* @typedef EnumConstructorObject
* @property {true} isEnum Flag describing the node as enum.
* @property {number} [enumCount] The number of node beeing simultaneously in the same level.
* @property {NodeConstructorObject[]} enumList The list of the Enum's nodes.
* 
* @typedef EnumObject
* @property {true} isEnum Flag describing the node as enum.
* @property {number} enumCount The number of node beeing simultaneously in the same level.
* @property {NodeObject[]} enumList The list of the Enum's nodes.
*/


/** @type {CppType[]} */
const CPP_TYPES = ["string", "float", "double", "int8", "uint8", "int16", "uint16", "int32", "uint32", "int64", "uint64"];


/**
* Check if the variable is in the right type.
* @param {any} value The variable to check
* @param {string} name The name to display on error
* @param {"number"|"string"|"array"|"object"|"boolean"|"regexp"} type The type the variable should be
* @param {boolean} allowUndefined Is undefined allowed ?
* @throws {TypeError} If the type is not correct.
*/
function checkType(value, name, type, allow_undefined=true) {
   let compare_type = (type == "regexp") ? "string" : type;

   if (typeof value == "undefined") {
       if (allow_undefined) {
           return;
       }

       throw TypeError(`"${name}" property is mandatory.`);
   }

   if (type == "array" && !Array.isArray(value)) {
       throw TypeError(`"${name}" property should be of type array.`);
   }

   if (type != "array" && typeof value != compare_type) {
       throw TypeError(`"${name}" property should be of type ${type} (currently ${typeof value}).`);
   }
}


/**
* Parser class for Tag objects.
*/
class Tag {
   /**
    * Create a new instance of Tag object.
    * @param {TagConstructorObject} json_tag Object representing an XML tag.
    * @throws {SyntaxError|TypeError} If json_tag is not valid.
    */
   constructor(json_tag) {
       checkType(json_tag.name, "name", "string", false);
       checkType(json_tag.isRoot, "isRoot", "boolean");
       checkType(json_tag.args, "args", "array");

       if (json_tag.name.toLocaleLowerCase().startsWith("xml")) {
           throw SyntaxError("\"name\" property shouldn't start with \"xml\".")
       }

       if (json_tag.name.match(/^[a-zA-Z_][\w\-\.]*$/g) == null) {
           throw SyntaxError("\"name\" should follow xml naming rules.")
       }
       
       this.name = json_tag.name;
       this.isRoot = json_tag.isRoot ?? false;
       this.args = json_tag.args ?? [];

       let processed_arguments = [];
       let argument_list = [];

       for (let argument of this.args) {
           let processed = new Argument(argument);
           processed_arguments.push(processed.json());
           argument_list.push(processed.name);
       }

       for (let argument of processed_arguments) {
           for (let binding_argument of Object.keys(argument.bindings)) {
               if (argument_list.indexOf(binding_argument) == -1) {
                   throw SyntaxError("\"bindings\" keys should all be other arguments from the tag.")
               }
           }
       }

       this.args = processed_arguments;
   }

   /**
    * Get the JSON representation of the Tag.
    * @returns {TagObject} The processed and validated TagObject.
    */
   json() {
       return {
           name: this.name,
           isRoot: this.isRoot,
           args: this.args
       };
   }
}


/**
* Parser class for Argument objects.
*/
class Argument {
   /**
    * Create a new instance of Argument object.
    * @param {ArgumentConstructorObject} json_arg Object representing an XML tag argument.
    * @throws {RangeError|TypeError} If json_arg is not valid.
    */
   constructor(json_arg) {
       checkType(json_arg.name, "name", "string", false);
       checkType(json_arg.type, "type", "string", false);
       checkType(json_arg.isMandatory, "isMandatory", "boolean");
       checkType(json_arg.possibleValues, "possibleValues", "array");
       checkType(json_arg.bindings, "bindings", "object");

       this.name = json_arg.name;
       
       this.type = json_arg.type;
       if (CPP_TYPES.indexOf(this.type) == -1) {
           throw RangeError("\"type\" property should be one of CppType values.");
       }

       this.isMandatory = json_arg.isMandatory ?? false;
       this.possibleValues = json_arg.possibleValues ?? [];
       this.bindings = json_arg.bindings ?? {};

       for (let possibleValue of this.possibleValues) {
           checkType(possibleValue, "possibleValue", "string", false);
       }

       for (let binding_condition of Object.values(this.bindings)) {
           checkType(binding_condition, "bindings value", "regexp", false);
       }
   }

   /**
    * Get the JSON representation of the Argument.
    * @returns {ArgumentObject} The processed and validated ArgumentObject.
    */
   json() {
       return {
           name: this.name,
           type: this.type,
           isMandatory: this.isMandatory,
           possibleValues: this.possibleValues,
           bindings: this.bindings
       };
   }
}


/**
* Parser class for Node objects.
*/
class Node {
   /**
    * Create a new instance of Node object.
    * @param {NodeConstructorObject} json_node Object representing an XML node.
    * @param {Tag[]} tags The parsed tags in the configuration file.
    * @throws {RangeError|TypeError} If json_node is not valid.
    */
   constructor(json_node, tags) {
       checkType(json_node.tag, "tag", "string", false);
       checkType(json_node.isMandatory, "isMandatory", "boolean");
       checkType(json_node.children, "children", "array");

       this.tag = json_node.tag;
       this.isMandatory = json_node.isMandatory ?? false;
       this.children = json_node.children ?? [];

       let tag_names = tags.map(tag => tag.name);
       if (tag_names.indexOf(this.tag) == -1) {
           throw RangeError("\"tag\" property should be in declared tags list.");
       }

       this.isMandatory = this.isMandatory || tags.filter(tag => tag.name == this.tag)[0].isRoot;

       let processed_children = [];
       for (let child of this.children) {
           let processed = child.isEnum ? new Enum(child, tags) : new Node(child, tags);
           processed_children.push(processed);
       }

       this.children = processed_children;
   }

   /**
    * Get the JSON representation of the Node.
    * @returns {NodeObject} The processed and validated NodeObject.
    */
   json() {
       return {
           tag: this.tag,
           isMandatory: this.isMandatory,
           children: this.children
       };
   }
}


/**
* Parser class for Enum objects.
*/
class Enum {
   /**
    * Create a new instance of Enum object.
    * @param {EnumConstructorObject} json_enum Object representing an XML enum.
    * @param {Tag[]} tags The parsed tags in the configuration file.
    * @throws {RangeError|TypeError} If json_node is not valid.
    */
   constructor(json_enum, tags) {
       checkType(json_enum.isEnum, "isEnum", "boolean", false);
       checkType(json_enum.enumCount, "enumCount", "number");
       checkType(json_enum.enumList, "enumList", "array", false);
       
       if (!json_enum.isEnum) {
           throw RangeError("\"isEnum\" property must be set to true.");
       }

       if (json_enum.enumCount < 1 || !Number.isInteger(json_enum.enumCount)) {
           throw RangeError("\"enumCount\" property must be an integer greater than 0.");
       }

       if (json_enum.enumList.length < 2) {
           throw RangeError("\"enumList\" property length should be greater than 1.");
       }

       this.isEnum = true;
       this.enumCount = json_enum.enumCount ?? 1;
       this.enumList = json_enum.enumList;
       
       let processed_enumList = [];
       for (let node of this.enumList) {
           let processed = new Node(node, tags);
           processed_enumList.push(processed);
       }

       this.enumList = processed_enumList;
   }

   /**
    * Get the JSON representation of the Enum.
    * @returns {EnumObject} The processed and validated EnumObject.
    */
   json() {
       return {
           isEnum: true,
           enumCount: this.enumCount,
           enumList: this.enumList
       };
   }
}

export { CPP_TYPES, checkType, Tag, Argument, Node, Enum };