import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ClipboardCheck,
  Clock3,
  Download,
  FileText,
  Search,
  X,
} from "lucide-react";
import { apiDownload, apiRequest } from "../../lib/api";
import "./Admin.css";

const formatDate = (value, includeTime = false) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      ...(includeTime ? { hour: "numeric", minute: "2-digit" } : {}),
    }).format(date);
};

const formatFileSize = (value) => {
  if (typeof value !== "number" || !Number.isFinite(value)) return "";
  if (value < 1024) return `${value} B`;
  return `${(value / 1024).toFixed(1)} KB`;
};

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerError, setDrawerError] = useState("");
  const [reviewStatus, setReviewStatus] = useState("approved");
  const [adminFeedback, setAdminFeedback] = useState("");
  const [savingReview, setSavingReview] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState("");

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const response = await apiRequest("/api/submissions");
      if (!Array.isArray(response?.data?.submissions)) {
        throw new Error("The submissions endpoint returned an unexpected response.");
      }
      setSubmissions(response.data.submissions);
      setError("");
    } catch (loadError) {
      setError(loadError.message || "Unable to load submissions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const counts = useMemo(() => ({
    total: submissions.length,
    pending: submissions.filter((submission) => submission.status === "pending").length,
    reviewed: submissions.filter((submission) => ["approved", "rejected"].includes(submission.status)).length,
  }), [submissions]);

  const visibleSubmissions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return submissions.filter((submission) => {
      const matchesStatus = statusFilter === "all" || submission.status === statusFilter;
      const searchable = [
        submission.student?.name,
        submission.student?.email,
        submission.problem?.title,
        submission.problem?.subject,
      ];
      const matchesQuery = !normalizedQuery || searchable
        .some((value) => String(value || "").toLowerCase().includes(normalizedQuery));
      return matchesStatus && matchesQuery;
    });
  }, [submissions, query, statusFilter]);

  const openSubmission = async (submission) => {
    setSelectedSubmission(submission);
    setDrawerLoading(true);
    setDrawerError("");
    setReviewStatus("approved");
    setAdminFeedback(submission.adminFeedback || "");

    try {
      const response = await apiRequest(`/api/submissions/${submission._id}`);
      if (!response?.data?.submission) {
        throw new Error("The submission details endpoint returned an unexpected response.");
      }
      setSelectedSubmission(response.data.submission);
      setAdminFeedback(response.data.submission.adminFeedback || "");
    } catch (loadError) {
      setDrawerError(loadError.message || "Unable to load submission details.");
    } finally {
      setDrawerLoading(false);
    }
  };

  const closeDrawer = () => {
    setSelectedSubmission(null);
    setDrawerError("");
  };

  const handleReview = async (event) => {
    event.preventDefault();
    if (!selectedSubmission) return;
    setSavingReview(true);
    setDrawerError("");

    try {
      const response = await apiRequest(`/api/submissions/${selectedSubmission._id}/review`, {
        method: "PATCH",
        body: { status: reviewStatus, adminFeedback },
      });
      if (!response?.data?.submission) {
        throw new Error("The review endpoint returned an unexpected response.");
      }
      setSelectedSubmission(response.data.submission);
      setMessage(response?.message || "Submission review saved.");
      await loadSubmissions();
    } catch (reviewError) {
      setDrawerError(reviewError.message || "Unable to save this review.");
    } finally {
      setSavingReview(false);
    }
  };

  const handleDownload = async (submission, attachment) => {
    const attachmentKey = `${submission._id}-${attachment.fileName}`;
    setDownloadingFile(attachmentKey);
    setDrawerError("");

    try {
      const endpoint = `/api/submissions/${encodeURIComponent(submission._id)}/attachments/${encodeURIComponent(attachment.fileName)}`;
      await apiDownload(endpoint, attachment.originalName || attachment.fileName);
    } catch (downloadError) {
      setDrawerError(downloadError.message || "Unable to download this attachment.");
    } finally {
      setDownloadingFile("");
    }
  };

  const renderStatus = (status) => (
    <span className={`admin-status ${status || "pending"}`}>
      {status === "approved" ? <Check size={12} /> : status === "pending" ? <Clock3 size={12} /> : null}
      {status || "pending"}
    </span>
  );

  return (
    <div className="admin-page">
      <div className="admin-shell">
        <header className="admin-page-header">
          <div>
            <div className="admin-eyebrow"><span className="admin-eyebrow-mark" /> LEARNER WORK</div>
            <h1>Submissions</h1>
            <p>Review student responses and record an outcome with feedback.</p>
          </div>
          <div className="admin-page-count">
            <span className="admin-count-value">{loading ? "—" : counts.pending.toLocaleString()}</span>
            <span>awaiting review</span>
          </div>
        </header>

        {error ? (
          <div className="admin-error admin-feedback" role="alert">
            <div><strong>Submission records could not be loaded.</strong><span>{error}</span></div>
            <button type="button" className="admin-secondary-button" onClick={loadSubmissions}>Try again</button>
          </div>
        ) : null}
        {message ? <div className="admin-success" role="status">{message}</div> : null}

        <section className="admin-submission-stats" aria-label="Submission summary">
          <article className="admin-compact-stat">
            <span className="admin-compact-stat-icon"><ClipboardCheck size={17} /></span>
            <span><strong>{loading ? "—" : counts.total}</strong><small>Total submissions</small></span>
          </article>
          <article className="admin-compact-stat">
            <span className="admin-compact-stat-icon warning"><Clock3 size={17} /></span>
            <span><strong>{loading ? "—" : counts.pending}</strong><small>Pending review</small></span>
          </article>
          <article className="admin-compact-stat">
            <span className="admin-compact-stat-icon success"><Check size={17} /></span>
            <span><strong>{loading ? "—" : counts.reviewed}</strong><small>Reviewed</small></span>
          </article>
        </section>

        <section className="admin-card admin-data-card">
          <div className="admin-card-header">
            <div><span className="admin-section-kicker">REVIEW QUEUE</span><h2>Student work</h2></div>
            <span className="admin-table-total">{visibleSubmissions.length} shown</span>
          </div>
          <div className="admin-filter-bar">
            <label className="admin-search">
              <Search size={17} />
              <input type="search" aria-label="Search submissions" placeholder="Search learner or problem" value={query} onChange={(event) => setQuery(event.target.value)} />
            </label>
            <label className="admin-filter-select">
              <span className="admin-sr-only">Filter by review status</span>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </label>
          </div>

          {loading ? (
            <div className="admin-loading-list" aria-label="Loading submissions"><span /><span /><span /><span /></div>
          ) : !error && visibleSubmissions.length === 0 ? (
            <div className="admin-empty-state">
              <div className="admin-empty-icon"><ClipboardCheck size={20} /></div>
              <h3>{submissions.length ? "No matching submissions" : "No submissions to review"}</h3>
              <p>{submissions.length ? "Try another search or status filter." : "Submitted student work will appear here when available."}</p>
              {query || statusFilter !== "all" ? (
                <button type="button" className="admin-link-button" onClick={() => { setQuery(""); setStatusFilter("all"); }}>Clear filters</button>
              ) : null}
            </div>
          ) : !error ? (
            <>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>Student</th><th>Problem</th><th>Submitted</th><th>Status</th><th><span className="admin-sr-only">Actions</span></th></tr></thead>
                  <tbody>
                    {visibleSubmissions.map((submission) => (
                      <tr key={submission._id}>
                        <td><div className="admin-person-cell compact"><span className="admin-person-avatar">{(submission.student?.name || "S").slice(0, 1).toUpperCase()}</span><span><strong>{submission.student?.name || "Student unavailable"}</strong><small>{submission.student?.email || "—"}</small></span></div></td>
                        <td><div className="admin-problem-title"><strong>{submission.problem?.title || "Problem unavailable"}</strong><small>{submission.problem?.subject || "—"}</small></div></td>
                        <td className="admin-date-cell">{formatDate(submission.createdAt, true)}</td>
                        <td>{renderStatus(submission.status)}</td>
                        <td><button type="button" className="admin-secondary-button admin-review-button" onClick={() => openSubmission(submission)}>{submission.status === "pending" ? "Review" : "View review"}</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="admin-mobile-list">
                {visibleSubmissions.map((submission) => (
                  <article className="admin-mobile-record" key={submission._id}>
                    <div className="admin-person-cell compact"><span className="admin-person-avatar">{(submission.student?.name || "S").slice(0, 1).toUpperCase()}</span><span><strong>{submission.student?.name || "Student unavailable"}</strong><small>{submission.problem?.title || "Problem unavailable"}</small></span></div>
                    <div className="admin-mobile-record-meta">{renderStatus(submission.status)}<span>{formatDate(submission.createdAt, true)}</span></div>
                    <button type="button" className="admin-secondary-button admin-review-button" onClick={() => openSubmission(submission)}>{submission.status === "pending" ? "Review submission" : "View review"}</button>
                  </article>
                ))}
              </div>
            </>
          ) : null}
        </section>
      </div>

      {selectedSubmission ? (
        <div className="admin-drawer-layer">
          <button type="button" className="admin-drawer-scrim" aria-label="Close submission review" onClick={closeDrawer} />
          <aside className="admin-drawer" role="dialog" aria-modal="true" aria-labelledby="submission-drawer-title">
            <div className="admin-drawer-header">
              <div><span className="admin-section-kicker">SUBMISSION DETAIL</span><h2 id="submission-drawer-title">Review student work</h2></div>
              <button type="button" className="admin-icon-button" aria-label="Close" onClick={closeDrawer}><X size={17} /></button>
            </div>
            {drawerLoading ? <div className="admin-loading-list"><span /><span /></div> : drawerError ? (
              <div className="admin-error" role="alert">{drawerError}</div>
            ) : (
              <div className="admin-drawer-content">
                <div className="admin-review-summary">
                  <div><span className="admin-section-kicker">LEARNER</span><strong>{selectedSubmission.student?.name || "Student unavailable"}</strong><small>{selectedSubmission.student?.email || "—"}</small></div>
                  <div><span className="admin-section-kicker">PROBLEM</span><strong>{selectedSubmission.problem?.title || "Problem unavailable"}</strong><small>{selectedSubmission.problem?.subject || "—"}</small></div>
                  <div className="admin-review-meta"><span>Submitted {formatDate(selectedSubmission.createdAt, true)}</span>{renderStatus(selectedSubmission.status)}</div>
                </div>

                <section className="admin-response-section">
                  <div className="admin-section-heading"><div><span className="admin-section-kicker">RESPONSE</span><h3>Written answer</h3></div></div>
                  <div className="admin-student-answer">{selectedSubmission.answer?.trim() || "No written response was included."}</div>
                </section>

                {Array.isArray(selectedSubmission.attachments) && selectedSubmission.attachments.length ? (
                  <section className="admin-response-section">
                    <div className="admin-section-heading"><div><span className="admin-section-kicker">FILES</span><h3>Attachments</h3></div></div>
                    <div className="admin-attachment-list">
                      {selectedSubmission.attachments.map((attachment) => {
                        const attachmentKey = `${selectedSubmission._id}-${attachment.fileName}`;
                        return (
                          <div className="admin-attachment" key={attachmentKey}>
                            <span className="admin-attachment-icon"><FileText size={17} /></span>
                            <span className="admin-attachment-info"><strong>{attachment.originalName || attachment.fileName}</strong><small>{attachment.mimeType || "File"}{attachment.size ? ` · ${formatFileSize(attachment.size)}` : ""}</small></span>
                            <button type="button" className="admin-icon-button" aria-label={`Download ${attachment.originalName || attachment.fileName}`} title="Download attachment" disabled={downloadingFile === attachmentKey} onClick={() => handleDownload(selectedSubmission, attachment)}>
                              <Download size={16} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ) : null}

                {selectedSubmission.status !== "pending" ? (
                  <section className="admin-response-section">
                    <div className="admin-section-heading"><div><span className="admin-section-kicker">PREVIOUS REVIEW</span><h3>Administrator feedback</h3></div></div>
                    <div className="admin-student-answer">{selectedSubmission.adminFeedback || "No feedback was recorded."}</div>
                    {selectedSubmission.reviewedAt ? <p className="admin-reviewed-at">Reviewed {formatDate(selectedSubmission.reviewedAt, true)}{selectedSubmission.reviewedBy?.name ? ` by ${selectedSubmission.reviewedBy.name}` : ""}</p> : null}
                  </section>
                ) : null}

                <form className="admin-review-form" onSubmit={handleReview}>
                  <div className="admin-section-heading"><div><span className="admin-section-kicker">RECORD AN OUTCOME</span><h3>{selectedSubmission.status === "pending" ? "Complete review" : "Update review"}</h3></div></div>
                  <div className="admin-field">
                    <label htmlFor="review-status">Outcome</label>
                    <select id="review-status" value={reviewStatus} onChange={(event) => setReviewStatus(event.target.value)}>
                      <option value="approved">Approve</option>
                      <option value="rejected">Reject</option>
                    </select>
                  </div>
                  <div className="admin-field">
                    <label htmlFor="admin-feedback">Feedback <span className="admin-optional-label">Optional</span></label>
                    <textarea id="admin-feedback" value={adminFeedback} onChange={(event) => setAdminFeedback(event.target.value)} rows={4} />
                  </div>
                  <button type="submit" className="admin-button" disabled={savingReview}>{savingReview ? "Saving review..." : "Save review"}</button>
                </form>
              </div>
            )}
          </aside>
        </div>
      ) : null}
    </div>
  );
}
