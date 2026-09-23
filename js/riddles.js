/* =========================================================
   ACTIVITY 7 — Love Riddles (a little riddle chain)
   ========================================================= */
'use strict';

const Riddles = CN.Riddles = (() => {
  const POOL = [
    { q: 'The more you take, the more you leave behind. What am I?', opts: ['Footsteps', 'Memories', 'Time', 'Shadows'], a: 0 },
    { q: 'I have keys but open no locks, space but no rooms. What am I?', opts: ['A map', 'A keyboard', 'A piano', 'A house'], a: 1 },
    { q: 'What has a heart, yet it never actually beats?', opts: ['A deck of cards', 'A clock', 'A statue', 'A robot'], a: 0 },
    { q: 'The more you feed me, the bigger I grow. But give me water, and I\'ll die. What am I?', opts: ['A plant', 'Fire', 'A rumor', 'A balloon'], a: 1 },
    { q: 'What comes once in a minute, twice in a moment, but never in a thousand years?', opts: ['The letter M', 'A heartbeat', 'A second', 'Midnight'], a: 0 },
    { q: 'I\'m light as a feather, yet even the strongest person can\'t hold me for more than a few minutes. What am I?', opts: ['A secret', 'Breath', 'A smile', 'A whisper'], a: 1 },
    { q: 'What has hands, but can never clap?', opts: ['A glove', 'A statue', 'A clock', 'A puppet'], a: 2 },
    { q: 'I follow you all day like a loyal friend, but disappear the moment the sun is gone. What am I?', opts: ['A dream', 'Your shadow', 'A memory', 'A promise'], a: 1 },
    { q: 'What can travel around the whole world while staying in one corner?', opts: ['A letter (stamp)', 'A satellite', 'A map', 'A song'], a: 0 },
    { q: 'The more of me there is, the less you see. What am I?', opts: ['Darkness', 'Fog', 'Silence', 'Distance'], a: 0 }
  ];
  const YAY = ['Correct! Sharp mind. 🧠❤️', 'Yes! Exactly that. 😌', 'Got it! Onwards. ❤️', 'That\'s the one! ✨'];
  const NAY = ['Not quite... think again. 👀', 'Ooh, close, but no. Try once more.', 'Hmm, that\'s not it. One more guess!'];

  let order = [], i = 0, busy = false;

  function render() {
    const r = order[i];
    $('#rdNum').textContent = i + 1;
    $('#riddleCard').textContent = r.q;
    const opts = r.opts.map((t, k) => ({ t, k })), shuffled = shuffle(opts);
    $('#riddleOpts').innerHTML = shuffled.map(o => `<button class="opt" data-k="${o.k}"><i>${String.fromCharCode(65 + shuffled.indexOf(o))}</i><span>${o.t}</span></button>`).join('');
    $('#riddleStatus').textContent = ''; busy = false;
  }

  async function choose(btn) {
    if (busy) return;
    const r = order[i], k = +btn.dataset.k;
    SFX.init();
    if (k === r.a) {
      busy = true; btn.classList.add('correct'); SFX.chime();
      const rect = btn.getBoundingClientRect(); FX.hearts(rect.left + 20, rect.top + rect.height / 2, 12);
      $('#riddleStatus').textContent = pickOne(YAY);
      $$('.opt', $('#riddleOpts')).forEach(b => b.setAttribute('disabled', ''));
      await sleep(1100);
      i++;
      if (i >= order.length) return finish();
      render();
    } else {
      btn.classList.add('wrong'); SFX.wrong(); if (navigator.vibrate) navigator.vibrate(40);
      $('#riddleStatus').textContent = pickOne(NAY);
      setTimeout(() => btn.classList.remove('wrong'), 900);
    }
  }

  async function finish() {
    SFX.win(); FX.confetti(140); FX.rise(2200, 12);
    const card = Modal.show(`
      <div class="mc-emoji">💭</div>
      <h3 class="mc-title">Five for Five! 🥹❤️</h3>
      <p class="mc-text">You solved every riddle... but honestly, the easiest thing to figure out in this whole world was always this:</p>
      <p class="mc-text" style="font-family:var(--serif);font-style:italic;font-size:1.2rem;color:var(--gold-2)">Chirag's heart chose Neha's heart. ❤️</p>
      <div class="mc-actions"><button class="btn primary" data-a="again">Play again 🔄</button><button class="btn gold" data-a="home">Back to our world ❤️</button></div>`);
    card.onclick = e => { const a = e.target.closest('[data-a]'); if (!a) return; Modal.hide(); if (a.dataset.a === 'again') start(); else CN.App.go('home'); };
  }

  function start() { order = shuffle(POOL).slice(0, 5); i = 0; render(); }

  function init() { $('#riddleOpts').addEventListener('click', e => { const b = e.target.closest('.opt'); if (b) choose(b); }); }

  return { init, enter() { start(); }, leave() { } };
})();
