let clients = localStorage.getItem('clients') ? JSON.parse(localStorage.getItem('clients')) : [];
let teammates = localStorage.getItem('teammates') ? JSON.parse(localStorage.getItem('teammates')) : [];

function saveAndRender() {
    localStorage.setItem('clients', JSON.stringify(clients));
    localStorage.setItem('teammates', JSON.stringify(teammates));
    render();
}
function addClientInfo() {
    const nameInput = document.getElementById('infoClientName');
    const projectInput = document.getElementById('infoClientProject');
    const budgetInput = document.getElementById('infoClientBudget');
    const contactInput = document.getElementById('infoClientContact');

    if (nameInput.value.trim()) {
        try {
            clients.push({
                id: Date.now().toString(),
                name: nameInput.value,
                project: projectInput.value,
                budget: budgetInput.value,
                contact: contactInput.value,
            });
            saveAndRender();
            nameInput.value = '';
            projectInput.value = '';
            budgetInput.value = '';
            contactInput.value = '';
        } catch (error) {
            console.error("Error adding client: ", error);
        }
    }
}

function deleteClientInfo(id) {
    if (confirm('Are you sure you want to delete this client?')) {
        clients = clients.filter(client => client.id !== id);
        saveAndRender();
    }
}

function addTeammate() {
    const nameInput = document.getElementById('teammateNameInput');
    const roleInput = document.getElementById('teammateRoleInput');
    const contactInput = document.getElementById('teammateContactInput');
    const tasksInput = document.getElementById('teammateTasksInput');
    
    if (nameInput.value.trim() && roleInput.value.trim()) {
        teammates.push({
            id: Date.now().toString(),
            name: nameInput.value,
            role: roleInput.value,
            contact: contactInput.value,
            tasks: tasksInput.value,
        });
        saveAndRender();
        nameInput.value = '';
        roleInput.value = '';
        contactInput.value = '';
        tasksInput.value = '';
    }
}

function deleteTeammate(id) {
    if (confirm('Are you sure you want to delete this teammate?')) {
        teammates = teammates.filter(teammate => teammate.id !== id);
        saveAndRender();
    }
}

function render() {
    const clientGrid = document.getElementById('clientGrid');
    clientGrid.innerHTML = ''; // Clear existing cards
    clients.forEach(client => {
        const card = document.createElement('div');
        card.className = 'client-card';
        card.innerHTML = `
            <h4><a href="client.html?id=${client.id}" style="text-decoration: none; color: inherit;">${client.name}</a></h4>
            <p><strong>Project:</strong> ${client.project || 'N/A'}</p>
            <p><strong>Budget:</strong> ${client.budget || 'N/A'}</p>
            <p><strong>Contact:</strong> ${client.contact || 'N/A'}</p>
            <div style="margin-top: auto; text-align: right;">
                <button class="delete-btn" data-id="${client.id}">Delete</button>
            </div>
        `;
        clientGrid.appendChild(card);
    });
    const teammateList = document.getElementById('teammateList');
    teammateList.innerHTML = ''; // Clear existing items
    teammates.forEach(teammate => {
        const div = document.createElement('div');
        div.className = 'teammate-item';
        div.innerHTML = `
            <div style="flex: 1;">
                <a href="teammate.html?id=${teammate.id}" style="text-decoration: none; color: inherit;">
                    <strong>${teammate.name}</strong>
                </a>
                <br>
                <span>${teammate.role}</span><br>
                <small>${teammate.tasks}</small>
            </div>
            <button class="delete-btn" data-id="${teammate.id}">Delete</button>
        `;
        teammateList.appendChild(div);
    });
}
// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Use a more specific selector for the "Add Client Info" button
    document.getElementById('addClientBtn').addEventListener('click', addClientInfo);

    // Use a more specific selector for the "Add Teammate" button
    document.getElementById('addTeammateBtn').addEventListener('click', addTeammate);

    // Event Delegation for delete buttons
    document.getElementById('clientGrid').addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            deleteClientInfo(e.target.dataset.id);
        }
    });

    document.getElementById('teammateList').addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            deleteTeammate(e.target.dataset.id);
        }
    });
    render();
});