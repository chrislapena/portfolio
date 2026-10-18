// "PS2" theme background: drifting, softly lit blocks that dissolve as they near the camera (Three.js r128 must be loaded first).
// window.initPs2Field(canvas, options) draws on an existing canvas and returns nothing. It is used by the home page hero (full screen,
// reacts to the pointer and to scrolling) and by the case-study headers (a calm strip). Options (all optional):
//   count      number of loose blocks            speed    1 = default drift      softness  render scale, lower = softer and cheaper
//   near, fade blocks dissolve between near+fade and near units from the camera (a smaller fade = a quicker dissolve)
//   warp, rewind   extra speed while scrolling down / pull-back while scrolling up (0 turns the scroll effect off)
//   pointer    tilt the camera with the mouse      shadowMap  shadow resolution (2048 for the hero, less for small strips)
//   contrast   CSS selector of an element to keep readable: it gets the class "on-dark" while the picture behind it is dark
//   tint       black tint over the whole field, 0 = none, 0.12 = a small tint, 0.5 = half way to black
//   dark       how many of the two dark block colours are in the mix, 1 = default
//   pin        true = draw the picture as part of the scrolling page (not a fixed layer) and pin it in place with a little script, with extra picture
//              above and below the screen. iPhone Safari (iOS 26) will not paint fixed layers under its floating bottom bar, but it does paint
//              normal page content there, so this lets the animation run all the way to the bottom edge.
//              'sticky' = same, but the browser does the pinning (CSS position: sticky), so there is no script lag while scrolling.
//   edge       a function; a few times a second it receives the colours along the very bottom edge of the picture (an array of 7 [r,g,b] values,
//              left to right, 0-255, as they look on screen). The home page uses it to colour the page background, which iPhone Safari shows
//              behind its floating bottom bar (it will not paint fixed layers there)
window.initPs2Field = function (canvas, options) {
  if (!canvas || !window.THREE || canvas.__ps2) return;
  canvas.__ps2 = true;
  var o = {
    count: window.innerWidth < 700 ? 280 : 520, speed: 1, near: 5, fade: 6, softness: 0.7,
    warp: 11, rewind: 1.6, pointer: true, shadowMap: 2048, tint: 0.12, dark: 1
  };
  for (var key in (options || {})) o[key] = options[key];
  var SPEED = o.speed, NEAR = o.near, FADE = o.fade, SOFTNESS = o.softness;

  canvas.classList.add('bf');
  document.documentElement.classList.add('theme-ps2');   // lets the CSS switch text colours that need to be dark on this pale background

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x05070d, 1);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  var scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x05070d, 20, 150);
  var camera = new THREE.PerspectiveCamera(36, 1, 0.3, 200);

  scene.add(new THREE.HemisphereLight(0xe4e9ff, 0x7f8fc8, 1.05));
  var sun = new THREE.DirectionalLight(0xffffff, 0.75);
  sun.position.set(-45, 70, 0);
  sun.target.position.set(0, 0, -55);
  scene.add(sun.target);
  sun.castShadow = true;
  sun.shadow.mapSize.set(o.shadowMap, o.shadowMap);
  sun.shadow.camera.left = -75; sun.shadow.camera.right = 75;
  sun.shadow.camera.top = 75; sun.shadow.camera.bottom = -75;
  sun.shadow.camera.near = 1; sun.shadow.camera.far = 220;
  sun.shadow.bias = -0.0008;
  sun.shadow.normalBias = 0.35;
  scene.add(sun);

  /* Soft pass: blur, glow and grain */
  var rt = new THREE.WebGLRenderTarget(2, 2, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });
  var quadScene = new THREE.Scene();
  var quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  var pass = new THREE.ShaderMaterial({
    uniforms: { tex: { value: rt.texture }, res: { value: new THREE.Vector2(2, 2) }, time: { value: 0 }, tint: { value: o.tint } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: [
      'uniform sampler2D tex; uniform vec2 res; uniform float time; uniform float tint; varying vec2 vUv;',
      'float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }',
      'void main(){',
      '  vec2 px = 1.0 / res;',
      '  vec3 tight = vec3(0.0); vec3 wide = vec3(0.0);',
      '  for (int i = 0; i < 14; i++) {',
      '    float a = float(i) * 2.39996;',
      '    float r = sqrt((float(i) + 0.5) / 14.0);',
      '    vec2 d = vec2(cos(a), sin(a)) * r;',
      '    tight += texture2D(tex, vUv + d * 2.4 * px).rgb;',
      '    wide  += texture2D(tex, vUv + d * 16.0 * px).rgb;',
      '  }',
      '  tight /= 14.0; wide /= 14.0;',
      '  vec3 col = tight * 0.82 + wide * 0.34;',
      '  col = pow(col, vec3(0.9));',
      '  col *= 1.0 - tint;',
      '  col += (hash(vUv * res + time) - 0.5) * 0.075;',
      '  gl_FragColor = vec4(col, 1.0);',
      '}'
    ].join('\n'),
    depthTest: false, depthWrite: false
  });
  quadScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), pass));

  var geo = new THREE.BoxGeometry(1, 1, 1);
  var mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
  /* Blocks dissolve in a fine dither as they near the camera */
  mat.onBeforeCompile = function (shader) {
    var n0 = NEAR.toFixed(1), n1 = (NEAR + FADE).toFixed(1);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying float vDepth;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvDepth = -mvPosition.z;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vDepth;\nfloat dHash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }')
      .replace('#include <clipping_planes_fragment>',
        '#include <clipping_planes_fragment>\nfloat keep = smoothstep(' + n0 + ', ' + n1 + ', vDepth);\nif (dHash(gl_FragCoord.xy) > keep) discard;');
  };

  var L = 110, SPREAD = 38;
  var mesh, boxes = [], movers = [];
  var dummy = new THREE.Object3D(), tint = new THREE.Color();
  var palette = [0xc4cffa, 0xd5dcfb, 0xe9edff, 0xf6f8ff, 0xb3c0f4, 0xa5b4ee, 0x5b6f98, 0x1c2840];
  var weights = [3, 3, 3, 3, 2, 1, Math.round(1 * o.dark), Math.round(1 * o.dark)];   // dark: 1 = the site's mix; higher = more of the two dark blocks (used for the share thumbnail)
  var bag = [];
  palette.forEach(function (c, i) { for (var k = 0; k < weights[i]; k++) bag.push(c); });

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function sign() { return Math.random() < 0.5 ? -1 : 1; }

  function build(n) {
    var plusN = Math.round(n * 0.08), lN = Math.round(n * 0.07), stN = Math.round(n * 0.06);
    mesh = new THREE.InstancedMesh(geo, mat, n + (plusN + lN + stN) * 2);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;

    for (var i = 0; i < n; i++) {
      var kind = Math.random();
      var s = kind < 0.35 ? [rnd(2, 7), rnd(2, 7), rnd(2, 7)]
            : kind < 0.7 ? [rnd(5, 16), rnd(5, 16), rnd(0.6, 1.8)]
            : [rnd(0.8, 2.2), rnd(4, 14), rnd(2, 6)];
      var b = { x: rnd(-SPREAD, SPREAD), y: rnd(-SPREAD, SPREAD), z: 0, sx: s[0], sy: s[1], sz: s[2], ph: rnd(0, 6.28), amp: rnd(0.4, 2.6), ox: 0, oy: 0 };
      b.p = b;
      boxes.push(b); movers.push(b);
      tint.setHex(bag[(Math.random() * bag.length) | 0]);
      mesh.setColorAt(i, tint);
    }

    var idx = n;
    function group(parts, tintHex) {
      var parent = { x: rnd(-SPREAD, SPREAD), y: rnd(-SPREAD, SPREAD), z: 0, ph: rnd(0, 6.28), amp: rnd(0.4, 2.0) };
      movers.push(parent);
      tint.setHex(tintHex);
      for (var q = 0; q < parts.length; q++) {
        var pt = parts[q];
        boxes.push({ p: parent, ox: pt[0], oy: pt[1], sx: pt[2], sy: pt[3], sz: pt[4] });
        mesh.setColorAt(idx++, tint);
      }
    }
    /* Plus shapes */
    for (var k = 0; k < plusN; k++) {
      var len = rnd(9, 24), th = rnd(2.6, 5.5), dep = rnd(1, 3);
      group([[0, 0, len, th, dep], [0, 0, th, len, dep]], palette[(Math.random() * 4) | 0]);
    }
    /* L shapes */
    for (var li = 0; li < lN; li++) {
      var ll = rnd(10, 22), lt = rnd(3, 5), lf = rnd(8, 16), ld = rnd(1.2, 3.5), dx = sign(), dy = sign();
      group([[0, 0, lt, ll, ld], [dx * (lf / 2 - lt / 2), dy * (-ll / 2 + lt / 2), lf, lt, ld]], palette[(Math.random() * 4) | 0]);
    }
    /* Two-step staircases */
    for (var si = 0; si < stN; si++) {
      var sw = rnd(4, 8), sh = rnd(3, 6), sd = rnd(2, 5), sdir = sign();
      group([[-sdir * sw / 2, -sh / 2, sw, sh, sd], [sdir * sw / 2, 0, sw, sh * 2, sd]], palette[(Math.random() * 5) | 0]);
    }
    for (var mi = 0; mi < movers.length; mi++) movers[mi].z = rnd(-L, -NEAR);
    mesh.instanceColor.needsUpdate = true;
    scene.add(mesh);
  }

  var t = 0, last = performance.now();
  var mx = 0, my = 0, tx = 0, ty = 0;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Pin mode: the canvas lives in a wrapper that spans the whole page (clipped, so it adds no scroll room); it is taller than the screen by OVER px above
     and BLEED px below, shifted with the scroll position so it looks fixed. The camera is told the picture is the screen-sized window in the middle of
     that taller frame, so the part on screen looks exactly like the normal fixed canvas, and the extra rows just continue the scene. */
  var PIN = !!o.pin, STICKY = o.pin === 'sticky', OVER = 140, BLEED = 200, pinWrap = null, vpH = 0;
  var pinW = 0, pinReady = false;
  function pinFit() {
    /* Safari's toolbar sliding in and out changes innerHeight by a few dozen px; re-allocating the drawing surface each time makes scrolling stutter,
       so small height changes are ignored (the picture is taller than the screen anyway). A width change (rotation) refits properly. */
    if (vpH && pinW === window.innerWidth && Math.abs(window.innerHeight - vpH) < 160) { pinWrap.style.height = Math.max(document.documentElement.scrollHeight, vpH + OVER + BLEED) + 'px'; return; }
    pinW = window.innerWidth;
    vpH = window.innerHeight;
    pinWrap.style.height = Math.max(document.documentElement.scrollHeight, vpH + OVER + BLEED) + 'px';
    canvas.style.top = -OVER + 'px';   /* absolute: where it sits; sticky: the offset it holds while scrolling */
    canvas.style.height = (vpH + OVER + BLEED) + 'px';
    if (pinReady) layout();            /* the resize listener for layout() was registered first and has already run with the old height, so redo it now */
  }
  function pinMove() { if (STICKY) return; canvas.style.transform = 'translate3d(0,' + Math.round(window.pageYOffset) + 'px,0)'; }
  function pinSetup() {
    pinWrap = document.createElement('div');
    pinWrap.setAttribute('aria-hidden', 'true');
    pinWrap.style.cssText = 'position:absolute;left:0;top:0;width:100%;pointer-events:none;z-index:-1;overflow:' + (STICKY ? 'clip' : 'hidden') + ';';   /* clip (not hidden) keeps sticky working */
    document.body.insertBefore(pinWrap, document.body.firstChild);
    pinWrap.appendChild(canvas);
    canvas.style.position = STICKY ? 'sticky' : 'absolute';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.zIndex = 'auto';
    canvas.style.display = 'block';
    if (STICKY) canvas.style.marginTop = -OVER + 'px';   /* its natural spot is already OVER px above the screen top, so sticking never shifts the picture */
    else canvas.style.willChange = 'transform';
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5) * 0.8);   /* the taller picture would cost ~40% more per frame; a slightly lower resolution (it is soft and grainy anyway) keeps it as light as before */
    pinFit(); pinMove(); pinReady = true;
    window.addEventListener('scroll', pinMove, { passive: true });
    window.addEventListener('resize', pinFit);
    window.addEventListener('load', pinFit);
    if (window.ResizeObserver) new ResizeObserver(pinFit).observe(document.body);
  }

  function layout() {
    var w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight, pr = renderer.getPixelRatio();
    renderer.setSize(w, h, false);
    var sf = PIN && vpH ? SOFTNESS * Math.sqrt(vpH / h) : SOFTNESS;   /* pin mode: same number of picture pixels as the screen-sized version */
    var rw = Math.max(2, Math.floor(w * pr * sf)), rh = Math.max(2, Math.floor(h * pr * sf));
    rt.setSize(rw, rh);
    pass.uniforms.res.value.set(rw, rh);
    if (PIN && vpH) {
      camera.aspect = w / vpH;
      camera.setViewOffset(w, vpH, 0, -OVER, w, h);
    } else camera.aspect = w / h;
    camera.updateProjectionMatrix();
    draw();
  }

  /* Adaptive contrast: samples the picture right behind an element (the Back link) a few times a second and gives it the class "on-dark"
     when that patch is dark, so the CSS can ease its colour between black and white. Two thresholds (hysteresis) stop it flickering. */
  var contrastEl = o.contrast ? document.querySelector(o.contrast) : null, onDark = false, sampleN = 0;
  function sampleContrast() {
    var cr = canvas.getBoundingClientRect(), er = contrastEl.getBoundingClientRect();
    if (!cr.width || !cr.height || !er.width || !er.height) return;
    var sx = rt.width / cr.width, sy = rt.height / cr.height;
    var x = Math.max(0, Math.min(rt.width - 1, Math.floor((er.left - cr.left) * sx)));
    var w = Math.max(1, Math.min(rt.width - x, Math.floor(er.width * sx)));
    var yTop = Math.floor((er.top - cr.top) * sy), h = Math.max(1, Math.floor(er.height * sy));
    var y = Math.max(0, Math.min(rt.height - 1, rt.height - yTop - h));
    h = Math.max(1, Math.min(rt.height - y, h));
    var buf = new Uint8Array(w * h * 4);
    renderer.readRenderTargetPixels(rt, x, y, w, h, buf);
    var sum = 0, n = w * h;
    for (var p = 0; p < buf.length; p += 4) sum += 0.2126 * buf[p] + 0.7152 * buf[p + 1] + 0.0722 * buf[p + 2];
    var lum = (sum / n / 255) * (1 - o.tint);
    canvas.__ps2lum = lum;
    if (!onDark && lum < 0.4) onDark = true; else if (onDark && lum > 0.5) onDark = false; else return;
    contrastEl.classList.toggle('on-dark', onDark);
  }

  /* Colours along the bottom edge of the picture, matched to what the soft pass makes of them (about +16% brightness, a 0.9 gamma and the tint). */
  var edgeN = 0, lastScrollT = -1e9, drawFlip = false;
  if (o.pin || o.edge) window.addEventListener('scroll', function () { lastScrollT = performance.now(); }, { passive: true });
  function sampleEdge() {
    var w = rt.width, rows = 4, buf = new Uint8Array(w * rows * 4), stops = [], N = 7;
    renderer.readRenderTargetPixels(rt, 0, 0, w, rows, buf);
    var bufTop = new Uint8Array(w * rows * 4);
    renderer.readRenderTargetPixels(rt, 0, Math.max(0, rt.height - rows), w, rows, bufTop);
    var colours = function (b) { var out = [];
    for (var i = 0; i < N; i++) {
      var x0 = Math.floor(i * w / N), x1 = Math.max(x0 + 1, Math.floor((i + 1) * w / N)), r = 0, g = 0, bl = 0, n = 0;
      for (var y = 0; y < rows; y++) for (var x = x0; x < x1; x++) { var q = (y * w + x) * 4; r += b[q]; g += b[q + 1]; bl += b[q + 2]; n++; }
      var c = [r / n, g / n, bl / n].map(function (v) { return Math.round(255 * Math.pow(Math.min(1, v / 255 * 1.16), 0.9) * (1 - o.tint)); });
      out.push(c);
    }
    return out; };
    o.edge(colours(buf), colours(bufTop));
  }

  function draw() {
    for (var i = 0; i < boxes.length; i++) {
      var b = boxes[i];
      dummy.position.set(
        b.p.x + b.ox + Math.sin(t * 0.35 + b.p.ph) * b.p.amp,
        b.p.y + b.oy + Math.cos(t * 0.28 + b.p.ph * 1.3) * b.p.amp * 0.6,
        b.p.z
      );
      dummy.scale.set(b.sx, b.sy, b.sz);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;

    mx += (tx - mx) * 0.04; my += (ty - my) * 0.04;
    camera.rotation.order = 'ZYX';
    camera.rotation.z = 0.38 + Math.sin(t * 0.09) * 0.12;
    camera.rotation.y = -mx * 0.12 + Math.sin(t * 0.06) * 0.05;
    camera.rotation.x = my * 0.10 + Math.cos(t * 0.05) * 0.04;

    renderer.setRenderTarget(rt);
    renderer.render(scene, camera);
    if (PIN) pinMove();
    if (contrastEl && ++sampleN % 8 === 1) sampleContrast();
    if (o.edge && ++edgeN % 15 === 1 && performance.now() - lastScrollT > 300) sampleEdge();   /* reading pixels back stalls the graphics chip: never during a swipe */
    renderer.setRenderTarget(null);
    pass.uniforms.time.value = t % 100;
    renderer.render(quadScene, quadCam);
  }

  /* Warp speed: scrolling down makes the blocks rush toward the camera, scrolling up slows them and pulls them back. The scroll speed
     (the hero -> Works snap is a fast one) sets the strength, and it eases in and out so it never jerks. */
  var warp = 0, warpTarget = 0, lastSY = window.pageYOffset, lastST = performance.now();
  if (!reduce && (o.warp || o.rewind)) {
    window.addEventListener('scroll', function () {
      var now = performance.now(), y = window.pageYOffset, ms = Math.max(8, now - lastST);
      if (y === lastSY) return;                           /* a scroll event with no movement says nothing about speed */
      var vel = (y - lastSY) / ms * 1000;                 /* px per second, + = scrolling down */
      lastSY = y; lastST = now;
      warpTarget = Math.max(-1, Math.min(1, vel / 3000));
    }, { passive: true });
  }

  function frame(now) {
    var dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!document.hidden && !reduce) {
      t += dt * SPEED;
      warpTarget *= 0.9;                                  /* fades away once the scrolling stops */
      warp += (warpTarget - warp) * 0.2;
      var mul = 1 + (warp > 0 ? warp * o.warp : warp * o.rewind);
      var v = dt * SPEED * 5.5 * mul;
      for (var i = 0; i < movers.length; i++) {
        var m = movers[i];
        m.z += v;
        if (m.z > -NEAR) {
          m.z -= L - NEAR;
          m.x = rnd(-SPREAD, SPREAD);
          m.y = rnd(-SPREAD, SPREAD);
        } else if (m.z < -L) {                            /* flowing backwards: re-enter at the near end */
          m.z += L - NEAR;
          m.x = rnd(-SPREAD, SPREAD);
          m.y = rnd(-SPREAD, SPREAD);
        }
      }
      /* pin mode: while the page is scrolling, redraw the picture every other frame (it is soft and drifts slowly) so the scroll itself gets the full frame budget */
      if (!(PIN && performance.now() - lastScrollT < 250 && (drawFlip = !drawFlip))) draw();
    }
    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', layout);
  if (o.pointer) {
    window.addEventListener('pointermove', function (e) {
      tx = (e.clientX / window.innerWidth) * 2 - 1;
      ty = (e.clientY / window.innerHeight) * 2 - 1;
    });
  }

  build(o.count);
  if (PIN) pinSetup();
  layout();
  requestAnimationFrame(frame);
};
