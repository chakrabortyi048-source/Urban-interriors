import { useEffect, useRef } from "react";

/**
 * Per-letter cursor-tracked gold sparkle.
 *
 * 1. Instruments every element with class `fi-glow-text` by wrapping its
 *    text nodes into `<span class="fi-glow-char">` spans (idempotent).
 *    Existing `.fi-char` spans (typewriter/subtitle) are reused as-is.
 * 2. On mousemove, finds the character spans in the hovered `.fi-glow-text`
 *    that are within a soft radius of the cursor, and applies a proximity-
 *    weighted gold glow. Letters outside the radius smoothly fade back.
 * 3. Spawns gold sparkle particles at the cursor position while hovering
 *    text — each drifts up and fades over 700–1200ms.
 * 4. Auto-disabled on coarse-pointer / no-hover devices.
 */
export default function GoldSprinkle() {
  const lastLitRef = useRef([]);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine) and (hover: hover)");
    if (!mq.matches) return;

    const RADIUS = 70; // px — letters within this distance start to light up
    const SPAWN_INTERVAL = 42; // ms throttle for sparkle spawn
    let lastSpawn = 0;

    // ---- Character wrapping (idempotent) ----
    const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "BR"]);

    function wrapChars(root) {
      if (!root || root.dataset.glowInstrumented === "1") return;
      root.dataset.glowInstrumented = "1";

      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          // Skip empty / whitespace-only nodes
          if (!node.nodeValue || !/\S/.test(node.nodeValue)) {
            return NodeFilter.FILTER_REJECT;
          }
          // Skip nodes inside already-wrapped char spans
          let p = node.parentElement;
          while (p && p !== root) {
            if (SKIP_TAGS.has(p.tagName)) return NodeFilter.FILTER_REJECT;
            if (
              p.classList.contains("fi-glow-char") ||
              p.classList.contains("fi-char")
            ) {
              return NodeFilter.FILTER_REJECT;
            }
            p = p.parentElement;
          }
          return NodeFilter.FILTER_ACCEPT;
        },
      });
      const nodes = [];
      let n;
      while ((n = walker.nextNode())) nodes.push(n);

      nodes.forEach((textNode) => {
        const frag = document.createDocumentFragment();
        const text = textNode.nodeValue;
        for (const ch of text) {
          if (ch === " " || ch === "\u00A0") {
            frag.appendChild(document.createTextNode(ch));
          } else if (ch === "\n" || ch === "\t") {
            frag.appendChild(document.createTextNode(ch));
          } else {
            const span = document.createElement("span");
            span.className = "fi-glow-char";
            span.textContent = ch;
            frag.appendChild(span);
          }
        }
        textNode.parentNode.replaceChild(frag, textNode);
      });
    }

    function instrumentAll() {
      document.querySelectorAll(".fi-glow-text").forEach(wrapChars);
    }

    // Initial instrumentation + periodic re-run for lazy-loaded sections
    instrumentAll();
    const reinstrumentId = setInterval(instrumentAll, 1500);

    // ---- Sparkle particle ----
    const spawn = (x, y) => {
      const dot = document.createElement("div");
      dot.className = "fi-sparkle";
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.9;
      const dist = 28 + Math.random() * 60;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;
      const size = 3 + Math.random() * 4;
      const dur = 650 + Math.random() * 500;
      dot.style.left = x + "px";
      dot.style.top = y + "px";
      dot.style.width = size + "px";
      dot.style.height = size + "px";
      dot.style.setProperty("--dx", dx + "px");
      dot.style.setProperty("--dy", dy + "px");
      dot.style.animationDuration = dur + "ms";
      if (Math.random() < 0.4) {
        dot.style.background =
          "radial-gradient(circle, #FFF6D8 0%, #E9C57A 55%, rgba(203,161,83,0) 70%)";
      }
      document.body.appendChild(dot);
      setTimeout(() => dot.remove(), dur + 60);
    };

    // ---- Mouse handling ----
    const clearLit = () => {
      const last = lastLitRef.current;
      for (const el of last) {
        el.classList.remove("is-lit");
        el.style.removeProperty("--lit-intensity");
      }
      lastLitRef.current = [];
    };

    let rafId = 0;
    let pendingEvent = null;

    const process = () => {
      rafId = 0;
      const e = pendingEvent;
      if (!e) return;
      const hit = document.elementFromPoint(e.clientX, e.clientY);
      const target = hit && hit.closest ? hit.closest(".fi-glow-text") : null;

      // Clear old lit letters (fade-out via CSS transition)
      clearLit();

      if (!target) return;

      const chars = target.querySelectorAll(".fi-glow-char, .fi-char");
      const nextLit = [];
      for (const c of chars) {
        const r = c.getBoundingClientRect();
        if (!r.width || !r.height) continue;
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = cx - e.clientX;
        const dy = cy - e.clientY;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < RADIUS) {
          const intensity = 1 - d / RADIUS; // 0..1
          c.classList.add("is-lit");
          c.style.setProperty("--lit-intensity", intensity.toFixed(3));
          nextLit.push(c);
        }
      }
      lastLitRef.current = nextLit;

      // Spawn sparkles at cursor while over text (throttled)
      const now = performance.now();
      if (now - lastSpawn > SPAWN_INTERVAL) {
        lastSpawn = now;
        spawn(e.clientX, e.clientY);
      }
    };

    const onMove = (e) => {
      pendingEvent = e;
      if (!rafId) rafId = requestAnimationFrame(process);
    };

    const onLeave = () => {
      clearLit();
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);

    return () => {
      clearInterval(reinstrumentId);
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      clearLit();
      document.querySelectorAll(".fi-sparkle").forEach((n) => n.remove());
    };
  }, []);

  return null;
}
