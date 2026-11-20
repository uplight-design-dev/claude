/* Page blocks: larger sections you can drop into a page. */
Object.assign(window.ULComponents, {

'hero-57': {
  group: 'Blocks', title: 'Hero 57', wide: true, flush: true,
  desc: 'A centered hero over a full-width energy chart with a draggable time crosshair.',
  usage: 'Drag across the chart, or focus it and use the arrow keys, to move through the day. The readout above the crosshair updates for that moment. The numbers are sample data generated in the script.',
  html: `<section class="ul-hero">
  <div class="ul-hero-copy">
    <h3>Energy you can see, ready to act on.</h3>
    <p>Watch generation, usage and storage move through the day, then decide what happens next.</p>
    <div class="ul-hero-cta">
      <button type="button" class="ul-hero-btn">Get started</button>
      <button type="button" class="ul-hero-link">See how it works &rarr;</button>
    </div>
  </div>
  <div class="ul-hero-chart" tabindex="0" role="slider" aria-label="Time of day"
    aria-valuemin="0" aria-valuemax="1439" aria-valuenow="800">
    <div class="ul-hero-cross">
      <div class="ul-hero-readout"></div><i class="ul-hero-dot"></i>
    </div>
    <svg viewBox="0 0 1000 240" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="ul-h-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stop-color="#0047ff" stop-opacity=".28"/><stop offset="1" stop-color="#0047ff" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="ul-h-line" x1="0" x2="1"><stop offset="0" stop-color="#0047ff"/><stop offset="1" stop-color="#00e297"/></linearGradient>
      </defs>
      <path class="ul-h-grid" d="M0 60H1000M0 120H1000M0 180H1000"/>
      <path class="ul-h-use"/><path class="ul-h-area"/><path class="ul-h-gen"/>
    </svg>
    <div class="ul-hero-axis"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span></div>
  </div>
  <p class="ul-hero-note">Sample data</p>
</section>`,
  css: `.ul-hero{padding:56px 24px 20px;text-align:center;background:var(--bg)}
.ul-hero-copy{max-width:560px;margin:0 auto}
.ul-hero h3{margin:0;font-size:clamp(30px,5.4vw,48px);line-height:1.04;font-weight:700;letter-spacing:-.035em;color:var(--text)}
.ul-hero-copy p{margin:16px auto 0;max-width:440px;font-size:16px;line-height:1.55}
.ul-hero-cta{display:flex;justify-content:center;align-items:center;gap:20px;margin-top:26px}
.ul-hero-btn,.ul-hero-link{font:inherit;font-size:14px;font-weight:500;cursor:pointer;border:0}
.ul-hero-btn{height:42px;padding:0 22px;border-radius:999px;background:var(--text);color:var(--bg);
  transition:transform .12s cubic-bezier(.23,1,.32,1)}
.ul-hero-btn:active{transform:scale(.96)}
.ul-hero-link{background:none;color:var(--text)}.ul-hero-link:hover{color:#0047ff}
.ul-hero-chart{position:relative;margin:52px -24px 0;height:290px;touch-action:none;cursor:ew-resize;outline-offset:-3px}
.ul-hero-chart svg{position:absolute;left:0;right:0;top:60px;width:100%;height:190px;overflow:visible}
.ul-h-grid{fill:none;stroke:var(--border);stroke-width:1;vector-effect:non-scaling-stroke}
.ul-h-gen{fill:none;stroke:url(#ul-h-line);stroke-width:3;stroke-linejoin:round;vector-effect:non-scaling-stroke}
.ul-h-area{fill:url(#ul-h-fill);stroke:none}
.ul-h-use{fill:none;stroke:var(--borderStrong);stroke-width:2;stroke-dasharray:5 5;vector-effect:non-scaling-stroke}
.ul-hero-axis{position:absolute;left:24px;right:24px;bottom:0;display:flex;justify-content:space-between;
  font-size:11px;color:var(--muted);font-variant-numeric:tabular-nums}
.ul-hero-cross{position:absolute;top:0;bottom:24px;left:var(--x,55%);width:0;z-index:2;
  border-left:1px solid var(--borderStrong);pointer-events:none}
.ul-hero-dot{position:absolute;left:-6px;top:var(--y,50%);width:12px;height:12px;border-radius:99px;
  background:#0047ff;border:2px solid var(--bg);box-shadow:0 0 0 3px rgba(0,71,255,.25)}
.ul-hero-readout{position:absolute;top:0;left:0;transform:translateX(-50%);display:flex;gap:14px;
  padding:8px 14px;border-radius:12px;white-space:nowrap;background:var(--bg);
  border:1px solid var(--border);box-shadow:0 8px 24px rgba(10,10,30,.08);
  font-size:13px;font-weight:500;color:var(--text);font-variant-numeric:tabular-nums}
.ul-hero-readout small{font-weight:400;color:var(--muted);margin-left:3px}
.ul-hero-note{margin:10px 0 0;font-size:12px;color:var(--muted)}`,
  init: function hero57(root) {
    var chart = root.querySelector('.ul-hero-chart'), cross = chart.querySelector('.ul-hero-cross');
    var read = chart.querySelector('.ul-hero-readout'), svg = chart.querySelector('svg');
    var STEPS = 96, cap = 10, gen = [], use = [], bat = [], b = 72, i;
    for (i = 0; i <= STEPS; i++) {
      var h = i / 4;
      gen[i] = h > 6 && h < 19 ? 5.2 * Math.pow(Math.sin(Math.PI * (h - 6) / 13), 1.5) : 0;
      use[i] = 0.7 + 0.8 * Math.exp(-Math.pow((h - 7.5) / 1.3, 2)) + 1.3 * Math.exp(-Math.pow((h - 19) / 1.8, 2)) + 0.15 * Math.sin(h / 3.8);
      b = Math.min(100, Math.max(6, b + ((gen[i] - use[i]) * 0.25 / cap) * 100)); bat[i] = b;
    }
    var X = function (k) { return (k / STEPS * 1000).toFixed(1); }, Y = function (v) { return (230 - v / 6 * 200).toFixed(1); };
    var line = gen.map(function (v, k) { return (k ? 'L' : 'M') + X(k) + ' ' + Y(v); }).join('');
    svg.querySelector('.ul-h-gen').setAttribute('d', line);
    svg.querySelector('.ul-h-area').setAttribute('d', line + 'L1000 240L0 240Z');
    svg.querySelector('.ul-h-use').setAttribute('d', use.map(function (v, k) { return (k ? 'L' : 'M') + X(k) + ' ' + Y(v); }).join(''));
    var minute = 800;
    function set(m) {
      minute = Math.max(0, Math.min(1439, m));
      var f = minute / 1439 * STEPS, a = Math.floor(f), t = f - a, c = Math.min(a + 1, STEPS);
      var g = gen[a] + (gen[c] - gen[a]) * t, u = use[a] + (use[c] - use[a]) * t, p = bat[a] + (bat[c] - bat[a]) * t;
      var hh = Math.floor(minute / 60), mm = Math.floor(minute % 60);
      cross.style.setProperty('--x', (minute / 1439 * 100) + '%');
      cross.style.setProperty('--y', (60 + (230 - g / 6 * 200) * 190 / 240 - 6) + 'px');
      read.innerHTML = (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm +
        '<span>' + g.toFixed(1) + '<small>kW solar</small></span><span>' + u.toFixed(1) + '<small>kW home</small></span><span>' + Math.round(p) + '%<small>battery</small></span>';
      chart.setAttribute('aria-valuenow', Math.round(minute));
      var r = chart.getBoundingClientRect(), w = read.offsetWidth / 2, px = minute / 1439 * r.width;
      read.style.left = Math.max(w - px, Math.min(r.width - w - px, 0)) + 'px';   // keep the readout inside the chart
    }
    function fromEvent(e) { var r = chart.getBoundingClientRect(); set((e.clientX - r.left) / r.width * 1439); }
    var drag = false;
    chart.addEventListener('pointerdown', function (e) { drag = true; chart.setPointerCapture(e.pointerId); fromEvent(e); });
    chart.addEventListener('pointermove', function (e) { if (drag) fromEvent(e); });
    chart.addEventListener('pointerup', function () { drag = false; });
    chart.addEventListener('keydown', function (e) {
      var s = e.shiftKey ? 60 : 15;
      if (e.key === 'ArrowRight') { set(minute + s); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { set(minute - s); e.preventDefault(); }
    });
    set(800);
  },
  vars: [['gen / use', 'Sample curves for generation and usage'], ['cap = 10', 'Battery size in kWh'], ['h3 and p', 'Headline and supporting text'], ['.ul-hero-btn / link', 'The two calls to action']]
},

'features-19': {
  group: 'Blocks', title: 'Features 19', wide: true, flush: true,
  desc: 'A sticky panel whose card changes as steps scroll past.',
  usage: 'Scroll inside the block. The steps move on the left while the panel stays pinned and swaps its card for the step in view. Add a step and a matching card with the same index.',
  html: `<section class="ul-feat">
  <div class="ul-feat-scroll">
    <header class="ul-feat-head">
      <h3>One brand, from brief to launch.</h3>
      <p>Every request stays linked to the work, so everyone sees where it stands.</p>
    </header>
    <div class="ul-feat-body">
      <div class="ul-feat-steps">
        <article class="ul-feat-step on" data-i="0"><h4>Start from the brand</h4>
          <p>Colors, type and logo rules are loaded before anything is made.</p></article>
        <article class="ul-feat-step" data-i="1"><h4>Build with Claude</h4>
          <p>Describe what you need and Claude drafts it using those rules.</p></article>
        <article class="ul-feat-step" data-i="2"><h4>Review and ship</h4>
          <p>Check the result against the brand, then publish with confidence.</p></article>
      </div>
      <div class="ul-feat-panel"><div class="ul-feat-frame">
        <div class="ul-feat-card on" data-i="0"><b>Brand loaded</b>
          <div class="ul-feat-chips"><i style="background:#00e297"></i><i style="background:#0047ff"></i><i style="background:#000f9f"></i><i style="background:#000"></i></div>
          <span>Palette and MarkOT ready</span></div>
        <div class="ul-feat-card" data-i="1"><b>Draft in progress</b>
          <div class="ul-feat-bar"><i></i></div><span>Landing page, version 1</span></div>
        <div class="ul-feat-card" data-i="2"><b>Ready to ship</b>
          <ul><li>Colors match</li><li>Type is MarkOT</li><li>Logo has clear space</li></ul></div>
      </div></div>
    </div>
  </div>
</section>`,
  css: `.ul-feat{background:var(--bg)}
.ul-feat-scroll{height:520px;overflow-y:auto;padding:0 28px;scroll-behavior:smooth}
.ul-feat-head{padding:36px 0 8px;max-width:520px;text-align:left}
.ul-feat-head h3{margin:0;font-size:clamp(24px,4vw,34px);line-height:1.1;font-weight:700;letter-spacing:-.03em;color:var(--text)}
.ul-feat-head p{margin:12px 0 0;font-size:15px}
.ul-feat-body{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);gap:32px;align-items:start}
.ul-feat-step{min-height:360px;padding-top:56px;text-align:left;opacity:.4;transition:opacity .4s}
.ul-feat-step.on{opacity:1}
.ul-feat-step h4{margin:0 0 8px;font-size:20px;font-weight:600;letter-spacing:-.02em;color:var(--text)}
.ul-feat-step p{margin:0;max-width:300px;font-size:15px}
.ul-feat-panel{position:sticky;top:20px;padding:20px 0}
.ul-feat-frame{position:relative;height:360px;border-radius:18px;overflow:hidden;
  background:linear-gradient(145deg,#000f9f,#0047ff 55%,#00e297)}
.ul-feat-card{position:absolute;left:24px;right:24px;bottom:24px;display:flex;flex-direction:column;gap:12px;
  padding:18px;border-radius:16px;background:rgba(255,255,255,.94);color:#0d0d12;text-align:left;
  opacity:0;transform:translateY(16px);transition:opacity .4s,transform .5s cubic-bezier(.23,1,.32,1);pointer-events:none}
.ul-feat-card.on{opacity:1;transform:none}
.ul-feat-card b{font-size:15px;font-weight:600}.ul-feat-card span{font-size:13px;color:#5f5f6b}
.ul-feat-chips{display:flex;gap:8px}.ul-feat-chips i{width:34px;height:34px;border-radius:10px;border:1px solid rgba(0,0,0,.1)}
.ul-feat-bar{height:8px;border-radius:99px;background:#e6e6ea;overflow:hidden}
.ul-feat-bar i{display:block;width:62%;height:100%;border-radius:99px;background:linear-gradient(90deg,#0047ff,#00e297)}
.ul-feat-card ul{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px;font-size:13px;color:#2b2b35}
.ul-feat-card li::before{content:"";display:inline-block;width:8px;height:8px;margin-right:9px;border-radius:99px;background:#00e297}
@media(max-width:640px){.ul-feat-body{grid-template-columns:1fr}.ul-feat-panel{order:-1;top:0;z-index:2;background:var(--bg)}
  .ul-feat-frame{height:220px}.ul-feat-step{min-height:240px;padding-top:24px}}`,
  init: function features19(root) {
    var scroller = root.querySelector('.ul-feat-scroll');
    var steps = [].slice.call(root.querySelectorAll('.ul-feat-step'));
    var cards = [].slice.call(root.querySelectorAll('.ul-feat-card'));
    function show(i) {
      steps.forEach(function (s, k) { s.classList.toggle('on', k === i); });
      cards.forEach(function (c, k) { c.classList.toggle('on', k === i); });
    }
    function update() {
      var mid = scroller.getBoundingClientRect().top + scroller.clientHeight * 0.5, best = 0, bd = 1e9;
      steps.forEach(function (s, k) {
        var r = s.getBoundingClientRect(), d = Math.abs(r.top + 90 - mid);
        if (d < bd) { bd = d; best = k; }
      });
      show(best);
    }
    scroller.addEventListener('scroll', update, { passive: true });
    steps.forEach(function (s, k) { s.addEventListener('click', function () { scroller.scrollTo({ top: s.offsetTop - 120, behavior: 'smooth' }); }); });
    update();
  },
  vars: [['data-i', 'Index linking a step to its card'], ['.ul-feat-scroll height', 'Height of the scrolling area'], ['.ul-feat-frame', 'The pinned panel background'], ['min-height: 360px', 'Space each step occupies while scrolling']]
}

});
