"use client";

import { useEffect, useRef } from "react";

export default function OceanWaveCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener("resize", handleResize);

    // Subtle ambient particle dots
    const particlesCount = 25;
    const particles: {
      x: number;
      speed: number;
      radius: number;
      color: string;
      lineIndex: number;
    }[] = [];

    const colors = ["#36A0FC", "#6FC0F6", "#38BDF8"];

    for (let i = 0; i < particlesCount; i++) {
      particles.push({
        x: Math.random() * width,
        speed: 0.3 + Math.random() * 0.8,
        radius: 1 + Math.random() * 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        lineIndex: Math.floor(Math.random() * 4),
      });
    }

    let step = 0;

    const render = () => {
      step += 0.012;
      ctx.clearRect(0, 0, width, height);

      // Render 4 elegant 3D wave lines
      const lineConfigs = [
        { yRatio: 0.45, amplitude: 25, frequency: 0.005, speedMult: 1.0, color: "rgba(54, 160, 252, 0.25)", width: 1.2 },
        { yRatio: 0.55, amplitude: 35, frequency: 0.004, speedMult: 0.8, color: "rgba(111, 192, 246, 0.2)", width: 1.0 },
        { yRatio: 0.65, amplitude: 30, frequency: 0.006, speedMult: 1.1, color: "rgba(56, 189, 248, 0.22)", width: 1.2 },
        { yRatio: 0.75, amplitude: 20, frequency: 0.005, speedMult: 1.3, color: "rgba(4, 136, 251, 0.18)", width: 1.0 },
      ];

      lineConfigs.forEach((config) => {
        ctx.beginPath();
        ctx.lineWidth = config.width;
        ctx.strokeStyle = config.color;

        const baseY = height * config.yRatio;

        for (let x = 0; x <= width; x += 10) {
          const y = baseY + Math.sin(x * config.frequency + step * config.speedMult) * config.amplitude;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });

      // Render subtle tiny spark dots
      particles.forEach((p) => {
        p.x += p.speed;
        if (p.x > width) p.x = 0;

        const config = lineConfigs[p.lineIndex];
        const baseY = height * config.yRatio;
        const y = baseY + Math.sin(p.x * config.frequency + step * config.speedMult) * config.amplitude;

        ctx.beginPath();
        ctx.arc(p.x, y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.6;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}
