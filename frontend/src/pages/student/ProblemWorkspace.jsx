import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileText,
  FolderOpen,
  Lightbulb,
  List,
  ListOrdered,
  Save,
  Sparkles,
  Target,
} from "lucide-react";

import { apiRequest } from "../../lib/api";
import "./ProblemWorkspace.css";

const DRAFT_PREFIX = "solvespace-problem-draft";

const formatDeadline = (value) => {
  if (!value) return "No deadline";

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "No deadline";
  }

  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatSavedAt = (value) => {
  if (!value) return "Not saved yet";

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Not saved yet";
  }

  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function ProblemWorkspace() {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isInstructionsOpen, setInstructionsOpen] = useState(true);
  const [saveState, setSaveState] = useState("idle");
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [answerHtml, setAnswerHtml] = useState("");
  const [codeDraft, setCodeDraft] = useState("");
  const [notesDraft, setNotesDraft] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const draftKey = useMemo(() => `${DRAFT_PREFIX}-${problemId || "missing"}`, [problemId]);

  useEffect(() => {
    const loadProblem = async () => {
      try {
        setLoading(true);
        const response = await apiRequest(`/api/problems/${problemId}`);
        const loadedProblem = response?.data?.problem || null;

        if (!loadedProblem) {
          throw new Error("Problem not found.");
        }

        setProblem(loadedProblem);

        const storedDraft = localStorage.getItem(draftKey);
        if (storedDraft) {
          try {
            const parsed = JSON.parse(storedDraft);
            setAnswerHtml(parsed.answerHtml || "");
            setCodeDraft(parsed.codeDraft || "");
            setNotesDraft(parsed.notesDraft || "");
            setLastSavedAt(parsed.lastSavedAt || null);
          } catch (parseError) {
            console.warn("Could not restore workspace draft.", parseError);
          }
        }
      } catch (loadError) {
        setError(loadError.message || "Unable to load this problem right now.");
      } finally {
        setLoading(false);
      }
    };

    if (problemId) {
      loadProblem();
    }
  }, [draftKey, problemId]);

  useEffect(() => {
    if (!editorRef.current || !problem || !problemId) {
      return;
    }

    if (editorRef.current.innerHTML !== answerHtml) {
      editorRef.current.innerHTML = answerHtml;
    }
  }, [answerHtml, problem, problemId]);

  useEffect(() => {
    if (!problem || !problemId) {
      return;
    }

    const saveDraft = () => {
      const payload = {
        answerHtml,
        codeDraft,
        notesDraft,
        lastSavedAt: new Date().toISOString(),
      };

      localStorage.setItem(draftKey, JSON.stringify(payload));
      setLastSavedAt(payload.lastSavedAt);
      setSaveState("saved");
    };

    if (!problemId) {
      return undefined;
    }

    setSaveState("saving");
    const timer = window.setTimeout(saveDraft, 400);

    return () => window.clearTimeout(timer);
  }, [answerHtml, codeDraft, notesDraft, draftKey, problem, problemId]);

  const handleContentInput = () => {
    setAnswerHtml(editorRef.current?.innerHTML || "");
  };

  const applyFormatting = (command, value = null) => {
    if (!editorRef.current) return;

    editorRef.current.focus();
    document.execCommand(command, false, value);
    setAnswerHtml(editorRef.current.innerHTML);
  };

  const wordCount = useMemo(() => {
    const text = (editorRef.current?.innerText || answerHtml.replace(/<[^>]*>/g, "")).replace(/\s+/g, " ").trim();
    return text ? text.split(/\s+/).length : 0;
  }, [answerHtml]);

  const handleSubmit = async () => {
    if (!problem || !problemId) {
      return;
    }

    const finalAnswer = (editorRef.current?.innerText || answerHtml.replace(/<[^>]*>/g, "")).trim();
    const combinedAnswer = [finalAnswer, notesDraft.trim() ? `\n\nNotes:\n${notesDraft.trim()}` : "", codeDraft.trim() ? `\n\nCode draft:\n${codeDraft.trim()}` : ""]
      .filter(Boolean)
      .join("\n\n");

    if (!combinedAnswer.trim()) {
      setSubmitError("Add a solution, notes, or code before submitting.");
      return;
    }

    const confirmed = window.confirm(
      "Submit this solution for review? This action is final in the current backend flow and may not be editable after submission."
    );

    if (!confirmed) {
      return;
    }

    try {
      setSubmitError("");
      setSubmitSuccess("");
      const response = await apiRequest("/api/submissions", {
        method: "POST",
        body: {
          problemId,
          answer: combinedAnswer,
          attachments: [],
        },
      });

      const submission = response?.data?.submission;
      setSubmitSuccess("Solution submitted successfully.");
      localStorage.removeItem(draftKey);
      setLastSavedAt(null);
      setSaveState("idle");

      if (submission?._id) {
        navigate(`/student/submissions/${submission._id}`);
        return;
      }

      navigate("/student/submissions");
    } catch (submissionError) {
      setSubmitError(submissionError.message || "Unable to submit your solution right now.");
    }
  };

  const handleManualSave = () => {
    if (!problem || !problemId) {
      return;
    }

    setSaveState("saving");
    const payload = {
      answerHtml,
      codeDraft,
      notesDraft,
      lastSavedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(draftKey, JSON.stringify(payload));
      setLastSavedAt(payload.lastSavedAt);
      setSaveState("saved");
    } catch (saveError) {
      console.error("Workspace draft could not be written.", saveError);
      setSaveState("failed");
    }
  };

  if (loading) {
    return (
      <div className="workspace-page">
        <div className="problem-not-found" style={{ minHeight: "50vh" }}>
          <div className="problem-not-found-icon">
            <FileText size={27} />
          </div>
          <h1>Loading workspace</h1>
          <p>Preparing your assignment environment.</p>
        </div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="workspace-page">
        <div className="problem-not-found">
          <div className="problem-not-found-icon">
            <Target size={27} />
          </div>
          <h1>Problem unavailable</h1>
          <p>{error || "This problem could not be loaded."}</p>
          <button onClick={() => navigate("/student/problems")}>
            <ArrowLeft size={16} />
            Back to Problems
          </button>
        </div>
      </div>
    );
  }

  const saveStateLabel =
    saveState === "saving" ? "Saving..." : saveState === "saved" ? "Saved" : saveState === "failed" ? "Save failed" : "Draft ready";

  const statusTone =
    saveState === "saving" ? "saving" : saveState === "saved" ? "saved" : saveState === "failed" ? "failed" : "saved";

  return (
    <div className="workspace-page">
      <header className="workspace-header">
        <div className="workspace-header-left">
          <div className="workspace-brand">
            <Sparkles size={18} />
          </div>

          <div className="workspace-header-meta">
            <h1>{problem.title}</h1>
            <div className="workspace-header-subject">{problem.subject}</div>
          </div>
        </div>

        <div className="workspace-header-actions">
          <button type="button" className="workspace-secondary-button" onClick={() => navigate(`/student/problems/${problemId}`)}>
            <ArrowLeft size={15} />
            Back to problem
          </button>

          <span className="workspace-chip">
            <Clock3 size={14} />
            {formatDeadline(problem.deadline)}
          </span>

          <span className={`workspace-save-indicator ${statusTone}`}>
            <Save size={14} />
            {saveStateLabel}
          </span>

          <span className="workspace-status-chip">
            <CheckCircle2 size={14} />
            {problem.status === "active" ? "Open" : "Closed"}
          </span>
        </div>
      </header>

      <div className="workspace-shell">
        <aside className="workspace-panel workspace-instructions">
          <div className="workspace-panel-header">
            <strong>Problem instructions</strong>
            <button type="button" onClick={() => setInstructionsOpen((current) => !current)}>
              {isInstructionsOpen ? "Hide" : "Show"}
            </button>
          </div>

          {isInstructionsOpen ? (
            <div className="workspace-instructions-body">
              <div className="workspace-detail-block">
                <h3>Description</h3>
                <p>{problem.description}</p>
              </div>

              <div className="workspace-detail-block">
                <h3>Full instructions</h3>
                <p>{problem.instructions || "Review the assignment brief carefully and produce your final solution in the workspace."}</p>
              </div>

              <div className="workspace-detail-block">
                <h3>Requirements</h3>
                <ul>
                  <li>Prepare a complete solution using the assignment brief and expected deliverables.</li>
                  <li>Document reasoning, implementation details, and final answer quality.</li>
                  <li>Check the deadline before submitting your final work.</li>
                </ul>
              </div>

              <div className="workspace-metrics">
                <div className="workspace-metric">
                  <span className="workspace-metric-label">Deadline</span>
                  <span className="workspace-metric-value">{formatDeadline(problem.deadline)}</span>
                </div>

                <div className="workspace-metric">
                  <span className="workspace-metric-label">Status</span>
                  <span className="workspace-metric-value">{problem.status === "active" ? "Active" : "Closed"}</span>
                </div>
              </div>

              <div className="workspace-detail-block">
                <h3>Important</h3>
                <p>
                  Drafts are saved locally in the browser because the current backend does not offer a dedicated draft API. Your work is restored on refresh, but the final submit action still uses the backend submission endpoint.
                </p>
              </div>
            </div>
          ) : null}
        </aside>

        <main className="workspace-panel workspace-main">
          <div className="workspace-toolbar">
            <div className="workspace-editor-tools">
              <button type="button" onClick={() => applyFormatting("bold")}>Bold</button>
              <button type="button" onClick={() => applyFormatting("italic")}>Italic</button>
              <button type="button" onClick={() => applyFormatting("formatBlock", "h2")}>Heading</button>
              <button type="button" onClick={() => applyFormatting("insertUnorderedList")}><List size={14} /> Bullets</button>
              <button type="button" onClick={() => applyFormatting("insertOrderedList")}><ListOrdered size={14} /> Numbered</button>
              <button type="button" onClick={() => applyFormatting("formatBlock", "pre")}>Code block</button>
            </div>

            <div className="workspace-actions">
              <button type="button" className="workspace-secondary-button" onClick={handleManualSave}>
                <Save size={15} />
                Save draft
              </button>
              <button type="button" className="workspace-primary-button" onClick={handleSubmit}>
                Submit solution
              </button>
            </div>
          </div>

          <div className="workspace-editor-area">
            <div className="workspace-editor-surface">
              <div className="workspace-panel-header">
                <strong>Solution answer</strong>
                <span className="workspace-chip">
                  <BookOpen size={13} />
                  Rich text
                </span>
              </div>

              <div
                ref={editorRef}
                className="workspace-rich-editor"
                contentEditable
                suppressContentEditableWarning
                onInput={handleContentInput}
                data-placeholder="Write your solution here..."
              />
            </div>

            <div className="workspace-code-panel">
              <div className="workspace-code-header">
                <strong>Code draft</strong>
                <span className="workspace-chip">
                  <FolderOpen size={13} />
                  Sandbox draft
                </span>
              </div>

              <textarea
                className="workspace-code-editor"
                value={codeDraft}
                onChange={(event) => setCodeDraft(event.target.value)}
                placeholder="Paste code, pseudo-code, or implementation notes here..."
              />
            </div>

            <div className="workspace-notes">
              <div className="workspace-panel-header">
                <strong>Supporting notes</strong>
                <span className="workspace-chip">
                  <Lightbulb size={13} />
                  Helpful context
                </span>
              </div>

              <textarea
                value={notesDraft}
                onChange={(event) => setNotesDraft(event.target.value)}
                placeholder="Add additional reasoning, implementation notes, or a quick explanation of your approach..."
              />
            </div>

            {submitError ? <div className="workspace-error">{submitError}</div> : null}
            {submitSuccess ? <div className="workspace-success">{submitSuccess}</div> : null}

            <div className="workspace-meta-footer">
              <span className="workspace-word-count">
                <List size={14} />
                {wordCount} words
              </span>
              <span>
                {lastSavedAt ? `Last saved: ${formatSavedAt(lastSavedAt)}` : "No saved draft yet"}
              </span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
