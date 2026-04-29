import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { id: "about", label: "About" },
  { id: "portfolio", label: "Portfolio" },
  { id: "services", label: "Services" },
  { id: "why", label: "Why Us" },
  { id: "testimonials", label: "Reviews" },
  { id: "contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("no-scroll", open);
  }, [open]);

  const go = (id) => {
    setOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <nav
        data-testid="navbar"
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled ? "rgba(22,22,22,0.78)" : "transparent",
          backdropFilter: scrolled ? "blur(18px) saturate(140%)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(18px) saturate(140%)" : "none",
          borderBottom: scrolled ? "1px solid rgba(203,161,83,0.18)" : "1px solid transparent",
        }}
      >
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 flex items-center justify-between h-20">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            data-testid="nav-logo"
            className="flex items-center gap-3 group"
          >
            <span
              className="font-serif-display text-xl md:text-2xl"
              style={{ color: "#F9F8F6" }}
            >
              Fashion <span style={{ color: "#CBA153" }}>Interior</span>
            </span>
          </button>

          <div className="hidden lg:flex items-center gap-9">
            {navLinks.map((l) => (
              <button
                key={l.id}
                data-testid={`nav-link-${l.id}`}
                onClick={() => go(l.id)}
                className="text-[12px] tracking-[0.22em] uppercase font-medium transition-colors duration-300"
                style={{ color: "#F9F8F6" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#CBA153")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#F9F8F6")}
              >
                {l.label}
              </button>
            ))}
            <button
              data-testid="nav-cta-book"
              onClick={() => go("contact")}
              className="btn-fi-gold"
              style={{ padding: "0.7rem 1.4rem", fontSize: "0.7rem" }}
            >
              Book Consultation
            </button>
          </div>

          <button
            data-testid="nav-hamburger"
            className="lg:hidden text-white"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </nav>

      <div className={`fi-mobile-menu ${open ? "open" : ""}`} data-testid="mobile-menu">
        {navLinks.map((l, i) => (
          <a
            key={l.id}
            data-testid={`mobile-nav-link-${l.id}`}
            href={`#${l.id}`}
            onClick={(e) => {
              e.preventDefault();
              go(l.id);
            }}
            style={{
              animation: open ? `fi-rise 0.6s ${0.1 + i * 0.07}s cubic-bezier(0.16, 1, 0.3, 1) backwards` : "none",
            }}
          >
            {l.label}
          </a>
        ))}
        <button
          data-testid="mobile-nav-cta"
          onClick={() => go("contact")}
          className="btn-fi-gold mt-6"
        >
          Book Consultation
        </button>
      </div>
    </>
  );
}
