import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, BookOpen, CalendarDays, ClipboardCheck, Users } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { apiRequest } from "../../lib/api";
import "./Admin.css";

const metricDefinitions = [
  {
    key: "totalStudents",
    label: "Students",
    detail: "Registered learner accounts",
    icon: Users,
    tone: "cyan",
  },
  {
    key: "totalProblems",
    label: "Problems",
    detail: "Learning items in the platform",
    icon: BookOpen,
    tone: "violet",
  },
  {
    key: "totalAdmins",
    label: "Administrators",
    detail: "Accounts with admin access",
    icon: ClipboardCheck,
    tone: "blue",
  },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const pageRef = useRef(null);

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await apiRequest("/api/admin/dashboard");
      if (!response?.data || typeof response.data !== "object") {
        throw new Error("The dashboard returned an unexpected response.");
      }
      setStats(response.data);
    } catch (loadError) {
      setError(loadError.message || "Unable to load dashboard statistics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  useGSAP(() => {
    if (loading || error || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.from(".admin-metric-card", {
      y: 16,
      opacity: 0,
      duration: 0.45,
      stagger: 0.08,
      ease: "power2.out",
    });
  }, { scope: pageRef, dependencies: [loading, error], revertOnUpdate: true });

  const today = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="admin-page" ref={pageRef}>
      <div className="admin-shell">
        <header className="admin-page-header admin-dashboard-heading">
          <div>
            <div className="admin-eyebrow">
              <span className="admin-eyebrow-mark" />
              PLATFORM OVERVIEW
            </div>
            <h1>Command center<span>.</span></h1>
            <p>A clear view of the people and learning content across SolveSpace.</p>
          </div>
          <div className="admin-date-chip">
            <CalendarDays size={15} />
            <span>{today}</span>
          </div>
        </header>

        {error ? (
          <div className="admin-error admin-feedback" role="alert">
            <div><strong>Dashboard data is unavailable.</strong><span>{error}</span></div>
            <button type="button" className="admin-secondary-button" onClick={loadDashboard}>Try again</button>
          </div>
        ) : null}

        <section className="admin-dashboard-grid" aria-label="Platform summary">
          <div className="admin-metrics-panel">
            <div className="admin-section-heading">
              <div>
                <span className="admin-section-kicker">LIVE AGGREGATES</span>
                <h2>Platform footprint</h2>
              </div>
              <span className="admin-source-note">From dashboard API</span>
            </div>

            <div className="admin-stat-grid">
              {metricDefinitions.map(({ key, label, detail, icon: Icon, tone }) => {
                const value = stats?.[key];
                const validValue = typeof value === "number" && Number.isFinite(value);
                return (
                  <article key={key} className={`admin-metric-card tone-${tone}`}>
                    <div className="admin-metric-top">
                      <span className="admin-metric-icon"><Icon size={18} /></span>
                      <span className="admin-metric-index">{String(metricDefinitions.findIndex((item) => item.key === key) + 1).padStart(2, "0")}</span>
                    </div>
                    <div className="admin-metric-value">
                      {loading ? <span className="admin-skeleton-number" aria-label="Loading" /> : error || !validValue ? "—" : value.toLocaleString()}
                    </div>
                    <h3>{label}</h3>
                    <p>{detail}</p>
                  </article>
                );
              })}
            </div>
          </div>

          <aside className="admin-operations-panel">
            <div className="admin-section-heading">
              <div>
                <span className="admin-section-kicker">OPERATIONS</span>
                <h2>Go to a workspace</h2>
              </div>
            </div>
            <p className="admin-operations-copy">Continue with a supported management workflow.</p>
            <div className="admin-quick-links">
              <Link to="/admin/students" className="admin-quick-link">
                <span className="admin-quick-icon"><Users size={17} /></span>
                <span><strong>Manage students</strong><small>Accounts and access</small></span>
                <ArrowRight size={16} />
              </Link>
              <Link to="/admin/problems" className="admin-quick-link">
                <span className="admin-quick-icon"><BookOpen size={17} /></span>
                <span><strong>Manage problems</strong><small>Learning content</small></span>
                <ArrowRight size={16} />
              </Link>
              <Link to="/admin/submissions" className="admin-quick-link">
                <span className="admin-quick-icon"><ClipboardCheck size={17} /></span>
                <span><strong>Review submissions</strong><small>Read and respond to work</small></span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </aside>
        </section>

        <section className="admin-analytics-note">
          <div className="admin-analytics-mark"><CalendarDays size={18} /></div>
          <div>
            <span className="admin-section-kicker">ANALYTICS SCOPE</span>
            <h2>Aggregate data, clearly presented.</h2>
            <p>The current dashboard API provides totals only. Trend charts and activity history are intentionally omitted until the backend exposes that data.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
