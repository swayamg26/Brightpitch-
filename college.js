let nav = 0; // Shared navigation offset
let events = localStorage.getItem('events') ? JSON.parse(localStorage.getItem('events')) : [];

const pendingList = document.getElementById('pendingAssignmentsList');
const completedList = document.getElementById('completedAssignmentsList');
const upcomingList = document.getElementById('upcomingAssignmentsList');

function addAssignmentFromInput() {
    const titleInput = document.getElementById('assignmentTitleInput');
    const dateInput = document.getElementById('assignmentDateInput');

    if (titleInput.value && dateInput.value) {
        const date = new Date(dateInput.value);
        const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate() + 1).padStart(2, '0')}`;
        events.push({
            id: Date.now(),
            date: dateString,
            title: titleInput.value,
            description: '',
            status: 'pending',
            completed: false,
        });
        localStorage.setItem('events', JSON.stringify(events));
        titleInput.value = '';
        dateInput.value = '';
        saveAndRender();
    }
}

function deleteEvent(eventId) {
    if (confirm('Are you sure you want to delete this assignment?')) {
        events = events.filter(e => e.id !== eventId);
        saveAndRender();
    }
}

function toggleEvent(eventId) {
    const event = events.find(e => e.id === eventId);
    if (event) {
        event.completed = !event.completed;
        // Also update status for consistency, though 'completed' property is primary
        event.status = event.completed ? 'completed' : 'pending';
        saveAndRender();
    }
}

function saveAndRender() {
    localStorage.setItem('events', JSON.stringify(events));
    loadAssignmentLists();
    // Also notify calendar to re-render
    window.dispatchEvent(new Event('events-updated'));
}

function loadAssignmentLists() {
    pendingList.innerHTML = '';
    completedList.innerHTML = '';
    upcomingList.innerHTML = '';

    const dt = new Date();
    if (nav !== 0) {
        dt.setMonth(new Date().getMonth() + nav);
    }
    const currentMonth = dt.getMonth();
    const currentYear = dt.getFullYear();
    const year = currentYear; // for the display string

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to the start of the day for accurate comparison

    document.getElementById('currentMonthDisplay').innerText = `${dt.toLocaleDateString('en-us', { month: 'long' })} ${year}`;

    const assignments = events.filter(e => {
        const eventDate = new Date(e.date);
        return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
    });

    assignments.forEach(a => {
        const assignmentItem = document.createElement('li');
        assignmentItem.className = 'assignment-item';
        assignmentItem.innerHTML = `
            <div>
                <input type="checkbox" ${a.completed ? 'checked' : ''}>
                <span class="task-text ${a.completed ? 'completed' : ''}">${a.title} ${a.date ? `(${a.date})` : ''}</span>
            </div>
            <div>
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </div>
        `;

        assignmentItem.querySelector('input[type="checkbox"]').addEventListener('change', () => toggleEvent(a.id));
        assignmentItem.querySelector('.delete-btn').addEventListener('click', () => deleteEvent(a.id));
        // Placeholder for edit functionality
        assignmentItem.querySelector('.edit-btn').addEventListener('click', () => alert('Edit functionality coming soon!'));

        const eventDate = new Date(a.date);

        if (a.completed) {
            completedList.appendChild(assignmentItem);
        } else if (eventDate > today || a.status === 'upcoming') {
            upcomingList.appendChild(assignmentItem);
        } else if (a.status === 'pending') { // Only show 'pending' status here
            pendingList.appendChild(assignmentItem);
        }
    });

    // This ensures the accordion state is respected on re-render
    document.querySelectorAll('.accordion-toggle').forEach(button => {
        const content = button.nextElementSibling;
        if (button.classList.contains('active')) {
            content.classList.add('active');
        }
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.subsection .add-btn').addEventListener('click', addAssignmentFromInput);

    document.getElementById('nextButton').addEventListener('click', () => {
        nav++;
        loadAssignmentLists();
        window.dispatchEvent(new CustomEvent('nav-change', { detail: { nav } }));
    });

    document.getElementById('backButton').addEventListener('click', () => {
        nav--;
        loadAssignmentLists();
        window.dispatchEvent(new CustomEvent('nav-change', { detail: { nav } }));
    });

    document.querySelectorAll('.accordion-toggle').forEach(button => {
        button.addEventListener('click', () => {
            const content = button.nextElementSibling;
            button.classList.toggle('active');
            content.classList.toggle('active');
            // Ensure the content has the active class if the button does
            if (button.classList.contains('active')) {
                content.classList.add('active');
            }
        });
    });

    loadAssignmentLists();
});

window.addEventListener('events-updated', () => {
    events = localStorage.getItem('events') ? JSON.parse(localStorage.getItem('events')) : [];
    loadAssignmentLists();
});