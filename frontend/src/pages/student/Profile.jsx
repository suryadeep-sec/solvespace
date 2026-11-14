import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api";

export default function Profile() {
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiRequest("/api/profile/me");
        const user = response?.data?.user || {};
        setProfile({ name: user.name || "", email: user.email || "" });
      } catch (loadError) {
        setError(loadError.message || "Unable to load your profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await apiRequest("/api/profile/update", {
        method: "PUT",
        body: { name: profile.name },
      });

      const user = response?.data?.user || profile;
      setProfile({ name: user.name || profile.name, email: user.email || profile.email });
      setSuccess("Profile updated successfully.");
    } catch (submitError) {
      setError(submitError.message || "Unable to update your profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "28px", color: "var(--ss-text-secondary)" }}>Loading profile...</div>;
  }

  return (
    <div style={{ padding: "28px" }}>
      <div style={{ marginBottom: "22px" }}>
        <div style={{ color: "var(--ss-primary)", fontSize: "11px", fontWeight: 800, letterSpacing: "1.4px", textTransform: "uppercase" }}>
          Account
        </div>
        <h1 style={{ marginTop: "8px", fontSize: "2rem", fontFamily: "var(--ss-font-display)" }}>My profile</h1>
      </div>

      <form onSubmit={handleSubmit} style={{ background: "var(--ss-surface)", border: "1px solid var(--ss-border)", borderRadius: "20px", padding: "28px", display: "grid", gap: "18px", maxWidth: "620px" }}>
        <div style={{ display: "grid", gap: "8px" }}>
          <label htmlFor="name" style={{ color: "var(--ss-text-secondary)", fontSize: "12px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>Full name</label>
          <input id="name" value={profile.name} onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))} style={{ width: "100%", borderRadius: "12px", border: "1px solid var(--ss-border)", background: "rgba(15,23,42,0.5)", color: "var(--ss-text-primary)", padding: "13px 14px" }} />
        </div>

        <div style={{ display: "grid", gap: "8px" }}>
          <label htmlFor="email" style={{ color: "var(--ss-text-secondary)", fontSize: "12px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>Email address</label>
          <input id="email" value={profile.email} disabled style={{ width: "100%", borderRadius: "12px", border: "1px solid var(--ss-border)", background: "rgba(15,23,42,0.35)", color: "var(--ss-text-secondary)", padding: "13px 14px", cursor: "not-allowed" }} />
        </div>

        {error ? <div style={{ color: "#ff9fa8", background: "rgba(255, 100, 100, 0.12)", border: "1px solid rgba(255,100,100,0.18)", borderRadius: "10px", padding: "10px 12px" }}>{error}</div> : null}
        {success ? <div style={{ color: "#9ae6b4", background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.18)", borderRadius: "10px", padding: "10px 12px" }}>{success}</div> : null}

        <button type="submit" disabled={saving} style={{ justifySelf: "start", background: "linear-gradient(135deg, var(--ss-primary), #4ec2ff)", color: "#fff", border: 0, borderRadius: "12px", padding: "12px 18px", fontWeight: 700 }}>
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}
