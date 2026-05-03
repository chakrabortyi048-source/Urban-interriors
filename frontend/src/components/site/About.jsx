import { useEffect, useRef, useState } from "react";
import { PaintRoller, Armchair, TreePine, Sprout } from "lucide-react";
import SplitHeading, { SpreadOverline } from "./SplitHeading";

const ABOUT_BG =
  "https://customer-assets.emergentagent.com/job_aniket-interiors/artifacts/milhfp56_Screenshot_2026-04-30_175818.jpg";

const PILLARS = [
  { icon: PaintRoller, label: "Interior Painting", desc: "Refreshing coats that set the mood." },
  { icon: Armchair, label: "Bespoke Furniture", desc: "Made-to-measure, made to last." },
  { icon: TreePine, label: "Wood & Laminate Flooring", desc: "Sanding, polishing and fresh laminates." },
  { icon: Sprout, label: "Landscape Design", desc: "Green, calm spaces inside and out." },
];

/**
 * Hook — adds .in-view when element enters viewport (for 3D entrance).
 */
function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setInView(true);
            io.unobserve(e.target);
          }
        });
      },
      { threshold, rootMargin: "0px 0px -80px 0px" }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, inView];
}

export default function About() {
  // Subtle parallax on the background image as user scrolls the section
  const sectionRef = useRef(null);
  const [bgY, setBgY] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      // progress: 0 when section enters bottom of viewport, 1 when it fully leaves top
      const vh = window.innerHeight;
      const p = Math.max(0, Math.min(1, (vh - rect.top) / (vh + rect.height)));
      setBgY((p - 0.5) * 80); // -40 .. +40 px
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [headRef, headIn] = useInView(0.25);
  const [bodyRef, bodyIn] = useInView(0.25);
  const [pillarsRef, pillarsIn] = useInView(0.15);

  return (
    <section
      id="about"
      data-testid="about-section"
      ref={sectionRef}
      className="relative overflow-hidden fi-3d-stage"
      style={{
        minHeight: "110vh",
        background: "#0e0e0e",
      }}
    >
      {/* Full-bleed background image */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          transform: `translate3d(0, ${bgY}px, 0) scale(1.05)`,
          transition: "transform 0.08s linear",
          willChange: "transform",
        }}
      >
        <img
          src={ABOUT_BG}
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
          data-testid="about-bg-image"
        />
      </div>

      {/* Cinematic vignette + color grade for text legibility */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 30% 50%, rgba(10,10,10,0.30) 0%, rgba(10,10,10,0.55) 45%, rgba(10,10,10,0.82) 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-40 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,10,10,0.75) 0%, rgba(10,10,10,0) 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-56 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,10,10,0) 0%, rgba(10,10,10,0.85) 100%)",
        }}
      />

      {/* Decorative gold particles (subtle depth dots) */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <span
          className="absolute fi-float3d-c"
          style={{
            top: "18%", left: "12%",
            width: "6px", height: "6px", borderRadius: "50%",
            background: "#E9C57A",
            boxShadow: "0 0 24px rgba(233,197,122,0.9), 0 0 60px rgba(203,161,83,0.55)",
            opacity: 0.8,
          }}
        />
        <span
          className="absolute fi-float3d-d"
          style={{
            top: "32%", right: "16%",
            width: "4px", height: "4px", borderRadius: "50%",
            background: "#F5E0A8",
            boxShadow: "0 0 18px rgba(245,224,168,0.85), 0 0 50px rgba(203,161,83,0.5)",
            opacity: 0.75,
          }}
        />
        <span
          className="absolute fi-float3d-b"
          style={{
            bottom: "24%", left: "40%",
            width: "5px", height: "5px", borderRadius: "50%",
            background: "#CBA153",
            boxShadow: "0 0 20px rgba(203,161,83,0.85), 0 0 50px rgba(203,161,83,0.5)",
            opacity: 0.7,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 pt-24 md:pt-32 lg:pt-40 pb-24 md:pb-32 lg:pb-40 fi-3d-stage">
        {/* Overline */}
        <div className="mb-8 fi-3d-layer fi-float3d-d">
          <SpreadOverline
            text="About the Studio"
            style={{ color: "#E9C57A", textShadow: "0 1px 18px rgba(0,0,0,0.6)" }}
          />
        </div>

        {/* Main heading — floats in 3D */}
        <div
          ref={headRef}
          className={`fi-3d-layer fi-float3d-a fi-3d-in ${headIn ? "in-view" : ""}`}
          style={{ maxWidth: "1100px" }}
        >
          <SplitHeading
            primary="Transform your space"
            accent="with Urban Interiors."
            className="font-serif-display fi-text-3d-glow"
            style={{
              fontSize: "clamp(2.4rem, 6.2vw, 5.5rem)",
              lineHeight: 1.04,
              letterSpacing: "-0.01em",
              color: "#F9F8F6",
            }}
            testId="about-heading"
          />
        </div>

        {/* Gold accent line */}
        <div
          className="mt-8 fi-gold-sweep"
          style={{
            height: "2px",
            width: "clamp(120px, 18vw, 220px)",
            background:
              "linear-gradient(90deg, rgba(203,161,83,0) 0%, #CBA153 20%, #E9C57A 60%, #CBA153 100%)",
            boxShadow: "0 0 24px rgba(203,161,83,0.5)",
          }}
        />

        {/* Body paragraph — separate 3D float */}
        <div
          ref={bodyRef}
          className={`mt-10 md:mt-14 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 fi-3d-in ${bodyIn ? "in-view" : ""}`}
        >
          <div className="lg:col-span-7 fi-3d-layer fi-float3d-b">
            <p
              className="font-serif-display"
              style={{
                color: "rgba(249,248,246,0.95)",
                fontSize: "clamp(1.05rem, 1.6vw, 1.35rem)",
                lineHeight: 1.75,
                fontStyle: "italic",
                fontWeight: 300,
                textShadow: "0 2px 18px rgba(0,0,0,0.6)",
                maxWidth: "640px",
              }}
              data-testid="about-body-1"
            >
              Transform your space with{" "}
              <span className="fi-text-3d-gold" style={{ fontStyle: "normal", fontWeight: 500 }}>
                URBAN INTERIORS
              </span>
              , your one-stop destination for all your interior needs. From refreshing
              coats of paint to bespoke furniture and captivating landscape designs,
              we bring your vision to life.
            </p>
            <p
              className="mt-6"
              style={{
                color: "rgba(249,248,246,0.78)",
                fontSize: "0.98rem",
                lineHeight: 1.85,
                fontWeight: 300,
                textShadow: "0 2px 12px rgba(0,0,0,0.55)",
                maxWidth: "600px",
              }}
              data-testid="about-body-2"
            >
              Enhance your interiors with our expert floor sanding and polishing services,
              and discover a wide selection of exquisite wood and laminate flooring options.
              Located in Chinar Park, New Town, Kolkata — unparalleled craftsmanship
              and artistry, turning houses into dream homes.
            </p>
          </div>

          {/* Floating quote card — upper right, another 3D layer */}
          <div className="lg:col-span-5 relative">
            <div
              className="fi-3d-layer fi-float3d-c"
              style={{
                background: "rgba(18, 15, 12, 0.55)",
                backdropFilter: "blur(18px) saturate(140%)",
                WebkitBackdropFilter: "blur(18px) saturate(140%)",
                border: "1px solid rgba(203,161,83,0.4)",
                borderLeft: "2px solid #CBA153",
                padding: "1.75rem 1.75rem",
                boxShadow:
                  "0 30px 80px -30px rgba(0,0,0,0.7), 0 0 0 1px rgba(203,161,83,0.12)",
                maxWidth: "420px",
                marginLeft: "auto",
              }}
            >
              <div
                className="overline"
                style={{
                  color: "#E9C57A",
                  letterSpacing: "0.34em",
                  fontSize: "0.68rem",
                }}
              >
                Studio Note
              </div>
              <p
                className="font-serif-display mt-4"
                style={{
                  color: "#F5EFE2",
                  fontSize: "1.05rem",
                  lineHeight: 1.6,
                  fontStyle: "italic",
                  fontWeight: 300,
                }}
              >
                "Unparalleled craftsmanship and artistry — turning houses into dream homes."
              </p>
              <div
                className="overline mt-5"
                style={{
                  color: "rgba(249,248,246,0.55)",
                  letterSpacing: "0.32em",
                  fontSize: "0.66rem",
                }}
              >
                — Urban Interiors, Chinar Park
              </div>
            </div>
          </div>
        </div>

        {/* Pillars — glass cards floating on 3D plane */}
        <div
          ref={pillarsRef}
          className={`mt-16 md:mt-24 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 fi-3d-in ${pillarsIn ? "in-view" : ""}`}
          data-testid="about-pillars"
        >
          {PILLARS.map((p, i) => {
            const Icon = p.icon;
            const floatClass = ["fi-float3d-b", "fi-float3d-c", "fi-float3d-d", "fi-float3d-a"][i % 4];
            return (
              <div
                key={p.label}
                data-testid={`about-pillar-${p.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                className={`fi-3d-layer ${floatClass} p-5 md:p-6 transition-all duration-500 cursor-pointer-fi`}
                style={{
                  background: "rgba(18, 15, 12, 0.55)",
                  backdropFilter: "blur(16px) saturate(140%)",
                  WebkitBackdropFilter: "blur(16px) saturate(140%)",
                  border: "1px solid rgba(203,161,83,0.28)",
                  borderLeft: "2px solid #CBA153",
                  boxShadow:
                    "0 24px 60px -30px rgba(0,0,0,0.6), 0 0 0 1px rgba(203,161,83,0.1)",
                  animationDelay: `${i * 0.4}s`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 30px 80px -28px rgba(203,161,83,0.45), 0 0 0 1px rgba(203,161,83,0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 24px 60px -30px rgba(0,0,0,0.6), 0 0 0 1px rgba(203,161,83,0.1)";
                }}
              >
                <div
                  className="w-10 h-10 flex items-center justify-center"
                  style={{
                    border: "1px solid rgba(203,161,83,0.5)",
                    color: "#E9C57A",
                    borderRadius: 2,
                    background: "rgba(203,161,83,0.08)",
                  }}
                >
                  <Icon size={18} strokeWidth={1.5} />
                </div>
                <div
                  className="font-serif-display mt-4"
                  style={{
                    fontSize: "1.08rem",
                    color: "#F9F8F6",
                    lineHeight: 1.2,
                    textShadow: "0 1px 8px rgba(0,0,0,0.5)",
                  }}
                >
                  {p.label}
                </div>
                <div
                  className="text-xs mt-1.5"
                  style={{
                    color: "rgba(249,248,246,0.65)",
                    lineHeight: 1.55,
                  }}
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
