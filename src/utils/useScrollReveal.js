import { useEffect } from "react";

// ============================================================
// AL MADINA RESTAURANT — Scroll Reveal Hook
// Automatically observes elements with 3D reveal classes:
// .reveal-left, .reveal-right, .reveal-3d-up
// Adds .revealed when scrolled into view, allowing animations
// to smoothly glide in from left and right as requested!
// ============================================================

export function useScrollReveal() {
  useEffect(() => {
    const handleObserve = () => {
      const targets = document.querySelectorAll(
        ".reveal-left, .reveal-right, .reveal-3d-up"
      );

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("revealed");
            } else {
              // When scrolled out by a margin, remove to allow re-animating when scrolling up/down
              const rect = entry.target.getBoundingClientRect();
              if (rect.top > window.innerHeight || rect.bottom < 0) {
                entry.target.classList.remove("revealed");
              }
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: "0px 0px -40px 0px",
        }
      );

      targets.forEach((el) => {
        // If element is already in initial viewport on page load, reveal it
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add("revealed");
        }
        observer.observe(el);
      });

      return () => observer.disconnect();
    };

    const cleanup = handleObserve();

    // Re-check when URL changes or content loads
    window.addEventListener("scroll", () => {}, { passive: true });
    return () => {
      if (cleanup) cleanup();
    };
  }, []);
}
