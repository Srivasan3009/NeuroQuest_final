import React, { useEffect, useRef } from "react";
import { AppTheme } from "../../types";

interface ParticleBackgroundProps {
  theme?: AppTheme;
  isDark?: boolean;
}

type StarType = "star_4p" | "star_8p" | "circle" | "ring" | "spark" | "beacon";

interface StarParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  originBaseVx: number;
  originBaseVy: number;
  sizeCategory: "small" | "medium" | "large" | "giant";
  radius: number;
  baseRadius: number;
  z: number; // 0.35 (depth) to 1.8 (prominent foreground)
  speed: number;
  flutterFreq: number;
  flutterAmp: number;
  phase: number;
  twinkleFreq: number;
  rotation: number;
  rotSpeed: number;
  type: StarType;
  colorIndex: number;
  baseAlpha: number;

  // Dynamic interaction & physics state
  isBursting: boolean;
  burstProgress: number; // 0 to 1
  burstCooldown: number; // ms timestamp prevent spam bursting
  orbitAngle: number;
}

interface SparkDebris {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: { r: number; g: number; b: number };
  alpha: number;
  decay: number;
  rotation: number;
  rotSpeed: number;
  type: "spark" | "dust";
}

interface CosmicRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: { r: number; g: number; b: number };
}

// Deep space and neural AI-inspired color palettes
const DARK_SPACE_PALETTE = [
  { r: 251, g: 191, b: 36 }, // Stellar Amber Gold (#FBBF24)
  { r: 245, g: 158, b: 11 }, // Radiant Amber (#F59E0B)
  { r: 56, g: 189, b: 248 },  // Cosmic Cyan (#38BDF8)
  { r: 129, g: 140, b: 248 }, // Neural Violet / Indigo (#818CF8)
  { r: 168, g: 85, b: 247 },  // Deep Purple Pulse (#A855F7)
  { r: 244, g: 244, b: 245 }, // Pure Stellar White Diamond
  { r: 244, g: 63, b: 94 },   // Supernova Rose Ember (#F43F5E)
];

