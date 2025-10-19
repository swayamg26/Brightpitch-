const clientNameHeader = document.getElementById('clientNameHeader');
const fieldsContainer = document.getElementById('clientFieldsContainer');

let clientId;

function deleteClient() {
    if (confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
        let clients = JSON.parse(localStorage.getItem('clients')) || [];
        clients = clients.filter(c => c.id !== clientId);
        localStorage.setItem('clients', JSON.stringify(clients));
        window.location.href = 'company.html'; // Redirect to the company list
    }
}

function saveClientData(clientData) {
    let clients = JSON.parse(localStorage.getItem('clients')) || [];
    const clientIndex = clients.findIndex(c => c.id === clientId);
    if (clientIndex !== -1) {
        clients[clientIndex] = clientData;
        localStorage.setItem('clients', JSON.stringify(clients));
    }
}

function renderFields(clientData) {
    fieldsContainer.innerHTML = '';
    clientData.fields.forEach((field, index) => {
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'detail-field';
        fieldDiv.innerHTML = `
            <label>${field.label} <span class="delete-field-btn" data-index="${index}" title="Delete field">❌</span></label>
            <div contenteditable="true" data-index="${index}">${field.value}</div>
        `;
        fieldsContainer.appendChild(fieldDiv);
    });

    // Add event listeners for the new fields
    fieldsContainer.querySelectorAll('[contenteditable="true"]').forEach(div => {
        div.addEventListener('blur', (e) => {
            const index = parseInt(e.target.dataset.index, 10);
            const newValue = e.target.textContent;
            clientData.fields[index].value = newValue;
        });
    });

    fieldsContainer.querySelectorAll('.delete-field-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index, 10);
            if (confirm(`Are you sure you want to delete the "${clientData.fields[index].label}" field?`)) {
                clientData.fields.splice(index, 1);
                renderFields(clientData); // Re-render the fields without saving
            }
        });
    });
}

function addField(clientData) {
    const newLabel = prompt("Enter the name for the new field (e.g., 'Website'):");
    if (newLabel && newLabel.trim() !== '') {
        clientData.fields.push({ label: newLabel.trim(), value: '' });
        renderFields(clientData); // Re-render without saving
    }
}

function migrateClientData(client) {
    // If client doesn't have a 'fields' array, create it from old properties
    if (!client.fields) {
        client.fields = [
            { label: 'Client Name', value: client.name || '' },
            { label: 'Project Details', value: client.project || '' },
            { label: 'Budget', value: client.budget || '' },
            { label: 'Contact Person', value: client.contact || '' }
        ];
        // Remove old properties
        delete client.name;
        delete client.project;
        delete client.budget;
        delete client.contact;
    }
    return client;
}

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    clientId = params.get('id');

    if (!clientId) {
        clientNameHeader.textContent = 'No Client ID Provided';
        document.getElementById('addFieldBtn').style.display = 'none';
        document.getElementById('deleteClientBtn').style.display = 'none';
        return;
    }

    let clients = JSON.parse(localStorage.getItem('clients')) || [];
    let clientData = clients.find(c => c.id === clientId);

    if (clientData) {        
        // Migrate data if it's in the old format
        let currentData = migrateClientData(JSON.parse(JSON.stringify(clientData)));

        const clientNameField = currentData.fields.find(f => f.label.toLowerCase() === 'client name');
        clientNameHeader.textContent = `Client: ${clientNameField ? clientNameField.value : 'N/A'}`;

        renderFields(currentData);

        document.getElementById('addFieldBtn').addEventListener('click', () => addField(currentData));
        document.getElementById('deleteClientBtn').addEventListener('click', deleteClient);
        document.getElementById('saveChangesBtn').addEventListener('click', () => {
            saveClientData(currentData);
            // Update the header in case the client name was changed
            const updatedNameField = currentData.fields.find(f => f.label.toLowerCase() === 'client name');
            clientNameHeader.textContent = `Client: ${updatedNameField ? updatedNameField.value : 'N/A'}`;
            alert('Changes saved successfully!');
        });

    } else {
        clientNameHeader.textContent = 'Client Not Found';
        document.getElementById('addFieldBtn').style.display = 'none';
        document.getElementById('saveChangesBtn').style.display = 'none';
        document.getElementById('deleteClientBtn').style.display = 'none';
    }
});