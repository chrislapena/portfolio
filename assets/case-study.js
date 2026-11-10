// Shared behaviour for the case-study pages: animated NEAT gradient behind the sticky header.
// Always open a case study at the very top. Mobile browsers (and back/forward or reloads) restore an old scroll position, and the lazy-loaded
// images further down can shift the layout and nudge the page afterwards; so scroll restoration is switched off and the page is pinned to
// the top on load and when it comes back from the back/forward cache. A #hash link (e.g. the Prototype button) is left alone.
(function () {
  try { if ("scrollRestoration" in history) history.scrollRestoration = "manual"; } catch (e) {}
  function top() { if (!location.hash) window.scrollTo(0, 0); }
  top();
  window.addEventListener("DOMContentLoaded", top);
  window.addEventListener("load", top);
  window.addEventListener("pageshow", function (e) { if (e.persisted) top(); });
})();

(function () {
  // Header background theme: 'ps2' (the drifting blocks from assets/ps2-field.js, needs Three.js) or 'neat' (the NEAT gradient below).
  var NAV_THEME = 'ps2';

  window.initNavGradient = function (canvas) {
    if (!canvas || canvas.__navGradient) return;
    if (NAV_THEME === 'ps2' && window.THREE && window.initPs2Field) {
      // a calm strip: fewer blocks, a smaller shadow map, no pointer tilt and no scroll rush
      window.initPs2Field(canvas, { count: window.innerWidth < 700 ? 280 : 750, speed: 1, softness: 0.6, shadowMap: 1024, warp: 0, rewind: 0, pointer: false, contrast: '.nav-back' });   // count: the same as the home page (750; 280 on phones under 700px). It was 150, then 216.
      return;
    }
    if (typeof neat === 'undefined' || typeof neat.NeatGradient === 'undefined') {
      if (!canvas.__navRetry) {
        canvas.__navRetry = true;
        window.addEventListener('load', function () { canvas.__navRetry = false; window.initNavGradient(canvas); });
      }
      return;
    }
    var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var config = {
      colors: [
        { color: '#35B5FF', enabled: true },
        { color: '#08232C', enabled: true },
        { color: '#259490', enabled: true },
        { color: '#183C60', enabled: true },
        { color: '#0C1E31', enabled: true },
        { color: '#232323', enabled: true }
      ],
      speed: 1,
      horizontalPressure: 3,
      verticalPressure: 3,
      waveFrequencyX: 3,
      waveFrequencyY: 5,
      waveAmplitude: 10,
      secondaryWaveEnabled: false,
      secondaryWaveFrequencyX: 3,
      secondaryWaveFrequencyY: 3,
      secondaryWaveAmplitude: 5,
      secondaryWaveSpeed: 0.6,
      secondaryWaveAngle: 1,
      shadows: 2,
      highlights: 6,
      colorBrightness: 1.05,
      colorSaturation: 1,
      wireframe: false,
      antialias: false,
      colorBlending: 3,
      backgroundColor: '#171717',
      backgroundAlpha: 1,
      grainScale: 0,
      grainSparsity: 0,
      grainIntensity: 0,
      grainSpeed: 2.4,
      resolution: 0.05,
      yOffset: 0,
      yOffsetWaveMultiplier: 7.2,
      yOffsetColorMultiplier: 6.8,
      yOffsetFlowMultiplier: 7.7,
      flowDistortionA: 0.4,
      flowDistortionB: 2.6,
      flowScale: 1.9,
      flowEase: 0.94,
      flowEnabled: true,
      enableProceduralTexture: true,
      transparentTextureVoid: false,
      textureMode: 'bitmap',
      bakeEdgeSoftness: 1,
      textureVoidLikelihood: 0.59,
      textureVoidWidthMin: 120,
      textureVoidWidthMax: 330,
      textureBandDensity: 0.1,
      textureColorBlending: 0,
      textureSeed: 478,
      textureEase: 0.86,
      proceduralBackgroundColor: '#171717',
      textureShapeTriangles: 51,
      textureShapeCircles: 0,
      textureShapeBars: 15,
      textureShapeSquiggles: 0,
      domainWarpEnabled: false,
      domainWarpIntensity: 0,
      domainWarpScale: 3,
      vignetteIntensity: 0,
      vignetteRadius: 0.8,
      fresnelEnabled: false,
      iridescenceEnabled: false,
      prismEdgeEnabled: false,
      bloomIntensity: 0,
      bloomThreshold: 0.7,
      chromaticAberration: 0,
      shapeType: 'plane',
      shapeRotationX: 0,
      shapeRotationY: 0,
      shapeRotationZ: 0,
      shapeAutoRotateSpeedX: 0,
      shapeAutoRotateSpeedY: 0,
      planeBend: -0.7,
      planeTwist: 1,
      silhouetteFade: 0,
      cylinderFade: 0.08,
      ribbonFade: 0,
      flatShading: true,
      cameraLock: false,
      cameraX: 0,
      cameraY: -9.5,
      cameraZ: 0,
      cameraRotationX: 0.8310000000000001,
      cameraRotationY: 0.483,
      cameraRotationZ: 0,
      cameraZoom: 2.05
    };
    if (prefersReducedMotion) config.speed = 0;

    var gradient = new neat.NeatGradient(Object.assign({ ref: canvas }, config));
    canvas.__navGradient = gradient;

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (gradient && typeof gradient.resize === 'function') gradient.resize();
      }, 150);
    });
  };

  document.querySelectorAll('.nav-gradient-canvas').forEach(function (c) {
    if (!c.closest('[data-lazy-nav]')) window.initNavGradient(c);
  });
})();

