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
    const onScroll = () => setScrolled(window.scrollY > 60);
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
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(255, 255, 255, 0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(14px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(14px)" : "none",
          borderBottom: scrolled ? "1px solid var(--border-light)" : "1px solid transparent",
        }}
      >
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 flex items-center justify-between h-20">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            data-testid="nav-logo"
            className="flex items-center gap-3 group"
          >
            <span
              className="font-display text-xl md:text-2xl"
              style={{ color: "var(--text-main)", fontWeight: 600 }}
            >
              Urban <span style={{ color: "var(--accent)" }}>Interiors</span>
            </span>
          </button>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((l) => (
              <button
                key={l.id}
                data-testid={`nav-link-${l.id}`}
                onClick={() => go(l.id)}
                className="text-sm font-medium transition-colors duration-200"
                style={{ color: "var(--text-secondary)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
              >
                {l.label}
              </button>
            ))}
            <button
              data-testid="nav-cta-book"
              onClick={() => go("contact")}
              className="btn-primary"
              style={{ padding: "0.7rem 1.3rem", fontSize: "0.85rem" }}
            >
              Book Consultation
            </button>
          </div>

          <button
            data-testid="nav-hamburger"
            className="lg:hidden"
            style={{ color: "var(--text-main)" }}
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        data-testid="mobile-menu"
        className="fixed inset-0 z-40 lg:hidden transition-all duration-300"
        style={{
          background: "var(--bg-default)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
        }}
      >
        <div className="flex flex-col items-start gap-6 px-6 pt-28 pb-10">
          {navLinks.map((l) => (
            <button
              key={l.id}
              data-testid={`mobile-nav-link-${l.id}`}
              onClick={() => go(l.id)}
              className="font-display text-2xl"
              style={{ color: "var(--text-main)", fontWeight: 500 }}
            >
              {l.label}
            </button>
          ))}
          <button
            data-testid="mobile-nav-cta"
            onClick={() => go("contact")}
            className="btn-primary mt-4"
          >
            Book Consultation
          </button>
        </div>
      </div>
    </>
  );
}
