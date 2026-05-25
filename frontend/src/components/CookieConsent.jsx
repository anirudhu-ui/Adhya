import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Link } from "react-router-dom";
import { X, Cookie } from "lucide-react";

const STORAGE_KEY = "adhya_cookie_consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const bannerRef = useRef(null);

  useEffect(() => {
    // Only show if no prior decision
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      // Small delay so it doesn't fight page load animations
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    if (!visible || !bannerRef.current) return;
    gsap.fromTo(
      bannerRef.current,
      { y: 32, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }
    );
  }, [visible]);

  const dismiss = (accepted) => {
    gsap.to(bannerRef.current, {
      y: 24, opacity: 0, duration: 0.35, ease: "power2.in",
      onComplete: () => setVisible(false),
    });
    localStorage.setItem(STORAGE_KEY, accepted ? "accepted" : "declined");
  };

  if (!visible) return null;

  return (
    <div
      ref={bannerRef}
      role="dialog"
      aria-label="Cookie consent"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        width: "min(560px, calc(100vw - 32px))",
        background: "var(--color-surface-raised)",
        border: "1px solid var(--color-border-hover)",
        borderRadius: "var(--radius-xl)",
        padding: "20px 24px",
        boxShadow: "0 8px 40px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        fontFamily: "var(--font-primary)",
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Cookie size={16} color="var(--color-text-muted)" />
          <span style={{
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-semibold)",
            color: "var(--color-text-primary)",
            letterSpacing: "-0.01em",
          }}>
            Cookies & Privacy
          </span>
        </div>
        <button
          onClick={() => dismiss(false)}
          aria-label="Dismiss cookie notice"
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--color-text-muted)", padding: 2, lineHeight: 1,
            transition: "color var(--motion-instant)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text-primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
        >
          <X size={14} />
        </button>
      </div>

      {/* Body */}
      <p style={{
        fontSize: "var(--font-size-sm)",
        color: "var(--color-text-muted)",
        lineHeight: 1.65,
        margin: 0,
      }}>
        We use a single Firebase session cookie to keep you signed in, and localStorage
        to remember this preference. No ad trackers. No third-party analytics.{" "}
        <Link
          to="/privacy"
          style={{ color: "var(--color-text-secondary)", textDecoration: "underline", textUnderlineOffset: 3 }}
        >
          Privacy Policy
        </Link>
      </p>

      {/* Buttons */}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button
          onClick={() => dismiss(false)}
          style={{
            padding: "8px 18px",
            background: "transparent",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-primary)",
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-medium)",
            cursor: "pointer",
            transition: "border-color var(--motion-instant), color var(--motion-instant)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--color-border-hover)";
            e.currentTarget.style.color = "var(--color-text-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--color-border)";
            e.currentTarget.style.color = "var(--color-text-muted)";
          }}
        >
          Decline
        </button>
        <button
          onClick={() => dismiss(true)}
          style={{
            padding: "8px 18px",
            background: "var(--color-text-primary)",
            border: "1px solid var(--color-text-primary)",
            borderRadius: "var(--radius-md)",
            color: "var(--color-surface-base)",
            fontFamily: "var(--font-primary)",
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-semibold)",
            cursor: "pointer",
            transition: "opacity var(--motion-instant)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Accept
        </button>
      </div>
    </div>
  );
}
