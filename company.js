import { db, auth } from './index.js';
import { collection, addDoc, onSnapshot, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

const clientsCollection = collection(db, 'clients');
const teammatesCollection = collection(db, 'teammates');

async function logout() {
    try {
        await signOut(auth);
        // The onAuthStateChanged listener in your main script will handle redirecting to the login page.
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Logout Error:', error);
    }
}

async function addClientInfo() {
    const nameInput = document.getElementById('infoClientName');
    const projectInput = document.getElementById('infoClientProject');
    const budgetInput = document.getElementById('infoClientBudget');
    const contactInput = document.getElementById('infoClientContact');

    if (nameInput.value.trim()) {
        try {
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
        } catch (error) {
            console.error("Error adding client: ", error);
            alert("Failed to add client. Please try again.");
        }
    }
}

async function deleteClientInfo(id) {
    if (confirm('Are you sure you want to delete this client?')) {
        try {
            const clientDoc = doc(db, 'clients', id);
            await deleteDoc(clientDoc);
        } catch (error) {
            console.error("Error deleting client: ", error);
            alert("Failed to delete client. Please try again.");
        }
    }
}

async function addTeammate() {
    const nameInput = document.getElementById('teammateNameInput');
    const roleInput = document.getElementById('teammateRoleInput');
    const contactInput = document.getElementById('teammateContactInput');
    const tasksInput = document.getElementById('teammateTasksInput');
    
    if (nameInput.value.trim() && roleInput.value.trim()) {
        try {
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
        } catch (error) {
            console.error("Error adding teammate: ", error);
            alert("Failed to add teammate. Please try again.");
        }
    }
}

async function deleteTeammate(id) {
    if (confirm('Are you sure you want to delete this teammate?')) {
        try {
            const teammateDoc = doc(db, 'teammates', id);
            await deleteDoc(teammateDoc);
        } catch (error) {
            console.error("Error deleting teammate: ", error);
            alert("Failed to delete teammate. Please try again.");
        }
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.logout-btn').addEventListener('click', logout);

    // Real-time listener for clients
    onSnapshot(clientsCollection, (snapshot) => {
        const clientGrid = document.getElementById('clientGrid');
        clientGrid.innerHTML = ''; // Clear existing cards
        snapshot.docs.forEach(doc => {
            const client = doc.data();
            const card = document.createElement('div');
            card.className = 'client-card';
            card.innerHTML = `
                <h4><a href="client.html?id=${doc.id}" style="text-decoration: none; color: inherit;">${client.name}</a></h4>
                <p><strong>Project:</strong> ${client.project || 'N/A'}</p>
                <p><strong>Budget:</strong> ${client.budget || 'N/A'}</p>
                <p><strong>Contact:</strong> ${client.contact || 'N/A'}</p>
                <div style="margin-top: auto; text-align: right;">
                    <button class="delete-btn" data-id="${doc.id}">Delete</button>
                </div>
            `;
            clientGrid.appendChild(card);
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

    });

    // Use a more specific selector for the "Add Client Info" button
    document.getElementById('addClientBtn').addEventListener('click', addClientInfo);

    // Use a more specific selector for the "Add Teammate" button
    document.getElementById('addTeammateBtn').addEventListener('click', addTeammate);

    // Event Delegation for delete buttons
    document.querySelector('#clientInfoTable tbody').addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            deleteClientInfo(e.target.dataset.id);
        }
    });

    document.getElementById('teammateList').addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            deleteTeammate(e.target.dataset.id);
        }
    });

    // Handle navigation clicks
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent full page reload
            const page = e.currentTarget.dataset.page;
            if (page) {
                window.location.href = page;
            }
        });
    });
});