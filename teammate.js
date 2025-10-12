import { db } from './index.js';
import { doc, onSnapshot, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const teammateNameHeader = document.getElementById('teammateNameHeader');
const teammateNameEl = document.getElementById('teammateName');
const teammateRoleEl = document.getElementById('teammateRole');
const teammateContactEl = document.getElementById('teammateContact');
const teammateTasksEl = document.getElementById('teammateTasks');

let teammateDocRef;

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const teammateId = params.get('id');

    if (!teammateId) {
        teammateNameHeader.textContent = 'No Teammate ID Provided';
        return;
    }

    teammateDocRef = doc(db, 'teammates', teammateId);

    // Listen for real-time updates
    onSnapshot(teammateDocRef, (doc) => {
        if (doc.exists()) {
            const teammateData = doc.data();
            teammateNameHeader.textContent = `Teammate: ${teammateData.name}`;
            teammateNameEl.textContent = teammateData.name;
            teammateRoleEl.textContent = teammateData.role;
            teammateContactEl.textContent = teammateData.contact;
            teammateTasksEl.textContent = teammateData.tasks;
        } else {
            teammateNameHeader.textContent = 'Teammate Not Found';
        }
    });

    // Add event listeners to save on edit
    const editableFields = [teammateNameEl, teammateRoleEl, teammateContactEl, teammateTasksEl];
    editableFields.forEach(field => {
        field.addEventListener('blur', async (e) => {
            const fieldName = e.target.dataset.field;
            const newValue = e.target.textContent;

            if (teammateDocRef) {
                await updateDoc(teammateDocRef, {
                    [fieldName]: newValue
                });
            }
        });
    });
});