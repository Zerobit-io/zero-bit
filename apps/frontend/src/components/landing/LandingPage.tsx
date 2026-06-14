"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Shield, Zap, Globe, ArrowRight, Lock, Coins,
  Sun, Moon, Store, Users, Package, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import LivePrices from "./LivePrices";
import FAQSection from "./FAQSection";
import SocialChannels from "./SocialChannels";
import MarketplaceBg from "./MarketplaceBg";

/* ── Trionda ball spinner beside logo ─────────────────── */
function TriondaBall({ size = 32 }: { size?: number }) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    let frame = 0;
    let raf: number;
    const spin = () => {
      frame++;
      if (ref.current) ref.current.style.transform = `rotate(${frame * 0.6}deg)`;
      raf = requestAnimationFrame(spin);
    };
    raf = requestAnimationFrame(spin);
    return () => cancelAnimationFrame(raf);
  }, []);
  const r = size / 2;
  return (
    <svg ref={ref} width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg" aria-label="Trionda 2026 World Cup Ball"
      style={{ display: "block", flexShrink: 0 }}>
      <circle cx={r} cy={r} r={r - 1} fill="#ffffff" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
      <path d={`M${r},${1} C${r+r*.5},${r*.3} ${size-1},${r*.7} ${r+r*.85},${r+r*.2} C${r+r*.6},${r+r*.55} ${r+r*.2},${r+r*.15} ${r},${r} C${r-r*.1},${r-r*.3} ${r+r*.1},${r-r*.6} ${r},${1}Z`} fill="#1B4FD8" />
      <path d={`M${r+r*.85},${r+r*.2} C${size-1},${r+r*.6} ${r+r*.5},${size-1} ${r},${size-1} C${r-r*.2},${r+r*.65} ${r-r*.1},${r+r*.3} ${r},${r} C${r+r*.2},${r+r*.15} ${r+r*.6},${r+r*.55} ${r+r*.85},${r+r*.2}Z`} fill="#D32F2F" />
      <path d={`M${r},${size-1} C${r-r*.5},${size-1} ${1},${r+r*.5} ${1},${r} C${1},${r-r*.5} ${r-r*.5},${1} ${r},${1} C${r-r*.1},${r-r*.6} ${r-r*.3},${r-r*.2} ${r},${r} C${r-r*.1},${r+r*.3} ${r-r*.2},${r+r*.65} ${r},${size-1}Z`} fill="#1B8F3A" />
      <polygon points={`${r},${r-r*.22} ${r+r*.19},${r+r*.11} ${r-r*.19},${r+r*.11}`} fill="rgba(255,255,255,0.85)" />
      <circle cx={r} cy={r} r={r - 1} fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="0.8" />
    </svg>
  );
}

/* ── Theme toggle ─────────────────────────────────────── */
function LandingThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <button onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="p-2 rounded-full hover:bg-white/10 transition-colors" aria-label="Toggle theme">
      {resolvedTheme === "dark"
        ? <Sun className="w-5 h-5 text-yellow-400" />
        : <Moon className="w-5 h-5 text-white" />}
    </button>
  );
}

/* ── Feature cards ────────────────────────────────────── */
const features = [
  { icon: Store,   title: "P2P Marketplace",      description: "List anything — services, goods, rentals. Buyers and sellers connect directly, no platform taking a cut." },
  { icon: Shield,  title: "Stellar Escrow",         description: "Every deal is backed by a trustless Stellar escrow contract. Funds only move when both parties agree." },
  { icon: Zap,     title: "Instant Settlement",     description: "Near-instant finality on Stellar — deals close in seconds, not days." },
  { icon: Globe,   title: "Borderless Trading",     description: "Trade with anyone on Earth. Stellar's global network removes geographic and currency barriers." },
  { icon: Lock,    title: "Non-Custodial",           description: "Your keys, your funds. Connect any Stellar wallet — nobody else ever holds your assets." },
  { icon: Coins,   title: "Micro-Fee Transactions", description: "Stellar fees are fractions of a cent. Keep almost everything you earn — no hidden charges." },
];

