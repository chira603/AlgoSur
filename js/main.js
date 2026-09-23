/* =========================================================
   APP — router + boot sequence
   ========================================================= */
'use strict';

const App = CN.App = (() => {
  const mods = { home: Home, heart: HeartGame, wheel: Wheel, memory: Memory, more: null, lock: Lock, slide: Slide, truth: Truth, riddle: Riddles };
  let cur = null, busy = false;

  function moveInd() {
    const on = $('#nav button.on'), ind = $('.nav-ind');
    if (!on || !on.offsetWidth) return;
    ind.style.width = on.offsetWidth + 'px'; ind.style.transform = `translateX(${on.offsetLeft}px)`;
  }
  function show(v) {
    if (cur && mods[cur] && mods[cur].leave) mods[cur].leave();
    $$('.view').forEach(s => s.classList.toggle('active', s.dataset.view === v));
    $$('#nav button').forEach(b => b.classList.toggle('on', b.dataset.go === v));
    cur = v; moveInd(); scrollTo(0, 0);
    if (mods[v] && mods[v].enter) mods[v].enter();
  }
  async function open(v) {
    $('#app').hidden = false; show(v); Surprises.start();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveInd);
  }
  async function go(v) {
    if (v === cur || busy) return; busy = true;
    SFX.pop(); await Wipe.cover(); show(v); await Wipe.reveal(); busy = false;
  }
  document.addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b) go(b.dataset.go); });
  $('#brand').addEventListener('click', () => go('home'));
  addEventListener('resize', moveInd);
  $('#modal').addEventListener('click', e => { if (e.target.id === 'modal') Modal.hide(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') Modal.hide(); });
  return { open, go, get current() { return cur; } };
})();

(async function boot() {
  Gate.init(); HeartGame.init(); Wheel.init(); Memory.init(); Home.init();
  Lock.init(); Slide.init(); Truth.init(); Riddles.init();

  const fill = $('#ldFill'), sub = $('#ldSub'), btn = $('#ldStart');
  let target = 0, shown = 0, loaded = false;
  const lines = ['Setting the mood…', 'Collecting our memories…', 'Hiding a few hearts…', 'Ready ❤️'];
  Photos.preload(p => { target = p; }).then(() => { loaded = true; target = 1; Bg.start(); });

  await new Promise(res => {
    (function tick() {
      shown = Math.min(target, shown + .009);
      fill.setAttribute('y', (92 - 92 * shown).toFixed(1));
      sub.textContent = lines[Math.min(3, Math.floor(shown * 3.99))];
      if (shown >= 1 && loaded) return res();
      requestAnimationFrame(tick);
    })();
  });

  if (!Photos.ok.length) {
    const n = document.createElement('p'); n.className = 'ld-note';
    n.textContent = 'No photos found in the images folder yet — showing placeholders for now.';
    sub.after(n);
  }
  btn.hidden = false; btn.focus({ preventScroll: true });
  btn.addEventListener('click', async () => {
    SFX.init(); Music.start(); SFX.chime();
    const L = $('#loader'); L.classList.add('out');
    $('#gate').hidden = false;
    await sleep(900); L.hidden = true;
  }, { once: true });
})();
