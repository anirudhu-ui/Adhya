import { useState, useCallback } from "react";
import { chatLimiter } from "../utils/security";

/**
 * useRateLimit — wraps the shared chatLimiter and exposes state for UI.
 *
 * Returns:
 *   checkAllowed()  → boolean (true = proceed, false = blocked)
 *   remaining       → number of requests left in current window
 *   blocked         → boolean flag for rendering warning
 */
export function useRateLimit() {
  const [blocked, setBlocked] = useState(false);
  const [remaining, setRemaining] = useState(chatLimiter.remaining());

  const checkAllowed = useCallback(() => {
    const ok = chatLimiter.allowed();
    setRemaining(chatLimiter.remaining());
    setBlocked(!ok);
    if (!ok) {
      // Auto-clear the blocked state after 10 s
      setTimeout(() => {
        setBlocked(false);
        setRemaining(chatLimiter.remaining());
      }, 10_000);
    }
    return ok;
  }, []);

  return { checkAllowed, remaining, blocked };
}
