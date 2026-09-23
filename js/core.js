/* =========================================================
   CORE — utilities, photos, particles, sound, UI helpers
   ========================================================= */
'use strict';

/* ---------------- EDIT ME ---------------- */
const CONFIG = {
  photoDir: 'images/',
  photoExt: 'jpeg',
  photoCount: 38,          // images/1.jpeg … images/38.jpeg
  // Which photo numbers show NEHA (used inside the big heart frames).
  // Put the numbers of your best photos of Neha here, e.g. [3, 12, 21].
  nehaPhotos: [1],
  audio: 'audio/bgm.mp3',  // replace this file with your own song any time
  musicVolume: 0.35
};

const CN = window.CN = {};

/* ---------------- tiny helpers ---------------- */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const rand = (a, b) => a + Math.random() * (b - a);
const irand = (a, b) => Math.floor(rand(a, b + 1));
const pickOne = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const isMobile = () => innerWidth < 760;
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const HEART_D = 'M50 88 C20 62 2 44 2 26 C2 12 13 2 27 2 C37 2 45 7 50 15 C55 7 63 2 73 2 C87 2 98 12 98 26 C98 44 80 62 50 88 Z';
const HEART = new Path2D(HEART_D);
const store = {
  get(k, d) { try { const v = localStorage.getItem('cn_' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('cn_' + k, JSON.stringify(v)); } catch (e) { } }
};

/* ---------------- PHOTOS ---------------- */
const Photos = CN.Photos = {
  all: Array.from({ length: CONFIG.photoCount }, (_, i) => `${CONFIG.photoDir}${i + 1}.${CONFIG.photoExt}`),
  ok: [],
  numOf(src) { const m = /(\d+)\.\w+$/.exec(src); return m ? +m[1] : 0; },
  url(n) { return `${CONFIG.photoDir}${n}.${CONFIG.photoExt}`; },
  placeholder(n) {
    const h1 = 335 + (n * 17) % 40, h2 = 320 + (n * 29) % 50;
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='750' viewBox='0 0 600 750'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='hsl(${h1},72%,64%)'/><stop offset='1' stop-color='hsl(${h2},62%,26%)'/></linearGradient></defs><rect width='600' height='750' fill='url(#g)'/><path transform='translate(150 190) scale(3)' d='${HEART_D}' fill='rgba(255,255,255,.88)'/><text x='300' y='560' font-family='Georgia,serif' font-style='italic' font-size='54' fill='white' text-anchor='middle'>photo ${n}</text><text x='300' y='620' font-family='Georgia,serif' font-size='30' fill='rgba(255,255,255,.75)' text-anchor='middle'>add images/${n}.jpeg</text></svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  },
  probe(src) {
    return new Promise(res => { const im = new Image(); im.decoding = 'async'; im.onload = () => res(src); im.onerror = () => res(null); im.src = src; });
  },
  async preload(onProgress) {
    let done = 0; const total = this.all.length;
    const tasks = this.all.map(src => this.probe(src).then(r => { done++; if (r) this.ok.push(r); onProgress && onProgress(done / total); }));
    await Promise.race([Promise.all(tasks), sleep(9000)]);
  },
  /** n distinct photo sources, randomised. Pads with numbered placeholders if there are not enough real photos. */
  pool(n, avoid) {
    let real = shuffle(this.ok);
    if (avoid && avoid.size) {
      const fresh = real.filter(u => !avoid.has(u)), stale = real.filter(u => avoid.has(u));
      real = fresh.concat(stale);
    }
    const out = real.slice(0, n);
    if (out.length < n) {
      const missing = shuffle(this.all.filter(u => !this.ok.includes(u)));
      for (const m of missing) { if (out.length >= n) break; out.push(this.placeholder(this.numOf(m))); }
      let k = 100; while (out.length < n) out.push(this.placeholder(k++));
    }
    return out;
  },
  one() { return this.pool(1)[0]; },
  neha() {
    const c = CONFIG.nehaPhotos.map(n => this.url(n)).filter(u => this.ok.includes(u));
    return c.length ? pickOne(c) : this.one();
  },
  /** every photo we have, or placeholders so the UI is never empty */
  list() { return this.ok.length ? this.ok.slice() : this.pool(8); }
};
window.__ph = src => Photos.placeholder(Photos.numOf(src) || 1);
const imgTag = (src, alt = 'Chirag and Neha') => `<img src="${src}" alt="${alt}" draggable="false" decoding="async" onerror="this.onerror=null;this.src=__ph(this.getAttribute('src'))">`;

/** Photo inside an animated heart shape (no stretching: slice from the top so faces stay in). */
function heartFrame(src, extra = '') {
  return `<svg class="frame-svg ${extra}" viewBox="0 0 100 90" role="img" aria-label="Neha">
    <defs><linearGradient id="hfg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbe8b0"/><stop offset="1" stop-color="#c08a2e"/></linearGradient></defs>
    <path d="${HEART_D}" fill="#3a0a1c"/>
    <image href="${src}" x="0" y="0" width="100" height="90" preserveAspectRatio="xMidYMin slice" clip-path="url(#heartClip)" onerror="this.onerror=null;this.setAttribute('href',__ph('${src}'))"/>
    <path d="${HEART_D}" fill="none" stroke="url(#hfg)" stroke-width="2.4" stroke-linejoin="round"/>
  </svg>`;
}
const polaroid = (src, cap = '') => `<figure class="pl" style="margin:0"><div class="ph">${imgTag(src)}</div><figcaption class="cap">${cap}</figcaption></figure>`;
const CAPTIONS = ['us ❤️', 'this day 🥺', 'my favourite person', 'forever, please', 'that smile', 'still my heart', 'obsessed with this', 'remember this?', 'home = you', 'pure love', 'our little world', 'you + me'];
CN.imgTag = imgTag; CN.heartFrame = heartFrame; CN.polaroid = polaroid;

/* ---------------- BACKGROUND PHOTO (blurred, crossfading) ---------------- */
const Bg = CN.Bg = {
  layers: null, cur: 0, timer: 0,
  start() {
    this.layers = $$('.bg-layer');
    this.next(); clearInterval(this.timer);
    this.timer = setInterval(() => !document.hidden && this.next(), 11000);
  },
  next() {
    if (!Photos.ok.length) return;
    const src = pickOne(Photos.ok);
    this.cur = 1 - this.cur;
    const on = this.layers[this.cur], off = this.layers[1 - this.cur];
    on.style.backgroundImage = `url("${src}")`;
    on.classList.add('show'); off.classList.remove('show');
  }
};

/* ---------------- AMBIENT (floating hearts + glow dust) ---------------- */
const Ambient = CN.Ambient = (() => {
  const c = $('#ambient'), ctx = c.getContext('2d');
  let W, H, dpr, hearts = [], dust = [];
  const cols = ['#ff7a9c', '#ffd6de', '#e2334f', '#f6d78b', '#f07a9a'];
  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight;
    c.width = W * dpr; c.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function mkHeart(initial) {
    return { x: rand(0, W), y: initial ? rand(0, H) : H + rand(20, 120), s: rand(9, isMobile() ? 26 : 36), vy: rand(.16, .5), sw: rand(.4, 1.3), ph: rand(0, 6.28), a: rand(.07, .26), c: pickOne(cols), r: rand(-.4, .4) };
  }
  function mkDust() { return { x: rand(0, W), y: rand(0, H), r: rand(.8, 2.6), vy: rand(.05, .22), ph: rand(0, 6.28), a: rand(.15, .6) }; }
  function fill() {
    const nh = REDUCED ? 6 : isMobile() ? 15 : 28, nd = REDUCED ? 10 : isMobile() ? 26 : 50;
    hearts = Array.from({ length: nh }, () => mkHeart(true)); dust = Array.from({ length: nd }, mkDust);
  }
  let t0 = 0;
  function frame(t) {
    requestAnimationFrame(frame);
    if (document.hidden) return;
    const dt = Math.min(.05, (t - t0) / 1000 || .016); t0 = t;
    ctx.clearRect(0, 0, W, H);
    for (const d of dust) {
      d.y -= d.vy * dt * 60; d.ph += dt; if (d.y < -4) { d.y = H + 4; d.x = rand(0, W); }
      const a = d.a * (.55 + .45 * Math.sin(d.ph * 2));
      ctx.fillStyle = `rgba(255,224,160,${a})`; ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 6.283); ctx.fill();
    }
    for (const h of hearts) {
      h.y -= h.vy * dt * 60; h.ph += dt * h.sw; const x = h.x + Math.sin(h.ph) * 22;
      if (h.y < -60) Object.assign(h, mkHeart(false));
      ctx.save(); ctx.translate(x, h.y); ctx.rotate(h.r + Math.sin(h.ph) * .25); ctx.scale(h.s / 100, h.s / 100); ctx.translate(-50, -45);
      ctx.globalAlpha = h.a; ctx.fillStyle = h.c; ctx.fill(HEART); ctx.restore();
    }
  }
  resize(); fill(); requestAnimationFrame(frame);
  addEventListener('resize', () => { resize(); });
  return { fill };
})();

