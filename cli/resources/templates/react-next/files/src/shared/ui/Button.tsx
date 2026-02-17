"use client";

import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export function Button({
  variant = "primary",
  children,
  style,
  ...props
}: ButtonProps) {
  const base: React.CSSProperties = {
    padding: "0.4rem 1rem",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
    fontWeight: 500,
    fontSize: "0.9rem",
  };

  const variants: Record<string, React.CSSProperties> = {
    primary: { background: "#646cff", color: "#fff" },
    secondary: { background: "#3a3a3a", color: "#fff" },
  };

  return (
    <button style={{ ...base, ...variants[variant], ...style }} {...props}>
      {children}
    </button>
  );
}