const teammateNameHeader = document.getElementById('teammateNameHeader');
const fieldsContainer = document.getElementById('teammateFieldsContainer');

let teammateId;

function deleteTeammate() {
    if (confirm('Are you sure you want to delete this teammate? This action cannot be undone.')) {
        let teammates = JSON.parse(localStorage.getItem('teammates')) || [];
        teammates = teammates.filter(t => t.id !== teammateId);
        localStorage.setItem('teammates', JSON.stringify(teammates));
        window.location.href = 'company.html'; // Redirect to the company list
    }
}

function saveTeammateData(teammateData) {
    let teammates = JSON.parse(localStorage.getItem('teammates')) || [];
    const teammateIndex = teammates.findIndex(t => t.id === teammateId);
    if (teammateIndex !== -1) {
        teammates[teammateIndex] = teammateData;
        localStorage.setItem('teammates', JSON.stringify(teammates));
    }
}

function renderFields(teammateData) {
    fieldsContainer.innerHTML = '';
    teammateData.fields.forEach((field, index) => {
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
            teammateData.fields[index].value = newValue;
        });
    });

    fieldsContainer.querySelectorAll('.delete-field-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index, 10);
            if (confirm(`Are you sure you want to delete the "${teammateData.fields[index].label}" field?`)) {
                teammateData.fields.splice(index, 1);
                renderFields(teammateData); // Re-render the fields without saving
            }
        });
    });
}

function addField(teammateData) {
    const newLabel = prompt("Enter the name for the new field (e.g., 'Skills'):");
    if (newLabel && newLabel.trim() !== '') {
        teammateData.fields.push({ label: newLabel.trim(), value: '' });
        renderFields(teammateData); // Re-render without saving
    }
}

function migrateTeammateData(teammate) {
    // If teammate doesn't have a 'fields' array, create it from old properties
    if (!teammate.fields) {
        teammate.fields = [
            { label: 'Name', value: teammate.name || '' },
            { label: 'Role', value: teammate.role || '' },
            { label: 'Contact Info', value: teammate.contact || '' },
            { label: 'Assigned Tasks', value: teammate.tasks || '' }
        ];
        // Remove old properties
        delete teammate.name;
        delete teammate.role;
        delete teammate.contact;
        delete teammate.tasks;
    }
    return teammate;
}

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    teammateId = params.get('id');

    if (!teammateId) {
        teammateNameHeader.textContent = 'No Teammate ID Provided';
        document.getElementById('addFieldBtn').style.display = 'none';
        document.getElementById('saveChangesBtn').style.display = 'none';
        document.getElementById('deleteTeammateBtn').style.display = 'none';
        return;
    }

    let teammates = JSON.parse(localStorage.getItem('teammates')) || [];
    let teammateData = teammates.find(t => t.id === teammateId);

    if (teammateData) {
        // Migrate data if it's in the old format
        let currentData = migrateTeammateData(JSON.parse(JSON.stringify(teammateData)));

        const teammateNameField = currentData.fields.find(f => f.label.toLowerCase() === 'name');
        teammateNameHeader.textContent = `Teammate: ${teammateNameField ? teammateNameField.value : 'N/A'}`;

        renderFields(currentData);

        document.getElementById('addFieldBtn').addEventListener('click', () => addField(currentData));
        document.getElementById('deleteTeammateBtn').addEventListener('click', deleteTeammate);
        document.getElementById('saveChangesBtn').addEventListener('click', () => {
            saveTeammateData(currentData);
            // Update the header in case the teammate name was changed
            const updatedNameField = currentData.fields.find(f => f.label.toLowerCase() === 'name');
            teammateNameHeader.textContent = `Teammate: ${updatedNameField ? updatedNameField.value : 'N/A'}`;
            alert('Changes saved successfully!');
        });

    } else {
        teammateNameHeader.textContent = 'Teammate Not Found';
        document.getElementById('addFieldBtn').style.display = 'none';
        document.getElementById('saveChangesBtn').style.display = 'none';
        document.getElementById('deleteTeammateBtn').style.display = 'none';
    }
});