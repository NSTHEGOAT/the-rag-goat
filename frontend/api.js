/* Local RAG — design tokens.
   Fully offline: system font stacks only (a local-first app shouldn't
   phone Google Fonts). The mono face carries the character — chunk IDs,
   citations and scores read like archival index entries. The signature
   element is the highlighter: every citation is marked the way you'd
   mark a passage in your own notes. */

:root {
  --paper: #f3f5f2;        /* cool, slightly green-tinted paper */
  --card: #fcfdfb;
  --ink: #18221d;          /* deep pine ink */
  --ink-soft: #5d6a63;
  --line: #d7ddd6;
  --highlight: #f9e44c;    /* the highlighter */
  --highlight-soft: #fdf6c8;
  --green: #2e6b4d;        /* correct / ready */
  --red: #a8412f;          /* wrong / error */
  --radius: 10px;

  --serif: "Charter", "Iowan Old Style", Georgia, "Times New Roman", serif;
  --sans: -apple-system, "Segoe UI", system-ui, Roboto, "Helvetica Neue", sans-serif;
  --mono: ui-monospace, "SF Mono", "Cascadia Code", "JetBrains Mono", Menlo, monospace;
}

* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  background: var(--paper);
  color: var(--ink);
  font-family: var(--sans);
  font-size: 15px;
  line-height: 1.55;
}
button { font: inherit; cursor: pointer; }
input, textarea { font: inherit; color: inherit; }

/* ---------- shell ---------- */
.shell {
  display: grid;
  grid-template-columns: 300px 1fr;
  min-height: 100vh;
}
@media (max-width: 860px) {
  .shell { grid-template-columns: 1fr; }
  .sidebar { border-right: none; border-bottom: 1px solid var(--line); }
}

/* ---------- sidebar (corpus) ---------- */
.sidebar {
  border-right: 1px solid var(--line);
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.wordmark {
  font-family: var(--serif);
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.01em;
}
.wordmark em {
  font-style: normal;
  background: linear-gradient(transparent 55%, var(--highlight) 55%, var(--highlight) 92%, transparent 92%);
}
.tagline {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--ink-soft);
  margin-top: 2px;
}
.status {
  font-family: var(--mono);
  font-size: 11.5px;
  color: var(--ink-soft);
  display: flex; align-items: center; gap: 7px;
}
.dot { width: 8px; height: 8px; border-radius: 50%; background: var(--red); flex: none; }
.dot.ok { background: var(--green); }

.dropzone {
  border: 1.5px dashed var(--line);
  border-radius: var(--radius);
  padding: 18px 14px;
  text-align: center;
  color: var(--ink-soft);
  font-size: 13px;
  background: var(--card);
  transition: border-color 0.15s, background 0.15s;
}
.dropzone.drag { border-color: var(--green); background: var(--highlight-soft); color: var(--ink); }
.dropzone button {
  margin-top: 8px;
  border: 1px solid var(--line);
  background: var(--paper);
  border-radius: 7px;
  padding: 5px 12px;
  font-size: 13px;
}
.dropzone button:hover { border-color: var(--ink-soft); }

.doc-list { display: flex; flex-direction: column; gap: 6px; }
.doc-row {
  display: flex; align-items: baseline; gap: 8px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 13px;
}
.doc-name { flex: 1; word-break: break-all; }
.doc-chunks { font-family: var(--mono); font-size: 11px; color: var(--ink-soft); white-space: nowrap; }
.doc-del { border: none; background: none; color: var(--ink-soft); font-size: 14px; padding: 0 2px; }
.doc-del:hover { color: var(--red); }
.empty-docs { font-size: 13px; color: var(--ink-soft); }

/* ---------- main column ---------- */
.main { display: flex; flex-direction: column; max-height: 100vh; }
.topbar {
  display: flex; align-items: center; gap: 10px;
  padding: 16px 28px;
  border-bottom: 1px solid var(--line);
}
.mode-btn {
  border: 1px solid var(--line);
  background: var(--card);
  border-radius: 999px;
  padding: 7px 16px;
  font-size: 13.5px;
  color: var(--ink-soft);
}
.mode-btn.active {
  background: var(--ink);
  border-color: var(--ink);
  color: var(--paper);
}
.model-tag { margin-left: auto; font-family: var(--mono); font-size: 11px; color: var(--ink-soft); }

