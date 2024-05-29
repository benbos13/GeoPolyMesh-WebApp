/**
 * @file For page management. Allow loading-free page change.
 * @version 1.0.0
 * @author Kevin Fedyna <kevin.fedyna@etu.univ-amu.fr> [https://github.com/fedyna-k]
 * @author Benjamin Bosco <benjamin.bosco@etu.univ-amu.fr> [https://github.com/benbos13/]
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

// Listerners for tabs
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.getAttribute('data-tab')).classList.add('active');
    });
});

// Drag & drop area

const dragDropArea = document.getElementById('drag-drop-area');
const fileInput = document.getElementById('file-input');
const fileList = document.getElementById('file-list');

dragDropArea.addEventListener('click', () => fileInput.click());

dragDropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dragDropArea.classList.add('dragging');
});

dragDropArea.addEventListener('dragleave', () => {
    dragDropArea.classList.remove('dragging');
});

dragDropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dragDropArea.classList.remove('dragging');
    sendFile(e.dataTransfer.files);
});

fileInput.addEventListener('change', () => {
    sendFile(fileInput.files);
});

function sendFile(files) {
    fileList.innerHTML = '';
    
    for (let file of files) {
        let listItem = document.createElement('li');
        listItem.textContent = file.name;
        fileList.appendChild(listItem);
    }
}