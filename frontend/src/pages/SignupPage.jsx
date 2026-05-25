import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

function mapAuthError(code) {
  switch (code) {
    case "auth/email-already-in-use":  return "An account with this email already exists.";
    case "auth/invalid-email":         return "Please enter a valid email address.";
    case "auth/weak-password":         return "Password must be at least 8 characters.";
    case "auth/too-many-requests":     return "Too many attempts. Please try again later.";
    case "auth/network-request-failed": return "Network error. Check your connection.";
    case "auth/popup-closed-by-user":  return "Sign-in cancelled.";
    default:                           return "Could not create account. Please try again.";
  }
}

export default function SignupPage() {
  const { signUpWithEmail, signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || name.length > 100) { setError("Please enter a valid name (max 100 characters)."); return; }
    if (password.length < 8)               { setError("Password must be at least 8 characters."); return; }
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError("Password must include at least one uppercase letter and one number.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await signUpWithEmail(email, password, name);
      navigate("/dashboard");
    } catch (err) {
      setError(mapAuthError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    try {
      await signInWithGoogle();
      navigate("/dashboard");
    } catch (err) {
      setError(mapAuthError(err.code));
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-surface-base)", display: "flex", alignItems: "center", justifyContent: "center", padding: "var(--space-3)" }}>
      <div style={{ width: "100%", maxWidth: 420, background: "var(--color-surface-muted)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", padding: "var(--space-5) var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "var(--font-size-xl)", fontWeight: "var(--font-weight-bold)", letterSpacing: "-0.03em", marginBottom: 6 }}>Create account</h1>
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>Join Adhya — AI-powered insurance advisory</p>
        </div>

        <Button variant="secondary" onClick={handleGoogle} style={{ width: "100%", justifyContent: "center" }}>
          Continue with Google
        </Button>

        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
          <div style={{ flex: 1, height: 1, background: "var(--color-border)" }} />
          <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>or</span>
          <div style={{ flex: 1, height: 1, background: "var(--color-border)" }} />
        </div>

        <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <Input id="name"     label="Full name" placeholder="Arjun Sharma"      value={name}     onChange={(e) => setName(e.target.value)}     required />
          <Input id="email"    type="email"  label="Email"    placeholder="you@example.com" value={email}    onChange={(e) => setEmail(e.target.value)}    required />
          <Input id="password" type="password" label="Password" placeholder="Min. 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />

          {error && <p role="alert" style={{ fontSize: "var(--font-size-sm)", color: "var(--color-error)" }}>{error}</p>}

          <Button type="submit" loading={loading} style={{ width: "100%", justifyContent: "center", marginTop: 4 }}>
            Create account
          </Button>
        </form>

        <p style={{ textAlign: "center", fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--color-text-secondary)", textDecoration: "underline" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
