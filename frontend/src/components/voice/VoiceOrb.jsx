import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Mic, Volume2 } from "lucide-react";

export function VoiceOrb({ isListening, isSpeaking, onToggle, disabled = false }) {
  const orbRef = useRef(null);
  const ring1Ref = useRef(null);
  const ring2Ref = useRef(null);
  const ring3Ref = useRef(null);
  const listeningTl = useRef(null);
  const speakingTl = useRef(null);

  useEffect(() => {
    // Listening animation — pulse rings outward
    listeningTl.current = gsap.timeline({ paused: true, repeat: -1 });
    listeningTl.current
      .to(ring1Ref.current, { scale: 1.4, opacity: 0, duration: 1.2, ease: "power2.out" }, 0)
      .to(ring2Ref.current, { scale: 1.7, opacity: 0, duration: 1.2, ease: "power2.out" }, 0.2)
      .to(ring3Ref.current, { scale: 2.0, opacity: 0, duration: 1.2, ease: "power2.out" }, 0.4)
      .set([ring1Ref.current, ring2Ref.current, ring3Ref.current], { scale: 1, opacity: 0.35 });

    // Speaking animation — gentle breathe
    speakingTl.current = gsap.timeline({ paused: true, repeat: -1, yoyo: true });
    speakingTl.current.to(orbRef.current, { scale: 1.08, duration: 0.5, ease: "sine.inOut" });

    return () => {
      listeningTl.current?.kill();
      speakingTl.current?.kill();
    };
  }, []);

  useEffect(() => {
    if (isListening) {
      listeningTl.current?.restart();
      speakingTl.current?.pause();
      gsap.to(orbRef.current, { scale: 1, duration: 0.2 });
    } else if (isSpeaking) {
      listeningTl.current?.pause();
      speakingTl.current?.restart();
    } else {
      listeningTl.current?.pause();
      speakingTl.current?.pause();
      gsap.to(orbRef.current, { scale: 1, duration: 0.3, ease: "back.out(1.7)" });
      gsap.to([ring1Ref.current, ring2Ref.current, ring3Ref.current], {
        scale: 1, opacity: 0, duration: 0.3,
      });
    }
  }, [isListening, isSpeaking]);

  const ringBase = {
    position: "absolute",
    inset: 0,
    borderRadius: "50%",
    border: "1px solid var(--color-voice-wave)",
    opacity: 0,
    pointerEvents: "none",
  };

  const orbColor = isListening
    ? "var(--color-text-primary)"
    : isSpeaking
    ? "var(--color-text-secondary)"
    : "var(--color-surface-overlay)";

  const iconColor = isListening || isSpeaking
    ? "var(--color-surface-base)"
    : "var(--color-text-muted)";

  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      aria-label={isListening ? "Stop listening" : isSpeaking ? "AI is speaking" : "Start voice input"}
      aria-pressed={isListening}
      style={{
        position: "relative",
        width: 72,
        height: 72,
        borderRadius: "50%",
        border: `1px solid ${isListening ? "var(--color-text-primary)" : "var(--color-border)"}`,
        background: orbColor,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        transition: "background var(--motion-instant), border-color var(--motion-instant)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <div ref={ring1Ref} style={ringBase} />
      <div ref={ring2Ref} style={ringBase} />
      <div ref={ring3Ref} style={ringBase} />
      <div ref={orbRef} style={{ position: "relative", zIndex: 1, display: "flex" }}>
        {isSpeaking ? (
          <Volume2 size={24} color={iconColor} />
        ) : isListening ? (
          <Mic size={24} color={iconColor} />
        ) : (
          <Mic size={24} color={iconColor} />
        )}
      </div>
    </button>
  );
}
