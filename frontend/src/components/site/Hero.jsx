import { useEffect, useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";

const HERO_IMG =
  "https://customer-assets.emergentagent.com/job_4e352398-ef7d-4f99-8305-24b84c12ade6/artifacts/zh7h9lsp_Screenshot_2026-04-28_164511.jpg";

export default function Hero() {
  const [parallaxY, setParallaxY] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setParallaxY(y * 0.35);
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
      {/* Parallax background */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translateY(${parallaxY}px) scale(1.08)`,
          transition: "transform 0.05s linear",
          willChange: "transform",
        }}
      >
        <img
          src={HERO_IMG}
          alt="Fashion Interior — Golden floral wallpaper dining room, Kolkata"
          className="w-full h-[120%] object-cover"
          loading="eager"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(22,22,22,0.55) 0%, rgba(22,22,22,0.35) 35%, rgba(22,22,22,0.85) 100%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end pb-20 md:pb-28 max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="overline mb-6" style={{ color: "rgba(203,161,83,0.95)" }}>
          Kolkata · Since 1985
        </div>
        <h1
          className="font-serif-display text-white"
          style={{
            fontSize: "clamp(2.6rem, 7vw, 6.5rem)",
            lineHeight: 1.02,
            letterSpacing: "-0.02em",
            maxWidth: "1100px",
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
          className="mt-7 max-w-xl text-white/75 fi-reveal in-view"
          style={{
            fontSize: "1.05rem",
            fontWeight: 300,
            lineHeight: 1.7,
            animation: "fi-rise 0.9s 1.1s cubic-bezier(0.16,1,0.3,1) backwards",
          }}
        >
          A Kolkata interior studio crafting cinematic wallpapers, bespoke flooring and
          quietly luxurious spaces — for homes and storefronts that deserve to be remembered.
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
          color: "rgba(255,255,255,0.5)",
          letterSpacing: "0.4em",
        }}
      >
        Wallpaper · Flooring · Blinds · 3D Panels
      </div>
    </section>
  );
}
