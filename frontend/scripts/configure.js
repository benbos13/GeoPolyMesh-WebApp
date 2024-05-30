/**
 * @file Frontend JS file for WebApp configuration.
 * @version 1.0.0
 * @author Kevin Fedyna <kevin.fedyna@etu.univ-amu.fr> [https://github.com/fedyna-k]
 * @author Benjamin Bosco <benjamin.bosco@etu.univ-amu.fr> [https://github.com/benbos13/]
 * It allows to create, edit and load JSON configuration files.
 */


const TAG_NAME_INPUT = document.querySelector("#name");
const TAG_ROOT = document.querySelector("#isRoot");
const TAG_SUMMARY = document.querySelector("#tag-summary");

const ARG_CREATION = document.querySelector("#create-arg");

const ARG_NAME_INPUT = document.querySelector("#arg-name");
const ARG_TYPE_INPUT = document.querySelector("#arg-type");
const ARG_MANDATORY = document.querySelector("#is-mandatory")
const ARG_VALUE_INPUT = document.querySelector("#possible-value");
const ARG_BINDING_INPUTS = {
    arg: document.querySelector("#binding-arg"),
    regex: document.querySelector("#binding-regex")
};

const POSSIBLE_VALUES = document.querySelector("#possible-values");
const BINDINGS = document.querySelector("#bindings");


/**
 * Configure the input type for possible values.
 */
function configure_value_input() {
    let selected_type = ARG_TYPE_INPUT.value;
    buffered_argument.type = selected_type;
    ARG_VALUE_INPUT.value = "";

    if (selected_type == "string" || selected_type == "") {
        ARG_VALUE_INPUT.type = "text";
        return;
    }

    ARG_VALUE_INPUT.type = "number";

    let unsigned = selected_type.startsWith("u")
    let type = unsigned ? selected_type.slice(1) : selected_type;

    ARG_VALUE_INPUT.min = LIMITS[type].min;
    ARG_VALUE_INPUT.max = unsigned ? LIMITS[type].unsigned_max : LIMITS[type].max;
}


/**
 * Create a new possible value and adds it to DOM.
 * @param {string} value The new value to create
 * @param {boolean} only_html Only create the value in DOM ?
 */
function create_possible_value(value, only_html=false) {
    let div = document.createElement("div");
    div.classList.add("value");

    let img = document.createElement("img");
    img.src = "delete.svg";
    img.alt = `Delete "${value}"`;
    img.onclick = () => {
        POSSIBLE_VALUES.removeChild(div);
        buffered_argument.possibleValues = buffered_argument.possibleValues.filter(e => e != value);
    };

    let inside = document.createElement("div");
    inside.classList.add("blue");
    inside.innerHTML = value;

    div.appendChild(img);
    div.appendChild(inside);

    POSSIBLE_VALUES.appendChild(div);
    if (!only_html) {
        buffered_argument.possibleValues.push(value);
    }
}


/**
 * Configure the input arguments for bindings.
 */
function configure_bindings() {
    ARG_BINDING_INPUTS.arg.innerHTML = `<option value="" selected>Select an argument...</option>`;

    for (let arg of buffered_configuration.args) {
        let option = document.createElement("option");
        option.value = arg.name;
        option.innerHTML = arg.name;

        ARG_BINDING_INPUTS.arg.appendChild(option);
    }
}


/**
 * Create a new binding and adds it to DOM.
 * @param {string} argument The bound argument
 * @param {string} regex The regex that validates the binding
 * @param {boolean} only_html Only create the value in DOM ?
 */
function create_binding(argument, regex, only_html=false) {
    let div = document.createElement("div");
    div.classList.add("value");

    let img = document.createElement("img");
    img.src = "delete.svg";
    img.alt = `Delete binding to "${argument}"`;
    img.onclick = () => {
        BINDINGS.removeChild(div);
        delete buffered_argument.bindings[argument];
    };

    let argument_div = document.createElement("div");
    argument_div.innerHTML = argument;

    let regex_div = document.createElement("div");
    regex_div.innerHTML = regex;
    regex_div.classList.add("blue");

    div.appendChild(img);
    div.appendChild(argument_div);
    div.appendChild(regex_div);

    BINDINGS.appendChild(div);
    if (!only_html) {
        buffered_argument.bindings[argument] = regex;
    }
}


/**
 * Loads an argument inside the editor
 * @param {BufferedArgument} argument The argument to load
 */
function load_argument(argument) {
    ARG_NAME_INPUT.value = argument.name;
    ARG_TYPE_INPUT.value = argument.type;
    ARG_MANDATORY.checked = argument.isMandatory;
    
    for (let value of argument.possibleValues) {
        create_possible_value(value, true);
    }

    for (let binding in argument.bindings) {
        create_binding(binding, argument.bindings[binding], true);
    }

    buffered_argument = argument;
}


/**
 * Displays all arguments in tag summary.
 */
