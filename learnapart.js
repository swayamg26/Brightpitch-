let collaborators = localStorage.getItem('collaborators') ? JSON.parse(localStorage.getItem('collaborators')) : [];
let learnEvents = localStorage.getItem('learnEvents') ? JSON.parse(localStorage.getItem('learnEvents')) : [];
let learnNotes = localStorage.getItem('learnNotes') ? JSON.parse(localStorage.getItem('learnNotes')) : [];
let currentEditingItemId = null;
let currentEditingItemType = null;

const learnEditModal = document.getElementById('learnEditModal');
const learnModalTitle = document.getElementById('learnModalTitle');
const learnModalFields = document.getElementById('learnModalFields');
const closeModalBtn = learnEditModal.querySelector('.close-modal');
const saveLearnItemBtn = document.getElementById('saveLearnItemBtn');
const deleteLearnItemBtn = document.getElementById('deleteLearnItemBtn');

function saveCollaborators() {
    localStorage.setItem('collaborators', JSON.stringify(collaborators));
}

function saveLearnEvents() {
    localStorage.setItem('learnEvents', JSON.stringify(learnEvents));
}

function saveLearnNotes() {
    localStorage.setItem('learnNotes', JSON.stringify(learnNotes));
}

function renderCollaborators() {
    const collaboratorListDiv = document.getElementById('collaboratorList');
    collaboratorListDiv.innerHTML = '';
    collaborators.forEach(collab => {
        const card = document.createElement('div');
        card.className = 'learn-item-card';
        card.innerHTML = `
            <strong>${collab.name}</strong>
            <p>${collab.details}</p>
            <div class="actions">
                <button class="edit-btn" data-id="${collab.id}" data-type="collaborator">Edit</button>
                <button class="delete-btn" data-id="${collab.id}" data-type="collaborator">Delete</button>
            </div>
        `;
        collaboratorListDiv.appendChild(card);
    });
}

