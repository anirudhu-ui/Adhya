import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

export function VoiceTranscript({ transcript, isListening }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    if (isListening || transcript) {
      gsap.to(ref.current, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
    } else {
      gsap.to(ref.current, { opacity: 0, y: 4, duration: 0.2 });
    }
  }, [isListening, transcript]);

  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      aria-label="Live transcript"
      style={{
        opacity: 0,
        transform: "translateY(4px)",
        fontSize: "var(--font-size-md)",
        color: isListening ? "var(--color-text-primary)" : "var(--color-text-muted)",
        fontStyle: transcript ? "normal" : "italic",
        minHeight: 24,
        transition: "color var(--motion-instant)",
        padding: "0 var(--space-1)",
      }}
    >
      {isListening && !transcript ? "Listening…" : transcript || ""}
    </div>
  );
}
