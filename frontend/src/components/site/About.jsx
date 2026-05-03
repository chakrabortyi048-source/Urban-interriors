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

/** IntersectionObserver hook — fires once when element enters viewport. */
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
  const sectionRef = useRef(null);
  const [bgY, setBgY] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    const apply = () => setIsMobile(mql.matches);
    apply();
    mql.addEventListener?.("change", apply);
    return () => mql.removeEventListener?.("change", apply);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.max(0, Math.min(1, (vh - rect.top) / (vh + rect.height)));
      setBgY((p - 0.5) * 60);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    if (!mq.matches) return;
    let raf = 0;
    const onMove = (e) => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      if (
        e.clientY < rect.top ||
        e.clientY > rect.bottom ||
        e.clientX < rect.left ||
        e.clientX > rect.right
      )
        return;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const nx = (e.clientX - cx) / (rect.width / 2);
      const ny = (e.clientY - cy) / (rect.height / 2);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setTilt({ x: nx, y: ny }));
    };
    const onLeave = () => setTilt({ x: 0, y: 0 });
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  const [headRef, headIn] = useInView(0.2);
  const [bodyRef, bodyIn] = useInView(0.15);
  const [pillarsRef, pillarsIn] = useInView(0.1);

  const headTilt = {
    transform: `translate3d(${tilt.x * -10}px, ${tilt.y * -6}px, 0) rotateX(${tilt.y * -3}deg) rotateY(${tilt.x * 4}deg)`,
    transition: "transform 0.5s cubic-bezier(0.22,1,0.36,1)",
  };
  const bgTransform = {
    transform: `translate3d(${tilt.x * 22}px, ${bgY + tilt.y * 14}px, 0) scale(${isMobile ? 1 : 1.06})`,
    transition: "transform 0.4s cubic-bezier(0.22,1,0.36,1)",
    willChange: "transform",
  };

  return (
    <section
      id="about"
      data-testid="about-section"
      ref={sectionRef}
      className="relative overflow-hidden fi-3d-stage"
      style={{
        background: "#0e0e0e",
        // Section is sized so the square image fits fully on mobile (100vw)
        // plus room for text; desktop stays tall & immersive.
        minHeight: isMobile ? "calc(100vw + 680px)" : "110vh",
      }}
    >
      {/* Full-bleed background image.
          Mobile: object-contain anchored to top so the whole square image is visible.
          Desktop: object-cover for cinematic full-bleed. */}
      <div aria-hidden className="absolute inset-0" style={bgTransform}>
        <img
          src={ABOUT_BG}
          alt=""
          className="w-full h-full object-contain md:object-cover"
          style={{
            objectPosition: isMobile ? "center top" : "center center",
          }}
          loading="lazy"
          decoding="async"
          data-testid="about-bg-image"
        />
      </div>

      {/* On mobile the image ends around top = 100vw; gradient fades it into black */}
      <div
        aria-hidden
        className="md:hidden absolute inset-x-0 pointer-events-none"
        style={{
          top: "calc(100vw - 120px)",
          height: "180px",
          background:
            "linear-gradient(180deg, rgba(14,14,14,0) 0%, rgba(14,14,14,0.75) 60%, #0e0e0e 100%)",
        }}
      />
      {/* Subtle top fade on mobile for navbar legibility */}
      <div
        aria-hidden
        className="md:hidden absolute inset-x-0 top-0 h-20 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(14,14,14,0.75) 0%, rgba(14,14,14,0) 100%)",
        }}
      />

      {/* Desktop cinematic vignette + grade */}
      <div
        aria-hidden
        className="hidden md:block absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 30% 50%, rgba(10,10,10,0.30) 0%, rgba(10,10,10,0.55) 45%, rgba(10,10,10,0.82) 100%)",
        }}
      />
      <div
        aria-hidden
        className="hidden md:block absolute inset-x-0 top-0 h-40 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,10,10,0.75) 0%, rgba(10,10,10,0) 100%)",
        }}
      />
      <div
        aria-hidden
        className="hidden md:block absolute inset-x-0 bottom-0 h-56 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,10,10,0) 0%, rgba(10,10,10,0.85) 100%)",
        }}
      />

      {/* Gold particles */}
      <div aria-hidden className="hidden md:block absolute inset-0 pointer-events-none">
        <span
          className="absolute fi-float3d-c"
          style={{
            top: "18%", left: "12%", width: "6px", height: "6px", borderRadius: "50%",
            background: "#E9C57A",
            boxShadow: "0 0 24px rgba(233,197,122,0.9), 0 0 60px rgba(203,161,83,0.55)",
            opacity: 0.8,
          }}
        />
        <span
          className="absolute fi-float3d-d"
          style={{
            top: "32%", right: "16%", width: "4px", height: "4px", borderRadius: "50%",
            background: "#F5E0A8",
            boxShadow: "0 0 18px rgba(245,224,168,0.85), 0 0 50px rgba(203,161,83,0.5)",
            opacity: 0.75,
          }}
        />
        <span
          className="absolute fi-float3d-b"
          style={{
            bottom: "24%", left: "40%", width: "5px", height: "5px", borderRadius: "50%",
            background: "#CBA153",
            boxShadow: "0 0 20px rgba(203,161,83,0.85), 0 0 50px rgba(203,161,83,0.5)",
            opacity: 0.7,
          }}
        />
      </div>

      {/* Content layer.
          On mobile: text starts *after* the image area (top padding = 100vw + ~40px)
          On desktop: text sits inside image (top padding normal). */}
      <div
        className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 pb-20 md:pb-32 lg:pb-40 fi-3d-stage"
        style={{
          paddingTop: isMobile ? "calc(100vw + 32px)" : undefined,
        }}
      >
        {/* Overline */}
        <div className="mb-6 md:mb-8 fi-3d-layer fi-float3d-d">
          <SpreadOverline
            text="About the Studio"
            style={{ color: "#E9C57A", textShadow: "0 1px 18px rgba(0,0,0,0.6)" }}
          />
        </div>

        {/* Heading */}
        <div
          ref={headRef}
          className={`fi-3d-layer fi-float3d-a fi-3d-in ${headIn ? "in-view" : ""}`}
          style={{ maxWidth: "1100px" }}
        >
          <div style={!isMobile ? headTilt : undefined}>
            <SplitHeading
              primary="Transform your space"
              accent="with Urban Interiors."
              className="font-serif-display fi-text-3d-glow"
              style={{
                fontSize: "clamp(2rem, 6.2vw, 5.5rem)",
                lineHeight: 1.04,
                letterSpacing: "-0.01em",
                color: "#F9F8F6",
              }}
              testId="about-heading"
            />
          </div>
        </div>

        {/* Gold line */}
        <div
          className="mt-6 md:mt-8 fi-gold-sweep"
          style={{
            height: "2px",
            width: "clamp(100px, 18vw, 220px)",
            background:
              "linear-gradient(90deg, rgba(203,161,83,0) 0%, #CBA153 20%, #E9C57A 60%, #CBA153 100%)",
            boxShadow: "0 0 24px rgba(203,161,83,0.5)",
          }}
        />

        {/* Body + studio note */}
        <div
          ref={bodyRef}
          className={`mt-8 md:mt-14 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 fi-3d-in ${bodyIn ? "in-view" : ""}`}
        >
          <div className="lg:col-span-7 fi-3d-layer fi-float3d-b">
            <p
              className="font-serif-display fi-glow-text"
              style={{
                color: "rgba(249,248,246,0.95)",
                fontSize: "clamp(1rem, 1.6vw, 1.35rem)",
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
              className="mt-5 md:mt-6 fi-glow-text"
              style={{
                color: "rgba(249,248,246,0.78)",
                fontSize: "0.95rem",
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

          <div className="lg:col-span-5 relative">
            <div
              className="fi-3d-layer fi-float3d-c"
              style={{
                background: "rgba(18, 15, 12, 0.55)",
                backdropFilter: "blur(18px) saturate(140%)",
                WebkitBackdropFilter: "blur(18px) saturate(140%)",
                border: "1px solid rgba(203,161,83,0.4)",
                borderLeft: "2px solid #CBA153",
                padding: "1.5rem 1.5rem",
                boxShadow:
                  "0 30px 80px -30px rgba(0,0,0,0.7), 0 0 0 1px rgba(203,161,83,0.12)",
                maxWidth: "420px",
                marginLeft: "auto",
                ...(!isMobile && (tilt.x || tilt.y)
                  ? {
                      transform: `translate3d(${tilt.x * -18}px, ${tilt.y * -12}px, 0) rotateX(${tilt.y * 2}deg) rotateY(${tilt.x * -3}deg)`,
                      transition: "transform 0.5s cubic-bezier(0.22,1,0.36,1)",
                    }
                  : {}),
              }}
            >
              <div
                className="overline"
                style={{ color: "#E9C57A", letterSpacing: "0.34em", fontSize: "0.68rem" }}
              >
                Studio Note
              </div>
              <p
                className="font-serif-display mt-4"
                style={{
                  color: "#F5EFE2",
                  fontSize: "1rem",
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

        {/* Pillars */}
        <div
          ref={pillarsRef}
          className={`mt-12 md:mt-24 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 fi-3d-in ${pillarsIn ? "in-view" : ""}`}
          data-testid="about-pillars"
        >
          {PILLARS.map((p, i) => {
            const Icon = p.icon;
            const floatClass = ["fi-float3d-b", "fi-float3d-c", "fi-float3d-d", "fi-float3d-a"][i % 4];
            const tiltMult = [1, -1, 1.2, -1.2][i % 4];
            return (
              <div
                key={p.label}
                data-testid={`about-pillar-${p.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                className={`fi-3d-layer ${floatClass} p-4 md:p-6 transition-all duration-500 cursor-pointer-fi`}
                style={{
                  background: "rgba(18, 15, 12, 0.55)",
                  backdropFilter: "blur(16px) saturate(140%)",
                  WebkitBackdropFilter: "blur(16px) saturate(140%)",
                  border: "1px solid rgba(203,161,83,0.28)",
                  borderLeft: "2px solid #CBA153",
                  boxShadow:
                    "0 24px 60px -30px rgba(0,0,0,0.6), 0 0 0 1px rgba(203,161,83,0.1)",
                  animationDelay: `${i * 0.4}s`,
                  ...(!isMobile && (tilt.x || tilt.y)
                    ? {
                        transform: `translate3d(${tilt.x * 10 * tiltMult}px, ${tilt.y * 7 * tiltMult}px, 0) rotateX(${tilt.y * -1.5}deg) rotateY(${tilt.x * 2 * tiltMult}deg)`,
                        transition: "transform 0.5s cubic-bezier(0.22,1,0.36,1), box-shadow 0.4s ease",
                      }
                    : {}),
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
                  className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center"
                  style={{
                    border: "1px solid rgba(203,161,83,0.5)",
                    color: "#E9C57A",
                    borderRadius: 2,
                    background: "rgba(203,161,83,0.08)",
                  }}
                >
                  <Icon size={16} strokeWidth={1.5} />
                </div>
                <div
                  className="font-serif-display mt-3 md:mt-4"
                  style={{
                    fontSize: "0.98rem",
                    color: "#F9F8F6",
                    lineHeight: 1.2,
                    textShadow: "0 1px 8px rgba(0,0,0,0.5)",
                  }}
                >
                  {p.label}
                </div>
                <div
                  className="text-[11px] md:text-xs mt-1.5"
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
