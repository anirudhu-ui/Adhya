import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { gsap } from "gsap";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

function mapAuthError(code) {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":       return "Invalid email or password.";
    case "auth/too-many-requests":    return "Too many attempts. Please try again later.";
    case "auth/user-disabled":        return "This account has been disabled.";
    case "auth/network-request-failed": return "Network error. Check your connection.";
    case "auth/popup-closed-by-user": return "Sign-in cancelled.";
    case "auth/cancelled-popup-request": return "Sign-in cancelled.";
    default:                          return "Sign-in failed. Please try again.";
  }
}

export default function LoginPage() {
  const { signInWithGoogle, signInWithEmail, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const containerRef = useRef(null);
  const cardRef      = useRef(null);

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4 })
      .fromTo(cardRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, "-=0.1");
  }, []);

  const handleEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmail(email, password);
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
    <div
      ref={containerRef}
      style={{
        minHeight: "100vh",
        background: "var(--color-surface-base)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "var(--space-3)", opacity: 0,
      }}
    >
      <div
        ref={cardRef}
        style={{
          width: "100%", maxWidth: 420,
          background: "var(--color-surface-muted)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-xl)",
          padding: "var(--space-5) var(--space-4)",
          display: "flex", flexDirection: "column", gap: "var(--space-3)",
        }}
        role="main"
      >
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "var(--font-size-xl)", fontWeight: "var(--font-weight-bold)", color: "var(--color-text-primary)", letterSpacing: "-0.03em", marginBottom: 6 }}>
            Adhya
          </h1>
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
            AI Insurance Advisor — sign in to continue
          </p>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid var(--color-border)" }} />

        <Button variant="secondary" onClick={handleGoogle} style={{ width: "100%", justifyContent: "center" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </Button>

        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
          <div style={{ flex: 1, height: 1, background: "var(--color-border)" }} />
          <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>or</span>
          <div style={{ flex: 1, height: 1, background: "var(--color-border)" }} />
        </div>

        <form onSubmit={handleEmail} noValidate style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <Input id="email" type="email" label="Email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          <Input id="password" type="password" label="Password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />

          {error && (
            <p role="alert" style={{ fontSize: "var(--font-size-sm)", color: "var(--color-error)", margin: 0 }}>
              {error}
            </p>
          )}

          <Button type="submit" loading={loading} style={{ width: "100%", justifyContent: "center", marginTop: 4 }}>
            Sign in
          </Button>
        </form>

        <p style={{ textAlign: "center", fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
          No account?{" "}
          <Link to="/signup" style={{ color: "var(--color-text-secondary)", textDecoration: "underline" }}>Create one</Link>
        </p>
      </div>
    </div>
  );
}
