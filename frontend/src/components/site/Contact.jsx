import { useEffect, useState } from "react";
import { MapPin, Phone, Clock, MessageCircle, Send, CheckCircle2 } from "lucide-react";
import { api, formatApiError } from "../../lib/api";

const SERVICES = [
  "Interior Painting",
  "Drywall Repair",
  "Wood Staining",
  "Bespoke Furniture",
  "Floor Sanding & Polishing",
  "Wood & Laminate Flooring",
  "Landscape Design",
  "Full Home Makeover",
  "Other",
];

function Field({ name, label, type = "text", value, onChange, required }) {
  return (
    <div className="mb-5">
      <label
        htmlFor={name}
        className="block mb-2 text-xs"
        style={{
          color: "var(--text-secondary)",
          fontWeight: 500,
          letterSpacing: "0.02em",
        }}
      >
        {label}
        {required && " *"}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        data-testid={`contact-field-${name}`}
        className="input-clean"
      />
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
        loading: false,
        ok: false,
        error: formatApiError(err.response?.data?.detail) || "Something went wrong.",
      });
    }
  };

  const phone = info?.phone || "8981230518";
  const whatsapp = (info?.whatsapp || phone).replace(/\D/g, "");
  const address =
    info?.address ||
    "211 Road, Chinar Park, Near Bharat Petroleum, Atghara, Tegharia, Newtown, Kolkata, West Bengal 700136";
  const secondaryAddress = info?.secondary_address || "";
  const hours = info?.hours || "Everyday · 24 hours open";

  return (
    <section
      id="contact"
      data-testid="contact-section"
      className="relative py-20 md:py-28 lg:py-32 bg-[var(--bg-default)]"
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Form */}
          <div>
            <div className="overline mb-4 fi-reveal" style={{ color: "var(--accent)" }}>
              Book a free consultation
            </div>
            <h2
              className="font-display fi-reveal fi-reveal-delay-1"
              style={{
                fontSize: "clamp(1.9rem, 4vw, 3rem)",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                color: "var(--text-main)",
                fontWeight: 500,
              }}
              data-testid="contact-heading"
            >
              Tell us about
              <br />
              <span style={{ color: "var(--accent)" }}>your space.</span>
            </h2>
            <p
              className="mt-5 fi-reveal fi-reveal-delay-2"
              style={{ color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: "480px" }}
            >
              Drop a few lines below and we'll call you back at your preferred time.
              No commitments, no fees — just an honest conversation about your project.
            </p>

            {status.ok ? (
              <div
                data-testid="contact-success"
                className="mt-10 p-8 card-minimal"
                style={{ background: "var(--accent-soft)", borderColor: "var(--accent)" }}
              >
                <CheckCircle2 size={28} style={{ color: "var(--accent)" }} />
                <div
                  className="font-display mt-4"
                  style={{ fontSize: "1.4rem", color: "var(--text-main)", fontWeight: 600 }}
                >
                  Thank you!
                </div>
                <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
                  We've received your enquiry. A member of our team will reach out within
                  a working day to schedule your free consultation.
                </p>
              </div>
            ) : (
              <form
                onSubmit={submit}
                data-testid="contact-form"
                className="mt-10 fi-reveal fi-reveal-delay-2"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
                  <Field name="name" label="Full Name" value={form.name} onChange={onChange} required />
                  <Field name="phone" label="Phone Number" value={form.phone} onChange={onChange} required />
                </div>
                <Field name="email" label="Email (optional)" type="email" value={form.email} onChange={onChange} />

                <div className="mb-5">
                  <label
                    htmlFor="service"
                    className="block mb-2 text-xs"
                    style={{ color: "var(--text-secondary)", fontWeight: 500 }}
                  >
                    Service of Interest
                  </label>
                  <select
                    id="service"
                    name="service"
                    value={form.service}
                    onChange={onChange}
                    data-testid="contact-field-service"
                    className="input-clean"
                  >
                    <option value="">— Select —</option>
                    {SERVICES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <Field
                  name="callback_time"
                  label="Preferred Callback Time (optional)"
                  value={form.callback_time}
                  onChange={onChange}
                />

                <div className="mb-5">
                  <label
                    htmlFor="message"
                    className="block mb-2 text-xs"
                    style={{ color: "var(--text-secondary)", fontWeight: 500 }}
                  >
                    Tell us about your project
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={form.message}
                    onChange={onChange}
                    data-testid="contact-field-message"
                    className="textarea-clean"
                  />
                </div>

                {status.error && (
                  <div
                    className="mb-4 text-sm"
                    style={{ color: "var(--accent)" }}
                    data-testid="contact-error"
                  >
                    {status.error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status.loading}
                  data-testid="contact-submit"
                  className="btn-primary mt-2 disabled:opacity-60"
                >
                  {status.loading ? "Sending…" : "Request Callback"}
                  <Send size={15} />
                </button>
              </form>
            )}
          </div>

          {/* Info */}
          <div className="fi-reveal fi-reveal-delay-2">
            <div
              className="card-minimal p-7 md:p-10"
              data-testid="contact-info-card"
            >
              <div className="overline" style={{ color: "var(--accent)" }}>
                Visit the Studio
              </div>

              <div className="mt-6 space-y-7">
                <div className="flex items-start gap-4">
                  <MapPin
                    size={20}
                    strokeWidth={1.6}
                    style={{ color: "var(--accent)", marginTop: 2 }}
                  />
                  <div>
                    <div
                      className="text-xs uppercase mb-1"
                      style={{
                        color: "var(--text-muted)",
                        letterSpacing: "0.15em",
                        fontWeight: 500,
                      }}
                    >
                      Main Branch
                    </div>
                    <div
                      style={{
                        color: "var(--text-main)",
                        fontWeight: 500,
                        lineHeight: 1.6,
                      }}
                      data-testid="contact-address"
                    >
                      {address}
                    </div>
                  </div>
                </div>

                {secondaryAddress && (
                  <div className="flex items-start gap-4">
                    <MapPin
                      size={20}
                      strokeWidth={1.6}
                      style={{ color: "var(--accent)", marginTop: 2 }}
                    />
                    <div>
                      <div
                        className="text-xs uppercase mb-1"
                        style={{
                          color: "var(--text-muted)",
                          letterSpacing: "0.15em",
                          fontWeight: 500,
                        }}
                      >
                        Branch Office
                      </div>
                      <div
                        style={{
                          color: "var(--text-main)",
                          fontWeight: 500,
                          lineHeight: 1.6,
                        }}
                        data-testid="contact-secondary-address"
                      >
                        {secondaryAddress}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <Phone
                    size={20}
                    strokeWidth={1.6}
                    style={{ color: "var(--accent)", marginTop: 2 }}
                  />
                  <div>
                    <div
                      className="text-xs uppercase mb-1"
                      style={{
                        color: "var(--text-muted)",
                        letterSpacing: "0.15em",
                        fontWeight: 500,
                      }}
                    >
                      Call Us
                    </div>
                    <a
                      href={`tel:${phone}`}
                      className="block hover:underline"
                      style={{ color: "var(--text-main)", fontWeight: 500 }}
                      data-testid="contact-phone"
                    >
                      {phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Clock
                    size={20}
                    strokeWidth={1.6}
                    style={{ color: "var(--accent)", marginTop: 2 }}
                  />
                  <div>
                    <div
                      className="text-xs uppercase mb-1"
                      style={{
                        color: "var(--text-muted)",
                        letterSpacing: "0.15em",
                        fontWeight: 500,
                      }}
                    >
                      Hours
                    </div>
                    <div style={{ color: "var(--text-main)", fontWeight: 500 }} data-testid="contact-hours">
                      {hours}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8" style={{ borderTop: "1px solid var(--border-light)" }}>
                <a
                  href={`https://wa.me/91${whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="contact-whatsapp"
                  className="btn-outline w-full justify-center"
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
