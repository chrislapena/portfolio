// Case study 3: the clickable Home page prototype.
// Each screen is a 1x export of a Figma frame, shown scaled to the viewport's width (so a 1440px design is drawn at 923px, a 1920px one a bit
// smaller). A screen taller than the viewport scrolls. Invisible buttons sit on the clickable parts and move to the next screen; a click on
// anything else flashes the clickable areas as a hint. Screens whose Figma name ends in "- End" show a "Reset prototype" button.
(function () {
  var root = document.querySelector('[data-proto3]');
  if (!root) return;
  var BASE = (document.currentScript && document.currentScript.src) ? new URL('proto/', document.currentScript.src).href : 'assets/case-study-3/proto/';

  // id: [width, height, isEnd, hotspots]; hotspot: [x, y, w, h, nextScreen, label] in the frame's own pixels
  var S = {
    '10000': [1440, 1634, 0, [
      [745, 97, 655, 50, '10004', 'Ask anything about your Reviews data'],
      [470, 580, 40, 36, '10002', 'Average Star Rating: AI analysis'],
      [180, 902, 250, 34, '8', 'Analyze in Reviews Dashboard'],
      [1330, 6, 38, 38, '9', 'Notifications'],
      [1280, 236, 82, 36, '9', 'View All notifications'],
      [1366, 236, 36, 36, '10', 'Proact notifications menu'],
      [369, 420, 128, 36, '13.1', 'Send Requests'],
      [807, 420, 131, 36, '13.6', 'Draft Response'],
      [1277, 420, 102, 36, '12', 'Force Sync'],
      [1366, 1388, 36, 36, '15', 'Quick Access menu']]],
    '10004': [1440, 1058, 0, [[750, 208, 650, 46, '10005', 'Suggested query']]],
    '10005': [1440, 1058, 0, [[1326, 98, 64, 48, '10003', 'Send question']]],
    '10003': [1440, 1080, 1, []],
    '10002': [1440, 1058, 0, [[180, 902, 250, 34, '8', 'Analyze in Reviews Dashboard'], [746, 576, 38, 36, '10000', 'Close']]],
    '8':     [1920, 3345, 1, []],
    '9':     [1440, 1058, 1, []],
    '10':    [1440, 1058, 0, [[1215, 282, 208, 36, '11', 'Manage Proact notifications']]],
    '11':    [1920, 1058, 0, [[1693, 259, 195, 44, '10006', 'Create Notification']]],
    '10006': [1920, 1056, 0, [[413, 673, 433, 69, '24', 'Quick rule: notify me via email when a 1-star Google review is posted']]],
    '24':    [1920, 1056, 1, []],
    '12':    [1440, 1058, 0, [[1146, 846, 138, 42, '13', 'Force Sync'], [1270, 73, 40, 40, '10000', 'Close']]],
    '13':    [1440, 1058, 1, []],
    '13.1':  [1440, 1058, 0, [
      [1020, 466, 274, 40, '13.4', 'Quick Email Review Request'],
      [1020, 556, 274, 40, '13.2', 'Quick SMS Conversation Review Request'],
      [1270, 226, 40, 40, '10000', 'Close']]],
    '13.4':  [1440, 1177, 0, [[526, 996, 186, 42, '13.5', 'Send Request'], [1326, 37, 40, 40, '10000', 'Close']]],
    '13.5':  [1440, 1058, 1, []],
    '13.2':  [1440, 1183, 0, [[514, 992, 182, 42, '13.3', 'Send Request'], [1330, 59, 40, 40, '10000', 'Close']]],
    '13.3':  [1440, 1058, 1, []],
    '13.6':  [1440, 1058, 0, [[1184, 874, 100, 40, '13.7', 'Respond'], [1263, 104, 40, 40, '10000', 'Close']]],
    '13.7':  [1440, 1058, 1, []],
    '15':    [1440, 1634, 0, [
      [1280, 236, 82, 36, '9', 'View All notifications'],
      [1266, 1434, 156, 40, '16', 'Edit Links']]],
    '16':    [1440, 1058, 0, [[638, 844, 164, 40, '17', 'Add New Link'], [1104, 62, 44, 44, '10000', 'Close']]],
    '17':    [1440, 1058, 0, [[1074, 936, 70, 40, '10001', 'Save'], [1104, 62, 44, 44, '10000', 'Close']]],
    '10001': [1440, 1058, 0, [[316, 252, 44, 44, '19', 'Drag Quick Requests to reorder'], [1104, 62, 44, 44, '10000', 'Close']]],
    '19':    [1440, 1058, 1, []]
  };
  var START = '10000';
  var VER = '?v=12';                      // bump when a screen is re-exported from Figma, so browsers fetch the new picture
  // screens whose white top bar and turquoise side nav stay put while the page content scrolls underneath (the app shell, 50px each in the design)
  var STICKY = { '10000': 1, '15': 1 }, BAR = 50;

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
    // a screen that falls a hair short of the viewport (1-2px) is not cut: its last row of pixels is stretched to fill the gap
    var fill = document.createElement('div'); fill.className = 'p3-fill';
    el.style.setProperty('--fill-img', 'url("' + BASE + 's' + id + '.webp' + VER + '")');
    el.appendChild(fill);
    var fixed = null, fixedTop = null;
    if (STICKY[id]) {
      fixed = document.createElement('div'); fixed.className = 'p3-fixed'; fixed.setAttribute('data-for', id);
      fixed.style.setProperty('--img', 'url("' + BASE + 's' + id + '.webp' + VER + '")');
      fixedTop = document.createElement('div'); fixedTop.className = 'p3-fixed-top';
      var rail = document.createElement('div'); rail.className = 'p3-fixed-left';
      fixed.appendChild(fixedTop); fixed.appendChild(rail);
      fixedTop.addEventListener('click', function (e) {
        if (e.target.closest && e.target.closest('.proto-hot')) return;
        fixedTop.querySelectorAll('.proto-hot').forEach(flash);
      });
      rail.addEventListener('click', function () { fixedTop.querySelectorAll('.proto-hot').forEach(flash); });
    }
    d[3].forEach(function (h) {
      var inBar = STICKY[id] && h[1] + h[3] <= BAR + 2;
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'proto-hot'; b.setAttribute('aria-label', h[5]);
      var hh = inBar ? BAR : d[1];
      b.style.left = (h[0] / d[0] * 100) + '%'; b.style.top = (h[1] / hh * 100) + '%';
      b.style.width = (h[2] / d[0] * 100) + '%'; b.style.height = (h[3] / hh * 100) + '%';
      b.addEventListener('click', function (e) { e.stopPropagation(); go(h[4]); });
      (inBar ? fixedTop : el).appendChild(b);
    });
    if (fixed) root.appendChild(fixed);
    // a click on a dead spot flashes what can be clicked (including the buttons in the fixed top bar)
    el.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('.proto-hot')) return;
      el.querySelectorAll('.proto-hot').forEach(flash);
      if (fixedTop) fixedTop.querySelectorAll('.proto-hot').forEach(flash);
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
  function warm(id) { load(id); S[id][3].forEach(function (h) { load(h[4]); }); }

  // the bars are drawn from the same screenshot, so they need the scrolling area's exact width (it loses a few px when a scrollbar shows)
  function sizeVars() { root.style.setProperty('--p3-w', scroller.clientWidth + 'px'); root.style.setProperty('--p3-sb', (scroller.offsetWidth - scroller.clientWidth) + 'px'); }
  window.addEventListener('resize', sizeVars);
  if (window.ResizeObserver) new ResizeObserver(sizeVars).observe(scroller);

  // the viewport is 923 x 680 at most, but a screen that is shorter than that (once scaled to the width) must not leave white below it:
  // the viewport is cut short to exactly the screen's height instead
  var MAXH = 680 / 923;
  function fit() {
    if (!current) return;
    var w = root.clientWidth, d = S[current];
    var natural = w * d[1] / d[0], cap = w * MAXH, h = Math.min(cap, natural);
    // only a screen that is a hair short (within 1% of the width) is stretched to the full height; a clearly shorter one is cut where it ends
    var gap = natural < cap && cap - natural <= w * 0.01 ? cap - natural : 0;
    if (gap) h = cap;
    root.style.setProperty('--p3-gap', gap + 'px');
    root.style.height = h + 'px';
  }
  window.addEventListener('resize', function () { fit(); sizeVars(); });

  var current = null;
  // a screen is only swapped in once its picture is loaded and decoded, so the viewport never shows a blank (white) frame in between
  var pending = null;
  // every screen you leave is remembered (with its scroll position), so a close (X) button can send you back to where you were
  var hist = [];
  function go(id, forceTop) {
    var back = null;
    if (id === 'back') { back = hist.pop() || { id: START, top: 0 }; id = back.id; }
    else if (forceTop) hist = [];
    if (!S[id]) return;
    var s = screens[id];
    load(id);
    if (s.ready || !s.img.decode) { pending = null; show(id, forceTop, back); return; }
    pending = id;
    var done = function () { s.ready = true; if (pending === id) { pending = null; show(id, forceTop, back); } };
    s.img.decode().then(done, done);
    // safety net: some browsers never settle decode() for a picture that is not on screen yet (e.g. a background tab), which would leave the
    // prototype stuck on a blank screen. Once the picture has loaded, show the screen anyway after a moment.
    var poll = setInterval(function () {
      if (pending !== id) { clearInterval(poll); return; }
      if (s.img.complete && s.img.naturalWidth) { clearInterval(poll); setTimeout(done, 150); }
    }, 100);
  }
  function show(id, forceTop, back) {
    var prev = current, keep = prev && !forceTop && S[prev][0] === S[id][0] && S[prev][1] === S[id][1];
    var top = scroller.scrollTop;
    if (!back && !forceTop && prev && prev !== id) hist.push({ id: prev, top: top });
    load(id);
    Object.keys(screens).forEach(function (k) { screens[k].el.classList.toggle('is-active', k === id); });
    root.querySelectorAll('.p3-fixed').forEach(function (f) { f.classList.toggle('is-active', f.getAttribute('data-for') === id); });
    sizeVars();
    scroller.scrollTop = back ? back.top : keep ? top : 0;
    root.classList.toggle('is-end', !!S[id][2]);
    current = id;
    fit();
    root.setAttribute('data-current', id);
    warm(id);
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

  // review aids: ?hotspots outlines every clickable area, ?screen=13.1 opens a screen directly
  var q = new URLSearchParams(location.search);
  if (q.has("hotspots")) root.classList.add("p3-debug");
  go(S[q.get("screen")] ? q.get("screen") : START, true);
  // fetch and decode every other screen in the background right away, so each click shows its screen instantly
  Object.keys(S).forEach(function (id, i) {
    setTimeout(function () { var s = screens[id]; load(id); if (s.img.decode) s.img.decode().then(function () { s.ready = true; }, function () {}); }, 300 + i * 120);
  });
  if (q.has("screen") || q.has("hotspots")) window.addEventListener("load", function () { setTimeout(function () { root.scrollIntoView({ block: "center" }); }, 400); });
  window.proto3 = { go: go, screens: S };
})();
