import { useEffect, useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";

const HERO_IMG =
  "https://customer-assets.emergentagent.com/job_aniket-interiors/artifacts/sxh3shl9_IMG-20260501-WA0025.jpg";

const SUBTITLE =
  "Your one-stop Chinar Park studio for interior painting, bespoke furniture, flooring, and captivating landscape designs — turning houses into dream homes.";

const SIDE_TEXT = "PAINTING · FURNITURE · FLOORING · LANDSCAPE";

export default function Hero() {
  const [parallaxY, setParallaxY] = useState(0);

  useEffect(() => {
    const onScroll = () => setParallaxY(window.scrollY * 0.25);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const headline = ["Spaces", "That", "Tell", "Your", "Story."];

  return (
    <section
      id="hero"
      data-testid="hero-section"
      className="relative min-h-screen w-full overflow-hidden fi-hero3d-stage"
      style={{ background: "#0c0c0c" }}
    >
      {/* MOBILE bg */}
      <div
        aria-hidden
        className="md:hidden absolute inset-0"
        style={{ transform: `translate3d(0, ${parallaxY}px, 0)` }}
      >
        <img
          src={HERO_IMG}
          alt=""
          className="w-full h-full object-cover"
          loading="eager"
          fetchpriority="high"
          decoding="async"
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(12,12,12,0.55) 0%, rgba(12,12,12,0.15) 30%, rgba(12,12,12,0.75) 100%)",
          }}
        />
      </div>

      {/* DESKTOP bg — warm radial */}
      <div
        aria-hidden
        className="hidden md:block absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 25% 40%, rgba(60,40,25,0.45) 0%, rgba(20,16,12,0.95) 55%, #0a0a0a 100%)",
        }}
      />

      {/* Soft gold blobs */}
      <div aria-hidden className="hidden md:block absolute pointer-events-none"
        style={{ top: "20%", left: "-100px", width: "300px", height: "300px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(203,161,83,0.18) 0%, rgba(203,161,83,0) 70%)",
          filter: "blur(40px)" }} />
      <div aria-hidden className="hidden md:block absolute pointer-events-none"
        style={{ bottom: "10%", right: "10%", width: "400px", height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(203,161,83,0.12) 0%, rgba(203,161,83,0) 70%)",
          filter: "blur(50px)" }} />

      <div className="relative z-10 min-h-screen max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 py-24 md:py-0">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 min-h-screen items-center">
          {/* TEXT */}
          <div className="md:col-span-7 md:pr-6 lg:pr-12 order-2 md:order-1">
            <div
              className="overline mb-7"
              style={{
                color: "#E9C57A",
                animation: "fi-letter-cascade 0.9s 0.1s cubic-bezier(0.22,1,0.36,1) backwards",
                textShadow: "0 0 20px rgba(203,161,83,0.4)",
              }}
              data-testid="hero-overline"
            >
              <span style={{ display: "inline-block", letterSpacing: "0.4em" }}>
                Kolkata · Chinar Park
              </span>
            </div>

            <div
              className="fi-gold-sweep mb-6"
              data-testid="hero-gold-accent"
              style={{
                height: "2px",
                width: "clamp(80px, 12vw, 160px)",
                background:
                  "linear-gradient(90deg, rgba(203,161,83,0) 0%, #CBA153 30%, #FFE9B0 60%, #CBA153 100%)",
                boxShadow: "0 0 24px rgba(203,161,83,0.55)",
              }}
            />

            <h1
              className="font-serif-display text-white fi-glow-text"
              style={{
                fontSize: "clamp(2.8rem, 7vw, 6.4rem)",
                lineHeight: 1.02,
                letterSpacing: "-0.02em",
                textShadow: "0 4px 30px rgba(0,0,0,0.6), 0 0 60px rgba(0,0,0,0.4)",
              }}
              data-testid="hero-headline"
            >
              {headline.map((w, i) => (
                <span key={i} className="fi-hero3d-word mr-3">
                  <span style={{ animationDelay: `${0.35 + i * 0.16}s` }}>
                    {i === headline.length - 1 ? (
                      <span className="fi-gold-shine" style={{ fontStyle: "italic" }}>{w}</span>
                    ) : w}
                  </span>
                </span>
              ))}
            </h1>

            <p
              className="mt-7 max-w-xl fi-typewriter fi-glow-text"
              style={{
                fontSize: "1.05rem",
                fontWeight: 300,
                lineHeight: 1.7,
                color: "rgba(249,248,246,0.82)",
                textShadow: "0 1px 14px rgba(0,0,0,0.5)",
              }}
              data-testid="hero-subtitle"
            >
              {Array.from(SUBTITLE).map((c, i) => (
                <span key={i} className="fi-char"
                  style={{
                    animationDelay: `${1.4 + i * 0.012}s`,
                    whiteSpace: c === " " ? "pre" : undefined,
                  }}>
                  {c}
                </span>
              ))}
            </p>

            <div
              className="mt-9 flex flex-wrap items-center gap-4"
              style={{ animation: "fi-rise 0.9s 2.6s cubic-bezier(0.16,1,0.3,1) backwards" }}
            >
              <button onClick={() => go("portfolio")} data-testid="hero-explore-btn" className="btn-fi-gold">
                Explore Our Work <ArrowRight size={16} />
              </button>
              <button onClick={() => go("contact")} data-testid="hero-book-btn" className="btn-fi-ghost">
                Book a Free Consultation
              </button>
            </div>
          </div>

          {/* IMAGE (desktop) */}
          <div className="hidden md:block md:col-span-5 order-1 md:order-2">
            <div
              className="relative mx-auto"
              data-testid="hero-image-frame"
              style={{
                maxWidth: "min(520px, 100%)",
                animation: "fi-rise 1.4s 0.4s cubic-bezier(0.16,1,0.3,1) backwards",
              }}
            >
              <div
                aria-hidden
                className="absolute inset-0 fi-halo-pulse pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at 50% 50%, rgba(203,161,83,0.45) 0%, rgba(203,161,83,0) 70%)",
                  transform: "scale(1.15)",
                  filter: "blur(40px)",
                }}
              />
              <div className="relative"
                style={{
                  aspectRatio: "712 / 1400",
                  background: "#0c0c0c",
                  boxShadow:
                    "0 50px 100px -30px rgba(0,0,0,0.7), 0 0 0 1px rgba(203,161,83,0.18), 0 0 60px rgba(203,161,83,0.15)",
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
                <div aria-hidden className="absolute inset-0 pointer-events-none"
                  style={{ boxShadow: "inset 0 0 0 1px rgba(203,161,83,0.25)" }} />
                <div className="fi-corner tl" style={{ animationDelay: "1.2s" }} />
                <div className="fi-corner tr" style={{ animationDelay: "1.35s" }} />
                <div className="fi-corner bl" style={{ animationDelay: "1.5s" }} />
                <div className="fi-corner br" style={{ animationDelay: "1.65s" }} />
              </div>
              <div
                className="absolute -bottom-4 -right-4 px-4 py-2 fi-glass-dark"
                style={{
                  borderRadius: 2,
                  borderLeft: "2px solid #CBA153",
                  animation: "fi-rise 0.9s 1.8s cubic-bezier(0.16,1,0.3,1) backwards",
                }}
              >
                <div className="overline"
                  style={{ color: "#E9C57A", fontSize: "0.62rem", letterSpacing: "0.32em" }}>
                  Recent Project · 2025
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => go("about")}
          aria-label="Scroll down"
          data-testid="hero-scroll-down"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 hover:text-white transition-colors"
          style={{ animation: "fi-rise 0.9s 3s cubic-bezier(0.16,1,0.3,1) backwards" }}
        >
          <ChevronDown size={28} className="animate-bounce" />
        </button>

        <div className="hidden lg:block absolute right-6 top-1/2 -translate-y-1/2 z-20 fi-vert-cascade"
          style={{
            writingMode: "vertical-rl",
            color: "rgba(255,255,255,0.5)",
            fontSize: "0.68rem",
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            fontWeight: 500,
            textShadow: "0 1px 12px rgba(0,0,0,0.6)",
          }}>
          {Array.from(SIDE_TEXT).map((c, i) => (
            <span key={i} style={{ animationDelay: `${1.6 + i * 0.04}s` }}>{c}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
