import { useEffect } from "react";
import { useRevealAll } from "../lib/hooks";

import Navbar from "../components/site/Navbar";
import Hero from "../components/site/Hero";
import About from "../components/site/About";
import Portfolio from "../components/site/Portfolio";
import Services from "../components/site/Services";
import WhyChooseUs from "../components/site/WhyChooseUs";
import Testimonials from "../components/site/Testimonials";
import Contact from "../components/site/Contact";
import Footer from "../components/site/Footer";

export default function HomePage() {
  useRevealAll(".fi-reveal");

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
      <Navbar />
      <Hero />
      <About />
      <Portfolio />
      <Services />
      <WhyChooseUs />
      <Testimonials />
      <Contact />
      <Footer />
    </div>
  );
}
