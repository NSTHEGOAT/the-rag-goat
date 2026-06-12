const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = {
  async upload(file) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_URL}/ingest`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Upload failed");
    return res.json();
  },
  async chat(question) {
    const res = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    if (!res.ok) throw new Error("Chat failed");
    return res.json();
  },
  async health() {
    const res = await fetch(`${API_URL}/health`);
    return res.ok;
  }
};