/* ---------------- FX (bursts / confetti on top layer) ---------------- */
const FX = CN.FX = (() => {
  const c = $('#burst'), ctx = c.getContext('2d');
  let W, H, dpr, ps = [], raf = 0, last = 0;
  const palette = ['#ff7a9c', '#ffd6de', '#e2334f', '#f6d78b', '#fff4ea', '#e0507a', '#ffb3c6'];
  function resize() { dpr = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; c.width = W * dpr; c.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  resize(); addEventListener('resize', resize);
  function add(p) { ps.push(p); if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); } }
  function loop(t) {
    const dt = Math.min(.04, (t - last) / 1000); last = t;
    ctx.clearRect(0, 0, W, H);
    ps = ps.filter(p => p.life > 0 && p.y < H + 60);
    for (const p of ps) {
      p.life -= dt; p.vy += p.g * dt; p.vx *= (1 - p.drag * dt); p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      const a = clamp(p.life / p.fade, 0, 1);
      ctx.save(); ctx.globalAlpha = a; ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.col;
      if (p.kind === 'heart') { ctx.scale(p.s / 100, p.s / 100); ctx.translate(-50, -45); ctx.fill(HEART); }
      else if (p.kind === 'conf') { ctx.scale(1, Math.abs(Math.sin(p.life * 6 + p.s))); ctx.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * .6); }
      else { ctx.beginPath(); ctx.arc(0, 0, p.s / 2, 0, 6.283); ctx.fill(); }
      ctx.restore();
    }
    if (ps.length) raf = requestAnimationFrame(loop); else { raf = 0; ctx.clearRect(0, 0, W, H); }
  }
  const k = () => REDUCED ? .35 : 1;
  return {
    burst(x, y, n = 16, o = {}) {
      n = Math.ceil(n * k());
      for (let i = 0; i < n; i++) {
        const a = rand(0, 6.283), sp = rand(80, o.power || 300);
        add({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 90, g: 330, drag: 1.1, rot: rand(0, 6), vr: rand(-5, 5), s: rand(o.min || 12, o.max || 30), life: rand(1, 1.8), fade: .7, kind: Math.random() < (o.hearts ?? .75) ? 'heart' : 'spark', col: pickOne(palette) });
      }
    },
    /** small tap sparkle */
    tap(x, y) { for (let i = 0; i < 3; i++) add({ x, y, vx: rand(-40, 40), vy: rand(-110, -50), g: 60, drag: .5, rot: rand(-.5, .5), vr: rand(-1, 1), s: rand(8, 14), life: .9, fade: .5, kind: 'heart', col: pickOne(palette) }); },
    confetti(n = 150) {
      n = Math.ceil(n * k());
      for (let i = 0; i < n; i++) {
        const fromTop = i % 3 !== 0, kind = Math.random() < .35 ? 'heart' : 'conf';
        if (fromTop) add({ x: rand(0, W), y: rand(-60, -10), vx: rand(-60, 60), vy: rand(60, 220), g: 90, drag: .4, rot: rand(0, 6), vr: rand(-6, 6), s: kind === 'heart' ? rand(12, 26) : rand(8, 14), life: rand(3, 5), fade: 1, kind, col: pickOne(palette) });
        else { const left = Math.random() < .5; add({ x: left ? -10 : W + 10, y: H * .85, vx: (left ? 1 : -1) * rand(200, 520), vy: rand(-780, -420), g: 620, drag: .6, rot: rand(0, 6), vr: rand(-8, 8), s: kind === 'heart' ? rand(14, 28) : rand(8, 14), life: rand(2.4, 3.6), fade: .8, kind, col: pickOne(palette) }); }
      }
    },
    hearts(x, y, n = 10) { this.burst(x, y, n, { hearts: 1, power: 240, min: 14, max: 34 }); },
    rise(ms = 2500, perSec = 14) {
      const end = performance.now() + ms; const id = setInterval(() => {
        if (performance.now() > end) return clearInterval(id);
        for (let i = 0; i < Math.ceil(perSec / 8); i++) add({ x: rand(0, W), y: H + 20, vx: rand(-20, 20), vy: rand(-260, -140), g: -10, drag: .2, rot: rand(-.4, .4), vr: rand(-1, 1), s: rand(14, 34), life: rand(3, 5), fade: 1.2, kind: 'heart', col: pickOne(palette) });
      }, 125);
      return () => clearInterval(id);
    }
  };
})();

