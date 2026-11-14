import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { motion } from "motion/react";
import { apiRequest, getStoredToken, setStoredToken } from "../../lib/api";

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: "24px",
    background: "radial-gradient(circle at top, rgba(32, 178, 170, 0.15), transparent 35%), var(--ss-bg-primary)",
    color: "var(--ss-text-primary)",
  },
  card: {
    width: "100%",
    maxWidth: "460px",
    background: "var(--ss-surface)",
    border: "1px solid var(--ss-border)",
    borderRadius: "24px",
    padding: "32px",
    boxShadow: "0 24px 70px rgba(15, 23, 42, 0.35)",
  },
  eyebrow: {
    color: "var(--ss-primary)",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "1.5px",
    textTransform: "uppercase",
  },
  title: {
    marginTop: "16px",
    fontSize: "2rem",
    fontWeight: 800,
    fontFamily: "var(--ss-font-display)",
  },
  subtext: {
    marginTop: "8px",
    color: "var(--ss-text-secondary)",
    lineHeight: 1.7,
  },
  form: { display: "grid", gap: "16px", marginTop: "24px" },
  field: { display: "grid", gap: "8px" },
  label: { fontSize: "12px", fontWeight: 700, color: "var(--ss-text-secondary)", letterSpacing: "0.06em", textTransform: "uppercase" },
  input: {
    width: "100%",
    borderRadius: "12px",
    border: "1px solid var(--ss-border)",
    background: "rgba(15, 23, 42, 0.6)",
    color: "var(--ss-text-primary)",
    padding: "13px 14px",
    fontSize: "15px",
  },
  button: {
    marginTop: "8px",
    width: "100%",
    borderRadius: "12px",
    border: 0,
    background: "linear-gradient(135deg, var(--ss-primary), #4ec2ff)",
    color: "#fff",
    padding: "13px 16px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 14px 28px rgba(118, 88, 245, 0.26)",
  },
  footer: { marginTop: "18px", color: "var(--ss-text-secondary)", fontSize: "14px", textAlign: "center" },
  link: { color: "var(--ss-primary)", fontWeight: 700 },
  error: { marginTop: "12px", color: "#ff9fa8", background: "rgba(255, 100, 100, 0.12)", border: "1px solid rgba(255, 100, 100, 0.18)", borderRadius: "10px", padding: "10px 12px", fontSize: "13px" }
};

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (getStoredToken()) {
    return <Navigate to="/student/dashboard" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await apiRequest("/api/users/register", {
        method: "POST",
        body: form,
      });

      const token = response?.data?.token;
      if (token) {
        setStoredToken(token);
        navigate("/student/dashboard");
        return;
      }

      navigate("/login");
    } catch (submitError) {
      setError(submitError.message || "Unable to create your account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={styles.page}>
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        style={styles.card}
      >
        <span style={styles.eyebrow}>SolveSpace</span>
        <h1 style={styles.title}>Create your account</h1>
        <p style={styles.subtext}>Build your student profile and begin solving real-world challenges.</p>

        <form style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label htmlFor="name" style={styles.label}>Full name</label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your full name"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="email" style={styles.label}>Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              placeholder="student@example.com"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="password" style={styles.label}>Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              placeholder="Create a secure password"
              style={styles.input}
              minLength={8}
              required
            />
          </div>

          {error ? <div style={styles.error}>{error}</div> : null}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account? <Link to="/login" style={styles.link}>Sign in</Link>
        </p>
      </motion.section>
    </main>
  );
}
