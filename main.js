/* ═══════════════════════════════════════════════════════════════════
   うちはイタチ — UCHIHA ITACHI
   Every scroll/pointer effect below checks `reduced` first and bails
   to the final readable state. Nothing here is load-bearing for
   content: with JS off you still get the full story, statically.
   ═══════════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
  let reduced = mqReduce.matches;
  mqReduce.addEventListener('change', e => { reduced = e.matches; location.reload(); });

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const root = document.documentElement;

  /* ─────────────── SCROLL CHOREOGRAPHY ─────────────── */
  const stage     = $('.stage');
  const scrollPct = $('#scrollPct');
  const scrollBar = $('#scrollBar');
  const hero      = $('#hero');
  const eyesAct   = $('#eyes');

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y   = window.scrollY;
      const max = document.body.scrollHeight - innerHeight;
      const pct = max > 0 ? clamp(y / max, 0, 1) : 0;

      scrollPct.textContent = 'SCROLL ' + String(Math.round(pct * 100)).padStart(3, '0') + '%';
      scrollBar.style.height = (pct * 100) + '%';

      if (!reduced) {
        const vh = innerHeight;

        /* eyelids open across the first screen — "scroll to open his eyes" */
        root.style.setProperty('--lid', clamp((y - vh * 0.12) / (vh * 0.62), 0, 1).toFixed(3));

        /* push in through acts I → III, then hand off to the live-track scene */
        root.style.setProperty('--zoom', (1 + clamp(y / (vh * 3.1), 0, 1) * 1.5).toFixed(3));
        root.style.setProperty('--pan',  (-y * 0.06).toFixed(1));

        /* the stage retires once the tracking eyes take the screen */
        const fade = eyesAct.getBoundingClientRect().top;
        root.style.setProperty('--stage-op', clamp(fade / (vh * 0.7), 0, 1).toFixed(3));
      }
      ticking = false;
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* iris state + bottom-right act label, driven by which act holds the screen */
  const ACTS = {
    hero:      ['写輪眼', 'SHARINGAN',  'black'],
    awakening: ['覚醒',   'AWAKENING',  'black'],
    sharingan: ['写輪眼', 'SHARINGAN',  'sharingan'],
    crow:      ['烏',     'CROW',       'sharingan'],
    eyes:      ['万華鏡', 'MANGEKYO',   'mangekyo'],
    jutsu:     ['天照',   'AMATERASU',  'mangekyo'],
    quote:     ['別れ',   'FAREWELL',   'mangekyo'],
    end:       ['終',     'THE END',    'mangekyo']
  };
  const tag = $('#actTag'), frameCount = $('#frameCount');

  const actObserver = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const a = ACTS[en.target.id];
      if (!a) return;
      tag.querySelector('b').textContent  = a[0];
      tag.querySelector('em').textContent = a[1];
      stage.dataset.iris = a[2];
      frameCount.classList.toggle('is-on', en.target.id === 'eyes' && !reduced);
      /* 天照 owns the bottom-right corner in the jutsu act */
      tag.classList.toggle('is-hidden', en.target.id === 'jutsu');
    });
    /* Fires on whichever act is crossing the middle of the viewport.
       A threshold would never fire for acts taller than the screen. */
  }, { threshold: 0, rootMargin: '-45% 0px -45% 0px' });
  $$('.act').forEach(el => actObserver.observe(el));

  /* ─────────────── REVEAL ─────────────── */
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-in'); revealObserver.unobserve(en.target); } });
  }, { threshold: .25 });
  $$('.reveal').forEach(el => revealObserver.observe(el));

  /* ─────────────── CURSOR ─────────────── */
  const cursor = $('.cursor');
  if (!reduced && matchMedia('(hover:hover)').matches) {
    let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
    addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    (function loop() {
      cx += (tx - cx) * .18; cy += (ty - cy) * .18;
      cursor.style.transform = `translate3d(${cx}px,${cy}px,0)`;
      requestAnimationFrame(loop);
    })();
    $$('a,button').forEach(el => {
      el.addEventListener('pointerenter', () => cursor.classList.add('is-hot'));
      el.addEventListener('pointerleave', () => cursor.classList.remove('is-hot'));
    });
  } else {
    cursor.style.display = 'none';
  }

  /* ─────────────── LIVE GAZE TRACK ───────────────
     Nine measured gaze columns × three rows = 27 discrete frames.
     Touch devices get a slow autonomous drift instead of a dead scene. */
  const COLS = 9, ROWS = 3, MAX_X = 64, MAX_Y = 30;
  const irises = $$('.tIris');
  let lastFrame = -1;

  function gaze(px, py) {
    const col = clamp(Math.floor(px * COLS), 0, COLS - 1);
    const row = clamp(Math.floor(py * ROWS), 0, ROWS - 1);
    const frame = row * COLS + col + 1;
    if (frame === lastFrame) return;
    lastFrame = frame;

    const gx = ((col - (COLS - 1) / 2) / ((COLS - 1) / 2)) * MAX_X;
    const gy = ((row - (ROWS - 1) / 2) / ((ROWS - 1) / 2)) * MAX_Y;
    irises.forEach(g => { g.style.transform = `translate(${gx.toFixed(1)}px,${gy.toFixed(1)}px)`; });
    frameCount.textContent = '眼力 追尾 · FRAME ' + String(frame).padStart(2, '0');
  }

  if (!reduced) {
    if (matchMedia('(hover:hover)').matches) {
      addEventListener('pointermove', e => gaze(e.clientX / innerWidth, e.clientY / innerHeight), { passive: true });
    } else {
      addEventListener('touchmove', e => {
        const t = e.touches[0];
        if (t) gaze(t.clientX / innerWidth, t.clientY / innerHeight);
      }, { passive: true });
      let t0 = 0;
      (function drift(ts) {
        if (!t0) t0 = ts;
        const p = (ts - t0) / 5200;
        gaze((Math.sin(p) + 1) / 2, (Math.sin(p * .6) + 1) / 2);
        requestAnimationFrame(drift);
      })(0);
    }
  }

  /* ─────────────── FEATHERS ─────────────── */
  const feathers = $('.feathers');
  if (feathers && !reduced) {
    for (let i = 0; i < 14; i++) {
      const f = document.createElement('i');
      f.style.left = (Math.random() * 100) + '%';
      f.style.animationDuration = (7 + Math.random() * 9) + 's';
      f.style.animationDelay = (-Math.random() * 12) + 's';
      f.style.transform = `scale(${.5 + Math.random()})`;
      feathers.appendChild(f);
    }
  }

  /* ─────────────── JUTSU CARDS ─────────────── */
  const SETS = {
    kekkei: { jp: '血継限界', ro: 'KEKKEI GENKAI', items: [
      ['天照',     'AMATERASU',   'Black flame that burns for seven days and seven nights, and will not stop until what it touches is gone. It answers to a look — and takes blood from the eye that gives it.', 'COST · THE RIGHT EYE'],
      ['月読',     'TSUKUYOMI',   'Seventy-two hours of torment folded into a single second of real time. The body is never touched. Nothing about the mind survives intact.', 'COST · THE LEFT EYE'],
      ['須佐能乎', 'SUSANOO',     'A guardian assembled out of chakra and grief. Absolute defence, and a wound that never closes while it stands.', 'COST · BOTH EYES'],
      ['別天神',   'KOTOAMATSUKAMI', 'A genjutsu with no tell. It rewrites what a person believes they chose, and they walk away certain the choice was theirs.', 'COST · TEN YEARS']
    ]},
    infil: { jp: '戦・潜入', ro: 'INFILTRATION', items: [
      ['影分身の術', 'KAGE BUNSHIN',  'Solid copies, chakra split evenly between them. Everything they learn returns to the original the moment they disperse.', 'RANK · B'],
      ['烏分身の術', 'KARASU BUNSHIN','A body that scatters into crows when struck. The strike lands on nothing, and the crows are already behind you.', 'RANK · B'],
      ['変化の術',   'HENGE',         'A perfect surface — face, voice, chakra signature. Held for as long as the mind holds steady.', 'RANK · E'],
      ['幻術・鴉',   'GENJUTSU: KARASU','One crow becomes a thousand, and the sky closes. By the time you count them the fight is already decided.', 'RANK · A']
    ]},
    four: { jp: '四つの術', ro: 'FOUR ARTS', items: [
      ['豪火球の術',    'GOKAKYU',      'The Uchiha rite of passage. A sphere of fire wide enough to swallow a river, exhaled in one breath.', 'ELEMENT · 火'],
      ['鳳仙火の術',    'HOSENKA',      'Small flames thrown in a scatter, each one wrapped around a hidden shuriken.', 'ELEMENT · 火'],
      ['手裏剣影分身',  'SHURIKEN KAGE BUNSHIN', 'One blade becomes a hundred in the air. Every copy cuts.', 'ELEMENT · 風'],
      ['大炎弾',        'DAIENDAN',     'A wall of fire laid across the ground to cut a battlefield in half.', 'ELEMENT · 火']
    ]}
  };

  const cards = $('#cards'), cardsGrid = $('#cardsGrid'),
        cardsJp = $('#cardsJp'), cardsRo = $('#cardsRo'), cardsClose = $('#cardsClose');
  let lastFocused = null;

  function openCards(key, btn) {
    const set = SETS[key];
    if (!set) return;
    lastFocused = btn;
    cardsJp.textContent = set.jp;
    cardsRo.textContent = set.ro;
    cardsGrid.innerHTML = set.items.map(([jp, ro, txt, foot], i) => `
      <article class="card">
        <p class="card__num">${String(i + 1).padStart(2, '0')} / ${String(set.items.length).padStart(2, '0')}</p>
        <h3 class="card__jp">${jp}</h3>
        <p class="card__ro">${ro}</p>
        <p class="card__txt">${txt}</p>
        <p class="card__foot">${foot}</p>
      </article>`).join('');
    cards.hidden = false;
    document.body.style.overflow = 'hidden';
    $$('.cat').forEach(c => c.classList.toggle('is-open', c.dataset.set === key));
    cardsClose.focus();
  }

  function closeCards() {
    cards.hidden = true;
    document.body.style.overflow = '';
    $$('.cat').forEach(c => c.classList.remove('is-open'));
    if (lastFocused) lastFocused.focus();
  }

  $$('.cat').forEach(btn => btn.addEventListener('click', () => openCards(btn.dataset.set, btn)));
  cardsClose.addEventListener('click', closeCards);
  cards.addEventListener('click', e => { if (e.target === cards) closeCards(); });

  addEventListener('keydown', e => {
    if (cards.hidden) return;
    if (e.key === 'Escape') { closeCards(); return; }
    if (e.key === 'Tab') {                       // focus trap
      const f = $$('button,[href],[tabindex]:not([tabindex="-1"])', cards);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ─────────────── AUDIO ───────────────
     A generated low drone, so the toggle is real with no audio asset
     shipped. Swap for an <audio> element once you have a track. */
  const audioBtn = $('#audioToggle');
  let ctx = null, master = null;

  function buildDrone() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 340;
    [55, 82.5, 110].forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = i === 2 ? 'triangle' : 'sine';
      o.frequency.value = f;
      o.detune.value = (i - 1) * 7;
      g.gain.value = [.5, .3, .16][i];
      o.connect(g).connect(lp);
      o.start();
    });
    const lfo = ctx.createOscillator(), lfoGain = ctx.createGain();
    lfo.frequency.value = .07; lfoGain.gain.value = 90;
    lfo.connect(lfoGain).connect(lp.frequency);
    lfo.start();
    lp.connect(master).connect(ctx.destination);
  }

  audioBtn.addEventListener('click', () => {
    const on = audioBtn.getAttribute('aria-pressed') === 'true';
    if (!ctx) buildDrone();
    if (ctx.state === 'suspended') ctx.resume();
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.linearRampToValueAtTime(on ? 0 : .05, ctx.currentTime + 1.2);
    audioBtn.setAttribute('aria-pressed', String(!on));
    audioBtn.querySelector('span').textContent = on ? 'OFF' : 'ON';
  });
})();
