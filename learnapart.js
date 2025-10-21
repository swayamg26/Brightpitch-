let collaborators = localStorage.getItem('collaborators') ? JSON.parse(localStorage.getItem('collaborators')) : [];
let learnEvents = localStorage.getItem('learnEvents') ? JSON.parse(localStorage.getItem('learnEvents')) : [];
let learnNotes = localStorage.getItem('learnNotes') ? JSON.parse(localStorage.getItem('learnNotes')) : [];
let nav = 0; // For month navigation
let currentEditingItemId = null;
let currentEditingItemType = null;

const learnEditModal = document.getElementById('learnEditModal');
const learnModalTitle = document.getElementById('learnModalTitle');
const learnModalFields = document.getElementById('learnModalFields');
const closeModalBtn = learnEditModal.querySelector('.close-modal');
const saveLearnItemBtn = document.getElementById('saveLearnItemBtn');
const deleteLearnItemBtn = document.getElementById('deleteLearnItemBtn');

// Helper function to migrate old data structure to new 'fields' structure
function migrateLearnItemData(item, type) {
    if (!item || item.fields) { // Already migrated or null
        return item;
    }

    const newItem = { ...item, fields: [] }; // Create a new object to avoid modifying original during iteration
    if (type === 'collaborator') {
        newItem.fields.push({ label: 'Name', value: item.name || '' });
        newItem.fields.push({ label: 'Details', value: item.details || '' });
        // Remove old properties if they exist
        delete newItem.name;
        delete newItem.details;
    } else if (type === 'event') {
        newItem.fields.push({ label: 'Title', value: item.title || '' });
        newItem.fields.push({ label: 'Date', value: item.date || '' });
        newItem.fields.push({ label: 'Location', value: item.location || '' });
        delete newItem.title;
        delete newItem.date;
        delete newItem.location;
    }
    return newItem;
}

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
    collaborators.forEach(rawCollab => {
        // Ensure the collaborator has the new 'fields' structure
        const collab = migrateLearnItemData(rawCollab, 'collaborator');

        const card = document.createElement('div');
        card.className = 'learn-item-card';
        let cardContent = '';
        collab.fields.forEach(field => {
            cardContent += `<p><strong>${field.label}:</strong> ${field.value}</p>`;
        });
        card.innerHTML = `
            ${cardContent}
            <div class="actions">
                <button class="edit-btn" data-id="${collab.id}" data-type="collaborator">Edit</button>
                <button class="delete-btn" data-id="${collab.id}" data-type="collaborator">Delete</button>
            </div>
        `;
        collaboratorListDiv.appendChild(card);
    });
}

function renderLearnEvents() {
    const eventsListDiv = document.getElementById('eventsList');
    eventsListDiv.innerHTML = '';

    const dt = new Date();
    if (nav !== 0) {
        dt.setMonth(new Date().getMonth() + nav);
    }
    const currentMonth = dt.getMonth();
    const currentYear = dt.getFullYear();

    document.getElementById('currentMonthDisplay').innerText = 
        `${dt.toLocaleDateString('en-us', { month: 'long' })} ${currentYear}`;

    const monthlyEvents = learnEvents.filter(rawEvent => {
        // Ensure the event has the new 'fields' structure
        const event = migrateLearnItemData(rawEvent, 'event');
        const dateField = event.fields.find(f => f.label.toLowerCase() === 'date');
        if (!dateField || !dateField.value) {
            return false; // Don't show events without a date in month view
        }
        const eventDate = new Date(dateField.value);
        // Adjust for timezone by getting date parts in UTC to avoid off-by-one day errors
        return eventDate.getUTCFullYear() === currentYear && eventDate.getUTCMonth() === currentMonth;
    });

    monthlyEvents.forEach(rawEvent => {
        const event = migrateLearnItemData(rawEvent, 'event'); // Already migrated but good practice
        const card = document.createElement('div');
        card.className = 'learn-item-card'; // Reuse the same card style
        let cardContent = '';
        event.fields.forEach(field => {
            cardContent += `<p><strong>${field.label}:</strong> ${field.value}</p>`;
        });
        card.innerHTML = `
            ${cardContent}
            <div class="actions">
                <button class="edit-btn" data-id="${event.id}" data-type="event">Edit</button>
                <button class="delete-btn" data-id="${event.id}" data-type="event">Delete</button>
            </div>
        `;
        eventsListDiv.appendChild(card);
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

    let item;
    if (type === 'collaborator') {
        item = collaborators.find(c => c.id === id);
        learnModalTitle.textContent = item ? `Edit Collaborator: ${item.fields.find(f => f.label.toLowerCase() === 'name')?.value || ''}` : 'Add Collaborator';
    } else if (type === 'event') {
        item = learnEvents.find(e => e.id === id);
        learnModalTitle.textContent = item ? `Edit Event: ${item.fields.find(f => f.label.toLowerCase() === 'title')?.value || ''}` : 'Add Event';
    }

    // Ensure item is migrated to the new structure for editing
    item = migrateLearnItemData(item, type);

    item.fields.forEach((field, index) => {
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'detail-field'; // Reusing styling from client/teammate pages
        let inputElement;
        if (field.label.toLowerCase() === 'details' || field.label.toLowerCase() === 'description') {
            inputElement = `<textarea id="modalField-${index}" data-field-label="${field.label}">${field.value}</textarea>`;
        } else if (field.label.toLowerCase() === 'date') {
            inputElement = `<input type="date" id="modalField-${index}" data-field-label="${field.label}" value="${field.value}">`;
        } else {
            inputElement = `<input type="text" id="modalField-${index}" data-field-label="${field.label}" value="${field.value}">`;
        }

        // Determine if it's a default field (cannot be deleted from modal)
        const isDefaultField = (type === 'collaborator' && (field.label.toLowerCase() === 'name' || field.label.toLowerCase() === 'details')) ||
                               (type === 'event' && (field.label.toLowerCase() === 'title' || field.label.toLowerCase() === 'date' || field.label.toLowerCase() === 'location'));

        fieldDiv.innerHTML = `
            <label>${field.label} ${!isDefaultField ? `<span class="delete-field-btn" data-index="${index}" title="Delete field">❌</span>` : ''}</label>
            ${inputElement}
        `;
        learnModalFields.appendChild(fieldDiv);
    });

    // Add event listeners for deleting fields within the modal
    learnModalFields.querySelectorAll('.delete-field-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const indexToDelete = parseInt(e.target.dataset.index, 10);
            if (confirm(`Are you sure you want to delete the "${item.fields[indexToDelete].label}" field?`)) {
                item.fields.splice(indexToDelete, 1);
                // Re-render modal fields to reflect deletion
                openLearnModal(id, type); // Recursive call to re-render the modal content
            }
        });
    });
    learnEditModal.classList.add('active');
}