/* ── Category chips ───────────────────────────────────── */
const categories = [
  "🏠 Rentals", "💻 Freelance", "🛒 Goods", "🎓 Tutoring",
  "🎨 Design", "🔧 Services", "🚗 Vehicles", "🎵 Music",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen text-white overflow-x-hidden"
      style={{ background: "linear-gradient(135deg, #0a0f2c 0%, #0d1a4a 50%, #0a0f2c 100%)" }}>

      {/* ── Marketplace animated background ─────────────── */}
      <MarketplaceBg />

      {/* ── Nav ─────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-12 h-16 bg-[#0a0f2c]/80 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-2">
          <Image src="/img/logo.png" alt="ZeroBit Logo" width={36} height={36} className="rounded-lg" />
          <TriondaBall size={28} />
          <span className="text-xl font-bold tracking-tight">ZeroBit</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-white/70">
          <a href="#marketplace" className="hover:text-white transition-colors">Marketplace</a>
          <a href="#features"    className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
        </div>
        <div className="flex items-center gap-3">
          <LandingThemeToggle />
          <Link href="/login">
            <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">Sign in</Button>
          </Link>
          <Link href="/register">
            <Button className="bg-[#2857B8] hover:bg-[#2857B8]/90 text-white">Start selling</Button>
          </Link>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[90vh] pt-20 px-6 md:px-20 text-center">
        <div className="pointer-events-none absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-[#2857B8]/20 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-purple-600/15 blur-[100px]" />

        <div className="relative z-10 max-w-3xl space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2857B8]/20 border border-[#2857B8]/40 text-sm text-blue-300">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            Built on Stellar · Powered by TrustlessWork
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight">
            The{" "}
            <span className="bg-gradient-to-r from-[#4c8ef7] to-[#a78bfa] bg-clip-text text-transparent">
              Stellar P2P
            </span>{" "}
            Marketplace
          </h1>

          <p className="text-lg text-white/60 leading-relaxed max-w-xl mx-auto">
            ZeroBit connects buyers and sellers worldwide. Every deal is
            protected by a trustless Stellar escrow — pay only when satisfied,
            get paid only when delivered.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-[#2857B8] hover:bg-[#2857B8]/90 text-white px-8 gap-2 text-base">
                Open the marketplace <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 text-base">
                How it works
              </Button>
            </a>
          </div>

          {/* Stats */}
          <div className="flex gap-12 pt-4 justify-center flex-wrap">
            {[
              { label: "Listings", value: "5K+" },
              { label: "Traders", value: "2K+" },
              { label: "Countries", value: "30+" },
              { label: "Avg. fee", value: "< $0.01" },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-3xl font-bold text-white">{value}</p>
                <p className="text-sm text-white/50">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────── */}
      <section id="marketplace" className="relative z-10 py-8 px-6 md:px-20">
        <p className="text-center text-white/40 text-sm uppercase tracking-widest mb-6">Trade anything</p>
        <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
          {categories.map((c) => (
            <span key={c} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/70 hover:border-[#2857B8]/60 hover:text-white cursor-pointer transition-all">
              {c}
            </span>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section id="features" className="relative z-10 py-14 px-6 md:px-20">
        <div className="text-center mb-10 space-y-3">
          <h2 className="text-4xl font-bold">Why trade on ZeroBit?</h2>
          <p className="text-white/50 max-w-xl mx-auto">
            A marketplace built for trust — where Stellar blockchain escrow
            protects every single transaction automatically.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#2857B8]/60 hover:bg-[#2857B8]/10 transition-all duration-300 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#2857B8]/20 flex items-center justify-center group-hover:bg-[#2857B8]/40 transition-colors">
                <Icon className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────── */}
      <section id="how-it-works" className="relative z-10 py-14 px-6 md:px-20 bg-white/[0.02]">
        <div className="text-center mb-10 space-y-3">
          <h2 className="text-4xl font-bold">How ZeroBit works</h2>
          <p className="text-white/50 max-w-lg mx-auto">Four steps from listing to payment — fully on-chain.</p>
        </div>
        <div className="flex flex-col md:flex-row items-start justify-center gap-8 max-w-5xl mx-auto">
          {[
            { step: "01", icon: Store,   title: "Post a listing",      desc: "Sellers post what they're offering — goods, services, rentals. Set your price in XLM or USDC." },
            { step: "02", icon: Users,   title: "Buyer places order",  desc: "Buyer agrees to terms and funds are locked into a Stellar escrow contract instantly." },
            { step: "03", icon: Package, title: "Deliver & confirm",   desc: "Seller delivers. Buyer confirms receipt. The escrow unlocks and funds transfer automatically." },
            { step: "04", icon: Star,    title: "Rate the trade",      desc: "Both parties leave reviews. Build reputation and unlock higher-value deals on the marketplace." },
          ].map(({ step, icon: Icon, title, desc }, i) => (
            <div key={step} className="relative flex-1 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#2857B8] flex items-center justify-center shadow-lg shadow-blue-900/40">
                <Icon className="w-7 h-7 text-white" />
              </div>
              <span className="text-xs font-bold text-blue-400 tracking-widest">{step}</span>
              {i < 3 && <div className="hidden md:block absolute top-8 left-[62%] w-[76%] h-px bg-gradient-to-r from-[#2857B8] to-transparent" />}
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="text-sm text-white/50 max-w-[200px]">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="relative z-10 py-16 px-6 md:px-20 text-center space-y-6 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 flex justify-center items-center">
          <div className="w-[600px] h-[300px] rounded-full bg-[#2857B8]/10 blur-[120px]" />
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold relative z-10">
          Ready to trade{" "}
          <span className="bg-gradient-to-r from-[#4c8ef7] to-[#a78bfa] bg-clip-text text-transparent">
            without limits?
          </span>
        </h2>
        <p className="text-white/50 max-w-lg mx-auto relative z-10">
          Join ZeroBit — the Stellar P2P marketplace where escrow is built in,
          fees are near-zero, and every deal is trustless by default.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
          <Link href="/register">
            <Button size="lg" className="bg-[#2857B8] hover:bg-[#2857B8]/90 text-white px-10 text-base gap-2">
              Join the marketplace <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 px-10 text-base">
              Sign in
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Live Prices ──────────────────────────────────── */}
      <div className="relative z-10 bg-[#0a0f2c]/60 backdrop-blur-sm">
        <LivePrices />
      </div>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <div className="relative z-10 bg-[#0a0f2c]/60 backdrop-blur-sm">
        <FAQSection />
      </div>

      {/* ── Social Channels ──────────────────────────────── */}
      <div className="relative z-10 bg-[#0a0f2c]/60 backdrop-blur-sm">
        <SocialChannels />
      </div>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/10 py-6 px-6 md:px-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/40">
          <div className="flex items-center gap-2">
            <Image src="/img/logo.png" alt="ZeroBit" width={24} height={24} className="rounded" />
            <span>© {new Date().getFullYear()} ZeroBit — Stellar P2P Marketplace. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <Link href="/login"    className="hover:text-white/70 transition-colors">Sign in</Link>
            <Link href="/register" className="hover:text-white/70 transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
