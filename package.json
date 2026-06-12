"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import Sidebar from "../components/Sidebar";
import Chat from "../components/Chat";
import Quiz from "../components/Quiz";

export default function Home() {
  const [mode, setMode] = useState("chat"); // "chat" | "quiz"
  const [docs, setDocs] = useState([]);
  const [health, setHealth] = useState(null);
  const [sideError, setSideError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const [h, d] = await Promise.all([api.health(), api.documents()]);
      setHealth(h);
      setDocs(d);
    } catch {
      setHealth(null);
    }
  }, []);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 15000);
    return () => clearInterval(t);
  }, [refresh]);

  const ready = docs.length > 0;

  return (
    <div className="shell">
      <Sidebar
        docs={docs}
        health={health}
        error={sideError}
        onRefresh={refresh}
        onError={setSideError}
      />
      <main className="main">
        <div className="topbar">
          <button
            className={`mode-btn ${mode === "chat" ? "active" : ""}`}
            onClick={() => setMode("chat")}
          >
            Chat
          </button>
          <button
            className={`mode-btn ${mode === "quiz" ? "active" : ""}`}
            onClick={() => setMode("quiz")}
          >
            Quiz mode
          </button>
          {health && <span className="model-tag">{health.embed_model} · {health.llm_model}</span>}
        </div>
        {mode === "chat" ? <Chat ready={ready} /> : <Quiz ready={ready} />}
      </main>
    </div>
  );
}
