import {
  Wallpaper,
  Layers,
  PanelTop,
  PaintRoller,
  Square,
  TreePine,
  Sprout,
  Flower2,
  Blinds,
  SquareDashed,
  Sparkles,
  Grid3x3,
  Box,
} from "lucide-react";

const services = [
  { icon: Wallpaper, title: "Wallpaper", desc: "Korean, German & Russian wallpapers — curated for taste and tested for India's humidity." },
  { icon: Square, title: "PVC Flooring", desc: "Wood, stone and matte finishes. Easy to install, easy to live with." },
  { icon: Layers, title: "Laminates", desc: "Premium decorative laminates for shutters, partitions and feature walls." },
  { icon: PaintRoller, title: "Customised Wallpaper", desc: "Print your moodboard. We'll plot, calibrate and install — wall by wall." },
  { icon: Box, title: "PVC Planks", desc: "Lock-fit waterproof planks. Install over old tiles in a single weekend." },
  { icon: TreePine, title: "Wooden Flooring", desc: "Engineered & laminated wooden floors. Hand-finished edge profiles, lifetime warranty." },
  { icon: Sprout, title: "Artificial Grass", desc: "UV-stable turf for balconies, terraces and showroom floors." },
  { icon: Flower2, title: "Artificial Planters", desc: "Photo-real green walls and statement planters — zero upkeep." },
  { icon: Blinds, title: "Blinds", desc: "Roller, roman, vertical and zebra blinds. Soft light, total privacy." },
  { icon: SquareDashed, title: "Customised Blinds", desc: "Printed and motorised blinds, made to your exact opening." },
  { icon: Sparkles, title: "Glass Film", desc: "Frosted, decorative and one-way films — for cabins, bathrooms and façades." },
  { icon: PanelTop, title: "PVC Laminates", desc: "Lightweight, mould-resistant laminates for bathrooms and modular kitchens." },
  { icon: Grid3x3, title: "3D Panels", desc: "Sculpted PVC, gypsum and PU 3D wall panels for cinematic feature walls." },
];

export default function Services() {
  return (
    <section
      id="services"
      data-testid="services-section"
      className="relative py-24 md:py-32 lg:py-40"
      style={{ background: "var(--fi-offwhite)" }}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <div>
            <div className="overline fi-reveal" style={{ color: "#CBA153" }}>
              What We Do
            </div>
            <h2
              className="font-serif-display fi-reveal fi-reveal-delay-1 mt-5"
              style={{
                fontSize: "clamp(2.2rem, 5vw, 4rem)",
                lineHeight: 1.05,
                color: "#1A1A1A",
              }}
            >
              Thirteen crafts.
              <br />
              <span style={{ color: "#CBA153", fontStyle: "italic" }}>One studio.</span>
            </h2>
          </div>
          <p
            className="max-w-md text-sm md:text-base fi-reveal fi-reveal-delay-2"
            style={{ color: "#3a3a3a", lineHeight: 1.7 }}
          >
            From a single feature wall to a turnkey commercial fit-out, every product is
            sourced, supplied and installed by our own team — no middlemen, no surprises.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
          {services.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                data-testid={`service-card-${s.title.toLowerCase().replace(/\s+/g, "-")}`}
                className="service-card fi-reveal cursor-pointer-fi"
                style={{ transitionDelay: `${(i % 4) * 0.06}s` }}
              >
                <div className="service-icon">
                  <Icon size={22} strokeWidth={1.5} />
                </div>
                <h3
                  className="font-serif-display mt-7"
                  style={{ fontSize: "1.55rem", color: "#1A1A1A", lineHeight: 1.2 }}
                >
                  {s.title}
                </h3>
                <p
                  className="mt-3 text-sm"
                  style={{ color: "#5a5a5a", lineHeight: 1.7, fontWeight: 300 }}
                >
                  {s.desc}
                </p>
                <div
                  className="mt-6 overline"
                  style={{ color: "#CBA153" }}
                >
                  0{i + 1 < 10 ? "0" + (i + 1) : i + 1}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
