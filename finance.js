let entries = localStorage.getItem('financeEntries') ? JSON.parse(localStorage.getItem('financeEntries')) : [];
let clientPayments = localStorage.getItem('clientPayments') ? JSON.parse(localStorage.getItem('clientPayments')) : [];

let currentDayNav = 0; // 0 for current day, -1 for yesterday, 1 for tomorrow, etc.
let incomeExpenseChart = null;
let expenseCategoryChart = null;

function renderAll() {
    const dt = new Date();
    dt.setDate(new Date().getDate() + currentDayNav);
    const currentDay = dt.getDate();
    const currentMonth = dt.getMonth();
    const currentYear = dt.getFullYear();

    document.getElementById('currentDateDisplay').textContent = 
        `${dt.toLocaleDateString('en-us', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`;

    const dailyEntries = entries.filter(entry => {
        const entryDate = new Date(entry.date);
        // Adjust for timezone differences by comparing year, month, and day
        return entryDate.getFullYear() === currentYear &&
               entryDate.getMonth() === currentMonth &&
               entryDate.getDate() === currentDay;
    });

    renderEntries(dailyEntries);
    renderCharts(dailyEntries);
}

function renderEntries(dailyEntries) {
    const incomeContainer = document.getElementById('incomeEntries');
    const expenseContainer = document.getElementById('expenseEntries');
    incomeContainer.innerHTML = '';
    expenseContainer.innerHTML = '';

    let totalIncome = 0;    let totalExpenses = 0;
    if (dailyEntries.length === 0) {
        incomeContainer.innerHTML = '<p>No income entries for this day.</p>';
        expenseContainer.innerHTML = '<p>No expense entries for this day.</p>';
    }

    dailyEntries.forEach(entry => {
        const entryBox = document.createElement('div');
        entryBox.className = 'entry-box';

        const amount = parseFloat(entry.amount);
        const formattedAmount = amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

        entryBox.innerHTML = `
            <div class="entry-header">
                <span>${entry.description}</span>
                <span style="color: ${entry.type === 'income' ? 'green' : 'red'};">${formattedAmount}</span>
            </div>
            <div class="entry-details">
                <p>Date: ${entry.date}</p>
                <p>Category: ${entry.category || 'N/A'}</p>
                <div style="margin-top: 10px; display: flex; gap: 10px;">
                    <button class="edit-btn" data-id="${entry.id}">Edit</button>
                    <button class="delete-btn" data-id="${entry.id}">Delete</button>
                </div>
            </div>
        `;

        if (entry.type === 'income') {
            incomeContainer.appendChild(entryBox);
            totalIncome += amount;
        } else {
            expenseContainer.appendChild(entryBox);
            totalExpenses += amount;
        }

        // Add click listener for accordion
        entryBox.querySelector('.entry-header').addEventListener('click', (e) => {
            const details = e.currentTarget.nextElementSibling;
            details.style.display = details.style.display === 'block' ? 'none' : 'block';
        });
    });

    updateSummary(totalIncome, totalExpenses);
}

function renderCharts(dailyEntries) {
    const incomeData = dailyEntries.filter(e => e.type === 'income').reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const expenseData = dailyEntries.filter(e => e.type === 'expense').reduce((sum, e) => sum + parseFloat(e.amount), 0);

    const incomeExpenseCtx = document.getElementById('incomeExpenseChart').getContext('2d');
    if (incomeExpenseChart) {
        incomeExpenseChart.destroy();
    }
    incomeExpenseChart = new Chart(incomeExpenseCtx, {
        type: 'bar',
        data: {
            labels: ['Income', 'Expenses'],
            datasets: [{
                label: 'Amount ($)',
                data: [incomeData, expenseData],
                backgroundColor: ['rgba(92, 184, 92, 0.6)', 'rgba(217, 83, 79, 0.6)'],
                borderColor: ['#5cb85c', '#d9534f'],
                borderWidth: 1
            }]
        },
        options: { scales: { y: { beginAtZero: true } } }
    });

    const expenseCategories = dailyEntries
        .filter(e => e.type === 'expense')
        .reduce((acc, e) => {
            const category = e.category || 'Uncategorized';
            acc[category] = (acc[category] || 0) + parseFloat(e.amount);
            return acc;
        }, {});

    const expenseCategoryCtx = document.getElementById('expenseCategoryChart').getContext('2d');
    if (expenseCategoryChart) {
        expenseCategoryChart.destroy();
    }
    expenseCategoryChart = new Chart(expenseCategoryCtx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(expenseCategories),
            datasets: [{
                label: 'Expenses by Category',
                data: Object.values(expenseCategories),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)'
                ],
                hoverOffset: 4
            }]
        }
    });
}

function updateSummary(income, expenses) {
    const balance = income - expenses;
    document.getElementById('totalIncome').textContent = income.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    document.getElementById('totalExpenses').textContent = expenses.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    document.getElementById('balance').textContent = balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    document.getElementById('balance').style.color = balance >= 0 ? 'green' : 'red';
}

