import { useEffect, useState, lazy, Suspense } from "react";
import { useRevealAll } from "../lib/hooks";

import Navbar from "../components/site/Navbar";
import Hero from "../components/site/Hero";

// Below-fold sections are code-split for faster initial load.
// They render in priority order as they enter view.
const About = lazy(() => import("../components/site/About"));
const Portfolio = lazy(() => import("../components/site/Portfolio"));
const Services = lazy(() => import("../components/site/Services"));
const WhyChooseUs = lazy(() => import("../components/site/WhyChooseUs"));
const Testimonials = lazy(() => import("../components/site/Testimonials"));
const Contact = lazy(() => import("../components/site/Contact"));
const Footer = lazy(() => import("../components/site/Footer"));
const PremiumCursor = lazy(() => import("../components/site/PremiumCursor"));
const GoldSprinkle = lazy(() => import("../components/site/GoldSprinkle"));

export default function HomePage() {
  useRevealAll(".fi-reveal");

  // Defer non-essential overlays (cursor + sparkle) until the browser is idle,
  // so they don't compete with the hero paint.
  const [overlaysReady, setOverlaysReady] = useState(false);
  useEffect(() => {
    const ric = window.requestIdleCallback || ((cb) => setTimeout(cb, 800));
    const cic = window.cancelIdleCallback || clearTimeout;
    const handle = ric(() => setOverlaysReady(true), { timeout: 1500 });
    return () => cic(handle);
  }, []);

  // Re-run reveal observer if content loads later (testimonials/portfolio)
  useEffect(() => {
    const id = setInterval(() => {
      const els = document.querySelectorAll(".fi-reveal:not(.in-view)");
      if (!els.length) return;
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("in-view");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
      );
      els.forEach((el) => io.observe(el));
    }, 800);
    return () => clearInterval(id);
  }, []);

  return (
    <div data-testid="home-page" style={{ background: "var(--fi-offwhite)" }}>
      {overlaysReady && (
        <Suspense fallback={null}>
          <PremiumCursor />
          <GoldSprinkle />
        </Suspense>
      )}
      <Navbar />
      <Hero />
      <Suspense fallback={<div style={{ minHeight: "60vh", background: "#0e0e0e" }} />}>
        <About />
      </Suspense>
      <Suspense fallback={<div style={{ minHeight: "40vh", background: "#161616" }} />}>
        <Portfolio />
      </Suspense>
      <Suspense fallback={<div style={{ minHeight: "30vh", background: "var(--fi-offwhite)" }} />}>
        <Services />
      </Suspense>
      <Suspense fallback={<div style={{ minHeight: "30vh", background: "#161616" }} />}>
        <WhyChooseUs />
      </Suspense>
      <Suspense fallback={<div style={{ minHeight: "30vh", background: "var(--fi-offwhite)" }} />}>
        <Testimonials />
      </Suspense>
      <Suspense fallback={<div style={{ minHeight: "30vh", background: "var(--fi-offwhite)" }} />}>
        <Contact />
      </Suspense>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
}
