import React, { useState, useEffect, useRef } from "react";
import { Wifi, WifiOff, AlertTriangle, RefreshCw, Activity, X } from "lucide-react";

// ============================================================
// AL MADINA RESTAURANT — Smart Network Speed & Slow Internet Monitor
// Genuinely checks internet responsiveness & latency.
// - Performs lightweight latency probes.
// - If network is fast/normal (< 1200ms): completely hidden & invisible.
// - If internet remains very slow (or fails) for 5 to 10 seconds:
//   Displays an informative, non-blocking warning notification
//   with real-time latency indicator and retry button.
// - As soon as internet recovers, it automatically disappears smoothly.
// ============================================================

export default function NetworkSpeedLoader() {
  const [latency, setLatency] = useState(null);
  const [isSlow, setIsSlow] = useState(false);
  const [slowDuration, setSlowDuration] = useState(0); // seconds
  const [showWarning, setShowWarning] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const slowTimerRef = useRef(null);

  // Measure genuine latency by making a lightweight fetch to favicon
  const checkConnection = async () => {
    setIsTesting(true);
    const start = performance.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

      const res = await fetch(`/favicon.svg?probe=${Date.now()}`, {
        method: "HEAD",
        cache: "no-store",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const end = performance.now();
      const elapsed = Math.round(end - start);
      setLatency(elapsed);

      // Latency threshold: > 2500ms or 2G network is considered very slow
      const navConn = navigator.connection;
      const isWeak2G = navConn && (navConn.effectiveType === "slow-2g" || navConn.effectiveType === "2g");
      const slowDetected = elapsed > 2500 || !res.ok || isWeak2G;

      if (slowDetected) {
        setIsSlow(true);
      } else {
        // Fast connection: reset slow timers and hide warning
        setIsSlow(false);
        setSlowDuration(0);
        setShowWarning(false);
        setDismissed(false);
      }
    } catch {
      // Fetch aborted or network timeout (> 6s)
      setLatency(6000);
      setIsSlow(true);
    } finally {
      setIsTesting(false);
    }
  };

  // Periodic latency probe every 12 seconds or on user online/offline events
  useEffect(() => {
    // Initial check after page loads
    const initialTimer = setTimeout(checkConnection, 1500);

    const interval = setInterval(() => {
      checkConnection();
    }, 12000);

    const handleOffline = () => {
      setIsSlow(true);
      setLatency(9999);
    };

    const handleOnline = () => {
      checkConnection();
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  // Track how many continuous seconds the connection has been slow
  useEffect(() => {
    if (isSlow) {
      slowTimerRef.current = setInterval(() => {
        setSlowDuration((prev) => {
          const nextVal = prev + 1;
          // When slow connection persists for 5 to 10 seconds: show warning message
          if (nextVal >= 5 && !dismissed) {
            setShowWarning(true);
          }
          return nextVal;
        });
      }, 1000);
    } else {
      if (slowTimerRef.current) clearInterval(slowTimerRef.current);
      setSlowDuration(0);
      setShowWarning(false);
    }

    return () => {
      if (slowTimerRef.current) clearInterval(slowTimerRef.current);
    };
  }, [isSlow, dismissed]);

  // If network is completely fast and warning is not triggered, render nothing!
  if (!showWarning && !isSlow) {
    return null;
  }

  // If connection is slightly lagging but hasn't reached 5s yet, show subtle mini top loader bar
  if (isSlow && !showWarning) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-[#D4AF37]/20 overflow-hidden pointer-events-none">
        <div className="h-full bg-gradient-to-r from-amber-500 via-[#D4AF37] to-amber-500 w-1/3 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="fixed bottom-24 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-[9999] animate-bounce-subtle">
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0F0E0B]/95 border-2 border-amber-500/60 shadow-[0_15px_40px_rgba(0,0,0,0.85),0_0_25px_rgba(212,175,55,0.25)] backdrop-blur-md text-white">
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              {latency && latency > 5000 ? <WifiOff size={20} /> : <AlertTriangle size={20} />}
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-400">
                Internet Connection Slow Hai (5-10s)
              </h4>
              <p className="text-[11px] text-white/60">
                Al Madina Restaurant · Live Speed Checker
              </p>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-white/50 hover:text-white"
            aria-label="Dismiss warning"
          >
            <X size={14} />
          </button>
        </div>

        <p className="text-xs text-white/80 leading-relaxed mb-3">
          Aapka internet connection pichle <strong>{slowDuration} second</strong> se kaafi slow chal raha hai. Barah-e-karam intezar farmayein, website aapka data aur menu load kar rahi hai.
        </p>

        <div className="flex items-center justify-between pt-2.5 border-t border-white/10 text-xs">
          <div className="flex items-center gap-1.5 text-white/60">
            <Activity size={13} className="text-amber-400" />
            <span>
              Latency: <strong className="text-amber-300">{latency ? `${latency} ms` : "High"}</strong>
            </span>
          </div>

          <button
            type="button"
            onClick={checkConnection}
            disabled={isTesting}
            className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-semibold text-xs flex items-center gap-1.5 transition-all"
          >
            <RefreshCw size={12} className={isTesting ? "animate-spin" : ""} />
            {isTesting ? "Checking..." : "Recheck Speed"}
          </button>
        </div>
      </div>
    </div>
  );
}