function renderLearnEvents() {
    const eventsTableBody = document.getElementById('eventsTableBody');
    eventsTableBody.innerHTML = '';
    learnEvents.forEach(event => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${event.title}</td>
            <td>${event.date}</td>
            <td>${event.location}</td>
            <td>
                <button class="edit-btn" data-id="${event.id}" data-type="event">Edit</button>
                <button class="delete-btn" data-id="${event.id}" data-type="event">Delete</button>
            </td>
        `;
        eventsTableBody.appendChild(row);
    });
}

function renderNotes() {
    const notesListDiv = document.getElementById('notesList');
    notesListDiv.innerHTML = '';
    learnNotes.forEach((note, index) => {
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'learn-item-card'; // Reusing class for consistent styling
        fieldDiv.innerHTML = `
            <label style="font-weight: bold; color: #764ba2;">${note.label}</label>
            <div class="editable-content" contenteditable="true" data-index="${index}">${note.value}</div>
            <div class="actions">
                <button class="delete-btn" data-index="${index}" data-type="note">Delete Field</button>
            </div>
        `;
        notesListDiv.appendChild(fieldDiv);
    });

    // Add blur event listeners to save content changes to the in-memory array
    notesListDiv.querySelectorAll('.editable-content').forEach(div => {
        div.addEventListener('blur', (e) => {
            const index = parseInt(e.target.dataset.index, 10);
            learnNotes[index].value = e.target.innerText;
        });
    });
}

function addNoteField() {
    const label = prompt("Enter a heading for the new field:");
    if (label && label.trim() !== '') {
        learnNotes.push({ label: label.trim(), value: '' });
        renderNotes(); // Re-render to show the new field
    }
}

function openLearnModal(id, type) {
    currentEditingItemId = id;
    currentEditingItemType = type;
    learnModalFields.innerHTML = ''; // Clear previous fields

    if (type === 'collaborator') {
        const collab = collaborators.find(c => c.id === id);
        learnModalTitle.textContent = collab ? `Edit Collaborator: ${collab.name}` : 'Add Collaborator';
        learnModalFields.innerHTML = `
            <label for="collabName">Name:</label>
            <input type="text" id="collabName" value="${collab ? collab.name : ''}">
            <label for="collabDetails">Details:</label>
            <textarea id="collabDetails">${collab ? collab.details : ''}</textarea>
        `;
    } else if (type === 'event') {
        const event = learnEvents.find(e => e.id === id);
        learnModalTitle.textContent = event ? `Edit Event: ${event.title}` : 'Add Event';
        learnModalFields.innerHTML = `
            <label for="eventTitle">Title:</label>
            <input type="text" id="eventTitle" value="${event ? event.title : ''}">
            <label for="eventDate">Date:</label>
            <input type="date" id="eventDate" value="${event ? event.date : ''}">
            <label for="eventLocation">Location:</label>
            <input type="text" id="eventLocation" value="${event ? event.location : ''}">
        `;
    }

    learnEditModal.classList.add('active');
}

function closeLearnModal() {
    currentEditingItemId = null;
    currentEditingItemType = null;
    learnEditModal.classList.remove('active');
}

function addLearnItem(type) {
    if (type === 'collaborator') {
        const name = prompt("Enter collaborator's name:");
        if (name && name.trim() !== '') {
            collaborators.push({ id: Date.now(), name: name.trim(), details: 'Add details here...' });
            saveCollaborators();
            renderCollaborators();
        }
    } else if (type === 'event') {
        const title = prompt("Enter event title:");
        if (title && title.trim() !== '') {
            learnEvents.push({ id: Date.now(), title: title.trim(), date: '', location: '' });
            saveLearnEvents();
            renderLearnEvents();
        }
    }
}

function saveLearnItem() {
    if (!currentEditingItemId || !currentEditingItemType) return;

    if (currentEditingItemType === 'collaborator') {
        const collabIndex = collaborators.findIndex(c => c.id === currentEditingItemId);
        if (collabIndex > -1) {
            const name = document.getElementById('collabName').value.trim();
            if (!name) {
                alert('Collaborator name cannot be empty.');
                return; // Stop the function if validation fails
            }
            collaborators[collabIndex].name = name;
            collaborators[collabIndex].details = document.getElementById('collabDetails').value.trim();
            saveCollaborators();
            renderCollaborators();
        }
    } else if (currentEditingItemType === 'event') {
        const eventIndex = learnEvents.findIndex(e => e.id === currentEditingItemId);
        if (eventIndex > -1) {
            const title = document.getElementById('eventTitle').value.trim();
            const date = document.getElementById('eventDate').value.trim();

            if (!title || !date) {
                alert('Event title and date are required.');
                return; // Stop the function if validation fails
            }

            learnEvents[eventIndex].title = title;
            learnEvents[eventIndex].date = date;
            learnEvents[eventIndex].location = document.getElementById('eventLocation').value.trim();
            saveLearnEvents();
            renderLearnEvents();
        }
    }
    closeLearnModal();
}

function deleteLearnItem() {
    if (!currentEditingItemId || !currentEditingItemType) return;

    if (confirm(`Are you sure you want to delete this ${currentEditingItemType}?`)) {
        if (currentEditingItemType === 'collaborator') {
            collaborators = collaborators.filter(c => c.id !== currentEditingItemId);
            saveCollaborators();
            renderCollaborators();
        } else if (currentEditingItemType === 'event') {
            learnEvents = learnEvents.filter(e => e.id !== currentEditingItemId);
            saveLearnEvents();
            renderLearnEvents();
        }
        closeLearnModal();
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initial rendering
    renderCollaborators();
    renderLearnEvents();
    renderNotes();

    // Add Item buttons
    document.querySelectorAll('.add-item-btn').forEach(button => {
        button.addEventListener('click', () => addLearnItem(button.dataset.type));
    });

    // Event delegation for Edit/Delete buttons on dynamically created items
    document.getElementById('collaboratorList').addEventListener('click', (e) => {
        if (e.target.classList.contains('edit-btn')) {
            openLearnModal(parseInt(e.target.dataset.id), e.target.dataset.type);
        } else if (e.target.classList.contains('delete-btn')) {
            // For direct delete, we can call deleteLearnItem directly or open modal for confirmation
            currentEditingItemId = parseInt(e.target.dataset.id);
            currentEditingItemType = e.target.dataset.type;
            deleteLearnItem();
        }
    });

    document.getElementById('eventsTableBody').addEventListener('click', (e) => {
        if (e.target.classList.contains('edit-btn')) {
            openLearnModal(parseInt(e.target.dataset.id), e.target.dataset.type);
        } else if (e.target.classList.contains('delete-btn')) {
            currentEditingItemId = parseInt(e.target.dataset.id);
            currentEditingItemType = e.target.dataset.type;
            deleteLearnItem();
        }
    });

    // Event delegation for Notes section
    document.getElementById('notesList').addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn') && e.target.dataset.type === 'note') {
            const index = parseInt(e.target.dataset.index, 10);
            if (confirm(`Are you sure you want to delete the "${learnNotes[index].label}" field?`)) {
                learnNotes.splice(index, 1);
                renderNotes(); // Re-render without the deleted field
            }
        }
    });

    document.getElementById('addNoteFieldBtn').addEventListener('click', addNoteField);
    document.getElementById('saveNotesBtn').addEventListener('click', () => {
        saveLearnNotes();
        alert('Notes saved successfully!');
    });

    // Modal buttons
    closeModalBtn.addEventListener('click', closeLearnModal);
    saveLearnItemBtn.addEventListener('click', saveLearnItem);
    deleteLearnItemBtn.addEventListener('click', deleteLearnItem);

    // Close modal if backdrop is clicked
    learnEditModal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeLearnModal();
        }
    });
});