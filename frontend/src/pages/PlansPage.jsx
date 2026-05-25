import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { api } from "../services/api";
import { ShieldCheck, CheckCircle } from "lucide-react";
import { Button } from "../components/ui/Button";
import { useNavigate } from "react-router-dom";

function PlanCard({ plan, index }) {
  const ref = useRef(null);

  useEffect(() => {
    gsap.fromTo(ref.current, { opacity: 0, y: 24 }, {
      opacity: 1, y: 0, duration: 0.45,
      delay: index * 0.1,
      ease: "power2.out",
    });
  }, [index]);

  const navigate = useNavigate();

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
        transition: "border-color var(--motion-instant)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--color-border-hover)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
    >
      {/* Badge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{
          fontSize: "var(--font-size-xs)",
          fontWeight: "var(--font-weight-medium)",
          color: "var(--color-text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-full)",
          padding: "3px 10px",
        }}>
          {plan.category}
        </span>
        <ShieldCheck size={18} color="var(--color-text-muted)" />
      </div>

      {/* Name + price */}
      <div>
        <h3 style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-bold)", marginBottom: 4 }}>{plan.name}</h3>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <span style={{ fontSize: "var(--font-size-xl)", fontWeight: "var(--font-weight-bold)" }}>₹{plan.monthly_premium}</span>
          <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>/month</span>
        </div>
      </div>

      {/* Divider */}
      <hr style={{ border: "none", borderTop: "1px solid var(--color-border)" }} />

      {/* Coverage stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div>
          <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Coverage</div>
          <div style={{ fontSize: "var(--font-size-md)", fontWeight: "var(--font-weight-semibold)" }}>
            ₹{(plan.coverage / 100000).toFixed(0)}L
          </div>
        </div>
        <div>
          <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Deductible</div>
          <div style={{ fontSize: "var(--font-size-md)", fontWeight: "var(--font-weight-semibold)" }}>₹{plan.deductible.toLocaleString("en-IN")}</div>
        </div>
      </div>

      {/* Highlights */}
      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
        {plan.highlights.map((h) => (
          <li key={h} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>
            <CheckCircle size={13} color="var(--color-success)" />
            {h}
          </li>
        ))}
      </ul>

      {/* Recommended for */}
      <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", fontStyle: "italic" }}>
        Best for: {plan.recommended_for}
      </p>

      <Button
        variant="secondary"
        style={{ width: "100%", justifyContent: "center" }}
        onClick={() => navigate("/dashboard/advisor")}
      >
        Ask AI about this plan
      </Button>
    </div>
  );
}

export default function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const headerRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(headerRef.current, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" });
    api.getPlans()
      .then((data) => setPlans(data.plans || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: "var(--space-5) var(--space-4)", maxWidth: 900 }}>
      <div ref={headerRef} style={{ marginBottom: "var(--space-4)", opacity: 0 }}>
        <h2 style={{ fontSize: "var(--font-size-xl)", fontWeight: "var(--font-weight-bold)", letterSpacing: "-0.02em", marginBottom: 6 }}>
          Insurance Plans
        </h2>
        <p style={{ fontSize: "var(--font-size-md)", color: "var(--color-text-muted)" }}>
          Three curated tiers — talk to our AI advisor to find your best fit.
        </p>
      </div>

      {loading && (
        <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-md)" }}>Loading plans…</div>
      )}

      {error && (
        <div role="alert" style={{ color: "var(--color-error)", fontSize: "var(--font-size-md)" }}>
          Failed to load plans: {error}
        </div>
      )}

      {!loading && !error && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "var(--space-2)" }}>
          {plans.map((plan, i) => (
            <PlanCard key={plan.id} plan={plan} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
