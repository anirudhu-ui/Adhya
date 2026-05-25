import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import CookieConsent from "./components/CookieConsent";

const ProtectedRoute = lazy(() =>
  import("./components/layout/ProtectedRoute").then((m) => ({ default: m.ProtectedRoute }))
);
const AppShell = lazy(() =>
  import("./components/layout/AppShell").then((m) => ({ default: m.AppShell }))
);
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const AdvisorPage = lazy(() => import("./pages/AdvisorPage"));
const PlansPage = lazy(() => import("./pages/PlansPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const SubscriptionPage = lazy(() => import("./pages/SubscriptionPage"));
const RecentChatsPage = lazy(() => import("./pages/RecentChatsPage"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));

export default function App() {
  return (
    <>
      <CookieConsent />
      <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--color-surface-base)" }} />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<AppShell><DashboardPage /></AppShell>} />
            <Route path="/dashboard/advisor" element={<AppShell><AdvisorPage /></AppShell>} />
            <Route path="/dashboard/plans" element={<AppShell><PlansPage /></AppShell>} />
            <Route path="/dashboard/profile" element={<AppShell><ProfilePage /></AppShell>} />
            <Route path="/dashboard/subscription" element={<AppShell><SubscriptionPage /></AppShell>} />
            <Route path="/dashboard/chats" element={<AppShell><RecentChatsPage /></AppShell>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}
