import React, { useRef, useEffect, useState, useCallback } from "react";
import { gsap } from "gsap";
import { Send, RotateCcw } from "lucide-react";
import { useAdvisor } from "../hooks/useAdvisor";
import { useVoice } from "../hooks/useVoice";
import { useSubscription } from "../context/SubscriptionContext";
import { VoiceOrb } from "../components/voice/VoiceOrb";
import { VoiceTranscript } from "../components/voice/VoiceTranscript";
import { MessageBubble } from "../components/voice/MessageBubble";
import { Button } from "../components/ui/Button";
import { api } from "../services/api";

// Cryptographically strong session ID (fixes F-11)
function genSessionId() {
  return `session_${crypto.randomUUID()}`;
}

function LimitBanner({ remaining }) {
  const ref = useRef(null);
  useEffect(() => {
    gsap.fromTo(ref.current, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.3 });
  }, []);

  if (remaining > 0) return null;

  return (
    <div ref={ref} style={{
      margin: "var(--space-1) var(--space-3)",
      padding: "12px 16px",
      background: "rgba(239,68,68,0.06)",
      border: "1px solid rgba(239,68,68,0.2)",
      borderRadius: "var(--radius-lg)",
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
    }}>
      <div>
        <p style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-error)", marginBottom: 2 }}>
          Daily limit reached
        </p>
        <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
          10 messages/day for this demo. Resets at midnight UTC.
        </p>
      </div>
    </div>
  );
}

