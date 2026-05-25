import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../services/api";
import { useAuth } from "./AuthContext";

const SubscriptionContext = createContext(null);

export function SubscriptionProvider({ children }) {
  const { user } = useAuth();
  const [msgCount, setMsgCount]   = useState(0);
  const [msgLimit, setMsgLimit]   = useState(10);
  const [remaining, setRemaining] = useState(10);
  const [loading, setLoading]     = useState(true);

  const refresh = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      const data = await api.getSubscriptionStatus();
      setMsgCount(data.msg_count   ?? 0);
      setMsgLimit(data.msg_limit   ?? 10);
      setRemaining(data.remaining  ?? 10);
    } catch {
      // silent — defaults hold
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  /** Optimistic decrement after message send */
  const decrementRemaining = useCallback(() => {
    setRemaining((r) => Math.max(0, r - 1));
    setMsgCount((c) => c + 1);
  }, []);

  /** Sync accurate counts from server response */
  const syncUsage = useCallback((usage) => {
    if (!usage) return;
    if (usage.remaining !== undefined) setRemaining(usage.remaining);
    if (usage.limit     !== undefined) setMsgLimit(usage.limit);
  }, []);

  return (
    <SubscriptionContext.Provider
      value={{ msgCount, msgLimit, remaining, loading, refresh, decrementRemaining, syncUsage }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => useContext(SubscriptionContext);
