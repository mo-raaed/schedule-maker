import { useEffect, useRef } from "react";

export default function FluidBackground() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let isVisible = false;

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!isVisible && glowRef.current) {
        glowRef.current.style.opacity = "1";
        isVisible = true;
      }
    };

    window.addEventListener("mousemove", onMouseMove);

    let animationId: number;
    const loop = () => {
      current.x += (mouse.x - current.x) * 0.35;
      current.y += (mouse.y - current.y) * 0.35;
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${current.x - 100}px, ${current.y - 100}px, 0)`;
      }
      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      <div
        ref={glowRef}
        className="absolute top-0 left-0 w-[200px] h-[200px] rounded-full
          bg-[#4993FA]/20 dark:bg-[#4993FA]/30
          blur-[80px] will-change-transform transition-opacity duration-1000 opacity-0"
      />
    </div>
  );
}
