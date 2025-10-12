import { db } from './index.js';
import { collection, addDoc, onSnapshot, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const clientsCollection = collection(db, 'clients');
const teammatesCollection = collection(db, 'teammates');

function logout() {
    // For now, just alerts. In a real app, this would redirect to a login page.
    alert('Logged out!');
    // You might want to redirect to index.html
    window.location.href = 'index.html';
}

function addClient() {
    const input = document.getElementById('clientName');
    if (input.value.trim()) {
        const clientList = document.getElementById('clientList');
        const div = document.createElement('div');
        div.className = 'client-item';
        div.innerHTML = `
            <div style="flex: 1;">
                <h4 contenteditable="true">${input.value}</h4>
                <div class="editable-content" contenteditable="true">Add client details here...</div>
            </div>
            <button class="delete-btn">Delete</button>
        `;
        div.querySelector('.delete-btn').addEventListener('click', () => deleteClient(div));
        clientList.appendChild(div);
        input.value = '';
    }
}

function deleteClient(element) {
    element.remove();
}

async function addClientInfo() {
    const nameInput = document.getElementById('infoClientName');
    const projectInput = document.getElementById('infoClientProject');
    const budgetInput = document.getElementById('infoClientBudget');
    const contactInput = document.getElementById('infoClientContact');

    if (nameInput.value.trim()) {
        await addDoc(clientsCollection, {
            name: nameInput.value,
            project: projectInput.value,
            budget: budgetInput.value,
            contact: contactInput.value,
        });
        nameInput.value = '';
        projectInput.value = '';
        budgetInput.value = '';
        contactInput.value = '';
    }
}

async function deleteClientInfo(id) {
    const clientDoc = doc(db, 'clients', id);
    await deleteDoc(clientDoc);
}

async function addTeammate() {
    const nameInput = document.getElementById('teammateNameInput');
    const roleInput = document.getElementById('teammateRoleInput');
    const contactInput = document.getElementById('teammateContactInput');
    const tasksInput = document.getElementById('teammateTasksInput');
    
    if (nameInput.value.trim() && roleInput.value.trim()) {
        await addDoc(teammatesCollection, {
            name: nameInput.value,
            role: roleInput.value,
            contact: contactInput.value,
            tasks: tasksInput.value,
        });
        nameInput.value = '';
        roleInput.value = '';
        contactInput.value = '';
        tasksInput.value = '';
    }
}

async function deleteTeammate(id) {
    const teammateDoc = doc(db, 'teammates', id);
    await deleteDoc(teammateDoc);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.logout-btn').addEventListener('click', logout);

    document.querySelector('button.add-btn[onclick="addClient()"]').addEventListener('click', addClient);
    document.querySelectorAll('#clientList .delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteClient(btn.parentElement));
    });

    // Real-time listener for clients
    onSnapshot(clientsCollection, (snapshot) => {
        const clientInfoTableBody = document.querySelector('#clientInfoTable tbody');
        clientInfoTableBody.innerHTML = ''; // Clear existing rows
        snapshot.docs.forEach(doc => {
            const client = doc.data();
            const row = clientInfoTableBody.insertRow();
            row.innerHTML = `
                <td><a href="client.html?id=${doc.id}">${client.name}</a></td>
                <td>${client.project}</td>
                <td>${client.budget}</td>
                <td>${client.contact}</td>
                <td><button class="delete-btn" data-id="${doc.id}">Delete</button></td>
            `;
        });

        // Add delete listeners to new buttons
        document.querySelectorAll('#clientInfoTable .delete-btn').forEach(button => {
            button.addEventListener('click', (e) => deleteClientInfo(e.target.dataset.id));
        });
    });

    // Real-time listener for teammates
    onSnapshot(teammatesCollection, (snapshot) => {
        const teammateList = document.getElementById('teammateList');
        teammateList.innerHTML = ''; // Clear existing items
        snapshot.docs.forEach(doc => {
            const teammate = doc.data();
            const div = document.createElement('div');
            div.className = 'teammate-item';
            div.innerHTML = `
                <div style="flex: 1;">
                    <a href="teammate.html?id=${doc.id}" style="text-decoration: none; color: inherit;">
                        <strong>${teammate.name}</strong>
                    </a>
                    <br>
                    <span>${teammate.role}</span><br>
                    <small>${teammate.tasks}</small>
                </div>
                <button class="delete-btn" data-id="${doc.id}">Delete</button>
            `;
            teammateList.appendChild(div);
        });

        document.querySelectorAll('#teammateList .delete-btn').forEach(button => {
            button.addEventListener('click', (e) => deleteTeammate(e.target.dataset.id));
        });
    });

    document.querySelector('button.add-btn[onclick="addClientInfo()"]').addEventListener('click', addClientInfo);

    document.querySelector('button.add-btn[onclick="addTeammate()"]').addEventListener('click', addTeammate);

    document.getElementById('clientName').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addClient();
        }
    });
});