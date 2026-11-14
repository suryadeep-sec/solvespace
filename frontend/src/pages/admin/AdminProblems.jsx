import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  PencilLine,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { apiRequest } from "../../lib/api";
import "./Admin.css";

const emptyForm = {
  title: "",
  description: "",
  subject: "",
  instructions: "",
  deadline: "",
};

const toLocalDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const formatDate = (value) => {
  if (!value) return "No deadline";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "No deadline"
    : new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);
};

export default function AdminProblems() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [draft, setDraft] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [busyProblemId, setBusyProblemId] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");

  const loadProblems = async () => {
    try {
      setLoading(true);
      const response = await apiRequest("/api/admin/problems");
      if (!Array.isArray(response?.data?.problems)) {
        throw new Error("The problems endpoint returned an unexpected response.");
      }
      setProblems(response.data.problems);
      setError("");
    } catch (loadError) {
      setError(loadError.message || "Unable to load problems.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProblems();
  }, []);

  const subjects = useMemo(
    () => [...new Set(problems.map((problem) => problem.subject).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [problems],
  );
  const visibleProblems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return problems.filter((problem) => {
      const matchesStatus = statusFilter === "all" || (problem.status || "active") === statusFilter;
      const matchesSubject = subjectFilter === "all" || problem.subject === subjectFilter;
      const matchesQuery = !normalizedQuery || [problem.title, problem.subject, problem.description]
        .some((value) => String(value || "").toLowerCase().includes(normalizedQuery));
      return matchesStatus && matchesSubject && matchesQuery;
    });
  }, [problems, query, statusFilter, subjectFilter]);

  const stats = useMemo(() => ({
    total: problems.length,
    active: problems.filter((problem) => (problem.status || "active") === "active").length,
    closed: problems.filter((problem) => problem.status === "closed").length,
  }), [problems]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setDraft((current) => ({ ...current, [name]: value }));
  };

  const resetDraft = () => {
    setDraft(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = editingId
        ? await apiRequest(`/api/admin/problems/${editingId}`, { method: "PUT", body: draft })
        : await apiRequest("/api/problems", { method: "POST", body: draft });

      setMessage(response?.message || (editingId ? "Problem updated successfully." : "Problem created successfully."));
      resetDraft();
      await loadProblems();
    } catch (submitError) {
      setError(submitError.message || "Unable to save the problem.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (problem) => {
    setEditingId(problem._id);
    setDraft({
      title: problem.title || "",
      description: problem.description || "",
      subject: problem.subject || "",
      instructions: problem.instructions || "",
      deadline: toLocalDateTime(problem.deadline),
    });
    document.getElementById("problem-title")?.focus();
  };

  const handleDelete = async (problem) => {
    if (!window.confirm(`Delete "${problem.title || "this problem"}"? This will remove it from the platform.`)) return;
    setBusyProblemId(problem._id);
    setError("");
    setMessage("");

    try {
      const response = await apiRequest(`/api/admin/problems/${problem._id}`, { method: "DELETE" });
      setMessage(response?.message || "Problem deleted successfully.");
      if (editingId === problem._id) resetDraft();
      await loadProblems();
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete the problem.");
    } finally {
      setBusyProblemId("");
    }
  };

  const handleStatusUpdate = async (problem) => {
    const nextStatus = problem.status === "active" ? "closed" : "active";
    setBusyProblemId(problem._id);
    setError("");
    setMessage("");

    try {
      const response = await apiRequest(`/api/admin/problems/${problem._id}/status`, {
        method: "PATCH",
        body: { status: nextStatus },
      });
      setMessage(response?.message || "Problem status updated.");
      await loadProblems();
    } catch (statusError) {
      setError(statusError.message || "Unable to update problem status.");
    } finally {
      setBusyProblemId("");
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-shell">
        <header className="admin-page-header">
          <div>
            <div className="admin-eyebrow"><span className="admin-eyebrow-mark" /> LEARNING CONTENT</div>
            <h1>Problems</h1>
            <p>Create, maintain, and control access to platform problems.</p>
          </div>
          <div className="admin-page-count">
            <span className="admin-count-value">{loading ? "—" : stats.total.toLocaleString()}</span>
            <span>problems in library</span>
          </div>
        </header>

        {error ? (
          <div className="admin-error admin-feedback" role="alert">
            <div><strong>Problem management needs attention.</strong><span>{error}</span></div>
            <button type="button" className="admin-secondary-button" onClick={loadProblems}>Try again</button>
          </div>
        ) : null}
        {message ? <div className="admin-success" role="status">{message}</div> : null}

        <section className="admin-problem-stats" aria-label="Problem status summary">
          <article className="admin-compact-stat">
            <span className="admin-compact-stat-icon"><BookOpen size={17} /></span>
            <span><strong>{loading ? "—" : stats.total}</strong><small>Total problems</small></span>
          </article>
          <article className="admin-compact-stat">
            <span className="admin-compact-stat-icon success"><CheckCircle2 size={17} /></span>
            <span><strong>{loading ? "—" : stats.active}</strong><small>Active</small></span>
          </article>
          <article className="admin-compact-stat">
            <span className="admin-compact-stat-icon warning"><Clock3 size={17} /></span>
            <span><strong>{loading ? "—" : stats.closed}</strong><small>Closed</small></span>
          </article>
        </section>

        <section className="admin-card admin-editor-card">
          <div className="admin-card-header">
            <div>
              <span className="admin-section-kicker">{editingId ? "CONTENT UPDATE" : "CONTENT AUTHORING"}</span>
              <h2>{editingId ? "Edit problem" : "Create a problem"}</h2>
            </div>
            {editingId ? (
              <button type="button" className="admin-icon-button" aria-label="Cancel editing" title="Cancel editing" onClick={resetDraft}><X size={17} /></button>
            ) : <span className="admin-editor-icon"><Plus size={18} /></span>}
          </div>
          <div className="admin-card-body">
            <form onSubmit={handleSubmit}>
              <div className="admin-form-grid">
                <div className="admin-field">
                  <label htmlFor="problem-title">Title</label>
                  <input id="problem-title" name="title" value={draft.title} onChange={handleChange} required maxLength={160} />
                </div>
                <div className="admin-field">
                  <label htmlFor="problem-subject">Subject</label>
                  <input id="problem-subject" name="subject" value={draft.subject} onChange={handleChange} required />
                </div>
              </div>
              <div className="admin-form-grid admin-problem-description-grid">
                <div className="admin-field">
                  <label htmlFor="problem-description">Description</label>
                  <textarea id="problem-description" name="description" value={draft.description} onChange={handleChange} required />
                </div>
                <div className="admin-field">
                  <label htmlFor="problem-instructions">Instructions <span className="admin-optional-label">Optional</span></label>
                  <textarea id="problem-instructions" name="instructions" value={draft.instructions} onChange={handleChange} />
                </div>
              </div>
              <div className="admin-problem-form-footer">
                <div className="admin-field admin-deadline-field">
                  <label htmlFor="problem-deadline">Deadline</label>
                  <input id="problem-deadline" name="deadline" type="datetime-local" value={draft.deadline} onChange={handleChange} required />
                </div>
                <div className="admin-actions">
                  <button type="submit" className="admin-button" disabled={saving}>
                    <CheckCircle2 size={16} />{saving ? "Saving..." : editingId ? "Save changes" : "Create problem"}
                  </button>
                  {editingId ? <button type="button" className="admin-secondary-button" onClick={resetDraft}>Cancel</button> : null}
                </div>
              </div>
            </form>
          </div>
        </section>

        <section className="admin-card admin-data-card">
          <div className="admin-card-header">
            <div>
              <span className="admin-section-kicker">CONTENT INDEX</span>
              <h2>Problem library</h2>
            </div>
            <span className="admin-table-total">{visibleProblems.length} shown</span>
          </div>
          <div className="admin-filter-bar">
            <label className="admin-search">
              <Search size={17} />
              <input type="search" aria-label="Search problems" placeholder="Search title, subject, or description" value={query} onChange={(event) => setQuery(event.target.value)} />
            </label>
            <label className="admin-filter-select">
              <span className="admin-sr-only">Filter by problem status</span>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
            </label>
            <label className="admin-filter-select">
              <span className="admin-sr-only">Filter by subject</span>
              <select value={subjectFilter} onChange={(event) => setSubjectFilter(event.target.value)}>
                <option value="all">All subjects</option>
                {subjects.map((subject) => <option key={subject} value={subject}>{subject}</option>)}
              </select>
            </label>
          </div>

          {loading ? (
            <div className="admin-loading-list" aria-label="Loading problems"><span /><span /><span /><span /></div>
          ) : !error && visibleProblems.length === 0 ? (
            <div className="admin-empty-state">
              <div className="admin-empty-icon"><BookOpen size={20} /></div>
              <h3>{problems.length ? "No matching problems" : "Your library is ready"}</h3>
              <p>{problems.length ? "Adjust the search or filters to see other problems." : "Create a problem above to add the first learning item."}</p>
              {query || statusFilter !== "all" || subjectFilter !== "all" ? (
                <button type="button" className="admin-link-button" onClick={() => { setQuery(""); setStatusFilter("all"); setSubjectFilter("all"); }}>Clear filters</button>
              ) : null}
            </div>
          ) : !error ? (
            <>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>Problem</th><th>Subject</th><th>Status</th><th>Deadline</th><th><span className="admin-sr-only">Actions</span></th></tr></thead>
                  <tbody>
                    {visibleProblems.map((problem) => (
                      <tr key={problem._id}>
                        <td><div className="admin-problem-title"><strong>{problem.title || "Untitled problem"}</strong><small>{problem.description || "No description provided"}</small></div></td>
                        <td><span className="admin-subject-label">{problem.subject || "—"}</span></td>
                        <td><span className={`admin-status ${problem.status || "active"}`}>{problem.status || "active"}</span></td>
                        <td className="admin-date-cell">{formatDate(problem.deadline)}</td>
                        <td>
                          <div className="admin-actions">
                            <button type="button" className="admin-icon-button" aria-label={`Edit ${problem.title || "problem"}`} title="Edit problem" onClick={() => handleEdit(problem)}><PencilLine size={16} /></button>
                            <button type="button" className="admin-icon-button" aria-label={`${problem.status === "active" ? "Close" : "Reopen"} ${problem.title || "problem"}`} title={problem.status === "active" ? "Close problem" : "Reopen problem"} disabled={busyProblemId === problem._id} onClick={() => handleStatusUpdate(problem)}>
                              {problem.status === "active" ? <Clock3 size={16} /> : <CheckCircle2 size={16} />}
                            </button>
                            <button type="button" className="admin-icon-button danger" aria-label={`Delete ${problem.title || "problem"}`} title="Delete problem" disabled={busyProblemId === problem._id} onClick={() => handleDelete(problem)}><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="admin-mobile-list">
                {visibleProblems.map((problem) => (
                  <article className="admin-mobile-record" key={problem._id}>
                    <div className="admin-problem-title"><strong>{problem.title || "Untitled problem"}</strong><small>{problem.subject || "—"} · Due {formatDate(problem.deadline)}</small></div>
                    <div className="admin-mobile-record-meta"><span className={`admin-status ${problem.status || "active"}`}>{problem.status || "active"}</span></div>
                    <div className="admin-actions">
                      <button type="button" className="admin-icon-button" aria-label={`Edit ${problem.title || "problem"}`} onClick={() => handleEdit(problem)}><PencilLine size={16} /></button>
                      <button type="button" className="admin-icon-button" aria-label={`${problem.status === "active" ? "Close" : "Reopen"} ${problem.title || "problem"}`} disabled={busyProblemId === problem._id} onClick={() => handleStatusUpdate(problem)}>{problem.status === "active" ? <Clock3 size={16} /> : <CheckCircle2 size={16} />}</button>
                      <button type="button" className="admin-icon-button danger" aria-label={`Delete ${problem.title || "problem"}`} disabled={busyProblemId === problem._id} onClick={() => handleDelete(problem)}><Trash2 size={16} /></button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : null}
        </section>
      </div>
    </div>
  );
}
