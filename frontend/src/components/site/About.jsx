import { PaintRoller, Armchair, TreePine, Sprout } from "lucide-react";

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
      className="relative py-24 md:py-32 lg:py-40"
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: text */}
          <div>
            <div className="overline fi-reveal" style={{ color: "#CBA153" }}>
              About the Studio
            </div>
            <h2
              className="font-serif-display fi-reveal fi-reveal-delay-1 mt-5"
              style={{
                fontSize: "clamp(2.2rem, 5vw, 4rem)",
                lineHeight: 1.05,
                color: "#1A1A1A",
              }}
            >
              Transform your space
              <br />
              <span style={{ color: "#CBA153", fontStyle: "italic" }}>
                with Urban Interiors.
              </span>
            </h2>
            <p
              className="mt-7 text-base md:text-lg fi-reveal fi-reveal-delay-2"
              style={{ color: "#3a3a3a", lineHeight: 1.85, fontWeight: 300, maxWidth: "560px" }}
            >
              Transform your space with <strong style={{ color: "#1A1A1A", fontWeight: 500 }}>URBAN INTERIORS</strong>,
              your one-stop destination for all your interior needs. From refreshing coats of
              paint to bespoke furniture and captivating landscape designs, we bring your
              vision to life.
            </p>
            <p
              className="mt-5 text-base fi-reveal fi-reveal-delay-3"
              style={{ color: "#3a3a3a", lineHeight: 1.85, fontWeight: 300, maxWidth: "560px" }}
            >
              Enhance your interiors with our expert floor sanding and polishing services,
              and discover a wide selection of exquisite wood and laminate flooring options.
              Located in Chinar Park, New Town, Kolkata, URBAN INTERIORS delivers
              unparalleled craftsmanship and artistry, turning houses into dream homes.
            </p>

            <div className="grid grid-cols-2 gap-4 mt-12 fi-reveal fi-reveal-delay-4">
              {PILLARS.map((p) => {
                const Icon = p.icon;
                return (
                  <div
                    key={p.label}
                    data-testid={`about-pillar-${p.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                    className="p-5 transition-all duration-500 cursor-pointer-fi"
                    style={{
                      background: "#fff",
                      border: "1px solid rgba(0,0,0,0.06)",
                      borderLeft: "2px solid #CBA153",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 10px 30px -18px rgba(203,161,83,0.45)")}
                    onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
                  >
                    <Icon size={20} style={{ color: "#CBA153" }} />
                    <div
                      className="font-serif-display mt-3"
                      style={{ fontSize: "1.05rem", color: "#1A1A1A", lineHeight: 1.2 }}
                    >
                      {p.label}
                    </div>
                    <div className="text-xs mt-1" style={{ color: "#737373", lineHeight: 1.5 }}>
                      {p.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: 2-image collage */}
          <div
            className="fi-reveal fi-reveal-delay-2 relative"
            data-testid="about-collage"
            style={{ minHeight: "560px" }}
          >
            {/* Gold accent square behind primary */}
            <div
              aria-hidden
              className="absolute hidden md:block"
              style={{
                top: "-18px",
                left: "-18px",
                width: "52%",
                height: "60%",
                border: "1.5px solid #CBA153",
                borderRadius: 2,
                pointerEvents: "none",
              }}
            />

            {/* Primary large image */}
            <div
              className="portfolio-img-wrap relative"
              style={{
                aspectRatio: "4 / 5",
                background: "#1d1d1d",
                width: "100%",
                maxWidth: "480px",
                boxShadow: "0 30px 60px -30px rgba(0,0,0,0.35)",
              }}
            >
              <img
                src={ABOUT_IMG_PRIMARY}
                alt="Urban Interiors — feature wall & modular unit, Chinar Park"
                className="w-full h-full object-cover"
                loading="lazy"
                data-testid="about-collage-primary"
              />
            </div>

            {/* Secondary floating image, offset bottom-right */}
            <div
              className="hidden md:block absolute fi-float-soft"
              style={{
                bottom: "-40px",
                right: "-10px",
                width: "56%",
                aspectRatio: "4 / 5",
                overflow: "hidden",
                background: "#1d1d1d",
                border: "6px solid var(--fi-offwhite)",
                boxShadow: "0 40px 80px -30px rgba(0,0,0,0.5), 0 0 0 1px rgba(203,161,83,0.35)",
                borderRadius: 2,
              }}
            >
              <img
                src={ABOUT_IMG_SECONDARY}
                alt="Urban Interiors — golden floral dining room, Kolkata"
                className="w-full h-full object-cover"
                loading="lazy"
                data-testid="about-collage-secondary"
              />
            </div>

            {/* Mobile fallback: secondary image as stacked card */}
            <div
              className="md:hidden mt-4"
              style={{
                aspectRatio: "4 / 5",
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
            </div>

            {/* Studio note card */}
            <div
              className="hidden lg:block absolute glass-light p-5 max-w-[260px]"
              style={{
                top: "56%",
                left: "-28px",
                borderRadius: 2,
                borderLeft: "2px solid #CBA153",
                zIndex: 5,
              }}
            >
              <div className="overline" style={{ color: "#CBA153" }}>
                Studio Note
              </div>
              <p
                className="mt-3 text-sm"
                style={{ color: "#1A1A1A", lineHeight: 1.6, fontStyle: "italic" }}
              >
                "Unparalleled craftsmanship and artistry — turning houses into dream homes."
              </p>
              <div className="overline mt-3" style={{ color: "#737373" }}>
                — Urban Interiors, Chinar Park
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
