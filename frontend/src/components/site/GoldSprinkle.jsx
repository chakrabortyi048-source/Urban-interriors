import { useEffect } from "react";

/**
 * Gold sparkle sprinkle effect.
 * - On `pointer: fine` devices only (auto-disabled on mobile/touch).
 * - When the cursor moves over any element with class `fi-glow-text`, the
 *   element's text gains a soft gold halo, AND tiny gold sparkle particles
 *   are spawned at the cursor position. Each sparkle drifts up + fades out.
 */
export default function GoldSprinkle() {
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine) and (hover: hover)");
    if (!mq.matches) return;

    let activeEl = null;
    let lastSpawn = 0;
    const SPAWN_INTERVAL = 38; // ms throttle

    const spawn = (x, y) => {
      const dot = document.createElement("div");
      dot.className = "fi-sparkle";
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.9; // mostly upward
      const dist = 30 + Math.random() * 70;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;
      const size = 3 + Math.random() * 5;
      const dur = 700 + Math.random() * 500;
      const hueShift = Math.random() < 0.4; // some sparkles are warmer cream
      dot.style.left = x + "px";
      dot.style.top = y + "px";
      dot.style.width = size + "px";
      dot.style.height = size + "px";
      dot.style.setProperty("--dx", dx + "px");
      dot.style.setProperty("--dy", dy + "px");
      dot.style.animationDuration = dur + "ms";
      if (hueShift) dot.style.background =
        "radial-gradient(circle, #FFF6D8 0%, #E9C57A 55%, rgba(203,161,83,0) 70%)";
      document.body.appendChild(dot);
      setTimeout(() => dot.remove(), dur + 50);
    };

    const onMove = (e) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const target = el && el.closest ? el.closest(".fi-glow-text") : null;

      if (target !== activeEl) {
        if (activeEl) activeEl.classList.remove("is-glowing");
        if (target) target.classList.add("is-glowing");
        activeEl = target;
      }

      if (target) {
        const now = performance.now();
        if (now - lastSpawn > SPAWN_INTERVAL) {
          lastSpawn = now;
          spawn(e.clientX, e.clientY);
        }
      }
    };

    const onLeave = () => {
      if (activeEl) {
        activeEl.classList.remove("is-glowing");
        activeEl = null;
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      if (activeEl) activeEl.classList.remove("is-glowing");
      // Cleanup any leftover sparkles
      document.querySelectorAll(".fi-sparkle").forEach((n) => n.remove());
    };
  }, []);

  return null;
}
