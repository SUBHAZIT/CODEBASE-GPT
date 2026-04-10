const SUPABASE_URL = "https://arrghzrhgyznibqimrrj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFycmdoenJoZ3l6bmlicWltcnJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MzAyNTYsImV4cCI6MjA4OTUwNjI1Nn0.XNqZSPwv9l9egsRj-OsE6eSa38zxbAuRphC0mn3_pes";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "indexRepo") {
    handleIndexRepo(request.githubUrl, sendResponse);
    return true; // Keep channel open for async response
  }
});

async function handleIndexRepo(githubUrl, sendResponse) {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/repo-index`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_KEY}`
      },
      body: JSON.stringify({ githubUrl })
    });

    const data = await response.json();
    
    // Store the repoId for this URL for later use in the popup
    if (data.repoId) {
      const storageKey = `repo_${githubUrl.toLowerCase().replace(/\/$/, "")}`;
      await chrome.storage.local.set({ [storageKey]: data.repoId });
    }

    sendResponse({ success: true, data });
  } catch (error) {
    console.error("Error indexing repo:", error);
    sendResponse({ success: false, error: error.message });
  }
}
