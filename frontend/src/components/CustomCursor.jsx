import { useEffect, useState } from "react";

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [hover, setHover] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    setEnabled(isFinePointer);
    if (!isFinePointer) return;

    const move = (e) => setPos({ x: e.clientX, y: e.clientY });
    const over = (e) => {
      const t = e.target;
      if (
        t.closest("a, button, [role='button'], input, textarea, select, .cursor-pointer-fi")
      ) {
        setHover(true);
      } else {
        setHover(false);
      }
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
    };
  }, []);

  if (!enabled) return null;
  return (
    <>
      <div
        className="fi-cursor-dot"
        style={{ transform: `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)` }}
      />
      <div
        className={`fi-cursor-ring ${hover ? "hover" : ""}`}
        style={{ transform: `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)` }}
      />
    </>
  );
}
