"use client";
import { useCallback, useEffect, useRef, useState } from "react";

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

const api = {
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

function Sidebar({ docs, health, error, onRefresh, onError }) {
  const fileRef = useRef(null);
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);

  async function upload(files) {
    const accepted = [...files].filter((f) => /\.(pdf|md|markdown|txt)$/i.test(f.name));
    if (!accepted.length) {
      onError("Only .pdf, .md and .txt files are supported.");
      return;
    }
    setBusy(true);
    try {
      await api.ingest(accepted);
      onError(null);
      await onRefresh();
    } catch (e) {
      onError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(source) {
    try {
      await api.deleteDocument(source);
      await onRefresh();
    } catch (e) {
      onError(e.message);
    }
  }

  return (
    <aside className="sidebar">
      <div>
        <div className="wordmark">local<em>rag</em></div>
        <div className="tagline">pdf + md → chroma → llm</div>
      </div>
      <div className="status">
        <span className={`dot ${health ? "ok" : ""}`} />
        {health ? `${health.chunks} chunks · ${health.llm_model}` : "backend offline"}
      </div>
      <div
        className={`dropzone ${drag ? "drag" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files); }}
      >
        {busy ? (
          <span className="thinking">embedding</span>
        ) : (
          <>
            Drop PDF or Markdown here
            <br />
            <button onClick={() => fileRef.current && fileRef.current.click()}>Browse files</button>
          </>
        )}
        <input
          ref={fileRef}
          type="file"
          multiple
          accept=".pdf,.md,.markdown,.txt"
          hidden
          onChange={(e) => { upload(e.target.files); e.target.value = ""; }}
        />
      </div>
      {error && <div className="error">{error}</div>}
      <div className="doc-list">
        {docs.length === 0 && (
          <div className="empty-docs">No documents yet — upload one to start.</div>
        )}
        {docs.map((d) => (
          <div className="doc-row" key={d.source}>
            <span className="doc-name">{d.source}</span>
            <span className="doc-chunks">{d.chunks} chunks</span>
            <button className="doc-del" onClick={() => remove(d.source)}>×</button>
          </div>
        ))}
      </div>
    </aside>
  );
}

function AnswerText({ text, turnId, citations }) {
  const valid = new Set(citations.map((c) => c.ref));
  const parts = text.split(/(\[\d+\])/g);
  return (
    <div className="turn-a">
      {parts.map((part, i) => {
        const m = part.match(/^\[(\d+)\]$/);
        if (m && valid.has(Number(m[1]))) {
          const ref = Number(m[1]);
          return (
            <button
              key={i}
              className="cite-chip"
              onClick={() => {
                const el = document.getElementById(`cite-${turnId}-${ref}`);
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "center" });
                  el.classList.add("flash");
                  setTimeout(() => el.classList.remove("flash"), 1200);
                }
              }}
            >
              {ref}
            </button>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </div>
  );
}

function CitationCard({ turnId, c }) {
  const [open, setOpen] = useState(false);
  return (
    <div id={`cite-${turnId}-${c.ref}`} className={`cite-card ${open ? "open" : ""}`}>
      <div className="cite-head">
        <span className="cite-ref">[{c.ref}]</span>
        <span>{c.source}{c.page ? ` · p.${c.page}` : ""}</span>
        <span>{c.chunk_id}</span>
        <span>dist {c.distance}</span>
      </div>
      <div className="cite-snippet">{c.snippet}</div>
      <button className="cite-toggle" onClick={() => setOpen(!open)}>
        {open ? "− collapse" : "+ full chunk"}
      </button>
    </div>
  );
}

function Chat({ ready }) {
  const [turns, setTurns] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function ask() {
    const question = input.trim();
    if (!question || busy) return;
    setInput("");
    setError(null);
    setBusy(true);
    try {
      const res = await api.chat(question);
      setTurns((t) => [...t, { id: Date.now(), question, ...res }]);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="scroll">
        <div className="column">
          {turns.length === 0 && !busy && (
            <p className="notice">
              {ready
                ? "Ask anything about your documents — every claim carries a [n] mark linking to its source."
                : "Upload a PDF or Markdown file in the sidebar first."}
            </p>
          )}
          {turns.map((t) => (
            <div key={t.id}>
              <div className="turn-q">{t.question}</div>
              <AnswerText text={t.answer} turnId={t.id} citations={t.citations} />
              <div className="sources-label">Retrieved sources</div>
              {t.citations.map((c) => (
                <CitationCard key={c.ref} turnId={t.id} c={c} />
              ))}
            </div>
          ))}
          {busy && <div className="thinking">retrieving + generating</div>}
          {error && <div className="error">{error}</div>}
        </div>
      </div>
      <div className="composer">
        <div className="composer-inner">
          <textarea
            value={input}
            placeholder="Ask your documents…"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                ask();
              }
            }}
          />
          <button className="send" disabled={busy || !input.trim()} onClick={ask}>
            Ask
          </button>
        </div>
      </div>
    </>
  );
}

function QuestionCard({ q, index }) {
  const [picked, setPicked] = useState(null);
  const answered = picked !== null;
  return (
    <div className="q-card">
      <div className="q-num">Question {index + 1} · from {q.chunk_id}</div>
      <div className="q-text">{q.question}</div>
      {q.options.map((opt, i) => {
        let cls = "q-opt";
        if (answered && i === q.answer_index) cls += " correct";
        else if (answered && i === picked) cls += " wrong";
        return (
          <button key={i} className={cls} disabled={answered} onClick={() => setPicked(i)}>
            {String.fromCharCode(65 + i)}. {opt}
          </button>
        );
      })}
      {answered && (
        <div className="q-reveal">
          {picked === q.answer_index ? "Correct." : `Not quite — the answer is ${String.fromCharCode(65 + q.answer_index)}.`}
          {q.explanation && <> {q.explanation}</>}
          <div className="q-source">
            <div className="cite-head"><span>{q.chunk_id}</span></div>
            {q.snippet}
          </div>
        </div>
      )}
    </div>
  );
}

function Quiz({ ready }) {
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(4);
  const [questions, setQuestions] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function generate() {
    if (busy) return;
    setError(null);
    setBusy(true);
    setQuestions(null);
    try {
      const res = await api.quiz(topic.trim(), count);
      setQuestions(res.questions);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="scroll">
      <div className="column">
        <p className="notice">
          {ready
            ? "Quiz mode builds questions strictly from your documents — answering reveals the source passage."
            : "Upload documents first, then quiz yourself on them."}
        </p>
        <div className="quiz-setup">
          <input
            type="text"
            value={topic}
            placeholder="Topic (optional — blank uses whole corpus)"
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generate()}
          />
          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            style={{ border: "1px solid var(--line)", borderRadius: 10, background: "var(--card)", padding: "0 10px" }}
          >
            {[3, 4, 5, 6, 8, 10].map((n) => (
              <option key={n} value={n}>{n} questions</option>
            ))}
          </select>
          <button className="send" disabled={busy || !ready} onClick={generate}>
            Generate quiz
          </button>
        </div>
        {busy && <div className="thinking">drafting questions</div>}
        {error && <div className="error">{error}</div>}
        {questions && questions.map((q, i) => <QuestionCard key={i} q={q} index={i} />)}
      </div>
    </div>
  );
}

export default function Home() {
  const [mode, setMode] = useState("chat");
  const [docs, setDocs] = useState([]);
  const [health, setHealth] = useState(null);
  const [sideError, setSideError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const h = await api.health();
      const d = await api.documents();
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
      <Sidebar docs={docs} health={health} error={sideError} onRefresh={refresh} onError={setSideError} />
      <main className="main">
        <div className="topbar">
          <button className={`mode-btn ${mode === "chat" ? "active" : ""}`} onClick={() => setMode("chat")}>
            Chat
          </button>
          <button className={`mode-btn ${mode === "quiz" ? "active" : ""}`} onClick={() => setMode("quiz")}>
            Quiz mode
          </button>
          {health && <span className="model-tag">{health.embed_model} · {health.llm_model}</span>}
        </div>
        {mode === "chat" ? <Chat ready={ready} /> : <Quiz ready={ready} />}
      </main>
    </div>
  );
}
