import { useEffect, useState } from "react";
import { LogOut, ShieldCheck } from "lucide-react";
import { apiRequest, clearStoredToken, getStoredToken } from "../../lib/api";
import { useNavigate } from "react-router";

export default function Settings() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ name: "", email: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiRequest("/api/profile/me");
        const user = response?.data?.user || {};
        setProfile({ name: user.name || "", email: user.email || "" });
      } catch {
        setProfile({ name: "Student", email: "" });
      }
    };

    if (getStoredToken()) {
      fetchProfile();
    }
  }, []);

  const handleSignOut = () => {
    clearStoredToken();
    navigate("/login");
  };

  return (
    <div style={{ padding: "28px" }}>
      <div style={{ marginBottom: "22px" }}>
        <div style={{ color: "var(--ss-primary)", fontSize: "11px", fontWeight: 800, letterSpacing: "1.4px", textTransform: "uppercase" }}>
          Preferences
        </div>
        <h1 style={{ marginTop: "8px", fontSize: "2rem", fontFamily: "var(--ss-font-display)" }}>Settings</h1>
      </div>

      <div style={{ display: "grid", gap: "18px", maxWidth: "760px" }}>
        <section style={{ background: "var(--ss-surface)", border: "1px solid var(--ss-border)", borderRadius: "18px", padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "12px", display: "grid", placeItems: "center", background: "rgba(122, 94, 255, 0.18)", color: "var(--ss-primary)" }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.15rem" }}>Account security</h2>
              <p style={{ marginTop: "4px" }}>Your active session is protected with a secure token.</p>
            </div>
          </div>

          <div style={{ marginTop: "20px", display: "grid", gap: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", borderBottom: "1px solid var(--ss-border)", paddingBottom: "10px" }}>
              <span style={{ color: "var(--ss-text-secondary)" }}>Name</span>
              <strong>{profile.name || "Student"}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
              <span style={{ color: "var(--ss-text-secondary)" }}>Email</span>
              <strong>{profile.email || "Not available"}</strong>
            </div>
          </div>
        </section>

        <section style={{ background: "var(--ss-surface)", border: "1px solid var(--ss-border)", borderRadius: "18px", padding: "24px" }}>
          <h2 style={{ fontSize: "1.1rem" }}>Session actions</h2>
          <button type="button" onClick={handleSignOut} style={{ marginTop: "18px", display: "inline-flex", alignItems: "center", gap: "10px", background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5", borderRadius: "12px", padding: "11px 16px" }}>
            <LogOut size={16} /> Sign out
          </button>
        </section>
      </div>
    </div>
  );
}
