const SUPABASE_URL = "https://arrghzrhgyznibqimrrj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFycmdoenJoZ3l6bmlicWltcnJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MzAyNTYsImV4cCI6MjA4OTUwNjI1Nn0.XNqZSPwv9l9egsRj-OsE6eSa38zxbAuRphC0mn3_pes";

export async function indexWorkspace(githubUrl: string) {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/repo-index`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_KEY}`
    },
    body: JSON.stringify({ githubUrl })
  });
  return response.json();
}

export async function chat(messages: any[], repoContext: string = "") {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_KEY}`
    },
    body: JSON.stringify({ messages, repoContext, action: "chat" })
  });
  return response;
}
