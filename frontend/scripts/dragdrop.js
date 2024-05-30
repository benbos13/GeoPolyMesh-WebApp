const API_URL = "http://localhost:3000/api/upload";

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
    uploadFile(e.dataTransfer.files);
});

fileInput.addEventListener('change', () => {
    uploadFile(fileInput.files);
});

function uploadFile(files) {
    fileList.innerHTML = '';
    for (let file of files) {
        var listItem = document.createElement('li');
        listItem.textContent = file.name;

        deleteCross(file, listItem);
        fileList.appendChild(listItem);
    }
    sendButton(files, listItem);
}

function deleteCross (file, listItem) {
    let deleteButton = document.createElement('img');
        deleteButton.src = './assets/x-mark.png'; 
        deleteButton.style.width = '16px'; 
        deleteButton.style.height = '16px';
        deleteButton.style.cursor = 'pointer';
        deleteButton.style.marginLeft = '10px';
        deleteButton.style.verticalAlign = 'middle';
    deleteButton.addEventListener('click', () => {
        removeFile(file, listItem);
    });

    listItem.appendChild(deleteButton);
    fileList.appendChild(listItem);
}

function sendButton(files, listItem) {
    let sendButton = document.createElement('button');
        sendButton.textContent = 'Send';
        sendButtonStyles(sendButton);
    sendButton.addEventListener('click', () => {
        sendFile(files);
        listItem.remove();
        sendButton.remove();
    });

    fileList.appendChild(sendButton);
}

// Delete file from the list
function removeFile(file, listItem) {
    // Remove only on the client side
    listItem.remove();
    // Remove the file from the File to send, otherwise it won't be displayed anymore but still sent
    let files = Array.from(fileList.children).map(li => li.textContent);
}

async function sendFile(files) { 
    try {
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('file', files[i]);
        }
        const response = await fetch(API_URL, {
            method: 'POST',
            body: formData
        });
        console.log('Server response:', await response.text());
        alert("File sent successfully.");
    } catch (error) {
        console.error('Error while sending the file to the server:', error);
        alert("File not sent to the server. Please check the server connection.");
    }
}


function sendButtonStyles(sendButton){
    sendButton.style.display = 'block';
    sendButton.style.margin = 'auto';
    sendButton.style.marginTop = '1em';
    sendButton.style.marginBottom = '1em';
    sendButton.style.textAlign = 'center';
    sendButton.style.horizontalAlign = 'middle';
    sendButton.style.backgroundColor = 'transparent';
    sendButton.style.padding = '0.5em 1em';
    sendButton.style.border = '2px solid var(--primary-color)';
    sendButton.style.borderRadius = '.5em';
    sendButton.style.userSelect = 'none';
    sendButton.style.transition = 'transform 200ms cubic-bezier(.14,1.94,.52,1.41), color 200ms ease-out';
    sendButton.style.fontFamily = 'Jetbrains Mono, monospace';
    sendButton.style.fontSize = '1em';

    sendButton.addEventListener('mouseover', () => {
        sendButton.style.transform = 'scale(1.1)';
        sendButton.style.color = 'var(--primary-color)';
        sendButton.style.cursor = 'pointer';
    });

    sendButton.addEventListener('mouseout', () => {
        sendButton.style.transform = 'scale(1)';
        sendButton.style.color = 'black';
    });

}