/* ---------------- SFX (tiny synth — no files needed) ---------------- */
const SFX = CN.SFX = (() => {
  let ac = null, master = null, muted = false;
  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    try { ac = new (window.AudioContext || window.webkitAudioContext)(); master = ac.createGain(); master.gain.value = .55; master.connect(ac.destination); } catch (e) { }
  }
  function tone(f, d = .25, type = 'sine', v = .2, when = 0, slide = 0) {
    if (!ac || muted) return;
    const t = ac.currentTime + when, o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f * slide), t + d);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + d + .05);
  }
  let lastTick = 0;
  return {
    init, setMuted(m) { muted = m; },
    chime() { [784, 988, 1319].forEach((f, i) => tone(f, .55, 'sine', .15, i * .09)); },
    pop() { tone(520, .12, 'sine', .16, 0, 1.8); },
    tick() { const n = performance.now(); if (n - lastTick < 55) return; lastTick = n; tone(1900, .03, 'square', .035); },
    flip() { tone(320, .09, 'triangle', .1, 0, 1.7); },
    wrong() { tone(230, .24, 'sawtooth', .06, 0, .7); },
    match() { [659, 880, 1175].forEach((f, i) => tone(f, .4, 'sine', .14, i * .07)); },
    win() { [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, .7, 'sine', .14, i * .12)); },
    kiss() { tone(900, .09, 'sine', .16, 0, 1.6); tone(1250, .1, 'sine', .12, .11, 1.4); },
    count() { tone(660, .12, 'sine', .12); },
    go() { tone(880, .35, 'triangle', .16); tone(1320, .35, 'triangle', .12, .08); }
  };
})();

