import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const candidateLinks = [
    { to: "/dashboard", label: "Dashboard", icon: "📊", end: true },
    { to: "/profile", label: "Profile", icon: "👤", end: true },
    { to: "/resumes", label: "My Resume", icon: "📄" },
    { to: "/analysis", label: "AI Analysis", icon: "🤖" },
    { to: "/jobs", label: "Find Jobs", icon: "💼", end: true },
    { to: "/applications", label: "My Applications", icon: "📋", end: true },
    { to: "/jd-analyzer", label: "Job Description Analyzer", icon: "🔍" },
    { to: "/matches", label: "Job Matches", icon: "🎯", end: true },
  ];

  const recruiterLinks = [
    { to: "/dashboard", label: "Dashboard", icon: "📊", end: true },
    { to: "/profile", label: "Profile", icon: "👤", end: true },
    { to: "/jobs", label: "My Jobs", icon: "💼", end: true },
    { to: "/jobs/create", label: "Create Job", icon: "➕" },
    { to: "/applications", label: "Applications", icon: "👥", end: true },
    { to: "/matches", label: "Matching Results", icon: "🎯", end: true },
  ];

  const links =
    user?.role === "candidate"
      ? candidateLinks
      : recruiterLinks;

  const handleLogout = () => {
    setMobileOpen(false);
    logout();
    navigate("/login", { replace: true });
  };

  const closeMobileNav = () => {
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Topbar */}
      <div className="mobile-topbar">
        <div className="mobile-topbar-brand">
          <div className="brand-icon">✦</div>
          <span>AI JobMatch</span>
        </div>
        <button
          className="mobile-hamburger"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Backdrop for Mobile Drawer */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={closeMobileNav}
        />
      )}

      {/* Main Sidebar Component */}
      <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">✦</div>
          <span>AI JobMatch</span>
          <button
            className="mobile-close-btn"
            onClick={closeMobileNav}
            aria-label="Close Navigation Menu"
          >
            ✕
          </button>
        </div>

        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={closeMobileNav}
              className={({ isActive }) =>
                isActive ? "active" : undefined
              }
            >
              <span className="nav-icon">{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </aside>
    </>
  );
}

export default Sidebar;