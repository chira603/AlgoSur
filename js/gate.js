/* =========================================================
   ENTRY — "Whose heart does Chirag love the most?"
   ========================================================= */
'use strict';

const Gate = CN.Gate = (() => {
  const msgs = {
    A: [
      'Awww, that\'s sweet... but wrong! 😜❤️<br>Chirag has a much bigger ego than that.',
      'Nice try, Neha! 😌 Chirag will happily <i>say</i> that... but it\'s not today\'s answer.'
    ],
    C: [
      'No One?! 😳 Chirag has a heart, you know!<br>Try again, dear. ❤️',
      'Hmm... that would make Chirag very lonely. 🥺 Try again!'
    ],
    D: [
      'Everyone?! 😂 He isn\'t <i>that</i> generous.<br>Think again, dear! ❤️',
      'Chirag\'s heart isn\'t a public park. 😜 Try again!'
    ],
    any: [
      'Awww... wrong answer, dear! 😜❤️<br>Think again... You know Chirag better than that!',
      'Nope nope nope! 😂 Somebody\'s not paying attention. Try again!',
      'Hmm... suspicious answer, Mrs. Detective. 👀 Think harder!',
      'Wrong, but cute. 🥰 One more try!',
      'Oops! That\'s not what Chirag would say. 😜 Go on, try again.',
      'Close... but no. 🙈 Chirag is watching, you know!'
    ]
  };
  let attempts = 0, locked = false, lastMsg = '';
  const opts = $('#gateOpts'), msgEl = $('#gateMsg'), stack = $('#gStack');

  function say(html, cls = '') {
    const d = document.createElement('div');
    d.className = 'g-line ' + cls; d.innerHTML = html; stack.appendChild(d);
    requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add('in')));
    $$('.g-line', stack).slice(0, -2).forEach(l => l.classList.add('gone'));
    return d;
  }

  async function choose(btn) {
    if (locked) return;
    SFX.init(); SFX.pop();
    const k = btn.dataset.k;
    if (k === 'B') return correct(btn);
    attempts++; locked = true;
    btn.classList.remove('shake'); void btn.offsetWidth; btn.classList.add('shake', 'wrong'); SFX.wrong();
    if (navigator.vibrate) navigator.vibrate(60);
    let pool = (msgs[k] || []).concat(msgs.any), m = pickOne(pool), tries = 0;
    while (m === lastMsg && tries++ < 6) m = pickOne(pool);
    lastMsg = m;
    if (attempts >= 3) m += '<br><small style="opacity:.8">Psst... it\'s the guy who built this whole world. 😏</small>';
    msgEl.classList.remove('show'); void msgEl.offsetWidth; msgEl.innerHTML = m; msgEl.classList.add('show');
    await sleep(600); btn.classList.remove('shake'); locked = false;
    setTimeout(() => btn.classList.remove('wrong'), 1400);
  }

  async function correct(btn) {
    locked = true;
    btn.classList.add('on'); SFX.chime();
    const r = btn.getBoundingClientRect(); FX.burst(r.left + r.width / 2, r.top + r.height / 2, 30);
    FX.confetti(170); FX.rise(3200, 16);
    await sleep(500);
    $('#gateAsk').classList.add('gone');
    await sleep(700);
    say('Correct! 😂❤️', 'big');
    await sleep(2100);
    say('Chirag loves his own heart the most...');
    await sleep(2600);
    say('Do you know why? 👀', 'soft');
    await sleep(2300);
    say('Because his heart chose <b>YOUR</b> heart, Neha. ❤️', 'big');
    SFX.chime(); FX.burst(innerWidth / 2, innerHeight * .4, 22);
    await sleep(3200);
    say('So loving his heart means loving you too. ♾️❤️', 'soft');
    await sleep(3000);
    $$('.g-line', stack).forEach(l => l.classList.add('gone'));
    await sleep(700);
    stack.hidden = true;
    const fin = $('#gFinal');
    $('#gFrame').innerHTML = heartFrame(Photos.neha());
    fin.hidden = false; SFX.win(); FX.confetti(90);
    fin.querySelector('#gEnter').focus({ preventScroll: true });
  }

  function init() {
    $$('.opt', opts).forEach(b => b.addEventListener('click', () => choose(b)));
    $('#gEnter').addEventListener('click', enter);
  }

  async function enter() {
    SFX.chime(); FX.burst(innerWidth / 2, innerHeight * .7, 26);
    await Wipe.cover();
    $('#gate').hidden = true;
    await CN.App.open('home');
    await Wipe.reveal();
  }

  return { init };
})();
