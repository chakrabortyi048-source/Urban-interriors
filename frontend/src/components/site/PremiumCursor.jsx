import { useEffect, useRef, useState } from "react";

/**
 * Scroll-to-explore rail.
 * (The custom gold cursor was replaced with the native system arrow at the
 *  user's request; only the side scroll-progress indicator remains.)
 *
 * Renders a thin gold rail on the right edge of the viewport whose fill
 * grows as the user scrolls through the page. Hidden on touch devices.
 */
export default function PremiumCursor() {
  const [enabled, setEnabled] = useState(false);
  const progressRef = useRef(null);

  useEffect(() => {
    const mqFine = window.matchMedia("(pointer: fine)");
    const mqHover = window.matchMedia("(hover: hover)");
    const apply = () => setEnabled(mqFine.matches && mqHover.matches);
    apply();
    mqFine.addEventListener?.("change", apply);
    mqHover.addEventListener?.("change", apply);
    return () => {
      mqFine.removeEventListener?.("change", apply);
      mqHover.removeEventListener?.("change", apply);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const scrollHeight = doc.scrollHeight - doc.clientHeight;
      const p = scrollHeight > 0 ? Math.min(1, Math.max(0, scrollTop / scrollHeight)) : 0;
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleY(${p})`;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="fi-scroll-rail" data-testid="scroll-progress-rail" aria-hidden>
      <div className="fi-scroll-rail-track" />
      <div ref={progressRef} className="fi-scroll-rail-fill" />
      <div className="fi-scroll-rail-label">
        <span>Scroll</span>
      </div>
    </div>
  );
}