const LIGHT_SPACE_PALETTE = [
  { r: 99, g: 102, b: 241 },  // Vibrant Indigo (#6366F1)
  { r: 79, g: 70, b: 229 },   // Deep Neural Indigo (#4F46E5)
  { r: 245, g: 158, b: 11 },  // Amber Spark (#F59E0B)
  { r: 14, g: 165, b: 233 },  // Atmospheric Sky Blue (#0EA5E9)
  { r: 139, g: 92, b: 246 },  // Violet Mote (#8B5CF6)
  { r: 100, g: 116, b: 139 }, // Slate Nebula Smoke (#64748B)
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
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Check system prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let prefersReducedMotion = mediaQuery.matches;
    const onMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
    };
    mediaQuery.addEventListener?.("change", onMotionChange);

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

    // Balanced particle density for refined, subtle background stars (~70-130 particles)
    const particleCount = Math.max(65, Math.min(130, Math.floor((width * height) / 9500)));
    const particles: StarParticle[] = [];
    const debrisList: SparkDebris[] = [];
    const ripples: CosmicRipple[] = [];

    // Factory to instantiate individual stars and cosmic motes
    const createStar = (id: number, startY?: number): StarParticle => {
      let sizeCategory: "small" | "medium" | "large" | "giant" = "small";
      let baseRadius = 1.6;
      let type: StarType = "circle";
      let z = 0.5 + Math.random() * 0.5;

      const roll = Math.random();
      if (roll < 0.44) {
        // 44% Small subtle luminous stars & sparks (Radius ~1.2 - 2.2px)
        sizeCategory = "small";
        baseRadius = 1.2 + Math.random() * 1.0;
        type = Math.random() > 0.4 ? "spark" : "circle";
        z = 0.45 + Math.random() * 0.4;
      } else if (roll < 0.80) {
        // 36% Medium 4-point Diamond Stars & Rings (Radius ~2.6 - 4.2px)
        sizeCategory = "medium";
        baseRadius = 2.6 + Math.random() * 1.6;
        type = Math.random() > 0.35 ? "star_4p" : "ring";
        z = 0.75 + Math.random() * 0.45;
      } else if (roll < 0.94) {
        // 14% Large 4-point & 8-point Stellar Beacons (Radius ~4.8 - 7.2px)
        sizeCategory = "large";
        baseRadius = 4.8 + Math.random() * 2.4;
        type = Math.random() > 0.45 ? "star_8p" : "star_4p";
        z = 1.1 + Math.random() * 0.45;
      } else {
        // 6% Supernova Star Beacons (Radius ~7.5 - 10.5px)
        sizeCategory = "giant";
        baseRadius = 7.5 + Math.random() * 3.0;
        type = Math.random() > 0.5 ? "beacon" : "star_8p";
        z = 1.35 + Math.random() * 0.45;
      }

      // Downward falling speed adjusted by depth layer z
      const baseSpeed = (0.28 + Math.random() * 0.55) * (0.6 + z * 0.4);
      const baseVx = (Math.random() - 0.5) * 0.18;

      return {
        id,
        x: Math.random() * width,
        y: startY !== undefined ? startY : Math.random() * height,
        vx: baseVx,
        vy: baseSpeed,
        originBaseVx: baseVx,
        originBaseVy: baseSpeed,
        sizeCategory,
        radius: baseRadius,
        baseRadius,
        z,
        speed: baseSpeed,
        flutterFreq: 0.0006 + Math.random() * 0.0018,
        flutterAmp: 0.6 + Math.random() * 1.8,
        phase: Math.random() * Math.PI * 2,
        twinkleFreq: 0.0012 + Math.random() * 0.0028,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * (sizeCategory === "giant" ? 0.012 : 0.025),
        type,
        colorIndex: Math.floor(Math.random() * 7),
        baseAlpha:
          sizeCategory === "giant"
            ? 0.8 + Math.random() * 0.15
            : sizeCategory === "large"
            ? 0.7 + Math.random() * 0.2
            : sizeCategory === "medium"
            ? 0.5 + Math.random() * 0.3
            : 0.3 + Math.random() * 0.35,
        isBursting: false,
        burstProgress: 0,
        burstCooldown: 0,
        orbitAngle: Math.random() * Math.PI * 2,
      };
    };

    // Populate initial particles across the screen
    for (let i = 0; i < particleCount; i++) {
      particles.push(createStar(i));
    }

    // Interactive mouse coordinates with smooth physics interpolation
    let targetMouseX = -9999;
    let targetMouseY = -9999;
    let smoothMouseX = -9999;
    let smoothMouseY = -9999;
    let mouseSpeed = 0;
    let lastMouseX = -9999;
    let lastMouseY = -9999;
    let lastMouseMoveTime = 0;

    // Scroll tracking & kinetic physics
    let lastScrollY = window.scrollY || document.documentElement.scrollTop;
    let scrollVelocity = 0;

    const handleScroll = () => {
      const currentScrollY = window.scrollY || document.documentElement.scrollTop;
      const delta = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;
      scrollVelocity += delta * 0.14;
      scrollVelocity = Math.max(-28, Math.min(28, scrollVelocity));
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
      lastMouseMoveTime = performance.now();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        targetMouseX = e.touches[0].clientX;
        targetMouseY = e.touches[0].clientY;
        lastMouseMoveTime = performance.now();
      }
    };

    const handleMouseLeave = () => {
      targetMouseX = -9999;
      targetMouseY = -9999;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateDimensions);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    // Particle burst generator when mouse hits proximity threshold
    const triggerStarBurst = (star: StarParticle, now: number) => {
      if (now - star.burstCooldown < 1200) return;
      star.burstCooldown = now;
      star.isBursting = true;
      star.burstProgress = 0;

      const darkActive = isDarkRef.current;
      const palette = darkActive ? DARK_SPACE_PALETTE : LIGHT_SPACE_PALETTE;
      const col = palette[star.colorIndex % palette.length];

      // Spawn burst debris particles (5 to 12 sparks)
      const debrisCount =
        star.sizeCategory === "giant"
          ? 12
          : star.sizeCategory === "large"
          ? 9
          : star.sizeCategory === "medium"
          ? 6
          : 4;

      const baseSpeed = star.sizeCategory === "giant" ? 3.4 : star.sizeCategory === "large" ? 2.6 : 1.8;

      for (let d = 0; d < debrisCount; d++) {
        const angle = (Math.PI * 2 * d) / debrisCount + (Math.random() - 0.5) * 0.6;
        const speed = (baseSpeed * (0.6 + Math.random() * 0.9)) * star.z;
        debrisList.push({
          x: star.x,
          y: star.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: Math.max(0.8, star.radius * 0.3 * (0.7 + Math.random() * 0.6)),
          color: col,
          alpha: 0.95,
          decay: 0.02 + Math.random() * 0.025,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.18,
          type: Math.random() > 0.4 ? "spark" : "dust",
        });
      }

      // Add radiant expanding cosmic ripple scaled to star size
      ripples.push({
        x: star.x,
        y: star.y,
        radius: star.radius * 1.5,
        maxRadius: star.sizeCategory === "giant" ? 42 : star.sizeCategory === "large" ? 30 : 20,
        alpha: 0.65,
        color: col,
      });

      // Temporarily deflect parent star with kickback velocity
      const kickAngle = Math.random() * Math.PI * 2;
      star.vx += Math.cos(kickAngle) * 1.8;
      star.vy += Math.sin(kickAngle) * 1.8;
    };

    // Helper: Draw brilliant 4-point diamond cosmic star
    const drawStar4P = (
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
      c.moveTo(0, -size * 1.8);
      c.quadraticCurveTo(0, 0, size * 1.8, 0);
      c.quadraticCurveTo(0, 0, 0, size * 1.8);
      c.quadraticCurveTo(0, 0, -size * 1.8, 0);
      c.quadraticCurveTo(0, 0, 0, -size * 1.8);
      c.closePath();
      c.fill();
      c.restore();
    };

    // Helper: Draw 8-point super-luminous stellar beacon
    const drawStar8P = (
      c: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      size: number,
      angle: number
    ) => {
      c.save();
      c.translate(cx, cy);
      c.rotate(angle);

      // Primary cardinal cross
      c.beginPath();
      c.moveTo(0, -size * 2.2);
      c.quadraticCurveTo(0, 0, size * 2.2, 0);
      c.quadraticCurveTo(0, 0, 0, size * 2.2);
      c.quadraticCurveTo(0, 0, -size * 2.2, 0);
      c.quadraticCurveTo(0, 0, 0, -size * 2.2);
      c.closePath();
      c.fill();

      // Secondary diagonal rays
      c.rotate(Math.PI / 4);
      c.beginPath();
      const diagSize = size * 1.15;
      c.moveTo(0, -diagSize);
      c.quadraticCurveTo(0, 0, diagSize, 0);
      c.quadraticCurveTo(0, 0, 0, diagSize);
      c.quadraticCurveTo(0, 0, -diagSize, 0);
      c.quadraticCurveTo(0, 0, 0, -diagSize);
      c.closePath();
      c.fill();

      // Core center diamond sparkle
      c.beginPath();
      c.arc(0, 0, size * 0.35, 0, Math.PI * 2);
      c.fill();

      c.restore();
    };

    // Helper: Draw Supernova Giant Beacon with extended lens flaring
    const drawBeacon = (
      c: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      size: number,
      angle: number,
      col: { r: number; g: number; b: number },
      alpha: number
    ) => {
      c.save();
      c.translate(cx, cy);
      c.rotate(angle);

      // Diffraction spike
      c.beginPath();
      c.moveTo(0, -size * 2.4);
      c.quadraticCurveTo(0, 0, size * 2.4, 0);
      c.quadraticCurveTo(0, 0, 0, size * 2.4);
      c.quadraticCurveTo(0, 0, -size * 2.4, 0);
      c.quadraticCurveTo(0, 0, 0, -size * 2.4);
      c.closePath();
      c.fill();

      // Outer delicate orbital ring
      c.beginPath();
      c.lineWidth = 1.2;
      c.strokeStyle = `rgba(${col.r}, ${col.g}, ${col.b}, ${alpha * 0.75})`;
      c.arc(0, 0, size * 1.15, 0, Math.PI * 2);
      c.stroke();

      // Intense white core hot-spot
      c.beginPath();
      c.fillStyle = `rgba(255, 255, 255, ${Math.min(1.0, alpha * 1.3)})`;
      c.arc(0, 0, size * 0.35, 0, Math.PI * 2);
      c.fill();

      c.restore();
    };

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min(32, time - lastTime);
      lastTime = time;

      // Smooth mouse coordinate tracking
      if (targetMouseX > 0 && targetMouseY > 0) {
        if (smoothMouseX < 0) {
          smoothMouseX = targetMouseX;
          smoothMouseY = targetMouseY;
          lastMouseX = targetMouseX;
          lastMouseY = targetMouseY;
        } else {
          const dxMouse = targetMouseX - smoothMouseX;
          const dyMouse = targetMouseY - smoothMouseY;
          smoothMouseX += dxMouse * 0.28;
          smoothMouseY += dyMouse * 0.28;

          // Compute cursor speed for energetic particle ripples
          const instDist = Math.hypot(targetMouseX - lastMouseX, targetMouseY - lastMouseY);
          mouseSpeed = mouseSpeed * 0.82 + instDist * 0.18;
          lastMouseX = targetMouseX;
          lastMouseY = targetMouseY;
        }
      } else {
        smoothMouseX = -9999;
        smoothMouseY = -9999;
        mouseSpeed *= 0.85;
      }

      // Check if mouse active
      const isMouseActive = smoothMouseX > 0 && smoothMouseY > 0 && time - lastMouseMoveTime < 3500;

      // Scroll kinetic friction damping
      scrollVelocity *= 0.92;
      if (Math.abs(scrollVelocity) < 0.05) scrollVelocity = 0;

      // Clear Canvas
      ctx.clearRect(0, 0, width, height);

      const darkActive = isDarkRef.current;
      const palette = darkActive ? DARK_SPACE_PALETTE : LIGHT_SPACE_PALETTE;

      // Reduced motion fallback flag
      const speedScale = prefersReducedMotion ? 0.25 : 1.0;

      // ==========================================
      // 1. RENDER EXPANDING COSMIC RIPPLES
      // ==========================================
      for (let rIdx = ripples.length - 1; rIdx >= 0; rIdx--) {
        const ripple = ripples[rIdx];
        ripple.radius += (ripple.maxRadius - ripple.radius) * 0.12 * (dt / 16);
        ripple.alpha *= 0.91;

        if (ripple.alpha > 0.02) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${ripple.color.r}, ${ripple.color.g}, ${ripple.color.b}, ${ripple.alpha * (darkActive ? 0.65 : 0.45)})`;
          ctx.lineWidth = 1.4;
          ctx.stroke();
          ctx.restore();
        } else {
          ripples.splice(rIdx, 1);
        }
      }

      // ==========================================
      // 2. RENDER BURST SPARK DEBRIS PARTICLES
      // ==========================================
      for (let dIdx = debrisList.length - 1; dIdx >= 0; dIdx--) {
        const debris = debrisList[dIdx];
        debris.x += debris.vx * (dt / 16);
        debris.y += debris.vy * (dt / 16);
        debris.vx *= 0.94;
        debris.vy *= 0.94;
        debris.alpha -= debris.decay * (dt / 16);
        debris.rotation += debris.rotSpeed * (dt / 16);

        if (debris.alpha > 0.02) {
          const col = debris.color;
          const debrisAlpha = Math.max(0, debris.alpha);
          ctx.fillStyle = `rgba(${col.r}, ${col.g}, ${col.b}, ${debrisAlpha})`;

          if (debris.type === "spark") {
            ctx.save();
            ctx.translate(debris.x, debris.y);
            ctx.rotate(debris.rotation);
            ctx.beginPath();
            ctx.moveTo(0, -debris.radius * 1.5);
            ctx.lineTo(debris.radius * 0.8, 0);
            ctx.lineTo(0, debris.radius * 1.5);
            ctx.lineTo(-debris.radius * 0.8, 0);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          } else {
            ctx.beginPath();
            ctx.arc(debris.x, debris.y, debris.radius, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          debrisList.splice(dIdx, 1);
        }
      }

      // ==========================================
      // 3. UPDATE & RENDER MAIN STARFIELD PARTICLES
      // ==========================================
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // 3A. Natural Falling & Kinetic Drift
        const scrollBoost = scrollVelocity * 0.15 * p.z;
        const normalVy = (p.originBaseVy + scrollBoost) * speedScale;

        // Smooth restitution velocity (smoothly return to baseline after interaction)
        p.vx += (p.originBaseVx - p.vx) * 0.045;
        p.vy += (normalVy - p.vy) * 0.045;

        // Apply velocities
        p.x += p.vx * (dt / 16);
        p.y += p.vy * (dt / 16);

        // Sinusoidal lateral floating flutter
        if (!prefersReducedMotion) {
          p.x += Math.sin(time * p.flutterFreq + p.phase) * (p.flutterAmp * (dt / 16));
        }

        // 3B. Dynamic Physics-Based Mouse Interaction
        if (isMouseActive && !prefersReducedMotion) {
          const dx = p.x - smoothMouseX;
          const dy = p.y - smoothMouseY;
          const distSq = dx * dx + dy * dy;

          // Responsive interaction radius based on particle type & depth
          const baseRadiusThreshold =
            p.sizeCategory === "giant"
              ? 135
              : p.sizeCategory === "large"
              ? 110
              : p.sizeCategory === "medium"
              ? 90
              : 70;
          const maxInteractDist = baseRadiusThreshold * (p.z * 0.9);
          const maxInteractDistSq = maxInteractDist * maxInteractDist;

          if (distSq < maxInteractDistSq && distSq > 4) {
            const dist = Math.sqrt(distSq);
            const normX = dx / dist;
            const normY = dy / dist;

            // Normalized proximity (1 at cursor center, 0 at outer edge)
            const proximity = 1 - dist / maxInteractDist;

            // 1. ORGANIC INVISIBLE FORCE REPULSION
            const repelStrength = (Math.pow(proximity, 1.5) * 3.6 + mouseSpeed * 0.035) * p.z;
            p.vx += normX * repelStrength * 0.4;
            p.vy += normY * repelStrength * 0.4;

            // 2. GRAVITATIONAL ORBITAL DEFLECTION (slight gentle bending around cursor)
            p.orbitAngle += (p.id % 2 === 0 ? 0.04 : -0.04) * proximity;
            const tangentX = -normY;
            const tangentY = normX;
            const orbitInfluence = proximity * 1.1 * (p.id % 2 === 0 ? 1 : -1) * p.z;
            p.vx += tangentX * orbitInfluence * 0.22;
            p.vy += tangentY * orbitInfluence * 0.22;

            // 3. PROXIMITY BURST ON VERY CLOSE CONTACT
            const burstDistanceThreshold =
              (p.sizeCategory === "giant" ? 32 : p.sizeCategory === "large" ? 22 : 16) * (p.z * 0.85);
            if (dist < burstDistanceThreshold) {
              triggerStarBurst(p, time);
            }
          }
        }

        // 3C. Star Rotation & Recovery
        p.rotation += p.rotSpeed * speedScale * (dt / 16);

        if (p.isBursting) {
          p.burstProgress += 0.035 * (dt / 16);
          if (p.burstProgress >= 1) {
            p.isBursting = false;
            p.burstProgress = 0;
          }
        }

        // 3D. Continuous Screen Boundary Wrapping
        const margin = 40;
        if (p.y > height + margin) {
          p.y = -margin;
          p.x = Math.random() * width;
        } else if (p.y < -margin) {
          p.y = height + margin;
          p.x = Math.random() * width;
        }

        if (p.x > width + margin) {
          p.x = -margin;
        } else if (p.x < -margin) {
          p.x = width + margin;
        }

        // 3E. Twinkling & Opacity Calculations
        const twinkle =
          Math.sin(time * p.twinkleFreq + p.phase) *
          (p.sizeCategory === "giant" ? 0.18 : 0.13);
        let currentAlpha = Math.max(0.15, Math.min(0.98, p.baseAlpha + twinkle));

        // When bursting, subtle pulse flash then recover
        if (p.isBursting) {
          currentAlpha = Math.min(1.0, currentAlpha * (1.3 - p.burstProgress * 0.3));
        }

        const col = palette[p.colorIndex % palette.length];
        const rgbaStr = `rgba(${col.r}, ${col.g}, ${col.b}, ${currentAlpha})`;

        ctx.fillStyle = rgbaStr;
        ctx.strokeStyle = rgbaStr;

        // 3F. Velocity Motion Trails during rapid scrolling or burst
        const currentSpeedSq = p.vx * p.vx + p.vy * p.vy;
        if (currentSpeedSq > 5.5) {
          const trailLength = Math.min(22, Math.sqrt(currentSpeedSq) * p.z * 1.5);
          const angle = Math.atan2(p.vy, p.vx);
          ctx.save();
          ctx.beginPath();
          ctx.lineWidth = Math.max(0.7, p.radius * 0.45);
          ctx.lineCap = "round";
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - Math.cos(angle) * trailLength, p.y - Math.sin(angle) * trailLength);
          ctx.strokeStyle = `rgba(${col.r}, ${col.g}, ${col.b}, ${currentAlpha * 0.4})`;
          ctx.stroke();
          ctx.restore();
        }

        // 3G. Cosmic Soft Glow Atmosphere for large stars
        if (darkActive && p.z > 0.75) {
          const glowMultiplier = p.sizeCategory === "giant" ? 3.4 : p.sizeCategory === "large" ? 2.6 : 2.0;
          const glowAlpha =
            currentAlpha *
            (p.sizeCategory === "giant" ? 0.32 : p.sizeCategory === "large" ? 0.22 : 0.14);
          const glowRadius = p.radius * glowMultiplier;

          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
          grad.addColorStop(0, `rgba(${col.r}, ${col.g}, ${col.b}, ${glowAlpha})`);
          grad.addColorStop(1, `rgba(${col.r}, ${col.g}, ${col.b}, 0)`);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = rgbaStr;
        }

        // 3H. Draw Particle Geometry based on Type
        if (p.type === "beacon") {
          drawBeacon(ctx, p.x, p.y, p.radius, p.rotation, col, currentAlpha);
        } else if (p.type === "star_8p") {
          drawStar8P(ctx, p.x, p.y, p.radius * 1.2, p.rotation);
        } else if (p.type === "star_4p") {
          drawStar4P(ctx, p.x, p.y, p.radius * 1.15, p.rotation);
        } else if (p.type === "spark") {
          // Sharp diamond spark
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.beginPath();
          ctx.moveTo(0, -p.radius * 1.4);
          ctx.lineTo(p.radius * 0.8, 0);
          ctx.lineTo(0, p.radius * 1.4);
          ctx.lineTo(-p.radius * 0.8, 0);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        } else if (p.type === "ring") {
          // Concentric celestial ring mote
          ctx.beginPath();
          ctx.lineWidth = darkActive ? 1.4 : 1.6;
          ctx.arc(p.x, p.y, p.radius * 1.1, 0, Math.PI * 2);
          ctx.stroke();

          // Small interior dot
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 0.3, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Standard luminous sphere
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
      document.removeEventListener("mouseleave", handleMouseLeave);
      mediaQuery.removeEventListener?.("change", onMotionChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="ambient-particle-canvas"
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-700"
      style={{ opacity: 0.95 }}
    />
  );
};
