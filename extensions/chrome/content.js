function injectButton() {
  const headActions = document.querySelector('.pagehead-actions');
  if (headActions && !document.getElementById('innofusion-index-btn')) {
    const li = document.createElement('li');
    li.innerHTML = `
      <button id="innofusion-index-btn" class="btn btn-sm" style="background: #000000; color: #ffffff; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 4px 12px; font-weight: 800; display: flex; align-items: center; gap: 6px; font-family: 'JetBrains Mono', monospace; text-transform: uppercase; letter-spacing: 0.1em; font-size: 10px;">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="16 18 22 12 16 6"></polyline>
          <polyline points="8 6 2 12 8 18"></polyline>
        </svg>
        EXPLAIN WITH CODEBASEGPT
      </button>
    `;
    headActions.prepend(li);

    document.getElementById('innofusion-index-btn').addEventListener('click', () => {
      const githubUrl = window.location.href;
      chrome.runtime.sendMessage({ action: "indexRepo", githubUrl }, (response) => {
        if (response.success) {
          alert("Indexing started! You can check the progress in the CodebaseGPT dashboard.");
        } else {
          alert("Error: " + response.error);
        }
      });
    });
  }
}

// Observe for page changes (GitHub uses pushState)
const observer = new MutationObserver(() => {
  if (window.location.hostname === 'github.com' && window.location.pathname.split('/').length >= 3) {
    injectButton();
  }
});

observer.observe(document.body, { childList: true, subtree: true });

// Initial injection
if (window.location.hostname === 'github.com' && window.location.pathname.split('/').length >= 3) {
  injectButton();
}
