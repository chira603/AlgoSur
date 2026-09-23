/* =========================================================
   HOME + little surprises
   ========================================================= */
'use strict';

const Home = CN.Home = (() => {
  const N = 5, ROTS = [-2, 6, -7, 9, -11];
  let cards = [], busy = false;

  function place(el, p) {
    el.style.zIndex = 10 - p;
    el.style.transform = `translate(${(p % 2 ? 1 : -1) * p * 5}px,${-p * 7}px) rotate(${ROTS[p]}deg) scale(${1 - p * .035})`;
    el.style.opacity = 1;
  }
  function buildDeck() {
    const deck = $('#deck'); deck.innerHTML = ''; busy = false;
    cards = Photos.pool(N).map(s => {
      const d = document.createElement('div'); d.className = 'dk'; d.innerHTML = polaroid(s, pickOne(CAPTIONS));
      d.addEventListener('click', () => flick(d)); deck.appendChild(d); return d;
    });
    cards.forEach((c, i) => place(c, i));
  }
  async function flick(el) {
    if (busy || el !== cards[0]) return; busy = true; SFX.flip();
    const dir = Math.random() < .5 ? -1 : 1;
    el.style.transition = 'transform .5s cubic-bezier(.5,0,.8,.6),opacity .5s';
    el.style.transform = `translate(${dir * 130}%,-10%) rotate(${dir * 28}deg)`; el.style.opacity = 0;
    await sleep(480);
    const inDeck = cards.map(c => c.querySelector('img').getAttribute('src'));
    const next = Photos.pool(8).find(s => !inDeck.includes(s)) || Photos.one();
    el.innerHTML = polaroid(next, pickOne(CAPTIONS));
    el.style.transition = 'none'; place(el, N - 1); el.style.opacity = 0; void el.offsetWidth; el.style.transition = '';
    cards = cards.slice(1).concat(el); cards.forEach((c, i) => place(c, i));
    busy = false;
  }
  function buildFloats() {
    const spots = [[1, 4, -9], [9, 36, 7], [2, 68, -5], [86, 3, 9], [78, 34, -6], [87, 66, 7]];
    const srcs = Photos.pool(spots.length);
    $('#heroFloat').innerHTML = spots.map(([x, y, r], i) =>
      `<div class="fp" style="left:${x}%;top:${y}%;--r:${r}deg;--d:${-i * 1.4}s">${polaroid(srcs[i], pickOne(CAPTIONS))}</div>`).join('');
  }
  function buildRibbon() {
    let list = shuffle(Photos.list());
    const mk = arr => { while (arr.length < 10) arr = arr.concat(arr); return arr.concat(arr).map(s => `<img src="${s}" alt="Our photo" loading="lazy" decoding="async" style="--r:${rand(-2.2, 2.2).toFixed(1)}deg" onerror="this.onerror=null;this.src=__ph(this.getAttribute('src'))">`).join(''); };
    const half = Math.ceil(list.length / 2), a = list.slice(0, half), b = list.slice(half).length ? list.slice(half) : list.slice().reverse();
    const dur = Math.max(50, list.length * 5);
    $('#ribbon').innerHTML = `<div class="rb-row" style="--dur:${dur}s">${mk(a)}</div><div class="rb-row rev" style="--dur:${dur + 12}s">${mk(b)}</div>`;
  }
  function init() {
    $('#ribbon').addEventListener('click', e => { const im = e.target.closest('img'); if (im) Lightbox.open(im.getAttribute('src')); });
    $('#deck').addEventListener('dblclick', e => { const im = e.target.closest('img'); if (im) Lightbox.open(im.getAttribute('src')); });
    $('#secretEnv').addEventListener('click', e => {
      const r = e.currentTarget.getBoundingClientRect(); FX.hearts(r.left + r.width / 2, r.top, 16); SFX.chime();
      const card = Modal.show(`<div class="mc-emoji">💌</div><h3 class="mc-title" style="font-size:1.5rem">A tiny secret note</h3>
        <p class="mc-text" style="font-size:1.2rem;font-family:var(--serif);font-style:italic">In case nobody told you today...<br>you're still Chirag's favourite notification. ❤️</p>
        <div class="mc-actions"><button class="btn primary" data-a="x">Aww ❤️</button></div>`);
      card.onclick = ev => { if (ev.target.closest('[data-a]')) Modal.hide(); };
    });
  }
  return { init, enter() { buildDeck(); buildFloats(); buildRibbon(); }, leave() { } };
})();

const Surprises = CN.Surprises = (() => {
  let active = false, hT = 0, pT = 0, taps = 0, tapT = 0;
  let pop;

  function spawnHeart() {
    if (document.hidden || !active) return;
    const b = document.createElement('button'); b.className = 'fheart'; b.setAttribute('aria-label', 'A floating heart');
    b.style.top = rand(20, 68) + 'vh'; b.style.setProperty('--dur', rand(10, 14).toFixed(1) + 's');
    b.innerHTML = '<svg viewBox="0 0 100 90"><use href="#i-heart"/></svg>';
    b.addEventListener('click', () => {
      const r = b.getBoundingClientRect(); FX.hearts(r.left + r.width / 2, r.top + r.height / 2, 18); SFX.kiss();
      toast('Hey! You found an extra kiss from Chirag. 💋'); b.remove();
    });
    b.addEventListener('animationend', () => b.remove());
    document.body.appendChild(b);
  }
  const schedHeart = first => { clearTimeout(hT); hT = setTimeout(() => { spawnHeart(); schedHeart(); }, first ? rand(14000, 22000) : rand(30000, 55000)); };

  function showPop() {
    const v = CN.App.current;
    if (document.hidden || !active || v === 'heart' || (v === 'memory' && Memory.playing) || !$('#modal').hidden || !$('#reveal').hidden) return;
    const src = Photos.one();
    pop.innerHTML = polaroid(src, pickOne(['remember this? 🥺', 'us ❤️', 'aww look at us', 'my favourite day']));
    pop.dataset.src = src; pop.classList.add('show'); SFX.pop();
    setTimeout(() => pop.classList.remove('show'), 7500);
  }
  const schedPop = () => { clearTimeout(pT); pT = setTimeout(() => { showPop(); schedPop(); }, rand(60000, 95000)); };

  /** tap the logo / title many times */
  function lovetap(el) {
    taps++; clearTimeout(tapT); tapT = setTimeout(() => taps = 0, 3500);
    if (taps >= 5) { taps = 0; el.classList.remove('jiggle'); void el.offsetWidth; el.classList.add('jiggle'); SFX.wrong(); toast('Stop touching our love story. 😂❤️'); }
  }

  function start() {
    if (active) return; active = true;
    pop = document.createElement('button'); pop.className = 'mempop'; pop.setAttribute('aria-label', 'A surprise memory');
    pop.addEventListener('click', () => { pop.classList.remove('show'); Lightbox.open(pop.dataset.src); });
    document.body.appendChild(pop);
    $('#brand').addEventListener('click', e => lovetap(e.currentTarget));
    $('#heroTitle').addEventListener('click', e => lovetap(e.currentTarget));
    schedHeart(true); schedPop();
  }
  return { start };
})();
