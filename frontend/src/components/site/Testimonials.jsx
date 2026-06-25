import { useEffect, useState } from "react";
import { Star, Quote } from "lucide-react";
import { api } from "../../lib/api";
import SplitHeading, { SpreadOverline } from "./SplitHeading";

export default function Testimonials() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get("/testimonials").then((r) => setItems(r.data || [])).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      id="testimonials"
      data-testid="testimonials-section"
      style={{ background: "var(--fi-offwhite)" }}
      className="relative py-24 md:py-32 lg:py-40 overflow-hidden"
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div>
            <SpreadOverline text="In their own words" style={{ color: "#CBA153" }} />
            <SplitHeading
              primary="Real reviews,"
              accent="from real Chinar Park clients."
              className="font-serif-display mt-5"
              style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)", lineHeight: 1.05, color: "#1A1A1A" }}
              testId="testimonials-heading"
            />
          </div>
          <div className="fi-reveal fi-reveal-delay-2 flex items-center gap-3">
            <div className="flex">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} size={18} style={{ color: "#CBA153", fill: "#CBA153" }} />
              ))}
            </div>
            <div className="text-sm" style={{ color: "#737373" }}>
              4.7 / 5 · Verified Google Reviews
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {items.map((t, i) => (
            <article
              key={t.id}
              data-testid={`testimonial-card-${i}`}
              className="p-7 fi-reveal transition-all duration-500"
              style={{
                background: "#fff",
                border: "1px solid rgba(0,0,0,0.06)",
                borderLeft: "2px solid #CBA153",
                transitionDelay: `${(i % 3) * 0.08}s`,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 22px 50px -20px rgba(203,161,83,0.35)")}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex">
                  {Array.from({ length: t.rating || 5 }).map((_, j) => (
                    <Star key={j} size={14} style={{ color: "#CBA153", fill: "#CBA153" }} />
                  ))}
                </div>
                <Quote size={22} style={{ color: "#CBA153", opacity: 0.45 }} />
              </div>
              <p className="text-sm font-serif-display"
                style={{ color: "#1A1A1A", lineHeight: 1.7, fontStyle: "italic", fontWeight: 300 }}>
                {t.text && t.text.length > 280 ? t.text.slice(0, 280) + "…" : t.text}
              </p>
              <div className="mt-5 pt-4 flex items-center justify-between"
                style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                <div>
                  <div className="font-serif-display"
                    style={{ fontSize: "1rem", color: "#1A1A1A", fontWeight: 500 }}>
                    {t.name}
                  </div>
                  <div className="text-xs mt-1" style={{ color: "#737373" }}>
                    {t.is_local_guide ? "Local Guide · " : ""}
                    {t.review_count ? `${t.review_count} reviews` : ""}
                    {t.when ? ` · ${t.when}` : ""}
                  </div>
                </div>
                <div className="text-xs uppercase"
                  style={{ color: "#CBA153", letterSpacing: "0.15em", fontWeight: 500 }}>
                  Google
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
