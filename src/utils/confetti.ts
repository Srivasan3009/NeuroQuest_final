export function triggerCelebrationConfetti() {
  const canvas = document.createElement("canvas");
  canvas.id = "neuroquest-confetti-canvas";
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "9999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    document.body.removeChild(canvas);
    return;
  }

  const dpr = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  const colors = ["#06b6d4", "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899"];
  const particles: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    rotation: number;
    vRotation: number;
    alpha: number;
  }[] = [];

  const count = 90;
  for (let i = 0; i < count; i++) {
    particles.push({
      x: width * 0.5 + (Math.random() - 0.5) * 200,
      y: height * 0.45,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.85) * 16,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRotation: (Math.random() - 0.5) * 10,
      alpha: 1,
    });
  }

  let animationFrameId: number;
  const gravity = 0.4;
  const drag = 0.98;

  function render() {
    ctx?.clearRect(0, 0, width, height);

    let activeParticles = 0;
    for (const p of particles) {
      p.vy += gravity;
      p.vx *= drag;
      p.vy *= drag;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.vRotation;
      p.alpha -= 0.012;

      if (p.alpha > 0) {
        activeParticles++;
        ctx?.save();
        ctx?.translate(p.x, p.y);
        ctx?.rotate((p.rotation * Math.PI) / 180);
        ctx!.globalAlpha = Math.max(0, p.alpha);
        ctx!.fillStyle = p.color;
        ctx?.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx?.restore();
      }
    }

    if (activeParticles > 0) {
      animationFrameId = requestAnimationFrame(render);
    } else {
      cancelAnimationFrame(animationFrameId);
      if (document.body.contains(canvas)) {
        document.body.removeChild(canvas);
      }
    }
  }

  render();
}
