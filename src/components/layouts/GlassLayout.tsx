"use client";

import React from "react";

/**
 * Wraps its children with a blurred glass panel centred on the screen.
 * Adds softly blurred golden spheres in the background for depth.
 * Use for public-facing pages (игровая витрина, авторизация и т.д.).
 */
export default function GlassLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center pt-16 pb-32 px-4">
      {/* decorative spheres */}
      <div
        className="blurred-sphere"
        style={{ width: 400, height: 400, background: "#ffb648", top: "-100px", left: "-120px" }}
      />
      <div
        className="blurred-sphere"
        style={{ width: 600, height: 600, background: "#ff9248", bottom: "-200px", right: "-180px" }}
      />

      {/* glass panel */}
      <div className="glass-bg shadow-lg rounded-3xl w-full max-w-6xl mx-auto p-8 backdrop-blur-2xl shadow-neo-out">
        {children}
      </div>
    </div>
  );
}
