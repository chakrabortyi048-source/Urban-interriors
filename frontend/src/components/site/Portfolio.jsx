import { useEffect, useState } from "react";
import { X, ArrowUpRight } from "lucide-react";
import { api } from "../../lib/api";
import SplitHeading, { SpreadOverline } from "./SplitHeading";

export default function Portfolio() {
  const [items, setItems] = useState([]);
  const [active, setActive] = useState(null);

  useEffect(() => {
    api.get("/portfolio").then((r) => setItems(r.data || [])).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {items.map((p, i) => (
            <button
              key={p.id}
              data-testid={`portfolio-item-${i}`}
              onClick={() => setActive(p)}
              className="group portfolio-img-wrap fi-reveal text-left"
              style={{
                aspectRatio: "4 / 5",
                background: "#1d1d1d",
                border: "1px solid rgba(203,161,83,0.18)",
                transitionDelay: `${(i % 6) * 0.06}s`,
              }}
            >
              <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" loading="lazy" />
              <div
                className="absolute inset-0 flex flex-col justify-end p-6 transition-opacity duration-500"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0.9) 100%)",
                }}
              >
                <div className="overline" style={{ color: "#E9C57A", fontSize: "0.65rem" }}>
                  {p.category}
                </div>
                <div className="font-serif-display mt-2"
                  style={{ fontSize: "1.3rem", color: "#F9F8F6", lineHeight: 1.2 }}>
                  {p.title}
                </div>
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs uppercase opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: "#E9C57A", letterSpacing: "0.18em", fontWeight: 500 }}>
                  View Project <ArrowUpRight size={12} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {active && (
        <div
          data-testid="portfolio-lightbox"
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-10"
          style={{ background: "rgba(0,0,0,0.86)", backdropFilter: "blur(8px)" }}
          onClick={() => setActive(null)}
        >
          <div className="relative w-full max-w-[1100px] max-h-[92vh] grid grid-cols-1 md:grid-cols-5 gap-0 overflow-auto"
            style={{ background: "#0e0e0e", border: "1px solid rgba(203,161,83,0.35)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActive(null)}
              data-testid="lightbox-close"
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center"
              style={{
                background: "rgba(20,20,20,0.7)",
                color: "#E9C57A",
                border: "1px solid rgba(203,161,83,0.4)",
                borderRadius: "999px",
              }}
              aria-label="Close"
            >
              <X size={16} />
            </button>
            <div className="md:col-span-3" style={{ background: "#0e0e0e" }}>
              <img src={active.image_url} alt={active.title} className="w-full h-full object-cover max-h-[92vh]" />
            </div>
            <div className="md:col-span-2 p-8 md:p-10 flex flex-col justify-center" style={{ color: "#F9F8F6" }}>
              <div className="overline" style={{ color: "#E9C57A" }}>{active.category}</div>
              <h3 className="font-serif-display mt-4"
                style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", lineHeight: 1.15, letterSpacing: "-0.01em" }}>
                {active.title}
              </h3>
              <p className="mt-5 text-sm md:text-base"
                style={{ color: "rgba(249,248,246,0.78)", lineHeight: 1.75, fontWeight: 300 }}>
                {active.description || "Project details coming soon."}
              </p>
              <button
                onClick={() => {
                  setActive(null);
                  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                }}
                data-testid="lightbox-cta"
                className="btn-fi-gold mt-8 self-start"
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
