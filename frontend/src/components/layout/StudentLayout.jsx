
import "./StudentLayout.css";

import { useEffect, useMemo, useState } from "react";
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router";
import { clearStoredToken } from "../../lib/api";

import { AnimatePresence, motion } from "motion/react";

import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  FileText,
  UserRound,
  Settings,
  Search,
  Bell,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Sparkles,
  Command,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";

const navigationGroups = [
  {
    title: "WORKSPACE",
    items: [
      {
        label: "Dashboard",
        path: "/student/dashboard",
        icon: LayoutDashboard,
        description: "Your learning overview",
      },
      {
        label: "Explore Problems",
        path: "/student/problems",
        icon: BookOpen,
        description: "Discover learning challenges",
      },
      {
        label: "My Submissions",
        path: "/student/submissions",
        icon: FileText,
        description: "Track your submitted work",
      },
    ],
  },
  {
    title: "ACCOUNT",
    items: [
      {
        label: "My Profile",
        path: "/student/profile",
        icon: UserRound,
        description: "Your student information",
      },
      {
        label: "Settings",
        path: "/student/settings",
        icon: Settings,
        description: "Manage your preferences",
      },
    ],
  },
];

const allNavigationItems = navigationGroups.flatMap(
  (group) => group.items
);

function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setSidebarOpen(false);
    setNotificationsOpen(false);
    setSearchOpen(false);
    setSearchQuery("");
  }, [location.pathname]);

  const currentPage =
    allNavigationItems.find(
      (item) =>
        location.pathname === item.path ||
        location.pathname.startsWith(`${item.path}/`)
    )?.label || "Student Workspace";

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return allNavigationItems.slice(0, 3);
    }

    return allNavigationItems.filter((item) =>
      `${item.label} ${item.description}`
        .toLowerCase()
        .includes(query)
    );
  }, [searchQuery]);

  const openSearchResult = (path) => {
    navigate(path);
    setSearchQuery("");
    setSearchOpen(false);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Escape") {
      setSearchOpen(false);
      setSearchQuery("");
    }

    if (event.key === "Enter" && searchResults.length > 0) {
      openSearchResult(searchResults[0].path);
    }
  };

  const handleSignOut = () => {
    clearStoredToken();
    navigate("/login");
  };

  return (
    <div className="student-layout">

      {/* MOBILE SIDEBAR OVERLAY */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.button
            className="student-sidebar-overlay"
            aria-label="Close sidebar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <aside
        className={`student-sidebar ${
          sidebarOpen ? "student-sidebar-open" : ""
        }`}
      >
        {/* BRAND */}
        <div className="student-sidebar-brand">
          <NavLink
            to="/student/dashboard"
            className="student-brand-link"
          >
            <motion.div
              className="student-brand-icon"
              whileHover={{ rotate: -7, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <GraduationCap size={25} strokeWidth={1.8} />
            </motion.div>

            <div className="student-brand-text">
              <span>SolveSpace</span>
              <small>LEARNING PLATFORM</small>
            </div>
          </NavLink>

          <button
            className="student-sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <X size={19} />
          </button>
        </div>

        {/* STUDENT PROFILE */}
        <div className="student-sidebar-profile">
          <div className="student-avatar">S</div>

          <div className="student-profile-info">
            <strong>Suryadeep Jadeja</strong>
            <span>Student Account</span>
          </div>

          <Sparkles
            size={17}
            className="student-profile-sparkle"
          />
        </div>

        {/* NAVIGATION */}
        <nav className="student-navigation">
          {navigationGroups.map((group) => (
            <div
              className="student-nav-group"
              key={group.title}
            >
              <p className="student-nav-heading">
                {group.title}
              </p>

              <div className="student-nav-items">
                {group.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end
                      className={({ isActive }) =>
                        `student-nav-link ${
                          isActive ? "active" : ""
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            size={19}
                            strokeWidth={1.8}
                          />

                          <span className="student-nav-label">
                            {item.label}
                          </span>

                          {isActive && (
                            <motion.span
                              className="student-nav-indicator"
                              layoutId="student-active-indicator"
                              transition={{
                                type: "spring",
                                stiffness: 380,
                                damping: 32,
                              }}
                            />
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* SIDEBAR BOTTOM */}
        <div className="student-sidebar-bottom">
          <div className="student-sidebar-promo">
            <div className="student-promo-icon">
              <Sparkles size={19} />
            </div>

            <div className="student-promo-content">
              <strong>Keep growing!</strong>
              <p>
                Every problem you solve takes you closer to your goals.
              </p>
            </div>
          </div>

          <button
            className="student-signout"
            onClick={handleSignOut}
          >
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="student-main-area">

        {/* HEADER */}
        <header className="student-header">
          <div className="student-header-left">
            <button
              className="student-menu-button"
              aria-label="Open navigation"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={21} />
            </button>

            <div className="student-breadcrumb">
              <span>Workspace</span>
              <span className="breadcrumb-divider">/</span>
              <strong>{currentPage}</strong>
            </div>
          </div>

          <div className="student-header-actions">

            {/* SEARCH */}
            <div
              className={`student-global-search ${
                searchOpen ? "search-active" : ""
              }`}
            >
              <Search size={17} />

              <input
                type="search"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
                onFocus={() => setSearchOpen(true)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search pages..."
                aria-label="Search navigation pages"
                aria-expanded={searchOpen}
              />

              <kbd>
                <Command size={11} /> K
              </kbd>

              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    className="student-search-popover"
                    initial={{ opacity: 0, y: -7, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -7, scale: 0.98 }}
                    transition={{ duration: 0.16 }}
                  >
                    <div className="student-search-heading">
                      <span>
                        {searchQuery.trim()
                          ? "SEARCH RESULTS"
                          : "QUICK NAVIGATION"}
                      </span>
                      <span>
                        {searchResults.length} pages
                      </span>
                    </div>

                    {searchResults.length > 0 ? (
                      searchResults.map((item) => {
                        const Icon = item.icon;

                        return (
                          <button
                            key={item.path}
                            className="student-search-result"
                            onMouseDown={(event) =>
                              event.preventDefault()
                            }
                            onClick={() =>
                              openSearchResult(item.path)
                            }
                          >
                            <span className="student-search-result-icon">
                              <Icon size={17} />
                            </span>

                            <span className="student-search-result-text">
                              <strong>{item.label}</strong>
                              <small>{item.description}</small>
                            </span>

                            <ArrowUpRight size={15} />
                          </button>
                        );
                      })
                    ) : (
                      <div className="student-search-empty">
                        <Search size={20} />
                        <span>No matching pages found.</span>
                      </div>
                    )}

                    <div className="student-search-footer">
                      Search currently covers workspace pages.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* NOTIFICATIONS */}
            <div className="student-notification-wrapper">
              <button
                className={`student-notification-button ${
                  notificationsOpen ? "active" : ""
                }`}
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
                onClick={() =>
                  setNotificationsOpen((previous) => !previous)
                }
              >
                <Bell size={19} />
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    className="student-notification-popover"
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.18 }}
                  >
                    <div className="notification-popover-heading">
                      <strong>Notifications</strong>
                      <span>Updates</span>
                    </div>

                    <div className="notification-empty-state">
                      <CheckCircle2 size={23} />
                      <p>
                        You're all caught up. New updates will appear here.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* PROFILE */}
            <button
              className="student-header-profile"
              onClick={() => navigate("/student/profile")}
            >
              <div className="student-header-avatar">S</div>

              <div className="student-header-profile-info">
                <strong>Suryadeep Jadeja</strong>
                <span>Student</span>
              </div>

              <ChevronDown size={15} />
            </button>
          </div>
        </header>

        {/* CLICK OUTSIDE SEARCH */}
        {searchOpen && (
          <button
            className="student-search-dismiss"
            aria-label="Close search"
            onClick={() => setSearchOpen(false)}
          />
        )}

        {/* PAGE CONTENT */}
        <main className="student-page-content">
          <AnimatePresence
            mode="wait"
            initial={false}
          >
            <motion.div
              key={location.pathname}
              className="student-page-transition"
              initial={{ opacity: 0, y: 9 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{
                duration: 0.22,
                ease: "easeOut",
              }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* FOOTER */}
        <footer className="student-layout-footer">
          <span>© 2026 SolveSpace</span>
          <span>Learn · Practice · Grow</span>
        </footer>
      </div>
    </div>
  );
}

export default StudentLayout;
