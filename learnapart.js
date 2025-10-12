let currentVideoTitle = '';
let currentVideoScript = '';

function logout() {
    // For now, just alerts. In a real app, this would redirect to a login page.
    alert('Logged out!');
    // You might want to redirect to index.html
    window.location.href = 'index.html';
}

function openVideoScript(title, script) {
    currentVideoTitle = title;
    currentVideoScript = script;
    document.getElementById('videoTitle').textContent = title;
    document.getElementById('videoScript').textContent = script;
    document.getElementById('videoModal').classList.add('active');
}

function closeVideoScript() {
    document.getElementById('videoModal').classList.remove('active');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.logout-btn').addEventListener('click', logout);

    document.querySelectorAll('.video-card').forEach(card => {
        const title = card.querySelector('strong').textContent;
        const script = card.getAttribute('data-script');
        card.addEventListener('click', () => openVideoScript(title, script));
    });

    document.querySelector('.close-modal').addEventListener('click', closeVideoScript);
    document.getElementById('videoModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeVideoScript();
        }
    });
});