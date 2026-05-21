import { useEffect, useState } from "react";
import { X, ArrowUpRight } from "lucide-react";
import { api } from "../../lib/api";

export default function Portfolio() {
  const [items, setItems] = useState([]);
  const [active, setActive] = useState(null);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    api.get("/portfolio").then((r) => setItems(r.data || [])).catch(() => {});
    // Mount-only fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.body.classList.toggle("no-scroll", !!active);
    const onKey = (e) => e.key === "Escape" && setActive(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  // Build filter list from item categories (first word of category)
  const categories = ["All", ...Array.from(new Set(items.map((p) => {
    const cat = (p.category || "").split("·")[0].trim();
    return cat || "Other";
  })))];

  const filtered = filter === "All"
    ? items
    : items.filter((p) => (p.category || "").startsWith(filter));

  return (
    <section
      id="portfolio"
      data-testid="portfolio-section"
      className="relative py-20 md:py-28 lg:py-32 bg-[var(--bg-elevated)]"
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        {/* Heading */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 md:mb-16">
          <div>
            <div className="overline mb-4 fi-reveal" style={{ color: "var(--accent)" }}>
              Recent Work
            </div>
            <h2
              className="font-display fi-reveal fi-reveal-delay-1"
              style={{
                fontSize: "clamp(1.9rem, 4vw, 3rem)",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                color: "var(--text-main)",
                fontWeight: 500,
              }}
              data-testid="portfolio-heading"
            >
              Selected projects
              <br />
              <span style={{ color: "var(--accent)" }}>from across Kolkata.</span>
            </h2>
          </div>
          <p
            className="max-w-md text-sm md:text-base fi-reveal fi-reveal-delay-2"
            style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}
          >
            Every photograph below is a real installation by our team — homes,
            sunrooms, offices and showrooms we've quietly delivered.
          </p>
        </div>

        {/* Filter pills */}
        {categories.length > 2 && (
          <div className="flex flex-wrap gap-2 mb-10 fi-reveal" data-testid="portfolio-filters">
            {categories.map((c) => {
              const active = filter === c;
              return (
                <button
                  key={c}
                  onClick={() => setFilter(c)}
                  data-testid={`portfolio-filter-${c.toLowerCase().replace(/\s+/g, "-")}`}
                  className="px-4 py-2 text-sm transition-colors"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 500,
                    borderRadius: "999px",
                    background: active ? "var(--text-main)" : "var(--bg-surface)",
                    color: active ? "#fff" : "var(--text-secondary)",
                    border: `1px solid ${active ? "var(--text-main)" : "var(--border-light)"}`,
                  }}
                >
                  {c}
                </button>
              );
            })}
          </div>
        )}

        {/* Card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {filtered.map((p, i) => (
            <button
              key={p.id}
              data-testid={`portfolio-item-${i}`}
              onClick={() => setActive(p)}
              className="group card-minimal fi-reveal text-left overflow-hidden"
              style={{ transitionDelay: `${(i % 6) * 0.05}s` }}
            >
              <div className="img-zoom aspect-[4/5]" style={{ background: "var(--bg-elevated)" }}>
                <img
                  src={p.image_url}
                  alt={p.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-5">
                <div
                  className="overline"
                  style={{ color: "var(--accent)", fontSize: "0.65rem" }}
                >
                  {p.category}
                </div>
                <div
                  className="font-display mt-2"
                  style={{
                    fontSize: "1.1rem",
                    color: "var(--text-main)",
                    fontWeight: 600,
                    lineHeight: 1.3,
                  }}
                >
                  {p.title}
                </div>
                <div
                  className="mt-3 inline-flex items-center gap-1.5 text-xs uppercase"
                  style={{
                    color: "var(--text-secondary)",
                    letterSpacing: "0.12em",
                    fontWeight: 500,
                  }}
                >
                  View Project
                  <ArrowUpRight
                    size={12}
                    className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {active && (
        <div
          data-testid="portfolio-lightbox"
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-10"
          style={{ background: "rgba(26, 26, 26, 0.7)", backdropFilter: "blur(6px)" }}
          onClick={() => setActive(null)}
        >
          <div
            className="relative w-full max-w-[1100px] max-h-[92vh] grid grid-cols-1 md:grid-cols-5 gap-0 overflow-auto bg-white"
            style={{ border: "1px solid var(--border-light)", borderRadius: "4px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActive(null)}
              data-testid="lightbox-close"
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center"
              style={{
                background: "var(--bg-surface)",
                color: "var(--text-main)",
                border: "1px solid var(--border-light)",
                borderRadius: "999px",
              }}
              aria-label="Close"
            >
              <X size={16} />
            </button>
            <div className="md:col-span-3" style={{ background: "var(--bg-elevated)" }}>
              <img
                src={active.image_url}
                alt={active.title}
                className="w-full h-full object-cover max-h-[92vh]"
              />
            </div>
            <div
              className="md:col-span-2 p-8 md:p-10 flex flex-col justify-center"
              style={{ color: "var(--text-main)" }}
            >
              <div className="overline" style={{ color: "var(--accent)" }}>
                {active.category}
              </div>
              <h3
                className="font-display mt-4"
                style={{
                  fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                  lineHeight: 1.15,
                  letterSpacing: "-0.02em",
                  fontWeight: 600,
                }}
              >
                {active.title}
              </h3>
              <p
                className="mt-5 text-sm md:text-base"
                style={{ color: "var(--text-secondary)", lineHeight: 1.75 }}
              >
                {active.description || "Project details coming soon."}
              </p>
              <button
                onClick={() => {
                  setActive(null);
                  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                }}
                data-testid="lightbox-cta"
                className="btn-primary mt-8 self-start"
              >
                Start a Similar Project
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
