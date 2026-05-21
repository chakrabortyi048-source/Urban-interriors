import { PaintRoller, Armchair, TreePine, Sprout } from "lucide-react";

const ABOUT_IMG =
  "https://customer-assets.emergentagent.com/job_aniket-interiors/artifacts/milhfp56_Screenshot_2026-04-30_175818.jpg";

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
      className="relative w-full bg-[var(--bg-default)] py-20 md:py-28 lg:py-32"
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* IMAGE */}
          <div className="lg:col-span-6 fi-reveal" data-testid="about-image-frame">
            <div
              className="img-zoom"
              style={{
                aspectRatio: "1 / 1",
                borderRadius: "4px",
                overflow: "hidden",
                background: "var(--bg-elevated)",
              }}
            >
              <img
                src={ABOUT_IMG}
                alt="Urban Interiors — dining room project in Chinar Park, Kolkata"
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
                data-testid="about-bg-image"
              />
            </div>
          </div>

          {/* TEXT */}
          <div className="lg:col-span-6">
            <div className="overline mb-5 fi-reveal" style={{ color: "var(--accent)" }}>
              About the Studio
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
              data-testid="about-heading"
            >
              Transform your space with
              <br />
              <span style={{ color: "var(--accent)" }}>Urban Interiors.</span>
            </h2>

            <p
              className="mt-6 fi-reveal fi-reveal-delay-2"
              style={{
                color: "var(--text-secondary)",
                fontSize: "1.05rem",
                lineHeight: 1.75,
                fontWeight: 400,
                maxWidth: "560px",
              }}
              data-testid="about-body-1"
            >
              Your one-stop destination for all your interior needs. From refreshing
              coats of paint to bespoke furniture and captivating landscape designs,
              we bring your vision to life.
            </p>

            <p
              className="mt-4 fi-reveal fi-reveal-delay-3"
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.98rem",
                lineHeight: 1.75,
                fontWeight: 400,
                maxWidth: "560px",
              }}
              data-testid="about-body-2"
            >
              Located in Chinar Park, New Town, Kolkata — unparalleled craftsmanship
              and artistry, turning houses into dream homes.
            </p>
          </div>
        </div>

        {/* PILLARS — clean card grid */}
        <div
          className="mt-16 md:mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 fi-reveal fi-reveal-delay-2"
          data-testid="about-pillars"
        >
          {PILLARS.map((p) => {
            const Icon = p.icon;
            const slug = p.label.toLowerCase().replace(/[^a-z]+/g, "-");
            return (
              <div
                key={p.label}
                data-testid={`about-pillar-${slug}`}
                className="card-minimal p-5 md:p-6"
              >
                <div
                  className="w-10 h-10 flex items-center justify-center"
                  style={{
                    background: "var(--accent-soft)",
                    color: "var(--accent)",
                    borderRadius: "2px",
                  }}
                >
                  <Icon size={18} strokeWidth={1.6} />
                </div>
                <div
                  className="font-display mt-4"
                  style={{
                    fontSize: "1.02rem",
                    color: "var(--text-main)",
                    fontWeight: 600,
                    lineHeight: 1.3,
                  }}
                >
                  {p.label}
                </div>
                <div
                  className="text-xs mt-2"
                  style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}
                >
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
