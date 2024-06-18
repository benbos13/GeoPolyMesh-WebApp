

async function addCheckboxesProperties(){ 
    try {
        console.log(API_URL + 'download/properties');
        const response = await fetch(API_URL + 'download/properties', {
            method: 'GET',
        });
        const data = await response.text();
        const properties = JSON.parse(data);
        dispProperties(properties);
    } catch (error) {
        console.error(error);
        return;
    }
}

function dispProperties(properties){
    const propertiesDiv = document.getElementById('properties');
    propertiesDiv.innerHTML = '';

    // Call PropertiesSendButton and append the button to propertiesDiv
    const sendPropertiesButton = PropertiesSendButton();
    propertiesDiv.appendChild(sendPropertiesButton);

    for (let propertyGroup in properties) {
        const subsection = document.createElement('h2');
        subsection.textContent = 'Select the property that you want to use:';
        propertiesDiv.appendChild(subsection);

        const propertyGroupTitle = document.createElement('h3');
        propertyGroupTitle.textContent = propertyGroup;
        propertiesDiv.appendChild(propertyGroupTitle);

        const propertyList = properties[propertyGroup];
        propertyList.forEach(property => {
            let checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.name = property;
            checkbox.value = property;
            checkbox.id = property;
            checkbox.checked = false;
            propertiesDiv.appendChild(checkbox);

            let label = document.createElement('label');
            label.htmlFor = property;
            label.appendChild(document.createTextNode(property));
            propertiesDiv.appendChild(label);

            propertiesDiv.appendChild(document.createElement('br'));
        });
    }
    //const sendPropertiesButton = PropertiesSendButton(data, API_URL);
    propertiesDiv.appendChild(sendPropertiesButton);
}

function getCheckedProperties(){
    const propertiesDiv = document.getElementById('properties');
    const checkboxes = propertiesDiv.getElementsByTagName('input');
    let checkedProperties = [];
    for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            checkedProperties.push(checkboxes[i].value);
        }
    }
    return checkedProperties;
}

function PropertiesSendButton() {
    let sendPropertiesButton = document.createElement('button');
    sendPropertiesButton.id = 'sendPropertiesButton';
    sendPropertiesButton.textContent = 'Generate with selected properties';
    PropertiesSendButtonStyles(sendPropertiesButton);

    sendPropertiesButton.addEventListener('click', () => {
        const checkedProperties = getCheckedProperties();
        sendProperties(checkedProperties);
        sendPropertiesButton.remove();
    });

    return sendPropertiesButton; // Return the button element
}

async function sendProperties(checkedProperties) { 
    try {
        const jsonObject = {
            Property: checkedProperties
        };
        const jsonBody = JSON.stringify(jsonObject);
        const response = await fetch(API_URL + 'upload/json', {
            method: 'POST',
            body: jsonBody,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Server response:', result);
    } catch (error) {
        console.error('Error while sending the file to the server:', error);
        alert("File not sent to the server. Please check the server connection.");
    }
}

function PropertiesSendButtonStyles(sendButton) {
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