import { useEffect, useState } from "react";
import { MapPin, Phone, Clock, MessageCircle, ArrowRight, Send, CheckCircle2 } from "lucide-react";
import { api, formatApiError } from "../../lib/api";

const SERVICES = [
  "Wallpaper",
  "PVC Flooring",
  "Laminates",
  "Customised Wallpaper",
  "PVC Planks",
  "Wooden Flooring",
  "Artificial Grass",
  "Artificial Planters",
  "Blinds",
  "Customised Blinds",
  "Glass Film",
  "PVC Laminates",
  "3D Panels",
  "Full Home Makeover",
  "Other",
];

function Field({ name, label, type = "text", value, onChange, required, ...rest }) {
  const has = value && value.length > 0;
  return (
    <div className={`fi-field ${has ? "has-value" : ""}`}>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder=" "
        data-testid={`contact-field-${name}`}
        {...rest}
      />
      <label htmlFor={name}>
        {label}
        {required && " *"}
      </label>
    </div>
  );
}

export default function Contact() {
  const [info, setInfo] = useState(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    service: "",
    message: "",
    callback_time: "",
  });
  const [status, setStatus] = useState({ loading: false, ok: false, error: "" });

  useEffect(() => {
    api.get("/business-info").then((r) => setInfo(r.data)).catch(() => {});
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
        loading: false,
        ok: false,
        error: formatApiError(err.response?.data?.detail) || "Something went wrong.",
      });
    }
  };

  const phone = info?.phone || "09007855295";
  const whatsapp = (info?.whatsapp || phone).replace(/\D/g, "");
  const address =
    info?.address ||
    "Rajarhat Main Rd, opposite Rupam Motors, Atghara, Rajarhat, New Town, Kolkata, West Bengal 700136";
  const hours = info?.hours || "Every day, 9:15 AM – 8:30 PM";

  return (
    <section
      id="contact"
      data-testid="contact-section"
      className="relative py-24 md:py-32 lg:py-40"
      style={{ background: "var(--fi-offwhite)" }}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Form */}
          <div>
            <div className="overline fi-reveal" style={{ color: "#CBA153" }}>
              Book a free consultation
            </div>
            <h2
              className="font-serif-display fi-reveal fi-reveal-delay-1 mt-5"
              style={{
                fontSize: "clamp(2.2rem, 5vw, 4rem)",
                lineHeight: 1.05,
                color: "#1A1A1A",
              }}
            >
              Tell us about
              <br />
              <span style={{ color: "#CBA153", fontStyle: "italic" }}>your space.</span>
            </h2>
            <p
              className="mt-5 fi-reveal fi-reveal-delay-2"
              style={{ color: "#3a3a3a", lineHeight: 1.7, maxWidth: "480px" }}
            >
              Drop a few lines below and we'll call you back at your preferred time.
              No commitments, no fees — just an honest conversation about your project.
            </p>

            {status.ok ? (
              <div
                data-testid="contact-success"
                className="mt-10 p-7 fi-reveal"
                style={{ background: "#1A1A1A", color: "#F9F8F6", borderLeft: "2px solid #CBA153" }}
              >
                <CheckCircle2 size={28} style={{ color: "#CBA153" }} />
                <h3 className="font-serif-display text-2xl mt-4">Thank you.</h3>
                <p className="mt-3 text-sm" style={{ color: "rgba(249,248,246,0.7)", lineHeight: 1.7 }}>
                  We've received your enquiry and will be in touch shortly. For anything
                  urgent, please call us directly at {phone}.
                </p>
                <button
                  onClick={() => setStatus({ loading: false, ok: false, error: "" })}
                  className="btn-fi-gold mt-6"
                  style={{ padding: "0.7rem 1.4rem", fontSize: "0.7rem" }}
                  data-testid="contact-send-another"
                >
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 fi-reveal fi-reveal-delay-3">
                <Field name="name" label="Full Name" value={form.name} onChange={onChange} required />
                <Field name="phone" label="Phone Number" value={form.phone} onChange={onChange} required />
                <Field name="email" label="Email Address" type="email" value={form.email} onChange={onChange} required />
                <div className={`fi-field ${form.service ? "has-value" : ""}`}>
                  <select
                    id="service"
                    name="service"
                    value={form.service}
                    onChange={onChange}
                    data-testid="contact-field-service"
                  >
                    <option value=""></option>
                    {SERVICES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <label htmlFor="service">Service Interested In</label>
                </div>
                <Field
                  name="callback_time"
                  label="Preferred Callback Time"
                  value={form.callback_time}
                  onChange={onChange}
                  placeholder=" "
                />
                <div className={`fi-field md:col-span-2 ${form.message ? "has-value" : ""}`}>
                  <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={onChange}
                    required
                    placeholder=" "
                    data-testid="contact-field-message"
                  />
                  <label htmlFor="message">Tell us about your project *</label>
                </div>

                {status.error && (
                  <div
                    className="md:col-span-2 text-sm"
                    style={{ color: "#a33", padding: "0.6rem 0" }}
                    data-testid="contact-error"
                  >
                    {status.error}
                  </div>
                )}

                <div className="md:col-span-2 mt-2">
                  <button
                    type="submit"
                    disabled={status.loading}
                    className="btn-fi-dark"
                    data-testid="contact-submit-btn"
                  >
                    {status.loading ? (
                      <>
                        <span className="fi-spin" /> Sending...
                      </>
                    ) : (
                      <>
                        Send Enquiry <Send size={14} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Side: Address + Map */}
          <div className="fi-reveal fi-reveal-delay-2">
            <div className="grid grid-cols-1 gap-5">
              <div
                className="p-7"
                style={{ background: "#1A1A1A", color: "#F9F8F6" }}
                data-testid="contact-info-card"
              >
                <div className="flex items-start gap-4">
                  <MapPin size={20} style={{ color: "#CBA153" }} />
                  <div>
                    <div className="overline" style={{ color: "#CBA153" }}>
                      Visit Us
                    </div>
                    <p className="mt-2 text-sm" style={{ lineHeight: 1.7, color: "rgba(249,248,246,0.85)" }}>
                      {address}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 mt-6">
                  <Phone size={20} style={{ color: "#CBA153" }} />
                  <div>
                    <div className="overline" style={{ color: "#CBA153" }}>
                      Call
                    </div>
                    <a
                      href={`tel:${phone}`}
                      className="mt-2 block font-serif-display text-2xl"
                      style={{ color: "#F9F8F6" }}
                      data-testid="contact-phone-link"
                    >
                      {phone}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4 mt-6">
                  <Clock size={20} style={{ color: "#CBA153" }} />
                  <div>
                    <div className="overline" style={{ color: "#CBA153" }}>
                      Hours
                    </div>
                    <p className="mt-2 text-sm" style={{ color: "rgba(249,248,246,0.85)" }}>
                      {hours}
                    </p>
                  </div>
                </div>
                <a
                  href={`https://wa.me/91${whatsapp.startsWith("0") ? whatsapp.slice(1) : whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-fi-gold mt-7"
                  style={{ padding: "0.85rem 1.6rem", fontSize: "0.7rem" }}
                  data-testid="contact-whatsapp-link"
                >
                  WhatsApp Us <ArrowRight size={14} />
                </a>
              </div>

              <div
                className="overflow-hidden"
                style={{ aspectRatio: "16 / 11", border: "1px solid rgba(0,0,0,0.08)" }}
                data-testid="contact-map"
              >
                <iframe
                  title="Fashion Interior Map"
                  src="https://www.google.com/maps?q=Fashion+Interior+Rajarhat+Main+Road+Atghara+Kolkata&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: "grayscale(0.2) contrast(1.05)" }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating WhatsApp */}
      <a
        href={`https://wa.me/91${whatsapp.startsWith("0") ? whatsapp.slice(1) : whatsapp}`}
        target="_blank"
        rel="noreferrer"
        data-testid="floating-whatsapp"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-6 right-6 z-40 flex items-center justify-center"
        style={{
          width: 60,
          height: 60,
          background: "#25D366",
          borderRadius: "50%",
          boxShadow: "0 12px 30px rgba(37,211,102,0.45)",
          color: "#fff",
        }}
      >
        <MessageCircle size={26} />
      </a>
    </section>
  );
}
