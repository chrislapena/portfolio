// Case study 2: the clickable "Mapping -> Templates" prototype (Chain Data Transformations).
// Same engine as the Home page prototype (case study 3): each screen is an export of a Figma frame (1440 x 960 design, shown at the viewport's width).
// Invisible buttons sit on the clickable parts and move to the next screen; a click on anything else flashes the clickable areas as a hint.
// The last screen shows a "Reset prototype" button. P12 moves on to P13 by itself after 2 seconds (the rest of the fields get mapped).
(function () {
  var root = document.querySelector('[data-proto2]');
  if (!root) return;
  var BASE = (document.currentScript && document.currentScript.src) ? new URL('proto/', document.currentScript.src).href : 'assets/case-study-2/proto/';

  // id: [width, height, isEnd, hotspots, auto]; hotspot: [x, y, w, h, nextScreen, label] in the frame's own pixels; auto: [milliseconds, nextScreen]
  var S = {
    'P00':  [1440, 960, 0, [[979, 285, 57, 32, 'P01', 'Start Mapping']]],
    'P01':  [1440, 960, 0, [[628, 428, 280, 46, 'P02', 'Appointment type: pick a source']]],
    'P02':  [1440, 960, 0, [[630, 614, 276, 36, 'P03', 'Dynamic Mapping']]],
    'P03':  [1440, 960, 0, [[1351, 912, 61, 32, 'P04', 'Apply']]],
    'P04':  [1440, 960, 0, [[928, 436, 56, 26, 'P05', 'Add an edit']]],
    'P05':  [1440, 960, 0, [[986, 266, 70, 24, 'P06', 'Add Edit']]],
    'P06':  [1440, 960, 0, [[984, 668, 232, 48, 'P07', 'Split']]],
    'P07':  [1440, 960, 0, [[854, 380, 70, 26, 'P08', 'Add Edit']]],
    'P08':  [1440, 960, 0, [[852, 731, 234, 52, 'P09', 'Lookup']]],
    'P09':  [1440, 960, 0, [[854, 575, 70, 26, 'P10', 'Add Edit']]],
    'P10':  [1440, 960, 0, [[852, 666, 234, 52, 'P11', 'lowercase']]],
    'P11':  [1440, 960, 0, [[1356, 912, 56, 32, 'P12', 'Save']]],
    'P12':  [1440, 960, 0, [], [2000, 'P13']],
    'P13':  [1440, 960, 0, [[1292, 912, 92, 32, 'P13b', 'Finish Step']]],
    'P13b': [1440, 960, 0, [[979, 387, 57, 32, 'P14', 'Start Templates']]],
    'P14':  [1440, 960, 0, [[626, 138, 150, 22, 'P15', 'Use dynamic templates']]],
    'P15':  [1440, 960, 0, [[1292, 912, 92, 32, 'P16', 'Finish Step']]],
    'P16':  [1440, 960, 1, []]
  };
  var START = 'P00';
  var VER = '?v=7';                       // bump when a screen is re-exported from Figma, so browsers fetch the new picture

  function flash(b) {
    b.classList.remove('proto-flash'); void b.offsetWidth; b.classList.add('proto-flash');
    setTimeout(function () { b.classList.remove('proto-flash'); }, 1000);
  }

  var scroller = document.createElement('div');
  scroller.className = 'p3-scroll';
  root.appendChild(scroller);
  var screens = {};

  Object.keys(S).forEach(function (id) {
    var d = S[id], el = document.createElement('div');
    el.className = 'p3-screen'; el.setAttribute('data-screen', id);
    var img = document.createElement('img');
    img.alt = 'Prototype screen ' + id; img.width = d[0]; img.height = d[1]; img.draggable = false;
    img.decoding = 'async';
    el.appendChild(img);
    d[3].forEach(function (h) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'proto-hot'; b.setAttribute('aria-label', h[5]);
      b.style.left = (h[0] / d[0] * 100) + '%'; b.style.top = (h[1] / d[1] * 100) + '%';
      b.style.width = (h[2] / d[0] * 100) + '%'; b.style.height = (h[3] / d[1] * 100) + '%';
      b.addEventListener('click', function (e) { e.stopPropagation(); go(h[4]); });
      el.appendChild(b);
    });
    // a click on a dead spot flashes what can be clicked
    el.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('.proto-hot')) return;
      el.querySelectorAll('.proto-hot').forEach(flash);
    });
    scroller.appendChild(el);
    screens[id] = { el: el, img: img, loaded: false };
  });

  var reset = document.createElement('button');
  reset.type = 'button'; reset.className = 'p3-reset';
  reset.textContent = 'Reset Prototype';
  reset.addEventListener('click', function () { go(START, true); });
  root.appendChild(reset);

  function load(id) { var s = screens[id]; if (s && !s.loaded) { s.loaded = true; s.img.src = BASE + 's' + id + '.webp' + VER; } }
  function warm(id) { load(id); S[id][3].forEach(function (h) { load(h[4]); }); if (S[id][4]) load(S[id][4][1]); }

  // the viewport is as tall as the screens (1440 x 960 scaled to its width)
  function fit() {
    if (!current) return;
    root.style.height = (root.clientWidth * S[current][1] / S[current][0]) + 'px';
  }
  window.addEventListener('resize', fit);

  var current = null, autoTimer = null;
  // a screen is only swapped in once its picture is loaded and decoded, so the viewport never shows a blank (white) frame in between
  var pending = null;
  function go(id, forceTop) {
    if (!S[id]) return;
    clearTimeout(autoTimer);
    var s = screens[id];
    load(id);
    if (s.ready || !s.img.decode) { pending = null; show(id); return; }
    pending = id;
    var done = function () { s.ready = true; if (pending === id) { pending = null; show(id); } };
    s.img.decode().then(done, done);
    // safety net: some browsers never settle decode() for a picture that is not on screen yet (e.g. a background tab)
    var poll = setInterval(function () {
      if (pending !== id) { clearInterval(poll); return; }
      if (s.img.complete && s.img.naturalWidth) { clearInterval(poll); setTimeout(done, 150); }
    }, 100);
  }
  function show(id) {
    load(id);
    Object.keys(screens).forEach(function (k) { screens[k].el.classList.toggle('is-active', k === id); });
    scroller.scrollTop = 0;
    root.classList.toggle('is-end', !!S[id][2]);
    current = id;
    fit();
    root.setAttribute('data-current', id);
    warm(id);
    clearTimeout(autoTimer);
    if (S[id][4]) autoTimer = setTimeout(function () { if (current === id) go(S[id][4][1]); }, S[id][4][0]);
  }

  // press R to restart (only while the prototype is on screen, never with a modifier or while typing)
  document.addEventListener('keydown', function (e) {
    if ((e.key !== 'r' && e.key !== 'R') || e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
    var t = e.target && e.target.tagName;
    if (t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT' || (e.target && e.target.isContentEditable)) return;
    var r = root.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return;
    go(START, true);
  });

  // review aids: ?hotspots outlines every clickable area, ?screen=P08 opens a screen directly
  var q = new URLSearchParams(location.search);
  if (q.has('hotspots')) root.classList.add('p3-debug');
  go(S[q.get('screen')] ? q.get('screen') : START, true);
  // fetch and decode every other screen in the background right away, so each click shows its screen instantly
  Object.keys(S).forEach(function (id, i) {
    setTimeout(function () { var s = screens[id]; load(id); if (s.img.decode) s.img.decode().then(function () { s.ready = true; }, function () {}); }, 300 + i * 120);
  });
  if (q.has('screen') || q.has('hotspots')) window.addEventListener('load', function () { setTimeout(function () { root.scrollIntoView({ block: 'center' }); }, 400); });
  window.proto2 = { go: go, screens: S };
})();
