/* =========================================================
   ACTIVITY 4 — Crack the Code (a little logic padlock)
   ========================================================= */
'use strict';

const Lock = CN.Lock = (() => {
  const WORDS = ['first', 'second', 'third', 'fourth'];
  let target = [], vals = [0, 0, 0, 0], solved = false, hintN = 0;

  function digitRiddle() {
    const x = irand(0, 9), kind = irand(0, 3);
    if (kind === 0) { const c = x * 2; return { text: `Double me and you get ${c}. What number am I?`, x }; }
    if (kind === 1) { const a = irand(2, 3), b = irand(0, 5), c = a * x + b; return { text: `Multiply me by ${a}, then add ${b}, and you land on ${c}. What number am I?`, x }; }
    if (kind === 2) { const b = x + irand(1, 9), c = b - x; return { text: `${b} minus me equals ${c}. What number am I?`, x }; }
    if (x > 0 && x < 9) return { text: `I come right after ${x - 1} and right before ${x + 1}. What number am I?`, x };
    const c = x * 3; return { text: `Triple me and you get ${c}. What number am I?`, x };
  }

  function newCode() {
    solved = false; hintN = 0; vals = [0, 0, 0, 0];
    const riddles = Array.from({ length: 4 }, digitRiddle);
    target = riddles.map(r => r.x);
    $('#lockRiddles').innerHTML = riddles.map((r, i) => `<div class="lock-clue"><i>${WORDS[i][0].toUpperCase()}</i><span><b>${WORDS[i]} digit:</b> ${r.text}</span></div>`).join('');
    $('#lockDial').classList.remove('win', 'shake');
    $('#lockStatus').textContent = '';
    paint();
  }

  function paint() {
    $('#lockDial').innerHTML = vals.map((v, i) => `
      <div class="digit">
        <button data-d="${i}" data-dir="1" aria-label="Increase digit ${i + 1}">▲</button>
        <div class="dv">${v}</div>
        <button data-d="${i}" data-dir="-1" aria-label="Decrease digit ${i + 1}">▼</button>
      </div>`).join('');
  }

  function bump(i, dir) {
    if (solved) return;
    vals[i] = (vals[i] + dir + 10) % 10; SFX.tick(); paint();
  }

  function tryOpen() {
    if (solved) return;
    SFX.init();
    const ok = vals.every((v, i) => v === target[i]);
    if (ok) {
      solved = true; $('#lockDial').classList.add('win'); SFX.win(); FX.confetti(150); FX.rise(2200, 12);
      $('#lockStatus').textContent = 'The lock clicks open... ❤️';
      const card = Modal.show(`
        <div class="mc-emoji">🔓</div>
        <h3 class="mc-title">You cracked it! 😳❤️</h3>
        <p class="mc-text">Somewhere between logic and love, you found the code...<br>and honestly, that's kind of how you found your way into Chirag's heart too. ♾️</p>
        <div class="mc-actions"><button class="btn primary" data-a="again">Crack another 🔄</button><button class="btn gold" data-a="home">Back to our world ❤️</button></div>`);
      card.onclick = e => { const a = e.target.closest('[data-a]'); if (!a) return; Modal.hide(); if (a.dataset.a === 'again') newCode(); else CN.App.go('home'); };
    } else {
      const d = $('#lockDial'); d.classList.remove('shake'); void d.offsetWidth; d.classList.add('shake'); SFX.wrong();
      $('#lockStatus').textContent = 'Not quite the right code... read the riddles again. 🔍';
    }
  }

  function hint() {
    if (solved) return;
    if (hintN >= target.length) { $('#lockStatus').textContent = 'That\'s all the hints I\'ve got. 😉'; return; }
    vals[hintN] = target[hintN]; paint(); SFX.pop();
    $('#lockStatus').textContent = `Digit ${WORDS[hintN]} set for you. ${hintN + 1 < target.length ? 'One more to figure out yourself!' : 'Just hit unlock!'}`;
    hintN++;
  }

  function init() {
    $('#lockDial').addEventListener('click', e => { const b = e.target.closest('button[data-d]'); if (b) bump(+b.dataset.d, +b.dataset.dir); });
    $('#lockOpen').addEventListener('click', tryOpen);
    $('#lockHint').addEventListener('click', hint);
    $('#lockNew').addEventListener('click', () => { newCode(); toast('Fresh riddles, fresh code. 🔐', 2200); });
  }

  return { init, enter() { if (!target.length) newCode(); }, leave() { } };
})();
