"use client";

import { useEffect, useRef } from "react";

export default function MarketplaceBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = window.innerWidth;
    let H = document.documentElement.scrollHeight || window.innerHeight;

    const resize = () => {
      W = window.innerWidth;
      H = document.documentElement.scrollHeight || window.innerHeight;
      canvas.width  = W;
      canvas.height = H;
    };
    resize();
    window.addEventListener("resize", resize);

    let frame = 0;
    let raf: number;

    /* ── helpers ─────────────────────────────── */
    const rand  = (a: number, b: number) => a + Math.random() * (b - a);
    const randI = (a: number, b: number) => Math.floor(rand(a, b));
    const lerp  = (a: number, b: number, t: number) => a + (b - a) * t;

    /* ── NODES (buyers & sellers) ───────────── */
    interface Node {
      x: number; y: number;
      vx: number; vy: number;
      r: number;
      role: "buyer" | "seller";
      label: string;
      pulse: number;
    }
    const LABELS_BUYER  = ["Alice","Bob","Carol","Dave","Eve","Frank","Grace","Hank","Iris","Jake"];
    const LABELS_SELLER = ["ShopX","TradeCo","DevHub","ArtStore","FreelancePro","GoodsNow","TechBay","CraftLab"];

    const nodes: Node[] = Array.from({ length: 28 }, () => {
      const role = Math.random() > 0.5 ? "buyer" : "seller";
      return {
        x: rand(60, W - 60),
        y: rand(60, H - 60),
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: rand(5, 9),
        role,
        label: role === "buyer"
          ? LABELS_BUYER[randI(0, LABELS_BUYER.length)]
          : LABELS_SELLER[randI(0, LABELS_SELLER.length)],
        pulse: rand(0, Math.PI * 2),
      };
    });

    /* ── PARTICLES (rising dots) ────────────── */
    interface Particle {
      x: number; y: number; vy: number; r: number; a: number; color: string;
    }
    const PARTICLE_COLORS = ["#4c8ef7","#a78bfa","#34d399","#f59e0b","#60a5fa"];
    const particles: Particle[] = Array.from({ length: 90 }, () => ({
      x: rand(0, W),
      y: rand(0, H),
      vy: -rand(0.1, 0.5),
      r: rand(0.5, 2.2),
      a: rand(0.05, 0.25),
      color: PARTICLE_COLORS[randI(0, PARTICLE_COLORS.length)],
    }));

    /* ── DEAL STREAMS (animated tx lines) ───── */
    interface Stream {
      fromIdx: number; toIdx: number;
      progress: number; speed: number;
      color: string; alpha: number;
    }
    const STREAM_COLORS = ["#4c8ef7","#a78bfa","#34d399"];
    const streams: Stream[] = [];
    const spawnStream = () => {
      const fi = randI(0, nodes.length);
      let ti = randI(0, nodes.length);
      while (ti === fi) ti = randI(0, nodes.length);
      streams.push({
        fromIdx: fi, toIdx: ti,
        progress: 0,
        speed: rand(0.003, 0.009),
        color: STREAM_COLORS[randI(0, STREAM_COLORS.length)],
        alpha: rand(0.25, 0.55),
      });
    };
    for (let i = 0; i < 14; i++) spawnStream();

    /* ── FLOATING CARDS ─────────────────────── */
    interface Card {
      x: number; y: number;
      vx: number; vy: number;
      w: number; h: number;
      title: string; price: string; tag: string;
      alpha: number; pulse: number;
    }
    const CARD_DATA = [
      { title:"Logo Design",   price:"50 XLM",  tag:"Design"    },
      { title:"Web Dev",       price:"200 XLM", tag:"Freelance" },
      { title:"Room Rental",   price:"300 XLM", tag:"Rental"    },
      { title:"Python Course", price:"80 XLM",  tag:"Tutoring"  },
      { title:"Beat Pack",     price:"40 XLM",  tag:"Music"     },
      { title:"NFT Art",       price:"120 XLM", tag:"Art"       },
      { title:"Car Rental",    price:"180 XLM", tag:"Vehicles"  },
      { title:"SEO Service",   price:"90 XLM",  tag:"Services"  },
      { title:"Podcast Edit",  price:"60 XLM",  tag:"Media"     },
      { title:"UI/UX Kit",     price:"70 XLM",  tag:"Design"    },
    ];
    const cards: Card[] = CARD_DATA.map((d) => ({
      ...d,
      x: rand(20, W - 160),
      y: rand(20, H - 90),
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.18,
      w: 148, h: 72,
      alpha: rand(0.06, 0.14),
      pulse: rand(0, Math.PI * 2),
    }));

    /* ── DRAW FUNCTIONS ─────────────────────── */

    const drawBg = () => {
      ctx.clearRect(0, 0, W, H);
      // Slightly brighter base than pure dark — give it life
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0,   "#0d1435");
      grad.addColorStop(0.4, "#101d50");
      grad.addColorStop(0.7, "#0e1e3a");
      grad.addColorStop(1,   "#0b1628");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    };

    const drawGrid = () => {
      ctx.save();
      ctx.strokeStyle = "rgba(80,120,255,0.055)";
      ctx.lineWidth = 1;
      const step = 64;
      for (let x = 0; x < W; x += step) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += step) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      ctx.restore();
    };

    const drawGlowOrbs = () => {
      [
        { x: W*0.15, y: H*0.12, c:"#2857B8", r: W*0.28 },
        { x: W*0.85, y: H*0.35, c:"#7c3aed", r: W*0.22 },
        { x: W*0.5,  y: H*0.65, c:"#0f6b3c", r: W*0.25 },
        { x: W*0.2,  y: H*0.82, c:"#1d4ed8", r: W*0.2  },
        { x: W*0.78, y: H*0.9,  c:"#6d28d9", r: W*0.18 },
      ].forEach(({ x, y, c, r }) => {
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, c + "28");
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      });
    };

    const drawParticles = () => {
      particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.a * (0.6 + 0.4 * Math.sin(frame * 0.02 + p.x * 0.01));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.restore();
        p.y += p.vy;
        if (p.y < -4) { p.y = H + 4; p.x = rand(0, W); }
      });
    };

    const drawConnectionWeb = () => {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d  = Math.sqrt(dx*dx + dy*dy);
          if (d < 200) {
            ctx.save();
            ctx.globalAlpha = (1 - d / 200) * 0.12;
            ctx.strokeStyle = nodes[i].role === "seller" ? "#4c8ef7" : "#a78bfa";
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
            ctx.restore();
          }
        }
      }
    };

    const drawNodes = () => {
      nodes.forEach((n) => {
        const isSeller = n.role === "seller";
        const color = isSeller ? "#4c8ef7" : "#a78bfa";
        const pulse = 0.5 + 0.5 * Math.sin(frame * 0.04 + n.pulse);

        // Outer pulse ring
        ctx.save();
        ctx.globalAlpha = 0.1 * pulse;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + 10 * pulse, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();

        // Node fill
        ctx.save();
        ctx.globalAlpha = 0.55 + 0.2 * pulse;
        ctx.shadowColor = color;
        ctx.shadowBlur  = 12;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();

        // Label
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.font = "500 9px Inter, sans-serif";
        ctx.fillStyle = "#e2e8ff";
        ctx.textAlign = "center";
        ctx.fillText(n.role === "seller" ? "🏪 " + n.label : "👤 " + n.label, n.x, n.y - n.r - 4);
        ctx.restore();
      });
    };

    const drawStreams = () => {
      for (let i = streams.length - 1; i >= 0; i--) {
        const s = streams[i];
        const fn = nodes[s.fromIdx];
        const tn = nodes[s.toIdx];

        // Animated moving dot along the line
        const px = lerp(fn.x, tn.x, s.progress);
        const py = lerp(fn.y, tn.y, s.progress);

        // Trail line
        ctx.save();
        ctx.globalAlpha = s.alpha * 0.4;
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.moveTo(fn.x, fn.y);
        ctx.lineTo(tn.x, tn.y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        // Moving orb
        ctx.save();
        ctx.globalAlpha = s.alpha;
        ctx.shadowColor = s.color;
        ctx.shadowBlur  = 10;
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.fill();
        ctx.restore();

        // "XLM" label on the moving dot
        ctx.save();
        ctx.globalAlpha = s.alpha * 0.7;
        ctx.font = "bold 8px Inter, sans-serif";
        ctx.fillStyle = s.color;
        ctx.textAlign = "center";
        ctx.fillText("XLM", px, py - 8);
        ctx.restore();

        s.progress += s.speed;
        if (s.progress >= 1) {
          streams.splice(i, 1);
          spawnStream();
        }
      }
    };

    const drawCards = () => {
      cards.forEach((card) => {
        const pulse = 0.5 + 0.5 * Math.sin(frame * 0.025 + card.pulse);
        const alpha = card.alpha + 0.04 * pulse;

        ctx.save();
        ctx.globalAlpha = alpha;

        // Card background
        ctx.beginPath();
        roundRect(ctx, card.x, card.y, card.w, card.h, 10);
        ctx.fillStyle = "#1a2a5e";
        ctx.fill();

        // Card border glow
        ctx.strokeStyle = `rgba(76,142,247,${0.25 + 0.15 * pulse})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Tag badge
        ctx.globalAlpha = alpha * 1.4;
        ctx.beginPath();
        roundRect(ctx, card.x + 8, card.y + 8, 52, 14, 4);
        ctx.fillStyle = "rgba(40,87,184,0.7)";
        ctx.fill();

        ctx.font = "bold 7px Inter, sans-serif";
        ctx.fillStyle = "#93c5fd";
        ctx.textAlign = "left";
        ctx.fillText(card.tag, card.x + 13, card.y + 18);

        // Title
        ctx.font = "600 9.5px Inter, sans-serif";
        ctx.fillStyle = "#e0e8ff";
        ctx.fillText(card.title, card.x + 8, card.y + 36);

        // Price
        ctx.font = "bold 10px Inter, sans-serif";
        ctx.fillStyle = "#34d399";
        ctx.fillText(card.price, card.x + 8, card.y + 52);

        // Escrow badge
        ctx.globalAlpha = alpha;
        ctx.font = "500 7.5px Inter, sans-serif";
        ctx.fillStyle = "rgba(167,139,250,0.8)";
        ctx.fillText("🔒 Escrow protected", card.x + 8, card.y + 65);

        ctx.restore();

        // Move card
        card.x += card.vx; card.y += card.vy;
        if (card.x < -card.w)     card.x = W + 10;
        if (card.x > W + 10)      card.x = -card.w;
        if (card.y < -card.h)     card.y = H + 10;
        if (card.y > H + 10)      card.y = -card.h;
      });
    };

    // Polyfill for roundRect
    const roundRect = (
      c: CanvasRenderingContext2D,
      x: number, y: number,
      w: number, h: number,
      r: number
    ) => {
      c.beginPath();
      c.moveTo(x + r, y);
      c.lineTo(x + w - r, y);
      c.quadraticCurveTo(x + w, y,     x + w, y + r);
      c.lineTo(x + w, y + h - r);
      c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      c.lineTo(x + r, y + h);
      c.quadraticCurveTo(x, y + h, x, y + h - r);
      c.lineTo(x, y + r);
      c.quadraticCurveTo(x, y, x + r, y);
      c.closePath();
    };

    const moveNodes = () => {
      nodes.forEach((n) => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 20 || n.x > W - 20) n.vx *= -1;
        if (n.y < 20 || n.y > H - 20) n.vy *= -1;
      });
    };

    /* ── MAIN LOOP ──────────────────────────── */
    const animate = () => {
      frame++;
      drawBg();
      drawGrid();
      drawGlowOrbs();
      drawParticles();
      drawCards();
      drawConnectionWeb();
      drawStreams();
      drawNodes();
      moveNodes();
      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
