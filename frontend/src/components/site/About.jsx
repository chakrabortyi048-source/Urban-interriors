import { useEffect, useRef, useState } from "react";
import { useCountUp } from "../../lib/hooks";

const ABOUT_IMG =
  "https://customer-assets.emergentagent.com/job_4e352398-ef7d-4f99-8305-24b84c12ade6/artifacts/o8oeed6y_Screenshot_2026-04-28_164526.jpg";

function Stat({ value, label, suffix = "+", start }) {
  const ref = useCountUp(value, 1800, start);
  return (
    <div data-testid={`about-stat-${label.toLowerCase().replace(/\s+/g, "-")}`}>
      <div
        className="font-serif-display"
        style={{ fontSize: "clamp(2.5rem, 5vw, 3.6rem)", color: "#CBA153", lineHeight: 1 }}
      >
        <span ref={ref}>0</span>
        <span>{suffix}</span>
      </div>
      <div className="overline mt-3" style={{ color: "#737373" }}>
        {label}
      </div>
    </div>
  );
}

export default function About() {
  const sectionRef = useRef(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setStart(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
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
              A trusted Kolkata studio,
              <br />
              <span style={{ color: "#CBA153", fontStyle: "italic" }}>
                obsessed with the detail.
              </span>
            </h2>
            <p
              className="mt-7 text-base md:text-lg fi-reveal fi-reveal-delay-2"
              style={{ color: "#3a3a3a", lineHeight: 1.85, fontWeight: 300, maxWidth: "560px" }}
            >
              Fashion Interior is a family-run interior studio on Rajarhat Main Road,
              quietly transforming homes, showrooms and offices across Kolkata for over four
              decades. Walk in for an imported wallpaper or a wooden floor — leave with a
              space that feels considered, calm and unmistakably yours.
            </p>
            <p
              className="mt-5 text-base fi-reveal fi-reveal-delay-3"
              style={{ color: "#3a3a3a", lineHeight: 1.85, fontWeight: 300, maxWidth: "560px" }}
            >
              We curate Korean, German and Russian wallpapers, premium PVC and wooden
              flooring, custom blinds, 3D panels and louvers — and we install every one of
              them ourselves, on time, without drama.
            </p>

            <div className="grid grid-cols-3 gap-6 mt-12 fi-reveal fi-reveal-delay-4">
              <Stat value={40} label="Years of Trust" suffix="+" start={start} />
              <Stat value={2500} label="Spaces Designed" suffix="+" start={start} />
              <Stat value={100} label="On-Time Install" suffix="%" start={start} />
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
                alt="A Fashion Interior project — chandelier living room, Kolkata"
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
                "We don't sell products. We sell the quiet feeling of walking into a room
                that is finally, undeniably yours."
              </p>
              <div className="overline mt-4" style={{ color: "#737373" }}>
                — Manoj &amp; Aniket, Founders
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
