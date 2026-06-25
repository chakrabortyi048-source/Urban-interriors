import { Palette, Hammer, Armchair } from "lucide-react";
import SplitHeading, { SpreadOverline } from "./SplitHeading";

const services = [
  {
    icon: Palette,
    category: "Interior Designer",
    title: "Interior Painting",
    desc: "Refreshing coats, flawless finishes and colour consults that set the tone for every room — interior painting done the right way.",
  },
  {
    icon: Hammer,
    category: "Kitchen Renovator",
    title: "Drywall Repair",
    desc: "Cracked walls, damp patches, ceiling joints — we patch, skim and seal drywalls so your kitchen walls look brand new again.",
  },
  {
    icon: Armchair,
    category: "Furniture Maker",
    title: "Wood Staining",
    desc: "Rich, durable wood stains for furniture, flooring and cabinetry — hand-finished in our workshop, installed at your home.",
  },
];

export default function Services() {
  return (
    <section
      id="services"
      data-testid="services-section"
      style={{ background: "var(--fi-offwhite)" }}
      className="relative py-24 md:py-32 lg:py-40"
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div>
            <SpreadOverline text="What We Do" style={{ color: "#CBA153" }} />
            <SplitHeading
              primary="Three crafts."
              accent="One studio."
              className="font-serif-display mt-5"
              style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)", lineHeight: 1.05, color: "#1A1A1A" }}
              testId="services-heading"
            />
          </div>
          <p
            className="max-w-md text-sm md:text-base fi-reveal fi-reveal-delay-2 fi-glow-text"
            style={{ color: "#3a3a3a", lineHeight: 1.7 }}
          >
            From a single feature wall to a turnkey home makeover, every service is
            sourced, supplied and finished by our own team — no middlemen, no surprises.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {services.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                data-testid={`service-card-${s.title.toLowerCase().replace(/\s+/g, "-")}`}
                className="p-8 md:p-10 fi-reveal transition-all duration-500"
                style={{
                  background: "#fff",
                  border: "1px solid rgba(0,0,0,0.06)",
                  borderLeft: "2px solid #CBA153",
                  transitionDelay: `${i * 0.08}s`,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 22px 50px -20px rgba(203,161,83,0.4)")}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
              >
                <div className="w-12 h-12 flex items-center justify-center"
                  style={{ background: "rgba(203,161,83,0.08)", color: "#CBA153", borderRadius: 2 }}>
                  <Icon size={22} strokeWidth={1.5} />
                </div>
                <div className="overline mt-6" style={{ color: "#737373" }}>{s.category}</div>
                <h3 className="font-serif-display mt-3"
                  style={{ fontSize: "1.6rem", color: "#1A1A1A", lineHeight: 1.2 }}>
                  {s.title}
                </h3>
                <p className="mt-4 text-sm"
                  style={{ color: "#3a3a3a", lineHeight: 1.7, fontWeight: 300 }}>
                  {s.desc}
                </p>
                <div className="overline mt-8" style={{ color: "#CBA153", fontSize: "0.66rem" }}>
                  0{i + 1}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
