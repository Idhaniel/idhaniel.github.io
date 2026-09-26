// Page-wide motion. Everything here is opt-in through data attributes:
//   data-split          heading: words rise into place when it enters view
//   data-reveal         block: fades and lifts in; data-reveal="zoom" scales up instead
//   data-count="77"     number counts up from 0 on enter (data-suffix for trailing text)
//   data-hero           hero content drifts back and fades as you scroll past it
//   data-parallax="0.3" moves at a fraction of scroll speed
// With reduced motion, everything is shown in its final state.

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = document.documentElement;

function split(el: HTMLElement) {
  const words = (el.textContent ?? '').trim().split(/\s+/);
  el.setAttribute('aria-label', words.join(' '));
  el.innerHTML = words
    .map((w, i) => `<span class="sw" aria-hidden="true"><span style="--i:${i}">${w}</span></span>`)
    .join(' ');
}

function countUp(el: HTMLElement) {
  const to = Number(el.dataset.count);
  const suffix = el.dataset.suffix ?? '';
  const start = performance.now();
  const dur = 1200;
  const tick = (t: number) => {
    const k = Math.min(1, (t - start) / dur);
    const eased = 1 - Math.pow(1 - k, 3);
    el.textContent = Math.round(to * eased) + suffix;
    if (k < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

document.querySelectorAll<HTMLElement>('[data-split]').forEach(split);

if (reduce) {
  root.classList.add('rm');
} else {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const el = e.target as HTMLElement;
        el.classList.add('is-in');
        if (el.dataset.count) countUp(el);
        io.unobserve(el);
      }
    },
    { rootMargin: '0px 0px -12% 0px' }
  );
  document.querySelectorAll('[data-split], [data-reveal], [data-count]').forEach((el) => io.observe(el));

  const hero = document.querySelector<HTMLElement>('[data-hero]');
  const parallax = [...document.querySelectorAll<HTMLElement>('[data-parallax]')];
  let queued = false;
  const onScroll = () => {
    queued = false;
    const y = scrollY;
    if (hero) {
      const p = Math.min(1, y / innerHeight);
      hero.style.transform = `translate3d(0, ${p * -60}px, 0) scale(${1 - p * 0.08})`;
      hero.style.opacity = String(1 - p * 0.85);
    }
    for (const el of parallax) {
      const f = Number(el.dataset.parallax);
      const r = el.parentElement!.getBoundingClientRect();
      el.style.transform = `translate3d(0, ${(-r.top * f).toFixed(1)}px, 0)`;
    }
  };
  addEventListener('scroll', () => {
    if (!queued) { queued = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();
}
