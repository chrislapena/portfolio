// Case study 3: the clickable Home page prototype.
// Each screen is a 1x export of a Figma frame, shown scaled to the viewport's width (so a 1440px design is drawn at 923px, a 1920px one a bit
// smaller). A screen taller than the viewport scrolls. Invisible buttons sit on the clickable parts and move to the next screen; a click on
// anything else flashes the clickable areas as a hint. Screens whose Figma name ends in "- End" show a "Reset prototype" button.
(function () {
  var root = document.querySelector('[data-proto3]');
  if (!root) return;
  var BASE = (document.currentScript && document.currentScript.src) ? new URL('proto2/', document.currentScript.src).href : 'assets/case-study-3/proto2/';

  // id: [width, height, isEnd, hotspots]; hotspot: [x, y, w, h, nextScreen, label] in the design's 1440px space.
  // R() takes the corners of a button measured on the 2000px-wide exports (1440 x 1.389) and converts them. 'back' returns to the screen you came from, 'home' to the start.
  function R(x0, y0, x1, y1, next, label) { var k = 0.72; return [x0 * k, y0 * k, (x1 - x0) * k, (y1 - y0) * k, next, label]; }
  var S = {
    'home': [1440, 1390, 0, [
      R(767, 33, 1567, 94, 'search', 'Ask RepIQ'),
      R(1846, 547, 1890, 589, 'widget', 'Review Breakdown: AI analysis'),
      R(620, 1640, 950, 1695, 'dash', 'Analyze in Reviews Dashboard'),
      R(1840, 1785, 1910, 1840, 'qa1', 'Edit Quick Access')]],
    'widget': [1440, 1058, 0, [R(1855, 612, 1893, 650, 'back', 'Close')]],
    'notifs': [1440, 1058, 0, [
      R(790, 563, 832, 603, 'menu', 'Notification options'),
      R(843, 563, 877, 600, 'back', 'Close'),
      R(696, 803, 858, 847, 'draft', 'Draft Response'),
      R(699, 1019, 858, 1063, 'volume', 'Send Requests'),
      R(731, 1236, 858, 1280, 'phone', 'Force Sync')]],
    'menu': [1440, 1058, 0, [
      R(500, 610, 832, 650, 'notifs', 'Mark All as Read'),
      R(500, 660, 832, 708, 'settings', 'Manage Proactive Notifications'),
      R(500, 710, 832, 758, 'settings', 'Notification Settings'),
      R(788, 560, 832, 604, 'notifs', 'Close menu'),
      R(843, 563, 877, 600, 'back', 'Close')]],
    'search': [1440, 1058, 0, [
      R(767, 34, 1566, 94, 'typing', 'Search field'),
      R(780, 178, 1552, 221, 'ask', 'What are the most common issues customers mention?')]],
    'typing': [1440, 1058, 0, [
      R(780, 176, 1552, 221, 'ask', 'What are the most common issues customers mention?'),
      R(1510, 40, 1558, 88, 'ask', 'Send question')]],
    'ask': [1440, 1058, 1, [R(22, 150, 310, 195, 'home', 'Home')]],
    'qa1': [1440, 1058, 0, [
      R(606, 540, 634, 584, 'qa2', 'Drag Quick requests to reorder'),
      R(606, 1040, 676, 1070, 'qa3', 'Add Link'),
      R(1380, 335, 1410, 365, 'home', 'Close'),
      R(1220, 1112, 1316, 1155, 'home', 'Cancel'),
      R(1328, 1111, 1405, 1155, 'home', 'Save')]],
    'qa2': [1440, 1058, 0, [
      R(606, 1048, 676, 1078, 'qa3', 'Add Link'),
      R(1380, 326, 1410, 356, 'home', 'Close'),
      R(1220, 1120, 1316, 1163, 'home', 'Cancel'),
      R(1328, 1119, 1405, 1163, 'home', 'Save')]],
    'qa3': [1440, 1058, 0, [
      R(1328, 1170, 1405, 1215, 'qa4', 'Save'),
      R(1220, 1170, 1316, 1215, 'home', 'Cancel'),
      R(1380, 275, 1410, 305, 'home', 'Close')]],
    'qa4': [1440, 1058, 0, [
      R(1220, 1185, 1316, 1228, 'home', 'Cancel'),
      R(1380, 262, 1410, 292, 'home', 'Close')]],
    'phone': [1440, 1058, 0, [
      R(1444, 1137, 1572, 1181, 'synced', 'Force Sync'),
      R(1337, 1137, 1432, 1181, 'back', 'Cancel'),
      R(1545, 305, 1577, 337, 'back', 'Close')]],
    'synced': [1440, 1058, 1, []],
    'volume': [1440, 1058, 0, [
      R(1293, 1000, 1405, 1044, 'email', 'Continue'),
      R(1185, 1000, 1281, 1044, 'back', 'Cancel'),
      R(1378, 442, 1410, 474, 'back', 'Close')]],
    'email': [1440, 1058, 0, [
      R(1478, 1121, 1628, 1165, 'sent', 'Send Request'),
      R(373, 1121, 454, 1165, 'volume', 'Back'),
      R(1601, 323, 1633, 355, 'home', 'Close')]],
    'sent': [1440, 1058, 1, []],
    'draft': [1440, 1058, 0, [
      R(1282, 1115, 1461, 1159, 'submitted', 'Submit Response'),
      R(1145, 1115, 1270, 1159, 'home', 'Save Draft'),
      R(1433, 327, 1465, 359, 'back', 'Close')]],
    'submitted': [1440, 1058, 1, []],
    'settings': [1440, 1058, 0, [
      R(1704, 108, 1922, 153, 'create', 'Create Notification'),
      R(22, 212, 66, 254, 'home', 'Home')]],
    'create': [1440, 1058, 0, [
      R(1827, 425, 1867, 465, 'setup', 'Send description'),
      R(22, 212, 66, 254, 'home', 'Home')]],
    'setup': [1440, 1058, 0, [
      R(1313, 1205, 1405, 1250, 'settings', 'Create'),
      R(1205, 1205, 1301, 1250, 'create', 'Cancel'),
      R(1378, 238, 1410, 270, 'create', 'Close')]],
    'dash': [1440, 2559, 1, []]
  };
  var START = 'home';
  var VER = '?v=3';                       // bump when a screen is re-exported from Figma, so browsers fetch the new picture
  var STICKY = {}, BAR = 50;              // (the old design kept its top bar and side nav fixed while scrolling; this one scrolls as a whole)

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

  // ---- Proact Notification stack on Home: three 716 x 336 cards that stay mounted and swap slots (front / middle / back) with a 300ms transform + opacity animation.
  // Only the front card takes clicks: its primary button opens that card's flow, the chevrons and dots move through the cards, 1 -> 2 -> 3 -> 1.
  var STACK = { x: 295.6, y: 370.2, w: 736, h: 356, cw: 716, ch: 336 };
  var CARDS = [
    { src: 'pcard1.webp', go: 'volume', label: 'Send Requests', btn: [25, 279, 133, 32] },
    { src: 'pcard2.webp', go: 'draft', label: 'Draft Response', btn: [25.5, 278.5, 135, 32] },
    { src: 'pcard3.webp', go: 'phone', label: 'Force Sync', btn: [25, 279, 110, 32] }
  ];
  var SLOTS = [   // [x offset px, y offset px, opacity, z-index, shadow]
    [0, 0, 1, 3, 1], [10, 10, 0.8, 2, 0], [20, 20, 0.55, 1, 0]
  ];
  var stackState = 1, stackReady = false;
  (function buildStack() {
    var host = screens['home'] && screens['home'].el; if (!host) return;
    var H = S['home'];
    function pct(v, of) { return (v / of * 100) + '%'; }
    var box = document.createElement('div'); box.className = 'p3-stack';
    box.style.cssText = 'position:absolute;z-index:2;left:' + pct(STACK.x, H[0]) + ';top:' + pct(STACK.y, H[1]) + ';width:' + pct(STACK.w, H[0]) + ';height:' + pct(STACK.h, H[1]) + ';';
    var bg = document.createElement('div'); bg.style.cssText = 'position:absolute;inset:-2px;background:#fff;'; box.appendChild(bg);   // hides the card stack drawn in the Home screenshot
    var rx = (5 / STACK.cw * 100) + '% / ' + (5 / STACK.ch * 100) + '%';
    var els = CARDS.map(function (c, i) {
      var card = document.createElement('div'); card.className = 'p3-pcard';
      card.style.cssText = 'position:absolute;left:0;top:0;width:' + pct(STACK.cw, STACK.w) + ';height:' + pct(STACK.ch, STACK.h) + ';will-change:transform,opacity;';
      var sh = document.createElement('div'); sh.className = 'p3-pshadow';
      sh.style.cssText = 'position:absolute;inset:0;border-radius:' + rx + ';box-shadow:0 1px 4px rgba(0,0,0,0.05);';
      var im = document.createElement('img'); im.src = BASE + c.src + VER; im.alt = ''; im.draggable = false; im.width = 716; im.height = 336;
      im.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;border-radius:' + rx + ';user-select:none;pointer-events:none;';
      card.appendChild(sh); card.appendChild(im); box.appendChild(card);
      return { card: card, sh: sh };
    });
    var hot = [];
    function mk(label, r, fn) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'proto-hot'; b.setAttribute('aria-label', label);
      b.style.left = pct(r[0], STACK.w); b.style.top = pct(r[1], STACK.h); b.style.width = pct(r[2], STACK.w); b.style.height = pct(r[3], STACK.h); b.style.zIndex = 6;
      b.addEventListener('click', function (e) { e.stopPropagation(); fn(); });
      box.appendChild(b); return b;
    }
    var primary = mk('Send Requests', CARDS[0].btn, function () { go(CARDS[stackState - 1].go); });
    mk('Previous notification', [585, 281, 28, 28], function () { setStack(stackState === 1 ? 3 : stackState - 1); });
    mk('Next notification', [663, 281, 28, 28], function () { setStack(stackState === 3 ? 1 : stackState + 1); });
    [[616, 16], [632, 16], [648, 14]].forEach(function (d, i) { mk('Notification ' + (i + 1), [d[0], 283, d[1], 20], function () { setStack(i + 1); }); });
    var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function place(animate) {
      els.forEach(function (e, i) {
        var sl = SLOTS[(i - (stackState - 1) + 3) % 3];
        e.card.style.transition = (animate && !still) ? 'transform 300ms ease-out, opacity 300ms ease-out' : 'none';
        e.sh.style.transition = (animate && !still) ? 'opacity 300ms ease-out' : 'none';
        e.card.style.transform = 'translate(' + (sl[0] / STACK.cw * 100) + '%,' + (sl[1] / STACK.ch * 100) + '%)';
        e.card.style.opacity = sl[2]; e.card.style.zIndex = sl[3]; e.sh.style.opacity = sl[4];
      });
      var c = CARDS[stackState - 1]; primary.setAttribute('aria-label', c.label);
      primary.style.left = pct(c.btn[0], STACK.w); primary.style.top = pct(c.btn[1], STACK.h); primary.style.width = pct(c.btn[2], STACK.w); primary.style.height = pct(c.btn[3], STACK.h);
    }
    window.setStack = function (n, instant) { stackState = n; place(!instant); };
    host.appendChild(box); place(false); stackReady = true;
  })();
  function setStack(n, instant) { if (window.setStack) window.setStack(n, instant); }

  // the app's left nav stays put while the page scrolls: it is a separate layer (the nav as it looks in a screen-high view, bottom items included) with its own buttons
  var RAILS = {
    'home': ['rail-home.webp', [['Notifications', 1272, 1314, 'notifs']]],
    'dash': ['rail-dash.webp', [['Home', 150, 195, 'home'], ['Notifications', 1272, 1314, 'notifs']]]
  };
  var rails = {};
  Object.keys(RAILS).forEach(function (id) {
    var el = document.createElement('div'); el.className = 'p3-rail'; el.setAttribute('data-for', id);
    el.style.cssText = 'display:none;position:absolute;left:0;top:0;bottom:0;width:' + (334 / 20) + '%;z-index:3;background:url("' + BASE + RAILS[id][0] + VER + '") 0 0/100% 100% no-repeat';
    RAILS[id][1].forEach(function (h) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'proto-hot'; b.setAttribute('aria-label', h[0]);
      b.style.left = (22 / 334 * 100) + '%'; b.style.width = (288 / 334 * 100) + '%';
      b.style.top = (h[1] / 1469 * 100) + '%'; b.style.height = ((h[2] - h[1]) / 1469 * 100) + '%';
      b.addEventListener('click', function (e) { e.stopPropagation(); go(h[3]); });
      el.appendChild(b);
    });
    el.addEventListener('click', function (e) { if (!(e.target.closest && e.target.closest('.proto-hot'))) el.querySelectorAll('.proto-hot').forEach(flash); });
    root.appendChild(el); rails[id] = el;
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
  var MAXH = 1058 / 1440;                 // exactly the height of the 1440 x 1058 screens: they are never stretched, and the taller ones (Home, Dashboard) are cropped at the same line, so nothing moves between screens
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
    Object.keys(rails).forEach(function (k) { rails[k].style.display = k === id ? 'block' : 'none'; });
    root.querySelectorAll('.p3-fixed').forEach(function (f) { f.classList.toggle('is-active', f.getAttribute('data-for') === id); });
    sizeVars();
    scroller.scrollTop = back ? back.top : keep ? top : 0;
    if (forceTop && id === 'home' && stackReady) setStack(1, true);
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
