import React, { useState, useEffect } from "react";

// ============================================================
// AL MADINA RESTAURANT — Royal Top Scroll Progress Bar
// A glowing golden border line fixed at the very top of the website.
// - As the user scrolls down, the line grows smoothly from Left to Right.
// - As the user scrolls up, the line shrinks back towards the Left.
// Gives visitors a VIP reading indicator across the entire page!
// ============================================================

export default function ScrollProgressBar() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (height > 0) {
        const scrolled = (winScroll / height) * 100;
        setScrollProgress(Math.min(100, Math.max(0, scrolled)));
      } else {
        setScrollProgress(0);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none h-[3.5px] bg-black/40 overflow-hidden"
      aria-hidden="true"
    >
      <div
        className="h-full bg-gradient-to-r from-[#D4AF37] via-[#FFF3A8] to-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.9)] transition-all duration-100 ease-out"
        style={{
          width: `${scrollProgress}%`,
          transformOrigin: "left",
        }}
      />
    </div>
  );
}
