import { useEffect, useRef, useState } from "react";
import { NavLink, Navigate, Outlet, useLocation, useNavigate } from "react-router";
import {
  BookOpen,
  ClipboardCheck,
  Command,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { clearStoredToken, clearStoredUserRole, getStoredUserRole } from "../../lib/api";
import "./Admin.css";

const navItems = [
  { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Students", path: "/admin/students", icon: Users },
  { label: "Problems", path: "/admin/problems", icon: BookOpen },
  { label: "Submissions", path: "/admin/submissions", icon: ClipboardCheck },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = getStoredUserRole();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const layoutRef = useRef(null);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.from(".admin-sidebar", {
      x: -14,
      opacity: 0,
      duration: 0.45,
      ease: "power2.out",
    });
    gsap.from(".admin-topbar", {
      y: -8,
      opacity: 0,
      duration: 0.4,
      delay: 0.08,
      ease: "power2.out",
    });
  }, { scope: layoutRef });

  if (userRole !== "admin") {
    return <Navigate to="/admin/login" replace />;
  }

  const handleSignOut = () => {
    clearStoredToken();
    clearStoredUserRole();
    navigate("/admin/login");
  };

  const currentPage = navItems.find(({ path }) => path === location.pathname);

  return (
    <div className={`admin-layout${mobileNavOpen ? " admin-nav-open" : ""}`} ref={layoutRef}>
      <button
        type="button"
        className="admin-nav-scrim"
        aria-label="Close navigation"
        onClick={() => setMobileNavOpen(false)}
        tabIndex={mobileNavOpen ? 0 : -1}
      />

      <aside className="admin-sidebar" aria-label="Admin navigation">
        <div className="admin-brand">
          <div className="admin-brand-mark">
            <Command size={19} />
          </div>
          <div className="admin-brand-copy">
            <strong>SolveSpace</strong>
            <small>OPERATIONS CONSOLE</small>
          </div>
          <span className="admin-workspace-dot" aria-label="Admin workspace" />
        </div>

        <div className="admin-nav-label">Workspace</div>
        <nav className="admin-nav" aria-label="Workspace">
          {navItems.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              end
              to={path}
              className={({ isActive }) => `admin-nav-item ${isActive ? "active" : ""}`}
              onClick={() => setMobileNavOpen(false)}
            >
              <Icon size={17} />
              <span>{label}</span>
              <span className="admin-nav-indicator" />
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-access-card">
            <ShieldCheck size={16} />
            <div>
              <strong>Protected workspace</strong>
              <span>Administrator access</span>
            </div>
          </div>
          <button type="button" className="admin-signout" onClick={handleSignOut}>
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="admin-mobile-menu"
              aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={mobileNavOpen}
              onClick={() => setMobileNavOpen((open) => !open)}
            >
              {mobileNavOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
            <div className="admin-breadcrumb">
              <span>Workspace</span>
              <span className="admin-breadcrumb-separator">/</span>
              <strong>{currentPage?.label || "Admin"}</strong>
            </div>
          </div>

          <div className="admin-topbar-actions">
            <span className="admin-topbar-caption">SOLVESPACE ADMIN</span>
            <div className="admin-topbar-profile" aria-label="Administrator account">
              <div className="admin-top-avatar"><ShieldCheck size={17} /></div>
              <div>
                <strong>Administrator</strong>
                <span>Admin workspace</span>
              </div>
            </div>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
}
