import { useEffect, useState } from "react";
import { MapPin, Phone, Clock, MessageCircle, Send, CheckCircle2 } from "lucide-react";
import { api, formatApiError } from "../../lib/api";
import SplitHeading, { SpreadOverline } from "./SplitHeading";

const SERVICES = [
  "Interior Painting", "Drywall Repair", "Wood Staining",
  "Bespoke Furniture", "Floor Sanding & Polishing",
  "Wood & Laminate Flooring", "Landscape Design",
  "Full Home Makeover", "Other",
];

function Field({ name, label, type = "text", value, onChange, required }) {
  return (
    <div className="mb-5">
      <label htmlFor={name} className="block mb-2 overline"
        style={{ color: "#737373", fontSize: "0.65rem" }}>
        {label}{required && " *"}
      </label>
      <input
        id={name} name={name} type={type} value={value} onChange={onChange} required={required}
        data-testid={`contact-field-${name}`}
        className="w-full px-0 py-3 bg-transparent transition-colors duration-200 font-sans"
        style={{
          color: "#1A1A1A",
          borderBottom: "1px solid rgba(0,0,0,0.18)",
          outline: "none",
          fontSize: "0.95rem",
        }}
        onFocus={(e) => (e.target.style.borderBottomColor = "#CBA153")}
        onBlur={(e) => (e.target.style.borderBottomColor = "rgba(0,0,0,0.18)")}
      />
    </div>
  );
}

