/* =========================================================
   ACTIVITY 6 — Two Truths & a Lie (about Chirag)
   ========================================================= */
'use strict';

const Truth = CN.Truth = (() => {
  const SETS = [
    { truths: ['Chirag checks his phone one last time before he can fall asleep.', 'Chirag rehearses jokes in his head before he says them out loud.'], lie: 'Chirag has never once lost an argument in his life.' },
    { truths: ['Chirag forgets where he kept his keys at least once a week.', 'Chirag will always offer you the bigger half of anything.'], lie: 'Chirag has never re-read the same message twice.' },
    { truths: ['Chirag secretly loves it when you steal his hoodie.', 'Chirag remembers small things you mention in passing, for weeks.'], lie: 'Chirag has a completely organized, spotless desk at all times.' },
    { truths: ['Chirag hums to himself when he thinks no one is listening.', 'Chirag has definitely built you something just because he wanted to see you smile.'], lie: 'Chirag has never, ever been wrong about directions.' },
    { truths: ['Chirag saves the best bite of food for last.', 'Chirag has a playlist he made thinking of you.'], lie: 'Chirag wakes up early and cheerful with zero coffee, every single day.' },
    { truths: ['Chirag overthinks texts far more than he lets on.', 'Chirag will happily watch the same movie with you for the tenth time.'], lie: 'Chirag has mastered the art of never over-packing for a trip.' },
    { truths: ['Chirag gets a little competitive during board games.', 'Chirag notices immediately when you change something small, like your hair.'], lie: 'Chirag has never once procrastinated on anything, ever.' },
    { truths: ['Chirag keeps old messages from you that made him smile.', 'Chirag will absolutely take the long way if it means more time with you.'], lie: 'Chirag has never lost a single sock in his life.' },
    { truths: ['Chirag gets nervous before things that matter to him, even if he hides it well.', 'Chirag remembers your order everywhere you go.'], lie: 'Chirag has never once needed directions to get anywhere.' },
    { truths: ['Chirag built this entire website instead of just saying "I love you" normally.', 'Chirag definitely tested every single game on here more times than necessary.'], lie: 'Chirag finished this whole website without a single bug.' }
  ];
  const GOOD = ['Correct! You know him too well. 😌❤️', 'Yep — caught the lie! 🕵️‍♀️❤️', 'Exactly right, Mrs. Detective. 👀', 'Nailed it! ❤️'];
  const BAD = ['Nope, that one was actually true! 😅', 'Ooh, close — but that one\'s real. Try the next!', 'Not quite — that one checks out. 🙈'];

  let order = [], round = 0, score = 0, busy = false;

  function pickRound() {
    const s = order[round], opts = shuffle([...s.truths.map(t => ({ t, lie: false })), { t: s.lie, lie: true }]);
    $('#truthCards').innerHTML = opts.map((o, i) => `<button class="opt" data-i="${i}"><i>${String.fromCharCode(65 + i)}</i><span>${o.t}</span></button>`).join('');
    $('#truthCards').dataset.answers = JSON.stringify(opts.map(o => o.lie));
    $('#trRound').textContent = round + 1; $('#trScore').textContent = score;
    $('#truthStatus').textContent = '';
    busy = false;
  }

  async function choose(btn) {
    if (busy) return; busy = true;
    const answers = JSON.parse($('#truthCards').dataset.answers), i = +btn.dataset.i, isLie = answers[i];
    $$('.opt', $('#truthCards')).forEach(b => b.setAttribute('disabled', ''));
    SFX.init();
    if (isLie) {
      score++; btn.classList.add('correct'); SFX.chime();
      const r = btn.getBoundingClientRect(); FX.hearts(r.left + 20, r.top + r.height / 2, 12);
      $('#truthStatus').textContent = pickOne(GOOD);
    } else {
      btn.classList.add('wrong'); SFX.wrong();
      $$('.opt', $('#truthCards')).forEach((b, idx2) => { if (answers[idx2]) b.classList.add('correct'); });
      $('#truthStatus').textContent = pickOne(BAD);
    }
    $('#trScore').textContent = score;
    await sleep(1600);
    round++;
    if (round >= order.length) return finish();
    pickRound();
  }

  async function finish() {
    SFX.win(); FX.confetti(120);
    const line = score >= 4 ? 'You basically read him like a book. 🥹❤️' : score >= 2 ? 'Pretty good! He\'s still a *little* mysterious. 😏' : 'Guess there\'s more to learn about him. 👀❤️';
    const card = Modal.show(`
      <div class="mc-emoji">🎭</div>
      <h3 class="mc-title">${score}/5 Lies Caught!</h3>
      <p class="mc-text">${line}</p>
      <div class="mc-actions"><button class="btn primary" data-a="again">Play again 🔄</button><button class="btn gold" data-a="home">Back to our world ❤️</button></div>`);
    card.onclick = e => { const a = e.target.closest('[data-a]'); if (!a) return; Modal.hide(); if (a.dataset.a === 'again') start(); else CN.App.go('home'); };
  }

  function start() { order = shuffle(SETS).slice(0, 5); round = 0; score = 0; pickRound(); }

  function init() { $('#truthCards').addEventListener('click', e => { const b = e.target.closest('.opt'); if (b) choose(b); }); }

  return { init, enter() { start(); }, leave() { } };
})();
