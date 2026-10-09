import React, { createContext, useContext, useState, useCallback } from "react";
import { Utensils, Sparkles } from "lucide-react";

// ============================================================
// AL MADINA RESTAURANT — VIP Action & Navigation Loader
// Shows an elegant royal gold transition loader (2-3 seconds)
// when navigating between sections or performing VIP actions
// (placing orders, submitting reviews, verifying data).
// Gives guests a premium, high-speed responsive experience!
// ============================================================

const LoadingContext = createContext(null);

export function LoadingProvider({ children }) {
  const [loadingState, setLoadingState] = useState({
    active: false,
    title: "Al Madina Shahi Kitchen",
    subtitle: "Tayyari aur verification jari hai...",
    actionType: "general", // "navigate" | "order" | "review" | "auth" | "general"
  });

  const triggerLoader = useCallback((title, subtitle, duration = 2200, callback = null) => {
    setLoadingState({
      active: true,
      title: title || "Al Madina Restaurant",
      subtitle: subtitle || "Section loading... Barah-e-karam intezar farmayein",
      actionType: "general",
    });

    return new Promise((resolve) => {
      setTimeout(() => {
        setLoadingState((prev) => ({ ...prev, active: false }));
        if (callback) callback();
        resolve(true);
      }, duration);
    });
  }, []);

  return (
    <LoadingContext.Provider value={{ triggerLoader, loadingState }}>
      {children}
      {loadingState.active && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md transition-all duration-300"
        >
          {/* Subtle Ambient Glowing Orbs */}
          <div className="absolute w-72 h-72 rounded-full bg-[#D4AF37]/15 blur-3xl pointer-events-none animate-pulse" />

          {/* Central Royal Spinner Frame */}
          <div className="relative flex flex-col items-center text-center px-6 max-w-sm">
            <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
              {/* Outer Golden Rotating Ring */}
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#D4AF37] border-r-[#F0DFA0] animate-spin" />
              {/* Inner Counter-Rotating Ring */}
              <div
                className="absolute inset-2 rounded-full border-2 border-dashed border-[#D4AF37]/30 border-b-[#D4AF37] animate-spin"
                style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
              />
              {/* Center Royal Icon */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1C180A] to-[#0A0A0A] border border-[#D4AF37]/50 flex items-center justify-center shadow-lg shadow-[#D4AF37]/20">
                <Utensils size={22} className="text-[#F0DFA0] animate-bounce" />
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#F0DFA0] text-xs font-semibold uppercase tracking-widest mb-3">
              <Sparkles size={13} className="text-[#D4AF37]" />
              VIP Fast Experience
            </div>
            <h3
              className="text-xl sm:text-2xl font-bold text-white mb-2 tracking-wide"
              style={{ fontFamily: "'Amiri', serif" }}
            >
              {loadingState.title}
            </h3>
            <p className="text-xs sm:text-sm text-white/60 leading-relaxed max-w-xs">
              {loadingState.subtitle}
            </p>

            {/* Progress Bar Animation */}
            <div className="w-48 h-1 bg-white/10 rounded-full mt-6 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#D4AF37] via-[#F0DFA0] to-[#D4AF37] animate-[shimmerSweep_1.5s_infinite]"
                style={{
                  width: "100%",
                  backgroundSize: "200% 100%",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
}

export function useVIPLoader() {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error("useVIPLoader must be used within LoadingProvider");
  return ctx;
}
