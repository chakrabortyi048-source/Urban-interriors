import { useEffect, useRef, useState } from "react";

/**
 * Premium gold cursor + scroll progress rail.
 * - Custom cursor with gold outer ring + inner dot that follows the mouse (eased).
 * - Ring "magnetizes" (grows + inverts fill) when hovering interactive elements.
 * - Auto-disabled on touch / coarse pointer devices (mobile, tablets).
 * - A thin gold progress rail on the right edge of the viewport fills as the
 *   user scrolls through the page.
 */
export default function PremiumCursor() {
  const [enabled, setEnabled] = useState(false);
  const ringRef = useRef(null);
  const dotRef = useRef(null);
  const progressRef = useRef(null);
  const stateRef = useRef({
    mx: 0, my: 0, rx: 0, ry: 0, dx: 0, dy: 0,
    hover: false, // over magnet
    active: false, // mouse down
    raf: 0,
    visible: false,
  });

  // Decide if premium cursor should be enabled (pointer: fine + no touch)
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

    // Hide system cursor while premium cursor runs
    document.documentElement.classList.add("fi-premium-cursor");

    const s = stateRef.current;

    const isMagnet = (el) => {
      if (!el || !el.closest) return false;
      return !!el.closest(
        'button, a, input, textarea, select, [role="button"], [data-cursor="magnet"], .cursor-pointer-fi'
      );
    };

    const onMove = (e) => {
      s.mx = e.clientX;
      s.my = e.clientY;
      if (!s.visible) {
        s.visible = true;
        if (ringRef.current) ringRef.current.style.opacity = "1";
        if (dotRef.current) dotRef.current.style.opacity = "1";
      }
    };
    const onOver = (e) => {
      const next = isMagnet(e.target);
      if (next !== s.hover) {
        s.hover = next;
        if (ringRef.current) {
          ringRef.current.dataset.magnet = next ? "1" : "0";
        }
      }
    };
    const onDown = () => {
      s.active = true;
      if (ringRef.current) ringRef.current.dataset.active = "1";
    };
    const onUp = () => {
      s.active = false;
      if (ringRef.current) ringRef.current.dataset.active = "0";
    };
    const onLeave = () => {
      s.visible = false;
      if (ringRef.current) ringRef.current.style.opacity = "0";
      if (dotRef.current) dotRef.current.style.opacity = "0";
    };

    // Scroll progress
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

    const tick = () => {
      // Lerp ring toward mouse (slower for elegance)
      s.rx += (s.mx - s.rx) * 0.18;
      s.ry += (s.my - s.ry) * 0.18;
      // Dot follows instantly
      s.dx = s.mx;
      s.dy = s.my;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${s.rx - 16}px, ${s.ry - 16}px, 0)`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${s.dx - 3}px, ${s.dy - 3}px, 0)`;
      }
      s.raf = requestAnimationFrame(tick);
    };
    s.raf = requestAnimationFrame(tick);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("mouseleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      document.documentElement.classList.remove("fi-premium-cursor");
      cancelAnimationFrame(s.raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("scroll", onScroll);
    };
  }, [enabled]);

  if (!enabled) {
    // Still render a lightweight scroll rail on mobile too? No — keep mobile clean.
    return null;
  }

  return (
    <>
      {/* Outer ring */}
      <div
        ref={ringRef}
        className="fi-cursor-ring"
        data-testid="premium-cursor-ring"
        aria-hidden
      />
      {/* Inner dot */}
      <div
        ref={dotRef}
        className="fi-cursor-dot"
        data-testid="premium-cursor-dot"
        aria-hidden
      />
      {/* Scroll progress rail on the right edge */}
      <div
        className="fi-scroll-rail"
        data-testid="scroll-progress-rail"
        aria-hidden
      >
        <div className="fi-scroll-rail-track" />
        <div ref={progressRef} className="fi-scroll-rail-fill" />
        <div className="fi-scroll-rail-label">
          <span>Scroll</span>
        </div>
      </div>
    </>
  );
}
