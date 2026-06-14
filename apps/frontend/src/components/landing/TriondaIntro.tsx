"use client";

import { useEffect, useRef, useState } from "react";

interface Props { onComplete: () => void; }

export default function TriondaIntro({ onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<"playing" | "fadeout">("playing");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width  = 900;
    const H = canvas.height = 520;
    let frame = 0;
    let raf: number;

    /* ─── PHASES ───────────────────────────────────────────
      0–80   : players run on from sides
      80–200 : players pass / juggle the ball between them
      200–280: female player kicks ball hard to centre
      280–360: ball flies to centre, spins fast → becomes "O"
      360–480: "ZER  BIT" pops in letter by letter, player pose as "I"
      480–540: full logo held, glow pulses
      540+   : fadeout
    ─────────────────────────────────────────────────────── */

    // ── Stars ──────────────────────────────────────────────
    const stars = Array.from({ length: 100 }, () => ({
      x: Math.random() * W, y: Math.random() * H * 0.7,
      r: Math.random() * 1.4 + 0.2,
      a: Math.random(),
    }));

    // ── Ball state ─────────────────────────────────────────
    const ball = { x: W / 2, y: H * 0.55, rot: 0, r: 26 };

    // ── Player 1 — Male (left, blue jersey #10) ────────────
    const p1 = {
      x: -80, y: H * 0.62,
      targetX: W * 0.28,
      kickFrame: -1,
      legPhase: 0,
    };

    // ── Player 2 — Female (right, red jersey #9) ──────────
    const p2 = {
      x: W + 80, y: H * 0.62,
      targetX: W * 0.72,
      kickFrame: -1,
      legPhase: Math.PI,
    };

    // ── Logo pop state ─────────────────────────────────────
    // "ZER_BIT" — the O is the ball, the I is p2's body
    // Letters animate in one by one after frame 360
    const LOGO_TEXT  = ["Z","E","R","","B","I","T"]; // "" = O (ball)
    const LOGO_X_START = W * 0.5 - 220;
    const LOGO_LETTER_W = 62;
    let   logoAlpha = 0;

    /* ─── DRAW HELPERS ──────────────────────────────────── */

    const drawBg = () => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0,   "#06091f");
      g.addColorStop(0.6, "#0a1235");
      g.addColorStop(1,   "#060f08");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    };

    const drawStars = () => {
      stars.forEach(s => {
        ctx.save();
        ctx.globalAlpha = s.a * (0.4 + 0.4 * Math.sin(frame * 0.02 + s.x));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
        ctx.restore();
      });
    };

    const drawGround = () => {
      // Grass
      const gg = ctx.createLinearGradient(0, H * 0.72, 0, H);
      gg.addColorStop(0, "#0d4a18");
      gg.addColorStop(1, "#061209");
      ctx.fillStyle = gg;
      ctx.fillRect(0, H * 0.72, W, H * 0.28);
      // White line
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.fillRect(0, H * 0.72, W, 2);
      // Centre circle
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(W / 2, H * 0.72, 70, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    };

    const drawShadow = (x: number, y: number, w: number) => {
      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.beginPath();
      ctx.ellipse(x, y + 2, w, w * 0.22, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#000";
      ctx.fill();
      ctx.restore();
    };

    /* ── TRIONDA BALL ─────────────────────────────────────── */
    const drawBall = (bx: number, by: number, br: number, rot: number, alpha = 1) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(bx, by);
      ctx.rotate(rot);

      ctx.shadowColor = "rgba(255,255,255,0.3)";
      ctx.shadowBlur  = 10;

      // Base white
      ctx.beginPath();
      ctx.arc(0, 0, br, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.shadowBlur = 0;

      // Blue panel
      ctx.beginPath();
      ctx.moveTo(0, -br);
      ctx.bezierCurveTo( br*.5,-br*.7,  br, -br*.3,  br*.85, br*.2);
      ctx.bezierCurveTo( br*.6, br*.55, br*.2, br*.15, 0, 0);
      ctx.bezierCurveTo(-br*.1,-br*.3,  br*.1,-br*.6,  0, -br);
      ctx.fillStyle = "#1B4FD8"; ctx.fill();

      // Red panel
      ctx.beginPath();
      ctx.moveTo(br*.85, br*.2);
      ctx.bezierCurveTo(br, br*.6, br*.5, br, 0, br);
      ctx.bezierCurveTo(-br*.2,br*.65,-br*.1,br*.3, 0, 0);
      ctx.bezierCurveTo(br*.2,br*.15, br*.6,br*.55, br*.85, br*.2);
      ctx.fillStyle = "#D32F2F"; ctx.fill();

      // Green panel
      ctx.beginPath();
      ctx.moveTo(0, br);
      ctx.bezierCurveTo(-br*.5,br,-br,br*.5,-br,0);
      ctx.bezierCurveTo(-br,-br*.5,-br*.5,-br,0,-br);
      ctx.bezierCurveTo(-br*.1,-br*.6,-br*.3,-br*.2,0,0);
      ctx.bezierCurveTo(-br*.1,br*.3,-br*.2,br*.65,0,br);
      ctx.fillStyle = "#1B8F3A"; ctx.fill();

      // Centre triangle
      ctx.beginPath();
      ctx.moveTo(0,-br*.22); ctx.lineTo(br*.19,br*.11); ctx.lineTo(-br*.19,br*.11);
      ctx.closePath();
      ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.fill();

      ctx.beginPath();
      ctx.arc(0,0,br,0,Math.PI*2);
      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.lineWidth = 1.5; ctx.stroke();

      ctx.restore();
    };

    /* ── MALE PLAYER (p1 — blue #10) ─────────────────────── */
    const drawMale = (px: number, py: number, legPh: number, isKicking: boolean) => {
      ctx.save();
      ctx.translate(px, py);

      const LS = Math.sin(legPh) * 18; // leg swing

      // Shadow
      drawShadow(0, 0, 18);

      // Left leg
      ctx.save();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 9; ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-5, -10);
      const lly = isKicking ? 18 : 20 + LS * 0.5;
      ctx.lineTo(-10, lly);
      ctx.stroke();
      // left boot
      ctx.fillStyle = "#111";
      ctx.beginPath();
      ctx.ellipse(-12, lly + 4, 10, 5, isKicking ? -0.2 : 0, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();

      // Right leg — kicks out if isKicking
      ctx.save();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 9; ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(5, -10);
      if (isKicking) {
        ctx.lineTo(28, -18); // kick forward
      } else {
        ctx.lineTo(10, 20 - LS * 0.5);
      }
      ctx.stroke();
      // right boot
      ctx.fillStyle = "#111";
      const rkx = isKicking ? 32 : 12;
      const rky = isKicking ? -16 : 24 - LS * 0.5;
      ctx.beginPath();
      ctx.ellipse(rkx, rky, 10, 5, isKicking ? -0.5 : 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Blue jersey body
      ctx.fillStyle = "#1B4FD8";
      ctx.beginPath();
      ctx.roundRect(-14, -48, 28, 38, 6);
      ctx.fill();
      // Number 10
      ctx.font = "bold 13px Inter,sans-serif";
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.fillText("10", 0, -28);

      // Left arm
      ctx.save();
      ctx.strokeStyle = "#1B4FD8"; ctx.lineWidth = 9; ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-14, -42);
      ctx.lineTo(isKicking ? -24 : -22, -26);
      ctx.stroke();
      ctx.restore();
      // Right arm
      ctx.save();
      ctx.strokeStyle = "#1B4FD8"; ctx.lineWidth = 9; ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(14, -42);
      ctx.lineTo(isKicking ? 24 : 22, -26);
      ctx.stroke();
      ctx.restore();

      // Shorts
      ctx.fillStyle = "#0d2a8a";
      ctx.beginPath();
      ctx.roundRect(-13, -12, 26, 16, 4);
      ctx.fill();

      // Head
      ctx.beginPath();
      ctx.arc(0, -62, 16, 0, Math.PI * 2);
      ctx.fillStyle = "#FBBF77"; ctx.fill();
      // Hair
      ctx.fillStyle = "#1a1a2e";
      ctx.beginPath();
      ctx.ellipse(0, -72, 16, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      // Eyes
      ctx.fillStyle = "#1a1a2e";
      ctx.beginPath(); ctx.arc(-5, -62, 2, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(5,  -62, 2, 0, Math.PI*2); ctx.fill();

      ctx.restore();
    };

    /* ── FEMALE PLAYER (p2 — red #9) ─────────────────────── */
    const drawFemale = (px: number, py: number, legPh: number, isKicking: boolean, isBall: boolean) => {
      ctx.save();
      ctx.translate(px, py);
      // Face right
      ctx.scale(-1, 1);

      const LS = Math.sin(legPh) * 18;

      if (!isBall) drawShadow(0, 0, 18);

      // Left leg
      ctx.save();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 9; ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-5, -10);
      const lly2 = isKicking ? 18 : 20 + LS * 0.5;
      ctx.lineTo(-10, lly2);
      ctx.stroke();
      ctx.fillStyle = "#111";
      ctx.beginPath();
      ctx.ellipse(-12, lly2+4, 10, 5, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();

      // Right leg (kick)
      ctx.save();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 9; ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(5, -10);
      if (isKicking) {
        ctx.lineTo(28, -22);
      } else {
        ctx.lineTo(10, 20 - LS*0.5);
      }
      ctx.stroke();
      ctx.fillStyle = "#111";
      const rkx2 = isKicking ? 32 : 12;
      const rky2 = isKicking ? -20 : 24 - LS*0.5;
      ctx.beginPath();
      ctx.ellipse(rkx2, rky2, 10, 5, isKicking ? -0.5 : 0, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();

      // Red jersey
      ctx.fillStyle = "#D32F2F";
      ctx.beginPath();
      ctx.roundRect(-14, -48, 28, 38, 6);
      ctx.fill();
      ctx.font = "bold 13px Inter,sans-serif";
      ctx.fillStyle = "#fff"; ctx.textAlign = "center";
      ctx.fillText("9", 0, -28);

      // Skirt/shorts
      ctx.fillStyle = "#8b0000";
      ctx.beginPath();
      ctx.roundRect(-13, -12, 26, 16, 4);
      ctx.fill();

      // Arms
      ctx.save();
      ctx.strokeStyle = "#D32F2F"; ctx.lineWidth = 9; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(-14,-42); ctx.lineTo(isKicking ? -26 : -22,-26); ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.strokeStyle = "#D32F2F"; ctx.lineWidth = 9; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(14,-42); ctx.lineTo(isKicking ? 26 : 22,-26); ctx.stroke();
      ctx.restore();

      // Head
      ctx.beginPath();
      ctx.arc(0, -62, 16, 0, Math.PI*2);
      ctx.fillStyle = "#FBBF77"; ctx.fill();
      // Ponytail
      ctx.save();
      ctx.strokeStyle = "#8B4513"; ctx.lineWidth = 6; ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-10, -70);
      ctx.bezierCurveTo(-20,-80,-30,-75,-28,-60);
      ctx.stroke();
      ctx.restore();
      // Hair band
      ctx.fillStyle = "#ff6b9d";
      ctx.beginPath();
      ctx.arc(-12, -72, 4, 0, Math.PI*2);
      ctx.fill();
      // Long hair
      ctx.fillStyle = "#8B4513";
      ctx.beginPath();
      ctx.ellipse(0, -74, 14, 7, 0, 0, Math.PI*2);
      ctx.fill();
      // Eyes
      ctx.fillStyle = "#1a1a2e";
      ctx.beginPath(); ctx.arc(-5,-62,2,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(5,-62,2,0,Math.PI*2); ctx.fill();
      // Eyelashes
      ctx.strokeStyle = "#1a1a2e"; ctx.lineWidth = 1.2;
      [[-7,-60],[-5,-60],[-3,-60]].forEach(([lx,ly]) => {
        ctx.beginPath(); ctx.moveTo(lx,ly); ctx.lineTo(lx-1,ly-4); ctx.stroke();
      });
      // Smile
      ctx.strokeStyle = "#b05a2a"; ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0,-56,5,0.2,Math.PI-0.2);
      ctx.stroke();

      ctx.restore();
    };

    /* ── LOGO POP ─────────────────────────────────────────── */
    const drawLogoLetter = (letter: string, lx: number, ly: number, scale: number, alpha: number) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(lx, ly);
      ctx.scale(scale, scale);
      ctx.font = "900 58px Inter,system-ui,sans-serif";
      ctx.textAlign  = "center";
      ctx.textBaseline = "middle";
      // Gradient fill
      const g = ctx.createLinearGradient(-30,-30,30,30);
      g.addColorStop(0,"#60a5fa");
      g.addColorStop(1,"#a78bfa");
      ctx.fillStyle = g;
      ctx.shadowColor = "#4c8ef7";
      ctx.shadowBlur  = 22 * alpha;
      ctx.fillText(letter, 0, 0);
      ctx.restore();
    };

    /* ── MAIN ANIMATE ─────────────────────────────────────── */
    const animate = () => {
      frame++;
      ctx.clearRect(0,0,W,H);
      drawBg();
      drawStars();
      drawGround();

      /* ──── PHASE 0–80: run in ──────────────────────────── */
      if (frame <= 80) {
        const t = frame / 80;
        p1.x = -80 + (p1.targetX + 80) * t;
        p2.x = (W + 80) - ((W + 80 - p2.targetX)) * t;
        ball.x = W / 2;
        ball.y = H * 0.62;
        ball.rot = frame * 0.05;
        p1.legPhase += 0.22;
        p2.legPhase += 0.22;
      }

      /* ──── PHASE 80–200: pass / juggle ─────────────────── */
      if (frame > 80 && frame <= 200) {
        p1.legPhase += 0.14;
        p2.legPhase += 0.14;
        const t = (frame - 80) / 120;
        // Ball oscillates between players
        const osc = Math.sin(t * Math.PI * 2.5);
        ball.x = W * 0.5 + osc * (W * 0.2);
        ball.y = H * 0.62 - Math.abs(Math.sin(t * Math.PI * 5)) * 55;
        ball.rot += 0.12;

        // Players lean toward ball
        if (ball.x < W * 0.5) {
          p1.kickFrame = frame; // p1 "touching"
        } else {
          p2.kickFrame = frame;
        }
      }

      /* ──── PHASE 200–280: female winds up + kicks ──────── */
      if (frame > 200 && frame <= 280) {
        const t = (frame - 200) / 80;
        p2.kickFrame = frame;
        p1.legPhase += 0.08;
        // ball rolls to p2
        ball.x = lerp(ball.x, p2.x - 30, 0.07);
        ball.y = lerp(ball.y, H * 0.62, 0.06);
        ball.rot += 0.09;
      }

      /* ──── PHASE 280–360: ball flies centre, spins fast ── */
      if (frame > 280 && frame <= 360) {
        const t = (frame - 280) / 80;
        const ease = 1 - Math.pow(1 - t, 3);
        ball.x = lerp(p2.x - 30, W * 0.5 + 10, ease);
        ball.y = lerp(H * 0.62, H * 0.38, ease);
        ball.rot += 0.35;
        ball.r  = lerp(26, 30, ease);
        p2.kickFrame = 281; // hold kick pose
      }

      /* ──── PHASE 360–480: logo pops in ─────────────────── */
      if (frame > 360) {
        logoAlpha = Math.min(1, (frame - 360) / 60);
        // ball stays centre as the O
        ball.x = W * 0.5 + 10;
        ball.y = H * 0.38;
        ball.rot += 0.04; // slow spin
        ball.r = 30;

        // p2 walks off to the right side — she's done her job
        p2.x = Math.min(W + 100, p2.x + 1.2);
        p2.y = H * 0.62;
        p2.kickFrame = -1;
        p2.legPhase += 0.14;
      }

      /* ──── PHASE 480+: hold then fade ──────────────────── */
      if (frame > 520) {
        cancelAnimationFrame(raf);
        setPhase("fadeout");
        setTimeout(onComplete, 650);
        return;
      }

      /* ─── DRAW PLAYERS ──────────────────────────────────── */
      const p1Kick = p1.kickFrame === frame || (frame > 200 && frame <= 220);
      const p2Kick = p2.kickFrame === frame || (frame > 200 && frame <= 300);

      drawMale(p1.x, p1.y, p1.legPhase, p1Kick);
      drawFemale(p2.x, p2.y, p2.legPhase, p2Kick, false);

      /* ─── DRAW BALL (unless it's the O in logo) ─────────── */
      if (frame <= 360 || frame > 360) {
        // always draw — after 360 it IS the O, drawn separately in logo
      }

      /* ─── LOGO POP ───────────────────────────────────────── */
      if (frame > 360) {
        const cx = W * 0.5 + 10; // centre of logo
        // Calculate positions: "ZER" left of O, "BIT" right
        // Z E R  [O]  B [I] T
        // indices: Z=0 E=1 R=2  O=ball  B=3 I=p2 T=4
        const letters = ["Z","E","R","B","I","T"];
        const lPositions = [
          cx - LOGO_LETTER_W*3.5,
          cx - LOGO_LETTER_W*2.5,
          cx - LOGO_LETTER_W*1.5,
          cx + LOGO_LETTER_W*1.5,
          cx + LOGO_LETTER_W*2.5,
          cx + LOGO_LETTER_W*3.5,
        ];

        letters.forEach((lt, idx) => {
          const appearFrame = 360 + idx * 14;
          if (frame < appearFrame) return;
          const t2  = Math.min(1,(frame - appearFrame)/18);
          const scl = 0.4 + 0.6 * t2 + 0.08*Math.sin(frame*0.1+idx);
          const a   = Math.min(1, t2 * logoAlpha);
          drawLogoLetter(lt, lPositions[idx], H*0.38, scl, a);
        });

        // Ball as "O"
        const oAppear = 360 + 2 * 14;
        if (frame >= oAppear) {
          const ot = Math.min(1,(frame-oAppear)/18);
          drawShadow(ball.x, ball.y + ball.r, ball.r);
          drawBall(ball.x, ball.y, ball.r * (0.7 + 0.3*ot), ball.rot, ot * logoAlpha);
          // Glow ring around ball-O
          ctx.save();
          ctx.globalAlpha = 0.35 * ot * logoAlpha;
          ctx.strokeStyle = "#4c8ef7";
          ctx.lineWidth   = 2.5;
          ctx.shadowColor = "#4c8ef7";
          ctx.shadowBlur  = 14;
          ctx.beginPath();
          ctx.arc(ball.x, ball.y, ball.r + 5, 0, Math.PI*2);
          ctx.stroke();
          ctx.restore();
        }

        // Tagline
        if (frame > 420) {
          const ta = Math.min(1,(frame-420)/40) * logoAlpha;
          ctx.save();
          ctx.globalAlpha = ta * 0.7;
          ctx.font = "600 16px Inter,sans-serif";
          ctx.textAlign = "center";
          ctx.fillStyle = "#a5c8ff";
          ctx.letterSpacing = "3px";
          ctx.fillText("STELLAR  ·  P2P  ·  MARKETPLACE", W/2, H*0.38 + 60);
          ctx.restore();
        }
      } else {
        // Ball in play
        drawShadow(ball.x, ball.y + ball.r - 2, ball.r * 0.85);
        drawBall(ball.x, ball.y, ball.r, ball.rot);
      }

      raf = requestAnimationFrame(animate);
    };

    // ── lerp helper (used inside animate) ─────────────────
    function lerp(a: number, b: number, t: number){ return a + (b-a)*t; }

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#06091f]"
      style={{ opacity: phase === "fadeout" ? 0 : 1, transition: "opacity 0.65s ease" }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ maxWidth:"100vw", maxHeight:"100vh", objectFit:"contain" }}
      />
    </div>
  );
}
