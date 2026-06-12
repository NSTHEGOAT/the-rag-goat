"use client";
import { useState } from "react";
import { api } from "../lib/api";

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
            <div className="cite-head">
              <span>{q.source || q.chunk_id.split("::")[0]}</span>
              <span>{q.chunk_id}</span>
            </div>
            {q.snippet}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Quiz({ ready }) {
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
            ? "Quiz mode builds questions strictly from retrieved chunks — answer one and the exact source passage is revealed beneath it."
            : "Upload documents first, then quiz yourself on them."}
        </p>

        <div className="quiz-setup">
          <input
            type="text"
            value={topic}
            placeholder="Topic to focus on (optional — blank samples the whole corpus)"
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

        {busy && <div className="thinking">drafting questions from your chunks</div>}
        {error && <div className="error">{error}</div>}

        {questions && questions.map((q, i) => (
          <QuestionCard key={i} q={q} index={i} />
        ))}
      </div>
    </div>
  );
}
