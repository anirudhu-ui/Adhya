import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { api } from "../services/api";
import { ShieldCheck, CheckCircle, ExternalLink, Sparkles, User } from "lucide-react";
import { Button } from "../components/ui/Button";
import { useNavigate } from "react-router-dom";

// ─── Contextual prompt generator ─────────────────────────────────────────────
// Builds a rich, category-specific prompt so the AI advisor can give
// immediately useful, targeted answers rather than a generic overview.

const CATEGORY_DEEP_DIVES = {
  "Term Life": [
    "the difference between lump-sum and monthly-income death benefit payouts",
    "which rider add-ons (accidental death, critical illness, waiver of premium) add real value",
    "how the sum assured holds up against inflation over a 20–30 year term",
    "how this compares to similar term plans from HDFC Life, Max Life, or ICICI Prudential",
  ],
  "Term + CI": [
    "the exact critical illnesses covered and the most common exclusions",
    "whether bundling critical illness with term cover is better value than buying them separately",
    "waiting periods that apply before critical illness claims are valid",
    "how the return-of-premium option changes the effective cost",
  ],
  Health: [
    "sub-limits on room rent, ICU charges, and specific procedures",
    "the cashless hospital network size and how to verify my nearest network hospital",
    "waiting periods for pre-existing diseases and named illnesses",
    "how the no-claim bonus accumulates and whether it can be used to increase cover",
  ],
  "Guaranteed Return": [
    "the effective internal rate of return (IRR) compared to PPF or fixed deposits",
    "surrender charges and the minimum lock-in if I need to exit early",
    "how tax-free maturity under Section 10(10D) applies given recent amendments",
    "whether a pure term plan + separate investment would outperform this",
  ],
  Endowment: [
    "how loyalty additions are calculated and the historical track record",
    "the loan facility — maximum loan-to-surrender-value ratio and applicable interest rate",
    "whether the life cover component is sufficient as standalone protection",
    "how this compares to buying term insurance and investing the premium difference in mutual funds",
  ],
};

const FALLBACK_DEEP_DIVES = [
  "the most important exclusions and conditions buried in the fine print",
  "how this plan compares to the top alternatives in the same category",
  "the claim settlement process — how to file, typical timelines, and what causes rejections",
  "whether this plan suits someone at my life stage and income level",
];

function formatCoverageStr(coverage) {
  if (!coverage) return "N/A";
  if (coverage >= 10_000_000) {
    const cr = coverage / 10_000_000;
    return `₹${cr % 1 === 0 ? cr : cr.toFixed(1)} Cr`;
  }
  const lac = coverage / 100_000;
  return `₹${lac % 1 === 0 ? lac : lac.toFixed(1)} L`;
}

function buildPlanPrompt(plan) {
  const coverageStr = formatCoverageStr(plan.coverage);
  const premiumStr  = `₹${plan.monthly_premium?.toLocaleString("en-IN")}/month`;
  const topics      = CATEGORY_DEEP_DIVES[plan.category] || FALLBACK_DEEP_DIVES;
  const topicLines  = topics.map((t, i) => `  ${i + 1}. ${t}`).join("\n");

  const highlightsLine = plan.highlights?.length
    ? `\nKey highlights: ${plan.highlights.join("; ")}.`
    : "";

  const whyLine = plan.why_recommended
    ? `\nYou recommended this because: "${plan.why_recommended}".`
    : "";

  return (
    `I'm looking at ${plan.name} by ${plan.provider} ` +
    `(${plan.category} — ${coverageStr} coverage at ${premiumStr}).` +
    highlightsLine + whyLine +
    `\n\nPlease give me a thorough breakdown covering:\n` +
    `1. The key benefits and what makes this plan stand out\n` +
    `2. Potential drawbacks or limitations I should know about\n` +
    `3. Coverage details — what's included and what's typically excluded\n` +
    `4. These plan-specific questions:\n${topicLines}\n` +
    `5. Who this plan is best suited for, and any red flags to watch out for\n\n` +
    `Keep the explanation practical — I want to make a well-informed decision.`
  );
}

// Provider color map
const PROVIDER_COLORS = {
  lic:    { bg: "#fff7ed", border: "#f97316", text: "#c2410c" },
  hdfc:   { bg: "#eff6ff", border: "#3b82f6", text: "#1d4ed8" },
  sbi:    { bg: "#f0fdf4", border: "#22c55e", text: "#15803d" },
  icici:  { bg: "#fdf4ff", border: "#a855f7", text: "#7e22ce" },
  star:   { bg: "#fff1f2", border: "#f43f5e", text: "#be123c" },
  niva:   { bg: "#f0fdfa", border: "#14b8a6", text: "#0f766e" },
  bajaj:  { bg: "#fefce8", border: "#eab308", text: "#a16207" },
  max:    { bg: "#fff7ed", border: "#fb923c", text: "#c2410c" },
  tata:   { bg: "#eff6ff", border: "#6366f1", text: "#4338ca" },
  generic:{ bg: "#f8fafc", border: "#94a3b8", text: "#475569" },
};

function ProviderBadge({ logo, provider }) {
  const colors = PROVIDER_COLORS[logo] || PROVIDER_COLORS.generic;
  return (
    <span style={{
      fontSize: "11px",
      fontWeight: 600,
      padding: "3px 10px",
      borderRadius: "999px",
      background: colors.bg,
      border: `1px solid ${colors.border}`,
      color: colors.text,
      letterSpacing: "0.03em",
    }}>
      {provider}
    </span>
  );
}

