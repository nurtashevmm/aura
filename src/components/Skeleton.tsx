import React from 'react';

export default function Skeleton({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse bg-zinc-700 rounded ${className}`}
      style={{ minHeight: 16, ...style }}
    />
  );
}
