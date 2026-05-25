import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { MessageSquare, Mic, Shield, Clock, Info } from "lucide-react";
import { useSubscription } from "../context/SubscriptionContext";

const FEATURES = [
  { icon: MessageSquare, text: "10 messages per day — resets at midnight UTC" },
  { icon: Mic,           text: "Voice input & output included" },
  { icon: Shield,        text: "Full AI insurance advisory" },
  { icon: Shield,        text: "All insurance plan browsing" },
];

function UsageBar({ used, limit }) {
  const pct      = Math.min(100, (used / limit) * 100);
  const critical = pct >= 90;
  const warn     = pct >= 60;
  const color    = critical ? "var(--color-error)" : warn ? "var(--color-warning)" : "var(--color-success)";

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)", marginBottom: 6,
      }}>
        <span>{used} of {limit} messages used today</span>
        <span style={{ color }}>{limit - used} remaining</span>
      </div>
      <div style={{ height: 5, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`, borderRadius: 99,
          background: color, transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)",
        }} />
      </div>
    </div>
  );
}

export default function SubscriptionPage() {
  const { msgCount, msgLimit, remaining } = useSubscription();
  const headerRef  = useRef(null);
  const cardRef    = useRef(null);
  const noticeRef  = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(headerRef.current, { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" })
      .fromTo(cardRef.current,   { opacity: 0, y: 24  }, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, "-=0.2")
      .fromTo(noticeRef.current, { opacity: 0, y: 12  }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, "-=0.2");
  }, []);

  return (
    <div style={{ padding: "var(--space-5) var(--space-4)", maxWidth: 640 }}>

      {/* Header */}
      <div ref={headerRef} style={{ marginBottom: "var(--space-4)", opacity: 0 }}>
        <h2 style={{
          fontSize: "var(--font-size-xl)", fontWeight: "var(--font-weight-bold)",
          letterSpacing: "-0.02em", marginBottom: 8,
        }}>
          Usage & Limits
        </h2>
        <p style={{ fontSize: "var(--font-size-md)", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
          Adhya is a demo project. All features are free — a daily message cap keeps AI costs manageable.
        </p>
      </div>

      {/* Main card */}
      <div ref={cardRef} style={{
        background: "var(--color-surface-raised)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-xl)",
        padding: "var(--space-3)",
        display: "flex", flexDirection: "column", gap: "var(--space-3)",
        opacity: 0,
      }}>

        {/* Plan label */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 22 }}>🛡️</span>
              <h3 style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-bold)" }}>
                Demo Plan
              </h3>
            </div>
            <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
              Free · no subscription required
            </p>
          </div>
          <div style={{
            fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-semibold)",
            background: "var(--color-surface-overlay)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-full)", padding: "4px 12px",
            color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em",
          }}>
            Active
          </div>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid var(--color-border)" }} />

        {/* Daily usage bar */}
        <div>
          <p style={{
            fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)",
            color: "var(--color-text-secondary)", marginBottom: 4,
          }}>
            Today's usage
          </p>
          <UsageBar used={msgCount} limit={msgLimit} />
          <p style={{
            fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: 8,
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <Clock size={11} />
            Resets daily at midnight UTC
          </p>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid var(--color-border)" }} />

        {/* What's included */}
        <div>
          <p style={{
            fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)",
            color: "var(--color-text-secondary)", marginBottom: 12,
          }}>
            What's included
          </p>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} style={{
                display: "flex", alignItems: "center", gap: 10,
                fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)",
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: "var(--radius-sm)",
                  background: "var(--color-surface-overlay)",
                  border: "1px solid var(--color-border)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <Icon size={11} color="var(--color-success)" />
                </div>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Why 10 messages notice */}
      <div ref={noticeRef} style={{
        marginTop: "var(--space-2)",
        padding: "var(--space-2) var(--space-3)",
        background: "rgba(59,139,240,0.05)",
        border: "1px solid rgba(59,139,240,0.18)",
        borderRadius: "var(--radius-lg)",
        display: "flex", gap: 12, alignItems: "flex-start",
        opacity: 0,
      }}>
        <Info size={15} color="#60a5fa" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <p style={{
            fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)",
            color: "#93c5fd", marginBottom: 4,
          }}>
            Why only 10 messages per day?
          </p>
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)", lineHeight: 1.7 }}>
            Adhya is a student demo project. Every message calls a live AI model (Groq + Llama 3),
            which has real API costs. The 10-message daily limit lets us keep the app 100% free and
            publicly accessible without running up a bill. Thanks for understanding!
          </p>
        </div>
      </div>

    </div>
  );
}
