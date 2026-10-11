import React, { useState, useEffect, useRef } from "react";
import { WifiOff, AlertTriangle, RefreshCw, Activity, X } from "lucide-react";

// ============================================================
// AL MADINA RESTAURANT — Smart & Polite Network Monitor
// User requirement:
// 1. Do NOT continuously annoy user or show false alarms while net is working.
// 2. When an actual issue appears, show for only 3-4 seconds and then AUTO-HIDE smoothly.
// 3. While scrolling, do NOT pop up again.
// 4. Only show again if user clicks a button/link (action) and network fails.
// ============================================================

export default function NetworkSpeedLoader() {
  const [showNotification, setShowNotification] = useState(false);
  const [reason, setReason] = useState("slow"); // "offline" | "slow"
  const autoHideTimerRef = useRef(null);

  const displayWarning = (type = "slow") => {
    setReason(type);
    setShowNotification(true);

    if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current);
    // Auto-hide after 3.2 seconds so it doesn't linger or block the screen
    autoHideTimerRef.current = setTimeout(() => {
      setShowNotification(false);
    }, 3200);
  };

  useEffect(() => {
    // 1. Genuine browser offline event
    const handleOffline = () => {
      displayWarning("offline");
    };

    const handleOnline = () => {
      setShowNotification(false);
      if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current);
    };

    // 2. Custom event triggered when user clicks an action or fetch fails
    const handleActionNetworkIssue = (e) => {
      displayWarning(e?.detail?.type || "slow");
    };

    // 3. Intercept window click on links/buttons: if navigator.onLine is false, warn immediately
    const handleUserClick = (e) => {
      const target = e.target.closest("button, a, input[type='submit']");
      if (target && !navigator.onLine) {
        displayWarning("offline");
      }
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    window.addEventListener("almadina_network_issue", handleActionNetworkIssue);
    document.addEventListener("click", handleUserClick, true);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("almadina_network_issue", handleActionNetworkIssue);
      document.removeEventListener("click", handleUserClick, true);
      if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current);
    };
  }, []);

  if (!showNotification) {
    return null;
  }

  return (
    <div className="fixed bottom-24 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-[9999] animate-bounce-subtle pointer-events-auto">
      <div className="p-4 rounded-2xl bg-[#0F0E0B]/95 border-2 border-amber-500/60 shadow-[0_15px_40px_rgba(0,0,0,0.85),0_0_25px_rgba(212,175,55,0.25)] backdrop-blur-md text-white">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              {reason === "offline" ? <WifiOff size={18} /> : <AlertTriangle size={18} />}
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-400">
                {reason === "offline" ? "Internet Disconnected" : "Network Response Slow"}
              </h4>
              <p className="text-[10px] text-white/50">
                Al Madina Restaurant · Auto-hides in a few seconds
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowNotification(false)}
            className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-white/50 hover:text-white cursor-pointer"
            aria-label="Close"
          >
            <X size={13} />
          </button>
        </div>

        <p className="text-xs text-white/80 leading-relaxed">
          {reason === "offline"
            ? "Aapka device internet se disconnect ho chuka hai. Dobara connect hone par data sync ho jayega."
            : "Internet connection thoda slow hai, barah-e-karam intezar farmayein."}
        </p>

        <div className="w-full bg-white/10 h-1 rounded-full mt-3 overflow-hidden">
          <div className="bg-amber-400 h-full w-full animate-[shrink_3.2s_linear_forwards]" />
        </div>
      </div>
    </div>
  );
}
