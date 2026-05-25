import React, { useState } from "react";

export function Input({
  label,
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  onKeyDown,
  error,
  disabled = false,
  required = false,
  style: extraStyle = {},
  ...rest
}) {
  const [focused, setFocused] = useState(false);

  const wrapStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    width: "100%",
  };

  const labelStyle = {
    fontSize: "var(--font-size-sm)",
    fontWeight: "var(--font-weight-medium)",
    color: "var(--color-text-secondary)",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  };

  const inputStyle = {
    fontFamily: "var(--font-primary)",
    fontSize: "var(--font-size-md)",
    fontWeight: "var(--font-weight-base)",
    color: "var(--color-text-primary)",
    background: "var(--color-surface-raised)",
    border: `1px solid ${error ? "var(--color-error)" : focused ? "var(--color-border-focus)" : "var(--color-border)"}`,
    borderRadius: "var(--radius-md)",
    padding: "var(--space-1) var(--space-2)",
    width: "100%",
    outline: "none",
    transition: "border-color var(--motion-instant) var(--motion-easing)",
    opacity: disabled ? 0.4 : 1,
    cursor: disabled ? "not-allowed" : "text",
    ...extraStyle,
  };

  const errorStyle = {
    fontSize: "var(--font-size-sm)",
    color: "var(--color-error)",
    marginTop: 2,
  };

  return (
    <div style={wrapStyle}>
      {label && (
        <label htmlFor={id} style={labelStyle}>
          {label}
          {required && <span aria-hidden="true" style={{ color: "var(--color-error)", marginLeft: 2 }}>*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        disabled={disabled}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={inputStyle}
        {...rest}
      />
      {error && (
        <span id={`${id}-error`} style={errorStyle} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
