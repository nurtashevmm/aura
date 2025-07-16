"use client";
import clsx from "clsx";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export default function Button({
  className,
  variant = "primary",
  size = "md",
  loading,
  children,
  ...rest
}: ButtonProps) {
  const base = clsx(
    "font-medium rounded-lg shadow-neo-out focus:outline-none transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
    {
      'px-3 py-1.5 text-sm': size === 'sm',
      'px-4 py-2': size === 'md',
      'px-6 py-3 text-lg': size === 'lg',
    }
  );
  const variants: Record<string, string> = {
    primary: "bg-[#FFB648]/90 hover:bg-[#ffb648] text-black",
    secondary: "glass-bg text-white hover:bg-white/10",
    ghost: "bg-transparent text-white hover:bg-white/5 shadow-none",
  };
  return (
    <button
      {...rest}
      className={clsx(base, variants[variant], className)}
    >
      {loading ? "Загрузка…" : children}
    </button>
  );
}
