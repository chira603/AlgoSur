# Chirag ❤ Neha — a little world made with love

## 1. Add your photos
Drop your photos into the `images/` folder, named to match exactly:

    images/1.jpeg
    images/2.jpeg
    images/3.jpeg
    ...
    images/38.jpeg

That's it — the site automatically finds every photo that exists (1 through 38) and
uses them everywhere: the home page deck, the floating Polaroids, the photo ribbon,
the "Find My Heart" scene, the Memory matching game, and the Slide puzzle.
Any photo that is missing is skipped, so you don't need all 38 to launch.

If your files are `.jpg` or `.png` instead of `.jpeg`, open `js/core.js` and change
this line near the top:

    photoExt: 'jpeg',

**Which photo shows as "Neha" in the big heart reveals?**
Open `js/core.js` and edit this line with the photo numbers that are good, clear
photos of Neha (the site picks randomly among the ones you list):

    nehaPhotos: [1],

## 2. Music
`audio/bgm.mp3` is an original, royalty-free romantic piano loop generated just for
this site — it's yours to keep and it loops seamlessly in the background (with a
mute/unmute button in the top-right corner). To use your own song instead, just
replace that file with another MP3 named `bgm.mp3`.

## 3. Open it
Because the site loads photos and audio from files, most browsers want it served
over a tiny local server rather than opened directly as `file://`. Easiest options:

- **Double‑click `index.html`** — works in most browsers today, but if photos don't
  load, use one of the options below instead.
- **VS Code**: install the "Live Server" extension, right-click `index.html` →
  "Open with Live Server".
- **Python** (if installed): open a terminal in this folder and run
  `python3 -m http.server 8000`, then visit `http://localhost:8000` in your browser.
- **Deploy it for free**: drag this whole folder onto
  [Netlify Drop](https://app.netlify.com/drop) or use GitHub Pages — either gives
  you a real link you can send to Neha.

## 4. What's inside
- `index.html` — the whole app shell
- `css/style.css` — every style, animation and the color palette
- `js/core.js` — shared helpers, photo loading, particles, sound effects, music
- `js/gate.js` — the entry "whose heart..." question
- `js/heart.js` — Find Chirag's Heart (hidden-heart scene + secret 5th heart)
- `js/wheel.js` — Spin Our Love wheel
- `js/memory.js` — Match Our Memories card game
- `js/lock.js` — Crack the Code (riddle padlock)
- `js/slide.js` — Slide Our Photo (sliding tile puzzle)
- `js/truth.js` — Two Truths & a Lie
- `js/riddles.js` — Love Riddles chain
- `js/home.js` — home page deck/ribbon + tiny surprise interactions
- `js/main.js` — router + boot sequence
- `audio/bgm.mp3` — background music (replace anytime)

Everything is plain HTML/CSS/JS — no build step, no dependencies, works offline
once opened. Fully responsive, and every game reshuffles/randomizes each time you
play, so it never feels exactly the same twice. Enjoy! ❤️
