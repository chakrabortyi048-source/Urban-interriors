import { useEffect, useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";

const HERO_IMG =
  "https://customer-assets.emergentagent.com/job_aniket-interiors/artifacts/i5rmo5b2_IMG-20260501-WA0025.jpg";

export default function Hero() {
  const [parallaxY, setParallaxY] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setParallaxY(y * 0.3);
    };
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
      className="relative h-screen w-full overflow-hidden"
      style={{ background: "#161616" }}
    >
      {/* Parallax + Ken Burns background */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          transform: `translateY(${parallaxY}px)`,
          transition: "transform 0.05s linear",
          willChange: "transform",
        }}
      >
        <div className="fi-kenburns absolute inset-0">
          <img
            src={HERO_IMG}
            alt="Urban Interiors — Bespoke living room in Chinar Park, Kolkata"
            className="w-full h-full object-cover"
            loading="eager"
          />
        </div>

        {/* Soft darkening only on edges, keep center bright */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 45%, rgba(22,22,22,0) 0%, rgba(22,22,22,0.15) 45%, rgba(22,22,22,0.55) 80%, rgba(22,22,22,0.82) 100%)",
          }}
        />
        {/* Bottom gradient for text legibility */}
        <div
          className="absolute inset-x-0 bottom-0 h-[55%] pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(22,22,22,0) 0%, rgba(22,22,22,0.55) 55%, rgba(22,22,22,0.92) 100%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end pb-20 md:pb-28 max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="overline mb-6" style={{ color: "rgba(203,161,83,0.95)" }}>
          Kolkata · Chinar Park
        </div>

        {/* Animated gold accent line above headline */}
        <div
          className="fi-gold-sweep mb-5"
          data-testid="hero-gold-accent"
          style={{
            height: "2px",
            width: "clamp(90px, 14vw, 180px)",
            background:
              "linear-gradient(90deg, rgba(203,161,83,0) 0%, #CBA153 20%, #E9C57A 60%, #CBA153 100%)",
            boxShadow: "0 0 18px rgba(203,161,83,0.45)",
          }}
        />

        <h1
          className="font-serif-display text-white"
          style={{
            fontSize: "clamp(2.6rem, 7vw, 6.5rem)",
            lineHeight: 1.02,
            letterSpacing: "-0.02em",
            maxWidth: "1100px",
            textShadow: "0 2px 30px rgba(0,0,0,0.45)",
          }}
          data-testid="hero-headline"
        >
          {headline.map((w, i) => (
            <span key={i} className="fi-hero-word mr-3">
              <span style={{ animationDelay: `${0.2 + i * 0.13}s` }}>
                {i === headline.length - 1 ? (
                  <span style={{ color: "#CBA153", fontStyle: "italic" }}>{w}</span>
                ) : (
                  w
                )}
              </span>
            </span>
          ))}
        </h1>
        <p
          className="mt-7 max-w-xl text-white/80 fi-reveal in-view"
          style={{
            fontSize: "1.05rem",
            fontWeight: 300,
            lineHeight: 1.7,
            textShadow: "0 1px 18px rgba(0,0,0,0.4)",
            animation: "fi-rise 0.9s 1.1s cubic-bezier(0.16,1,0.3,1) backwards",
          }}
        >
          Your one-stop Chinar Park studio for interior painting, bespoke furniture,
          flooring, and captivating landscape designs — turning houses into dream homes.
        </p>

        <div
          className="mt-9 flex flex-wrap items-center gap-4"
          style={{ animation: "fi-rise 0.9s 1.3s cubic-bezier(0.16,1,0.3,1) backwards" }}
        >
          <button
            onClick={() => go("portfolio")}
            data-testid="hero-explore-btn"
            className="btn-fi-gold"
          >
            Explore Our Work
            <ArrowRight size={16} />
          </button>
          <button
            onClick={() => go("contact")}
            data-testid="hero-book-btn"
            className="btn-fi-ghost"
          >
            Book a Free Consultation
          </button>
        </div>

        <button
          onClick={() => go("about")}
          aria-label="Scroll down"
          data-testid="hero-scroll-down"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 hover:text-white transition-colors"
          style={{ animation: "fi-rise 0.9s 1.5s cubic-bezier(0.16,1,0.3,1) backwards" }}
        >
          <ChevronDown size={28} className="animate-bounce" />
        </button>
      </div>

      {/* Side overline */}
      <div
        className="hidden lg:flex absolute right-8 top-1/2 -translate-y-1/2 z-10 overline"
        style={{
          writingMode: "vertical-rl",
          color: "rgba(255,255,255,0.55)",
          letterSpacing: "0.4em",
          textShadow: "0 1px 12px rgba(0,0,0,0.5)",
        }}
      >
        Painting · Furniture · Flooring · Landscape
      </div>
    </section>
  );
}