function PlanCard({ plan, index }) {
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    gsap.fromTo(ref.current,
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.45, delay: index * 0.08, ease: "power2.out" }
    );
  }, [index]);

  return (
    <div
      ref={ref}
      style={{
        background: "var(--color-surface-raised)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-xl)",
        padding: "var(--space-3)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
        opacity: 0,
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--color-border-hover)";
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--color-border)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <ProviderBadge logo={plan.provider_logo} provider={plan.provider} />
        <span style={{
          fontSize: "11px",
          color: "var(--color-text-muted)",
          border: "1px solid var(--color-border)",
          borderRadius: "999px",
          padding: "2px 8px",
        }}>
          {plan.category}
        </span>
      </div>

      {/* Name + Premium */}
      <div>
        <h3 style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-bold)", marginBottom: 4, lineHeight: 1.3 }}>
          {plan.name}
        </h3>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <span style={{ fontSize: "var(--font-size-xl)", fontWeight: "var(--font-weight-bold)" }}>
            ₹{plan.monthly_premium?.toLocaleString("en-IN")}
          </span>
          <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>/month</span>
        </div>
      </div>

      <hr style={{ border: "none", borderTop: "1px solid var(--color-border)" }} />

      {/* Coverage */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div>
          <div style={{ fontSize: "11px", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Coverage</div>
          <div style={{ fontSize: "var(--font-size-md)", fontWeight: "var(--font-weight-semibold)" }}>
            ₹{plan.coverage >= 10000000
              ? `${(plan.coverage / 10000000).toFixed(1)} Cr`
              : `${(plan.coverage / 100000).toFixed(0)} L`}
          </div>
        </div>
        <div>
          <div style={{ fontSize: "11px", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Best for</div>
          <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)", lineHeight: 1.4 }}>
            {plan.recommended_for}
          </div>
        </div>
      </div>

      {/* Why recommended */}
      {plan.why_recommended && (
        <div style={{
          background: "rgba(245,158,11,0.06)",
          border: "1px solid rgba(245,158,11,0.15)",
          borderRadius: "var(--radius-md)",
          padding: "8px 12px",
          fontSize: "var(--font-size-xs)",
          color: "var(--color-text-secondary)",
          lineHeight: 1.5,
        }}>
          <span style={{ color: "#f59e0b", fontWeight: 600, marginRight: 4 }}>✦ Why this?</span>
          {plan.why_recommended}
        </div>
      )}

      {/* Highlights */}
      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 5 }}>
        {plan.highlights?.map((h) => (
          <li key={h} style={{ display: "flex", alignItems: "flex-start", gap: 7, fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>
            <CheckCircle size={13} color="var(--color-success)" style={{ marginTop: 2, flexShrink: 0 }} />
            {h}
          </li>
        ))}
      </ul>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
        <Button
          variant="secondary"
          style={{ flex: 1, justifyContent: "center", fontSize: "var(--font-size-sm)" }}
          onClick={() => {
            navigate("/dashboard/advisor", {
              state: {
                autoMessage: buildPlanPrompt(plan),
                planName: plan.name,
              },
            });
          }}
        >
          Ask AI about this
        </Button>
        {plan.learn_more_url && (
          <a
            href={plan.learn_more_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation();
              window.open(plan.learn_more_url, "_blank", "noopener,noreferrer");
            }}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 44, height: 44, minHeight: 44, flexShrink: 0,
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              color: "var(--color-text-muted)",
              transition: "color 0.2s, border-color 0.2s, background 0.2s",
              textDecoration: "none",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-text-primary)"; e.currentTarget.style.borderColor = "var(--color-border-hover)"; e.currentTarget.style.background = "var(--color-surface-overlay)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-text-muted)"; e.currentTarget.style.borderColor = "var(--color-border)"; e.currentTarget.style.background = "transparent"; }}
            title={`Visit ${plan.provider} website`}
          >
            <ExternalLink size={15} />
          </a>
        )}
      </div>
    </div>
  );
}

export default function PlansPage() {
  const [plans, setPlans]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [personalized, setPersonalized] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(headerRef.current,
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
    );
    api.getPlans()
      .then((data) => {
        setPlans(data.plans || []);
        setPersonalized(data.personalized || false);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: "var(--space-5) var(--space-4)", maxWidth: 960 }}>
      {/* Header */}
      <div ref={headerRef} style={{ marginBottom: "var(--space-4)", opacity: 0 }}>
        <h2 style={{ fontSize: "var(--font-size-xl)", fontWeight: "var(--font-weight-bold)", letterSpacing: "-0.02em", marginBottom: 6 }}>
          Insurance Plans
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {personalized ? (
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--font-size-sm)", color: "#f59e0b" }}>
              <Sparkles size={14} />
              Personalized for your profile — plans from LIC, HDFC Life, SBI Life & more
            </span>
          ) : (
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
              <User size={14} />
              Complete your profile to get personalized recommendations
            </span>
          )}
        </div>
      </div>

      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-md)" }}>
            Finding the best plans for you…
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "var(--space-2)" }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{
                height: 320, borderRadius: "var(--radius-xl)",
                background: "var(--color-surface-raised)",
                border: "1px solid var(--color-border)",
                animation: "pulse 1.5s ease-in-out infinite",
              }} />
            ))}
          </div>
        </div>
      )}

      {error && (
        <div role="alert" style={{ color: "var(--color-error)", fontSize: "var(--font-size-md)" }}>
          Failed to load plans. Please try again.
        </div>
      )}

      {!loading && !error && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: "var(--space-2)" }}>
          {plans.map((plan, i) => (
            <PlanCard key={plan.id} plan={plan} index={i} />
          ))}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}