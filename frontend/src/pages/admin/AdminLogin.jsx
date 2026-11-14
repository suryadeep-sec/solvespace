import { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
import { apiRequest, getStoredToken, getStoredUserRole, setStoredToken, setStoredUserRole } from "../../lib/api";
import "./Admin.css";

export default function AdminLogin() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  if (getStoredToken() && getStoredUserRole() === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
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
      const response = await apiRequest("/api/admin/login", {
        method: "POST",
        body: form,
      });

      const token = response?.data?.token;
      const admin = response?.data?.admin;

      if (!token || !admin) {
        throw new Error("Admin authentication failed.");
      }

      setStoredToken(token);
      setStoredUserRole("admin");
      navigate("/admin/dashboard");
    } catch (submitError) {
      setError(submitError.message || "Unable to sign in as admin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-login-shell">
      <motion.section
        className="admin-login-card"
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="admin-login-brand">
          <span className="admin-brand-mark"><ShieldCheck size={19} /></span>
          <span><strong>SolveSpace</strong><small>ADMIN ACCESS</small></span>
        </div>

        <div className="admin-login-heading">
          <span className="admin-section-kicker">SECURE WORKSPACE</span>
          <h1>Welcome back<span>.</span></h1>
          <p>Sign in with your administrator account to continue.</p>
        </div>

        <form className="admin-auth-form" onSubmit={handleSubmit}>
          <div className="admin-field">
            <label htmlFor="admin-email">Email</label>
            <input
              id="admin-email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@organization.com"
              required
              autoComplete="username"
            />
          </div>

          <div className="admin-field">
            <label htmlFor="admin-password">Password</label>
            <div className="admin-password-field">
              <LockKeyhole size={16} aria-hidden="true" />
              <input
                id="admin-password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="admin-password-toggle"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((visible) => !visible)}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {error ? <div className="admin-error">{error}</div> : null}

          <button type="submit" className="admin-button admin-login-submit" disabled={loading}>
            <span>{loading ? "Authenticating..." : "Continue to console"}</span>
            {!loading && <ArrowRight size={17} />}
          </button>
        </form>

        <div className="admin-login-footer">
          <ShieldCheck size={14} />
          <span>Administrator access is verified securely.</span>
        </div>
      </motion.section>
    </main>
  );
}
