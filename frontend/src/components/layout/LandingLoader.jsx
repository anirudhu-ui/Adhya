import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";

export default function LandingLoader({ children }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Wait for fonts + first paint
    if (document.readyState === "complete") {
      setTimeout(() => setLoaded(true), 300);
    } else {
      window.addEventListener("load", () => {
        setTimeout(() => setLoaded(true), 300);
      });
    }
  }, []);

  return (
    <>
      <AnimatePresence>
        {!loaded && (
          <motion.div
            key="skeleton"
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "fixed",
              inset: 0,
              background: "#0a0a0a",
              zIndex: 9999,
              display: "flex",
              flexDirection: "column",
              padding: "0 5vw",
              overflow: "hidden",
            }}
          >
            {/* shimmer keyframes injected once */}
            <style>{`
              @keyframes adhya-shimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
              }
              .sk {
                background: linear-gradient(
                  90deg,
                  #1a1a1a 25%,
                  #2a2a2a 50%,
                  #1a1a1a 75%
                );
                background-size: 200% 100%;
                animation: adhya-shimmer 1.6s infinite linear;
                border-radius: 4px;
              }
            `}</style>

            {/* NAV skeleton */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "28px" }}>
              <div className="sk" style={{ width: 80, height: 18 }} />
              <div style={{ display: "flex", gap: 32 }}>
                <div className="sk" style={{ width: 52, height: 12 }} />
                <div className="sk" style={{ width: 64, height: 12 }} />
                <div className="sk" style={{ width: 52, height: 12 }} />
              </div>
              <div className="sk" style={{ width: 80, height: 32, borderRadius: 20 }} />
            </div>

            {/* HERO skeleton */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24 }}>
              {/* eyebrow */}
              <div className="sk" style={{ width: 220, height: 11 }} />
              {/* headline lines */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <div className="sk" style={{ width: 340, height: 52 }} />
                <div className="sk" style={{ width: 280, height: 52 }} />
                <div className="sk" style={{ width: 380, height: 52 }} />
              </div>
              {/* subline */}
              <div className="sk" style={{ width: 300, height: 14, marginTop: 8 }} />
              {/* buttons */}
              <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
                <div className="sk" style={{ width: 160, height: 44, borderRadius: 24 }} />
                <div className="sk" style={{ width: 180, height: 44, borderRadius: 24 }} />
              </div>
            </div>

            {/* Adhya wordmark centered at bottom */}
            <div style={{
              textAlign: "center",
              paddingBottom: 32,
              fontSize: 11,
              letterSpacing: "0.3em",
              color: "#333",
              fontFamily: "monospace"
            }}>
              ADHYA · LOADING
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
}