// Interactive prototype (case study 1): screens are stacked (iPhone 16, 393x852); invisible hotspots (frame coords) switch between them.
(function () {
  var W = 393, H = 852;
  var FLOW = {
    1: [],   // Home scrolls: its tap areas live inside the scrolling body (data-go buttons in the page)
    2: [[4,54,64,44,1,'Back'],[318,54,70,44,4,'More options']],   // Staff scrolls: Follow-Up and the review card live inside its scrolling body
    3: [[4,54,64,44,2,'Back']],
    4: [[133,96,248,44,7,'Create ticket'],[133,140,248,44,0,'Forward','dead'],[0,54,393,42,2,'Close menu'],[0,96,133,100,2,'Close menu'],[0,184,393,668,2,'Close menu'],[381,96,12,88,2,'Close menu']],
    5: [[4,54,64,44,1,'Back']],   // Positive Categories scrolls: the info icon lives inside its scrolling list
    6: [[20,766,353,50,5,'Got it'],[0,0,393,570,5,'Dismiss']],
    7: [[343,89,38,38,4,'Close'],[20,495,353,50,10,'Create ticket']],
    8: [[4,54,64,44,2,'Close'],[0,205,393,165,9,'Open ticket']],   // Actions slides up over Staff, so its top-left is a close X that slides it back down
    9: [[4,54,64,44,8,'Back'],[20,740,353,64,1,'Reset prototype','btn']],   // the "Reset Prototype" button from the Figma file (353x64)
    10: [[4,54,64,44,1,'Back'],[18,746,357,61,0,'Ticket created','dead'],[249,758,112,32,8,'See in Actions']],   // the toast body is a blocker so taps never reach the card under it
    12: [[4,54,64,44,1,'Back']],
    13: [[343,77,38,38,2,'Close']]
  };
  document.querySelectorAll('[data-proto]').forEach(function (box) {
    var phone = box.querySelector('.proto-phone');
    var screens = {};
    phone.querySelectorAll('.proto-screen').forEach(function (img) { screens[img.getAttribute('data-screen')] = img; });
    var layers = {};
    // AUTO[screen] = [next screen, delay ms, soft?]: 10 = "Ticket Created" alert (Staff + toast) dismisses itself after 5s (pushes down out of view)
    var AUTO = { 10: [2, 5000, true] };
    var timer = null;
    var cur = 1, pushTimer = null;
    // forward navigation "pushes" the new screen in from the right (iOS style): 1>2 Staff, 2>3 review, 1>5 all categories, 1>12 category detail, 8>9 ticket detail
    var PUSH = { '1>2': 1, '2>3': 1, '1>5': 1, '1>12': 1, '8>9': 1 };
    // bottom sheets: 4>7 (new ticket), 5>6 (info sheet), 2>13 (ask about analysis) slide up over the current screen; dismissing them (7>4, 6>5, 13>2) slides them back down;
    // 10>8: Actions slides up from the toast's "See in Actions"; its X (8>2) slides it back down
    var UP = { '4>7': 1, '5>6': 1, '2>13': 1, '10>8': 1 }, DOWN = { '7>4': 1, '6>5': 1, '13>2': 1, '8>2': 1 };
    var PUSH_MS = 380, EASE_PUSH = 'cubic-bezier(0.32, 0.72, 0, 1)';
    // screens that are drawn as another screen plus an overlay: 4 = Staff + the "..." menu, 10 = Staff + the "Ticket created" alert
    var BASE = { 4: '2', 10: '2' };
    // Sheet screens 7 (new ticket), 6 (info sheet) and 13 (ask about analysis) are full frames with a dimmed backdrop baked in. For the transition only the
    // sheet itself slides; the screen underneath stays put while a black dim (the frames bake in 37%: white -> #a0a0a0) fades over it.
    var SHEETS = {
      7:  { under: 2, top: 58,  fades: [[0, 0, 393, 58]] },    // top strip: dimmed status bar area above the sheet
      6:  { under: 5, top: 570, fades: [], keep: true },     // stays over the live (scrollable) list instead of handing over to the full frame
      13: { under: 2, top: 58,  fades: [[0, 0, 393, 58]] }
    };
    var DIM = 0.373;
    function crop(n, x, y, w, h) {
      var d = document.createElement('div');
      d.style.cssText = 'position:absolute;overflow:hidden;pointer-events:none;z-index:2;display:none;' +
        'left:' + (x / W * 100) + '%;top:' + (y / H * 100) + '%;width:' + (w / W * 100) + '%;height:' + (h / H * 100) + '%;';
      var im = document.createElement('img');
      im.src = screens[n].src; im.alt = ''; im.draggable = false;
      im.style.cssText = 'position:absolute;max-width:none;pointer-events:none;' +
        'width:' + (W / w * 100) + '%;height:' + (H / h * 100) + '%;left:' + (-x / w * 100) + '%;top:' + (-y / h * 100) + '%;';
      d.appendChild(im); phone.appendChild(d);
      return d;
    }
    var dim = document.createElement('div');
    dim.style.cssText = 'position:absolute;inset:0;background:#000;opacity:0;pointer-events:none;z-index:2;display:none;';
    phone.appendChild(dim);
    Object.keys(SHEETS).forEach(function (k) {
      var s = SHEETS[k];
      s.sheet = crop(k, 0, s.top, W, H - s.top);
      s.sheet.style.borderRadius = '3.56cqw 3.56cqw 0 0';
      s.fadeEls = s.fades.map(function (f) { return crop(k, f[0], f[1], f[2], f[3]); });
    });
    // Sticky status bar: the screens have their baked-in bar erased; one transparent bar (glyphs only, multiplied over whatever is
    // behind it) sits above every screen, so it never slides with a push and stays put under the sheet shadows
    var SB_H = 54;
    var sb = document.createElement('div');
    sb.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:' + (SB_H / H * 100) + '%;pointer-events:none;z-index:3;mix-blend-mode:multiply;';
    var sbImg = document.createElement('img');
    sbImg.src = 'assets/case-study-1/proto/statusbar.png?v=20261110'; sbImg.alt = ''; sbImg.draggable = false;
    sbImg.style.cssText = 'display:block;width:100%;height:100%;pointer-events:none;';
    sb.appendChild(sbImg); phone.appendChild(sb);
    // "Ticket created" alert (screen 10): isolated from its frame and animated on its own. Staff (screen 2) stays
    // underneath; the alert pushes up into view and pushes back down out of view.
    var TOAST = { x: 0, y: 735, w: 393, h: 85 }, toastTimer = null;
    var toast = document.createElement('div');
    toast.style.cssText = 'position:absolute;pointer-events:none;z-index:2;display:none;' +
      'left:' + (TOAST.x / W * 100) + '%;top:' + (TOAST.y / H * 100) + '%;width:' + (TOAST.w / W * 100) + '%;height:' + (TOAST.h / H * 100) + '%;';
    var toastImg = document.createElement('img');
    toastImg.src = 'assets/case-study-1/proto/toast.png?v=20261111'; toastImg.alt = ''; toastImg.draggable = false;
    toastImg.style.cssText = 'display:block;width:100%;height:100%;pointer-events:none;';
    toast.appendChild(toastImg); phone.appendChild(toast);
    // the "..." menu (screen 4): a cut-out laid over the live Staff screen, so Staff keeps its scroll position underneath
    var MENU = { x: 112, y: 70, w: 281, h: 135 };
    var menu = document.createElement('div');
    menu.style.cssText = 'position:absolute;pointer-events:none;z-index:1;display:none;' +
      'left:' + (MENU.x / W * 100) + '%;top:' + (MENU.y / H * 100) + '%;width:' + (MENU.w / W * 100) + '%;height:' + (MENU.h / H * 100) + '%;';
    var menuImg = document.createElement('img');
    menuImg.src = 'assets/case-study-1/proto/menu.png?v=20261111'; menuImg.alt = ''; menuImg.draggable = false;
    menuImg.style.cssText = 'display:block;width:100%;height:100%;pointer-events:none;';
    menu.appendChild(menuImg); phone.appendChild(menu);
    var TOAST_OFF = 'translateY(' + ((H - TOAST.y) / TOAST.h * 100) + '%)';
    function hideToast() {
      clearTimeout(toastTimer);
      toast.getAnimations().forEach(function (a) { a.cancel(); });
      toast.style.display = 'none';
    }
    function hidePieces() {
      hideToast();
      menu.getAnimations().forEach(function (a) { a.cancel(); }); menu.style.display = 'none';
      dim.getAnimations().forEach(function (a) { a.cancel(); }); dim.style.display = 'none';
      Object.keys(SHEETS).forEach(function (k) {
        var s = SHEETS[k];
        [s.sheet].concat(s.fadeEls).forEach(function (e) { e.getAnimations().forEach(function (a) { a.cancel(); }); e.style.display = 'none'; });
      });
    }
    function sheetTransition(s, n, isUp) {
      var o = { duration: PUSH_MS, easing: EASE_PUSH, fill: 'forwards' };
      dim.style.display = ''; s.sheet.style.display = '';
      s.fadeEls.forEach(function (e) { e.style.display = ''; });
      dim.animate(isUp ? [{ opacity: 0 }, { opacity: DIM }] : [{ opacity: DIM }, { opacity: 0 }], o);
      s.fadeEls.forEach(function (e) { e.animate(isUp ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 0 }], o); });
      s.sheet.animate(isUp ? [{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }] : [{ transform: 'translateY(0)' }, { transform: 'translateY(100%)' }], o);
      pushTimer = setTimeout(function () {
        if (isUp && s.keep) return;                      // the sheet and dim stay in place over the live screen beneath
        hidePieces();
        if (isUp) { screens[n].style.transitionDuration = '0s'; screens[n].classList.add('is-active'); }   // hand over to the full frame
        if (n === 4) menu.style.display = '';            // closing the New Ticket sheet lands back on Staff with its menu open
      }, PUSH_MS);
    }
    function go(n, soft, pop) {
      clearTimeout(timer);
      clearTimeout(pushTimer);
      var leavingToast = cur === 10 && n !== 10;
      hidePieces();
      if (AUTO[n]) timer = setTimeout(function () { go(AUTO[n][0], AUTO[n][2]); }, AUTO[n][1]);
      var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var push = !soft && !pop && !still && PUSH[cur + '>' + n];
      var up = !soft && !still && UP[cur + '>' + n], down = !soft && !still && DOWN[cur + '>' + n];
      var fromBase = BASE[String(cur)] || String(cur);
      pop = !soft && pop && !still && cur !== n && fromBase !== String(n);   // back arrow: current screen slides away to the right, previous one slides back in
      var from = String(cur), fromImg = BASE[from] || from;
      var sh = up && SHEETS[n] ? SHEETS[n] : (down && SHEETS[from] ? SHEETS[from] : null);   // sheet-only transition for screens 5 and 7
      // the "Ticket created" alert (screen 10) sits on top of Staff (screen 2): keep 2 underneath and just fade the alert in
      var under = BASE[n] || null;
      Object.keys(screens).forEach(function (k) {
        var img = screens[k], on = BASE[n] ? k === BASE[n] : (k === String(n) || k === under);   // screens 4 and 10 are just screen 2 plus an overlay
        img.getAnimations().forEach(function (an) { an.cancel(); });
        if (push || pop || up || down) {
          img.style.transitionDuration = '0s';
          on = sh ? k === String(sh.under) : (on || k === fromImg);   // outgoing screen stays put underneath until the push finishes (sheets: only the screen beneath stays)
        } else if (soft) {
          // soft: the incoming screen is already there underneath; only the outgoing one fades, slowly
          img.style.transitionDuration = on ? '0s' : (img.classList.contains('is-active') ? '0.5s' : '0s');
        } else if (BASE[n]) {
          img.style.transitionDuration = k === under ? '0s' : '0.3s';
        } else {
          img.style.transitionDuration = '';
        }
        img.classList.toggle('is-active', on);
      });
      var menuOn = n === 4 || (sh && from === '4');
      menu.style.display = menuOn ? '' : 'none';
      if (n === 4 && from !== '4' && !still && !sh) menu.animate([{ opacity: 0, transform: 'scale(0.96)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 140, easing: 'ease-out' });
      if (sh) {
        sheetTransition(sh, n, !!up);
      } else if (up || down) {
        if (up) screens[n].animate([{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }], { duration: PUSH_MS, easing: EASE_PUSH });
        else screens[fromImg].animate([{ transform: 'translateY(0)' }, { transform: 'translateY(100%)' }], { duration: PUSH_MS, easing: EASE_PUSH });
        pushTimer = setTimeout(function () {
          if (from !== String(n)) { if (screens[from]) screens[from].classList.remove('is-active'); if (screens[fromImg] && fromImg !== String(n)) screens[fromImg].classList.remove('is-active'); }
        }, PUSH_MS);
      } else if (pop) {
        screens[n].animate([{ transform: 'translateX(-28%)', filter: 'brightness(0.88)' }, { transform: 'translateX(0)', filter: 'brightness(1)' }], { duration: PUSH_MS, easing: EASE_PUSH });
        screens[fromImg].animate([{ transform: 'translateX(0)' }, { transform: 'translateX(100%)' }], { duration: PUSH_MS, easing: EASE_PUSH });
        pushTimer = setTimeout(function () {
          if (from !== String(n)) { if (screens[from]) screens[from].classList.remove('is-active'); if (screens[fromImg] && fromImg !== String(n)) screens[fromImg].classList.remove('is-active'); }
        }, PUSH_MS);
      } else if (push) {
        screens[n].animate([{ transform: 'translateX(100%)' }, { transform: 'translateX(0)' }], { duration: PUSH_MS, easing: EASE_PUSH });
        screens[fromImg].animate([{ transform: 'translateX(0)', filter: 'brightness(1)' }, { transform: 'translateX(-28%)', filter: 'brightness(0.88)' }], { duration: PUSH_MS, easing: EASE_PUSH });
        pushTimer = setTimeout(function () {
          if (from !== String(n)) { if (screens[from]) screens[from].classList.remove('is-active'); if (screens[fromImg] && fromImg !== String(n)) screens[fromImg].classList.remove('is-active'); }
        }, PUSH_MS);
      }
      // alert in: push up from below; alert out (auto-dismiss): push back down. Leaving any other way removes it at once.
      if (n === 10) {
        toast.style.display = '';
        if (!still) {
          toast.animate([{ transform: TOAST_OFF }, { transform: 'translateY(0)' }], { duration: PUSH_MS, easing: EASE_PUSH });
        }
      } else if (leavingToast && soft && !still) {
        toast.style.display = '';
        toast.animate([{ transform: 'translateY(0)' }, { transform: TOAST_OFF }], { duration: PUSH_MS, easing: EASE_PUSH, fill: 'forwards' });
        toastTimer = setTimeout(hideToast, PUSH_MS);
      }
      if (push) resetScroll(n);                          // going forward into a screen starts it at the top (going back keeps where you were)
      cur = n;
      Object.keys(layers).forEach(function (k) { layers[k].style.display = k === String(n) ? '' : 'none'; });
    }
    Object.keys(FLOW).forEach(function (n) {
      var layer = document.createElement('div');
      layer.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:4;' + (n === '1' ? '' : 'display:none');   // the layer itself never takes clicks or scrolls; only its buttons do
      FLOW[n].forEach(function (h) {
        if (h[6] === 'dead') {                              // looks like a button but does nothing (it only keeps taps from reaching the screen underneath)
          var blk = document.createElement('div');
          blk.className = 'proto-block'; blk.setAttribute('aria-hidden', 'true');
          blk.style.left = (h[0] / W * 100) + '%'; blk.style.top = (h[1] / H * 100) + '%';
          blk.style.width = (h[2] / W * 100) + '%'; blk.style.height = (h[3] / H * 100) + '%';
          layer.appendChild(blk);
          return;
        }
        var b = document.createElement('button');
        b.style.pointerEvents = 'auto';
        b.type = 'button'; b.className = 'proto-hot' + (h[6] === 'btn' ? ' proto-restart' : ''); b.setAttribute('aria-label', h[5]);
        if (h[6] === 'btn') {                                  // the Figma button artwork (its soft glow spills outside the 353x64 tap area)
          var bi = document.createElement('img'); bi.src = 'assets/case-study-1/proto/reset-btn.png?v=20261112'; bi.alt = ''; bi.draggable = false; b.appendChild(bi);
        }
        b.style.left = (h[0] / W * 100) + '%'; b.style.top = (h[1] / H * 100) + '%';
        b.style.width = (h[2] / W * 100) + '%'; b.style.height = (h[3] / H * 100) + '%';
        b.addEventListener('click', function () { go(h[4], false, h[5] === 'Back'); if (h[5] === 'Reset prototype') setTimeout(resetAll, 400); });
        layer.appendChild(b);
      });
      layers[n] = layer; phone.appendChild(layer);
    });
      // tap areas that live inside a scrolling screen (Home, Staff, Positive Categories)
      phone.querySelectorAll('[data-go]').forEach(function (b) {
        b.addEventListener('click', function () { go(+b.getAttribute('data-go'), false, false); });
      });
      function scroller(n) { var s = screens[n]; return s && s.querySelector ? s.querySelector('.home-scroll, .scr-scroll') : null; }
      function resetScroll(n) { var sc = scroller(n); if (sc) sc.scrollTop = 0; }
      function resetAll() { Object.keys(screens).forEach(resetScroll); phone.querySelectorAll('.proto-scr').forEach(function (e) { e.classList.remove('is-collapsed'); }); }
      // Staff: the large title scrolls away and the small centred title fades into the nav bar (with the card header it changes)
      phone.querySelectorAll('.scr-scroll[data-collapse]').forEach(function (sc) {
        var scr = sc.closest('.proto-scr'), at = +sc.getAttribute('data-collapse');
        sc.addEventListener('scroll', function () { scr.classList.toggle('is-collapsed', sc.scrollTop > at); }, { passive: true });
      });
      // tapping a dead spot flashes the tappable areas of the current screen for a second (skips full-screen "dismiss" areas)
      phone.addEventListener('click', function (e) {
        if (e.target.closest && e.target.closest('.proto-hot')) return;
        Object.keys(layers).forEach(function (k) {
          if (layers[k].style.display === 'none') return;
          var hs = Array.prototype.slice.call(layers[k].querySelectorAll('.proto-hot'));
          var base = screens[k] || screens[BASE[k]];
          if (base) hs = hs.concat(Array.prototype.slice.call(base.querySelectorAll('.proto-hot')));
          hs.forEach(function (b) {
            var l = b.getAttribute('aria-label');
            if (l === 'Close menu' || l === 'Dismiss') return;
            b.classList.remove('proto-flash');
            void b.offsetWidth;
            b.classList.add('proto-flash');
            setTimeout(function () { b.classList.remove('proto-flash'); }, 1000);
          });
        });
      });
      // press R to restart the prototype (only while it is on screen, never with a modifier or while typing)
      document.addEventListener("keydown", function (e) {
        if ((e.key !== "r" && e.key !== "R") || e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
        var t = e.target && e.target.tagName;
        if (t === "INPUT" || t === "TEXTAREA" || t === "SELECT" || (e.target && e.target.isContentEditable)) return;
        var r = box.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        go(1);
        setTimeout(resetAll, 400);
      });
  });
})();

  // "Prototype" jump button (case study 1): sticky, scrolls to the prototype, hides once the prototype is in view,
  // and gives one small bounce the first time it appears.
  (function () {
    var fab = document.querySelector('[data-proto-fab]');
    var target = document.getElementById('interactive-prototype');
    if (!fab || !target || !('IntersectionObserver' in window)) return;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var box = target.querySelector('.proto-box') || target;
    fab.addEventListener('click', function (e) {
      e.preventDefault();
      target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    });
    fab.addEventListener('animationend', function () { fab.classList.remove('is-bouncing'); });

    // hide while the prototype is on screen (it counts as "in view" once it reaches the top ~75% of the viewport)
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { fab.classList.toggle('is-hidden', en.isIntersecting); });
    }, { rootMargin: '0px 0px -25% 0px', threshold: 0 }).observe(box);

    // bounce when the button first appears on screen, then again every 10 seconds while it is showing
    function bounce() {
      if (reduce || document.hidden || fab.classList.contains('is-hidden')) return;
      fab.classList.remove('is-bouncing');
      void fab.offsetWidth;                       // restart the animation
      fab.classList.add('is-bouncing');
    }
    if (!reduce) {
      var first = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (en) {
          if (!en.isIntersecting || fab.classList.contains('is-hidden')) return;
          obs.disconnect();
          setTimeout(bounce, 700);
          setInterval(bounce, 10000);
        });
      }, { threshold: 0.9 });
      first.observe(fab);
    }
  })();

