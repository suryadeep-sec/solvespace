import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";

import { apiRequest } from "../../lib/api";
import "./Problems.css";

const subjectOptions = ["All Subjects"];
const statusOptions = ["All Status", "active", "closed"];

const formatDeadline = (value) => {
  if (!value) return "No deadline";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No deadline";

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

function ProblemCard({ problem, index }) {
  return (
    <motion.article
      className="problem-card"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      whileHover={{ y: -5 }}
    >
      <div className="problem-card-top">
        <div className="problem-icon violet">
          <Sparkles size={21} />
        </div>

        <span className={`problem-difficulty ${problem.status === "active" ? "difficulty-beginner" : "difficulty-intermediate"}`}>
          {problem.status === "active" ? "Active" : "Closed"}
        </span>
      </div>

      <div className="problem-card-content">
        <span className="problem-subject">{problem.subject}</span>

        <h3>{problem.title}</h3>

        <p>{problem.description}</p>
      </div>

      <div className="problem-tags">
        <span>{problem.subject}</span>
        <span>{problem.status === "active" ? "Open" : "Archived"}</span>
      </div>

      <div className="problem-card-meta">
        <span>
          <Clock3 size={14} />
          {formatDeadline(problem.deadline)}
        </span>
      </div>

      <div className="problem-card-footer">
        <span className={`problem-status status-${problem.status === "active" ? "active" : "closed"}`}>
          {problem.status === "active" ? <CheckCircle2 size={13} /> : <Clock3 size={13} />}
          {problem.status === "active" ? "Open" : "Closed"}
        </span>

        <button
          type="button"
          className="problem-open-button"
          onClick={() => {
            window.location.href = `/student/problems/${problem._id}`;
          }}
          aria-label={`Open ${problem.title}`}
        >
          Open Problem
          <ArrowUpRight size={16} />
        </button>
      </div>
    </motion.article>
  );
}

export default function Problems() {
  const [problems, setProblems] = useState([]);
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("All Subjects");
  const [status, setStatus] = useState("All Status");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProblems = async () => {
      try {
        setLoading(true);
        const response = await apiRequest("/api/problems");
        const problemList = response?.data?.problems || [];
        setProblems(problemList);
      } catch (loadError) {
        setError(loadError.message || "Unable to load the problem library right now.");
      } finally {
        setLoading(false);
      }
    };

    loadProblems();
  }, []);

  const subjectList = useMemo(() => {
    const uniqueSubjects = [...new Set(problems.map((problem) => problem.subject).filter(Boolean))];
    return [...new Set(["All Subjects", ...uniqueSubjects])];
  }, [problems]);

  const filteredProblems = useMemo(() => {
    return problems.filter((problem) => {
      const searchTarget = `${problem.title || ""} ${problem.subject || ""} ${problem.description || ""}`.toLowerCase();
      const searchMatch = searchTarget.includes(search.toLowerCase());
      const subjectMatch = subject === "All Subjects" || problem.subject === subject;
      const statusMatch = status === "All Status" || problem.status === status;

      return searchMatch && subjectMatch && statusMatch;
    });
  }, [problems, search, subject, status]);

  const clearFilters = () => {
    setSearch("");
    setSubject("All Subjects");
    setStatus("All Status");
  };

  const hasActiveFilters = search !== "" || subject !== "All Subjects" || status !== "All Status";
  const activeCount = problems.filter((problem) => problem.status === "active").length;
  const closedCount = problems.filter((problem) => problem.status === "closed").length;

  return (
    <div className="problems-page">
      <div className="problems-heading">
        <div>
          <div className="problems-eyebrow">
            <Sparkles size={14} />
            LEARNING WORKSPACE
          </div>

          <h1>Explore Problems</h1>

          <p>
            Discover challenges, strengthen your skills, and track your learning progress.
          </p>
        </div>

        <div className="problems-summary">
          <div>
            <strong>{activeCount}</strong>
            <span>Active</span>
          </div>
          <div>
            <strong>{closedCount}</strong>
            <span>Closed</span>
          </div>
        </div>
      </div>

      <div className="problems-toolbar">
        <div className="problems-search">
          <Search size={17} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title, topic, or description"
            aria-label="Search problems"
          />
        </div>

        <button type="button" className="problems-filter-toggle" onClick={() => setShowFilters((current) => !current)}>
          <SlidersHorizontal size={16} />
          Filters
          <ChevronDown size={15} />
        </button>
      </div>

      <AnimatePresence>
        {showFilters ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="problems-filter-panel"
          >
            <div className="filter-group">
              <label>Subject</label>
              <select value={subject} onChange={(event) => setSubject(event.target.value)}>
                {subjectList.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Status</label>
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                {statusOptions.map((option) => (
                  <option key={option} value={option}>{option === "All Status" ? option : option === "active" ? "Active" : "Closed"}</option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <button type="button" className="clear-filters" onClick={clearFilters}>
                <X size={14} />
                Clear
              </button>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {error ? (
        <div className="problems-empty" style={{ marginTop: "18px" }}>
          <p>{error}</p>
        </div>
      ) : null}

      {loading ? (
        <div className="problems-grid" style={{ opacity: 0.7 }}>
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={`skeleton-${index}`} className="problem-card skeleton-card" />
          ))}
        </div>
      ) : (
        <div className="problems-grid">
          {filteredProblems.length ? (
            filteredProblems.map((problem, index) => <ProblemCard key={problem._id} problem={problem} index={index} />)
          ) : (
            <div className="problems-empty">
              <h3>No problems found</h3>
              <p>Try changing your search or clearing your active filters.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
