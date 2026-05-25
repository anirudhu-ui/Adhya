import React from "react";

export function Card({ children, style: extraStyle = {}, as: Tag = "div", ...rest }) {
  return (
    <Tag
      style={{
        background: "var(--color-surface-raised)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-3)",
        ...extraStyle,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
