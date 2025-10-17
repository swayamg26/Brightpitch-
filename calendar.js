let nav = 0;
let clicked = null;
let tasks = localStorage.getItem('upskillTasks') ? JSON.parse(localStorage.getItem('upskillTasks')) : [];

const calendar = document.getElementById('taskCalendar');
const newTaskModal = document.getElementById('newTaskModal');
const backDrop = document.getElementById('modalBackDrop');
const tasksForDayDiv = document.getElementById('tasksForDay');
const taskTitleInput = document.getElementById('taskTitleInput');
const taskDescInput = document.getElementById('taskDescInput'); // New description input
const taskStatusSelect = document.getElementById('taskStatusSelect'); // New status select
const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function openModal(date) {
    clicked = date;
    const tasksOnDay = tasks.filter(t => t.date.replace(/-/g, '/') === clicked.replace(/-/g, '/'));

    if (tasksOnDay.length > 0) {
        tasksForDayDiv.innerHTML = '';
        tasksOnDay.forEach(task => {
            const taskEl = document.createElement('div');
            taskEl.classList.add('task-item-modal');
            taskEl.innerHTML = `
                <strong>${task.text}</strong>
                <p>${task.description || (task.date ? `Due: ${task.date}` : 'No description')}</p>
                <span class="status-badge ${task.status}">${task.status}</span>
            `;
            tasksForDayDiv.appendChild(taskEl);
        });
    } else {
        tasksForDayDiv.innerHTML = '<p>No tasks for this day. Add one below!</p>';
    }

    newTaskModal.style.display = 'block';
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

        const dayString = `${year}/${String(month + 1).padStart(2, '0')}/${String(i - paddingDays).padStart(2, '0')}`;

        if (i > paddingDays) {
            daySquare.innerText = i - paddingDays;

            const tasksForDay = tasks.filter(t => t.date && t.date.replace(/-/g, '/') === dayString);

            if (i - paddingDays === day && nav === 0) {
                daySquare.id = 'currentDay';
            }

            if (tasksForDay.length > 0) {
                const eventsContainer = document.createElement('div');
                eventsContainer.className = 'calendar-events';
                tasksForDay.forEach(task => {
                    const eventIndicator = document.createElement('div');
                    eventIndicator.className = 'event-indicator';
                    eventIndicator.setAttribute('data-status', task.status || 'pending');
                    eventIndicator.innerHTML = `
                        <span class="event-title">${task.text}</span><div class="event-popup">
                            <strong>${task.text}</strong>
                            <p>${task.description || 'No description.'}</p>
                        </div>
                    `;
                    eventsContainer.appendChild(eventIndicator);
                });
                daySquare.appendChild(eventsContainer);
            }

            daySquare.addEventListener('click', () => openModal(dayString));
        } else {
            daySquare.classList.add('padding');
        }

        calendar.appendChild(daySquare);
    }
}

function closeModal() {
    taskTitleInput.classList.remove('error');
    newTaskModal.style.display = 'none';
    backDrop.style.display = 'none';
    taskTitleInput.value = '';
    taskStatusSelect.value = 'pending';
    taskDescInput.value = '';
    clicked = null;
    load();
}

function saveTask() {
    if (taskTitleInput.value) {
        taskTitleInput.classList.remove('error');

        tasks.push({
            id: Date.now(),
            text: taskTitleInput.value,
            date: clicked.replace(/\//g, '-'), // Store in YYYY-MM-DD format
            description: taskDescInput.value,
            status: taskStatusSelect.value,
            completed: taskStatusSelect.value === 'completed',
        });

        localStorage.setItem('upskillTasks', JSON.stringify(tasks));
        closeModal();
    } else {
        taskTitleInput.classList.add('error');
    }
}

function initButtons() {
    document.getElementById('nextButton').addEventListener('click', () => {
        nav++;
        load();
    });

    document.getElementById('backButton').addEventListener('click', () => {
        nav--;
        load();
    });

    document.getElementById('saveButton').addEventListener('click', saveTask);
    document.getElementById('cancelButton').addEventListener('click', closeModal);
}
document.addEventListener('DOMContentLoaded', () => {
    // Ensure calendar-specific buttons are initialized only if they exist on the page
    if (document.getElementById('taskCalendar')) {
        initButtons();
        load();
    }
});
