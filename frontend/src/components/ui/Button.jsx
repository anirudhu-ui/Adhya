import React from "react";

const styles = {
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontFamily: "var(--font-primary)",
    fontWeight: "var(--font-weight-medium)",
    fontSize: "var(--font-size-md)",
    lineHeight: 1,
    borderRadius: "var(--radius-md)",
    border: "1px solid transparent",
    cursor: "pointer",
    transition: "all var(--motion-instant) var(--motion-easing)",
    whiteSpace: "nowrap",
    userSelect: "none",
    padding: "var(--space-1) var(--space-2)",
    outline: "none",
  },
  variants: {
    primary: {
      background: "var(--color-text-primary)",
      color: "var(--color-surface-base)",
      borderColor: "var(--color-text-primary)",
    },
    secondary: {
      background: "transparent",
      color: "var(--color-text-primary)",
      borderColor: "var(--color-border)",
    },
    ghost: {
      background: "transparent",
      color: "var(--color-text-secondary)",
      borderColor: "transparent",
    },
    danger: {
      background: "transparent",
      color: "var(--color-error)",
      borderColor: "var(--color-error)",
    },
  },
  sizes: {
    sm: { fontSize: "var(--font-size-sm)", padding: "6px 12px" },
    md: { padding: "var(--space-1) var(--space-2)" },
    lg: { fontSize: "18px", padding: "14px 28px" },
  },
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  onClick,
  type = "button",
  style: extraStyle = {},
  "aria-label": ariaLabel,
  className,
  ...rest
}) {
  const [hovered, setHovered] = React.useState(false);

  const computedStyle = {
    ...styles.base,
    ...styles.variants[variant],
    ...styles.sizes[size],
    opacity: disabled || loading ? 0.4 : 1,
    cursor: disabled || loading ? "not-allowed" : "pointer",
    ...(hovered && !disabled && !loading
      ? { background: variant === "primary" ? "var(--color-text-secondary)" : "var(--color-accent-hover)" }
      : {}),
    ...extraStyle,
  };

  return (
    <button
      type={type}
      style={computedStyle}
      disabled={disabled || loading}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      {...rest}
    >
      {loading ? (
        <>
          <span
            style={{
              width: 14,
              height: 14,
              border: "2px solid currentColor",
              borderTopColor: "transparent",
              borderRadius: "50%",
              display: "inline-block",
              animation: "spin 0.7s linear infinite",
            }}
            aria-hidden="true"
          />
          <span className="sr-only">Loading…</span>
        </>
      ) : (
        children
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}