export default function AdvisorPage() {
  const { messages, loading, error, sendMessage, clearConversation, setProfile } = useAdvisor();
  const { remaining, syncUsage, decrementRemaining } = useSubscription();

  const [inputText, setInputText]   = useState("");
  const [sessionId]                 = useState(genSessionId);
  const [limitError, setLimitError] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);
  const headerRef      = useRef(null);
  const inputAreaRef   = useRef(null);

  // Voice
  const handleTranscript = useCallback(async (text) => {
    if (!text.trim()) return;
    setInputText("");
    const reply = await sendMessage(text);
    if (reply) speak(reply);
  }, [sendMessage]);

  const {
    isListening, isSpeaking, transcript, error: voiceError,
    supported, startListening, stopListening, speak, cancelSpeech,
  } = useVoice({ onTranscript: handleTranscript });

  // Entrance animation
  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(headerRef.current,   { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" })
      .fromTo(inputAreaRef.current, { opacity: 0, y: 10  }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, "-=0.2");
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Save chat session (all users — demo keeps history in-memory only, no pro gate)
  useEffect(() => {
    if (messages.length <= 1) return;
    const userMsgs = messages.filter((m) => m.role === "user" || m.role === "assistant");
    if (userMsgs.length < 2) return;

    const title    = userMsgs.find((m) => m.role === "user")?.content?.slice(0, 80) || "Chat";
    const saveable = userMsgs.map((m) => ({
      role: m.role, content: m.content, timestamp: new Date().toISOString(),
    }));

    const t = setTimeout(() => {
      api.saveChat(sessionId, title, saveable).catch(() => {});
    }, 2000);
    return () => clearTimeout(t);
  }, [messages, sessionId]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || loading) return;
    if (remaining <= 0) { setLimitError("limit"); return; }

    setInputText("");
    setLimitError(null);
    decrementRemaining(); // optimistic

    try {
      await sendMessage(text);
      // useAdvisor calls api.chat internally; sync usage from next status refresh
      // For immediate accuracy, call refresh — or rely on decrementRemaining
    } catch (err) {
      if (err?.code === "message_limit_reached") setLimitError("limit");
    }

    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const toggleVoice = () => {
    if (isSpeaking) { cancelSpeech(); return; }
    if (isListening) { stopListening(); return; }
    startListening();
  };

  const isAtLimit = remaining <= 0;
  const isLow     = remaining > 0 && remaining <= 3;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

      {/* Header */}
      <div
        ref={headerRef}
        style={{
          padding: "var(--space-2) var(--space-3)",
          borderBottom: "1px solid var(--color-border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0, opacity: 0,
        }}
      >
        <div>
          <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-semibold)", letterSpacing: "-0.02em", marginBottom: 2 }}>
            AI Advisor
          </h2>
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
            Ask anything about insurance
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Daily counter badge */}
          <span style={{
            fontSize: "var(--font-size-xs)",
            color: isAtLimit ? "var(--color-error)" : isLow ? "var(--color-warning)" : "var(--color-text-muted)",
            background: "var(--color-surface-overlay)",
            border: `1px solid ${isAtLimit ? "rgba(239,68,68,0.3)" : isLow ? "rgba(245,158,11,0.3)" : "var(--color-border)"}`,
            borderRadius: "var(--radius-full)",
            padding: "3px 10px",
            transition: "all 0.3s",
          }}>
            {isAtLimit
              ? "Limit reached · resets midnight UTC"
              : `${remaining} / 10 msgs today`}
          </span>

          <Button
            variant="ghost" size="sm"
            onClick={clearConversation}
            aria-label="Clear conversation"
            style={{ gap: 6, color: "var(--color-text-muted)" }}
          >
            <RotateCcw size={14} /> Clear
          </Button>
        </div>
      </div>

      {/* Limit banner */}
      <LimitBanner remaining={remaining} />

      {/* Messages */}
      <div
        role="log" aria-label="Conversation" aria-live="polite"
        style={{
          flex: 1, overflowY: "auto",
          padding: "var(--space-3)",
          display: "flex", flexDirection: "column", gap: "var(--space-2)",
        }}
      >
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onSuggestionClick={(s) => { setInputText(s); inputRef.current?.focus(); }}
          />
        ))}

        {loading && (
          <div aria-label="AI is thinking" style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)", padding: "0 var(--space-1)" }}>
            <span style={{ display: "flex", gap: 3 }}>
              {[0, 0.15, 0.3].map((delay, i) => (
                <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-text-muted)", display: "inline-block", animation: `bounce 1s ${delay}s ease-in-out infinite` }} />
              ))}
            </span>
            Thinking…
          </div>
        )}

        {(error || voiceError || limitError) && (
          <div role="alert" style={{ fontSize: "var(--font-size-sm)", color: "var(--color-error)", padding: "var(--space-1) var(--space-2)", background: "rgba(239,68,68,0.06)", borderRadius: "var(--radius-md)", border: "1px solid rgba(239,68,68,0.2)" }}>
            {limitError === "limit"
              ? "Daily limit reached (10 messages). Resets at midnight UTC."
              : error || voiceError}
          </div>
        )}

        <div ref={messagesEndRef} aria-hidden="true" />
      </div>

      {/* Input area */}
      <div
        ref={inputAreaRef}
        style={{
          padding: "var(--space-2) var(--space-3)",
          borderTop: "1px solid var(--color-border)",
          flexShrink: 0,
          display: "flex", flexDirection: "column", gap: "var(--space-1)",
          opacity: 0,
        }}
      >
        <VoiceTranscript transcript={transcript} isListening={isListening} />

        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
          {/* Voice available to all users */}
          {supported && (
            <VoiceOrb
              isListening={isListening}
              isSpeaking={isSpeaking}
              onToggle={toggleVoice}
              disabled={loading || isAtLimit}
            />
          )}

          <div style={{ flex: 1, position: "relative" }}>
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isAtLimit ? "Daily limit reached — come back tomorrow!" : "Ask about insurance plans, coverage, claims…"}
              rows={1}
              maxLength={2000}
              disabled={loading || isListening || isAtLimit}
              aria-label="Message input"
              style={{
                width: "100%",
                fontFamily: "var(--font-primary)",
                fontSize: "var(--font-size-md)",
                color: "var(--color-text-primary)",
                background: "var(--color-surface-raised)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                padding: "12px var(--space-2)",
                outline: "none", resize: "none", lineHeight: 1.5,
                transition: "border-color var(--motion-instant)",
                opacity: (loading || isListening || isAtLimit) ? 0.5 : 1,
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--color-border-focus)")}
              onBlur={(e)  => (e.target.style.borderColor = "var(--color-border)")}
            />
          </div>

          <Button
            onClick={handleSend}
            disabled={!inputText.trim() || loading || isAtLimit}
            aria-label="Send message"
            style={{ height: 48, width: 48, padding: 0, justifyContent: "center", borderRadius: "var(--radius-lg)" }}
          >
            <Send size={18} />
          </Button>
        </div>

        <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", textAlign: "center" }}>
          Adhya AI provides general guidance only — consult a licensed advisor for final decisions.
        </p>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}
