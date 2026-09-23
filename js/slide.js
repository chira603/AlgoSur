/* =========================================================
   ACTIVITY 5 — Slide Our Photo (8-puzzle)
   ========================================================= */
'use strict';

const Slide = CN.Slide = (() => {
  const SIZE = 3; // 3x3, 8 tiles + 1 blank
  let board = [], src = '', moves = 0, tStart = 0, timer = 0, playing = false, won = false;

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const idx = (r, c) => r * SIZE + c;
  const rc = i => [Math.floor(i / SIZE), i % SIZE];

  function solved() { return board.every((v, i) => (i === board.length - 1 ? v === null : v === i)); }

  function shuffleBoard() {
    board = Array.from({ length: SIZE * SIZE - 1 }, (_, i) => i); board.push(null);
    let blank = board.length - 1;
    for (let n = 0; n < 140; n++) {
      const [br, bc] = rc(blank);
      const opts = [[br - 1, bc], [br + 1, bc], [br, bc - 1], [br, bc + 1]].filter(([r, c]) => r >= 0 && r < SIZE && c >= 0 && c < SIZE);
      const [tr, tc] = pickOne(opts), ti = idx(tr, tc);
      [board[blank], board[ti]] = [board[ti], board[blank]]; blank = ti;
    }
    if (solved()) shuffleBoard();
  }

  function paint() {
    const grid = $('#slideGrid'); grid.classList.toggle('n4', SIZE === 4); grid.classList.toggle('solved', won);
    grid.innerHTML = board.map((v) => {
      if (v === null) return `<button class="stile blank" tabindex="-1" aria-hidden="true"></button>`;
      const [r, c] = rc(v), step = 100 / (SIZE - 1);
      return `<button class="stile" data-v="${v}" style="background-image:url('${src}');background-position:${c * step}% ${r * step}%" aria-label="Puzzle tile"></button>`;
    }).join('');
  }

  function paintStats() {
    $('#slM').textContent = moves; $('#slT').textContent = fmt(playing ? Math.floor((Date.now() - tStart) / 1000) : 0);
  }

  async function move(vi) {
    if (won) return;
    const blank = board.indexOf(null), ti = board.indexOf(vi);
    const [br, bc] = rc(blank), [tr, tc] = rc(ti);
    if (Math.abs(br - tr) + Math.abs(bc - tc) !== 1) { SFX.wrong(); return; }
    [board[blank], board[ti]] = [board[ti], board[blank]]; moves++; SFX.flip(); paint(); paintStats();
    if (solved()) win();
  }

  async function win() {
    won = true; playing = false; clearInterval(timer); paintStats();
    SFX.win(); FX.confetti(150);
    $('#slideStatus').textContent = 'Whole again. ❤️';
    await sleep(700);
    const card = Modal.show(`
      <div class="mc-emoji">🧩</div>
      <h3 class="mc-title">Un-scrambled! ❤️</h3>
      <div class="mem-win-stats" style="grid-template-columns:1fr 1fr">
        <div><b>${moves}</b><small>Moves 👆</small></div>
        <div><b>${$('#slT').textContent}</b><small>Time ⏱️</small></div>
      </div>
      <p class="mc-text">Just like us — a little scrambled sometimes, always finding our way back to the full picture. ❤️</p>
      <div class="mc-actions"><button class="btn primary" data-a="again">New photo 🔄</button><button class="btn gold" data-a="home">Back to our world ❤️</button></div>`);
    card.onclick = e => { const a = e.target.closest('[data-a]'); if (!a) return; Modal.hide(); if (a.dataset.a === 'again') start(); else CN.App.go('home'); };
  }

  function start() {
    clearInterval(timer); won = false; moves = 0; playing = true; tStart = Date.now();
    src = Photos.one(); shuffleBoard(); paint(); paintStats();
    $('#slideStatus').textContent = 'Slide the tiles back into place.';
    timer = setInterval(paintStats, 500);
  }

  function peek() {
    const card = Modal.show(`<div class="mc-emoji">👀</div><h3 class="mc-title" style="font-size:1.4rem">Here's the memory</h3>
      <div class="slideshow" style="height:min(60vh,360px)"><img class="on" src="${src}" alt="Our photo" onerror="this.onerror=null;this.src=__ph('${src}')"></div>
      <div class="mc-actions"><button class="btn primary" data-a="x">Back to sliding</button></div>`, { wide: true });
    card.onclick = e => { if (e.target.closest('[data-a]')) Modal.hide(); };
  }

  function init() {
    $('#slideGrid').addEventListener('click', e => { const b = e.target.closest('.stile[data-v]'); if (b) move(+b.dataset.v); });
    $('#slideShuffle').addEventListener('click', start);
    $('#slidePeek').addEventListener('click', peek);
  }

  return { init, enter() { start(); }, leave() { clearInterval(timer); playing = false; } };
})();
