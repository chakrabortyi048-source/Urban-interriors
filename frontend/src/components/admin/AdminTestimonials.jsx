import { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, Save, X, Star } from "lucide-react";
import { api, formatApiError } from "../../lib/api";

const empty = { name: "", rating: 5, text: "", when: "", is_local_guide: false, review_count: 0 };

export default function AdminTestimonials() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const { data } = await api.get("/admin/testimonials");
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
      name: it.name,
      rating: it.rating || 5,
      text: it.text,
      when: it.when || "",
      is_local_guide: !!it.is_local_guide,
      review_count: it.review_count || 0,
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
      const payload = {
        ...form,
        rating: parseInt(form.rating) || 5,
        review_count: parseInt(form.review_count) || 0,
      };
      if (editing === "new") {
        await api.post("/admin/testimonials", payload);
      } else {
        await api.put(`/admin/testimonials/${editing}`, payload);
      }
      cancel();
      load();
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || "Save failed");
    }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this testimonial?")) return;
    try {
      await api.delete(`/admin/testimonials/${id}`);
      load();
    } catch (e) {}
  };

  return (
    <div data-testid="admin-testimonials">
      <div className="flex items-end justify-between mb-9 flex-wrap gap-4">
        <div>
          <div className="overline" style={{ color: "#CBA153" }}>
            Testimonials
          </div>
          <h1 className="font-serif-display mt-2" style={{ fontSize: "2.2rem", color: "#1A1A1A" }}>
            Client reviews ({items.length})
          </h1>
        </div>
        <button onClick={startNew} className="btn-fi-dark" data-testid="testimonial-add-btn">
          <Plus size={14} /> Add Review
        </button>
      </div>

      {editing && (
        <form
          onSubmit={save}
          className="p-7 mb-8"
          style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 4 }}
          data-testid="testimonial-form"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif-display text-xl" style={{ color: "#1A1A1A" }}>
              {editing === "new" ? "New review" : "Edit review"}
            </h2>
            <button type="button" onClick={cancel} aria-label="Close" data-testid="testimonial-form-cancel">
              <X size={18} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className={`fi-field ${form.name ? "has-value" : ""}`}>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder=" "
                data-testid="testimonial-form-name"
              />
              <label>Name *</label>
            </div>
            <div className={`fi-field ${String(form.rating) ? "has-value" : ""}`}>
              <input
                type="number"
                min="1"
                max="5"
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: e.target.value })}
                placeholder=" "
                data-testid="testimonial-form-rating"
              />
              <label>Rating (1–5)</label>
            </div>
            <div className={`fi-field ${form.when ? "has-value" : ""}`}>
              <input
                value={form.when}
                onChange={(e) => setForm({ ...form, when: e.target.value })}
                placeholder=" "
                data-testid="testimonial-form-when"
              />
              <label>When (e.g. "2 months ago")</label>
            </div>
            <div className={`fi-field ${String(form.review_count) ? "has-value" : ""}`}>
              <input
                type="number"
                min="0"
                value={form.review_count}
                onChange={(e) => setForm({ ...form, review_count: e.target.value })}
                placeholder=" "
                data-testid="testimonial-form-review-count"
              />
              <label>Reviewer's review count</label>
            </div>
            <div className="md:col-span-2 flex items-center gap-2 pt-3">
              <input
                type="checkbox"
                id="lg"
                checked={form.is_local_guide}
                onChange={(e) => setForm({ ...form, is_local_guide: e.target.checked })}
                data-testid="testimonial-form-localguide"
              />
              <label htmlFor="lg" className="text-sm" style={{ color: "#1A1A1A" }}>
                Local Guide
              </label>
            </div>
            <div className={`fi-field md:col-span-2 ${form.text ? "has-value" : ""}`}>
              <textarea
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                required
                placeholder=" "
                data-testid="testimonial-form-text"
              />
              <label>Review text *</label>
            </div>
          </div>
          {error && (
            <div className="mt-5 text-sm" style={{ color: "#a33" }}>
              {error}
            </div>
          )}
          <div className="mt-6 flex gap-3">
            <button type="submit" className="btn-fi-dark" data-testid="testimonial-form-save">
              <Save size={14} /> Save
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {items.map((it, i) => (
          <div
            key={it.id}
            data-testid={`testimonial-card-${i}`}
            className="p-6"
            style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.06)", borderRadius: 4 }}
          >
            <div className="flex">
              {Array.from({ length: it.rating || 5 }).map((_, j) => (
                <Star key={j} size={14} className="fi-star" />
              ))}
            </div>
            <p className="mt-3 text-sm" style={{ color: "#3a3a3a", lineHeight: 1.6 }}>
              {(it.text || "").slice(0, 180)}
              {(it.text || "").length > 180 ? "…" : ""}
            </p>
            <div className="mt-4 pt-4 flex items-center justify-between" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
              <div>
                <div className="font-serif-display" style={{ fontSize: "1rem", color: "#1A1A1A" }}>
                  {it.name}
                </div>
                <div className="overline mt-1" style={{ color: "#737373", fontSize: "0.6rem" }}>
                  {it.is_local_guide ? "Local Guide · " : ""}
                  {it.review_count ? `${it.review_count} reviews` : ""}
                  {it.when ? ` · ${it.when}` : ""}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(it)}
                  className="text-xs hover:text-[#CBA153]"
                  style={{ color: "#5a5a5a" }}
                  data-testid={`testimonial-edit-${i}`}
                  aria-label="Edit"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => del(it.id)}
                  className="text-xs hover:text-red-500"
                  style={{ color: "#a33" }}
                  data-testid={`testimonial-delete-${i}`}
                  aria-label="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
