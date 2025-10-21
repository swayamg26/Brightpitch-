document.addEventListener('DOMContentLoaded', () => {
    let scripts = localStorage.getItem('scripts') ? JSON.parse(localStorage.getItem('scripts')) : [];
    let currentEditingId = null;

    const modal = document.getElementById('videoModal');
    const modalTitle = document.getElementById('videoTitle');
    const modalScript = document.getElementById('videoScript');
    const closeModalBtn = document.querySelector('.close-modal');
    const saveScriptBtn = document.getElementById('saveScriptBtn');
    const deleteScriptBtn = document.getElementById('deleteScriptBtn');

    function saveScripts() {
        localStorage.setItem('scripts', JSON.stringify(scripts));
    }

    function renderScripts() {
        const youtubeContainer = document.getElementById('youtube-scripts');
        const instagramContainer = document.getElementById('instagram-scripts');
        const linkedinContainer = document.getElementById('linkedin-scripts');

        youtubeContainer.innerHTML = '';
        instagramContainer.innerHTML = '';
        linkedinContainer.innerHTML = '';

        scripts.forEach(script => {
            const card = document.createElement('div');
            card.className = 'video-card';
            card.dataset.id = script.id;
            card.innerHTML = `<strong>${script.title}</strong>`;

            card.addEventListener('click', () => openModal(script.id));

            if (script.category === 'youtube') {
                youtubeContainer.appendChild(card);
            } else if (script.category === 'instagram') {
                instagramContainer.appendChild(card);
            } else if (script.category === 'linkedin') {
                linkedinContainer.appendChild(card);
            }
        });
    }

    function openModal(scriptId) {
        const script = scripts.find(s => s.id === scriptId);
        if (script) {
            currentEditingId = script.id;
            modalTitle.innerText = script.title;
            modalScript.innerText = script.content;
            modal.classList.add('active');
        }
    }

    const closeModal = () => {
        currentEditingId = null;
        modal.classList.remove('active');
    };

    function addScript(category) {
        const title = prompt(`Enter a title for the new ${category} script:`);
        if (title && title.trim() !== '') {
            const newScript = {
                id: Date.now(),
                title: title.trim(),
                content: 'Start writing your script here...',
                category: category
            };
            scripts.push(newScript);
            saveScripts();
            renderScripts();
        }
    }

    function saveScript() {
        if (currentEditingId) {
            const scriptIndex = scripts.findIndex(s => s.id === currentEditingId);
            if (scriptIndex > -1) {
                scripts[scriptIndex].title = modalTitle.innerText.trim();
                scripts[scriptIndex].content = modalScript.innerText.trim();
                saveScripts();
                renderScripts();
                closeModal();
            }
        }
    }

    function deleteScript() {
        if (currentEditingId && confirm('Are you sure you want to delete this script?')) {
            scripts = scripts.filter(s => s.id !== currentEditingId);
            saveScripts();
            renderScripts();
            closeModal();
        }
    }

    // Event Listeners
    closeModalBtn.addEventListener('click', closeModal);
    saveScriptBtn.addEventListener('click', saveScript);
    deleteScriptBtn.addEventListener('click', deleteScript);

    document.querySelectorAll('.add-script-btn').forEach(btn => {
        btn.addEventListener('click', () => addScript(btn.dataset.category));
    });

    renderScripts(); // Initial render
});