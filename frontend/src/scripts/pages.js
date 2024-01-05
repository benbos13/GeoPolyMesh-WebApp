/**
 * @file For page management. Allow loading-free page change.
 * @version 1.0.0
 * @author Kevin Fedyna <kevin.fedyna@etu.univ-amu.fr> [https://github.com/fedyna-k]
 */

const ALL_PAGES = document.querySelectorAll("section");
const TITLE = document.querySelector("h1");
const BUTTON_DIV = document.querySelector("#header-buttons");
const TITLES = {
    "main": "",
    "how-to-use": "User Manual",
    "configuration": "Configuration"
}
const BUTTONS = {
    "how-to-use": "How to use ?",
    "main": "XML Parser",
    "configuration": "Configure"
}
const DEFAULT_PAGE = "configuration";


/**
 * Change the visibility of sections in order to navigate.
 * Create buttons and titles for navigation as well.
 * 
 * @param {string} page_id The page id
 * @see {@link create_buttons} {@link create_title}
 */
function navigate_to(page_id) {
    for (let page of ALL_PAGES) {
        page.style.display = page.id == page_id ? "block" : "none";
    }

    create_buttons(page_id);
    create_title(page_id);
}


/**
 * Create all buttons for given page id.
 * 
 * @param {string} page_id The visible page id
 */
function create_buttons(page_id) {
    BUTTON_DIV.innerHTML = "";

    for (let id in BUTTONS) {
        if (id != page_id) {
            let button = document.createElement("div");
            button.classList.add("button");
            button.innerText = BUTTONS[id];
            button.onclick = () => navigate_to(id);

            BUTTON_DIV.appendChild(button);
        }
    }
}


/**
 * Create custom titles to help navigation.
 * 
 * @param {string} page_id The visible page id
 */
function create_title(page_id) {
    TITLE.innerText = `INGEO${TITLES[page_id] ? " - " + TITLES[page_id] : ""}`;
    document.title = `INGEO${TITLES[page_id] ? " - " + TITLES[page_id] : ""} - GeoPolyMesh Input Manager`;
}


navigate_to(DEFAULT_PAGE);