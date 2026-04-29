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
    title: "Trusted Local Studio",
    desc: "Four decades on Rajarhat Road. Rated five stars by hundreds of Kolkata families and businesses.",
  },
  {
    icon: Heart,
    title: "Genuine, Family-Run Care",
    desc: "Owner-led service. Manoj ji and Aniket ji answer the phone — and own every project from quote to handover.",
  },
];

export default function WhyChooseUs() {
  return (
    <section
      id="why"
      data-testid="why-section"
      className="relative py-24 md:py-32 lg:py-40"
      style={{ background: "#161616", color: "#F9F8F6" }}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <div className="overline fi-reveal" style={{ color: "#CBA153" }}>
              Why Fashion Interior
            </div>
            <h2
              className="font-serif-display fi-reveal fi-reveal-delay-1 mt-5"
              style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)", lineHeight: 1.05 }}
            >
              Five reasons our
              <br />
              <span style={{ color: "#CBA153", fontStyle: "italic" }}>
                clients keep coming back.
              </span>
            </h2>
            <p
              className="mt-6 fi-reveal fi-reveal-delay-2"
              style={{
                color: "rgba(249,248,246,0.65)",
                lineHeight: 1.8,
                fontWeight: 300,
                maxWidth: "440px",
              }}
            >
              Many of our clients return for their second, fifth or eighth project. Read why
              below — then read the reviews of two dozen of them, in their own words.
            </p>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-px" style={{ background: "rgba(255,255,255,0.08)" }}>
            {points.map((p, i) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  data-testid={`why-card-${i}`}
                  className="fi-reveal p-7 md:p-8 transition-all duration-500 cursor-pointer-fi"
                  style={{ background: "#161616", transitionDelay: `${i * 0.08}s` }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#1d1d1d")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#161616")}
                >
                  <div
                    className="w-12 h-12 flex items-center justify-center"
                    style={{
                      border: "1px solid rgba(203,161,83,0.4)",
                      color: "#CBA153",
                      borderRadius: 2,
                    }}
                  >
                    <Icon size={22} strokeWidth={1.5} />
                  </div>
                  <h3
                    className="font-serif-display mt-6"
                    style={{ fontSize: "1.5rem", lineHeight: 1.2 }}
                  >
                    {p.title}
                  </h3>
                  <p
                    className="mt-3 text-sm"
                    style={{ color: "rgba(249,248,246,0.6)", lineHeight: 1.7, fontWeight: 300 }}
                  >
                    {p.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
