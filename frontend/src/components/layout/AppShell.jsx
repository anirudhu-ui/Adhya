import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSubscription } from "../../context/SubscriptionContext";
import { LayoutDashboard, Mic, ShieldCheck, User, LogOut, History, CreditCard } from "lucide-react";

export function AppShell({ children }) {
  const { user, logout }          = useAuth();
  const { remaining, msgLimit }   = useSubscription();
  const location                  = useLocation();
  const navigate                  = useNavigate();

  const NAV_ITEMS = [
    { to: "/dashboard",              label: "Dashboard",  Icon: LayoutDashboard },
    { to: "/dashboard/advisor",      label: "AI Advisor", Icon: Mic             },
    { to: "/dashboard/plans",        label: "Plans",      Icon: ShieldCheck     },
    { to: "/dashboard/chats",        label: "Chats",      Icon: History         },
    { to: "/dashboard/profile",      label: "Profile",    Icon: User            },
    { to: "/dashboard/subscription", label: "Usage",      Icon: CreditCard      },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const usagePct      = Math.min(100, ((msgLimit - remaining) / msgLimit) * 100);
  const usageCritical = remaining <= 2;
  const usageWarn     = remaining <= Math.floor(msgLimit * 0.2);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--color-surface-base)" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 220, flexShrink: 0,
          background: "var(--color-surface-muted)",
          borderRight: "1px solid var(--color-border)",
          display: "flex", flexDirection: "column",
          padding: "var(--space-3) 0",
        }}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div style={{ padding: "0 var(--space-2) var(--space-3)" }}>
          <span style={{ fontSize: 18, fontWeight: "var(--font-weight-bold)", color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}>
            Adh<span style={{ color: "var(--color-text-secondary)", opacity: 0.6 }}>ya</span>
          </span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, padding: "0 var(--space-1)" }}>
          {NAV_ITEMS.map(({ to, label, Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                aria-current={active ? "page" : undefined}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 12px", borderRadius: "var(--radius-md)",
                  fontSize: "var(--font-size-md)",
                  fontWeight: active ? "var(--font-weight-medium)" : "var(--font-weight-base)",
                  color: active ? "var(--color-text-primary)" : "var(--color-text-muted)",
                  background: active ? "var(--color-surface-overlay)" : "transparent",
                  border: `1px solid ${active ? "var(--color-border)" : "transparent"}`,
                  textDecoration: "none",
                  transition: "all var(--motion-instant)",
                }}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Usage meter + user + logout */}
        <div style={{ padding: "var(--space-2)", borderTop: "1px solid var(--color-border)", display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Daily usage bar */}
          <div>
            <div style={{
              display: "flex", justifyContent: "space-between",
              fontSize: "var(--font-size-xs)", marginBottom: 5,
              color: usageCritical ? "var(--color-error)" : usageWarn ? "var(--color-warning)" : "var(--color-text-muted)",
            }}>
              <span>Today's messages</span>
              <span>{remaining} left</span>
            </div>
            <div style={{ height: 3, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${usagePct}%`, borderRadius: 99,
                background: usageCritical ? "var(--color-error)" : usageWarn ? "var(--color-warning)" : "var(--color-success)",
                transition: "width 0.5s ease",
              }} />
            </div>
          </div>

          <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user?.displayName || user?.email || "User"}
          </div>

          <button
            onClick={handleLogout}
            aria-label="Sign out"
            style={{
              display: "flex", alignItems: "center", gap: 8,
              fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)",
              background: "none", border: "none", cursor: "pointer",
              fontFamily: "var(--font-primary)", padding: 0,
              transition: "color var(--motion-instant)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-error)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }} id="main-content" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
