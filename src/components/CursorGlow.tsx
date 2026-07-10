import { useEffect, useState } from "react";
import { m, useMotionValue, useSpring, useReducedMotion } from "motion/react";

const SIZE = 640;

/**
 * A soft radial glow that trails the cursor with a little spring lag — same
 * treatment as mo-alyousif.com. It lives beneath the page's opaque surfaces
 * (-z-10 above the body canvas), so it reads as ambient light bleeding out
 * from behind the content: through the glass header, around the grid card's
 * margins. Desktop-only (hover + fine pointer); absent under reduced motion.
 * Cursor position drives motion values directly, so it never re-renders on
 * pointer move.
 */
export default function CursorGlow() {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const x = useMotionValue(-SIZE); /* parked offscreen until the first move */
  const y = useMotionValue(-SIZE);
  const sx = useSpring(x, { stiffness: 100, damping: 30, mass: 0.8 });
  const sy = useSpring(y, { stiffness: 100, damping: 30, mass: 0.8 });

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!enabled || reduce) return;
    const onMove = (e: PointerEvent) => {
      x.set(e.clientX - SIZE / 2);
      y.set(e.clientY - SIZE / 2);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled, reduce, x, y]);

  if (!enabled || reduce) return null;

  return (
    <m.div
      aria-hidden="true"
      className="fixed left-0 top-0 -z-10 pointer-events-none rounded-full"
      style={{
        x: sx,
        y: sy,
        width: SIZE,
        height: SIZE,
        background:
          "radial-gradient(closest-side, color-mix(in oklab, var(--heritage-primary) 10%, transparent), transparent 70%)",
      }}
    />
  );
}
