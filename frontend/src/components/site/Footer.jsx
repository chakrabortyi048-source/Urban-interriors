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
  const address =
    info?.address ||
    "211 Road, Chinar Park, Near Bharat Petroleum, Atghara, Tegharia, Newtown, Kolkata 700136";
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
      style={{ background: "var(--bg-elevated)", color: "var(--text-main)" }}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <div
          className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12"
          style={{ borderBottom: "1px solid var(--border-light)" }}
        >
          <div className="md:col-span-5">
            <div
              className="font-display"
              style={{
                fontSize: "clamp(1.7rem, 3vw, 2.2rem)",
                lineHeight: 1.1,
                fontWeight: 600,
              }}
            >
              Urban <span style={{ color: "var(--accent)" }}>Interiors</span>
            </div>
            <p
              className="mt-4 max-w-md text-sm"
              style={{ color: "var(--text-secondary)", lineHeight: 1.75 }}
            >
              A Chinar Park interior studio for painting, bespoke furniture, flooring,
              and landscape design — turning houses into dream homes.
            </p>
            <div className="flex items-center gap-2 mt-6">
              {info?.instagram && (
                <a
                  href={info.instagram}
                  target="_blank"
                  rel="noreferrer"
                  data-testid="footer-instagram"
                  aria-label="Instagram"
                  className="w-10 h-10 flex items-center justify-center transition-colors"
                  style={{
                    border: "1px solid var(--border-light)",
                    color: "var(--text-main)",
                    borderRadius: "2px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--text-main)";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--text-main)";
                  }}
                >
                  <Instagram size={16} />
                </a>
              )}
              {info?.facebook && (
                <a
                  href={info.facebook}
                  target="_blank"
                  rel="noreferrer"
                  data-testid="footer-facebook"
                  aria-label="Facebook"
                  className="w-10 h-10 flex items-center justify-center"
                  style={{
                    border: "1px solid var(--border-light)",
                    color: "var(--text-main)",
                    borderRadius: "2px",
                  }}
                >
                  <Facebook size={16} />
                </a>
              )}
              <a
                href={`tel:${phone}`}
                data-testid="footer-phone"
                aria-label="Phone"
                className="w-10 h-10 flex items-center justify-center"
                style={{
                  border: "1px solid var(--border-light)",
                  color: "var(--text-main)",
                  borderRadius: "2px",
                }}
              >
                <Phone size={16} />
              </a>
              {info?.email && (
                <a
                  href={`mailto:${info.email}`}
                  data-testid="footer-email"
                  aria-label="Email"
                  className="w-10 h-10 flex items-center justify-center"
                  style={{
                    border: "1px solid var(--border-light)",
                    color: "var(--text-main)",
                    borderRadius: "2px",
                  }}
                >
                  <Mail size={16} />
                </a>
              )}
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="overline" style={{ color: "var(--text-muted)" }}>
              Quick Links
            </div>
            <ul className="mt-5 space-y-3">
              {links.map((l) => (
                <li key={l.id}>
                  <button
                    onClick={() => go(l.id)}
                    data-testid={`footer-link-${l.id}`}
                    className="text-sm flex items-center gap-1 transition-colors"
                    style={{ color: "var(--text-secondary)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
                  >
                    {l.label} <ArrowUpRight size={12} />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <div className="overline" style={{ color: "var(--text-muted)" }}>
              Visit / Call / Hours
            </div>
            <div
              className="mt-5 space-y-4 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              <div className="flex items-start gap-3">
                <MapPin
                  size={16}
                  style={{ color: "var(--accent)", flexShrink: 0, marginTop: 3 }}
                />
                <span style={{ lineHeight: 1.7 }}>{address}</span>
              </div>
              {secondaryAddress && (
                <div
                  className="flex items-start gap-3"
                  data-testid="footer-secondary-address"
                >
                  <MapPin
                    size={16}
                    style={{ color: "var(--accent)", flexShrink: 0, marginTop: 3, opacity: 0.6 }}
                  />
                  <span style={{ lineHeight: 1.7 }}>
                    <span
                      className="block text-xs uppercase"
                      style={{
                        color: "var(--text-muted)",
                        letterSpacing: "0.15em",
                        fontWeight: 500,
                        marginBottom: 2,
                      }}
                    >
                      Branch
                    </span>
                    {secondaryAddress}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Phone size={16} style={{ color: "var(--accent)" }} />
                <a
                  href={`tel:${phone}`}
                  className="transition-colors"
                  style={{ color: "var(--text-secondary)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-main)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
                >
                  {phone}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Clock size={16} style={{ color: "var(--accent)" }} />
                <span>{hours}</span>
              </div>
            </div>
          </div>
        </div>

        <div
          className="pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          <div data-testid="footer-copy">
            © 2025 Urban Interiors. All Rights Reserved.
          </div>
          <div
            className="uppercase"
            style={{ letterSpacing: "0.25em", fontWeight: 500 }}
          >
            Crafted in Kolkata
          </div>
        </div>
      </div>
    </footer>
  );
}
