import { useEffect, useState } from "react";
import { Instagram, Facebook, Mail, Phone, MapPin, Clock, ArrowUpRight } from "lucide-react";
import { api } from "../../lib/api";

export default function Footer() {
  const [info, setInfo] = useState({});

  useEffect(() => {
    api.get("/business-info").then((r) => setInfo(r.data || {})).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const phone = info?.phone || "8981230518";
  const address = info?.address || "211 Road, Chinar Park, Near Bharat Petroleum, Atghara, Tegharia, Newtown, Kolkata 700136";
  const secondaryAddress = info?.secondary_address || "";
  const hours = info?.hours || "Everyday · 24 hours open";

  const links = [
    { id: "about", label: "About" },
    { id: "portfolio", label: "Portfolio" },
    { id: "services", label: "Services" },
    { id: "why", label: "Why Us" },
    { id: "testimonials", label: "Reviews" },
    { id: "contact", label: "Contact" },
  ];

  const go = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer
      data-testid="footer"
      className="pt-16 pb-8"
      style={{ background: "#0e0e0e", color: "#F9F8F6" }}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12"
          style={{ borderBottom: "1px solid rgba(203,161,83,0.18)" }}
        >
          <div className="md:col-span-5">
            <div className="font-serif-display"
              style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", lineHeight: 1.1 }}>
              Urban <span style={{ color: "#CBA153", fontStyle: "italic" }}>Interiors</span>
            </div>
            <p className="mt-4 max-w-md text-sm"
              style={{ color: "rgba(249,248,246,0.65)", lineHeight: 1.75, fontWeight: 300 }}>
              A Chinar Park interior studio for painting, bespoke furniture, flooring,
              and landscape design — turning houses into dream homes.
            </p>
            <div className="flex items-center gap-2 mt-6">
              {info?.instagram && (
                <a href={info.instagram} target="_blank" rel="noreferrer" data-testid="footer-instagram"
                  aria-label="Instagram"
                  className="w-10 h-10 flex items-center justify-center transition-colors"
                  style={{ border: "1px solid rgba(203,161,83,0.4)", color: "#E9C57A", borderRadius: 2 }}>
                  <Instagram size={16} />
                </a>
              )}
              {info?.facebook && (
                <a href={info.facebook} target="_blank" rel="noreferrer" data-testid="footer-facebook"
                  aria-label="Facebook"
                  className="w-10 h-10 flex items-center justify-center"
                  style={{ border: "1px solid rgba(203,161,83,0.4)", color: "#E9C57A", borderRadius: 2 }}>
                  <Facebook size={16} />
                </a>
              )}
              <a href={`tel:${phone}`} data-testid="footer-phone" aria-label="Phone"
                className="w-10 h-10 flex items-center justify-center"
                style={{ border: "1px solid rgba(203,161,83,0.4)", color: "#E9C57A", borderRadius: 2 }}>
                <Phone size={16} />
              </a>
              {info?.email && (
                <a href={`mailto:${info.email}`} data-testid="footer-email" aria-label="Email"
                  className="w-10 h-10 flex items-center justify-center"
                  style={{ border: "1px solid rgba(203,161,83,0.4)", color: "#E9C57A", borderRadius: 2 }}>
                  <Mail size={16} />
                </a>
              )}
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="overline" style={{ color: "#CBA153" }}>Quick Links</div>
            <ul className="mt-5 space-y-3">
              {links.map((l) => (
                <li key={l.id}>
                  <button onClick={() => go(l.id)} data-testid={`footer-link-${l.id}`}
                    className="text-sm flex items-center gap-1 transition-colors"
                    style={{ color: "rgba(249,248,246,0.7)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#E9C57A")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(249,248,246,0.7)")}>
                    {l.label} <ArrowUpRight size={12} />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <div className="overline" style={{ color: "#CBA153" }}>Visit / Call / Hours</div>
            <div className="mt-5 space-y-4 text-sm" style={{ color: "rgba(249,248,246,0.7)" }}>
              <div className="flex items-start gap-3">
                <MapPin size={16} style={{ color: "#CBA153", flexShrink: 0, marginTop: 3 }} />
                <span style={{ lineHeight: 1.7 }}>{address}</span>
              </div>
              {secondaryAddress && (
                <div className="flex items-start gap-3" data-testid="footer-secondary-address">
                  <MapPin size={16} style={{ color: "#CBA153", flexShrink: 0, marginTop: 3, opacity: 0.6 }} />
                  <span style={{ lineHeight: 1.7 }}>
                    <span className="block overline" style={{ color: "rgba(249,248,246,0.55)", fontSize: "0.6rem", marginBottom: 2 }}>
                      Branch
                    </span>
                    {secondaryAddress}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Phone size={16} style={{ color: "#CBA153" }} />
                <a href={`tel:${phone}`} className="transition-colors"
                  style={{ color: "rgba(249,248,246,0.85)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#E9C57A")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(249,248,246,0.85)")}>
                  {phone}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Clock size={16} style={{ color: "#CBA153" }} />
                <span>{hours}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs"
          style={{ color: "rgba(249,248,246,0.5)" }}>
          <div data-testid="footer-copy">© 2025 Urban Interiors. All Rights Reserved.</div>
          <div className="overline" style={{ color: "rgba(249,248,246,0.4)" }}>Crafted in Kolkata</div>
        </div>
      </div>
    </footer>
  );
}
