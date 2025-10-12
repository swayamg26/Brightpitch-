let nav = 0;
let clicked = null;
let events = localStorage.getItem('events') ? JSON.parse(localStorage.getItem('events')) : [];

const calendar = document.getElementById('assignmentCalendar');
const newAssignmentModal = document.getElementById('newAssignmentModal');
const backDrop = document.getElementById('modalBackDrop');
const eventTitleInput = document.getElementById('eventTitleInput');
const eventDescInput = document.getElementById('eventDescInput');
const eventStatusSelect = document.getElementById('eventStatusSelect');

const pendingList = document.getElementById('pendingAssignmentsList');
const completedList = document.getElementById('completedAssignmentsList');
const upcomingList = document.getElementById('upcomingAssignmentsList');

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function logout() {
    alert('Logged out!');
    window.location.href = 'index.html';
}

function openModal(date) {
    clicked = date;
    newAssignmentModal.style.display = 'block';
    backDrop.style.display = 'block';
}

function load() {
    const dt = new Date();
    if (nav !== 0) {
        dt.setMonth(new Date().getMonth() + nav);
    }

    const day = dt.getDate();
    const month = dt.getMonth();
    const year = dt.getFullYear();

    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const dateString = firstDayOfMonth.toLocaleDateString('en-us', {
        weekday: 'long',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    });
    const paddingDays = weekdays.indexOf(dateString.split(', ')[0]);

    document.getElementById('currentMonth').innerText =
        `${dt.toLocaleDateString('en-us', { month: 'long' })} ${year}`;

    calendar.innerHTML = '';

    // Render calendar headers
    weekdays.forEach(day => {
        const daySquare = document.createElement('div');
        daySquare.classList.add('calendar-header');
        daySquare.innerText = day.substring(0, 3).toUpperCase();
        calendar.appendChild(daySquare);
    });

    for (let i = 1; i <= paddingDays + daysInMonth; i++) {
        const daySquare = document.createElement('div');
        daySquare.classList.add('calendar-day');
        const dayString = `${month + 1}/${i - paddingDays}/${year}`;

        if (i > paddingDays) {
            daySquare.innerText = i - paddingDays;
            const eventsForDay = events.filter(e => e.date === dayString);

            if (i - paddingDays === day && nav === 0) {
                daySquare.id = 'currentDay';
            }

            if (eventsForDay.length > 0) {
                eventsForDay.forEach(event => {
                    const eventDiv = document.createElement('div');
                    eventDiv.classList.add('calendar-task');
                    eventDiv.classList.add(event.status);
                    eventDiv.innerText = event.title;
                    daySquare.appendChild(eventDiv);
                });
            }

            daySquare.addEventListener('click', () => openModal(dayString));
        } else {
            daySquare.classList.add('padding');
        }
        calendar.appendChild(daySquare);
    }
    loadAssignmentLists();
}

function closeModal() {
    eventTitleInput.classList.remove('error');
    newAssignmentModal.style.display = 'none';
    backDrop.style.display = 'none';
    eventTitleInput.value = '';
    eventDescInput.value = '';
    clicked = null;
    load();
}

function saveEvent() {
    if (eventTitleInput.value) {
        eventTitleInput.classList.remove('error');
        events.push({
            date: clicked,
            title: eventTitleInput.value,
            description: eventDescInput.value,
            status: eventStatusSelect.value,
        });
        localStorage.setItem('events', JSON.stringify(events));
        closeModal();
    } else {
        eventTitleInput.classList.add('error');
    }
}

function addAssignmentFromInput() {
    const titleInput = document.getElementById('assignmentTitleInput');
    const dateInput = document.getElementById('assignmentDateInput');

    if (titleInput.value && dateInput.value) {
        const date = new Date(dateInput.value);
        const dateString = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
        events.push({
            date: dateString,
            title: titleInput.value,
            description: '',
            status: 'pending',
        });
        localStorage.setItem('events', JSON.stringify(events));
        titleInput.value = '';
        dateInput.value = '';
        load();
    }
}

function loadAssignmentLists() {
    pendingList.innerHTML = '';
    completedList.innerHTML = '';
    upcomingList.innerHTML = '';

    const assignments = events.filter(e => e.status !== 'exam');

    assignments.forEach(a => {
        const assignmentItem = document.createElement('li');
        assignmentItem.className = 'assignment-item';
        assignmentItem.innerHTML = `<span class="task-text">${a.title} (${a.date})</span>`;

        if (a.status === 'pending') {
            pendingList.appendChild(assignmentItem);
        } else if (a.status === 'completed') {
            completedList.appendChild(assignmentItem);
        } else if (a.satus === 'upcoming') {
            upcomingList.appendChild(assignmentItem);
        }
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.logout-btn').addEventListener('click', logout);
    document.querySelector('.add-btn').addEventListener('click', addAssignmentFromInput);

    document.getElementById('nextButton').addEventListener('click', () => {
        nav++;
        load();
    });

    document.getElementById('backButton').addEventListener('click', () => {
        nav--;
        load();
    });

    document.getElementById('saveButton').addEventListener('click', saveEvent);
    document.getElementById('cancelButton').addEventListener('click', closeModal);

    document.querySelectorAll('.accordion-toggle').forEach(button => {
        button.addEventListener('click', () => {
            const content = button.nextElementSibling;
            button.classList.toggle('active');
            content.classList.toggle('active');
        });
    });

    load();
});