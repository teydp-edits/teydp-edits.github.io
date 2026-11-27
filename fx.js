/* teyfilms motion layer: GSAP + ScrollTrigger + SplitText, with three.js, matter.js and Lottie loaded only when needed.
   Every effect is skipped under prefers-reduced-motion; without GSAP the site falls back to the old reveal and parallax. */
(() => {
  const root = document.documentElement;
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const load = (src) => new Promise((ok, no) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); });
  const idle = (fn) => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 2500 }) : setTimeout(fn, 1200));

  /* ---------- fallback (no GSAP): the previous IntersectionObserver reveal and parallax ---------- */
  if (!window.gsap || !window.ScrollTrigger) {
    if (!RM && 'IntersectionObserver' in window) {
      root.classList.add('rv');
      const io = new IntersectionObserver((es) => { for (const e of es) if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } }, { rootMargin: '0px 0px -12% 0px' });
      document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
    }
    return;
  }

  gsap.registerPlugin(ScrollTrigger, SplitText);
  root.classList.add('gs');
  const mm = gsap.matchMedia();

  /* nav: the small name only appears once the big hero title has scrolled away */
  ScrollTrigger.create({ trigger: '.hero h1', start: 'bottom top+=68', onEnter: () => document.querySelector('nav').classList.add('named'), onLeaveBack: () => document.querySelector('nav').classList.remove('named') });

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    /* hero: letters rise out of their own masks, then the rest of the intro */
    const h1 = document.querySelector('.hero h1');
    const intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
    SplitText.create(h1, {
      type: 'chars', mask: 'chars', autoSplit: true, aria: 'auto',
      onSplit(self) { return gsap.from(self.chars, { yPercent: 115, duration: 1.15, stagger: 0.045, ease: 'expo.out' }); },
    });
    intro.from('.hero [data-in]', { y: 22, autoAlpha: 0, duration: 0.9, stagger: 0.09 }, 0.35)
      .fromTo('.hero .vf', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut' }, 0.1)
      .from('.hero .vf video', { scale: 1.3, duration: 1.8 }, 0.1);

    /* pictures drift against the scroll (pictures only, never text) */
    gsap.utils.toArray('[data-speed]').forEach((el) => {
      const sp = parseFloat(el.dataset.speed) || 0;
      gsap.fromTo(el, { y: 0 }, {
        y: () => sp * innerHeight * 1.2, ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'clamp(top bottom)', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
      });
    });

    /* section titles: lines rise out of masks once */
    document.querySelectorAll('.head h2, .sub, .contact h2').forEach((h) => {
      SplitText.create(h, {
        type: 'lines', mask: 'lines', autoSplit: true,
        onSplit(self) {
          return gsap.from(self.lines, { yPercent: 105, duration: 1, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: h, start: 'top 88%', once: true } });
        },
      });
    });

    /* tiles: wipe open in batches as they arrive */
    gsap.set('.tiles .tile .im', { clipPath: 'inset(100% 0% 0% 0%)' });
    ScrollTrigger.batch('.tiles .tile .im', {
      start: 'top 92%', once: true,
      onEnter: (b) => gsap.to(b, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'expo.inOut', stagger: 0.07, overwrite: true }),
    });

    /* film rows: the still opens and settles with the scroll; the text trails a little */
    gsap.utils.toArray('.row').forEach((row) => {
      const im = row.querySelector('.im'), img = row.querySelector('img'), txt = row.querySelector('.txt');
      const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 92%', end: 'top 35%', scrub: 0.6 } });
      tl.fromTo(im, { clipPath: 'inset(18% 10% 18% 10%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none' }, 0)
        .fromTo(img, { scale: 1.25 }, { scale: 1, ease: 'none' }, 0)
        .fromTo(txt, { y: 60 }, { y: 0, ease: 'none' }, 0);
    });

    /* about photo */
    gsap.fromTo('.photo', { clipPath: 'inset(0% 0% 100% 0%)' }, {
      clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut',
      scrollTrigger: { trigger: '.photo', start: 'top 85%', once: true },
    });

    /* logos: each one comes up in turn */
    gsap.from('.logos li', { yPercent: 60, autoAlpha: 0, duration: 0.8, ease: 'expo.out', stagger: 0.06, scrollTrigger: { trigger: '.logos', start: 'top 92%', once: true } });

    /* services: rules draw across */
    gsap.utils.toArray('.svc > div').forEach((d, i) => {
      gsap.from(d, { '--rule': 0, duration: 1.1, ease: 'expo.inOut', delay: (i % 2) * 0.08, scrollTrigger: { trigger: d, start: 'top 92%', once: true } });
    });

    /* tools: physics, loaded only when the list is close */
    ScrollTrigger.create({ trigger: '.tools', start: 'top 120%', once: true, onEnter: () => load('vendor/matter.min.js').then(tools).catch(() => {}) });

    /* thumbnails: three.js ripple and colour split, desktop mouse only, loaded on the first hover */
    if (FINE) {
      let started = false;
      const first = (e) => {
        const im = e.target.closest && e.target.closest('.tile .im');
        if (!im || started || e.pointerType !== 'mouse') return;
        started = true;
        document.removeEventListener('pointerover', first);
        import('./vendor/hover.js').then((m) => { const h = m.init(gsap); if (h && im.matches(':hover')) h.enter(im, e); }).catch(() => {});
      };
      document.addEventListener('pointerover', first);
    }
  });

  /* Lottie icons: loaded when the page is idle; the static SVGs stay until then */
  idle(() => Promise.all([load('vendor/lottie_light.min.js'), load('vendor/lottie-data.js')]).then(icons).catch(() => {}));

  function icons() {
    if (!window.lottie || !window.TF_LOTTIE) return;
    /* theme toggle: sun (dark mode) <-> moon (light mode) */
    const mb = document.getElementById('mode');
    const box = document.createElement('span'); box.className = 'lot'; box.setAttribute('aria-hidden', 'true'); mb.appendChild(box);
    const a = lottie.loadAnimation({ container: box, renderer: 'svg', loop: false, autoplay: false, animationData: structuredClone(TF_LOTTIE.mode) });
    a.addEventListener('DOMLoaded', () => {
      mb.classList.add('lt');
      a.goToAndStop(root.dataset.mode === 'light' ? 29 : 0, true);
      new MutationObserver(() => {
        const toMoon = root.dataset.mode === 'light';
        if (RM) { a.goToAndStop(toMoon ? 29 : 0, true); return; }
        a.setDirection(toMoon ? 1 : -1); a.play();
      }).observe(root, { attributes: true, attributeFilter: ['data-mode'] });
    });
    /* play icons on the main buttons */
    document.querySelectorAll('.pl').forEach((el) => {
      const p = lottie.loadAnimation({ container: el, renderer: 'svg', loop: false, autoplay: false, animationData: structuredClone(TF_LOTTIE.play) });
      p.addEventListener('DOMLoaded', () => {
        el.classList.add('lt');
        const btn = el.closest('button, a');
        const go = (d) => { if (RM) return; p.setDirection(d); p.play(); };
        btn.addEventListener('pointerenter', () => go(1));
        btn.addEventListener('pointerleave', () => go(-1));
        btn.addEventListener('focus', () => go(1));
        btn.addEventListener('blur', () => go(-1));
      });
    });
  }

  /* ---------- matter.js: click any tool and they all fall; then they can be thrown around ---------- */
  function tools() {
    const M = window.Matter; if (!M) return;
    const ul = document.querySelector('.tools ul'), lis = [...ul.children];
    const { Engine, Bodies, Body, Composite, Constraint } = M;
    let engine, items = [], walls = [], raf = 0, W = 0, H = 0, drag = null, sleeping = false;
    let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

    function build(clicked) {
      cancelAnimationFrame(raf);
      /* measure where each tool sits in the list, then turn them into chips at the same spots */
      const r0 = ul.getBoundingClientRect();
      const starts = lis.map((li) => { const r = li.getBoundingClientRect(); return { x: r.left - r0.left + 14, y: r.top - r0.top }; });
      ul.style.height = Math.max(ul.offsetHeight, 230) + 'px';
      ul.classList.add('phys');
      W = ul.clientWidth; H = ul.clientHeight;
      engine = Engine.create({ enableSleeping: true });
      engine.gravity.y = 1.1;
      const t = 200;
      walls = [Bodies.rectangle(W / 2, H + t / 2, W + t * 2, t, { isStatic: true }),
               Bodies.rectangle(-t / 2, H / 2 - 400, t, H * 2 + 800, { isStatic: true }),
               Bodies.rectangle(W + t / 2, H / 2 - 400, t, H * 2 + 800, { isStatic: true })];
      seed = 7;
      items = lis.map((li, i) => {
        const w = li.offsetWidth, h = li.offsetHeight, s = starts[i];
        const x = Math.min(W - w / 2 - 2, Math.max(w / 2 + 2, s.x + w / 2));
        const b = Bodies.rectangle(x, s.y + h / 2, w, h, { chamfer: { radius: h / 2 }, restitution: 0.4, friction: 0.35, frictionAir: 0.01, density: 0.002 });
        /* a small shove so they tumble instead of dropping straight down; the clicked one gets the biggest */
        const kick = li === clicked ? 12 : 6;
        Body.setVelocity(b, { x: (rnd() - 0.5) * kick, y: -rnd() * kick });
        Body.setAngularVelocity(b, (rnd() - 0.5) * 0.25);
        return { li, b, w, h };
      });
      Composite.add(engine.world, [...walls, ...items.map((o) => o.b)]);
      step();
    }
    function step() {
      Engine.update(engine, 1000 / 60);
      for (const o of items) {
        const { x, y } = o.b.position;
        o.li.style.transform = `translate(${(x - o.w / 2).toFixed(1)}px,${(y - o.h / 2).toFixed(1)}px) rotate(${o.b.angle.toFixed(3)}rad)`;
      }
      sleeping = !drag && items.every((o) => o.b.isSleeping);
      raf = sleeping ? 0 : requestAnimationFrame(step);
    }
    function run() { if (!raf) raf = requestAnimationFrame(step); }

    let live = false;
    ul.classList.add('armed');
    ul.addEventListener('pointerdown', (e) => {
      const li = e.target.closest('li'); if (!li) return;
      if (!live) { live = true; ul.classList.remove('armed'); build(li); return; }
      const o = items.find((it) => it.li === li); if (!o) return;
      e.preventDefault(); li.setPointerCapture(e.pointerId);
      const r = ul.getBoundingClientRect(), p = { x: e.clientX - r.left, y: e.clientY - r.top };
      const local = M.Vector.rotate(M.Vector.sub(p, o.b.position), -o.b.angle);
      M.Sleeping.set(o.b, false);
      drag = Constraint.create({ pointA: p, bodyB: o.b, pointB: local, stiffness: 0.18, damping: 0.1, length: 0 });
      Composite.add(engine.world, drag); li.classList.add('grab'); run();
    });
    ul.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const r = ul.getBoundingClientRect();
      drag.pointA = { x: Math.max(0, Math.min(W, e.clientX - r.left)), y: Math.max(-40, Math.min(H, e.clientY - r.top)) };
    });
    const up = () => { if (!drag) return; Composite.remove(engine.world, drag); drag.bodyB && drag.bodyB && ul.querySelector('.grab')?.classList.remove('grab'); drag = null; run(); };
    ul.addEventListener('pointerup', up); ul.addEventListener('pointercancel', up);

    let lw = innerWidth;
    addEventListener('resize', () => {
      if (!live || Math.abs(innerWidth - lw) <= 40) return;
      lw = innerWidth; cancelAnimationFrame(raf); raf = 0; Composite.clear(engine.world);
      ul.classList.remove('phys'); ul.style.height = ''; lis.forEach((li) => (li.style.transform = '')); build(null);
    });
  }
})();
