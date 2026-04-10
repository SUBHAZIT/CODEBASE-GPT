document.addEventListener('DOMContentLoaded', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const repoNameDiv = document.getElementById('repo-name');
  const indexBtn = document.getElementById('index-now');
  
  // Get production URL from storage or fallback to localhost
  const { prod_url } = await chrome.storage.local.get('prod_url');
  const BASE_URL = prod_url || 'https://codebasegpt.in';
  
  // Try to find a stored repoId for this tab
  const tabUrl = tab.url.toLowerCase().replace(/\/$/, "");
  const storageKey = `repo_${tabUrl}`;
  const repoData = await chrome.storage.local.get(storageKey);
  const currentRepoId = repoData[storageKey];
  
  if (tab.url.includes('github.com')) {
    const parts = new URL(tab.url).pathname.split('/');
    if (parts.length >= 3) {
      const owner = parts[1];
      const repo = parts[2];
      repoNameDiv.textContent = `${owner}/${repo}`;
    } else {
      repoNameDiv.textContent = "Not a repository";
      indexBtn.disabled = true;
      indexBtn.style.opacity = '0.5';
    }
  } else {
    repoNameDiv.textContent = "Not on GitHub";
    indexBtn.disabled = true;
    indexBtn.style.opacity = '0.5';
  }

  indexBtn.addEventListener('click', () => {
    indexBtn.disabled = true;
    indexBtn.textContent = "Indexing...";
    chrome.runtime.sendMessage({ action: "indexRepo", githubUrl: tab.url }, (response) => {
      if (response.success) {
        indexBtn.textContent = "Started!";
        setTimeout(() => {
          indexBtn.disabled = false;
          indexBtn.textContent = "Index Repo";
        }, 2000);
      } else {
        alert("Error: " + response.error);
        indexBtn.disabled = false;
        indexBtn.textContent = "Index Repo";
      }
    });
  });

  document.getElementById('open-dashboard').addEventListener('click', () => {
    const url = currentRepoId ? `${BASE_URL}/repo/${currentRepoId}` : `${BASE_URL}`;
    chrome.tabs.create({ url });
  });

  document.getElementById('open-chat').addEventListener('click', () => {
    const url = currentRepoId ? `${BASE_URL}/repo/${currentRepoId}/chat` : `${BASE_URL}`;
    chrome.tabs.create({ url });
  });

  document.getElementById('config-url').addEventListener('click', () => {
    const newUrl = prompt("Enter your production URL (e.g., https://codebasegpt.pages.dev):", BASE_URL);
    if (newUrl) {
      const sanitized = newUrl.replace(/\/$/, "");
      chrome.storage.local.set({ prod_url: sanitized }, () => {
        window.location.reload();
      });
    }
  });
});
