import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

export function MessageBubble({ message, onSuggestionClick }) {
  const ref = useRef(null);
  const isUser = message.role === "user";

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
    );
  }, []);

  return (
    <div
      ref={ref}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start",
        gap: 8,
        maxWidth: "100%",
      }}
    >
      {/* Role label */}
      <span
        style={{
          fontSize: "var(--font-size-xs)",
          color: "var(--color-text-muted)",
          fontWeight: "var(--font-weight-medium)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          paddingInline: "var(--space-1)",
        }}
      >
        {isUser ? "You" : "Adhya AI"}
      </span>

      {/* Bubble */}
      <div
        style={{
          maxWidth: "min(480px, 85%)",
          background: isUser ? "var(--color-surface-overlay)" : "var(--color-surface-raised)",
          border: `1px solid ${isUser ? "var(--color-border-hover)" : "var(--color-border)"}`,
          borderRadius: isUser
            ? "var(--radius-lg) var(--radius-lg) var(--radius-sm) var(--radius-lg)"
            : "var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm)",
          padding: "var(--space-1) var(--space-2)",
          fontSize: "var(--font-size-md)",
          color: "var(--color-text-primary)",
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {message.content}
      </div>

      {/* Suggestions */}
      {!isUser && message.suggestions && message.suggestions.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            paddingInline: "var(--space-1)",
          }}
          role="list"
          aria-label="Suggested follow-up questions"
        >
          {message.suggestions.map((s, i) => (
            <button
              key={i}
              role="listitem"
              onClick={() => onSuggestionClick?.(s)}
              style={{
                fontSize: "var(--font-size-sm)",
                color: "var(--color-text-secondary)",
                background: "transparent",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-full)",
                padding: "5px 12px",
                cursor: "pointer",
                fontFamily: "var(--font-primary)",
                transition: "border-color var(--motion-instant), background var(--motion-instant)",
                lineHeight: 1.4,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border-focus)";
                e.currentTarget.style.background = "var(--color-accent-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
