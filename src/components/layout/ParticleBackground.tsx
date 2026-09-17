import React, { useEffect, useRef } from "react";
import { AppTheme } from "../../types";

interface ParticleBackgroundProps {
  theme?: AppTheme;
  isDark?: boolean;
}

interface Particle {
  x: number;
  y: number;
  z: number; // 0.3 (far) to 1.8 (near foreground)
  radius: number;
  baseSpeed: number;
  flutterFreq: number;
  flutterAmp: number;
  phase: number;
  rotation: number;
  rotSpeed: number;
  type: "circle" | "star" | "ring" | "spark";
  colorIndex: number;
  baseAlpha: number;
}

const DARK_COLORS = [
  { r: 251, g: 191, b: 36 }, // Amber Gold (#FBBF24)
  { r: 245, g: 158, b: 11 }, // Warm Amber (#F59E0B)
  { r: 56, g: 189, b: 248 },  // Electric Cyan (#38BDF8)
  { r: 129, g: 140, b: 248 }, // Indigo Violet (#818CF8)
  { r: 255, g: 255, b: 255 }, // Starlight White
  { r: 244, g: 63, b: 94 },   // Soft Rose Ember (#F43F5E)
];

const LIGHT_COLORS = [
  { r: 99, g: 102, b: 241 },  // Vibrant Indigo (#6366F1)
  { r: 79, g: 70, b: 229 },   // Deep Indigo (#4F46E5)
  { r: 245, g: 158, b: 11 },  // Warm Amber (#F59E0B)
  { r: 14, g: 165, b: 233 },  // Sky Blue (#0EA5E9)
  { r: 100, g: 116, b: 139 }, // Slate Neutral (#64748B)
  { r: 255, g: 255, b: 255 }, // Crisp White Highlight
];

