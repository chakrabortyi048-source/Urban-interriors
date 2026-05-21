import { Clock, IndianRupee, Hammer, ShieldCheck, Heart } from "lucide-react";

const points = [
  {
    icon: Clock,
    title: "On-Time, Every Time",
    desc: "Quoted dates honoured — installations, deliveries and site visits run on the clock our clients trust us for.",
  },
  {
    icon: IndianRupee,
    title: "Budget-Friendly Luxury",
    desc: "Imported quality at street-level pricing. We move volumes, so you get fair rates without compromise.",
  },
  {
    icon: Hammer,
    title: "End-to-End Service",
    desc: "From mood-board to final clean-up. Our own installers handle every wall, plank and blind — no third parties.",
  },
  {
    icon: ShieldCheck,
    title: "Trusted Chinar Park Studio",
    desc: "A familiar face in Chinar Park — rated highly by clients for reliable delivery and calm, professional site conduct.",
  },
  {
    icon: Heart,
    title: "Owner-Led Care",
    desc: "Every project is owned end-to-end by the studio — from the first site visit to the final polish on the floor.",
  },
];

export default function WhyChooseUs() {
  return (
    <section
      id="why"
      data-testid="why-section"
      className="relative py-20 md:py-28 lg:py-32 bg-[var(--bg-elevated)]"
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 mb-12 md:mb-16">
          <div className="lg:col-span-6">
            <div className="overline mb-4 fi-reveal" style={{ color: "var(--accent)" }}>
              Why Urban Interiors
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
              data-testid="why-heading"
            >
              Five reasons our
              <br />
              <span style={{ color: "var(--accent)" }}>clients keep coming back.</span>
            </h2>
          </div>
          <div className="lg:col-span-6 flex items-end">
            <p
              className="fi-reveal fi-reveal-delay-2"
              style={{
                color: "var(--text-secondary)",
                lineHeight: 1.75,
                maxWidth: "500px",
              }}
            >
              Many of our clients return for their second, fifth or eighth project.
              Read why below — then read the reviews of two dozen of them, in their
              own words.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {points.map((p, i) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                data-testid={`why-card-${i}`}
                className="card-minimal fi-reveal p-7 md:p-8"
                style={{ transitionDelay: `${(i % 3) * 0.08}s` }}
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
                <h3
                  className="font-display mt-6"
                  style={{
                    fontSize: "1.2rem",
                    lineHeight: 1.3,
                    color: "var(--text-main)",
                    fontWeight: 600,
                  }}
                >
                  {p.title}
                </h3>
                <p
                  className="mt-3 text-sm"
                  style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}
                >
                  {p.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
