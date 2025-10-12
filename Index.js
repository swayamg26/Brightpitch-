function selectRole(role) {
    if (role === 'owner') {
        // Redirect to a default dashboard page, for example, upskill.html
        window.location.href = 'upskill.html';
    } else {
        alert('Employee dashboard coming soon!');
    }
}

document.querySelector('.role-btn.owner').addEventListener('click', () => selectRole('owner'));
document.querySelector('.role-btn.employee').addEventListener('click', () => selectRole('employee'));