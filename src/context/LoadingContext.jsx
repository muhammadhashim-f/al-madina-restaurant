import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { Sparkles, CheckCircle2 } from "lucide-react";

// ============================================================
// AL MADINA RESTAURANT — VIP Royal Action & Navigation Loader
// Features:
// - Authentic Al Madina Royal Arch & Crown Logo in center (replacing template icons)
// - Dynamic percentage progress (0% -> 100%) that matches action duration
// - Golden spinning rings & ambient royal radiance
// - Configurable realistic durations (e.g., 1.2s for cart/favorites, 2.5s for auth/nav, 3.5s for orders)
// ============================================================

const LoadingContext = createContext(null);

// Authentic Al Madina Arch Emblem used across the site
function RoyalLogoEmblem({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className="drop-shadow-[0_0_12px_rgba(212,175,55,0.7)]">
      {/* Outer Royal Crest Glow Frame */}
      <rect width="48" height="48" rx="14" fill="#0E0D09" stroke="#D4AF37" strokeWidth="1.5" strokeOpacity="0.8" />
      {/* Golden Traditional Arch */}
      <path
        d="M12 36 V23 C12 16.37 17.37 11 24 11 C30.63 11 36 16.37 36 23 V36 H12 Z"
        stroke="#D4AF37"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="rgba(212,175,55,0.18)"
      />
      {/* Royal Center Star / Gem */}
      <circle cx="24" cy="21" r="3.6" fill="#FFF2A3" stroke="#D4AF37" strokeWidth="1.2" />
      {/* Crown Crest Star Top */}
      <path
        d="M24 6.5 L25 8.5 L27.2 8.8 L25.6 10.4 L26 12.6 L24 11.5 L22 12.6 L22.4 10.4 L20.8 8.8 L23 8.5 Z"
        fill="#D4AF37"
      />
    </svg>
  );
}

export function LoadingProvider({ children }) {
  const [loadingState, setLoadingState] = useState({
    active: false,
    title: "Al Madina Shahi Kitchen",
    subtitle: "Tayyari aur verification jari hai...",
    duration: 2200,
  });

  const [progress, setProgress] = useState(0);
  const progressTimerRef = useRef(null);

  const triggerLoader = useCallback((title, subtitle, duration = 2200, callback = null) => {
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    setProgress(0);

    setLoadingState({
      active: true,
      title: title || "Al Madina Restaurant",
      subtitle: subtitle || "Barah-e-karam intezar farmayein, VIP processing jari hai...",
      duration,
    });

    const intervalStep = 25; // 25ms per tick
    const totalSteps = duration / intervalStep;
    let currentStep = 0;

    progressTimerRef.current = setInterval(() => {
      currentStep++;
      const currentPct = Math.min(100, Math.round((currentStep / totalSteps) * 100));
      setProgress(currentPct);

      if (currentStep >= totalSteps) {
        clearInterval(progressTimerRef.current);
      }
    }, intervalStep);

    return new Promise((resolve) => {
      setTimeout(() => {
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
        setProgress(100);
        setLoadingState((prev) => ({ ...prev, active: false }));
        if (callback) callback();
        resolve(true);
      }, duration);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, []);

  return (
    <LoadingContext.Provider value={{ triggerLoader, loadingState }}>
      {children}

      {loadingState.active && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-black/92 backdrop-blur-md transition-all duration-300"
        >
          {/* Subtle Ambient Golden Glow */}
          <div className="absolute w-80 h-80 rounded-full bg-[#D4AF37]/15 blur-3xl pointer-events-none animate-pulse" />

          {/* Central Royal Spinner Frame */}
          <div className="relative flex flex-col items-center text-center px-6 max-w-sm">
            <div className="relative w-28 h-28 mb-6 flex items-center justify-center">
              {/* Outer Golden Rotating Ring */}
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#D4AF37] border-r-[#FFF2A3] animate-spin" />
              {/* Inner Counter-Rotating Dashed Ring */}
              <div
                className="absolute inset-2 rounded-full border-2 border-dashed border-[#D4AF37]/40 border-b-[#D4AF37] animate-spin"
                style={{ animationDirection: "reverse", animationDuration: "1.8s" }}
              />
              {/* Center Royal Website Arch Logo (Replaces any template icon) */}
              <div className="relative z-10 transition-transform duration-300 transform hover:scale-105">
                <RoyalLogoEmblem size={54} />
              </div>
            </div>

            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#FFF2A3] text-[11px] font-semibold tracking-wider uppercase mb-3 shadow-[0_0_10px_rgba(212,175,55,0.2)]">
              <Sparkles size={13} className="text-[#D4AF37] animate-spin" style={{ animationDuration: "3s" }} />
              Al Madina VIP Processing
            </div>

            {/* Title */}
            <h3
              className="text-xl sm:text-2xl font-bold text-white mb-2 tracking-wide"
              style={{ fontFamily: "'Amiri', serif" }}
            >
              {loadingState.title}
            </h3>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed max-w-xs mb-4">
              {loadingState.subtitle}
            </p>

            {/* Live Progress Percentage & Bar */}
            <div className="w-56 flex flex-col gap-1.5 mt-2">
              <div className="flex justify-between items-center text-[11px] font-mono text-[#D4AF37]">
                <span>Speed Optimization</span>
                <span className="font-bold">{progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden border border-[#D4AF37]/30">
                <div
                  className="h-full bg-gradient-to-r from-[#D4AF37] via-[#FFF2A3] to-[#D4AF37] transition-all duration-75 ease-out shadow-[0_0_8px_rgba(212,175,55,0.8)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
}

export function useVIPLoader() {
  const ctx = useContext(LoadingContext);
  if (!ctx) {
    return {
      triggerLoader: (title, subtitle, duration = 2000, cb = null) => {
        return new Promise((res) => {
          setTimeout(() => {
            if (cb) cb();
            res(true);
          }, duration);
        });
      },
      loadingState: { active: false },
    };
  }
  return ctx;
}
