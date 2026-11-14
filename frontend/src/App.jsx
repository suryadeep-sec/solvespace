import Problems from "./pages/student/Problems";
import ProblemDetails from "./pages/student/ProblemDetails";
import ProblemWorkspace from "./pages/student/ProblemWorkspace";
import Submissions from "./pages/student/Submissions";
import SubmissionDetails from "./pages/student/SubmissionDetails";
import Profile from "./pages/student/Profile";
import Settings from "./pages/student/Settings";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminProblems from "./pages/admin/AdminProblems";
import AdminSubmissions from "./pages/admin/AdminSubmissions";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router";

import StudentLayout from "./components/layout/StudentLayout";
import Dashboard from "./pages/student/Dashboard";
import { getStoredToken, getStoredUserRole } from "./lib/api";

function DevelopmentPage({ title, category = "STUDENT WORKSPACE" }) {
  const navigate = useNavigate();

  return (
    <main
      style={{
        minHeight: "65vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "550px",
          padding: "32px",
          border: "1px solid var(--ss-border)",
          borderRadius: "18px",
          background: "var(--ss-surface)",
        }}
      >
        <span
          style={{
            color: "var(--ss-primary)",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "1.5px",
          }}
        >
          {category}
        </span>

        <h1
          style={{
            marginTop: "16px",
            fontFamily: "var(--ss-font-display)",
            fontSize: "28px",
          }}
        >
          {title}
        </h1>

        <p style={{ marginTop: "10px", lineHeight: 1.7 }}>
          This module is under development. It will be implemented
          using the SolveSpace design system.
        </p>

        <button
          type="button"
          onClick={() => navigate("/student/dashboard")}
          style={{
            marginTop: "24px",
            padding: "11px 17px",
            background: "var(--ss-primary)",
            color: "#ffffff",
            border: 0,
            borderRadius: "9px",
            fontWeight: 600,
          }}
        >
          Back to Dashboard
        </button>
      </section>
    </main>
  );
}

function RequireAuth({ children, role = "student", redirectTo = "/login" }) {
  if (!getStoredToken()) {
    return <Navigate to={redirectTo} replace />;
  }

  if (role && getStoredUserRole() !== role) {
    return <Navigate to={role === "admin" ? "/admin/login" : "/student/dashboard"} replace />;
  }

  return children;
}

function AppRoutes() {
  const token = getStoredToken();
  const userRole = getStoredUserRole();

  const dashboardFallback = token && userRole === "admin" ? "/admin/dashboard" : "/student/dashboard";

  return (
    <Routes>
      <Route path="/" element={<Navigate to={token ? dashboardFallback : "/login"} replace />} />

      <Route path="/login" element={token ? <Navigate to={userRole === "admin" ? "/admin/dashboard" : "/student/dashboard"} replace /> : <Login />} />
      <Route path="/register" element={token ? <Navigate to={userRole === "admin" ? "/admin/dashboard" : "/student/dashboard"} replace /> : <Register />} />
      <Route path="/admin/login" element={token ? <Navigate to={userRole === "admin" ? "/admin/dashboard" : "/student/dashboard"} replace /> : <AdminLogin />} />

      <Route
        path="/student"
        element={
          <RequireAuth role="student">
            <StudentLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="problems" element={<Problems />} />
        <Route path="problems/:problemId" element={<ProblemDetails />} />
        <Route path="problems/:problemId/workspace" element={<ProblemWorkspace />} />
        <Route path="submissions" element={<Submissions />} />
        <Route path="submissions/:submissionId" element={<SubmissionDetails />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route
        path="/admin"
        element={
          <RequireAuth role="admin" redirectTo="/admin/login">
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="problems" element={<AdminProblems />} />
        <Route path="submissions" element={<AdminSubmissions />} />
      </Route>

      <Route path="*" element={<Navigate to={token ? dashboardFallback : "/login"} replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
