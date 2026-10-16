// Click sounds: a short, tactile "mouse click" (synthesised with the Web Audio API, so there is no audio file to load)
// plays on anything clickable: links, buttons, the card strip, the scrollbar, prototype hotspots, form controls.
(function () {
  var AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  var ctx = null, master = null, noiseBuf = null;
  var VOLUME = 0.22;                       // overall loudness (0-1)

  function init() {
    if (ctx) return ctx.state === 'suspended' ? (ctx.resume(), true) : true;
    try { ctx = new AC(); } catch (e) { ctx = null; return false; }
    master = ctx.createGain(); master.gain.value = VOLUME; master.connect(ctx.destination);
    // 60ms of white noise, reused for every click
    noiseBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.06), ctx.sampleRate);
    var d = noiseBuf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return true;
  }

  // one click = a sharp high "tick" (filtered noise) + a tiny low "thock" body
  function click(strength) {
    if (!init() || !ctx) return;
    var t = ctx.currentTime, k = strength || 1, detune = 0.94 + Math.random() * 0.12;

    var src = ctx.createBufferSource(); src.buffer = noiseBuf;
    var bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 3400 * detune; bp.Q.value = 0.9;
    var g1 = ctx.createGain();
    g1.gain.setValueAtTime(0.9 * k, t); g1.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    src.connect(bp); bp.connect(g1); g1.connect(master);
    src.start(t); src.stop(t + 0.04);

    var osc = ctx.createOscillator(); osc.type = 'sine';
    osc.frequency.setValueAtTime(210 * detune, t); osc.frequency.exponentialRampToValueAtTime(70, t + 0.05);
    var g2 = ctx.createGain();
    g2.gain.setValueAtTime(0.75 * k, t); g2.gain.exponentialRampToValueAtTime(0.001, t + 0.055);
    osc.connect(g2); g2.connect(master);
    osc.start(t); osc.stop(t + 0.07);
  }

  var CLICKABLE = 'a[href], button, [role="button"], [role="scrollbar"], [role="tab"], summary, select, input, label[for], .strip-card';
  function clickable(el) {
    var n = el && el.closest ? el.closest(CLICKABLE) : null;
    return n && !n.disabled && n.getAttribute('aria-disabled') !== 'true' ? n : null;
  }

  // pointerdown feels most like a real mouse click (no lag); keyboard activation (Enter / Space) gets the same sound
  document.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (clickable(e.target)) click(1);
  }, true);
  document.addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && !e.repeat && clickable(e.target)) click(0.8);
  }, true);

  window.clickSound = { play: click, setVolume: function (v) { VOLUME = v; if (master) master.gain.value = v; } };
})();
