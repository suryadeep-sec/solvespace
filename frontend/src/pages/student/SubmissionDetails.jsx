import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, CheckCircle2, Clock3, FileText, XCircle } from "lucide-react";

import { apiRequest } from "../../lib/api";

const statusStyles = {
  pending: { label: "Pending", color: "#fbbf24", bg: "rgba(245, 158, 11, 0.14)" },
  approved: { label: "Approved", color: "#4ade80", bg: "rgba(34, 197, 94, 0.14)" },
  rejected: { label: "Rejected", color: "#f87171", bg: "rgba(239, 68, 68, 0.14)" },
};

export default function SubmissionDetails() {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSubmission = async () => {
      try {
        setLoading(true);
        const response = await apiRequest("/api/submissions/my");
        const items = response?.data?.submissions || [];
        const match = items.find((item) => item._id === submissionId || item.id === submissionId);

        if (!match) {
          setError("Submission not found in your account.");
          setSubmission(null);
          return;
        }

        setSubmission(match);
      } catch (loadError) {
        setError(loadError.message || "Unable to load this submission.");
      } finally {
        setLoading(false);
      }
    };

    if (submissionId) {
      loadSubmission();
    }
  }, [submissionId]);

  const status = useMemo(() => statusStyles[submission?.status] || statusStyles.pending, [submission]);

  if (loading) {
    return (
      <div style={{ padding: "28px", color: "var(--ss-text-secondary)" }}>
        Loading submission details...
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div style={{ padding: "28px" }}>
        <div style={{ background: "var(--ss-surface)", border: "1px solid var(--ss-border)", borderRadius: "20px", padding: "32px", maxWidth: "560px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--ss-primary)", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            <FileText size={14} /> Submission
          </div>
          <h1 style={{ marginTop: "12px", fontSize: "2rem", fontFamily: "var(--ss-font-display)" }}>Not available</h1>
          <p style={{ marginTop: "8px", color: "var(--ss-text-secondary)" }}>{error || "This submission could not be found."}</p>
          <button type="button" onClick={() => navigate("/student/submissions")} style={{ marginTop: "18px", background: "linear-gradient(135deg, var(--ss-primary), #4ec2ff)", color: "#fff", border: 0, borderRadius: "10px", padding: "11px 15px", fontWeight: 700 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}><ArrowLeft size={16} /> Back to submissions</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "28px" }}>
      <button type="button" onClick={() => navigate("/student/submissions")} style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "transparent", border: "1px solid var(--ss-border)", color: "var(--ss-text-primary)", borderRadius: "10px", padding: "9px 12px" }}>
        <ArrowLeft size={16} /> Back to submissions
      </button>

      <div style={{ marginTop: "22px", background: "var(--ss-surface)", border: "1px solid var(--ss-border)", borderRadius: "22px", padding: "28px", maxWidth: "920px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <div>
            <div style={{ color: "var(--ss-primary)", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 800 }}>
              {submission.problem?.subject || "Problem"}
            </div>
            <h1 style={{ marginTop: "8px", fontSize: "2rem", fontFamily: "var(--ss-font-display)" }}>{submission.problem?.title || "Problem submission"}</h1>
          </div>

          <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "7px 12px", borderRadius: "999px", fontWeight: 700, background: status.bg, color: status.color }}>
            {submission.status === "approved" && <CheckCircle2 size={14} />}
            {submission.status === "rejected" && <XCircle size={14} />}
            {submission.status === "pending" && <Clock3 size={14} />}
            {status.label}
          </span>
        </div>

        <div style={{ marginTop: "26px", display: "grid", gap: "18px" }}>
          <section style={{ background: "rgba(15, 23, 42, 0.35)", border: "1px solid var(--ss-border)", borderRadius: "16px", padding: "18px" }}>
            <h2 style={{ fontSize: "1.05rem", marginBottom: "10px" }}>Submission answer</h2>
            <p style={{ color: "var(--ss-text-secondary)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
              {submission.answer || "No written answer was provided for this submission."}
            </p>
          </section>

          <section style={{ background: "rgba(15, 23, 42, 0.35)", border: "1px solid var(--ss-border)", borderRadius: "16px", padding: "18px" }}>
            <h2 style={{ fontSize: "1.05rem", marginBottom: "12px" }}>Attachments</h2>
            {!submission.attachments || !submission.attachments.length ? (
              <p style={{ color: "var(--ss-text-secondary)" }}>No attachments were uploaded for this submission.</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "10px" }}>
                {submission.attachments.map((attachment) => (
                  <li key={attachment.fileName} style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", padding: "10px 12px", border: "1px solid var(--ss-border)", borderRadius: "10px" }}>
                    <span>{attachment.originalName || attachment.fileName}</span>
                    <span style={{ color: "var(--ss-text-secondary)" }}>{attachment.mimeType || "file"}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {submission.adminFeedback ? (
            <section style={{ background: "rgba(122, 94, 255, 0.08)", border: "1px solid rgba(122, 94, 255, 0.18)", borderRadius: "16px", padding: "18px" }}>
              <h2 style={{ fontSize: "1.05rem", marginBottom: "10px" }}>Feedback</h2>
              <p style={{ color: "var(--ss-text-secondary)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{submission.adminFeedback}</p>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
