import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { gsap } from "gsap";

import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Code2,
  Layers3,
  Search,
  Sparkles,
  Trophy,
  Upload,
  Zap,
} from "lucide-react";

import { apiRequest } from "../../lib/api";
import "./Dashboard.css";

const fallbackStats = [
  { label: "Total Problems", value: 0, icon: Layers3, color: "violet", note: "Available to explore" },
  { label: "Active Problems", value: 0, icon: Code2, color: "blue", note: "Open challenges" },
  { label: "Submitted", value: 0, icon: Upload, color: "amber", note: "Your work submitted" },
  { label: "Pending Review", value: 0, icon: Clock3, color: "green", note: "Awaiting feedback" },
];

function Dashboard() {
  const navigate = useNavigate();
  const counterRef = useRef(null);
  const [search, setSearch] = useState("");
  const [profileName, setProfileName] = useState("Student");
  const [stats, setStats] = useState(fallbackStats);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [dashboardResponse, problemsResponse, profileResponse] = await Promise.all([
          apiRequest("/api/student/dashboard"),
          apiRequest("/api/problems"),
          apiRequest("/api/profile/me"),
        ]);

        const dashboard = dashboardResponse?.data?.dashboard || {};
        const problemList = problemsResponse?.data?.problems || [];
        const user = profileResponse?.data?.user || {};

        setProfileName(user.name || "Student");
        setProblems(problemList.slice(0, 3));
        setStats([
          { label: "Total Problems", value: dashboard.totalProblems || 0, icon: Layers3, color: "violet", note: "Available to explore" },
          { label: "Active Problems", value: dashboard.activeProblems || 0, icon: Code2, color: "blue", note: "Open challenges" },
          { label: "Submitted", value: dashboard.totalSubmissions || 0, icon: Upload, color: "amber", note: "Your work submitted" },
          { label: "Pending Review", value: dashboard.pendingSubmissions || 0, icon: Clock3, color: "green", note: "Awaiting feedback" },
        ]);
      } catch (loadError) {
        setError(loadError.message || "Unable to load your dashboard right now.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".dashboard-counter",
        { textContent: 0 },
        {
          textContent: (index, element) => Number(element.dataset.value),
          duration: 1.2,
          ease: "power2.out",
          snap: { textContent: 1 },
          stagger: 0.12,
        }
      );
    }, counterRef);

    return () => ctx.revert();
  }, [stats]);

  const filteredProblems = useMemo(
    () =>
      problems.filter((problem) =>
        `${problem.title || ""} ${problem.subject || ""} ${problem.instructions || ""}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [problems, search]
  );

  const goToProblems = () => navigate("/student/problems");
  const goToSubmissions = () => navigate("/student/submissions");

  return (
    <div className="dashboard-page">
      <motion.section
        className="dash-intro"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <div className="dash-eyebrow">
            <span className="dash-live-dot" />
            STUDENT WORKSPACE
            <span className="dash-eyebrow-divider">/</span>
            OVERVIEW
          </div>

          <h1>
            Welcome back, <span>{profileName.split(" ")[0]}.</span>
          </h1>

          <p>Your ideas become progress, one problem at a time.</p>
        </div>

        <div className="dash-date">
          <CalendarDays size={16} />
          <span>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
        </div>
      </motion.section>

      <motion.section
        className="dash-hero"
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="dash-hero-grid" />

        <div className="dash-hero-content">
          <div className="dash-hero-label">
            <Sparkles size={14} />
            YOUR LEARNING JOURNEY
          </div>

          <h2>
            Think deeper.
            <br />
            <span>Build better solutions.</span>
          </h2>

          <p>
            Explore challenges, sharpen your technical skills and turn what you learn into something meaningful.
          </p>

          <div className="dash-hero-buttons">
            <button className="dash-button-primary" onClick={goToProblems}>
              Explore problems <ArrowRight size={16} />
            </button>

            <button className="dash-button-ghost" onClick={goToSubmissions}>
              View submissions
            </button>
          </div>
        </div>

        <div className="dash-hero-visual" aria-hidden="true">
          <div className="dash-orbit orbit-one" />
          <div className="dash-orbit orbit-two" />
          <div className="dash-orbit orbit-three" />

          <div className="dash-hero-code">
            <span>01 / LEARN</span>
            <Code2 size={47} strokeWidth={1.3} />
            <strong>BUILD.</strong>
            <span>THEN REPEAT ↗</span>
          </div>

          <div className="dash-hero-floating">
            <Zap size={15} />
            <span>Keep progressing</span>
          </div>
        </div>
      </motion.section>

      {error ? (
        <div className="dash-panel" style={{ marginBottom: "18px", background: "rgba(239, 68, 68, 0.08)", borderColor: "rgba(239,68,68,0.25)" }}>
          <p style={{ color: "#fca5a5" }}>{error}</p>
        </div>
      ) : null}

      <section className="dash-stats" ref={counterRef}>
        {stats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <motion.article
              key={stat.label}
              className="dash-stat-card"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + index * 0.08 }}
              whileHover={{ y: -5 }}
            >
              <div className="dash-stat-top">
                <div className={`dash-stat-icon ${stat.color}`}>
                  <Icon size={20} />
                </div>
                <ArrowUpRight size={17} className="dash-muted-icon" />
              </div>

              <div className="dash-stat-number">
                <strong className="dashboard-counter" data-value={stat.value}>
                  {loading ? 0 : stat.value}
                </strong>
              </div>

              <h3>{stat.label}</h3>
              <p>{stat.note}</p>
            </motion.article>
          );
        })}
      </section>

      <div className="dash-content-grid">
        <div className="dash-main-column">
          <section className="dash-panel">
            <div className="dash-panel-header">
              <div>
                <div className="dash-section-kicker">YOUR NEXT CHALLENGE</div>
                <h2>Explore Problems</h2>
                <p>Pick a challenge and put your skills to work.</p>
              </div>

              <button className="dash-text-button" onClick={goToProblems}>
                View all <ArrowUpRight size={16} />
              </button>
            </div>

            <div className="dash-search">
              <Search size={17} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Find a problem or subject..."
                aria-label="Search problems"
              />
            </div>

            <div className="dash-problem-list">
              {!filteredProblems.length ? (
                <div className="empty-state" style={{ padding: "18px 0" }}>
                  <p>No problems match your current search.</p>
                </div>
              ) : (
                filteredProblems.map((problem, index) => (
                  <motion.article
                    key={problem._id || problem.id}
                    className="dash-problem"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.07 }}
                  >
                    <div className="dash-problem-header">
                      <div>
                        <span className="dash-problem-subject">{problem.subject || "General"}</span>
                        <h3>{problem.title}</h3>
                      </div>
                      <span className={`problem-status status-${(problem.status || "active").toLowerCase()}`}>
                        {problem.status === "active" ? "Active" : "Closed"}
                      </span>
                    </div>

                    <p>{problem.description}</p>

                    <div className="dash-problem-meta">
                      <span>
                        <Clock3 size={14} />
                        {problem.deadline ? new Date(problem.deadline).toLocaleDateString() : "No deadline"}
                      </span>
                      <button type="button" className="dash-problem-button" onClick={() => navigate(`/student/problems/${problem._id}`)}>
                        Open
                        <ArrowUpRight size={15} />
                      </button>
                    </div>
                  </motion.article>
                ))
              )}
            </div>
          </section>
        </div>

        <aside className="dash-side-column">
          <section className="dash-panel">
            <div className="dash-panel-header narrow">
              <div>
                <div className="dash-section-kicker">UPCOMING</div>
                <h2>Deadlines</h2>
              </div>
            </div>

            <div className="dash-list">
              {problems.length ? (
                problems.map((problem) => (
                  <div key={problem._id || problem.id} className="dash-list-item">
                    <div className="dash-list-icon">
                      <Trophy size={15} />
                    </div>
                    <div>
                      <strong>{problem.title}</strong>
                      <span>{problem.deadline ? new Date(problem.deadline).toLocaleDateString() : "No deadline"}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="dash-list-item">
                  <div className="dash-list-icon">
                    <Trophy size={15} />
                  </div>
                  <div>
                    <strong>No active deadlines</strong>
                    <span>New tasks will appear here.</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="dash-panel">
            <div className="dash-panel-header narrow">
              <div>
                <div className="dash-section-kicker">IN FOCUS</div>
                <h2>Recent activity</h2>
              </div>
            </div>

            <div className="dash-list">
              {problems.length ? (
                problems.map((problem) => (
                  <div key={problem._id || problem.id} className="dash-list-item">
                    <div className="dash-list-icon success">
                      <Upload size={15} />
                    </div>
                    <div>
                      <strong>{problem.status === "active" ? "Problem published" : "Problem closed"}</strong>
                      <span>{problem.subject || "General subject"}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="dash-list-item">
                  <div className="dash-list-icon success">
                    <Upload size={15} />
                  </div>
                  <div>
                    <strong>No recent activity</strong>
                    <span>Your learning updates will appear here.</span>
                  </div>
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default Dashboard;
