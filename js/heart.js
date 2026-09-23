/* =========================================================
   ACTIVITY 1 — Can you find Chirag's heart?
   ========================================================= */
'use strict';

const HeartGame = CN.HeartGame = (() => {
  const MSGS = [
    'You found one... but my heart isn\'t this easy to understand. 😜',
    'Okayyy... you\'re getting dangerously good at this. ❤️',
    'Almost there, Mrs. Detective. 👀💗',
    'You found every heart I hid... or did you? 😏'
  ];

  // Groups of possible hiding places. Every round picks 4 (at least one needs an interaction).
  const GROUPS = {
    peek: ['peekA', 'peekC', 'peekD', 'peekE'],
    flower: ['flower'],
    blend: ['gift', 'lights', 'stars', 'book', 'teacup'],
    interact: ['envelope', 'candle']
  };
  let lastKey = '';
  function chooseSpots() {
    let set, key, tries = 0;
    do {
      const chosen = [pickOne(GROUPS.interact)];
      chosen.push(shuffle(GROUPS.peek.concat(GROUPS.flower))[0]);
      const b = shuffle(GROUPS.blend); chosen.push(b[0], b[1]);
      set = new Set(chosen); key = chosen.slice().sort().join();
    } while (key === lastKey && tries++ < 8);
    lastKey = key; return set;
  }

  let scene, spots, foundSet, count, ended, hintLock, nudgeT, activeSpots;

  const heartBtn = (id, cls, style = '') =>
    `<button class="hh ${cls}" data-spot="${id}" style="--td:${rand(0, 6).toFixed(1)}s;${style}" aria-label="A hidden heart"><svg viewBox="0 0 100 90"><use href="#i-heart"/></svg></button>`;

  /* ---------- scene pieces ---------- */
  function lightsHtml(has) {
    const N = 9, heartIdx = has ? irand(1, N - 2) : -1;
    let bulbs = '';
    for (let i = 0; i < N; i++) {
      const t = (i + .5) / N, x = 100 * t, y = 1.2 + 10 * t * (1 - t);
      if (i === heartIdx) bulbs += heartBtn('lights', 'blend bulbh', `left:${x.toFixed(2)}%;top:${(y + 1.4).toFixed(2)}cqw`);
      else bulbs += `<i class="bulb" style="left:${x.toFixed(2)}%;top:${(y + 1).toFixed(2)}cqw;--d:${(-rand(0, 3.4)).toFixed(1)}s"></i>`;
    }
    return `<div class="lights"><svg viewBox="0 0 100 12" preserveAspectRatio="none"><path d="M0 1.2 Q50 6.2 100 1.2"/></svg>${bulbs}</div>`;
  }

  function vaseHtml(has) {
    const roses = [[28, 30], [50, 17], [72, 32], [38, 52], [62, 55]];
    const cand = [[36, 34], [62, 42], [50, 40]];
    const hp = pickOne(cand);
    return `<div class="it" style="--x:3;--y:62.5;--w:24;--z:5"><div class="vase-box">
      <svg viewBox="0 0 100 130">
        <g stroke="#4d8a4a" stroke-width="2.4" fill="none" stroke-linecap="round">
          <path d="M50 88 Q42 60 28 30"/><path d="M50 88 L50 17"/><path d="M50 88 Q58 60 72 32"/><path d="M50 88 Q46 72 38 52"/><path d="M50 88 Q56 74 62 55"/>
        </g>
        <g fill="#5fa35a"><ellipse cx="44" cy="46" rx="9" ry="4" transform="rotate(-35 44 46)"/><ellipse cx="60" cy="68" rx="9" ry="4" transform="rotate(30 60 68)"/><ellipse cx="34" cy="66" rx="9" ry="4" transform="rotate(-25 34 66)"/><ellipse cx="66" cy="48" rx="8" ry="3.6" transform="rotate(40 66 48)"/><ellipse cx="52" cy="34" rx="8" ry="3.6" transform="rotate(-50 52 34)"/></g>
        ${roses.map(([x, y]) => `<use href="#i-rose" x="${x - 12}" y="${y - 12}" width="24" height="24"/>`).join('')}
        <path d="M32 84 C22 94 22 114 33 126 L67 126 C78 114 78 94 68 84 Z" fill="rgba(255,226,236,.32)" stroke="rgba(255,240,244,.65)" stroke-width="1.6"/>
        <path d="M36 100 C34 108 36 116 40 120" stroke="rgba(255,255,255,.55)" stroke-width="2" fill="none" stroke-linecap="round"/>
        <ellipse cx="50" cy="86" rx="18" ry="3" fill="rgba(255,240,244,.5)"/>
      </svg>
      ${has ? heartBtn('flower', 'blend flower', `left:${hp[0]}%;top:${(hp[1] / 130 * 100).toFixed(1)}%;transform:translate(-50%,-50%) rotate(${irand(-14, 14)}deg)`) : ''}
    </div></div>`;
  }

  function giftHtml(has) {
    const cells = [[21, 53], [47, 53], [73, 53], [21, 79], [47, 79], [73, 79]];
    const hp = pickOne(cells);
    return `<div class="it" style="--x:31;--y:73.5;--w:17;--z:5"><div class="gift-box">
      <svg viewBox="0 0 100 100">
        <defs><pattern id="gp" x="8" y="40" width="26" height="26" patternUnits="userSpaceOnUse"><use href="#i-heart" x="3" y="4" width="20" height="18" fill="#f7a1b7" opacity=".55"/></pattern></defs>
        <rect x="8" y="40" width="84" height="54" rx="3" fill="#a3213f"/>
        <rect x="8" y="40" width="84" height="54" rx="3" fill="url(#gp)"/>
        <rect x="4" y="28" width="92" height="16" rx="3" fill="#c22f58"/>
        <rect x="43" y="28" width="14" height="66" fill="#e3b25b"/>
        <rect x="4" y="33" width="92" height="5" fill="#e3b25b" opacity=".0"/>
        <use href="#i-bow" x="26" y="9" width="48" height="26"/>
        <rect x="8" y="90" width="84" height="4" rx="2" fill="rgba(0,0,0,.25)"/>
      </svg>
      ${has ? heartBtn('gift', 'blend gift', `left:${hp[0]}%;top:${hp[1]}%;transform:translate(-50%,-50%) rotate(${irand(-12, 12)}deg)`) : ''}
    </div></div>`;
  }

  function candleHtml(has) {
    return `<div class="it" style="--x:52;--y:71;--w:11;--z:5"><div class="candle" role="button" aria-label="A little candle">
      ${has ? heartBtn('candle', 'smokeh', 'left:calc(50% - 3.1cqw);top:-13cqw') : ''}
      <div class="smoke"><i style="--d:0s;--dx:-1cqw"></i><i style="--d:.7s;--dx:1.2cqw"></i><i style="--d:1.4s;--dx:-.4cqw"></i></div>
      <span class="flame"></span><span class="wick"></span>
      <div class="jar"><div class="wax"></div><div class="lbl"><svg viewBox="0 0 100 90"><use href="#i-heart"/></svg></div></div>
    </div></div>`;
  }

  function envelopeHtml(has) {
    return `<div class="it" style="--x:9;--y:88;--w:19;--z:6"><div class="env" role="button" aria-label="A small envelope">
      <div class="e-back"></div>
      <div class="e-letter">${has ? heartBtn('envelope', 'envh') : '<span class="nt">not here 😜</span>'}</div>
      <div class="e-front"></div><div class="e-flap"></div>
      <div class="e-seal"><svg viewBox="0 0 100 90"><use href="#i-heart"/></svg></div>
    </div></div>`;
  }

  function teacupHtml(has) {
    return `<div class="it" style="--x:66;--y:73.5;--w:15;--z:5"><div class="cup-box">
      <svg viewBox="0 0 100 90">
        <path class="steam" style="--d:0s" d="M38 28 C32 20 44 14 38 4"/><path class="steam" style="--d:-1.1s" d="M52 28 C46 19 58 12 52 2"/><path class="steam" style="--d:-2.1s" d="M64 28 C59 21 69 15 64 7"/>
        <ellipse cx="50" cy="78" rx="46" ry="9" fill="#f5e0d4"/><ellipse cx="50" cy="76" rx="36" ry="6" fill="#e9c9b8"/>
        <path d="M84 42 C104 42 102 66 78 64" fill="none" stroke="#fff4ea" stroke-width="6" stroke-linecap="round"/>
        <path d="M16 34 L84 34 C84 62 72 76 50 76 C28 76 16 62 16 34Z" fill="#fff4ea"/>
        <path d="M18 48 L82 48 C81 52 80 55 79 58 L21 58 C20 55 19 52 18 48Z" fill="#e0507a" opacity=".85"/>
        <ellipse cx="50" cy="34" rx="34" ry="6.5" fill="#f1dccd"/><ellipse cx="50" cy="35" rx="30" ry="5" fill="#6b3a2a"/>
      </svg>
      ${has ? heartBtn('teacup', 'blend steamh', 'left:calc(50% - 2.8cqw);top:-9cqw') : ''}
    </div></div>`;
  }

  function windowHtml(has) {
    const N = 15, pts = [];
    let guard = 0;
    while (pts.length < N + 1 && guard++ < 400) {
      const x = rand(9, 91), y = rand(7, 80);
      if (x > 56 && y < 34) continue;                      // moon
      if (pts.some(p => Math.hypot(p[0] - x, (p[1] - y) * 1.15) < 13)) continue;
      pts.push([x, y]);
    }
    const heartP = has ? pts.pop() : null;
    const stars = pts.map(([x, y], i) => `<i class="star" style="left:${x}%;top:${y}%;--sz:${rand(1.3, 2.5).toFixed(2)}cqw;--tw:${rand(2.4, 4.4).toFixed(1)}s;--d:${(-rand(0, 4)).toFixed(1)}s"></i>`).join('');
    return `<div class="it" style="--x:33.5;--y:38;--w:33;--z:3"><div class="win">
      <div class="sky"><i class="moon"></i>${stars}${heartP ? heartBtn('stars', 'blend starh', `left:${heartP[0].toFixed(1)}%;top:${heartP[1].toFixed(1)}%`) : ''}</div>
      <div class="bars"></div><i class="curt l"></i><i class="curt r"></i><i class="win-sill"></i>
    </div></div>`;
  }

  function booksHtml(has) {
    const cols = ['linear-gradient(90deg,#7d1637,#a3193f)', 'linear-gradient(90deg,#c58b3a,#e3b25b)', 'linear-gradient(90deg,#e0507a,#f07a9a)'];
    const embs = ['st', 'dm', 'dt'], hi = irand(0, 2), hx = irand(34, 66);
    const w = [100, 86, 94], off = [0, irand(4, 10), irand(0, 6)];
    const rows = [0, 1, 2].map(i => `<div class="bk" style="width:${w[i]}%;margin-left:${off[i]}%;background:${cols[(i + 1) % 3]}"><i class="emb ${embs[i]}" style="left:${i === hi && has ? 20 : 44}%"></i><i class="emb ${embs[(i + 1) % 3]}" style="left:72%"></i>${has && i === hi ? heartBtn('book', 'blend bookh', `left:${hx}%`) : ''}</div>`);
    return `<div class="it" style="--x:62;--y:88;--w:30;--z:5"><div class="books">${rows.join('')}</div></div>`;
  }

  function polaroids(has, srcs) {
    const P = [
      { x: 4, y: 10, w: 27, r: -5, hang: 1, peek: 'p-br', spot: 'peekA' },
      { x: 36.5, y: 8.6, w: 27, r: 2.5, hang: 1 },
      { x: 69, y: 10.5, w: 27, r: -3, hang: 1, peek: 'p-tl', spot: 'peekC' },
      { x: 5, y: 38, w: 21, r: 4, peek: 'p-bl', spot: 'peekD' },
      { x: 74.5, y: 39, w: 21, r: -5, peek: 'p-tr', spot: 'peekE' }
    ];
    const caps = shuffle(['us ❤️', 'forever', 'pure love', 'my person', 'our story', 'home', 'still us', 'always']);
    return P.map((p, i) => `<div class="sp ${p.hang ? 'sway' : ''}" style="--x:${p.x};--y:${p.y};--w:${p.w};--r:${p.r};--d:${(-rand(0, 5)).toFixed(1)}s">
      <i class="${p.hang ? 'peg' : 'tape'}"></i>
      ${p.spot && has(p.spot) ? heartBtn(p.spot, 'blend peek ' + p.peek) : ''}
      ${polaroid(srcs[i], caps[i])}
    </div>`).join('');
  }

  function build() {
    activeSpots = chooseSpots();
    const has = id => activeSpots.has(id), srcs = Photos.pool(5);
    const petals = Array.from({ length: 9 }, () => `<i class="petal" style="--x:${rand(4, 94).toFixed(1)};--y:${rand(72, 97).toFixed(1)};--r:${irand(0, 360)}deg"></i>`).join('');
    const dec = [[28.4, 42, 4.4, -12], [28, 55, 3.8, 14], [68, 44, 4, 10], [68.6, 57, 4.6, -8], [48, 4.5, 3, 8]].map(([x, y, w, r]) =>
      `<svg class="decoy" viewBox="0 0 100 90" style="--x:${x};--y:${y};--w:${w};--r:${r}"><use href="#i-heart"/></svg>`).join('');
    scene.innerHTML = `
      <div class="glow"></div>
      <svg class="line" viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M-1 10 Q9 11.4 17.5 11 T50 9.2 T82.5 11.4 T101 12.6"/></svg>
      ${lightsHtml(has('lights'))}
      ${dec}
      ${polaroids(has, srcs)}
      ${windowHtml(has('stars'))}
      <div class="table"><div class="runner"></div></div>
      ${petals}
      ${vaseHtml(has('flower'))}
      ${giftHtml(has('gift'))}
      ${candleHtml(has('candle'))}
      ${teacupHtml(has('teacup'))}
      ${envelopeHtml(has('envelope'))}
      ${booksHtml(has('book'))}`;
  }

  /* ---------- game state ---------- */
  function setCount(n) {
    const c = $('#hfCount'); c.textContent = n; c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump');
  }
  function newRound() {
    scene = $('#scene'); foundSet = new Set(); count = 0; ended = false; hintLock = false;
    $('#hfCount').textContent = '0';
    $$('#hfPips i').forEach(i => i.classList.remove('on'));
    $('#hfHint').hidden = false; $('#hfGiveUp').hidden = false; $('#hfLast').hidden = true; $('#hfHint').disabled = false;
    build(); armNudge();
  }
  function armNudge() {
    clearTimeout(nudgeT);
    nudgeT = setTimeout(() => { const b = $('#hfHint'); if (!ended && !b.hidden) { b.classList.remove('nudge'); void b.offsetWidth; b.classList.add('nudge'); } }, 55000);
  }

  function fly(rect, pip) {
    return new Promise(res => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 100 90'); svg.innerHTML = '<use href="#i-heart"/>'; svg.setAttribute('class', 'fly');
      const w = Math.max(rect.width, 26), cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
      Object.assign(svg.style, { left: (cx - w / 2) + 'px', top: (cy - w * .45) + 'px', width: w + 'px', height: (w * .9) + 'px' });
      document.body.appendChild(svg);
      const pr = pip.getBoundingClientRect(), dx = pr.left + pr.width / 2 - cx, dy = pr.top + pr.height / 2 - cy;
      if (!svg.animate) { svg.remove(); return res(); }
      const a = svg.animate([
        { transform: 'translate(0,0) scale(1)' },
        { transform: `translate(${dx * .25}px,${dy * .25 - 50}px) scale(2.4)`, offset: .35 },
        { transform: `translate(${dx}px,${dy}px) scale(.55)` }
      ], { duration: 950, easing: 'cubic-bezier(.5,0,.3,1)' });
      a.onfinish = () => { svg.remove(); res(); };
    });
  }

  async function foundHeart(hh) {
    const id = hh.dataset.spot;
    if (ended || foundSet.has(id)) return;
    foundSet.add(id); count++;
    const n = count, r = hh.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    hh.style.display = 'none';
    FX.hearts(cx, cy, 18); FX.burst(cx, cy, 10, { hearts: .3 }); SFX.chime();
    if (navigator.vibrate) navigator.vibrate(30);
    setCount(n); armNudge();
    toast(MSGS[n - 1], 4300);
    const pip = $$('#hfPips i')[n - 1];
    fly(r, pip).then(() => { pip.classList.add('on'); });
    if (n === 4) allFound();
  }

  async function allFound() {
    ended = true;
    $('#hfHint').hidden = true; $('#hfGiveUp').hidden = true;
    await sleep(1300);
    if (!scene.isConnected) return;
    const b = document.createElement('div'); b.className = 'allfound'; b.innerHTML = '<b>4/4 Found! ❤️</b>'; scene.appendChild(b);
    SFX.win(); FX.confetti(140);
    setTimeout(() => b.remove(), 3800);
    await sleep(5200);
    const last = $('#hfLast'); last.hidden = false; last.classList.add('nudge');
  }

  function ripple(e) {
    const r = scene.getBoundingClientRect(), d = document.createElement('i');
    d.className = 'ripple'; d.style.left = (e.clientX - r.left) + 'px'; d.style.top = (e.clientY - r.top) + 'px';
    scene.appendChild(d); setTimeout(() => d.remove(), 720);
  }

  function hint() {
    if (hintLock || ended) return;
    const left = $$('.hh', scene).filter(h => !h.classList.contains('found') && h.style.display !== 'none');
    if (!left.length) return;
    hintLock = true; const btn = $('#hfHint'); btn.disabled = true;
    const t = pickOne(left).getBoundingClientRect(), s = scene.getBoundingClientRect();
    const g = document.createElement('i'); g.className = 'hint-glow';
    g.style.left = (t.left + t.width / 2 - s.left + rand(-16, 16)) + 'px'; g.style.top = (t.top + t.height / 2 - s.top + rand(-16, 16)) + 'px';
    scene.appendChild(g); setTimeout(() => g.remove(), 3700); SFX.pop();
    toast('Look around here... 👀', 2200);
    let s2 = 8; btn.textContent = `Hint again in ${s2}s`;
    const id = setInterval(() => { s2--; if (s2 <= 0) { clearInterval(id); btn.textContent = 'Need a hint? 💡'; btn.disabled = false; hintLock = false; } else btn.textContent = `Hint again in ${s2}s`; }, 1000);
  }

  function giveUp() {
    const card = Modal.show(`
      <div class="mc-emoji">🥺</div>
      <h3 class="mc-title">Are you sure? 👀</h3>
      <p class="mc-text">Because you're actually VERY close...</p>
      <div class="mc-actions">
        <button class="btn primary" data-a="keep">KEEP SEARCHING ❤️</button>
        <button class="btn ghost" data-a="quit">YES, I GIVE UP 🥺</button>
      </div>`);
    card.onclick = e => {
      const a = e.target.closest('[data-a]'); if (!a) return;
      Modal.hide();
      if (a.dataset.a === 'quit') { ended = true; reveal5('giveup'); }
    };
  }

  /* ---------- the secret fifth heart ---------- */
  let rvToken = 0, stopRise = null;
  async function reveal5(kind) {
    const rv = $('#reveal'), stack = $('#rvStack'), fin = $('#rvFinal'), my = ++rvToken;
    stack.innerHTML = ''; stack.hidden = false; fin.hidden = true; rv.hidden = false; rv.scrollTop = 0;
    const say = (h, c = '') => {
      const d = document.createElement('div'); d.className = 'g-line ' + c; d.innerHTML = h; stack.appendChild(d);
      requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add('in')));
      $$('.g-line', stack).slice(0, -2).forEach(l => l.classList.add('gone'));
    };
    const script = (kind === 'giveup'
      ? [['Okay... I\'ll tell you the secret.', 2500, '']]
      : [['You found all four... but I told you there was one more. 😏', 2900, '']]
    ).concat([
      ['You were searching everywhere for Chirag\'s final heart...', 3000, ''],
      ['But there was one heart I could never hide from you.', 3400, 'soft']
    ]);
    await sleep(700);
    for (const [t, ms, c] of script) { if (my !== rvToken) return; say(t, c); await sleep(ms); }
    if (my !== rvToken) return;
    stack.hidden = true;
    $('#rvFrame').innerHTML = heartFrame(Photos.neha());
    $('#orbit').innerHTML = Array.from({ length: 14 }, (_, i) => `<i style="--a:${(i * 360 / 14).toFixed(1)}deg;--rad:${i % 2 ? 62 : 68};--c:${pickOne(['#ff7a9c', '#ffd6de', '#f6d78b', '#e2334f'])}"></i>`).join('');
    fin.hidden = false; SFX.win(); FX.confetti(120);
    stopRise && stopRise(); stopRise = FX.rise(40000, 7);
  }
  function closeReveal() { rvToken++; $('#reveal').hidden = true; stopRise && stopRise(); stopRise = null; }

  /* ---------- wiring ---------- */
  function init() {
    scene = $('#scene');
    scene.addEventListener('click', e => {
      const hh = e.target.closest('.hh');
      if (hh) return foundHeart(hh);
      const env = e.target.closest('.env');
      if (env) { env.classList.toggle('open'); SFX.flip(); return; }
      const can = e.target.closest('.candle');
      if (can) { can.classList.toggle('out'); SFX.pop(); return; }
      ripple(e);
    });
    $('#hfHint').addEventListener('click', hint);
    $('#hfGiveUp').addEventListener('click', giveUp);
    $('#hfLast').addEventListener('click', () => reveal5('found'));
    $('#hfNew').addEventListener('click', () => { newRound(); toast('Fresh round — the hearts moved! 😏', 2600); });
    $('#rvAgain').addEventListener('click', () => { closeReveal(); newRound(); scrollTo(0, 0); });
    $('#rvBack').addEventListener('click', async () => { closeReveal(); CN.App.go('home'); });
    $('#modal').addEventListener('click', e => { if (e.target.id === 'modal' && $('#modalCard [data-a="keep"]')) Modal.hide(); });
  }

  return {
    init, newRound,
    enter() { if (!scene.firstElementChild) newRound(); },
    leave() { clearTimeout(nudgeT); },
    get active() { return true; }
  };
})();
