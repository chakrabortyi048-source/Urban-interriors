import { useEffect, useState } from "react";
import { Trash2, ArrowUpDown, X, Mail, Phone } from "lucide-react";
import { api } from "../../lib/api";

export default function AdminInquiries() {
  const [items, setItems] = useState([]);
  const [sort, setSort] = useState({ key: "created_at", dir: "desc" });
  const [active, setActive] = useState(null);

  const load = async () => {
    try {
      const { data } = await api.get("/admin/inquiries");
      setItems(data || []);
    } catch (e) {}
  };
  useEffect(() => {
    load();
  }, []);

  const sorted = [...items].sort((a, b) => {
    const av = a[sort.key] || "";
    const bv = b[sort.key] || "";
    if (av < bv) return sort.dir === "asc" ? -1 : 1;
    if (av > bv) return sort.dir === "asc" ? 1 : -1;
    return 0;
  });

  const setKey = (key) => {
    if (sort.key === key) setSort({ key, dir: sort.dir === "asc" ? "desc" : "asc" });
    else setSort({ key, dir: "asc" });
  };

  const del = async (id) => {
    if (!window.confirm("Delete this inquiry?")) return;
    try {
      await api.delete(`/admin/inquiries/${id}`);
      load();
      setActive(null);
    } catch (e) {}
  };

  const open = async (it) => {
    setActive(it);
    if (!it.is_read) {
      try {
        await api.post(`/admin/inquiries/${it.id}/read`);
        load();
      } catch (e) {}
    }
  };

  const Th = ({ k, label }) => (
    <th
      onClick={() => setKey(k)}
      className="text-left text-[11px] uppercase tracking-[0.2em] font-medium cursor-pointer-fi p-4"
      style={{ color: "#737373" }}
      data-testid={`inquiry-sort-${k}`}
    >
      <span className="inline-flex items-center gap-1">
        {label} <ArrowUpDown size={12} />
      </span>
    </th>
  );

  return (
    <div data-testid="admin-inquiries">
      <div className="overline" style={{ color: "#CBA153" }}>Inbox</div>
      <h1 className="font-serif-display mt-2" style={{ fontSize: "2.2rem", color: "#1A1A1A" }}>
        Inquiries ({items.length})
      </h1>

      <div className="mt-9 overflow-x-auto" style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.06)", borderRadius: 4 }}>
        <table className="w-full">
          <thead style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
            <tr>
              <Th k="name" label="Name" />
              <Th k="email" label="Email" />
              <Th k="phone" label="Phone" />
              <Th k="service" label="Service" />
              <Th k="created_at" label="Date" />
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={6} className="p-7 text-sm text-center" style={{ color: "#737373" }}>
                  No inquiries yet.
                </td>
              </tr>
            )}
            {sorted.map((it, i) => (
              <tr
                key={it.id}
                onClick={() => open(it)}
                className="cursor-pointer-fi hover:bg-[#F9F8F6] transition-colors"
                style={{ borderTop: i ? "1px solid rgba(0,0,0,0.05)" : "none" }}
                data-testid={`inquiry-row-${i}`}
              >
                <td className="p-4 font-medium text-sm" style={{ color: "#1A1A1A" }}>
                  {!it.is_read && (
                    <span
                      className="inline-block w-2 h-2 rounded-full mr-2"
                      style={{ background: "#CBA153" }}
                    />
                  )}
                  {it.name}
                </td>
                <td className="p-4 text-sm" style={{ color: "#5a5a5a" }}>{it.email}</td>
                <td className="p-4 text-sm" style={{ color: "#5a5a5a" }}>{it.phone}</td>
                <td className="p-4 text-sm" style={{ color: "#5a5a5a" }}>{it.service || "—"}</td>
                <td className="p-4 text-xs" style={{ color: "#737373" }}>
                  {it.created_at ? new Date(it.created_at).toLocaleString() : "—"}
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      del(it.id);
                    }}
                    className="text-xs hover:text-red-500"
                    style={{ color: "#a33" }}
                    data-testid={`inquiry-delete-${i}`}
                    aria-label="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {active && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          onClick={() => setActive(null)}
          data-testid="inquiry-modal"
        >
          <div
            className="w-full max-w-2xl p-8"
            style={{ background: "#fff", borderRadius: 4 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="overline" style={{ color: "#CBA153" }}>Inquiry</div>
                <h2 className="font-serif-display mt-2" style={{ fontSize: "1.8rem", color: "#1A1A1A" }}>
                  {active.name}
                </h2>
              </div>
              <button onClick={() => setActive(null)} aria-label="Close" data-testid="inquiry-modal-close">
                <X size={20} />
              </button>
            </div>
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm" style={{ color: "#5a5a5a" }}>
              <a href={`mailto:${active.email}`} className="flex items-center gap-2 hover:text-[#CBA153]">
                <Mail size={14} /> {active.email}
              </a>
              <a href={`tel:${active.phone}`} className="flex items-center gap-2 hover:text-[#CBA153]">
                <Phone size={14} /> {active.phone}
              </a>
            </div>
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <div className="overline" style={{ color: "#737373" }}>Service</div>
                <div className="mt-1" style={{ color: "#1A1A1A" }}>{active.service || "—"}</div>
              </div>
              <div>
                <div className="overline" style={{ color: "#737373" }}>Preferred callback</div>
                <div className="mt-1" style={{ color: "#1A1A1A" }}>{active.callback_time || "—"}</div>
              </div>
            </div>
            <div className="mt-6">
              <div className="overline" style={{ color: "#737373" }}>Message</div>
              <p className="mt-2 text-sm" style={{ color: "#1A1A1A", lineHeight: 1.7 }}>
                {active.message}
              </p>
            </div>
            <div className="mt-7 flex justify-end gap-3">
              <button
                onClick={() => del(active.id)}
                className="btn-fi-ghost"
                style={{ color: "#a33", borderColor: "#e0c8c8" }}
                data-testid="inquiry-modal-delete"
              >
                Delete
              </button>
              <a href={`tel:${active.phone}`} className="btn-fi-dark" data-testid="inquiry-modal-call">
                Call Now
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
