let tasks = localStorage.getItem('upskillTasks') ? JSON.parse(localStorage.getItem('upskillTasks')) : [];
let nav = 0; // Shared navigation offset

const defaultColors = {
    pending: '#f0ad4e',
    upcoming: '#5bc0de',
    completed: '#5cb85c',
};
let taskColors = localStorage.getItem('taskColors') ? JSON.parse(localStorage.getItem('taskColors')) : defaultColors;

function addTask() {
    const input = document.getElementById('taskInput');
    const date = document.getElementById('taskDate');
    const description = document.getElementById('taskDescription');
    if (input.value.trim()) {
        tasks.push({
            id: Date.now(),
            text: input.value,
            description: description.value,
            date: date.value,
            completed: false,
        });
        localStorage.setItem('upskillTasks', JSON.stringify(tasks));
        window.location.reload();
    }
}

function toggleTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveAndRender();
    }
}

// Make openEditModal globally accessible so calendar.js can call it
window.openEditModal = openEditModal;

function openEditModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Use a generic modal or create a specific one for editing
    // For now, we can reuse the calendar's modal structure
    const modal = document.getElementById('newTaskModal');
    const titleInput = document.getElementById('taskTitleInput');
    const descInput = document.getElementById('taskDescInput');
    const statusSelect = document.getElementById('taskStatusSelect');
    const saveButton = document.getElementById('saveButton');
    const backDrop = document.getElementById('modalBackDrop');

    titleInput.value = task.text;
    descInput.value = task.description || '';
    statusSelect.value = task.status || 'pending';

    modal.style.display = 'block';
    backDrop.style.display = 'block';

    // Temporarily change save button to update task
    const newSaveButton = saveButton.cloneNode(true);
    saveButton.parentNode.replaceChild(newSaveButton, saveButton);
    newSaveButton.textContent = 'Update Task';
    newSaveButton.onclick = () => {
        updateTask(taskId);
        // The closeModal function in calendar.js will handle closing
    };
}

function deleteTask(taskId) {
    tasks = tasks.filter(t => t.id !== taskId);
    saveAndRender();
}

function saveAndRender() {
    localStorage.setItem('upskillTasks', JSON.stringify(tasks));
    renderTasks();
}

function renderTasks() {
    const pendingTaskList = document.getElementById('pendingTaskList');
    const completedTaskList = document.getElementById('completedTaskList');
    const upcomingTaskList = document.getElementById('upcomingTaskList'); // Assuming this exists for consistency

    pendingTaskList.innerHTML = '';
    completedTaskList.innerHTML = '';
    if (upcomingTaskList) upcomingTaskList.innerHTML = '';

    const dt = new Date();
    if (nav !== 0) {
        dt.setMonth(new Date().getMonth() + nav);
    }
    const currentMonth = dt.getMonth();
    const currentYear = dt.getFullYear();

    const monthlyTasks = tasks.filter(task => {
        if (!task.date) return false; // Only include tasks with a date
        const taskDate = new Date(task.date);
        return taskDate.getFullYear() === currentYear && taskDate.getMonth() === currentMonth;
    });

    monthlyTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.innerHTML = `
            <div>
                <input type="checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text ${task.completed ? 'completed' : ''}">${task.text} ${task.date ? `(${task.date})` : ''}</span>
                ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
            </div>
            <div>
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </div>
        `;

        li.querySelector('input[type="checkbox"]').addEventListener('change', () => toggleTask(task.id));
        li.querySelector('.edit-btn').addEventListener('click', () => openEditModal(task.id));
        li.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));

        if (task.completed) {
            completedTaskList.appendChild(li);
        } else {
            pendingTaskList.appendChild(li);
        }
    });

    // Add accordion functionality after tasks are rendered
    document.querySelectorAll('.accordion-toggle').forEach(button => {
        button.addEventListener('click', () => {
            const content = button.nextElementSibling;
            button.classList.toggle('active');
            content.classList.toggle('active');
        });
        // Ensure initial state is correct
        if (button.classList.contains('active')) button.nextElementSibling.classList.add('active');
    });

    updateProgress();
}

function updateProgress() {
    const completedCount = tasks.filter(t => t.completed).length;
    const totalTasks = tasks.length;
    const percentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
    const progressFill = document.getElementById('progressFill');
    progressFill.style.width = percentage + '%';
    progressFill.textContent = percentage + '%';
}

function updateTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const titleInput = document.getElementById('taskTitleInput');
    const descInput = document.getElementById('taskDescInput');
    const statusSelect = document.getElementById('taskStatusSelect');

    task.text = titleInput.value;
    task.description = descInput.value;
    task.status = statusSelect.value;
    task.completed = statusSelect.value === 'completed';

    saveAndRender();

    // We need a generic closeModal function accessible by both scripts
    // For now, we assume calendar.js's closeModal is available globally.
    if (window.closeModal) window.closeModal();
}

function applyColors() {
    document.documentElement.style.setProperty('--event-pending', taskColors.pending);
    document.documentElement.style.setProperty('--event-upcoming', taskColors.upcoming);
    document.documentElement.style.setProperty('--event-completed', taskColors.completed);
}

function setupColorPickers() {
    const pendingColorInput = document.getElementById('pendingColor');
    const upcomingColorInput = document.getElementById('upcomingColor');
    const completedColorInput = document.getElementById('completedColor');

    pendingColorInput.value = taskColors.pending;
    upcomingColorInput.value = taskColors.upcoming;
    completedColorInput.value = taskColors.completed;

    [pendingColorInput, upcomingColorInput, completedColorInput].forEach(input => {
        input.addEventListener('input', (e) => {
            taskColors[e.target.dataset.status] = e.target.value;
            localStorage.setItem('taskColors', JSON.stringify(taskColors));
            applyColors();
        });
    });
}

// Initial setup and event listeners
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.task-input .add-btn').addEventListener('click', addTask);
    document.getElementById('taskInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    document.getElementById('nextButton').addEventListener('click', () => {
        nav++;
        renderTasks();
        window.dispatchEvent(new CustomEvent('nav-change', { detail: { nav } }));
    });

    document.getElementById('backButton').addEventListener('click', () => {
        nav--;
        renderTasks();
        window.dispatchEvent(new CustomEvent('nav-change', { detail: { nav } }));
    });

    // Initial setup calls
    applyColors();
    setupColorPickers();
    renderTasks();
});

window.addEventListener('tasks-updated', () => {
    tasks = localStorage.getItem('upskillTasks') ? JSON.parse(localStorage.getItem('upskillTasks')) : [];
    renderTasks();
});