import { useEffect, useState } from "react";
import { useNavigate, NavLink, Routes, Route, Navigate } from "react-router-dom";
import {
  LayoutDashboard,
  Image as ImageIcon,
  MessageSquare,
  Inbox,
  Settings,
  LogOut,
  Star,
} from "lucide-react";
import { api, getAdminToken, setAdminToken } from "../lib/api";

import AdminOverview from "../components/admin/AdminOverview";
import AdminPortfolio from "../components/admin/AdminPortfolio";
import AdminInquiries from "../components/admin/AdminInquiries";
import AdminTestimonials from "../components/admin/AdminTestimonials";
import AdminSettings from "../components/admin/AdminSettings";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      navigate("/admin/login", { replace: true });
      return;
    }
    api
      .get("/admin/me")
      .then((r) => {
        setMe(r.data);
        setLoading(false);
      })
      .catch(() => {
        setAdminToken(null);
        navigate("/admin/login", { replace: true });
      });
    // Run only on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = async () => {
    try {
      await api.post("/admin/logout");
    } catch (e) {
      // Server-side logout is best-effort; client always clears the token.
      console.warn("Server logout failed (clearing local token anyway)", e);
    }
    setAdminToken(null);
    navigate("/admin/login", { replace: true });
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#161616", color: "#F9F8F6" }}
      >
        <div className="fi-spin" />
      </div>
    );
  }

  const navItems = [
    { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
    { to: "/admin/portfolio", label: "Portfolio", icon: ImageIcon },
    { to: "/admin/inquiries", label: "Inquiries", icon: Inbox },
    { to: "/admin/testimonials", label: "Testimonials", icon: Star },
    { to: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="admin-shell" data-testid="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="mb-10 hidden lg:block">
          <div className="font-serif-display text-2xl" style={{ color: "#F9F8F6", lineHeight: 1.1 }}>
            Urban <span style={{ color: "#CBA153" }}>Interiors</span>
          </div>
          <div className="overline mt-2" style={{ color: "rgba(255,255,255,0.4)" }}>
            Admin
          </div>
        </div>

        <nav className="flex lg:flex-col gap-2 flex-1">
          {navItems.map((it) => {
            const Icon = it.icon;
            return (
              <NavLink
                key={it.to}
                to={it.to}
                end={it.end}
                data-testid={`admin-nav-${it.label.toLowerCase()}`}
                className={({ isActive }) => `admin-nav-item ${isActive ? "active" : ""}`}
              >
                <Icon size={16} />
                <span>{it.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="hidden lg:block mt-6 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>
            {me?.email}
          </div>
          <button
            onClick={logout}
            className="admin-nav-item w-full"
            style={{ color: "rgba(249,248,246,0.6)" }}
            data-testid="admin-logout-btn"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      <main className="admin-content">
        <Routes>
          <Route index element={<AdminOverview me={me} />} />
          <Route path="portfolio" element={<AdminPortfolio />} />
          <Route path="inquiries" element={<AdminInquiries />} />
          <Route path="testimonials" element={<AdminTestimonials />} />
          <Route path="settings" element={<AdminSettings me={me} setMe={setMe} onLogout={logout} />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  );
}
