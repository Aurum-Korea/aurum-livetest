// lib/magnetic.js — attaches cursor-tracking --mx/--my CSS vars to .magnetic-card elements
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
