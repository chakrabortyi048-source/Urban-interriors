import { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, ArrowUp, ArrowDown, X, Save } from "lucide-react";
import { api, formatApiError } from "../../lib/api";

const empty = { title: "", category: "", description: "", image_url: "", aspect: "portrait" };

export default function AdminPortfolio() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const { data } = await api.get("/admin/portfolio");
      setItems(data || []);
    } catch (e) {}
  };
  useEffect(() => {
    load();
  }, []);

  const startNew = () => {
    setForm(empty);
    setEditing("new");
    setError("");
  };
  const startEdit = (it) => {
    setForm({
      title: it.title,
      category: it.category,
      description: it.description || "",
      image_url: it.image_url,
      aspect: it.aspect || "portrait",
    });
    setEditing(it.id);
    setError("");
  };
  const cancel = () => {
    setEditing(null);
    setForm(empty);
    setError("");
  };

  const save = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editing === "new") {
        await api.post("/admin/portfolio", form);
      } else {
        await api.put(`/admin/portfolio/${editing}`, form);
      }
      cancel();
      load();
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || "Save failed");
    }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this project? This cannot be undone.")) return;
    try {
      await api.delete(`/admin/portfolio/${id}`);
      load();
    } catch (e) {}
  };

  const move = async (idx, dir) => {
    const next = [...items];
    const t = idx + dir;
    if (t < 0 || t >= next.length) return;
    [next[idx], next[t]] = [next[t], next[idx]];
    setItems(next);
    try {
      await api.post("/admin/portfolio/reorder", { ids: next.map((i) => i.id) });
    } catch (e) {
      load();
    }
  };

  return (
    <div data-testid="admin-portfolio">
      <div className="flex items-end justify-between mb-9 flex-wrap gap-4">
        <div>
          <div className="overline" style={{ color: "#CBA153" }}>
            Portfolio Manager
          </div>
          <h1 className="font-serif-display mt-2" style={{ fontSize: "2.2rem", color: "#1A1A1A" }}>
            Projects on the live site
          </h1>
          <p className="mt-2 text-sm" style={{ color: "#737373" }}>
            Add, edit, reorder or remove portfolio projects. Changes appear instantly on the public site.
          </p>
        </div>
        <button onClick={startNew} className="btn-fi-dark" data-testid="portfolio-add-btn">
          <Plus size={14} /> Add Project
        </button>
      </div>

      {editing && (
        <form
          onSubmit={save}
          className="p-7 mb-8"
          style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 4 }}
          data-testid="portfolio-form"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif-display text-xl" style={{ color: "#1A1A1A" }}>
              {editing === "new" ? "New project" : "Edit project"}
            </h2>
            <button
              type="button"
              onClick={cancel}
              className="text-sm hover:text-[#CBA153]"
              style={{ color: "#737373" }}
              data-testid="portfolio-form-cancel"
            >
              <X size={18} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className={`fi-field ${form.title ? "has-value" : ""}`}>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                placeholder=" "
                data-testid="portfolio-form-title"
              />
              <label>Title *</label>
            </div>
            <div className={`fi-field ${form.category ? "has-value" : ""}`}>
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
                placeholder=" "
                data-testid="portfolio-form-category"
              />
              <label>Category *</label>
            </div>
            <div className={`fi-field md:col-span-2 ${form.image_url ? "has-value" : ""}`}>
              <input
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                required
                placeholder=" "
                data-testid="portfolio-form-image-url"
              />
              <label>Image URL *</label>
            </div>
            <div className={`fi-field md:col-span-2 ${form.description ? "has-value" : ""}`}>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder=" "
                data-testid="portfolio-form-description"
              />
              <label>Description</label>
            </div>
          </div>
          {form.image_url && (
            <div className="mt-5">
              <div className="overline mb-2" style={{ color: "#737373" }}>Preview</div>
              <img
                src={form.image_url}
                alt="preview"
                className="w-full max-w-md object-cover"
                style={{ aspectRatio: "4 / 3" }}
              />
            </div>
          )}
          {error && (
            <div className="mt-5 text-sm" style={{ color: "#a33" }} data-testid="portfolio-form-error">
              {error}
            </div>
          )}
          <div className="mt-6 flex gap-3">
            <button type="submit" className="btn-fi-dark" data-testid="portfolio-form-save">
              <Save size={14} /> Save
            </button>
            <button type="button" onClick={cancel} className="btn-fi-ghost" style={{ borderColor: "rgba(0,0,0,0.15)", color: "#1A1A1A" }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
        style={{ alignItems: "stretch" }}
      >
        {items.map((it, i) => (
          <div
            key={it.id}
            data-testid={`portfolio-item-card-${i}`}
            style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.06)", borderRadius: 4, overflow: "hidden" }}
          >
            <div style={{ aspectRatio: "4 / 3", overflow: "hidden", background: "#1a1a1a" }}>
              <img src={it.image_url} alt={it.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-5">
              <div className="overline" style={{ color: "#CBA153" }}>{it.category}</div>
              <h3 className="font-serif-display mt-2" style={{ fontSize: "1.2rem", color: "#1A1A1A" }}>
                {it.title}
              </h3>
              <p className="mt-2 text-xs" style={{ color: "#737373", lineHeight: 1.6 }}>
                {(it.description || "").slice(0, 100)}
                {(it.description || "").length > 100 ? "…" : ""}
              </p>
              <div className="flex items-center justify-between mt-5">
                <div className="flex gap-1">
                  <button
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className="w-8 h-8 flex items-center justify-center hover:text-[#CBA153] disabled:opacity-30"
                    style={{ border: "1px solid rgba(0,0,0,0.1)", color: "#5a5a5a" }}
                    data-testid={`portfolio-move-up-${i}`}
                    aria-label="Move up"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    onClick={() => move(i, 1)}
                    disabled={i === items.length - 1}
                    className="w-8 h-8 flex items-center justify-center hover:text-[#CBA153] disabled:opacity-30"
                    style={{ border: "1px solid rgba(0,0,0,0.1)", color: "#5a5a5a" }}
                    data-testid={`portfolio-move-down-${i}`}
                    aria-label="Move down"
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(it)}
                    className="text-xs uppercase tracking-[0.2em] hover:text-[#CBA153]"
                    style={{ color: "#5a5a5a" }}
                    data-testid={`portfolio-edit-${i}`}
                  >
                    <Edit2 size={14} className="inline mr-1" /> Edit
                  </button>
                  <button
                    onClick={() => del(it.id)}
                    className="text-xs uppercase tracking-[0.2em] hover:text-red-500"
                    style={{ color: "#a33" }}
                    data-testid={`portfolio-delete-${i}`}
                  >
                    <Trash2 size={14} className="inline mr-1" /> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
