// particles.js — global gold dust particle system (S-01)
// 32 particles desktop, 18 mobile. Returns cleanup function.

export function initParticles(canvas) {
  if (!canvas) return () => {};
  const ctx = canvas.getContext('2d');
  const isMobile = window.innerWidth < 768;
  const COUNT = isMobile ? 18 : 32;

  const resize = () => {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener('resize', resize);

  const particles = Array.from({ length: COUNT }, () => ({
    x:       Math.random() * canvas.width,
    y:       Math.random() * canvas.height,
    size:    Math.random() * 1.3 + 0.3,
    speed:   Math.random() * 0.28 + 0.08,
    drift:   (Math.random() - 0.5) * 0.18,
    opacity: Math.random() * 0.28 + 0.06,
  }));

  let animId;
  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(pt => {
      pt.y     -= pt.speed;
      pt.x     += pt.drift;
      if (pt.y < -4) { pt.y = canvas.height + 4; pt.x = Math.random() * canvas.width; }
      if (pt.x < -4 || pt.x > canvas.width + 4) { pt.x = Math.random() * canvas.width; }
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(197,165,114,${pt.opacity})`;
      ctx.fill();
    });
    animId = requestAnimationFrame(draw);
  };
  draw();

  return () => {
    cancelAnimationFrame(animId);
    window.removeEventListener('resize', resize);
  };
}
