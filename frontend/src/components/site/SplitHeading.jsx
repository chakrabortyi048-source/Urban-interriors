import { useEffect, useRef, useState } from "react";

/**
 * Premium word-mask reveal heading.
 * Splits each text segment into words wrapped in clip-mask spans that
 * slide up + un-skew on intersection. Supports a primary line + accent line.
 *
 * Props:
 *  - primary: first line text (regular weight)
 *  - accent:  second line text (italic + gold)
 *  - tag:     "h1" | "h2" | "h3"  (default "h2")
 *  - className, style: passed to the heading element
 *  - staggerMs: per-word delay (default 70ms)
 *  - baseDelayMs: initial delay before first word (default 0)
 */
export default function SplitHeading({
  primary,
  accent,
  tag = "h2",
  className = "",
  style = {},
  staggerMs = 70,
  baseDelayMs = 0,
  testId,
}) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setOn(true);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -60px 0px" }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  const renderSegment = (text, startIndex, italicGold = false) => {
    const words = text.split(/(\s+)/);
    return words.map((w, i) => {
      if (/^\s+$/.test(w)) return <span key={`s-${startIndex}-${i}`}>{w}</span>;
      const idx = startIndex + i;
      return (
        <span key={`w-${startIndex}-${i}`} className="fi-split-word">
          <span
            style={{
              transitionDelay: `${baseDelayMs + idx * staggerMs}ms`,
              ...(italicGold ? { color: "#CBA153", fontStyle: "italic" } : {}),
            }}
          >
            {w}
          </span>
        </span>
      );
    });
  };

  const Tag = tag;
  const primaryWordCount = primary ? primary.split(/\s+/).filter(Boolean).length : 0;

  return (
    <Tag
      ref={ref}
      className={`fi-split ${on ? "in-view" : ""} ${className}`}
      style={style}
      data-testid={testId}
    >
      {primary && renderSegment(primary, 0, false)}
      {primary && accent && <br />}
      {accent && renderSegment(accent, primaryWordCount + 2, true)}
    </Tag>
  );
}

/**
 * Char-fade reveal for body paragraphs / long copy.
 * Splits text into chars (preserves spaces) with a soft staggered fade.
 */
export function CharReveal({
  text,
  className = "",
  style = {},
  staggerMs = 12,
  baseDelayMs = 100,
  as = "p",
  testId,
}) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setOn(true);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  const Tag = as;
  return (
    <Tag
      ref={ref}
      className={`fi-chars-reveal ${on ? "in-view" : ""} ${className}`}
      style={style}
      data-testid={testId}
    >
      {Array.from(text).map((c, i) => (
        <span
          key={i}
          className="fi-char"
          style={{
            transitionDelay: `${baseDelayMs + i * staggerMs}ms`,
            whiteSpace: c === " " ? "pre" : "normal",
          }}
        >
          {c}
        </span>
      ))}
    </Tag>
  );
}

/**
 * Overline that animates by spreading its letter-spacing on reveal.
 */
export function SpreadOverline({ text, className = "", style = {}, testId }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setOn(true);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <span
      ref={ref}
      className={`fi-overline-spread ${on ? "in-view" : ""} ${className}`}
      style={{
        textTransform: "uppercase",
        fontSize: "0.72rem",
        fontWeight: 500,
        ...style,
      }}
      data-testid={testId}
    >
      {text}
    </span>
  );
}
