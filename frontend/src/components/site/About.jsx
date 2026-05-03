import { PaintRoller, Armchair, TreePine, Sprout, Quote } from "lucide-react";
import SplitHeading, { SpreadOverline, CharReveal } from "./SplitHeading";

const ABOUT_IMG_PRIMARY =
  "https://customer-assets.emergentagent.com/job_aniket-interiors/artifacts/faxinqkk_IMG-20260501-WA0024.jpg";
const ABOUT_IMG_SECONDARY =
  "https://customer-assets.emergentagent.com/job_aniket-interiors/artifacts/yn5jsg0d_Screenshot_2026-04-30_175818.jpg";

const PILLARS = [
  { icon: PaintRoller, label: "Interior Painting", desc: "Refreshing coats that set the mood." },
  { icon: Armchair, label: "Bespoke Furniture", desc: "Made-to-measure, made to last." },
  { icon: TreePine, label: "Wood & Laminate Flooring", desc: "Sanding, polishing and fresh laminates." },
  { icon: Sprout, label: "Landscape Design", desc: "Green, calm spaces inside and out." },
];

export default function About() {
  return (
    <section
      id="about"
      data-testid="about-section"
      style={{ background: "var(--fi-offwhite)" }}
      className="relative py-24 md:py-32 lg:py-40 overflow-hidden"
    >
      {/* Subtle gold grain texture */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 80% 10%, rgba(203,161,83,0.06) 0%, rgba(203,161,83,0) 40%)",
        }}
      />

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 relative">
        {/* Top: overline */}
        <div className="mb-8">
          <SpreadOverline text="About the Studio" style={{ color: "#CBA153" }} />
        </div>

        {/* Hero of the section: heading interlocked with images */}
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Heading column — lives on the left, but visually breaks into images on lg */}
          <div className="lg:col-span-5 relative z-20 lg:pt-10">
            <SplitHeading
              primary="Transform your space"
              accent="with Urban Interiors."
              className="font-serif-display"
              style={{
                fontSize: "clamp(2.2rem, 5vw, 4rem)",
                lineHeight: 1.05,
                color: "#1A1A1A",
              }}
              testId="about-heading"
            />

            {/* Gold underline shimmer */}
            <div
              className="mt-6 fi-reveal"
              style={{
                height: "2px",
                width: "120px",
                background:
                  "linear-gradient(90deg, #CBA153 0%, rgba(203,161,83,0.2) 100%)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                className="absolute inset-0 fi-shimmer"
                style={{ mixBlendMode: "screen" }}
              />
            </div>
          </div>

          {/* Image collage column — 2 layered images with text overlays "inside" them */}
          <div
            className="lg:col-span-7 relative"
            data-testid="about-collage"
            style={{ minHeight: "640px" }}
          >
            {/* Gold accent frame behind primary */}
            <div
              aria-hidden
              className="absolute hidden md:block"
              style={{
                top: "-22px",
                right: "-22px",
                width: "60%",
                height: "55%",
                border: "1.5px solid #CBA153",
                borderRadius: 2,
                pointerEvents: "none",
                zIndex: 0,
              }}
            />

            {/* PRIMARY IMAGE — top-right */}
            <div
              className="portfolio-img-wrap relative ml-auto fi-reveal"
              style={{
                aspectRatio: "4 / 5",
                background: "#1d1d1d",
                width: "min(78%, 460px)",
                boxShadow: "0 30px 60px -28px rgba(0,0,0,0.4)",
                zIndex: 1,
              }}
            >
              <img
                src={ABOUT_IMG_PRIMARY}
                alt="Urban Interiors — feature wall & modular unit, Chinar Park"
                className="w-full h-full object-cover"
                loading="lazy"
                data-testid="about-collage-primary"
              />

              {/* Bottom dark gradient on primary image for text legibility */}
              <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-[55%] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.85) 100%)",
                }}
              />

              {/* TEXT OVERLAY ON PRIMARY: body paragraph + tag */}
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-7 z-10">
                <div
                  className="overline mb-3"
                  style={{ color: "#E9C57A", letterSpacing: "0.32em" }}
                >
                  Our Promise
                </div>
                <CharReveal
                  text="From refreshing coats of paint to bespoke furniture and captivating landscape designs — we bring your vision to life."
                  as="p"
                  className="font-serif-display"
                  style={{
                    color: "#F9F8F6",
                    fontSize: "0.98rem",
                    lineHeight: 1.55,
                    fontStyle: "italic",
                    fontWeight: 300,
                    textShadow: "0 2px 14px rgba(0,0,0,0.5)",
                  }}
                  staggerMs={8}
                  baseDelayMs={200}
                  testId="about-overlay-primary"
                />
              </div>
            </div>

            {/* SECONDARY IMAGE — bottom-left, overlaps primary */}
            <div
              className="absolute fi-reveal fi-reveal-delay-2 fi-float-soft hidden md:block"
              style={{
                bottom: "-30px",
                left: "0",
                width: "62%",
                aspectRatio: "5 / 6",
                overflow: "hidden",
                background: "#1d1d1d",
                border: "8px solid var(--fi-offwhite)",
                boxShadow:
                  "0 50px 100px -30px rgba(0,0,0,0.55), 0 0 0 1px rgba(203,161,83,0.4)",
                borderRadius: 2,
                zIndex: 2,
              }}
            >
              <img
                src={ABOUT_IMG_SECONDARY}
                alt="Urban Interiors — golden floral dining room, Kolkata"
                className="w-full h-full object-cover"
                loading="lazy"
                data-testid="about-collage-secondary"
              />

              {/* Top dark gradient on secondary */}
              <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-[45%] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)",
                }}
              />

              {/* TEXT OVERLAY ON SECONDARY: studio note (top) */}
              <div className="absolute inset-x-0 top-0 p-5 md:p-6 z-10">
                <div
                  className="overline mb-2"
                  style={{ color: "#E9C57A", letterSpacing: "0.32em" }}
                >
                  Studio Note
                </div>
                <p
                  className="font-serif-display"
                  style={{
                    color: "#F9F8F6",
                    fontSize: "0.92rem",
                    lineHeight: 1.5,
                    maxWidth: "320px",
                    textShadow: "0 1px 10px rgba(0,0,0,0.6)",
                  }}
                >
                  Located in Chinar Park · Kolkata
                </p>
              </div>

              {/* Bottom glass quote card on secondary */}
              <div
                className="absolute left-4 right-4 bottom-4 fi-glass-dark p-4 md:p-5 z-10"
                style={{ borderRadius: 2 }}
              >
                <Quote size={16} style={{ color: "#E9C57A" }} />
                <p
                  className="mt-2 text-sm"
                  style={{
                    color: "#F5EFE2",
                    lineHeight: 1.55,
                    fontStyle: "italic",
                    fontWeight: 300,
                  }}
                >
                  Unparalleled craftsmanship and artistry — turning houses into dream homes.
                </p>
              </div>
            </div>

            {/* Mobile fallback secondary image (stacked under primary) */}
            <div
              className="md:hidden relative mt-6"
              style={{
                aspectRatio: "5 / 6",
                overflow: "hidden",
                background: "#1d1d1d",
                border: "4px solid var(--fi-offwhite)",
                boxShadow: "0 20px 40px -20px rgba(0,0,0,0.35)",
              }}
            >
              <img
                src={ABOUT_IMG_SECONDARY}
                alt="Urban Interiors — golden floral dining room, Kolkata"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div
                className="absolute left-3 right-3 bottom-3 fi-glass-dark p-4"
                style={{ borderRadius: 2 }}
              >
                <Quote size={14} style={{ color: "#E9C57A" }} />
                <p
                  className="mt-1 text-xs"
                  style={{ color: "#F5EFE2", lineHeight: 1.55, fontStyle: "italic" }}
                >
                  Unparalleled craftsmanship — turning houses into dream homes.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pillars — full width below */}
        <div
          className="mt-20 md:mt-28 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 fi-reveal fi-reveal-delay-3"
          data-testid="about-pillars"
        >
          {PILLARS.map((p, i) => {
            const Icon = p.icon;
            return (
              <div
                key={p.label}
                data-testid={`about-pillar-${p.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                className="p-6 transition-all duration-500 cursor-pointer-fi fi-reveal"
                style={{
                  background: "#fff",
                  border: "1px solid rgba(0,0,0,0.06)",
                  borderLeft: "2px solid #CBA153",
                  transitionDelay: `${0.2 + i * 0.08}s`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 18px 40px -22px rgba(203,161,83,0.5)";
                  e.currentTarget.style.transform = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <Icon size={22} style={{ color: "#CBA153" }} />
                <div
                  className="font-serif-display mt-4"
                  style={{ fontSize: "1.1rem", color: "#1A1A1A", lineHeight: 1.2 }}
                >
                  {p.label}
                </div>
                <div className="text-xs mt-1.5" style={{ color: "#737373", lineHeight: 1.5 }}>
                  {p.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
