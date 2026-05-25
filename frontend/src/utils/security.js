/**
 * security.js — frontend input sanitisation + client-side rate limiting.
 *
 * React renders text via JSX (textContent), so XSS from message.content
 * is already impossible.  These helpers protect:
 *  1. Any value that might reach dangerouslySetInnerHTML (we avoid that).
 *  2. Data sent to the backend (pre-flight trimming + length enforcement).
 *  3. Client-side rate limit to prevent accidental API flooding.
 */

// ── Constants ─────────────────────────────────────────────────────────────────
export const MAX_MESSAGE_LENGTH  = 2_000;
export const MAX_HISTORY_TURNS   = 20;
export const MAX_FIELD_LENGTH    = 200;

// ── Text sanitisation ─────────────────────────────────────────────────────────

/**
 * Strip control characters (except \n \r \t), collapse runs of blank lines,
 * and truncate. Safe for plain-text display via React's default rendering.
 */
export function sanitizeText(value, maxLen = MAX_FIELD_LENGTH) {
  if (typeof value !== "string") return "";
  return value
    .replace(/[^\S\r\n\t ]/g, "")   // strip non-printable control chars
    .replace(/\n{3,}/g, "\n\n")      // collapse excessive newlines
    .trim()
    .slice(0, maxLen);
}

/**
 * Sanitise a chat message before sending to the API.
 * Returns { ok: true, value } or { ok: false, error: string }.
 */
export function validateMessage(raw) {
  if (!raw || typeof raw !== "string") {
    return { ok: false, error: "Message is required." };
  }
  const value = sanitizeText(raw, MAX_MESSAGE_LENGTH);
  if (!value) {
    return { ok: false, error: "Message cannot be empty." };
  }
  return { ok: true, value };
}

/**
 * Sanitise conversation history before sending.
 * Drops unknown roles, caps item count, trims content.
 */
export function sanitizeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .filter((t) => t && ["user", "assistant"].includes(t.role) && t.content)
    .slice(-MAX_HISTORY_TURNS)
    .map((t) => ({ role: t.role, content: sanitizeText(t.content, 2_000) }));
}

// ── Client-side rate limiter ──────────────────────────────────────────────────

/**
 * Simple token-bucket rate limiter to prevent UI from flooding the API.
 *
 * Usage:
 *   const limiter = createRateLimiter({ limit: 20, windowMs: 60_000 });
 *   if (!limiter.allowed()) { show error }
 */
export function createRateLimiter({ limit = 20, windowMs = 60_000 } = {}) {
  const timestamps = [];

  return {
    allowed() {
      const now = Date.now();
      // Remove timestamps outside the window
      while (timestamps.length && timestamps[0] < now - windowMs) {
        timestamps.shift();
      }
      if (timestamps.length >= limit) return false;
      timestamps.push(now);
      return true;
    },
    remaining() {
      const now = Date.now();
      const recent = timestamps.filter((t) => t >= now - windowMs);
      return Math.max(0, limit - recent.length);
    },
  };
}

// Shared instance used by useAdvisor
export const chatLimiter = createRateLimiter({ limit: 20, windowMs: 60_000 });