function addEntry() {
    const descriptionInput = document.getElementById('entryDescription');
    const amountInput = document.getElementById('entryAmount');
    const dateInput = document.getElementById('entryDate');
    const categoryInput = document.getElementById('entryCategory');
    const typeInput = document.getElementById('entryType');

    const description = descriptionInput.value;
    const amount = amountInput.value;
    const date = dateInput.value;
    const category = categoryInput.value;
    const type = typeInput.value;

    if (description && amount && date) {
        entries.push({ id: Date.now(), description, amount: parseFloat(amount), date, category, type });
        localStorage.setItem('financeEntries', JSON.stringify(entries));

        descriptionInput.value = '';
        amountInput.value = '';
        dateInput.value = '';
        categoryInput.value = '';

        renderAll();
    } else {
        alert('Please fill out at least Description, Amount, and Date.');
    }
}

function deleteEntry(id) {
    if (confirm('Are you sure you want to delete this entry?')) {
        entries = entries.filter(entry => entry.id !== id);
        localStorage.setItem('financeEntries', JSON.stringify(entries));
        renderAll();
    }
}

function openEditModal(id) {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;

    document.getElementById('editEntryId').value = entry.id;
    document.getElementById('editEntryDescription').value = entry.description;
    document.getElementById('editEntryAmount').value = entry.amount;
    document.getElementById('editEntryCategory').value = entry.category;
    document.getElementById('editEntryDate').value = entry.date;
    document.getElementById('editEntryType').value = entry.type;

    document.getElementById('editEntryModal').style.display = 'block';
}

function closeEditModal() {
    document.getElementById('editEntryModal').style.display = 'none';
}

function saveEditedEntry() {
    const id = parseInt(document.getElementById('editEntryId').value, 10);
    const entryIndex = entries.findIndex(e => e.id === id);

    if (entryIndex === -1) {
        alert('Error: Could not find entry to update.');
        return;
    }

    const description = document.getElementById('editEntryDescription').value;
    const amount = document.getElementById('editEntryAmount').value;
    const category = document.getElementById('editEntryCategory').value;
    const date = document.getElementById('editEntryDate').value;
    const type = document.getElementById('editEntryType').value;

    if (!description || !amount || !date) {
        alert('Please fill out all fields.');
        return;
    }

    entries[entryIndex] = {
        id,
        description,
        amount: parseFloat(amount),
        category,
        date,
        type
    };

    localStorage.setItem('financeEntries', JSON.stringify(entries));
    renderAll();
    closeEditModal();
}

function renderPayments() {
    const pendingContainer = document.getElementById('pendingPayments');
    const completedContainer = document.getElementById('completedPayments');
    pendingContainer.innerHTML = '';
    completedContainer.innerHTML = '';

    clientPayments.forEach(payment => {
        const paymentBox = document.createElement('div');
        paymentBox.className = 'payment-box';

        const amount = parseFloat(payment.amount);
        const formattedAmount = amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

        paymentBox.innerHTML = `
            <div class="payment-header">
                <span>${payment.clientName}</span>
                <span style="color: ${payment.status === 'pending' ? '#f0ad4e' : 'green'};">${payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}</span>
            </div>
            <div class="payment-details">
                <p><strong>Amount:</strong> ${formattedAmount}</p>
                <p><strong>Due Date:</strong> ${payment.dueDate}</p>
            </div>
        `;

        if (payment.status === 'pending') {
            pendingContainer.appendChild(paymentBox);
        } else {
            completedContainer.appendChild(paymentBox);
        }

        // Add click listener for accordion
        paymentBox.querySelector('.payment-header').addEventListener('click', (e) => {
            const details = e.currentTarget.nextElementSibling;
            details.style.display = details.style.display === 'block' ? 'none' : 'block';
        });
    });
}

function addPayment() {
    const clientNameInput = document.getElementById('paymentClientName');
    const amountInput = document.getElementById('paymentAmount');
    const dueDateInput = document.getElementById('paymentDueDate');
    const statusInput = document.getElementById('paymentStatus');

    const clientName = clientNameInput.value;
    const amount = amountInput.value;
    const dueDate = dueDateInput.value;
    const status = statusInput.value;

    if (clientName && amount && dueDate) {
        clientPayments.push({ clientName, amount, dueDate, status });
        localStorage.setItem('clientPayments', JSON.stringify(clientPayments));

        clientNameInput.value = '';
        amountInput.value = '';
        dueDateInput.value = '';

        renderPayments();
    } else {
        alert('Please fill out all payment fields.');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('addEntryBtn').addEventListener('click', addEntry);
    document.getElementById('prevDayBtn').addEventListener('click', () => {
        currentDayNav--;
        renderAll();
    });
    document.getElementById('nextDayBtn').addEventListener('click', () => {
        currentDayNav++;
        renderAll();
    });

    document.querySelector('.accordion-toggle').addEventListener('click', (e) => {
        const toggle = e.currentTarget;
        const content = toggle.nextElementSibling;
        toggle.classList.toggle('active');
        content.classList.toggle('active');
    });

    document.getElementById('saveEditBtn').addEventListener('click', saveEditedEntry);
    document.getElementById('cancelEditBtn').addEventListener('click', closeEditModal);

    // Event delegation for edit and delete buttons
    document.getElementById('incomeEntries').addEventListener('click', handleEntryActions);
    document.getElementById('expenseEntries').addEventListener('click', handleEntryActions);

    document.getElementById('addPaymentBtn').addEventListener('click', addPayment);
    
    renderAll();
    renderPayments();
});

function handleEntryActions(e) {
    if (e.target.classList.contains('edit-btn')) openEditModal(parseInt(e.target.dataset.id, 10));
    if (e.target.classList.contains('delete-btn')) deleteEntry(parseInt(e.target.dataset.id, 10));
}