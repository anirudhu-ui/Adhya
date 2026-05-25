import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

const RISK_OPTIONS = ["low", "moderate", "high"];

export default function ProfilePage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.displayName || "",
    age: "",
    income: "",
    dependents: "",
    location: "",
    risk_profile: "moderate",
    existing_policies: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getProfile()
      .then((data) => {
        if (data.profile) {
          setForm((prev) => ({
            ...prev,
            ...data.profile,
            existing_policies: Array.isArray(data.profile.existing_policies)
              ? data.profile.existing_policies.join(", ")
              : data.profile.existing_policies || "",
          }));
        }
      })
      .catch(() => {});
  }, []);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const payload = {
        ...form,
        age: form.age ? Number(form.age) : undefined,
        income: form.income ? Number(form.income) : undefined,
        dependents: form.dependents ? Number(form.dependents) : undefined,
        existing_policies: form.existing_policies
          ? form.existing_policies.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
      };
      await api.updateProfile(payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const fieldGap = { display: "flex", flexDirection: "column", gap: "var(--space-2)" };

  return (
    <div style={{ padding: "var(--space-5) var(--space-4)", maxWidth: 560 }}>
      <div style={{ marginBottom: "var(--space-4)" }}>
        <h2 style={{ fontSize: "var(--font-size-xl)", fontWeight: "var(--font-weight-bold)", letterSpacing: "-0.02em", marginBottom: 6 }}>
          Your Profile
        </h2>
        <p style={{ fontSize: "var(--font-size-md)", color: "var(--color-text-muted)" }}>
          Personalize your AI advisor with your financial details.
        </p>
      </div>

      <form onSubmit={handleSave} noValidate style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        <div style={fieldGap}>
          <Input id="name" label="Full name" value={form.name} onChange={set("name")} placeholder="Arjun Sharma" maxLength={100} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-1)" }}>
            <Input id="age" type="number" label="Age" value={form.age} onChange={set("age")} placeholder="32" min="0" max="120" />
            <Input id="dependents" type="number" label="Dependents" value={form.dependents} onChange={set("dependents")} placeholder="2" min="0" max="20" />
          </div>
          <Input id="income" type="number" label="Annual income (₹)" value={form.income} onChange={set("income")} placeholder="1200000" min="0" />
          <Input id="location" label="City" value={form.location} onChange={set("location")} placeholder="Hyderabad" maxLength={100} />
        </div>

        {/* Risk profile */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Risk profile
          </label>
          <div style={{ display: "flex", gap: 8 }} role="radiogroup" aria-label="Risk profile">
            {RISK_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                role="radio"
                aria-checked={form.risk_profile === opt}
                onClick={() => setForm((f) => ({ ...f, risk_profile: opt }))}
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "var(--radius-md)",
                  border: `1px solid ${form.risk_profile === opt ? "var(--color-border-focus)" : "var(--color-border)"}`,
                  background: form.risk_profile === opt ? "var(--color-surface-overlay)" : "transparent",
                  color: form.risk_profile === opt ? "var(--color-text-primary)" : "var(--color-text-muted)",
                  fontFamily: "var(--font-primary)",
                  fontSize: "var(--font-size-sm)",
                  fontWeight: "var(--font-weight-medium)",
                  cursor: "pointer",
                  textTransform: "capitalize",
                  transition: "all var(--motion-instant)",
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <Input
          id="existing_policies"
          label="Existing policies (comma-separated)"
          value={form.existing_policies}
          onChange={set("existing_policies")}
          placeholder="LIC term, HDFC health"
          maxLength={500}
        />

        {error && <p role="alert" style={{ fontSize: "var(--font-size-sm)", color: "var(--color-error)" }}>{error}</p>}

        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
          <Button type="submit" loading={saving}>
            Save profile
          </Button>
          {saved && (
            <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-success)" }} role="status" aria-live="polite">
              ✓ Saved
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
