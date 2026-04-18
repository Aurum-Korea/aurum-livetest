// lib/magnetic.js — attaches cursor-tracking --mx/--my CSS vars to .magnetic-card elements
// C-01: initScrollEntrance — fires .card-entered on scroll entry (activates card-enter-sweep CSS)
export function initMagneticCards() {
  const cards = document.querySelectorAll('.magnetic-card');
  const handlers = [];

  cards.forEach(card => {
    const onMove = e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1) + '%';
      const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1) + '%';
      card.style.setProperty('--mx', x);
      card.style.setProperty('--my', y);
    };
    card.addEventListener('mousemove', onMove);
    handlers.push({ card, onMove });
  });

  return () => {
    handlers.forEach(({ card, onMove }) => card.removeEventListener('mousemove', onMove));
  };
}

export function initScrollEntrance(selector = '.magnetic-card, .feature-card') {
  const els = document.querySelectorAll(selector);
  if (!els.length) return () => {};
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && !e.target.classList.contains('card-entered')) {
        e.target.classList.add('card-entered');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(el => obs.observe(el));
  return () => obs.disconnect();
}
