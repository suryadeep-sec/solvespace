import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileText,
  Lightbulb,
  ListChecks,
  Sparkles,
  Target,
} from "lucide-react";
import { motion } from "motion/react";

import { apiRequest } from "../../lib/api";
import "./ProblemDetails.css";

function DetailSection({ icon: Icon, title, items }) {
  return (
    <section className="detail-section">
      <div className="detail-section-heading">
        <div className="detail-section-icon">
          <Icon size={18} />
        </div>
        <h2>{title}</h2>
      </div>

      <ul className="detail-list">
        {items.map((item, index) => (
          <li key={index}>
            <CheckCircle2 size={16} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function ProblemDetails() {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProblem = async () => {
      try {
        setLoading(true);
        const response = await apiRequest(`/api/problems/${problemId}`);
        setProblem(response?.data?.problem || null);
      } catch (loadError) {
        setError(loadError.message || "Problem could not be loaded.");
      } finally {
        setLoading(false);
      }
    };

    if (problemId) {
      loadProblem();
    }
  }, [problemId]);

  if (loading) {
    return (
      <div className="problem-not-found" style={{ minHeight: "50vh" }}>
        <div className="problem-not-found-icon">
          <FileText size={27} />
        </div>
        <h1>Loading problem</h1>
        <p>Fetching the latest details for this assignment.</p>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="problem-not-found">
        <div className="problem-not-found-icon">
          <FileText size={27} />
        </div>
        <h1>Problem not found</h1>
        <p>{error || "This problem does not exist or may no longer be available."}</p>
        <button onClick={() => navigate("/student/problems")}>
          <ArrowLeft size={16} />
          Back to Problems
        </button>
      </div>
    );
  }

  const iconColor = problem.status === "active" ? "violet" : "cyan";
  const detailSections = [
    {
      icon: Target,
      title: "Learning Objectives",
      items: [
        `Understand and solve the ${problem.subject || "subject"} challenge effectively.`,
        "Break the problem into smaller technical tasks before implementation.",
        "Apply the correct project patterns and validation for a production-ready solution.",
      ],
    },
    {
      icon: ListChecks,
      title: "Problem Requirements",
      items: [
        problem.instructions || "Review the problem statement and complete the required work with attention to quality.",
        "Ensure the final solution is complete, structured, and easy to understand.",
        "Validate your work against the task requirements before submission.",
      ],
    },
    {
      icon: FileText,
      title: "Expected Deliverables",
      items: [
        `A complete solution for the ${problem.title} task.`,
        "Clear implementation evidence and final output in the expected format.",
        "A review-ready submission with accurate details and reasoning.",
      ],
    },
  ];

  return (
    <motion.div
      className="problem-details-page"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <button className="detail-back-button" onClick={() => navigate("/student/problems")}>
        <ArrowLeft size={16} />
        Back to Problems
      </button>

      <div className="detail-layout">
        <main className="detail-main">
          <div className="detail-hero">
            <div className="detail-hero-top">
              <div className={`detail-hero-icon ${iconColor}`}>
                <BookOpen size={25} />
              </div>

              <span className={`problem-difficulty difficulty-${problem.status === "active" ? "beginner" : "intermediate"}`}>
                {problem.status === "active" ? "Active" : "Closed"}
              </span>
            </div>

            <span className="detail-subject">{problem.subject}</span>

            <h1>{problem.title}</h1>

            <p className="detail-description">{problem.description}</p>

            <div className="detail-tags">
              <span>{problem.subject}</span>
              <span>{problem.status === "active" ? "Open" : "Closed"}</span>
            </div>
          </div>

          {detailSections.map((section) => (
            <DetailSection key={section.title} icon={section.icon} title={section.title} items={section.items} />
          ))}

          <div className="detail-tip">
            <div className="detail-tip-icon">
              <Lightbulb size={19} />
            </div>
            <div>
              <strong>Before you begin</strong>
              <p>
                Read all requirements carefully and plan your solution before starting. Make sure your final work includes the expected requirements and quality standards.
              </p>
            </div>
          </div>
        </main>

        <aside className="detail-sidebar">
          <div className="detail-overview-card">
            <div className="detail-overview-heading">
              <Sparkles size={17} />
              Problem Overview
            </div>

            <div className="detail-overview-stat">
              <div className="detail-overview-stat-icon">
                <Clock3 size={17} />
              </div>
              <div>
                <span>Deadline</span>
                <strong>{problem.deadline ? new Date(problem.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "No deadline"}</strong>
              </div>
            </div>

            <div className="detail-overview-stat">
              <div className="detail-overview-stat-icon">
                <Sparkles size={17} />
              </div>
              <div>
                <span>Status</span>
                <strong>{problem.status === "active" ? "Open" : "Closed"}</strong>
              </div>
            </div>

            <div className="detail-overview-stat">
              <div className="detail-overview-stat-icon">
                <BookOpen size={17} />
              </div>
              <div>
                <span>Subject</span>
                <strong>{problem.subject}</strong>
              </div>
            </div>

            <div className="detail-overview-divider" />

            <button className="detail-start-button" onClick={() => navigate(`/student/problems/${problemId}/workspace`)}>
              Start Working
              <ArrowUpRight size={17} />
            </button>

            <p className="detail-sidebar-note">
              Your solution should follow the task brief and be prepared for review once submitted.
            </p>
          </div>

          <div className="detail-help-card">
            <div className="detail-help-icon">
              <Lightbulb size={19} />
            </div>
            <h3>Need help?</h3>
            <p>
              Break the problem into smaller tasks and work through each requirement step by step.
            </p>
          </div>
        </aside>
      </div>
    </motion.div>
  );
}