export default function Contact() {
  const [info, setInfo] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", service: "", message: "", callback_time: "" });
  const [status, setStatus] = useState({ loading: false, ok: false, error: "" });

  useEffect(() => {
    api.get("/business-info").then((r) => setInfo(r.data)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, ok: false, error: "" });
    try {
      await api.post("/inquiries", form);
      setStatus({ loading: false, ok: true, error: "" });
      setForm({ name: "", phone: "", email: "", service: "", message: "", callback_time: "" });
    } catch (err) {
      setStatus({
        loading: false, ok: false,
        error: formatApiError(err.response?.data?.detail) || "Something went wrong.",
      });
    }
  };

  const phone = info?.phone || "8981230518";
  const whatsapp = (info?.whatsapp || phone).replace(/\D/g, "");
  const address = info?.address || "211 Road, Chinar Park, Near Bharat Petroleum, Atghara, Tegharia, Newtown, Kolkata, West Bengal 700136";
  const secondaryAddress = info?.secondary_address || "";
  const hours = info?.hours || "Everyday · 24 hours open";

  return (
    <section
      id="contact"
      data-testid="contact-section"
      style={{ background: "var(--fi-offwhite)" }}
      className="relative py-24 md:py-32 lg:py-40"
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Form */}
          <div>
            <SpreadOverline text="Book a free consultation" style={{ color: "#CBA153" }} />
            <SplitHeading
              primary="Tell us about"
              accent="your space."
              className="font-serif-display mt-5"
              style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)", lineHeight: 1.05, color: "#1A1A1A" }}
              testId="contact-heading"
            />
            <p
              className="mt-5 fi-reveal fi-reveal-delay-2 fi-glow-text"
              style={{ color: "#3a3a3a", lineHeight: 1.7, maxWidth: "480px" }}
            >
              Drop a few lines below and we'll call you back at your preferred time.
              No commitments, no fees — just an honest conversation about your project.
            </p>

            {status.ok ? (
              <div data-testid="contact-success" className="mt-10 p-8"
                style={{ background: "rgba(203,161,83,0.06)", border: "1px solid rgba(203,161,83,0.3)", borderLeft: "2px solid #CBA153" }}>
                <CheckCircle2 size={28} style={{ color: "#CBA153" }} />
                <div className="font-serif-display mt-4" style={{ fontSize: "1.5rem", color: "#1A1A1A" }}>
                  Thank you!
                </div>
                <p className="mt-3 text-sm" style={{ color: "#3a3a3a", lineHeight: 1.7 }}>
                  We've received your enquiry. A member of our team will reach out within
                  a working day to schedule your free consultation.
                </p>
              </div>
            ) : (
              <form onSubmit={submit} data-testid="contact-form" className="mt-10 fi-reveal fi-reveal-delay-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
                  <Field name="name" label="Full Name" value={form.name} onChange={onChange} required />
                  <Field name="phone" label="Phone Number" value={form.phone} onChange={onChange} required />
                </div>
                <Field name="email" label="Email (optional)" type="email" value={form.email} onChange={onChange} />

                <div className="mb-5">
                  <label htmlFor="service" className="block mb-2 overline"
                    style={{ color: "#737373", fontSize: "0.65rem" }}>
                    Service of Interest
                  </label>
                  <select id="service" name="service" value={form.service} onChange={onChange}
                    data-testid="contact-field-service"
                    className="w-full px-0 py-3 bg-transparent font-sans"
                    style={{ color: "#1A1A1A", borderBottom: "1px solid rgba(0,0,0,0.18)", outline: "none", fontSize: "0.95rem" }}
                  >
                    <option value="">— Select —</option>
                    {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <Field name="callback_time" label="Preferred Callback Time (optional)"
                  value={form.callback_time} onChange={onChange} />

                <div className="mb-5">
                  <label htmlFor="message" className="block mb-2 overline"
                    style={{ color: "#737373", fontSize: "0.65rem" }}>
                    Tell us about your project
                  </label>
                  <textarea id="message" name="message" rows={4} value={form.message} onChange={onChange}
                    data-testid="contact-field-message"
                    className="w-full px-0 py-3 bg-transparent font-sans"
                    style={{ color: "#1A1A1A", borderBottom: "1px solid rgba(0,0,0,0.18)", outline: "none", fontSize: "0.95rem" }}
                  />
                </div>

                {status.error && (
                  <div className="mb-4 text-sm" style={{ color: "#C85A40" }} data-testid="contact-error">
                    {status.error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status.loading}
                  data-testid="contact-submit"
                  className="btn-fi-gold mt-2 disabled:opacity-60"
                >
                  {status.loading ? "Sending…" : "Request Callback"}
                  <Send size={15} />
                </button>
              </form>
            )}
          </div>

          {/* Info */}
          <div className="fi-reveal fi-reveal-delay-2">
            <div className="p-7 md:p-10" data-testid="contact-info-card"
              style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.06)", borderLeft: "2px solid #CBA153" }}
            >
              <SpreadOverline text="Visit the Studio" style={{ color: "#CBA153" }} />

              <div className="mt-6 space-y-7">
                <div className="flex items-start gap-4">
                  <MapPin size={20} strokeWidth={1.6} style={{ color: "#CBA153", marginTop: 2 }} />
                  <div>
                    <div className="overline" style={{ color: "#737373", fontSize: "0.62rem", marginBottom: 4 }}>Main Branch</div>
                    <div style={{ color: "#1A1A1A", fontWeight: 500, lineHeight: 1.6 }} data-testid="contact-address">
                      {address}
                    </div>
                  </div>
                </div>

                {secondaryAddress && (
                  <div className="flex items-start gap-4">
                    <MapPin size={20} strokeWidth={1.6} style={{ color: "#CBA153", marginTop: 2 }} />
                    <div>
                      <div className="overline" style={{ color: "#737373", fontSize: "0.62rem", marginBottom: 4 }}>Branch Office</div>
                      <div style={{ color: "#1A1A1A", fontWeight: 500, lineHeight: 1.6 }} data-testid="contact-secondary-address">
                        {secondaryAddress}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <Phone size={20} strokeWidth={1.6} style={{ color: "#CBA153", marginTop: 2 }} />
                  <div>
                    <div className="overline" style={{ color: "#737373", fontSize: "0.62rem", marginBottom: 4 }}>Call Us</div>
                    <a href={`tel:${phone}`} className="block hover:underline"
                      style={{ color: "#1A1A1A", fontWeight: 500 }} data-testid="contact-phone">
                      {phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Clock size={20} strokeWidth={1.6} style={{ color: "#CBA153", marginTop: 2 }} />
                  <div>
                    <div className="overline" style={{ color: "#737373", fontSize: "0.62rem", marginBottom: 4 }}>Hours</div>
                    <div style={{ color: "#1A1A1A", fontWeight: 500 }} data-testid="contact-hours">{hours}</div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                <a href={`https://wa.me/91${whatsapp}`} target="_blank" rel="noopener noreferrer"
                  data-testid="contact-whatsapp"
                  className="inline-flex items-center gap-2 text-sm transition-colors"
                  style={{ color: "#1A1A1A", fontWeight: 500 }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#CBA153")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#1A1A1A")}
                >
                  <MessageCircle size={16} />
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
