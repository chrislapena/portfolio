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
      var ios = /iP(hone|ad|od)/.test(navigator.userAgent) || (/Mac/.test(navigator.platform) && navigator.maxTouchPoints > 1);
      var edge = null;
      if ((ios || /[?&]pin(=|&|$)/.test(location.search)) && !/[?&]pin=off/.test(location.search)) {
        // iPhone Safari paints nothing sticky outside the page area, and fills the strip under the status bar from the page background:
        // so the background becomes a gradient of the header picture's top-edge colours, and the status bar looks like part of the header.
        // Safari only shows that page background where the page itself has room, so the page starts with a 70px margin on top and opens scrolled past it
        // (the header, which is sticky, then sits exactly where it always did).
        var root = document.documentElement, PAD = 70;
        root.classList.add('top-pad');
        var land = function () { if (!location.hash && window.pageYOffset < PAD) window.scrollTo(0, PAD); };
        if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
        land(); window.addEventListener('load', land); setTimeout(land, 300);
        // the sticky header itself is not painted up there, so a thin copy of its top edge rides along just above the screen (moved with the scroll, behind the real header)
        var strip = document.createElement('div');
        strip.setAttribute('aria-hidden', 'true');
        strip.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:' + PAD + 'px;z-index:29;pointer-events:none;will-change:transform;';
        document.body.insertBefore(strip, document.body.firstChild);
        var moveStrip = function () { strip.style.transform = 'translate3d(0,' + (Math.round(window.pageYOffset) - PAD + 1) + 'px,0)'; };
        moveStrip(); window.addEventListener('scroll', moveStrip, { passive: true });
        var idle = 0;   // never rest inside the top band (it would show as an extra bar above the header): settle back to the header
        window.addEventListener('scroll', function () {
          clearTimeout(idle);
          idle = setTimeout(function () {
            if (window.pageYOffset < PAD - 1) {
              window.scrollTo({ top: PAD, behavior: 'smooth' });
              setTimeout(function () { if (window.pageYOffset < PAD - 1) window.scrollTo(0, PAD); }, 500);
            }
          }, 180);
        }, { passive: true });
        edge = function (bottom, top) {
          var g = 'linear-gradient(to right,' + top.map(function (c, i) { return 'rgb(' + c.join(',') + ') ' + Math.round(i * 100 / (top.length - 1)) + '%'; }).join(',') + ')';
          strip.style.background = g;
          root.style.background = g + ' 0 0 / 100% 70px repeat-y';
        };
      }
      window.initPs2Field(canvas, { count: 150, speed: 1, softness: 0.6, shadowMap: 1024, warp: 0, rewind: 0, pointer: false, contrast: '.nav-back', edge: edge, topAt: (480 - 68) / 2 });
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

