"use client";
import { useRef, useState } from "react";
import { api } from "../lib/api";

export default function Sidebar({ docs, health, error, onRefresh, onError }) {
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
        <div className="wordmark">
          local<em>rag</em>
        </div>
        <div className="tagline">pdf + md → chroma → ollama</div>
      </div>

      <div className="status">
        <span className={`dot ${health ? "ok" : ""}`} />
        {health
          ? `${health.chunks} chunks · ${health.llm_model}`
          : "backend offline — start uvicorn"}
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
            <button onClick={() => fileRef.current?.click()}>Browse files</button>
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
          <div className="empty-docs">
            No documents yet. The corpus is empty — everything starts with an upload.
          </div>
        )}
        {docs.map((d) => (
          <div className="doc-row" key={d.source}>
            <span className="doc-name">{d.source}</span>
            <span className="doc-chunks">{d.chunks} chunks</span>
            <button className="doc-del" title={`Remove ${d.source}`} onClick={() => remove(d.source)}>
              ×
            </button>
          </div>
        ))}
      </div>
    </aside>
  );
}
