import { PaintRoller, Armchair, TreePine, Sprout } from "lucide-react";

const ABOUT_IMG =
  "https://customer-assets.emergentagent.com/job_aniket-interiors/artifacts/1ix5f5nl_IMG-20260501-WA0023.jpg";

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

          {/* Right: image */}
          <div className="fi-reveal fi-reveal-delay-2 relative">
            <div
              className="portfolio-img-wrap"
              style={{
                aspectRatio: "4 / 5",
                background: "#1d1d1d",
              }}
            >
              <img
                src={ABOUT_IMG}
                alt="Urban Interiors — a recent project in Chinar Park, Kolkata"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div
              className="hidden md:block absolute -bottom-8 -left-8 glass-light p-6 max-w-[280px]"
              style={{ borderRadius: 2 }}
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
              <div className="overline mt-4" style={{ color: "#737373" }}>
                — Urban Interiors, Chinar Park
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
