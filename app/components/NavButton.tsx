"use client";
import { useState } from "react";

type Props = {
  onClick: () => void;
  children: React.ReactNode;
  direction?: "left" | "right";
};

export default function NavButton({ onClick, children, direction = "right" }: Props) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative text-xs uppercase tracking-widest pb-0.5 mb-1 md:mb-2 overflow-hidden"
      style={{
        color: hovered ? 'var(--color-bright)' : 'var(--color-muted)',
        fontFamily: 'var(--font-mono)',
        transition: 'color 0.2s ease',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      {children}
      {/* Underline animation */}
      <span
        style={{
          position: 'absolute',
          bottom: 0,
          left: direction === "right" ? 0 : 'auto',
          right: direction === "left" ? 0 : 'auto',
          height: '1px',
          backgroundColor: 'var(--color-accent)',
          width: hovered ? '100%' : '0%',
          transition: 'width 0.2s ease',
        }}
      />
    </button>
  );
}