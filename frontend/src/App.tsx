import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownToLine, ArrowRight, Check, CircleHelp, Clock3, FileText,
  LoaderCircle, LockKeyhole, RotateCcw, Sparkles, WandSparkles, Zap
} from "lucide-react";

type Result = {
  summary: string;
  tasks: string[];
  follow_up_questions: string[];
  model: string;
  privacy_note: string;
};

const DEMO_NOTES = `Project sync — Friday
- Finish the README and installation instructions by Tuesday.
- Maya will review the onboarding flow; I need to send her the latest screenshots.
- We decided to postpone dark mode until the next iteration.
- Before release, run the API tests and check the mobile layout.
- Follow up with the hosting provider about the environment variable issue.
- Open question: do we need CSV export for the first release?`;

const API_URL = (import.meta.env.VITE_API_URL ?? "https://lazydesk-api-rootfix.onrender.com").replace(/\/$/, "");

function App() {
  const [notes, setNotes] = useState(DEMO_NOTES);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [apiState, setApiState] = useState<"checking" | "ready" | "offline">("checking");
  const [copied, setCopied] = useState(false);

  const wordCount = useMemo(() => notes.trim() ? notes.trim().split(/\s+/).length : 0, [notes]);

  async function checkHealth() {
    try {
      const response = await fetch(`${API_URL}/api/health`);
      if (!response.ok) throw new Error("API unavailable");
      const data = await response.json();
      setApiState(data.ollama_reachable && data.model_available ? "ready" : "offline");
    } catch {
      setApiState("offline");
    }
  }

  useEffect(() => {
    void checkHealth();
  }, []);

  async function organizeNotes() {
    setError("");
    setResult(null);
    setCopied(false);
    if (notes.trim().length < 10) {
      setError("Add a little more context so LazyDesk can produce a useful result.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch(`${API_URL}/api/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Could not process these notes.");
      setResult(data);
      setApiState("ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Check the backend and local AI runtime.");
      setApiState("offline");
    } finally {
      setBusy(false);
    }
  }

  const markdown = result
    ? `# LazyDesk notes\n\n## Summary\n\n${result.summary}\n\n## Action items\n\n${result.tasks.length ? result.tasks.map((task) => `- [ ] ${task}`).join("\n") : "- No explicit action items detected."}\n\n## Follow-up questions\n\n${result.follow_up_questions.length ? result.follow_up_questions.map((question) => `- ${question}`).join("\n") : "- None detected."}\n`
    : "";

  async function copyResult() {
    if (!markdown) return;
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Clipboard access was blocked. You can still select and copy the results.");
    }
  }

  function downloadResult() {
    if (!markdown) return;
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "lazydesk-notes.md";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function loadDemo() {
    setNotes(DEMO_NOTES);
    setResult(null);
    setError("");
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a href="#" className="brand" aria-label="LazyDesk home">
          <span className="brand-mark"><Sparkles size={18} /></span>
          <span>lazy<span className="brand-light">desk</span></span>
        </a>
        <nav className="nav-links" aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#privacy">Privacy</a>
          <a href="https://github.com/gauravbalade/LazyDesk" target="_blank" rel="noreferrer" className="github-link">View source <ArrowRight size={14} /></a>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="eyebrow"><span className="pulse-dot" /> YOUR LOCAL-FIRST NOTE ASSISTANT</div>
          <h1>Make space for<br /><span>the work that matters.</span></h1>
          <p className="hero-copy">Drop in your messy notes. Get the key points, a practical to-do list, and the questions worth asking — without handing your notes to a closed AI service.</p>
          <div className="hero-proof">
            <span><LockKeyhole size={15} /> Local AI by default</span>
            <span><Zap size={15} /> Less busywork</span>
            <span><FileText size={15} /> Markdown export</span>
          </div>
        </section>

        <section className="workspace" aria-label="Notes workspace">
          <div className="workspace-head">
            <div>
              <div className="section-kicker">YOUR WORKSPACE</div>
              <h2>Turn notes into next steps</h2>
            </div>
            <div className={`status-pill ${apiState === "ready" ? "status-ready" : "status-offline"}`}>
              <span className="status-dot" />
              {apiState === "checking" ? "Checking local AI" : apiState === "ready" ? "Local AI ready" : "Local AI not ready"}
            </div>
          </div>

          <div className="workspace-grid">
            <section className="notes-card">
              <div className="card-header">
                <div className="card-title"><FileText size={17} /><span>Raw notes</span></div>
                <button className="subtle-button" onClick={loadDemo}><RotateCcw size={13} /> Load example</button>
              </div>
              <label htmlFor="notes-input" className="sr-only">Paste meeting notes or an unstructured text</label>
              <textarea id="notes-input" value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={20000} placeholder="Paste a meeting recap, class notes, or a brain dump…" />
              <div className="input-footer">
                <span>{wordCount} words <span className="muted-separator">·</span> {notes.length.toLocaleString()} / 20,000 characters</span>
                <span className="privacy-mini"><LockKeyhole size={12} /> Private by default</span>
              </div>
              <button className="primary-button" onClick={organizeNotes} disabled={busy || notes.trim().length < 10}>
                {busy ? <><LoaderCircle size={17} className="spin" /> Organizing notes…</> : <><WandSparkles size={17} /> Organize my notes <ArrowRight size={16} /></>}
              </button>
              <p className="button-note"><Clock3 size={13} /> Runs on the local model configured on your machine.</p>
              {error && <div className="error-message" role="alert"><CircleHelp size={16} /><span>{error}</span></div>}
            </section>

            <section className="results-card" aria-live="polite">
              <div className="card-header">
                <div className="card-title"><Sparkles size={17} /><span>Clear head, clear plan</span></div>
                {result && <button className="icon-button" title="Download Markdown" aria-label="Download Markdown" onClick={downloadResult}><ArrowDownToLine size={16} /></button>}
              </div>
              {!result && !busy && (
                <div className="empty-state">
                  <div className="empty-art"><div className="art-paper"><span /><span /><span /><i /></div><Sparkles className="art-spark" size={21} /></div>
                  <h3>Your breathing room starts here.</h3>
                  <p>Summaries, tasks, and useful follow-ups will appear here. Start with the example or add your own notes.</p>
                  <div className="preview-chips"><span>01 Summary</span><span>02 Action items</span><span>03 Open questions</span></div>
                </div>
              )}
              {busy && <div className="loading-state"><LoaderCircle className="spin" size={26} /><p>Reading between the lines…</p><span>Your notes are being processed by the configured local model.</span></div>}
              {result && (
                <div className="result-content">
                  <div className="result-label">THE SHORT VERSION</div>
                  <p className="summary-text">{result.summary}</p>
                  <div className="result-divider" />
                  <div className="result-section-head"><h3>Next steps</h3><span className="count-badge">{result.tasks.length}</span></div>
                  {result.tasks.length ? <ul className="task-list">{result.tasks.map((task, index) => <li key={index}><span className="task-check"><Check size={12} /></span><span>{task}</span></li>)}</ul> : <p className="no-items">No explicit tasks found in these notes.</p>}
                  {result.follow_up_questions.length > 0 && <>
                    <div className="result-divider" />
                    <div className="result-section-head"><h3>Worth clarifying</h3></div>
                    <ul className="question-list">{result.follow_up_questions.map((question, index) => <li key={index}>{question}</li>)}</ul>
                  </>}
                  <div className="result-actions">
                    <button className="secondary-button" onClick={copyResult}>{copied ? <><Check size={15} /> Copied</> : <><FileText size={15} /> Copy Markdown</>}</button>
                    <button className="secondary-button" onClick={downloadResult}><ArrowDownToLine size={15} /> Export .md</button>
                  </div>
                  <p className="result-privacy"><LockKeyhole size={13} /> {result.privacy_note}</p>
                </div>
              )}
            </section>
          </div>
        </section>

        <section className="how-section" id="how-it-works">
          <div className="section-kicker">A SMALLER TO-DO LIST</div>
          <h2>From brain dump to breathing room.</h2>
          <div className="steps-grid">
            <article className="step-card"><div className="step-number">01</div><h3>Drop it all in</h3><p>Meeting minutes, lecture notes, or that running list of things you keep postponing.</p></article>
            <article className="step-card"><div className="step-number">02</div><h3>Let local AI sort it</h3><p>An open-weight model organizes the text into a faithful summary and concrete next steps.</p></article>
            <article className="step-card"><div className="step-number">03</div><h3>Get on with your day</h3><p>Copy your action list or download a Markdown file to use wherever you work.</p></article>
          </div>
        </section>

        <section className="privacy-section" id="privacy">
          <div className="privacy-icon"><LockKeyhole size={21} /></div>
          <div><div className="section-kicker">OPEN BY DESIGN</div><h2>Your notes. Your machine. Your choice.</h2><p>LazyDesk is designed to run with a locally hosted open-weight model through Ollama. With the default localhost setup, note text is sent to that local runtime instead of a cloud AI API. Check your configuration before using sensitive information.</p></div>
        </section>
      </main>

      <footer className="footer">
        <a href="https://github.com/gauravbalade/LazyDesk" target="_blank" rel="noreferrer">LazyDesk on GitHub <ArrowRight size={14} /></a>
        <span>Built to make busywork a little lighter. 🦥</span>
      </footer>
    </div>
  );
}

export default App;