export const ParticleBackground: React.FC<ParticleBackgroundProps> = ({
  theme,
  isDark: isDarkProp,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDark =
    isDarkProp !== undefined
      ? isDarkProp
      : theme === "obsidian-gold" ||
        theme === "obsidian-noir" ||
        theme === "cyber-dark" ||
        theme === "neon-matrix";

  const isDarkRef = useRef(isDark);
  useEffect(() => {
    isDarkRef.current = isDark;
  }, [isDark]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const updateDimensions = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    updateDimensions();

    // Spawn ~55 particles scaled by screen area
    const particleCount = Math.max(35, Math.min(75, Math.floor((width * height) / 18000)));
    const particles: Particle[] = [];

    const types: ("circle" | "star" | "ring" | "spark")[] = [
      "circle",
      "circle",
      "star",
      "spark",
      "ring",
    ];

    for (let i = 0; i < particleCount; i++) {
      const z = 0.35 + Math.random() * 1.35; // depth
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z,
        radius: (1.2 + Math.random() * 2.5) * (0.6 + z * 0.4),
        baseSpeed: (0.45 + Math.random() * 0.95) * (0.6 + z * 0.4),
        flutterFreq: 0.0015 + Math.random() * 0.003,
        flutterAmp: 0.8 + Math.random() * 2.2,
        phase: Math.random() * Math.PI * 2,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        type: types[Math.floor(Math.random() * types.length)],
        colorIndex: Math.floor(Math.random() * 6),
        baseAlpha: 0.3 + Math.random() * 0.45,
      });
    }

    // Scroll tracking & kinetic physics
    let lastScrollY = window.scrollY || document.documentElement.scrollTop;
    let scrollVelocity = 0;
    let mouseX = -9999;
    let mouseY = -9999;

    const handleScroll = () => {
      const currentScrollY = window.scrollY || document.documentElement.scrollTop;
      const delta = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;
      // Boost velocity in response to scrolling (positive when scrolling down)
      scrollVelocity += delta * 0.14;
      // Clamp max scroll boost
      scrollVelocity = Math.max(-28, Math.min(28, scrollVelocity));
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateDimensions);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    let lastTime = performance.now();

    // Helper: draw 4-pointed diamond micro-star
    const drawStar = (
      c: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      size: number,
      angle: number
    ) => {
      c.save();
      c.translate(cx, cy);
      c.rotate(angle);
      c.beginPath();
      c.moveTo(0, -size * 1.6);
      c.quadraticCurveTo(0, 0, size * 1.6, 0);
      c.quadraticCurveTo(0, 0, 0, size * 1.6);
      c.quadraticCurveTo(0, 0, -size * 1.6, 0);
      c.quadraticCurveTo(0, 0, 0, -size * 1.6);
      c.closePath();
      c.fill();
      c.restore();
    };

    const render = (time: number) => {
      const dt = Math.min(32, time - lastTime);
      lastTime = time;

      // Friction damping for scroll velocity
      scrollVelocity *= 0.91;
      if (Math.abs(scrollVelocity) < 0.05) scrollVelocity = 0;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      const darkActive = isDarkRef.current;
      const palette = darkActive ? DARK_COLORS : LIGHT_COLORS;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Kinetic movement: ambient downward fall + scroll parallax boost
        const speedBoost = scrollVelocity * 0.16 * p.z;
        const totalVy = p.baseSpeed + speedBoost;
        p.y += totalVy * (dt / 16);

        // Gentle sinusoidal horizontal flutter
        p.x += Math.sin(time * p.flutterFreq + p.phase) * (p.flutterAmp * (dt / 16));

        // Soft cursor deflection
        if (mouseX > 0 && mouseY > 0) {
          const dx = p.x - mouseX;
          const dy = p.y - mouseY;
          const distSq = dx * dx + dy * dy;
          if (distSq < 12000 && distSq > 1) {
            const dist = Math.sqrt(distSq);
            const force = (1 - dist / 110) * 1.2;
            p.x += (dx / dist) * force * p.z;
            p.y += (dy / dist) * force * p.z;
          }
        }

        p.rotation += p.rotSpeed * (dt / 16);

        // Continuous wrap-around with scroll buffer
        if (p.y > height + 24) {
          p.y = -20;
          p.x = Math.random() * width;
        } else if (p.y < -24) {
          p.y = height + 20;
          p.x = Math.random() * width;
        }

        if (p.x > width + 24) {
          p.x = -20;
        } else if (p.x < -24) {
          p.x = width + 20;
        }

        // Pulse alpha gently with time
        const pulse = Math.sin(time * 0.002 + p.phase) * 0.15;
        const currentAlpha = Math.max(0.1, Math.min(0.95, p.baseAlpha + pulse));

        const col = palette[p.colorIndex % palette.length];
        const rgbaStr = `rgba(${col.r}, ${col.g}, ${col.b}, ${currentAlpha})`;

        ctx.fillStyle = rgbaStr;
        ctx.strokeStyle = rgbaStr;

        // Visual trailing streak when scrolling quickly
        if (Math.abs(scrollVelocity) > 2.5) {
          const streakLen = Math.min(30, Math.abs(scrollVelocity) * p.z * 1.8);
          const streakDir = scrollVelocity > 0 ? -1 : 1;
          ctx.beginPath();
          ctx.lineWidth = Math.max(1, p.radius * 0.7);
          ctx.lineCap = "round";
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x, p.y + streakDir * streakLen);
          ctx.stroke();
        }

        // Dark mode soft glow aura for foreground particles
        if (darkActive && p.z > 0.9) {
          const glowAlpha = currentAlpha * 0.35;
          const grad = ctx.createRadialGradient(
            p.x,
            p.y,
            0,
            p.x,
            p.y,
            p.radius * 2.8
          );
          grad.addColorStop(0, `rgba(${col.r}, ${col.g}, ${col.b}, ${glowAlpha})`);
          grad.addColorStop(1, `rgba(${col.r}, ${col.g}, ${col.b}, 0)`);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 2.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = rgbaStr;
        }

        // Draw particle based on type
        if (p.type === "star") {
          drawStar(ctx, p.x, p.y, p.radius * 1.2, p.rotation);
        } else if (p.type === "ring") {
          ctx.beginPath();
          ctx.lineWidth = darkActive ? 1.2 : 1.5;
          ctx.arc(p.x, p.y, p.radius * 1.1, 0, Math.PI * 2);
          ctx.stroke();
        } else if (p.type === "spark") {
          // Micro diamond spark
          ctx.beginPath();
          ctx.moveTo(p.x, p.y - p.radius * 1.3);
          ctx.lineTo(p.x + p.radius * 0.9, p.y);
          ctx.lineTo(p.x, p.y + p.radius * 1.3);
          ctx.lineTo(p.x - p.radius * 0.9, p.y);
          ctx.closePath();
          ctx.fill();
        } else {
          // Standard soft circular mote
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateDimensions);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="ambient-particle-canvas"
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-500"
      style={{ opacity: 0.92 }}
    />
  );
};
