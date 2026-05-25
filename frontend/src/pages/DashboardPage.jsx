import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { useAuth } from "../context/AuthContext";
import { Mic, ShieldCheck, TrendingUp, ArrowRight } from "lucide-react";

const STAT_CARDS = [
  { label: "Plans Available", value: "3", icon: ShieldCheck, description: "Curated for your profile" },
  { label: "AI Conversations", value: "∞", icon: Mic, description: "Ask anything about insurance" },
  { label: "Coverage Options", value: "₹5Cr+", icon: TrendingUp, description: "Maximum coverage available" },
];

const QUICK_LINKS = [
  { to: "/dashboard/advisor", label: "Talk to Adhya", description: "Voice or text — get instant insurance advice", cta: "Start conversation" },
  { to: "/dashboard/plans", label: "Browse Plans", description: "Compare health, life, and bundled insurance options", cta: "View plans" },
  { to: "/dashboard/profile", label: "Complete Your Profile", description: "Get personalized recommendations based on your situation", cta: "Update profile" },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const headerRef = useRef(null);
  const cardsRef = useRef(null);
  const linksRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(headerRef.current, { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" })
      .fromTo(
        cardsRef.current?.children || [],
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: "power2.out" },
        "-=0.2"
      )
      .fromTo(
        linksRef.current?.children || [],
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: "power2.out" },
        "-=0.1"
      );
  }, []);

  const firstName = user?.displayName?.split(" ")[0] || "there";

  return (
    <div style={{ padding: "var(--space-5) var(--space-4)", maxWidth: 900, width: "100%" }}>
      {/* Header */}
      <div ref={headerRef} style={{ marginBottom: "var(--space-4)", opacity: 0 }}>
        <h2 style={{ fontSize: "var(--font-size-xl)", fontWeight: "var(--font-weight-bold)", letterSpacing: "-0.02em", marginBottom: 6 }}>
          Good to see you, {firstName}
        </h2>
        <p style={{ fontSize: "var(--font-size-md)", color: "var(--color-text-muted)" }}>
          Your AI insurance advisor is ready. Ask anything, anytime.
        </p>
      </div>

      {/* Stats */}
      <div ref={cardsRef} style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--space-2)", marginBottom: "var(--space-4)" }}>
        {STAT_CARDS.map(({ label, value, icon: Icon, description }) => (
          <div
            key={label}
            style={{
              background: "var(--color-surface-raised)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-2) var(--space-2)",
              opacity: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Icon size={16} color="var(--color-text-muted)" />
              <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "var(--font-weight-medium)" }}>
                {label}
              </span>
            </div>
            <div style={{ fontSize: "var(--font-size-xl)", fontWeight: "var(--font-weight-bold)", marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>{description}</div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div ref={linksRef} style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
        {QUICK_LINKS.map(({ to, label, description, cta }) => (
          <Link
            key={to}
            to={to}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "var(--color-surface-raised)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-2) var(--space-3)",
              textDecoration: "none",
              opacity: 0,
              transition: "border-color var(--motion-instant), background var(--motion-instant)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--color-border-hover)";
              e.currentTarget.style.background = "var(--color-surface-overlay)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--color-border)";
              e.currentTarget.style.background = "var(--color-surface-raised)";
            }}
          >
            <div>
              <div style={{ fontSize: "var(--font-size-md)", fontWeight: "var(--font-weight-medium)", marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>{description}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)", flexShrink: 0, marginLeft: "var(--space-2)" }}>
              {cta}
              <ArrowRight size={14} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
