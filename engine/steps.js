// Step-by-step unslop player for one component, built for frame-exact capture.
// Step morph technique adapted from the unslop dashboard (step classes on <html>, CSS tweens in place),
// itself adapted from unslop by Damir Sokolovsky (@heydamir), CC BY 4.0.
//
// Page contract:
//   <html> gets class s1, s2 … as each step lands. Write step CSS as  .s2 .thing { … }.
//   .swap > .from / .to     text that changes: the old line blurs out, the new one in
//   [data-out="k"]          collapses away on step k     [data-in="k"]  grows in on step k
//   Steps.init({ title, steps: [{ label, target, hit? }] })
// Capture: Steps.manual(); then for each frame Steps.tick(ms). Steps.total is the length in ms, Steps.count the step count.
// Reserved class names (the engine styles them globally): live, done, s1…s12 (all on <html>), and swap / from / to.
// Timing: intro 1100ms, then 3700ms per step (move 750, look 750, morph 1050, hold 900, gap 250), outro 2200ms.
// The guide template's INTRO/STEP constants depend on these numbers. Change them together.
(() => {
  const $$ = (s) => [...document.querySelectorAll(s)];
  const ease = 'cubic-bezier(0.45, 0, 0.2, 1)';
  const spring = 'cubic-bezier(0.3, 1.1, 0.45, 1)';
  const eio = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
  const layoutProps = ['padding', 'margin', 'gap', 'width', 'height', 'max-width', 'max-height', 'top', 'left', 'right', 'bottom', 'font-size', 'line-height', 'letter-spacing', 'font-weight', 'transform', 'border-width', 'flex-basis'];
  const tintProps = ['color', 'background-color', 'border-color', 'box-shadow', 'border-radius', 'opacity', 'filter', 'outline-color', 'text-shadow'];
  const transition = [...layoutProps.map((p) => `${p} 650ms ${spring}`), ...tintProps.map((p) => `${p} 700ms ${ease}`)].join(', ');

  const css = `
    html.live .stage *, html.live .stage *::before, html.live .stage *::after { transition: ${transition}; }
    .swap { display: inline-grid; vertical-align: top; }
    .swap.b { display: grid; }
    .swap > .from, .swap > .to { grid-area: 1 / 1; }
    .swap > .to { opacity: 0; transform: translateY(10px); filter: blur(6px); }
    [data-out] { overflow: hidden; max-height: var(--h, none); }
    [data-out][data-axis="x"] { max-height: none; max-width: var(--w, none); white-space: nowrap; }
    [data-in] { overflow: hidden; opacity: 0; max-height: 0; }
    [data-in][data-axis="x"] { max-height: none; max-width: 0; white-space: nowrap; }
    #ov { position: absolute; inset: 0; pointer-events: none; z-index: 50; }
    #ov .mk { position: absolute; opacity: 0; transition: opacity 220ms ease; }
    #ov .mk.on { opacity: 1; }
    #ov .bx { position: absolute; inset: 0; border: 2px solid #F0475B; background: rgba(240,71,91,.07); border-radius: 10px; transition: border-color 300ms ease, background-color 300ms ease; }
    #ov .cn { position: absolute; width: 9px; height: 9px; background: #fff; border: 1.5px solid #F0475B; transition: border-color 300ms ease; }
    #ov .tg { position: absolute; left: -2px; bottom: calc(100% + 10px); height: 32px; padding: 0 13px; border-radius: 16px; font: 600 15px/32px 'IBM Plex Mono', ui-monospace, monospace; letter-spacing: -0.01em; white-space: nowrap; color: #fff; background: #F0475B; transition: background-color 300ms ease; display: flex; align-items: center; gap: 8px; }
    #ov .mk.below .tg { bottom: auto; top: calc(100% + 10px); }
    #ov .mk.rt .tg { left: auto; right: -2px; }
    #ov .mk.fixed .bx { border-color: #12A894; background: rgba(18,168,148,.06); }
    #ov .mk.fixed .cn { border-color: #12A894; }
    #ov .mk.fixed .tg { background: #12A894; }
    #ov .cur { position: absolute; left: 0; top: 0; width: 30px; height: 34px; opacity: 0; filter: drop-shadow(0 3px 4px rgba(0,0,0,.35)); transition: opacity 200ms ease; }
    #ov .cur.on { opacity: 1; }
    #ov .rip { position: absolute; left: 0; top: 0; width: 46px; height: 46px; margin: -23px 0 0 -23px; border-radius: 50%; border: 2.5px solid #F0475B; }
  `;
  document.head.appendChild(Object.assign(document.createElement('style'), { textContent: css }));
  // Reel mode (?reel&at=ms,ms,…&vw=1120&vh=622): no title or credit, bigger tags and cursor, plate centred,
  // and each step's click lands at the given time so the film follows a voiceover.
  const Q = new URLSearchParams(location.search);
  const REEL = Q.has('reel');
  const AT = Q.get('at') ? Q.get('at').split(',').map(Number) : null;
  if (REEL) {
    const vw = Q.get('vw') || 1120, vh = Q.get('vh') || 622, pz = Number(Q.get('pz') || 1);
    document.head.appendChild(Object.assign(document.createElement('style'), { textContent: `
      html, body { width: ${vw}px !important; height: ${vh}px !important; }
      .frame { zoom: ${pz}; width: ${vw / pz}px !important; height: ${vh / pz}px !important; }
      .cap, .frame::after { display: none !important; }
      .plate { top: 50% !important; }
      #ov .tg { font-size: 22px; height: 42px; line-height: 42px; border-radius: 21px; padding: 0 16px; bottom: calc(100% + 12px); }
      #ov .mk.below .tg { top: calc(100% + 12px); }
      #ov .bx { border-width: 3px; }
      #ov .cur { transform-origin: 6px 4px; }
    ` }));
  }
  for (let k = 1; k <= 12; k++) {
    const on = `.s${k}`;
    document.head.appendChild(Object.assign(document.createElement('style'), { textContent: `
      ${on} .swap[data-at="${k}"] > .from { opacity: 0; transform: translateY(-10px); filter: blur(6px); }
      ${on} .swap[data-at="${k}"] > .to { opacity: 1; transform: none; filter: none; }
      ${on} [data-out="${k}"]:not([data-axis]) { max-height: 0 !important; opacity: 0; margin-top: 0 !important; margin-bottom: 0 !important; padding-top: 0 !important; padding-bottom: 0 !important; border-top-width: 0 !important; border-bottom-width: 0 !important; }
      ${on} [data-out="${k}"][data-axis="x"] { max-width: 0 !important; opacity: 0; margin-left: 0 !important; margin-right: 0 !important; padding-left: 0 !important; padding-right: 0 !important; }
      ${on} [data-in="${k}"]:not([data-axis]) { opacity: 1; max-height: var(--h, none); }
      ${on} [data-in="${k}"][data-axis="x"] { opacity: 1; max-width: var(--w, none); }
    ` }));
  }

  // clock
  const clock = { manual: true, t: 0, base: 0 };
  const now = () => (clock.manual ? clock.t : performance.now() - clock.base);
  let timers = [];
  const tasks = new Set();
  const at = (t, fn) => timers.push({ t, fn });
  const task = (fn) => { if (fn(now()) !== false) tasks.add(fn); };
  const managed = new WeakMap();
  function manage(t) {
    for (const a of document.getAnimations()) {
      if (!managed.has(a)) { if (a.playState !== 'running') continue; managed.set(a, t); a.pause(); }
      const time = t - managed.get(a);
      const end = a.effect ? a.effect.getComputedTiming().endTime : Infinity;
      if (Number.isFinite(end) && time >= end) a.finish(); else a.currentTime = time;
    }
  }
  function frame(t) {
    for (;;) { timers.sort((a, b) => a.t - b.t); if (!timers.length || timers[0].t > t) break; timers.shift().fn(); }
    if (clock.manual) manage(t);
    tasks.forEach((fn) => { if (fn(t) === false) tasks.delete(fn); });
  }
  const loop = () => { if (!clock.manual) frame(performance.now() - clock.base); requestAnimationFrame(loop); };

  function measure(k) {
    $$(`[data-out="${k}"]`).forEach((el) => el.dataset.axis === 'x' ? el.style.setProperty('--w', el.offsetWidth + 'px') : el.style.setProperty('--h', el.offsetHeight + 'px'));
    $$(`[data-in="${k}"]`).forEach((el) => el.dataset.axis === 'x' ? el.style.setProperty('--w', el.scrollWidth + 'px') : el.style.setProperty('--h', el.scrollHeight + 'px'));
  }

  // overlay
  let ov, cur, C = { x: 0, y: 0, s: 1 };
  const rect = (el) => { const b = el.getBoundingClientRect(); return b; };
  const center = (sel) => { const b = rect(document.querySelector(sel)); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; };
  const CS = REEL ? 1.45 : 1;
  // ?pz zooms the whole frame (plate, marks, cursor). Rects come back in zoomed px, styles are set in unzoomed px.
  const Z = REEL ? Number(Q.get('pz') || 1) : 1;
  const drawCur = () => { cur.style.transform = `translate(${C.x - 6}px, ${C.y - 4}px) scale(${C.s * CS})`; };
  function moveTo(p, ms) {
    const sx = C.x, sy = C.y, dx = p.x - sx, dy = p.y - sy, dist = Math.hypot(dx, dy) || 1, bow = Math.min(70, dist * 0.14), t0 = now();
    task((t) => { const q = Math.min(1, (t - t0) / ms), e = eio(q), arc = Math.sin(Math.PI * e) * bow;
      C.x = sx + dx * e - (dy / dist) * arc; C.y = sy + dy * e + (dx / dist) * arc; drawCur(); if (q >= 1) return false; });
  }
  function press() {
    const t0 = now();
    task((t) => { const p = Math.min(1, (t - t0) / 220); C.s = p < 0.4 ? 1 - 0.14 * (p / 0.4) : 0.86 + 0.14 * ((p - 0.4) / 0.6); drawCur(); if (p >= 1) return false; });
    const rip = document.createElement('div'); rip.className = 'rip'; ov.appendChild(rip);
    const x = C.x, y = C.y;
    task((t) => { const p = Math.min(1, (t - t0) / 480); rip.style.transform = `translate(${x}px, ${y}px) scale(${0.35 + 1.1 * p})`; rip.style.opacity = String(0.9 * (1 - p)); if (p >= 1) { rip.remove(); return false; } });
  }
  function mark(sels, label) {
    const els = sels.flatMap((s) => $$(s));
    const corners = ['left:-5px;top:-5px', 'right:-5px;top:-5px', 'left:-5px;bottom:-5px', 'right:-5px;bottom:-5px'].map((p) => `<i class="cn" style="${p}"></i>`).join('');
    const items = els.map((el, i) => {
      const n = document.createElement('div'); n.className = 'mk';
      n.innerHTML = '<div class="bx"></div>' + corners + (i === 0 ? '<span class="tg"></span>' : '');
      ov.appendChild(n); if (n.querySelector('.tg')) n.querySelector('.tg').textContent = label;
      return { el, n };
    });
    const m = { items, alive: true };
    task(() => {
      if (!m.alive) return false;
      const host = ov.getBoundingClientRect();
      items.forEach(({ el, n }) => { const b = rect(el), pad = 8;
        Object.assign(n.style, { left: (b.left - host.left) / Z - pad + 'px', top: (b.top - host.top) / Z - pad + 'px', width: b.width / Z + pad * 2 + 'px', height: b.height / Z + pad * 2 + 'px' });
        n.classList.toggle('below', (b.top - host.top) / Z < 70);
        const tg = n.querySelector('.tg');
        if (tg) n.classList.toggle('rt', (b.left - host.left) / Z - pad + tg.offsetWidth > ov.offsetWidth - 8); });
    });
    ov.offsetHeight; items.forEach(({ n }) => n.classList.add('on'));
    return m;
  }
  const fix = (m, label) => m.items.forEach(({ n }, i) => { n.classList.add('fixed'); if (i === 0 && label) n.querySelector('.tg').textContent = '✓ ' + label; });
  const clear = (m) => { m.items.forEach(({ n }) => n.classList.remove('on')); at(now() + 260, () => { m.alive = false; m.items.forEach(({ n }) => n.remove()); }); };

  // timeline
  const T = { intro: 1100, move: 750, look: 750, morph: 1050, hold: 900, gap: 250, outro: 2200 };
  const Steps = { total: 0 };
  Steps.init = (cfg) => {
    ov = document.createElement('div'); ov.id = 'ov'; document.querySelector('.frame').appendChild(ov);
    cur = document.createElement('div'); cur.className = 'cur';
    cur.innerHTML = '<svg width="30" height="34" viewBox="0 0 26 30"><path d="M5 3 L5 24 L10.2 19 L13.6 27 L17.2 25.5 L13.8 17.6 L21 17.6 Z" fill="#fff" stroke="#141525" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    ov.appendChild(cur);
    const counter = document.querySelector('[data-counter]');
    const host = () => ov.getBoundingClientRect();
    const rel = (p) => ({ x: (p.x - host().left) / Z, y: (p.y - host().top) / Z });
    let t = T.intro;
    at(0, () => { const h = host(); C.x = h.width / Z * 0.82; C.y = h.height / Z * 0.86; drawCur(); });
    at(AT ? 0 : 350, () => cur.classList.add('on'));
    if (AT) {
      // voiceover timing: the click lands at AT[k]; everything else is fitted around it
      cfg.steps.forEach((s, i) => {
        const k = i + 1, pt = AT[i], next = AT[i + 1];
        const move = 340, look = 160, t0 = Math.max(0, pt - look - move);
        let m;
        at(t0, () => { if (counter) counter.textContent = `${k} / ${cfg.steps.length}`; moveTo(rel(center(s.hit || s.target[0])), move); });
        at(Math.max(0, t0 + move - 120), () => { m = mark(s.target, s.label); });
        at(pt, () => { press(); measure(k); });
        at(pt + 60, () => { document.documentElement.classList.add('s' + k); });
        at(pt + 60 + 640, () => fix(m, s.label));
        const clearAt = next ? Math.min(pt + 60 + 640 + 380, next - move - look - 40) : pt + 60 + 640 + 700;
        at(Math.max(pt + 300, clearAt), () => clear(m));
        t = Math.max(pt + 300, clearAt) + 200;
      });
      at(t, () => { cur.classList.remove('on'); if (counter) counter.textContent = 'Done'; document.documentElement.classList.add('done'); });
      Steps.total = Number(Q.get('end')) || t + T.outro;
      Steps.count = cfg.steps.length;
      document.documentElement.classList.add('live');
      requestAnimationFrame(loop);
      return;
    }
    cfg.steps.forEach((s, i) => {
      const k = i + 1, t0 = t;
      let m;
      at(t0, () => { if (counter) counter.textContent = `${k} / ${cfg.steps.length}`; moveTo(rel(center(s.hit || s.target[0])), T.move); });
      at(t0 + T.move - 150, () => { m = mark(s.target, s.label); });
      at(t0 + T.move + T.look, () => { press(); measure(k); });
      at(t0 + T.move + T.look + 90, () => { document.documentElement.classList.add('s' + k); });
      at(t0 + T.move + T.look + T.morph, () => fix(m, s.label));
      at(t0 + T.move + T.look + T.morph + T.hold, () => clear(m));
      t = t0 + T.move + T.look + T.morph + T.hold + T.gap;
    });
    at(t, () => { cur.classList.remove('on'); if (counter) counter.textContent = 'Done'; document.documentElement.classList.add('done'); });
    Steps.total = t + T.outro;
    Steps.count = cfg.steps.length;
    document.documentElement.classList.add('live');
    requestAnimationFrame(loop);
  };
  Steps.manual = () => { clock.manual = true; clock.t = 0; };
  // preview in real time: open the page with ?play
  Steps.play = () => { clock.base = performance.now(); clock.manual = false; };
  if (location.search.includes('play')) setTimeout(() => Steps.play(), 300);
  Steps.tick = (ms) => { clock.t = ms; frame(ms); };
  Steps.T = T;
  window.Steps = Steps;
})();
