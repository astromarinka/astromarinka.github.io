(() => {
  'use strict';

  const target = document.getElementById('oracle-app');
  if (!target) return;

  document.addEventListener('click', event => {
    const link = event.target.closest('a.oracle-cta[href="#oracle-app"]');
    if (!link) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      target.scrollIntoView({block: 'start'});
      return;
    }

    const start = window.scrollY;
    const end = target.getBoundingClientRect().top + start - 20;
    const distance = end - start;
    const duration = Math.min(2200, Math.max(1100, Math.abs(distance) * 0.48));
    const startedAt = performance.now();
    const ease = progress => progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;

    const frame = now => {
      const progress = Math.min(1, (now - startedAt) / duration);
      window.scrollTo(0, start + distance * ease(progress));
      if (progress < 1) window.requestAnimationFrame(frame);
      else history.replaceState(null, '', '#oracle-app');
    };

    window.requestAnimationFrame(frame);
  }, true);
})();
