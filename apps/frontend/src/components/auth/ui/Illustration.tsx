"use client";

import { useEffect, useRef } from "react";

export default function Illustration() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    let frame = 0;
    let raf: number;

    // Generate nodes once
    const nodes = Array.from({ length: 38 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2.5 + 1,
      color: ["#4c8ef7", "#a78bfa", "#1B8F3A", "#D32F2F"][Math.floor(Math.random() * 4)],
    }));

    // Floating particles
    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vy: -(Math.random() * 0.3 + 0.1),
      r: Math.random() * 1.2 + 0.3,
      a: Math.random(),
    }));

    const drawBg = () => {
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, "#0a0f2c");
      grad.addColorStop(0.5, "#0d1a4a");
      grad.addColorStop(1, "#06121e");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    };

    const drawGrid = () => {
      ctx.strokeStyle = "rgba(72,100,200,0.07)";
      ctx.lineWidth = 1;
      const step = 48;
      for (let x = 0; x < W; x += step) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += step) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
    };

    const drawConnections = () => {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.save();
            ctx.globalAlpha = (1 - dist / 130) * 0.35;
            ctx.strokeStyle = nodes[i].color;
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
        // Pulse ring
        ctx.save();
        ctx.globalAlpha = 0.15 + 0.1 * Math.sin(frame * 0.04 + n.x);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + 5, 0, Math.PI * 2);
        ctx.strokeStyle = n.color;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
        // Core dot
        ctx.save();
        ctx.globalAlpha = 0.85;
        ctx.shadowColor = n.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.fill();
        ctx.restore();
      });
    };

    const drawParticles = () => {
      particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.a * (0.4 + 0.3 * Math.sin(frame * 0.02 + p.x));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.restore();
        p.y += p.vy;
        if (p.y < -4) p.y = H + 4;
      });
    };

    const drawGlowOrbs = () => {
      [
        { x: W * 0.3, y: H * 0.25, color: "#2857B8", r: 160 },
        { x: W * 0.75, y: H * 0.7, color: "#7c3aed", r: 120 },
        { x: W * 0.6, y: H * 0.15, color: "#1B8F3A", r: 80 },
      ].forEach(({ x, y, color, r }) => {
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, color + "22");
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      });
    };

    const drawBrandText = () => {
      ctx.save();
      ctx.globalAlpha = 0.07;
      ctx.font = `bold ${Math.round(W * 0.09)}px Inter, sans-serif`;
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText("ZeroBit", W / 2, H * 0.48);
      ctx.fillText("Wallet", W / 2, H * 0.58);
      ctx.restore();

      // Tagline
      ctx.save();
      ctx.globalAlpha = 0.55 + 0.15 * Math.sin(frame * 0.025);
      ctx.font = `600 ${Math.round(W * 0.038)}px Inter, sans-serif`;
      ctx.fillStyle = "#4c8ef7";
      ctx.textAlign = "center";
      ctx.shadowColor = "#4c8ef7";
      ctx.shadowBlur = 16;
      ctx.fillText("P2P Marketplace · Stellar · Trustless", W / 2, H * 0.88);
      ctx.restore();
    };

    const animate = () => {
      frame++;
      drawBg();
      drawGrid();
      drawGlowOrbs();
      drawConnections();
      drawNodes();
      drawParticles();
      drawBrandText();

      // Move nodes
      nodes.forEach((n) => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      });

      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="relative hidden md:flex md:w-1/2 h-screen items-stretch">
      <canvas
        ref={canvasRef}
        width={720}
        height={900}
        className="w-full h-full"
        style={{ display: "block" }}
      />
    </div>
  );
}
