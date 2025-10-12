let entries = localStorage.getItem('financeEntries') ? JSON.parse(localStorage.getItem('financeEntries')) : [];
let clientPayments = localStorage.getItem('clientPayments') ? JSON.parse(localStorage.getItem('clientPayments')) : [];

function logout() {
    alert('Logged out!');
    window.location.href = 'index.html';
}

function renderEntries() {
    const incomeContainer = document.getElementById('incomeEntries');
    const expenseContainer = document.getElementById('expenseEntries');
    incomeContainer.innerHTML = '';
    expenseContainer.innerHTML = '';

    let totalIncome = 0;
    let totalExpenses = 0;

    entries.forEach(entry => {
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
    const typeInput = document.getElementById('entryType');

    const description = descriptionInput.value;
    const amount = amountInput.value;
    const date = dateInput.value;
    const type = typeInput.value;

    if (description && amount && date) {
        entries.push({ description, amount, date, type });
        localStorage.setItem('financeEntries', JSON.stringify(entries));

        descriptionInput.value = '';
        amountInput.value = '';
        dateInput.value = '';

        renderEntries();
    } else {
        alert('Please fill out all fields.');
    }
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
    document.querySelector('.logout-btn').addEventListener('click', logout);
    document.getElementById('addEntryBtn').addEventListener('click', addEntry);
    document.getElementById('addPaymentBtn').addEventListener('click', addPayment);
    renderEntries();
    renderPayments();
});