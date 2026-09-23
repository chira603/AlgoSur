/* =========================================================
   ACTIVITY 2 — Spin Our Love
   ========================================================= */
'use strict';

const Wheel = CN.Wheel = (() => {
  const PRIZES = [
    { e: '❤️', l: ['Unlimited', 'Hugs'],      t: 'UNLIMITED HUGS',        owe: 'unlimited hugs' },
    { e: '💋', l: ['10', 'Kisses'],           t: '10 KISSES',             owe: '10 kisses' },
    { e: '🍫', l: ['Favourite', 'Chocolate'], t: 'YOUR FAVOURITE CHOCOLATE', owe: 'your favourite chocolate' },
    { e: '🍦', l: ['Ice Cream', 'Date'],      t: 'ICE CREAM DATE',        owe: 'an ice cream date' },
    { e: '☕', l: ['Coffee', 'Date'],         t: 'COFFEE DATE',           owe: 'a coffee date' },
    { e: '🎬', l: ['Movie', 'Night'],         t: 'MOVIE NIGHT',           owe: 'a movie date' },
    { e: '🍽️', l: ['Dinner', 'Date'],         t: 'DINNER DATE',           owe: 'a dinner date' },
    { e: '🛍️', l: ['Shopping', 'Treat'],      t: 'SHOPPING TREAT',        owe: 'a shopping treat' },
    { e: '🤗', l: ['One Long', 'Hug'],        t: 'ONE LONG HUG',          owe: 'one very long hug' },
    { e: '📸', l: ['Cute Photo', 'Date'],     t: 'CUTE PHOTO DATE',       owe: 'a cute photo date' },
    { e: '👑', l: ['Princess', 'Treatment'],  t: 'PRINCESS TREATMENT',    owe: 'the full princess treatment' },
    { e: '💌', l: ['Husband\'s', 'Surprise'], t: 'A SURPRISE FROM YOUR HUSBAND', owe: 'a surprise' }
  ];
  const N = PRIZES.length, SEG = 360 / N;
  const COLORS = [
    ['#6d0f2b', '#fff4ea'], ['#e8577f', '#ffffff'], ['#ffe1e6', '#5c1029'],
    ['#a3193f', '#fff4ea'], ['#f7a1b7', '#3f0b1d'], ['#fff4ea', '#7d1637']
  ];
  const mod = (a, b) => ((a % b) + b) % b;
  let cv, ctx, wrap, angle = 0, spinning = false, cancel = false, lastIdx = -1;
  let claims = store.get('claims', []);

  function draw() {
    const size = wrap.clientWidth * .86;
    if (!size) return;
    const dpr = Math.min(devicePixelRatio || 1, 3);
    cv.width = cv.height = Math.round(size * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, size, size);
    const c = size / 2, R = c - 1;
    for (let i = 0; i < N; i++) {
      const a0 = -Math.PI / 2 + i * SEG * Math.PI / 180, a1 = a0 + SEG * Math.PI / 180, [bg, fg] = COLORS[i % COLORS.length];
      ctx.beginPath(); ctx.moveTo(c, c); ctx.arc(c, c, R, a0, a1); ctx.closePath(); ctx.fillStyle = bg; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(246,215,139,.9)'; ctx.stroke();
      ctx.save(); ctx.translate(c, c); ctx.rotate((a0 + a1) / 2);
      const fs = Math.max(11.5, R * .078);
      ctx.fillStyle = fg; ctx.font = `700 ${fs}px Figtree,system-ui,sans-serif`; ctx.textBaseline = 'middle'; ctx.textAlign = 'right';
      ctx.fillText(PRIZES[i].l[0], R * .70, -fs * .58); ctx.fillText(PRIZES[i].l[1], R * .70, fs * .58);
      ctx.textAlign = 'center'; ctx.font = `${R * .15}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
      ctx.fillText(PRIZES[i].e, R * .85, 0);
      ctx.restore();
    }
    const g = ctx.createRadialGradient(c, c, R * .2, c, c, R);
    g.addColorStop(0, 'rgba(255,255,255,.10)'); g.addColorStop(.75, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.22)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(c, c, R, 0, 6.283); ctx.fill();
    ctx.beginPath(); ctx.arc(c, c, R * .2, 0, 6.283); ctx.fillStyle = '#3f0b1d'; ctx.fill();
  }

  const setRot = a => { cv.style.transform = `rotate(${a}deg)`; };
  const idxAt = a => Math.floor(mod(-a, 360) / SEG) % N;
  const easeOut = p => 1 - Math.pow(1 - p, 4);
  const easeIO = p => p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;

  function flap() { const p = $('#pointer'); p.classList.remove('tick'); void p.offsetWidth; p.classList.add('tick'); }

  function spin() {
    if (spinning || Modal.open) return;
    SFX.init(); spinning = true; cancel = false;
    const btn = $('#spinBtn'), status = $('#wheelStatus');
    btn.disabled = true; wrap.classList.add('spinning');
    status.textContent = 'Let\'s see what Mrs. Neha gets today... 👀';

    const win = irand(0, N - 1), jitter = rand(-9, 9);
    const desired = mod(-(win + .5) * SEG + jitter, 360), delta = mod(desired - mod(angle, 360), 360);
    const total = irand(6, 9) * 360 + delta, over = rand(2.2, 4.6), start = angle;
    const D1 = 7000, D2 = 650, t0 = performance.now();
    lastIdx = idxAt(angle);

    function frame(now) {
      if (cancel) { spinning = false; wrap.classList.remove('spinning'); btn.disabled = false; return; }
      const t = now - t0; let a;
      if (t < D1) a = start + (total + over) * easeOut(t / D1);
      else a = start + total + over - over * easeIO(Math.min(1, (t - D1) / D2));
      setRot(a);
      const ix = idxAt(a); if (ix !== lastIdx) { lastIdx = ix; flap(); SFX.tick(); }
      if (t < D1 + D2) return requestAnimationFrame(frame);
      angle = mod(start + total, 360); setRot(angle); done(idxAt(angle));
    }
    requestAnimationFrame(frame);
  }

  function done(i) {
    const p = PRIZES[i];
    wrap.classList.remove('spinning');
    $('#wheelStatus').textContent = `${p.e} ${p.l.join(' ')}!`;
    SFX.win(); FX.confetti(170); FX.rise(2200, 14);
    const card = Modal.show(`
      <div class="mc-emoji">${p.e}</div>
      <h3 class="mc-title">${p.t}! ❤️</h3>
      <p class="mc-text" id="wrText">Congratulations Mrs. Neha...<br>Your husband officially owes you ${p.owe} now. 😌❤️</p>
      <div class="mc-actions" id="wrActions"><button class="btn primary big" data-a="claim">Claim From Husband 😏</button></div>`,
      { onClose: () => { spinning = false; $('#spinBtn').disabled = false; } });
    card.onclick = e => {
      const a = e.target.closest('[data-a]'); if (!a) return;
      if (a.dataset.a === 'claim') {
        claims.push({ e: p.e, t: p.l.join(' ') }); claims = claims.slice(-12); store.set('claims', claims); renderClaims();
        SFX.chime(); FX.confetti(70);
        $('#wrText').innerHTML = 'Claim registered successfully. 😂❤️<br><b>Chirag cannot escape now!</b>';
        $('#wrActions').className = 'mc-actions row';
        $('#wrActions').innerHTML = '<button class="btn primary" data-a="again">Spin again 🎡</button><button class="btn ghost" data-a="close">Close</button>';
      } else if (a.dataset.a === 'again') { Modal.hide(); setTimeout(spin, 350); }
      else Modal.hide();
    };
  }

  function renderClaims() {
    $('#claims').hidden = !claims.length;
    $('#claimList').innerHTML = claims.map(c => `<li>${c.e} ${c.t}</li>`).join('');
  }

  function init() {
    cv = $('#wheel'); ctx = cv.getContext('2d'); wrap = $('#wheelWrap');
    $('#rim').innerHTML = Array.from({ length: 20 }, (_, i) => `<i class="bl" style="--a:${i * 18}deg"></i>`).join('');
    $('#spinBtn').addEventListener('click', spin);
    $('#hub').addEventListener('click', spin);
    new ResizeObserver(draw).observe(wrap);
    renderClaims();
  }

  return {
    init,
    enter() { draw(); setRot(angle); $('#wheelStatus').innerHTML = '&nbsp;'; renderClaims(); },
    leave() { cancel = true; }
  };
})();
