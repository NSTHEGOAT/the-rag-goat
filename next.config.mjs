"use client";
import { useState } from "react";
import { api } from "../lib/api";

/* Render answer text, replacing [n] with clickable highlighter chips. */
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
              title={`Jump to source [${ref}]`}
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

export default function Chat({ ready }) {
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
                ? "Ask anything about your documents. Every claim in the answer carries a [n] mark — click it to jump to the exact passage it came from."
                : "Upload a PDF or Markdown file in the sidebar to build your corpus, then ask away."}
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
