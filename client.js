import { db } from './index.js';
import { doc, onSnapshot, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const clientNameHeader = document.getElementById('clientNameHeader');
const clientNameEl = document.getElementById('clientName');
const clientProjectEl = document.getElementById('clientProject');
const clientBudgetEl = document.getElementById('clientBudget');
const clientContactEl = document.getElementById('clientContact');

let clientDocRef;

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const clientId = params.get('id');

    if (!clientId) {
        clientNameHeader.textContent = 'No Client ID Provided';
        return;
    }

    clientDocRef = doc(db, 'clients', clientId);

    // Listen for real-time updates
    onSnapshot(clientDocRef, (doc) => {
        if (doc.exists()) {
            const clientData = doc.data();
            clientNameHeader.textContent = `Client Details: ${clientData.name}`;
            clientNameEl.textContent = clientData.name;
            clientProjectEl.textContent = clientData.project;
            clientBudgetEl.textContent = clientData.budget;
            clientContactEl.textContent = clientData.contact;
        } else {
            clientNameHeader.textContent = 'Client Not Found';
        }
    });

    // Add event listeners to save on edit
    const editableFields = [clientNameEl, clientProjectEl, clientBudgetEl, clientContactEl];
    editableFields.forEach(field => {
        field.addEventListener('blur', async (e) => {
            const fieldName = e.target.dataset.field;
            const newValue = e.target.textContent;

            await updateDoc(clientDocRef, {
                [fieldName]: newValue
            });
        });
    });
});