/* ---------------- MUSIC ---------------- */
const Music = CN.Music = (() => {
  const el = $('#bgm'), btn = $('#musicBtn');
  let on = true, started = false, fade = 0;
  function fadeTo(v, ms = 2500) {
    clearInterval(fade); const from = el.volume, steps = 25, dt = ms / steps; let i = 0;
    fade = setInterval(() => { i++; el.volume = clamp(from + (v - from) * (i / steps), 0, 1); if (i >= steps) clearInterval(fade); }, dt);
  }
  function paint() { btn.classList.toggle('off', !on); btn.setAttribute('aria-pressed', on); btn.title = on ? 'Music on' : 'Music off'; }
  function start() {
    started = true; btn.hidden = false; el.volume = 0;
    if (on) el.play().then(() => fadeTo(CONFIG.musicVolume)).catch(() => { });
    paint();
  }
  function toggle() {
    on = !on; SFX.setMuted(!on);
    if (on) { el.play().catch(() => { }); fadeTo(CONFIG.musicVolume, 800); } else { fadeTo(0, 500); setTimeout(() => !on && el.pause(), 520); }
    paint();
  }
  btn.addEventListener('click', toggle);
  document.addEventListener('visibilitychange', () => {
    if (!started) return;
    if (document.hidden) el.pause(); else if (on) el.play().catch(() => { });
  });
  return { start, toggle };
})();

