import { useState, useCallback, useRef } from "react";
import { api } from "../services/api";
import { sanitizeHistory, sanitizeText, validateMessage, chatLimiter } from "../utils/security";

const WELCOME = {
  id: "welcome",
  role: "assistant",
  content:
    "Hello! I'm Adhya, your AI Insurance Advisor. I can help you understand insurance options, compare plans, and find the right coverage for your needs. How can I help you today?",
  suggestions: [
    "What type of insurance do I need?",
    "Compare health insurance plans",
    "How much life insurance coverage do I need?",
  ],
};

export function useAdvisor() {
  const [messages, setMessages] = useState([WELCOME]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const profileRef = useRef({});

  const setProfile = useCallback((profile) => {
    profileRef.current = profile;
  }, []);

  const sendMessage = useCallback(
    async (rawContent) => {
      // 1. Validate + sanitise input
      const validation = validateMessage(rawContent);
      if (!validation.ok) {
        setError(validation.error);
        return null;
      }
      const content = validation.value;

      if (loading) return null;

      // 2. Client-side rate limit
      if (!chatLimiter.allowed()) {
        setError("Too many messages. Please wait a moment before sending again.");
        return null;
      }

      const userMsg = { id: `user_${Date.now()}`, role: "user", content };
      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);
      setError(null);

      // 3. Build sanitised history (exclude the welcome message role mismatch)
      const history = sanitizeHistory(
        messages.filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => ({ role: m.role, content: m.content }))
      );

      try {
        const result = await api.chat(content, history, profileRef.current);
        // Sanitise AI reply before storing (defence-in-depth)
        const safeReply = sanitizeText(result.reply || "", 4_000);
        const safeSuggestions = Array.isArray(result.suggestions)
          ? result.suggestions
              .slice(0, 3)
              .map((s) => sanitizeText(s, 200))
              .filter(Boolean)
          : [];

        const assistantMsg = {
          id: `assistant_${Date.now()}`,
          role: "assistant",
          content: safeReply,
          suggestions: safeSuggestions,
        };
        setMessages((prev) => [...prev, assistantMsg]);
        return safeReply;
      } catch (err) {
        // Show friendly message, not raw server error
        setError("Unable to reach Adhya. Please try again in a moment.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [loading, messages]
  );

  const clearConversation = useCallback(() => {
    setMessages([{
      ...WELCOME,
      id: `welcome_${Date.now()}`,
      content: "Conversation cleared. How can I help you today?",
      suggestions: [
        "What insurance do I need?",
        "Explain term life insurance",
        "Health plan comparison",
      ],
    }]);
    setError(null);
  }, []);

  return { messages, loading, error, sendMessage, clearConversation, setProfile };
}
