"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import LandingPage from "@/components/landing/LandingPage";

// Lazy-load the canvas intro — no SSR needed
const TriondaIntro = dynamic(
  () => import("@/components/landing/TriondaIntro"),
  { ssr: false }
);

export default function RootPage() {
  const [introDone, setIntroDone] = useState(false);

  const handleIntroComplete = useCallback(() => {
    setIntroDone(true);
  }, []);

  return (
    <>
      {!introDone && <TriondaIntro onComplete={handleIntroComplete} />}
      <div
        style={{
          opacity: introDone ? 1 : 0,
          transition: "opacity 0.7s ease",
          pointerEvents: introDone ? "auto" : "none",
        }}
      >
        <LandingPage />
      </div>
    </>
  );
}
