function logout() {
    // For now, just alerts. In a real app, this would redirect to a login page.
    alert('Logged out!');
    // You might want to redirect to index.html
    window.location.href = 'index.html';
}

function addTask() {
    const input = document.getElementById('taskInput');
    const date = document.getElementById('taskDate');
    if (input.value.trim()) {
        const pendingTaskList = document.getElementById('pendingTaskList');
        const li = document.createElement('li');
        li.className = 'task-item';
        li.innerHTML = `
            <input type="checkbox">
            <span class="task-text">${input.value}</span>
            <button class="delete-btn">Delete</button>
        `;
        li.querySelector('input[type="checkbox"]').addEventListener('change', (e) => toggleTask(e.target));
        li.querySelector('.delete-btn').addEventListener('click', (e) => deleteTask(e.target));
        pendingTaskList.appendChild(li);
        input.value = '';
        date.value = '';
        updateProgress();
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
    updateProgress();
}

function deleteTask(btn) {
    btn.parentElement.remove();
    updateProgress();
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