/* ---------------- TOAST / MODAL / LIGHTBOX ---------------- */
let toastT = 0;
function toast(msg, ms = 3400) {
  const t = $('#toast'); t.innerHTML = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), ms);
}
CN.toast = toast;

const Modal = CN.Modal = {
  show(html, { wide = false, onClose } = {}) {
    const m = $('#modal'), card = $('#modalCard');
    card.className = 'modal-card glass' + (wide ? ' wide' : ''); card.innerHTML = html; m.hidden = false;
    this.onClose = onClose; return card;
  },
  hide() { const m = $('#modal'); if (m.hidden) return; m.hidden = true; $('#modalCard').innerHTML = ''; const f = this.onClose; this.onClose = null; f && f(); },
  get open() { return !$('#modal').hidden; }
};

const Lightbox = CN.Lightbox = (() => {
  const box = $('#lightbox'), img = $('#lbImg'); let list = [], i = 0;
  function show() { img.style.animation = 'none'; void img.offsetWidth; img.style.animation = ''; img.src = list[i]; }
  function open(src, from) { list = from && from.length ? from : Photos.list(); i = Math.max(0, list.indexOf(src)); box.hidden = false; show(); }
  const close = () => { box.hidden = true; };
  const step = d => { i = (i + d + list.length) % list.length; show(); SFX.flip(); };
  $('#lbClose').addEventListener('click', close);
  $('#lbPrev').addEventListener('click', e => { e.stopPropagation(); step(-1); });
  $('#lbNext').addEventListener('click', e => { e.stopPropagation(); step(1); });
  box.addEventListener('click', e => { if (e.target === box) close(); });
  img.onerror = () => { img.onerror = null; img.src = __ph(list[i]); };
  document.addEventListener('keydown', e => {
    if (box.hidden) return;
    if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1);
  });
  let sx = 0; box.addEventListener('touchstart', e => sx = e.touches[0].clientX, { passive: true });
  box.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1); }, { passive: true });
  return { open, close };
})();

/* ---------------- PAGE WIPE (heart transition) ---------------- */
const Wipe = CN.Wipe = {
  async cover() { const w = $('#wipe'); w.classList.remove('out'); w.classList.add('run'); await sleep(560); },
  async reveal() { const w = $('#wipe'); w.classList.add('out'); await sleep(600); w.classList.remove('run', 'out'); }
};

/* tap sparkles everywhere (tiny, subtle) */
document.addEventListener('pointerdown', e => { if (e.isPrimary && !REDUCED) FX.tap(e.clientX, e.clientY); }, { passive: true });

Object.assign(CN, { $, $$, sleep, rand, irand, pickOne, shuffle, clamp, isMobile, REDUCED, store, CAPTIONS, HEART_D, CONFIG });
