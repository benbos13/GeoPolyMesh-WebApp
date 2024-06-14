

async function addCheckboxesProperties(API_URL){
    console.log('Waiting for So2Cov to finish');    
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
    
    for (let propertyGroup in properties) {
        const subsection = document.createElement('h2')
        subsection.textContent = 'Select the properties that you want to use:';
        const propertyGroupTitle = document.createElement('h3');
        propertyGroupTitle.textContent = propertyGroup;
        propertiesDiv.appendChild(subsection);
        propertiesDiv.appendChild(propertyGroupTitle);

        const propertyList = properties[propertyGroup];
        propertyList.forEach(property => {
            let checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.name = property;
            checkbox.value = property;
            checkbox.id = property;
            checkbox.checked = true;
            propertiesDiv.appendChild(checkbox);

            let label = document.createElement('label');
            label.htmlFor = property;
            label.appendChild(document.createTextNode(property));
            propertiesDiv.appendChild(label);

            propertiesDiv.appendChild(document.createElement('br'));
        });
    }
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