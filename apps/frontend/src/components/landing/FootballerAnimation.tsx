"use client";

import { useEffect, useRef } from "react";

export default function FootballerAnimation() {
  const ballRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ball = ballRef.current;
    if (!ball) return;
    let frame = 0;
    let raf: number;

    const animate = () => {
      frame++;
      const x = Math.sin(frame * 0.03) * 30;
      const y = Math.abs(Math.sin(frame * 0.06)) * -18;
      ball.style.transform = `translateX(${x}px) translateY(${y}px) rotate(${frame * 3}deg)`;
      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="relative flex items-end justify-center w-full h-full select-none">
      {/* Ground shadow */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-48 h-6 bg-black/10 dark:bg-white/10 rounded-full blur-md" />

      {/* Footballer SVG */}
      <svg
        viewBox="0 0 200 340"
        className="w-52 h-72 drop-shadow-xl"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Footballer kicking a ball"
        role="img"
      >
        {/* Head */}
        <circle cx="100" cy="38" r="22" fill="#FBBF77" />
        {/* Hair */}
        <ellipse cx="100" cy="20" rx="22" ry="10" fill="#1a1a2e" />
        {/* Eyes */}
        <circle cx="92" cy="36" r="3" fill="#1a1a2e" />
        <circle cx="108" cy="36" r="3" fill="#1a1a2e" />
        {/* Smile */}
        <path d="M93 46 Q100 52 107 46" stroke="#1a1a2e" strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* Jersey body - blue */}
        <rect x="72" y="60" width="56" height="70" rx="8" fill="#2857B8" />
        {/* Jersey number */}
        <text x="100" y="102" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">7</text>
        {/* Jersey collar */}
        <path d="M88 60 Q100 72 112 60" fill="#1a3a8f" />

        {/* Left arm - raised up */}
        <rect x="38" y="58" width="36" height="14" rx="7" fill="#2857B8" transform="rotate(-40 72 65)" />
        {/* Left hand */}
        <circle cx="42" cy="46" r="9" fill="#FBBF77" />

        {/* Right arm - pointing forward */}
        <rect x="126" y="58" width="36" height="14" rx="7" fill="#2857B8" transform="rotate(30 126 65)" />
        {/* Right hand */}
        <circle cx="162" cy="80" r="9" fill="#FBBF77" />

        {/* Shorts */}
        <rect x="74" y="128" width="52" height="38" rx="6" fill="#1a3a8f" />

        {/* Left leg - standing */}
        <rect x="74" y="162" width="22" height="68" rx="8" fill="#FBBF77" />
        {/* Left sock */}
        <rect x="74" y="214" width="22" height="24" rx="4" fill="#2857B8" />
        {/* Left boot */}
        <ellipse cx="85" cy="238" rx="16" ry="8" fill="#111" />

        {/* Right leg - kicking pose */}
        <rect
          x="104"
          y="160"
          width="22"
          height="65"
          rx="8"
          fill="#FBBF77"
          transform="rotate(35 115 170)"
        />
        {/* Right sock */}
        <rect
          x="104"
          y="208"
          width="22"
          height="22"
          rx="4"
          fill="#2857B8"
          transform="rotate(35 115 170)"
        />
        {/* Right boot */}
        <ellipse
          cx="148"
          cy="258"
          rx="18"
          ry="9"
          fill="#111"
          transform="rotate(10 148 258)"
        />
      </svg>

      {/* Animated ball */}
      <div
        ref={ballRef}
        className="absolute bottom-24 left-[56%] w-10 h-10 transition-none"
        style={{ willChange: "transform" }}
      >
        <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="19" fill="white" stroke="#ccc" strokeWidth="1" />
          {/* Pentagon pattern */}
          <polygon points="20,4 27,10 24,18 16,18 13,10" fill="#111" />
          <polygon points="36,15 40,23 34,28 28,22 30,14" fill="#111" />
          <polygon points="34,32 28,38 20,36 20,28 27,25" fill="#111" />
          <polygon points="6,32 12,25 20,28 20,36 12,38" fill="#111" />
          <polygon points="4,15 10,14 13,22 8,28 0,23" fill="#111" />
        </svg>
      </div>
    </div>
  );
}
