/**
 * @file Main file, used to call functions and program in console.
 * @author Kevin Fedyna <kevin.fedyna@etu.univ-amu.fr> [https://github.com/fedyna-k/]
 * @author Benjamin Bosco <benjamin.bosco@etu.univ-amu.fr> [https://github.com/benbos13/]
 * @version 0.0.1
 */


import { configure } from "./configure.js";
import { read, write } from "./xml_parser.js";
import * as Logger from "./logger.js";
import { writeFileSync, readFileSync } from "fs";
import { start } from "./frontend/server.js";

// Starting the server to upload solid files
const port = 3000;
start(port); 

const command_arg_map = {
    "-h": 0,
    "--help": 0,
    "help": 0,
    "-v": 0,
    "--version": 0,
    "-r": 1,
    "read": 1,
    "-w": 1,
    "write": 1,
    "-o": 1,
    "output": 1,
    "-c": 1,
    "configure": 1,
    "-d": 0,
    "discard": 0
};

const all_commands = Object.keys(command_arg_map);
const all_args = process.argv.slice(2);

let inputs = {};
for (let i = 0 ; i < all_args.length ; i++) {
    let arg = all_args[i];
    
    if (all_commands.indexOf(arg) == -1) {
        Logger.error(`No command named ${arg}.`, "See \"node . help\".");
        process.exit(1);
    }

    inputs[arg] = all_args.slice(i + 1, i + 1 + command_arg_map[arg]);
    i += command_arg_map[arg];
}

const commands = Object.keys(inputs);

if (commands.indexOf("help") != -1 || commands.indexOf("--help") != -1 || commands.indexOf("-h") != -1) {
    Logger.help();
    process.exit(0);
}

if (commands.indexOf("-v") != -1 || commands.indexOf("--version") != -1) {
    Logger.version();''
    process.exit(0);
}

if (commands.length == 1 && (commands[0] == "-o" || commands[0] == "output")) {
    Logger.error("Output command should be used with read/write commands.");
    process.exit(1);
}

let is_reading = Math.max(commands.indexOf("-r"), commands.indexOf("read"));
let is_writing = Math.max(commands.indexOf("-w"), commands.indexOf("write"));
if (is_reading != -1 && is_writing != -1) {
    Logger.error("Can not read and write during the same process.");
    process.exit(1);
}

for (let command of commands) {
    if (command == "read" || command == "-r") {
        Logger.log(`Reading file "${inputs[command][0]}"...`);
        let json = JSON.stringify(read(inputs[command][0]));
        let output_command_index = Math.max(commands.indexOf("-o"), commands.indexOf("output"));
        
        if (output_command_index != -1) {
            let file_name = inputs[commands[output_command_index]][0] + ".json";
            writeFileSync(file_name, json);
            Logger.log(`File named "${file_name}" generated successfully.`);
        } else {
            let file_name = inputs[command][0].split("/").at(-1) + ".json";
            writeFileSync(file_name, json);
            Logger.log(`File named "${file_name}" generated successfully.`);
        }
    }

    if (command == "write" || command == "-w") {
        Logger.log(`Reading file "${inputs[command][0]}"...`);
        let data = JSON.parse(readFileSync(inputs[command][0], {encoding:"utf-8"}));
        let output_command_index = Math.max(commands.indexOf("-o"), commands.indexOf("output"));
        
        if (output_command_index != -1) {
            let file_name = inputs[commands[output_command_index]][0] + ".xml"; 
            write(file_name, data);
            Logger.log(`File named "${file_name}" generated successfully.`);
        } else {
            let file_name = inputs[command][0].split("/").at(-1) + ".xml";
            write(file_name, data);
            Logger.log(`File named "${file_name}" generated successfully.`);
        }
        
    }

    if (command == "configure" || command == "-c") {
        configure(inputs[command][0]);
    }
}