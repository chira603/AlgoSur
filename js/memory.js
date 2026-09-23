/* =========================================================
   ACTIVITY 3 — Match Our Memories
   ========================================================= */
'use strict';

const Memory = CN.Memory = (() => {
  const OK = ['Perfect Match! Just like us. 😌❤️', 'Made for each other. ♾️', 'You remember this one! 🥹', 'That was a good day. 💗', 'Another memory kept safe. ❤️'];
  const MISS = ['Oops... not this one. 🥺', 'Almost! Try again ❤️', 'Hmm, think harder... 👀'];
  let size = 8, cards = [], first = null, busy = true, playing = false, matches = 0, score = 0, moves = 0, streak = 0;
  let tStart = 0, timer = 0, token = 0, lastSet = new Set(), srcs = [];
  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const elapsed = () => Math.floor((Date.now() - tStart) / 1000);
  const banner = h => { $('#memBanner').innerHTML = h; };

  function paint(bump) {
    $('#stM').textContent = `${matches}/${size}`; $('#stS').textContent = score; $('#stV').textContent = moves;
    $('#stT').textContent = fmt(playing ? elapsed() : 0);
    if (bump) { const b = $('#' + bump); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }
  }

  function showSetup() {
    token++; clearInterval(timer); playing = false;
    $('#memSetup').hidden = false; $('#memPlay').hidden = true; $('#memHead').hidden = false;
    $$('#memSeg button').forEach(b => b.classList.toggle('on', +b.dataset.size === size));
    const best = store.get('best' + size, 0);
    $('#memBest').textContent = best ? `Your best score: ${best} 🏆` : 'Five seconds to look. Then it\'s all up to your heart.';
  }

  async function start() {
    const my = ++token; clearInterval(timer); playing = false; busy = true; first = null;
    $('#memSetup').hidden = true; $('#memPlay').hidden = false; $('#memHead').hidden = true;
    matches = 0; score = 0; moves = 0; streak = 0; paint();
    srcs = Photos.pool(size, lastSet); lastSet = new Set(srcs);
    const deck = shuffle(srcs.concat(srcs));
    const cols = size === 8 ? 4 : (innerWidth >= 760 ? 6 : 4);
    const grid = $('#memGrid'); grid.style.setProperty('--cols', cols);
    grid.innerHTML = deck.map((s, i) => `<button class="card" data-i="${i}" aria-label="Memory card"><span class="card-in"><span class="face cover"><svg viewBox="0 0 100 90"><use href="#i-heart"/></svg></span><span class="face pic">${imgTag(s)}</span></span></button>`).join('');
    cards = $$('.card', grid).map((el, i) => ({ el, src: deck[i], up: false, done: false }));
    scrollTo(0, 0);
    banner('<div class="msg">Shuffling our memories... 🎴</div>');
    await sleep(600); if (my !== token) return;

    // memory preview: everything face-up for 5 seconds
    banner('<div class="msg">You have 5 seconds to remember everything. 👀</div><div class="count" id="cnt">5...</div>');
    cards.forEach((c, i) => setTimeout(() => { if (my === token) c.el.classList.add('up'); }, i * 45));
    SFX.flip();
    await sleep(700);
    for (let n = 5; n >= 1; n--) {
      if (my !== token) return;
      const c = $('#cnt'); if (c) { c.textContent = n + '...'; c.style.animation = 'none'; void c.offsetWidth; c.style.animation = ''; }
      SFX.count(); await sleep(1000);
    }
    if (my !== token) return;
    cards.forEach((c, i) => setTimeout(() => c.el.classList.remove('up'), i * 35));
    await sleep(cards.length * 35 + 500); if (my !== token) return;
    banner('<div class="go">GO! ❤️</div>'); SFX.go();
    await sleep(900); if (my !== token) return;
    banner('<div class="msg">Find the pairs, Mrs. Detective. 💗</div>');
    busy = false; playing = true; tStart = Date.now(); paint();
    timer = setInterval(() => paint(), 500);
  }

  async function pick(el) {
    if (busy || !playing) return;
    const c = cards[+el.dataset.i]; if (c.up || c.done) return;
    c.up = true; el.classList.add('up'); SFX.flip();
    if (!first) { first = c; return; }
    const a = first; first = null; moves++; busy = true; paint('stV');
    const my = token;
    if (a.src === c.src) {
      streak++; const bonus = Math.min(50, (streak - 1) * 10);
      score += 100 + bonus; matches++; a.done = c.done = true;
      a.el.classList.add('matched'); c.el.classList.add('matched');
      [a, c].forEach(k => { const r = k.el.getBoundingClientRect(); FX.hearts(r.left + r.width / 2, r.top + r.height / 2, 8); });
      SFX.match(); paint('stS');
      banner(`<div class="msg">${pickOne(OK)}${bonus ? `<br><small style="color:var(--gold-2)">Combo +${bonus} ✨</small>` : ''}</div>`);
      busy = false;
      if (matches === size) win();
    } else {
      streak = 0; score = Math.max(0, score - 10); SFX.wrong(); paint('stS');
      a.el.classList.add('nope'); c.el.classList.add('nope');
      banner(`<div class="msg">${pickOne(MISS)}</div>`);
      await sleep(900); if (my !== token) return;
      [a, c].forEach(k => { k.up = false; k.el.classList.remove('up', 'nope'); });
      SFX.flip(); busy = false;
    }
  }

  async function win() {
    playing = false; clearInterval(timer);
    const secs = elapsed(); paint();
    SFX.win(); FX.confetti(180); banner('<div class="go" style="font-size:2rem">❤️ All matched! ❤️</div>');
    await sleep(1400);
    const prev = store.get('best' + size, 0), isBest = score > prev; if (isBest) store.set('best' + size, score);
    let slide = 0, slideT = 0;
    const card = Modal.show(`
      <div class="mc-emoji">🏆</div>
      <h3 class="mc-title">YOU MATCHED ALL OUR MEMORIES! ❤️</h3>
      <div class="mem-win-stats">
        <div><b>${size}/${size}</b><small>Memories Matched ❤️</small></div>
        <div><b>${moves}</b><small>Moves 👆</small></div>
        <div><b>${fmt(secs)}</b><small>Time ⏱️</small></div>
        <div><b>${score}</b><small>Points 🏆</small></div>
      </div>
      ${isBest && prev ? '<p class="mc-note">New personal best! 🎉</p>' : ''}
      <p class="mc-text">You remembered the photos...<br>but I hope you remember how every one of these moments made us feel. ❤️</p>
      <div class="slideshow" id="slide"><img class="on" alt="Our memory"><img alt="Our memory"></div>
      <div class="mc-actions"><button class="btn primary big" data-a="again">PLAY AGAIN 🔄</button><button class="btn gold" data-a="home">BACK TO OUR WORLD ❤️</button></div>`,
      { wide: true, onClose: () => clearInterval(slideT) });
    const imgs = $$('#slide img'), list = shuffle(srcs);
    const setImg = (im, s) => { im.onerror = () => { im.onerror = null; im.src = __ph(s); }; im.src = s; };
    setImg(imgs[0], list[0]); let cur = 0;
    slideT = setInterval(() => {
      if (!$('#slide')) return clearInterval(slideT);
      slide = (slide + 1) % list.length; const nx = imgs[1 - cur]; setImg(nx, list[slide]);
      imgs[cur].classList.remove('on'); nx.classList.add('on'); cur = 1 - cur;
    }, 2600);
    card.onclick = e => {
      const a = e.target.closest('[data-a]'); if (!a) return;
      Modal.hide();
      if (a.dataset.a === 'again') start(); else CN.App.go('home');
    };
  }

  function init() {
    $('#memGrid').addEventListener('click', e => { const el = e.target.closest('.card'); if (el) pick(el); });
    $$('#memSeg button').forEach(b => b.addEventListener('click', () => { size = +b.dataset.size; SFX.pop(); showSetup(); }));
    $('#memStart').addEventListener('click', () => { SFX.init(); start(); });
    $('#memRestart').addEventListener('click', start);
    $('#memQuit').addEventListener('click', showSetup);
  }

  return {
    init,
    enter() { size = innerWidth >= 900 ? 12 : 8; showSetup(); },
    leave() { token++; clearInterval(timer); playing = false; },
    get playing() { return playing; }
  };
})();