.scroll { flex: 1; overflow-y: auto; padding: 28px; }
.column { max-width: 760px; margin: 0 auto; display: flex; flex-direction: column; gap: 22px; }

/* ---------- chat ---------- */
.turn-q {
  font-family: var(--serif);
  font-size: 19px;
  font-weight: 600;
  letter-spacing: -0.01em;
}
.turn-a {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 18px 20px;
  white-space: pre-wrap;
}
.cite-chip {
  display: inline-block;
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 600;
  background: var(--highlight);
  border-radius: 4px;
  padding: 0 5px;
  margin: 0 1px;
  vertical-align: 0.18em;
  border: none;
  line-height: 1.7;
}
.cite-chip:hover { outline: 2px solid var(--ink); }

.sources-label {
  font-family: var(--mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ink-soft);
  margin: 14px 0 8px;
}
.cite-card {
  border-left: 3px solid var(--highlight);
  background: var(--card);
  border-radius: 0 8px 8px 0;
  padding: 10px 14px;
  margin-bottom: 8px;
  font-size: 13px;
  transition: background 0.4s;
}
.cite-card.flash { background: var(--highlight-soft); }
.cite-head {
  display: flex; flex-wrap: wrap; align-items: baseline; gap: 10px;
  font-family: var(--mono); font-size: 11px; color: var(--ink-soft);
  margin-bottom: 5px;
}
.cite-ref { font-weight: 700; color: var(--ink); background: var(--highlight); border-radius: 3px; padding: 0 4px; }
.cite-snippet {
  color: var(--ink);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.cite-card.open .cite-snippet { -webkit-line-clamp: unset; }
.cite-toggle { border: none; background: none; font-family: var(--mono); font-size: 11px; color: var(--ink-soft); padding: 4px 0 0; }

/* ---------- composer ---------- */
.composer {
  border-top: 1px solid var(--line);
  padding: 16px 28px 22px;
}
.composer-inner { max-width: 760px; margin: 0 auto; display: flex; gap: 10px; }
.composer textarea {
  flex: 1;
  resize: none;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--card);
  padding: 12px 14px;
  min-height: 52px;
  outline: none;
}
.composer textarea:focus { border-color: var(--ink-soft); }
.send {
  border: none;
  background: var(--ink);
  color: var(--paper);
  border-radius: var(--radius);
  padding: 0 22px;
  font-weight: 600;
}
.send:disabled { opacity: 0.45; cursor: default; }

/* ---------- quiz ---------- */
.quiz-setup { display: flex; gap: 10px; flex-wrap: wrap; }
.quiz-setup input[type="text"] {
  flex: 1; min-width: 220px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--card);
  padding: 10px 14px;
  outline: none;
}
.quiz-setup input:focus { border-color: var(--ink-soft); }

.q-card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 18px 20px;
}
.q-num { font-family: var(--mono); font-size: 11px; color: var(--ink-soft); margin-bottom: 6px; }
.q-text { font-family: var(--serif); font-size: 17px; font-weight: 600; margin-bottom: 12px; }
.q-opt {
  display: block; width: 100%; text-align: left;
  border: 1px solid var(--line);
  background: var(--paper);
  border-radius: 8px;
  padding: 9px 12px;
  margin-bottom: 7px;
  font-size: 14px;
}
.q-opt:hover:not(:disabled) { border-color: var(--ink-soft); }
.q-opt:disabled { cursor: default; }
.q-opt.correct { border-color: var(--green); background: #e8f2ec; }
.q-opt.wrong { border-color: var(--red); background: #f7e9e6; }
.q-reveal { margin-top: 10px; font-size: 13px; }
.q-source {
  margin-top: 8px;
  border-left: 3px solid var(--highlight);
  background: var(--highlight-soft);
  padding: 8px 12px;
  border-radius: 0 6px 6px 0;
  font-size: 12.5px;
}
.q-source .cite-head { margin-bottom: 4px; }

/* ---------- misc ---------- */
.notice { font-size: 13.5px; color: var(--ink-soft); }
.error {
  background: #f7e9e6;
  border: 1px solid #e3c4bc;
  color: var(--red);
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 13.5px;
}
.thinking { font-family: var(--mono); font-size: 12px; color: var(--ink-soft); }
.thinking::after { content: ""; animation: dots 1.2s steps(4, end) infinite; }
@keyframes dots { 0% { content: ""; } 25% { content: "."; } 50% { content: ".."; } 75% { content: "..."; } }

@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