/* "Solutions" title: plain Alpha Lyrae until the title locks at the top of the screen, then a short light glitch into Italiana (and back when scrolled up) */
(function () {
  var titles = document.querySelectorAll('h2.sol-title');
  if (!titles.length) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var frames = ['a', 'b', 'c'];
  titles.forEach(function (h) {
    var word = h.textContent.trim();
    h.setAttribute('aria-label', word);
    var wrap = document.createElement('span');
    wrap.className = 'sol';
    wrap.setAttribute('aria-hidden', 'true');
    wrap.innerHTML = '<span class="sol-f sol-ly">' + word + '</span>' + frames.map(function (k) {
      return '<svg class="sol-f sol-' + k + '" viewBox="0 0 4265 810"><use href="assets/solutions-glitch.svg#sol-' + k + '"/></svg>';
    }).join('') + '<span class="sol-f sol-it">' + word + '</span>';
    h.textContent = '';
    h.appendChild(wrap);
    h.__locked = false;
  });
  function threshold(h) {
    var cs = getComputedStyle(h);
    return cs.position === 'sticky' ? (parseFloat(cs.top) || 0) + 2 : window.innerHeight * 0.4;
  }
  function set(h, locked, animate) {
    h.__locked = locked;
    h.classList.toggle('is-locked', locked);
    h.classList.remove('is-anim-in', 'is-anim-out');
    if (animate && !reduce) { void h.offsetWidth; h.classList.add(locked ? 'is-anim-in' : 'is-anim-out'); }
  }
  var ticking = false;
  function check(animate) {
    ticking = false;
    titles.forEach(function (h) {
      var top = h.getBoundingClientRect().top, t = threshold(h);
      if (!h.__locked && top <= t) set(h, true, animate);
      else if (h.__locked && top > t + 12) set(h, false, animate);
    });
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { check(true); }); } }, { passive: true });
  window.addEventListener('resize', function () { check(false); });
  check(false);
})();