// Interactive prototype (case study 1): screens are stacked; invisible hotspots (frame coords, 375x812) switch between them.
(function () {
  var W = 375, H = 812;
  var FLOW = {
    1: [[100,398,175,38,6,'Show all categories'],[16,592,343,68,2,'Staff']],
    2: [[8,44,52,46,1,'Back'],[315,40,52,52,4,'More options'],[100,452,175,34,3,'View full review']],
    3: [[8,44,52,46,2,'Back']],
    4: [[8,44,52,46,2,'Back'],[206,87,161,60,5,'Create ticket'],[0,88,206,122,2,'Close menu'],[0,210,375,602,2,'Close menu']],
    5: [[8,62,52,44,4,'Close'],[16,416,343,50,8,'Create ticket']],
    6: [[8,44,52,46,1,'Back'],[158,344,26,26,7,'About this category']],
    7: [[0,0,375,596,6,'Dismiss'],[16,732,343,48,6,'Got it']],
    8: [[214,733,135,34,9,'View in Actions']],
    9: [],
    10: [[106,728,161,60,1,'Reset prototype']]
  };
  document.querySelectorAll('[data-proto]').forEach(function (box) {
    var phone = box.querySelector('.proto-phone');
    var screens = {};
    phone.querySelectorAll('.proto-screen').forEach(function (img) { screens[img.getAttribute('data-screen')] = img; });
    var layers = {};
    // AUTO[screen] = [next screen, delay ms, soft?]: 8 = "Ticket Created" alert dismisses itself after 3s (pushes down out of view);
    // 9 = Actions list flashes briefly, then the ticket detail appears
    var AUTO = { 8: [2, 3000, true], 9: [10, 980] };  // 980 = 380ms slide-up + the 0.6s dwell
    var timer = null;
    var cur = 1, pushTimer = null;
    // forward navigation "pushes" the new screen in from the right (iOS style): 1>2 quotes, 2>3 review, 1>6 all categories, 9>10 ticket detail
    var PUSH = { '1>2': 1, '2>3': 1, '1>6': 1, '9>10': 1 };
    // bottom sheets: 4>5 (create ticket form) and 6>7 (info sheet) slide up over the current screen; dismissing them (5>4, 7>6) slides them back down
    var UP = { '4>5': 1, '6>7': 1, '8>9': 1 }, DOWN = { '5>4': 1, '7>6': 1 };
    var PUSH_MS = 380, EASE_PUSH = 'cubic-bezier(0.32, 0.72, 0, 1)';
    // Sheet screens 5 (create ticket) and 7 (info sheet) are full frames with a dimmed backdrop baked in. For the transition only the
    // sheet itself slides; the screen underneath stays put while a black 60% dim (what the frames bake in) fades over it.
    var SHEETS = {
      5: { under: 4, top: 54,  fades: [[0, 0, 375, 54]] },     // top strip: dimmed status bar + grabber
      7: { under: 6, top: 596, fades: [[60, 578, 255, 14]] }   // grabber above the sheet
    };
    var DIM = 0.6;
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
      s.sheet.style.borderRadius = '5.33cqw 5.33cqw 0 0';
      s.fadeEls = s.fades.map(function (f) { return crop(k, f[0], f[1], f[2], f[3]); });
    });
    // Sticky status bar: the screens have their baked-in bar erased; one transparent bar (glyphs only, multiplied over whatever is
    // behind it) sits above every screen, so it never slides with a push and stays put under the sheet shadows
    var SB_H = 44;
    var sb = document.createElement('div');
    sb.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:' + (SB_H / H * 100) + '%;pointer-events:none;z-index:3;mix-blend-mode:multiply;';
    var sbImg = document.createElement('img');
    sbImg.src = 'assets/case-study-1/proto/statusbar.png'; sbImg.alt = ''; sbImg.draggable = false;
    sbImg.style.cssText = 'display:block;width:100%;height:100%;pointer-events:none;';
    sb.appendChild(sbImg); phone.appendChild(sb);
    // "Ticket Created!" alert (screen 5.2): isolated from its frame and animated on its own. Quotes about Staff (screen 2) stays
    // underneath; the alert pushes up into view and pushes back down out of view.
    var TOAST = { x: 14.5, y: 718.5, w: 348, h: 63 }, toastTimer = null;
    var toast = document.createElement('div');
    toast.style.cssText = 'position:absolute;pointer-events:none;z-index:2;display:none;' +
      'left:' + (TOAST.x / W * 100) + '%;top:' + (TOAST.y / H * 100) + '%;width:' + (TOAST.w / W * 100) + '%;height:' + (TOAST.h / H * 100) + '%;';
    var toastImg = document.createElement('img');
    toastImg.src = 'assets/case-study-1/proto/toast.png?v=202609241803'; toastImg.alt = ''; toastImg.draggable = false;
    toastImg.style.cssText = 'display:block;width:100%;height:100%;pointer-events:none;';
    toast.appendChild(toastImg); phone.appendChild(toast);
    var TOAST_OFF = 'translateY(' + ((H - TOAST.y) / TOAST.h * 100) + '%)';
    function hideToast() {
      clearTimeout(toastTimer);
      toast.getAnimations().forEach(function (a) { a.cancel(); });
      toast.style.display = 'none';
    }
    function hidePieces() {
      hideToast();
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
        hidePieces();
        if (isUp) { screens[n].style.transitionDuration = '0s'; screens[n].classList.add('is-active'); }   // hand over to the full frame
      }, PUSH_MS);
    }
    function go(n, soft, pop) {
      clearTimeout(timer);
      clearTimeout(pushTimer);
      var leavingToast = cur === 8 && n !== 8;
      hidePieces();
      if (AUTO[n]) timer = setTimeout(function () { go(AUTO[n][0], AUTO[n][2]); }, AUTO[n][1]);
      var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var push = !soft && !pop && !still && PUSH[cur + '>' + n];
      var up = !soft && !still && UP[cur + '>' + n], down = !soft && !still && DOWN[cur + '>' + n];
      pop = !soft && pop && !still && cur !== n;   // back arrow: current screen slides away to the right, previous one slides back in
      var from = String(cur), fromImg = from === '8' ? '2' : from;   // screen 8 has no image of its own (it is screen 2 + the alert)
      var sh = up && SHEETS[n] ? SHEETS[n] : (down && SHEETS[from] ? SHEETS[from] : null);   // sheet-only transition for screens 5 and 7
      // the "Ticket Created" alert (screen 8) sits on top of Quotes about Staff (screen 2): keep 2 underneath and just fade the alert in
      var under = n === 8 ? '2' : null;
      Object.keys(screens).forEach(function (k) {
        var img = screens[k], on = n === 8 ? k === '2' : (k === String(n) || k === under);   // screen 8 is just screen 2 plus the alert
        img.getAnimations().forEach(function (an) { an.cancel(); });
        if (push || pop || up || down) {
          img.style.transitionDuration = '0s';
          on = sh ? k === String(sh.under) : (on || k === fromImg);   // outgoing screen stays put underneath until the push finishes (sheets: only the screen beneath stays)
        } else if (soft) {
          // soft: the incoming screen is already there underneath; only the outgoing one fades, slowly
          img.style.transitionDuration = on ? '0s' : (img.classList.contains('is-active') ? '0.5s' : '0s');
        } else if (n === 8) {
          img.style.transitionDuration = k === under ? '0s' : '0.3s';
        } else {
          img.style.transitionDuration = '';
        }
        img.classList.toggle('is-active', on);
      });
      if (sh) {
        sheetTransition(sh, n, !!up);
      } else if (up || down) {
        if (up) screens[n].animate([{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }], { duration: PUSH_MS, easing: EASE_PUSH });
        else screens[from].animate([{ transform: 'translateY(0)' }, { transform: 'translateY(100%)' }], { duration: PUSH_MS, easing: EASE_PUSH });
        pushTimer = setTimeout(function () {
          if (screens[from] && from !== String(n)) screens[from].classList.remove('is-active');
        }, PUSH_MS);
      } else if (pop) {
        screens[n].animate([{ transform: 'translateX(-28%)', filter: 'brightness(0.88)' }, { transform: 'translateX(0)', filter: 'brightness(1)' }], { duration: PUSH_MS, easing: EASE_PUSH });
        screens[from].animate([{ transform: 'translateX(0)' }, { transform: 'translateX(100%)' }], { duration: PUSH_MS, easing: EASE_PUSH });
        pushTimer = setTimeout(function () {
          if (screens[from] && from !== String(n)) screens[from].classList.remove('is-active');
        }, PUSH_MS);
      } else if (push) {
        screens[n].animate([{ transform: 'translateX(100%)' }, { transform: 'translateX(0)' }], { duration: PUSH_MS, easing: EASE_PUSH });
        screens[from].animate([{ transform: 'translateX(0)', filter: 'brightness(1)' }, { transform: 'translateX(-28%)', filter: 'brightness(0.88)' }], { duration: PUSH_MS, easing: EASE_PUSH });
        pushTimer = setTimeout(function () {
          if (screens[from] && from !== String(n)) screens[from].classList.remove('is-active');
        }, PUSH_MS);
      }
      // alert in: push up from below; alert out (auto-dismiss): push back down. Leaving any other way removes it at once.
      if (n === 8) {
        toast.style.display = '';
        if (!still) {
          toast.animate([{ transform: TOAST_OFF }, { transform: 'translateY(0)' }], { duration: PUSH_MS, easing: EASE_PUSH });
        }
      } else if (leavingToast && soft && !still) {
        toast.style.display = '';
        toast.animate([{ transform: 'translateY(0)' }, { transform: TOAST_OFF }], { duration: PUSH_MS, easing: EASE_PUSH, fill: 'forwards' });
        toastTimer = setTimeout(hideToast, PUSH_MS);
      }
      cur = n;
      Object.keys(layers).forEach(function (k) { layers[k].style.display = k === String(n) ? '' : 'none'; });
    }
    Object.keys(FLOW).forEach(function (n) {
      var layer = document.createElement('div');
      layer.style.cssText = 'position:absolute;inset:0;' + (n === '1' ? '' : 'display:none');
      FLOW[n].forEach(function (h) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'proto-hot' + (h[6] === 'btn' ? ' proto-restart' : ''); b.setAttribute('aria-label', h[5]);
        if (h[6] === 'btn') b.textContent = h[5];
        b.style.left = (h[0] / W * 100) + '%'; b.style.top = (h[1] / H * 100) + '%';
        b.style.width = (h[2] / W * 100) + '%'; b.style.height = (h[3] / H * 100) + '%';
        b.addEventListener('click', function () { go(h[4], false, h[5] === 'Back'); });
        layer.appendChild(b);
      });
      layers[n] = layer; phone.appendChild(layer);
    });
      // tapping a dead spot flashes the tappable areas of the current screen for a second (skips full-screen "dismiss" areas)
      phone.addEventListener('click', function (e) {
        if (e.target.closest && e.target.closest('.proto-hot')) return;
        Object.keys(layers).forEach(function (k) {
          if (layers[k].style.display === 'none') return;
          layers[k].querySelectorAll('.proto-hot').forEach(function (b) {
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
