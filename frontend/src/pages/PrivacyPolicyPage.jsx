import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";

const SECTIONS = [
  {
    title: "Information We Collect",
    content: [
      "Account information: name, email address, and password when you register.",
      "Profile data: age, income, location, dependents, and existing policies — only what you choose to share.",
      "Conversation history: AI advisor sessions saved for Pro users only, stored securely in Firestore.",
      "Usage data: message counts, feature interactions, and subscription tier — used to enforce plan limits and improve the product.",
      "Authentication data: managed by Firebase Authentication. We never store raw passwords.",
    ],
  },
  {
    title: "How We Use Your Information",
    content: [
      "To provide personalized insurance guidance through our AI advisor.",
      "To enforce message limits and subscription entitlements.",
      "To save and retrieve your conversation history (Pro users).",
      "To improve product quality and fix bugs — aggregated, never individual profiling.",
      "We do not sell, rent, or share your personal data with third parties for marketing purposes.",
    ],
  },
  {
    title: "Data Storage & Security",
    content: [
      "All data is stored in Google Firebase (Firestore + Authentication), hosted in secure Google Cloud infrastructure.",
      "API requests are authenticated via Firebase ID tokens. No unauthenticated access to your data.",
      "Conversation data is scoped to your user ID and inaccessible to other users.",
      "We apply rate limiting and input sanitization to protect against abuse.",
    ],
  },
  {
    title: "Cookies & Local Storage",
    content: [
      "We use a single session cookie managed by Firebase Authentication to keep you signed in.",
      "We use localStorage only to remember your cookie consent preference.",
      "We do not use advertising cookies, third-party tracking pixels, or analytics cookies.",
      "You can clear cookies at any time via your browser settings. This will sign you out.",
    ],
  },
  {
    title: "Your Rights",
    content: [
      "Access: request a copy of the data we hold about you.",
      "Deletion: delete your account and all associated data at any time from your profile.",
      "Correction: update your profile information at any time.",
      "Portability: request an export of your conversation history.",
      "To exercise any of these rights, contact us at the email below.",
    ],
  },
  {
    title: "Third-Party Services",
    content: [
      "Firebase (Google) — authentication, database, and hosting.",
      "Anthropic Claude API — powers the AI advisor responses. Prompts may be processed by Anthropic per their privacy policy.",
      "Web Speech API — browser-native voice input. Audio is processed locally; we never receive audio recordings.",
    ],
  },
  {
    title: "Children's Privacy",
    content: [
      "Adhya is not directed at children under 13. We do not knowingly collect data from minors.",
      "If you believe a minor has created an account, contact us immediately for deletion.",
    ],
  },
  {
    title: "Changes to This Policy",
    content: [
      "We may update this policy as the product evolves. Material changes will be communicated via email or an in-app notice.",
      "Continued use after changes constitutes acceptance of the updated policy.",
      "This policy was last updated: January 2026.",
    ],
  },
  {
    title: "Contact",
    content: [
      "Questions or requests: privacy@adhya.in",
      "Adhya — AI Insurance Advisor, Hyderabad, India.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  const headerRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(headerRef.current, { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" })
      .fromTo(
        contentRef.current?.children || [],
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: "power2.out" },
        "-=0.2"
      );
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-surface-base)",
        color: "var(--color-text-primary)",
        fontFamily: "var(--font-primary)",
      }}
    >
      {/* Top nav */}
      <nav style={{
        borderBottom: "1px solid var(--color-border)",
        padding: "16px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(12px)",
        zIndex: 10,
      }}>
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8, color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
          <ArrowLeft size={14} />
          Back to Adhya
        </Link>
        <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Privacy Policy
        </span>
      </nav>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "64px 32px 96px" }}>
        {/* Header */}
        <div ref={headerRef} style={{ marginBottom: 64, opacity: 0 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)",
            textTransform: "uppercase", letterSpacing: "0.1em",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-full)",
            padding: "4px 14px", marginBottom: 24,
          }}>
            <Shield size={10} />
            Legal
          </div>
          <h1 style={{
            fontSize: "clamp(32px, 5vw, 52px)",
            fontWeight: "var(--font-weight-bold)",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            marginBottom: 20,
          }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: "var(--font-size-md)", color: "var(--color-text-muted)", lineHeight: 1.7, maxWidth: 560 }}>
            Adhya is an AI insurance advisor. We take your data seriously —
            this document explains exactly what we collect, why, and how you control it.
          </p>
          <div style={{
            marginTop: 24,
            padding: "12px 16px",
            background: "var(--color-surface-raised)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            fontSize: "var(--font-size-sm)",
            color: "var(--color-text-muted)",
          }}>
            Effective date: <strong style={{ color: "var(--color-text-secondary)" }}>1 January 2026</strong>
            &nbsp;·&nbsp; Jurisdiction: <strong style={{ color: "var(--color-text-secondary)" }}>India (IT Act 2000)</strong>
          </div>
        </div>

        {/* Sections */}
        <div ref={contentRef} style={{ display: "flex", flexDirection: "column", gap: 48 }}>
          {SECTIONS.map(({ title, content }, i) => (
            <div key={title} style={{ opacity: 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
                <span style={{
                  fontSize: "var(--font-size-xs)",
                  color: "var(--color-text-muted)",
                  fontVariantNumeric: "tabular-nums",
                  minWidth: 28,
                  letterSpacing: "0.06em",
                }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 style={{
                  fontSize: "var(--font-size-lg)",
                  fontWeight: "var(--font-weight-semibold)",
                  letterSpacing: "-0.01em",
                }}>
                  {title}
                </h2>
              </div>
              <div style={{
                borderLeft: "1px solid var(--color-border)",
                paddingLeft: 40,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}>
                {content.map((line, j) => (
                  <p key={j} style={{
                    fontSize: "var(--font-size-md)",
                    color: "var(--color-text-muted)",
                    lineHeight: 1.75,
                  }}>
                    {line}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div style={{
          marginTop: 80,
          paddingTop: 32,
          borderTop: "1px solid var(--color-border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          fontSize: "var(--font-size-sm)",
          color: "var(--color-text-muted)",
        }}>
          <span>© 2026 Adhya · Hyderabad, India</span>
          <Link to="/" style={{ color: "var(--color-text-muted)", textDecoration: "underline" }}>
            Back to app
          </Link>
        </div>
      </div>
    </div>
  );
}
