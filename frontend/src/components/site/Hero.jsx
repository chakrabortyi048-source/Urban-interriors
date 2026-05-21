import { ArrowRight, ChevronDown } from "lucide-react";

const HERO_IMG =
  "https://customer-assets.emergentagent.com/job_aniket-interiors/artifacts/sxh3shl9_IMG-20260501-WA0025.jpg";

export default function Hero() {
  const go = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      id="hero"
      data-testid="hero-section"
      className="relative w-full bg-[var(--bg-default)]"
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 pt-28 md:pt-32 lg:pt-36 pb-16 md:pb-24 lg:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* TEXT */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div
              className="overline mb-5 fade-in in-view"
              data-testid="hero-overline"
            >
              Urban Interiors · Chinar Park, Kolkata
            </div>

            <h1
              className="font-display fade-in fade-in-delay-1 in-view"
              style={{
                fontSize: "clamp(2.4rem, 5.6vw, 4.6rem)",
                lineHeight: 1.05,
                letterSpacing: "-0.025em",
                color: "var(--text-main)",
                fontWeight: 500,
              }}
              data-testid="hero-headline"
            >
              Spaces that tell
              <br />
              <span style={{ color: "var(--accent)" }}>your story.</span>
            </h1>

            <p
              className="mt-6 max-w-xl fade-in fade-in-delay-2 in-view"
              style={{
                fontSize: "1.05rem",
                lineHeight: 1.7,
                color: "var(--text-secondary)",
                fontWeight: 400,
              }}
              data-testid="hero-subtitle"
            >
              Your one-stop Chinar Park studio for interior painting, bespoke
              furniture, flooring and landscape design — turning houses into
              dream homes.
            </p>

            <div
              className="mt-9 flex flex-wrap items-center gap-4 fade-in fade-in-delay-3 in-view"
            >
              <button
                onClick={() => go("portfolio")}
                data-testid="hero-explore-btn"
                className="btn-primary"
              >
                Explore Our Work
                <ArrowRight size={16} />
              </button>
              <button
                onClick={() => go("contact")}
                data-testid="hero-book-btn"
                className="btn-outline"
              >
                Book a Free Consultation
              </button>
            </div>

            {/* Trust strip */}
            <div
              className="mt-12 grid grid-cols-3 gap-6 max-w-md fade-in fade-in-delay-4 in-view"
              data-testid="hero-trust-strip"
            >
              {[
                ["100+", "Homes delivered"],
                ["10+", "Years of craft"],
                ["4.7★", "On Google"],
              ].map(([n, l]) => (
                <div key={l}>
                  <div
                    className="font-display"
                    style={{
                      fontSize: "1.6rem",
                      color: "var(--text-main)",
                      fontWeight: 600,
                      lineHeight: 1,
                    }}
                  >
                    {n}
                  </div>
                  <div
                    className="mt-2 text-xs"
                    style={{ color: "var(--text-secondary)", lineHeight: 1.4 }}
                  >
                    {l}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* IMAGE */}
          <div
            className="lg:col-span-5 order-1 lg:order-2 fade-in fade-in-delay-1 in-view"
            data-testid="hero-image-frame"
          >
            <div
              className="img-zoom"
              style={{
                aspectRatio: "4 / 5",
                background: "var(--bg-elevated)",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <img
                src={HERO_IMG}
                alt="Urban Interiors — bespoke living room project, Chinar Park, Kolkata"
                className="w-full h-full object-cover"
                loading="eager"
                fetchpriority="high"
                decoding="async"
                data-testid="hero-image"
              />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="flex justify-center mt-12 lg:mt-16">
          <button
            onClick={() => go("about")}
            aria-label="Scroll down"
            data-testid="hero-scroll-down"
            className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
          >
            <ChevronDown size={22} className="animate-bounce" />
          </button>
        </div>
      </div>
    </section>
  );
}