function display_arguments() {
    // Clear args
    document.querySelectorAll(".tag-arg").forEach(element => {
        TAG_SUMMARY.removeChild(element);
    });

    for (let arg of buffered_configuration.args) {
        let wrapper = document.createElement("div");
        wrapper.classList.add("tag-arg", "tag-summary");

        wrapper.innerHTML  = `<div class="tag-summary-title">Arg name</div><div>${arg.name}</div>`;
        wrapper.innerHTML += `<div class="tag-summary-title">Arg type</div><div>${arg.type}</div>`;
        wrapper.innerHTML += `<div class="tag-summary-title">Is mandatory?</div><div>${arg.isMandatory}</div>`;

        if (arg.possibleValues.length) {
            let possible_values = "";

            if (arg.type == "string") {
                possible_values = JSON.stringify(arg.possibleValues);
            } else {
                possible_values = `[${arg.possibleValues.join(", ")}]`;
            }

            wrapper.innerHTML += `<div class="tag-summary-title">Possible values</div><div>${possible_values}</div>`;
        }

        if (Object.keys(arg.bindings).length) {
            let bindings = document.createElement("div");
            bindings.innerHTML = "";
            bindings.classList.add("tag-summary");

            for (let binding in arg.bindings) {
                bindings.innerHTML += `<div class="tag-summary-title">${binding}</div><div>${arg.bindings[binding]}</div>`;
            }

            wrapper.innerHTML += `<div class="tag-summary-title">Bindings</div>`;
            wrapper.appendChild(bindings);
        }

        let button_wrapper = document.createElement("div");
        button_wrapper.classList.add("tag-arg", "tag-summary-title");
        
        let edit = document.createElement("img");
        edit.src = "edit.svg";
        edit.alt = `Edit "${arg.name}" argument`;
        edit.onclick = () => {
            load_argument(arg);
            buffered_configuration.args = buffered_configuration.args.filter(e => e.name != arg.name);
            
            TAG_SUMMARY.removeChild(wrapper);
            TAG_SUMMARY.removeChild(button_wrapper);
            
            configure_value_input();
            configure_bindings();
            display_arguments();
        };

        let remove = document.createElement("img");
        remove.src = "delete.svg";
        remove.alt = `Delete "${arg.name}" argument`;
        remove.onclick = () => {
            buffered_configuration.args = buffered_configuration.args.filter(e => e.name != arg.name);
            
            TAG_SUMMARY.removeChild(wrapper);
            TAG_SUMMARY.removeChild(button_wrapper);
            
            configure_value_input();
            configure_bindings();
            display_arguments();
        };

        button_wrapper.appendChild(edit);
        button_wrapper.appendChild(remove);

        TAG_SUMMARY.appendChild(button_wrapper);
        TAG_SUMMARY.appendChild(wrapper);
    }
}


/**
 * Argument inputs listeners
 */

ARG_NAME_INPUT.addEventListener("keyup", () => {
    buffered_argument.name = ARG_NAME_INPUT.value;
});

ARG_TYPE_INPUT.addEventListener("change", configure_value_input);

ARG_MANDATORY.addEventListener("change", () => {
    buffered_argument.isMandatory = ARG_MANDATORY.checked;
});

ARG_VALUE_INPUT.addEventListener("keypress", event => {
    let is_valid = ARG_VALUE_INPUT.checkValidity() && buffered_argument.possibleValues.indexOf(ARG_VALUE_INPUT.value) == -1;
    if (event.key == "Enter" && is_valid) {
        create_possible_value(ARG_VALUE_INPUT.value);
        ARG_VALUE_INPUT.value = "";
    }
});

Object.values(ARG_BINDING_INPUTS).forEach(elem => {
    elem.addEventListener("keypress", event => {
        let is_valid = ARG_BINDING_INPUTS.arg.checkValidity() && ARG_BINDING_INPUTS.regex.checkValidity() && !buffered_argument.bindings[ARG_BINDING_INPUTS.arg.value];
        if (event.key == "Enter" && is_valid) {
            create_binding(ARG_BINDING_INPUTS.arg.value, ARG_BINDING_INPUTS.regex.value);
            ARG_BINDING_INPUTS.arg.value = "";
            ARG_BINDING_INPUTS.regex.value = "";
        }
    });
});

ARG_CREATION.onclick = () => {
    if (!ARG_NAME_INPUT.checkValidity() || !ARG_TYPE_INPUT.checkValidity()) {
        return;
    }

    if (buffered_configuration.args.map(e => e.name).indexOf(buffered_argument.name) != -1) {
        return;
    }

    buffered_configuration.args.push(buffered_argument);
    buffered_argument = {
        name: "",
        type: "",
        isMandatory: false,
        possibleValues: [],
        bindings: {}
    };

    ARG_NAME_INPUT.value = "";
    ARG_TYPE_INPUT.value = "";
    ARG_MANDATORY.checked = false;
    ARG_VALUE_INPUT.value = "";
    ARG_BINDING_INPUTS.arg.value = "";
    ARG_BINDING_INPUTS.regex.value = "";
    POSSIBLE_VALUES.innerHTML = "";
    BINDINGS.innerHTML = "";

    display_arguments();
    configure_value_input();
    configure_bindings();
}


TAG_NAME_INPUT.addEventListener("keyup", () => {
    buffered_configuration.name = TAG_NAME_INPUT.value;
    document.querySelector("#display-tag-name").innerHTML = TAG_NAME_INPUT.value;
    document.querySelector("#display-tag-name").style.color = TAG_NAME_INPUT.checkValidity() ? "#1a1a1f" : "#d98026";
});

TAG_ROOT.addEventListener("change", () => {
    buffered_configuration.isRoot = TAG_ROOT.checked;
    document.querySelector("#display-tag-root").innerHTML = TAG_ROOT.checked;
});