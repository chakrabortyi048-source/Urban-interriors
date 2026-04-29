import { useEffect, useState } from "react";

export default function PageLoader() {
  const [hidden, setHidden] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setClosing(true), 1500);
    const t2 = setTimeout(() => setHidden(true), 2200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (hidden) return null;
  const word = "FASHION INTERIOR";
  return (
    <div
      className="fi-loader"
      style={{
        opacity: closing ? 0 : 1,
        transform: closing ? "translateY(-100%)" : "translateY(0)",
        transition: "opacity 0.6s ease, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      data-testid="page-loader"
    >
      <div className="fi-loader-text">
        {word.split("").map((c, i) => (
          <span key={i} style={{ animationDelay: `${i * 0.04}s` }}>
            {c === " " ? "\u00A0" : c}
          </span>
        ))}
      </div>
      <div className="fi-loader-line" />
      <div className="overline" style={{ color: "rgba(203,161,83,0.8)", letterSpacing: "0.4em" }}>
        Kolkata · Since 1985
      </div>
    </div>
  );
}
