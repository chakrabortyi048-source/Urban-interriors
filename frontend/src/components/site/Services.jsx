import { Palette, Hammer, Armchair } from "lucide-react";

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
      className="relative py-20 md:py-28 lg:py-32 bg-[var(--bg-default)]"
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 md:mb-16">
          <div>
            <div className="overline mb-4 fi-reveal" style={{ color: "var(--accent)" }}>
              What We Do
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
              data-testid="services-heading"
            >
              Three crafts.
              <br />
              <span style={{ color: "var(--accent)" }}>One studio.</span>
            </h2>
          </div>
          <p
            className="max-w-md text-sm md:text-base fi-reveal fi-reveal-delay-2"
            style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}
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
                className="card-minimal fi-reveal p-8 md:p-10"
                style={{ transitionDelay: `${i * 0.08}s` }}
              >
                <div
                  className="w-12 h-12 flex items-center justify-center"
                  style={{
                    background: "var(--accent-soft)",
                    color: "var(--accent)",
                    borderRadius: "2px",
                  }}
                >
                  <Icon size={20} strokeWidth={1.6} />
                </div>
                <div className="overline mt-7" style={{ color: "var(--text-muted)" }}>
                  {s.category}
                </div>
                <h3
                  className="font-display mt-3"
                  style={{
                    fontSize: "1.45rem",
                    color: "var(--text-main)",
                    lineHeight: 1.25,
                    fontWeight: 600,
                  }}
                >
                  {s.title}
                </h3>
                <p
                  className="mt-4 text-sm"
                  style={{ color: "var(--text-secondary)", lineHeight: 1.75 }}
                >
                  {s.desc}
                </p>
                <div
                  className="mt-8 overline"
                  style={{ color: "var(--accent)", fontSize: "0.65rem" }}
                >
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
