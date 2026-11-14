import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  Mail,
  PencilLine,
  Search,
  Trash2,
  UserRoundCheck,
  UserRoundX,
  Users,
  X,
} from "lucide-react";
import { apiRequest } from "../../lib/api";
import "./Admin.css";

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);
};

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [busyStudentId, setBusyStudentId] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [drawerMode, setDrawerMode] = useState("view");
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerError, setDrawerError] = useState("");
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({ name: "", email: "" });

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await apiRequest("/api/admin/students");
      if (!Array.isArray(response?.data)) {
        throw new Error("The students endpoint returned an unexpected response.");
      }
      setStudents(response.data);
      setError("");
    } catch (loadError) {
      setError(loadError.message || "Unable to load students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const visibleStudents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return students.filter((student) => {
      const matchesStatus = statusFilter === "all" || (student.accountStatus || "active") === statusFilter;
      const matchesQuery = !normalizedQuery || [student.name, student.email]
        .some((value) => String(value || "").toLowerCase().includes(normalizedQuery));
      return matchesStatus && matchesQuery;
    });
  }, [students, query, statusFilter]);

  const openStudent = async (student, mode) => {
    setSelectedStudent(student);
    setDrawerMode(mode);
    setDrawerLoading(true);
    setDrawerError("");
    setDraft({ name: student.name || "", email: student.email || "" });

    try {
      const response = await apiRequest(`/api/admin/students/${student._id}`);
      if (!response?.data) {
        throw new Error("The student details endpoint returned an unexpected response.");
      }
      setSelectedStudent(response.data);
      setDraft({ name: response.data.name || "", email: response.data.email || "" });
    } catch (loadError) {
      setDrawerError(loadError.message || "Unable to load student details.");
    } finally {
      setDrawerLoading(false);
    }
  };

  const closeDrawer = () => {
    setSelectedStudent(null);
    setDrawerError("");
    setDrawerMode("view");
  };

  const handleSaveStudent = async (event) => {
    event.preventDefault();
    if (!selectedStudent) return;
    setSaving(true);
    setDrawerError("");

    try {
      const response = await apiRequest(`/api/admin/students/${selectedStudent._id}`, {
        method: "PUT",
        body: draft,
      });
      setSelectedStudent(response?.data || { ...selectedStudent, ...draft });
      setMessage(response?.message || "Student details updated.");
      setDrawerMode("view");
      await loadStudents();
    } catch (saveError) {
      setDrawerError(saveError.message || "Unable to update this student.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusToggle = async (student) => {
    const nextStatus = (student.accountStatus || "active") === "active" ? "blocked" : "active";
    setBusyStudentId(student._id);
    setError("");
    setMessage("");

    try {
      const response = await apiRequest(`/api/admin/students/${student._id}/status`, {
        method: "PATCH",
        body: { status: nextStatus },
      });
      setMessage(response?.message || `Student ${nextStatus} successfully.`);
      await loadStudents();
    } catch (statusError) {
      setError(statusError.message || "Unable to update student status.");
    } finally {
      setBusyStudentId("");
    }
  };

  const handleDelete = async (student) => {
    if (!window.confirm(`Delete ${student.name || "this student"}? This action cannot be undone.`)) return;
    setBusyStudentId(student._id);
    setError("");
    setMessage("");

    try {
      const response = await apiRequest(`/api/admin/students/${student._id}`, { method: "DELETE" });
      setMessage(response?.message || "Student deleted successfully.");
      if (selectedStudent?._id === student._id) closeDrawer();
      await loadStudents();
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete student.");
    } finally {
      setBusyStudentId("");
    }
  };

  const renderActions = (student) => (
    <div className="admin-actions">
      <button type="button" className="admin-icon-button" aria-label={`View ${student.name || "student"}`} title="View details" onClick={() => openStudent(student, "view")}>
        <Eye size={16} />
      </button>
      <button type="button" className="admin-icon-button" aria-label={`Edit ${student.name || "student"}`} title="Edit student" onClick={() => openStudent(student, "edit")}>
        <PencilLine size={16} />
      </button>
      <button
        type="button"
        className="admin-icon-button"
        aria-label={`${(student.accountStatus || "active") === "active" ? "Block" : "Unblock"} ${student.name || "student"}`}
        title={(student.accountStatus || "active") === "active" ? "Block account" : "Restore access"}
        disabled={busyStudentId === student._id}
        onClick={() => handleStatusToggle(student)}
      >
        {(student.accountStatus || "active") === "active" ? <UserRoundX size={16} /> : <UserRoundCheck size={16} />}
      </button>
      <button
        type="button"
        className="admin-icon-button danger"
        aria-label={`Delete ${student.name || "student"}`}
        title="Delete student"
        disabled={busyStudentId === student._id}
        onClick={() => handleDelete(student)}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );

  return (
    <div className="admin-page">
      <div className="admin-shell">
        <header className="admin-page-header">
          <div>
            <div className="admin-eyebrow"><span className="admin-eyebrow-mark" /> PEOPLE & ACCESS</div>
            <h1>Students</h1>
            <p>Review learner accounts and manage their platform access.</p>
          </div>
          <div className="admin-page-count">
            <span className="admin-count-value">{loading ? "—" : students.length.toLocaleString()}</span>
            <span>registered students</span>
          </div>
        </header>

        {error ? (
          <div className="admin-error admin-feedback" role="alert">
            <div><strong>Student records could not be loaded.</strong><span>{error}</span></div>
            <button type="button" className="admin-secondary-button" onClick={loadStudents}>Try again</button>
          </div>
        ) : null}
        {message ? <div className="admin-success" role="status">{message}</div> : null}

        <section className="admin-card admin-data-card">
          <div className="admin-card-header">
            <div>
              <span className="admin-section-kicker">DIRECTORY</span>
              <h2>Student accounts</h2>
            </div>
            <span className="admin-table-total">{visibleStudents.length} shown</span>
          </div>
          <div className="admin-filter-bar">
            <label className="admin-search">
              <Search size={17} />
              <input
                type="search"
                aria-label="Search students"
                placeholder="Search by name or email"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <label className="admin-filter-select">
              <span className="admin-sr-only">Filter by account status</span>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
              </select>
            </label>
          </div>

          {loading ? (
            <div className="admin-loading-list" aria-label="Loading students">
              <span /><span /><span /><span />
            </div>
          ) : !error && visibleStudents.length === 0 ? (
            <div className="admin-empty-state">
              <div className="admin-empty-icon"><Users size={20} /></div>
              <h3>{students.length ? "No matching students" : "No students yet"}</h3>
              <p>{students.length ? "Try another search or status filter." : "Student accounts will appear here when they register."}</p>
              {query || statusFilter !== "all" ? (
                <button type="button" className="admin-link-button" onClick={() => { setQuery(""); setStatusFilter("all"); }}>Clear filters</button>
              ) : null}
            </div>
          ) : !error ? (
            <>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr><th>Student</th><th>Account status</th><th>Registered</th><th><span className="admin-sr-only">Actions</span></th></tr>
                  </thead>
                  <tbody>
                    {visibleStudents.map((student) => (
                      <tr key={student._id}>
                        <td>
                          <div className="admin-person-cell">
                            <span className="admin-person-avatar">{(student.name || student.email || "S").slice(0, 1).toUpperCase()}</span>
                            <span><strong>{student.name || "Unnamed student"}</strong><small><Mail size={12} />{student.email || "No email available"}</small></span>
                          </div>
                        </td>
                        <td><span className={`admin-status ${(student.accountStatus || "active")}`}>{student.accountStatus || "active"}</span></td>
                        <td className="admin-date-cell">{formatDate(student.createdAt)}</td>
                        <td>{renderActions(student)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="admin-mobile-list">
                {visibleStudents.map((student) => (
                  <article className="admin-mobile-record" key={student._id}>
                    <div className="admin-person-cell">
                      <span className="admin-person-avatar">{(student.name || student.email || "S").slice(0, 1).toUpperCase()}</span>
                      <span><strong>{student.name || "Unnamed student"}</strong><small><Mail size={12} />{student.email || "No email available"}</small></span>
                    </div>
                    <div className="admin-mobile-record-meta">
                      <span className={`admin-status ${(student.accountStatus || "active")}`}>{student.accountStatus || "active"}</span>
                      <span>Joined {formatDate(student.createdAt)}</span>
                    </div>
                    {renderActions(student)}
                  </article>
                ))}
              </div>
            </>
          ) : null}
        </section>
      </div>

      {selectedStudent ? (
        <div className="admin-drawer-layer">
          <button type="button" className="admin-drawer-scrim" aria-label="Close student details" onClick={closeDrawer} />
          <aside className="admin-drawer" role="dialog" aria-modal="true" aria-labelledby="student-drawer-title">
            <div className="admin-drawer-header">
              <div>
                <span className="admin-section-kicker">{drawerMode === "edit" ? "EDIT ACCOUNT" : "ACCOUNT DETAILS"}</span>
                <h2 id="student-drawer-title">{drawerMode === "edit" ? "Update student" : "Student profile"}</h2>
              </div>
              <button type="button" className="admin-icon-button" aria-label="Close" onClick={closeDrawer}><X size={17} /></button>
            </div>
            {drawerLoading ? <div className="admin-loading-list"><span /><span /></div> : drawerError ? (
              <div className="admin-error" role="alert">{drawerError}</div>
            ) : drawerMode === "edit" ? (
              <form className="admin-drawer-content admin-auth-form" onSubmit={handleSaveStudent}>
                <div className="admin-field">
                  <label htmlFor="student-name">Name</label>
                  <input id="student-name" value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} required minLength={2} maxLength={50} />
                </div>
                <div className="admin-field">
                  <label htmlFor="student-email">Email</label>
                  <input id="student-email" type="email" value={draft.email} onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))} required />
                </div>
                <div className="admin-drawer-actions">
                  <button type="submit" className="admin-button" disabled={saving}>{saving ? "Saving..." : "Save changes"}</button>
                  <button type="button" className="admin-secondary-button" onClick={() => setDrawerMode("view")}>Cancel</button>
                </div>
              </form>
            ) : (
              <div className="admin-drawer-content">
                <div className="admin-profile-block">
                  <span className="admin-person-avatar large">{(selectedStudent.name || selectedStudent.email || "S").slice(0, 1).toUpperCase()}</span>
                  <div><h3>{selectedStudent.name || "Unnamed student"}</h3><span>{selectedStudent.email || "No email available"}</span></div>
                </div>
                <dl className="admin-detail-list">
                  <div><dt>Account status</dt><dd><span className={`admin-status ${selectedStudent.accountStatus || "active"}`}>{selectedStudent.accountStatus || "active"}</span></dd></div>
                  <div><dt>Registered</dt><dd>{formatDate(selectedStudent.createdAt)}</dd></div>
                  {selectedStudent.updatedAt ? <div><dt>Last updated</dt><dd>{formatDate(selectedStudent.updatedAt)}</dd></div> : null}
                  {selectedStudent.role ? <div><dt>Role</dt><dd>{selectedStudent.role}</dd></div> : null}
                </dl>
                <div className="admin-drawer-actions">
                  <button type="button" className="admin-button" onClick={() => setDrawerMode("edit")}><PencilLine size={15} /> Edit account</button>
                  <button type="button" className="admin-secondary-button" onClick={() => handleStatusToggle(selectedStudent)}>
                    {selectedStudent.accountStatus === "blocked" ? <UserRoundCheck size={15} /> : <UserRoundX size={15} />}
                    {selectedStudent.accountStatus === "blocked" ? "Restore access" : "Block account"}
                  </button>
                  <button type="button" className="admin-danger-button" onClick={() => handleDelete(selectedStudent)}><Trash2 size={15} /> Delete account</button>
                </div>
              </div>
            )}
          </aside>
        </div>
      ) : null}
    </div>
  );
}
