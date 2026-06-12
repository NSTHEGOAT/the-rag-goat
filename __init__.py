const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function handle(res) {
  if (!res.ok) {
    let detail = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (body.detail) detail = body.detail;
    } catch {}
    throw new Error(detail);
  }
  return res.json();
}

export const api = {
  health: () => fetch(`${API}/health`).then(handle),

  documents: () => fetch(`${API}/documents`).then(handle),

  deleteDocument: (source) =>
    fetch(`${API}/documents/${encodeURIComponent(source)}`, { method: "DELETE" }).then(handle),

  ingest: (files) => {
    const form = new FormData();
    for (const f of files) form.append("files", f);
    return fetch(`${API}/ingest`, { method: "POST", body: form }).then(handle);
  },

  chat: (question, topK = 5) =>
    fetch(`${API}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, top_k: topK }),
    }).then(handle),

  quiz: (topic, numQuestions = 4) =>
    fetch(`${API}/quiz`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: topic || null, num_questions: numQuestions }),
    }).then(handle),
};
