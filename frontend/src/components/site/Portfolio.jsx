import { useEffect, useState } from "react";
import { X, ArrowUpRight } from "lucide-react";
import { api } from "../../lib/api";
import SplitHeading, { SpreadOverline } from "./SplitHeading";

export default function Portfolio() {
  const [items, setItems] = useState([]);
  const [active, setActive] = useState(null);

  useEffect(() => {
    api.get("/portfolio").then((r) => setItems(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    document.body.classList.toggle("no-scroll", !!active);
    const onKey = (e) => e.key === "Escape" && setActive(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  return (
    <section
      id="portfolio"
      data-testid="portfolio-section"
      className="relative py-24 md:py-32 lg:py-40"
      style={{ background: "#161616", color: "#F9F8F6" }}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <div>
            <SpreadOverline text="Recent Work" style={{ color: "#CBA153" }} />
            <SplitHeading
              primary="Selected projects,"
              accent="from across Kolkata."
              className="font-serif-display mt-5"
              style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)", lineHeight: 1.05, color: "#F9F8F6" }}
              testId="portfolio-heading"
            />
          </div>
          <p
            className="max-w-md text-sm md:text-base fi-reveal fi-reveal-delay-2 fi-glow-text"
            style={{ color: "rgba(249,248,246,0.65)", lineHeight: 1.7 }}
          >
            Every photograph below is a real installation by our team — homes, sunrooms,
            offices and showrooms we've quietly delivered. Tap any image to step inside.
          </p>
        </div>

        {/* Asymmetric grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6">
          {items.map((p, i) => {
            const layoutClass =
              i % 5 === 0
                ? "md:col-span-7 md:row-span-2"
                : i % 5 === 1
                ? "md:col-span-5"
                : i % 5 === 2
                ? "md:col-span-5"
                : i % 5 === 3
                ? "md:col-span-7"
                : "md:col-span-12";
            const aspect =
              i % 5 === 0 ? "aspect-[5/6]" : i % 5 === 4 ? "aspect-[16/7]" : "aspect-[4/3]";
            return (
              <button
                key={p.id}
                data-testid={`portfolio-item-${i}`}
                onClick={() => setActive(p)}
                className={`group portfolio-img-wrap ${layoutClass} ${aspect} fi-reveal text-left relative cursor-pointer-fi`}
                style={{ background: "#0e0e0e" }}
              >
                <img
                  src={p.image_url}
                  alt={p.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 z-10 p-6 md:p-8 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="overline" style={{ color: "#CBA153" }}>
                    {p.category}
                  </div>
                  <div className="font-serif-display text-2xl md:text-3xl mt-2">
                    {p.title}
                  </div>
                  <div className="mt-3 inline-flex items-center gap-2 text-xs tracking-[0.22em] uppercase">
                    View Project <ArrowUpRight size={14} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lightbox */}
      {active && (
        <div
          data-testid="portfolio-lightbox"
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-10"
          style={{
            background: "rgba(10,10,10,0.92)",
            backdropFilter: "blur(8px)",
            animation: "fadeIn 0.4s ease",
          }}
          onClick={() => setActive(null)}
        >
          <div
            className="relative w-full max-w-[1200px] max-h-[92vh] grid grid-cols-1 md:grid-cols-5 gap-0 overflow-auto"
            style={{ background: "#1a1a1a", border: "1px solid rgba(203,161,83,0.2)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActive(null)}
              data-testid="lightbox-close"
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full"
              style={{ background: "rgba(0,0,0,0.5)", color: "#F9F8F6" }}
              aria-label="Close"
            >
              <X size={18} />
            </button>
            <div className="md:col-span-3 bg-black">
              <img
                src={active.image_url}
                alt={active.title}
                className="w-full h-full object-cover max-h-[92vh]"
              />
            </div>
            <div className="md:col-span-2 p-8 md:p-10 flex flex-col justify-center" style={{ color: "#F9F8F6" }}>
              <div className="overline" style={{ color: "#CBA153" }}>
                {active.category}
              </div>
              <h3
                className="font-serif-display mt-4"
                style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", lineHeight: 1.1 }}
              >
                {active.title}
              </h3>
              <p
                className="mt-6 text-sm md:text-base"
                style={{ color: "rgba(249,248,246,0.7)", lineHeight: 1.8, fontWeight: 300 }}
              >
                {active.description || "Project details coming soon."}
              </p>
              <button
                onClick={() => {
                  setActive(null);
                  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                }}
                data-testid="lightbox-cta"
                className="btn-fi-gold mt-10 self-start"
                style={{ padding: "0.85rem 1.6rem", fontSize: "0.7rem" }}
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
