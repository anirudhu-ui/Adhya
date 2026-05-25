/**
 * api.js — secure Fetch wrapper for the Adhya Flask backend.
 */

import { auth } from "./firebase";

const BASE_URL = (() => {
  const url = import.meta.env.VITE_API_BASE_URL || "";
  if (import.meta.env.PROD && url && !url.startsWith("https://")) {
    console.error("[Adhya] VITE_API_BASE_URL must use HTTPS in production.");
  }
  return url;
})();

const REQUEST_TIMEOUT_MS = 10_000;

async function getAuthHeaders() {
  const user = auth.currentUser;
  if (!user) throw new Error("not_authenticated");
  const token = await user.getIdToken(false);
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function apiFetch(path, options = {}) {
  const headers = await getAuthHeaders();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
      credentials: "omit",
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const code = body.error || "request_failed";
      const err  = new ApiError(code, res.status);
      err.body   = body;
      throw err;
    }

    return res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") throw new ApiError("request_timeout", 408);
    throw err;
  }
}

export class ApiError extends Error {
  constructor(code, status) {
    super(code);
    this.code   = code;
    this.status = status;
  }
}

export const api = {
  // ── Advisor ──────────────────────────────────────────────────────────────
  chat: (message, history, profile) =>
    apiFetch("/api/advisor/chat", {
      method: "POST",
      body: JSON.stringify({ message, history, profile }),
    }),

  getPlans: () => apiFetch("/api/advisor/plans"),

  getSummary: (history) =>
    apiFetch("/api/advisor/summary", {
      method: "POST",
      body: JSON.stringify({ history }),
    }),

  // ── User profile ─────────────────────────────────────────────────────────
  getProfile: () => apiFetch("/api/user/profile"),

  updateProfile: (data) =>
    apiFetch("/api/user/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // ── Usage / limits ────────────────────────────────────────────────────────
  getSubscriptionStatus: () => apiFetch("/api/subscription/status"),

  // ── Chat history ──────────────────────────────────────────────────────────
  listChats: ()                         => apiFetch("/api/chats"),
  getChat:   (sessionId)                => apiFetch(`/api/chats/${sessionId}`),
  saveChat:  (sessionId, title, msgs)   =>
    apiFetch("/api/chats", {
      method: "POST",
      body: JSON.stringify({ session_id: sessionId, title, messages: msgs }),
    }),
  deleteChat: (sessionId) =>
    apiFetch(`/api/chats/${sessionId}`, { method: "DELETE" }),

  // ── Health ────────────────────────────────────────────────────────────────
  health: () =>
    fetch(`${BASE_URL}/health`, { signal: AbortSignal.timeout(5_000) })
      .then((r) => r.json()),
};
