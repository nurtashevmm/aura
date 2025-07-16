"use client";
import React from "react";
import clsx from "clsx";

export default function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={clsx(
        "w-full rounded-lg glass-bg shadow-neo-in px-3 py-2 placeholder-gray-400 focus:ring-2 focus:ring-[#FFB648] focus:outline-none text-white",
        className
      )}
    />
  );
}
