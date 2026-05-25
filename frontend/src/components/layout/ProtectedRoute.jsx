import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--color-surface-base)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-text-muted)",
          fontSize: "var(--font-size-md)",
        }}
        role="status"
        aria-label="Loading"
      >
        Loading…
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
