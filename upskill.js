import { load as loadCalendar } from './calendar.js';

function logout() {
    // For now, just alerts. In a real app, this would redirect to a login page.
    alert('Logged out!');
    // You might want to redirect to index.html
    window.location.href = 'index.html';
}

function addTask() {
    const input = document.getElementById('taskInput');
    const dateInput = document.getElementById('taskDate');
    const taskText = input.value.trim();
    const taskDate = dateInput.value;

    if (taskText && taskDate) {
        const date = new Date(taskDate);
        // Adjust for timezone offset to get correct date
        const adjustedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
        const dateString = `${adjustedDate.getMonth() + 1}/${adjustedDate.getDate()}/${adjustedDate.getFullYear()}`;

        // Save to localStorage for calendar
        let tasks = localStorage.getItem('tasks') ? JSON.parse(localStorage.getItem('tasks')) : [];
        tasks.push({
            date: dateString,
            title: taskText,
            description: '',
            status: 'pending',
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));

        // Add to the pending list UI
        const pendingTaskList = document.getElementById('pendingTaskList');
        const li = document.createElement('li');
        li.className = 'task-item';
        li.innerHTML = `
            <input type="checkbox">
            <span class="task-text">${taskText}</span>
            <button class="delete-btn">Delete</button>
        `;
        li.querySelector('input[type="checkbox"]').addEventListener('change', (e) => toggleTask(e.target));
        li.querySelector('.delete-btn').addEventListener('click', (e) => deleteTask(e.target));
        pendingTaskList.appendChild(li);

        input.value = '';
        dateInput.value = '';
        updateProgress();
        loadCalendar(); // Reload calendar to show the new task
    }
}

function toggleTask(checkbox) {
    const taskText = checkbox.nextElementSibling;
    const taskItem = checkbox.parentElement;
    const pendingTaskList = document.getElementById('pendingTaskList');
    const completedTaskList = document.getElementById('completedTaskList');

    if (checkbox.checked) {
        taskText.classList.add('completed');
        completedTaskList.appendChild(taskItem);
    } else {
        taskText.classList.remove('completed');
        pendingTaskList.appendChild(taskItem);
    }
    // In a real app, you'd update the task status in localStorage here as well.
    updateProgress();
}

function deleteTask(btn) {
    btn.parentElement.remove();
    updateProgress();
    // In a real app, you'd remove the task from localStorage here as well.
}

function updateProgress() {
    const tasks = document.querySelectorAll('.task-item');
    const completed = document.querySelectorAll('.task-item input[type="checkbox"]:checked');
    const percentage = tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0;
    const progressFill = document.getElementById('progressFill');
    progressFill.style.width = percentage + '%';
    progressFill.textContent = percentage + '%';
}

// Initial setup and event listeners
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.logout-btn').addEventListener('click', logout);
    document.querySelector('button.add-btn').addEventListener('click', addTask);
    document.getElementById('taskInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    document.querySelectorAll('.task-item input[type="checkbox"]').forEach(cb => cb.addEventListener('change', () => toggleTask(cb)));
    document.querySelectorAll('.task-item .delete-btn').forEach(btn => btn.addEventListener('click', () => deleteTask(btn)));

    // Add accordion functionality
    document.querySelectorAll('.accordion-toggle').forEach(button => {
        button.addEventListener('click', () => {
            const content = button.nextElementSibling;
            button.classList.toggle('active');
            content.classList.toggle('active');
        });
    });

    // Initial setup calls
    const pendingTaskList = document.getElementById('pendingTaskList');
    const completedTaskList = document.getElementById('completedTaskList');
    const allTasks = [...pendingTaskList.children, ...completedTaskList.children];

    allTasks.forEach(taskItem => {
        const checkbox = taskItem.querySelector('input[type="checkbox"]');
        if (checkbox.checked) {
            completedTaskList.appendChild(taskItem);
        } else {
            pendingTaskList.appendChild(taskItem);
        }
    });

    updateProgress();
});