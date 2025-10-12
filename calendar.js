let nav = 0;
let clicked = null;
let tasks = localStorage.getItem('tasks') ? JSON.parse(localStorage.getItem('tasks')) : [];

const calendar = document.getElementById('taskCalendar');
const newTaskModal = document.getElementById('newTaskModal');
const backDrop = document.getElementById('modalBackDrop');
const taskTitleInput = document.getElementById('taskTitleInput');
const taskDescInput = document.getElementById('taskDescInput'); // New description input
const taskStatusSelect = document.getElementById('taskStatusSelect'); // New status select
const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function openModal(date) {
    clicked = date;
    const tasksForDay = tasks.filter(t => t.date === clicked);

    // For simplicity, this example doesn't show existing tasks in the modal,
    // but you could extend it to list/edit tasks for the selected day.

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

        const dayString = `${month + 1}/${i - paddingDays}/${year}`;

        if (i > paddingDays) {
            daySquare.innerText = i - paddingDays;

            const tasksForDay = tasks.filter(t => t.date === dayString);

            if (i - paddingDays === day && nav === 0) {
                daySquare.id = 'currentDay';
            }

            if (tasksForDay.length > 0) {
                tasksForDay.forEach(task => {
                    const taskDiv = document.createElement('div');
                    taskDiv.classList.add('calendar-task');
                    taskDiv.classList.add(task.status); // 'pending', 'completed', or 'upcoming'
                    taskDiv.innerText = task.title;
                    daySquare.appendChild(taskDiv);
                });
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
    taskDescInput.value = '';
    clicked = null;
    load();
}

function saveTask() {
    if (taskTitleInput.value) {
        taskTitleInput.classList.remove('error');

        tasks.push({
            date: clicked,
            title: taskTitleInput.value,
            description: taskDescInput.value,
            status: taskStatusSelect.value,
        });

        localStorage.setItem('tasks', JSON.stringify(tasks));
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

initButtons();
load();