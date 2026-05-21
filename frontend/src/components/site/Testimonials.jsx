import { useEffect, useState } from "react";
import { Star, Quote } from "lucide-react";
import { api } from "../../lib/api";

export default function Testimonials() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get("/testimonials").then((r) => setItems(r.data || [])).catch(() => {});
    // Mount-only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      id="testimonials"
      data-testid="testimonials-section"
      className="relative py-20 md:py-28 lg:py-32 bg-[var(--bg-default)]"
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end mb-12 md:mb-16">
          <div>
            <div className="overline mb-4 fi-reveal" style={{ color: "var(--accent)" }}>
              In their own words
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
              data-testid="testimonials-heading"
            >
              Real reviews,
              <br />
              <span style={{ color: "var(--accent)" }}>from real Chinar Park clients.</span>
            </h2>
          </div>
          <div className="md:justify-self-end fi-reveal fi-reveal-delay-2">
            <div className="flex items-center gap-3">
              <div className="flex">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star
                    key={i}
                    size={18}
                    style={{ color: "var(--accent)", fill: "var(--accent)" }}
                  />
                ))}
              </div>
              <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
                4.7 / 5 · Verified Google Reviews
              </div>
            </div>
          </div>
        </div>

        {/* Card grid (no marquee — clean minimal grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {items.map((t, i) => (
            <article
              key={t.id}
              data-testid={`testimonial-card-${i}`}
              className="card-minimal fi-reveal p-7"
              style={{ transitionDelay: `${(i % 3) * 0.08}s` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex">
                  {Array.from({ length: t.rating || 5 }).map((_, j) => (
                    <Star
                      key={j}
                      size={14}
                      style={{ color: "var(--accent)", fill: "var(--accent)" }}
                    />
                  ))}
                </div>
                <Quote size={22} style={{ color: "var(--accent)", opacity: 0.4 }} />
              </div>
              <p
                className="text-sm"
                style={{ color: "var(--text-main)", lineHeight: 1.7 }}
              >
                {t.text && t.text.length > 280 ? t.text.slice(0, 280) + "…" : t.text}
              </p>
              <div
                className="mt-5 pt-4 flex items-center justify-between"
                style={{ borderTop: "1px solid var(--border-light)" }}
              >
                <div>
                  <div
                    className="font-display"
                    style={{
                      fontSize: "0.98rem",
                      color: "var(--text-main)",
                      fontWeight: 600,
                    }}
                  >
                    {t.name}
                  </div>
                  <div
                    className="text-xs mt-1"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {t.is_local_guide ? "Local Guide · " : ""}
                    {t.review_count ? `${t.review_count} reviews` : ""}
                    {t.when ? ` · ${t.when}` : ""}
                  </div>
                </div>
                <div
                  className="text-xs uppercase"
                  style={{
                    color: "var(--text-muted)",
                    letterSpacing: "0.15em",
                    fontWeight: 500,
                  }}
                >
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
