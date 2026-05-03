import { useEffect, useState } from "react";
import { Star, Quote } from "lucide-react";
import { api } from "../../lib/api";
import SplitHeading, { SpreadOverline } from "./SplitHeading";

export default function Testimonials() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    api.get("/testimonials").then((r) => setItems(r.data || [])).catch(() => {});
  }, []);

  // duplicate for seamless loop
  const loop = items.length ? [...items, ...items] : [];

  return (
    <section
      id="testimonials"
      data-testid="testimonials-section"
      className="relative py-24 md:py-32 lg:py-40 overflow-hidden"
      style={{
        background: "var(--fi-offwhite)",
        color: "#1A1A1A",
      }}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 mb-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
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
          <div className="flex md:justify-end fi-reveal fi-reveal-delay-2">
            <div className="flex items-center gap-3">
              <div className="flex">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} size={20} className="fi-star" />
                ))}
              </div>
              <div className="text-sm" style={{ color: "#5a5a5a" }}>
                4.7 / 5 · Verified Google Reviews
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Marquee */}
      <div className="relative">
        {/* gradients */}
        <div
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10"
          style={{ background: "linear-gradient(90deg, var(--fi-offwhite), transparent)" }}
        />
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10"
          style={{ background: "linear-gradient(-90deg, var(--fi-offwhite), transparent)" }}
        />
        {loop.length > 0 && (
          <div className="fi-marquee gap-6 px-6">
            {loop.map((t, i) => (
              <article
                key={`${t.id}-${i}`}
                data-testid={`testimonial-card-${i}`}
                className="glass-light shrink-0 p-7 md:p-8"
                style={{
                  width: "min(380px, 78vw)",
                  borderRadius: 4,
                  border: "1px solid rgba(0,0,0,0.06)",
                  boxShadow: "0 10px 40px -20px rgba(22,22,22,0.18)",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex">
                    {Array.from({ length: t.rating || 5 }).map((_, j) => (
                      <Star key={j} size={14} className="fi-star" />
                    ))}
                  </div>
                  <Quote size={26} style={{ color: "rgba(203,161,83,0.35)" }} />
                </div>
                <p
                  className="text-sm md:text-[15px]"
                  style={{ color: "#1A1A1A", lineHeight: 1.7, fontWeight: 300 }}
                >
                  {t.text.length > 280 ? t.text.slice(0, 280) + "…" : t.text}
                </p>
                <div
                  className="mt-6 pt-5 flex items-center justify-between"
                  style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}
                >
                  <div>
                    <div
                      className="font-serif-display"
                      style={{ fontSize: "1.05rem", color: "#1A1A1A" }}
                    >
                      {t.name}
                    </div>
                    <div className="overline mt-1" style={{ color: "#CBA153", fontSize: "0.65rem" }}>
                      {t.is_local_guide ? "Local Guide · " : ""}
                      {t.review_count ? `${t.review_count} reviews` : ""}
                      {t.when ? ` · ${t.when}` : ""}
                    </div>
                  </div>
                  <div
                    className="text-xs uppercase tracking-[0.2em]"
                    style={{ color: "#737373" }}
                  >
                    Google
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
