import { useEffect, useState } from "react";
import { Image as ImageIcon, Inbox, Star, MailOpen } from "lucide-react";
import { api } from "../../lib/api";

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div
      className="p-7 transition-all duration-300 hover:-translate-y-1"
      style={{
        background: "#fff",
        border: "1px solid rgba(0,0,0,0.06)",
        borderRadius: 4,
        boxShadow: "0 1px 0 rgba(0,0,0,0.02)",
      }}
      data-testid={`stat-card-${label.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="overline" style={{ color: "#737373" }}>
            {label}
          </div>
          <div
            className="font-serif-display mt-3"
            style={{ fontSize: "2.5rem", color: "#1A1A1A", lineHeight: 1 }}
          >
            {value}
          </div>
        </div>
        <div
          className="w-11 h-11 flex items-center justify-center"
          style={{
            background: accent ? "#CBA153" : "#F9F8F6",
            color: accent ? "#161616" : "#CBA153",
            borderRadius: 2,
          }}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

export default function AdminOverview({ me }) {
  const [stats, setStats] = useState({});
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    api.get("/admin/stats").then((r) => setStats(r.data)).catch(() => {});
    api.get("/admin/inquiries").then((r) => setRecent((r.data || []).slice(0, 5))).catch(() => {});
  }, []);

  return (
    <div data-testid="admin-overview">
      <div>
        <div className="overline" style={{ color: "#CBA153" }}>
          Overview
        </div>
        <h1
          className="font-serif-display mt-2"
          style={{ fontSize: "clamp(1.8rem,3vw,2.5rem)", color: "#1A1A1A" }}
        >
          Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"},{" "}
          <span style={{ color: "#CBA153" }}>{me?.name || "Admin"}.</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-9">
        <StatCard icon={ImageIcon} label="Portfolio Items" value={stats.portfolio_count ?? "—"} />
        <StatCard icon={Star} label="Testimonials" value={stats.testimonials_count ?? "—"} />
        <StatCard icon={Inbox} label="Total Inquiries" value={stats.inquiries_count ?? "—"} />
        <StatCard
          icon={MailOpen}
          label="Unread Inquiries"
          value={stats.unread_inquiries ?? "—"}
          accent={!!stats.unread_inquiries}
        />
      </div>

      <div className="mt-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif-display text-2xl" style={{ color: "#1A1A1A" }}>
            Recent enquiries
          </h2>
          <a href="/admin/inquiries" className="overline hover:text-[#CBA153]" style={{ color: "#737373" }}>
            View all
          </a>
        </div>
        <div
          style={{
            background: "#fff",
            border: "1px solid rgba(0,0,0,0.06)",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          {recent.length === 0 && (
            <div className="p-7 text-sm" style={{ color: "#737373" }}>
              No enquiries yet. They'll appear here as they come in.
            </div>
          )}
          {recent.map((r, i) => (
            <div
              key={r.id}
              className="p-5 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
              style={{ borderTop: i ? "1px solid rgba(0,0,0,0.06)" : "none" }}
              data-testid={`recent-inquiry-${i}`}
            >
              <div>
                <div className="font-serif-display text-lg" style={{ color: "#1A1A1A" }}>
                  {r.name}
                </div>
                <div className="text-xs mt-1" style={{ color: "#737373" }}>
                  {r.service || "—"} · {r.phone}
                </div>
              </div>
              <div className="text-sm md:max-w-[60%]" style={{ color: "#5a5a5a", lineHeight: 1.6 }}>
                {(r.message || "").slice(0, 130)}
                {(r.message || "").length > 130 ? "…" : ""}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
