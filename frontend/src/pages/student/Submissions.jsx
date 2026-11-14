import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { FileText, Clock3, CheckCircle2, XCircle, ArrowUpRight } from "lucide-react";
import { apiRequest } from "../../lib/api";

const statusColors = {
  pending: { background: "rgba(245, 158, 11, 0.14)", color: "#fbbf24" },
  approved: { background: "rgba(34, 197, 94, 0.14)", color: "#4ade80" },
  rejected: { background: "rgba(239, 68, 68, 0.14)", color: "#f87171" },
};

export default function Submissions() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const response = await apiRequest("/api/submissions/my");
        setSubmissions(response?.data?.submissions || []);
      } catch (loadError) {
        setError(loadError.message || "Unable to load your submissions.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "28px", color: "var(--ss-text-secondary)" }}>
        Loading submissions...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "28px" }}>
        <div style={{ color: "#ff9fa8", background: "rgba(255, 100, 100, 0.1)", border: "1px solid rgba(255,100,100,0.2)", borderRadius: "16px", padding: "18px" }}>{error}</div>
      </div>
    );
  }

  return (
    <div style={{ padding: "28px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
        <div>
          <div style={{ color: "var(--ss-primary)", fontSize: "11px", fontWeight: 800, letterSpacing: "1.4px", textTransform: "uppercase" }}>
            Student Workspace
          </div>
          <h1 style={{ marginTop: "8px", fontSize: "2rem", fontFamily: "var(--ss-font-display)" }}>My submissions</h1>
        </div>
      </div>

      {!submissions.length ? (
        <div style={{ background: "var(--ss-surface)", border: "1px solid var(--ss-border)", borderRadius: "20px", padding: "36px 28px", textAlign: "center" }}>
          <FileText size={28} style={{ margin: "0 auto 14px", color: "var(--ss-primary)" }} />
          <h2 style={{ fontSize: "1.3rem" }}>No submissions yet</h2>
          <p style={{ marginTop: "8px" }}>Your submitted assignments will appear here once you start working on a problem.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "16px" }}>
          {submissions.map((submission) => (
            <article key={submission._id || submission.id} style={{ background: "var(--ss-surface)", border: "1px solid var(--ss-border)", borderRadius: "18px", padding: "22px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                <div>
                  <div style={{ color: "var(--ss-text-secondary)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    {submission.problem?.subject || "Problem"}
                  </div>
                  <h3 style={{ marginTop: "6px", fontSize: "1.2rem" }}>{submission.problem?.title || "Problem submission"}</h3>
                </div>

                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "7px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: 700, ...statusColors[submission.status] }}>
                  {submission.status === "approved" && <CheckCircle2 size={14} />}
                  {submission.status === "rejected" && <XCircle size={14} />}
                  {submission.status === "pending" && <Clock3 size={14} />}
                  {submission.status}
                </span>
              </div>

              <div style={{ marginTop: "18px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", color: "var(--ss-text-secondary)" }}>
                <span>Submitted {submission.createdAt ? new Date(submission.createdAt).toLocaleDateString() : "recently"}</span>
                <span>{submission.attachments?.length || 0} attachment(s)</span>
              </div>

              {submission.adminFeedback ? (
                <div style={{ marginTop: "14px", background: "rgba(122, 94, 255, 0.08)", border: "1px solid rgba(122, 94, 255, 0.18)", borderRadius: "12px", padding: "12px 14px", color: "var(--ss-text-secondary)" }}>
                  <strong style={{ color: "var(--ss-text-primary)" }}>Feedback</strong>
                  <div style={{ marginTop: "6px" }}>{submission.adminFeedback}</div>
                </div>
              ) : null}

              <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => navigate(`/student/submissions/${submission._id || submission.id}`)} style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "transparent", border: "1px solid var(--ss-border)", color: "var(--ss-text-primary)", borderRadius: "10px", padding: "9px 12px" }}>
                  View details <ArrowUpRight size={15} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