function closeLearnModal() {
    currentEditingItemId = null;
    currentEditingItemType = null;
    learnModalFields.innerHTML = ''; // Clear fields when closing
    learnEditModal.classList.remove('active');
}

function addCustomFieldToModal() {
    if (!currentEditingItemId || !currentEditingItemType) return;

    const newLabel = prompt("Enter the name for the new field:");
    if (newLabel && newLabel.trim() !== '') {
        const item = (currentEditingItemType === 'collaborator' ? collaborators : learnEvents).find(i => i.id === currentEditingItemId);
        if (item) { item.fields.push({ label: newLabel.trim(), value: '' }); }
        openLearnModal(currentEditingItemId, currentEditingItemType); // Re-render modal fields
    }
}

function addLearnItem(type) {
    if (type === 'collaborator') {
        const name = prompt("Enter collaborator's name:");
        if (name && name.trim() !== '') {
            const newCollab = {
                id: Date.now(),
                fields: [
                    { label: 'Name', value: name.trim() },
                    { label: 'Details', value: 'Add details here...' }
                ]
            };
            collaborators.push(newCollab);
            saveCollaborators();
            renderCollaborators();
        }
    } else if (type === 'event') {
        const title = prompt("Enter event title:");
        if (title && title.trim() !== '') {
            const newEvent = {
                id: Date.now(),
                fields: [
                    { label: 'Title', value: title.trim() },
                    { label: 'Date', value: '' },
                    { label: 'Location', value: '' }
                ]
            };
            learnEvents.push(newEvent);
            saveLearnEvents();
            renderLearnEvents();
        }
    }
}

function saveLearnItem() {
    if (!currentEditingItemId || !currentEditingItemType) return;
    
    let item;
    let list;
    if (currentEditingItemType === 'collaborator') { list = collaborators; }
    else if (currentEditingItemType === 'event') { list = learnEvents; }

    const itemIndex = list.findIndex(i => i.id === currentEditingItemId);
    if (itemIndex === -1) return;

    item = list[itemIndex];
    item = migrateLearnItemData(item, currentEditingItemType); // Ensure it's migrated

    const updatedFields = [];
    let isValid = true;
    learnModalFields.querySelectorAll('input, textarea').forEach(input => {
        const label = input.dataset.fieldLabel;
        const value = input.value.trim();

        // Basic validation for essential fields
        if (currentEditingItemType === 'collaborator' && label.toLowerCase() === 'name' && !value) {
            alert('Collaborator name cannot be empty.'); isValid = false;
        }
        if (currentEditingItemType === 'event' && (label.toLowerCase() === 'title' || label.toLowerCase() === 'date') && !value) {
            alert('Event title and date are required.'); isValid = false;
        }
        updatedFields.push({ label, value });
    });

    if (!isValid) return;

    item.fields = updatedFields; // Update the fields array

    if (currentEditingItemType === 'collaborator') { saveCollaborators(); renderCollaborators(); }
    else if (currentEditingItemType === 'event') { saveLearnEvents(); renderLearnEvents(); }
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
    // Apply migration to all existing items after loading from localStorage
    collaborators = collaborators.map(collab => migrateLearnItemData(collab, 'collaborator'));
    learnEvents = learnEvents.map(event => migrateLearnItemData(event, 'event'));

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
            openLearnModal(parseInt(e.target.dataset.id, 10), e.target.dataset.type);
        } else if (e.target.classList.contains('delete-btn')) {
            // For direct delete, we can call deleteLearnItem directly or open modal for confirmation
            currentEditingItemId = parseInt(e.target.dataset.id, 10);
            currentEditingItemType = e.target.dataset.type;
            deleteLearnItem(); // This will ask for confirmation
        }
    });

    document.getElementById('eventsList').addEventListener('click', (e) => {
        if (e.target.classList.contains('edit-btn')) {
            openLearnModal(parseInt(e.target.dataset.id, 10), e.target.dataset.type);
        } else if (e.target.classList.contains('delete-btn')) {
            currentEditingItemId = parseInt(e.target.dataset.id, 10);
            currentEditingItemType = e.target.dataset.type;
            deleteLearnItem();
        }
    });

    document.getElementById('nextButton').addEventListener('click', () => {
        nav++;
        renderLearnEvents();
        // No need to re-render collaborators as they are not filtered by month
    });

    document.getElementById('backButton').addEventListener('click', () => {
        nav--;
        renderLearnEvents();
        // No need to re-render collaborators
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
    document.getElementById('addCustomFieldBtn').addEventListener('click', addCustomFieldToModal);
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