/* Micro interactions. Every entry is the source shown on its docs page. */
Object.assign(window.ULComponents, {

'flip-card': {
  group: 'Micro Interactions', title: 'Flip Card',
  desc: 'A two-faced card that flips in 3D on a click, drag or flick, then settles on a spring.',
  usage: 'Click or press Enter to flip. Drag sideways to turn it by hand; a quick flick carries it to the far side. Everything runs on one spring, so the motion never snaps.',
  html: `<div class="ul-flip" tabindex="0" role="button" aria-pressed="false" aria-label="Flip card">
  <div class="ul-flip-inner">
    <div class="ul-flip-face ul-flip-front">
      <span class="ul-flip-kicker">Uplight</span>
      <strong>Brand styles</strong>
    </div>
    <div class="ul-flip-face ul-flip-back">
      <strong>Inside</strong>
      <ul><li>Colors</li><li>Typography</li><li>Logo</li></ul>
    </div>
  </div>
</div>`,
  css: `.ul-flip{width:220px;height:290px;margin:0 auto;perspective:900px;cursor:grab;
  touch-action:pan-y;user-select:none;outline-offset:8px}
.ul-flip:active{cursor:grabbing}
.ul-flip-inner{position:relative;width:100%;height:100%;transform-style:preserve-3d;
  transform:rotateY(var(--a,0deg))}
.ul-flip-face{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:flex-end;
  gap:6px;padding:22px;border-radius:18px;color:#fff;backface-visibility:hidden;
  -webkit-backface-visibility:hidden;box-shadow:0 18px 40px rgba(0,15,159,.22)}
.ul-flip-front{background:linear-gradient(145deg,#0047ff,#00e297)}
.ul-flip-back{transform:rotateY(180deg);background:linear-gradient(145deg,#000f9f,#0047ff)}
.ul-flip-face strong{font-size:22px;font-weight:700;letter-spacing:-.02em}
.ul-flip-kicker{font-size:12px;letter-spacing:.08em;text-transform:uppercase;opacity:.85}
.ul-flip-back ul{margin:0;padding:0;list-style:none;font-size:15px;line-height:1.8}`,
  init: function flipCard(root) {
    var card = root.querySelector('.ul-flip'), inner = card.firstElementChild;
    var angle = 0, target = 0, vel = 0, raf = 0, last = 0;
    var down = false, moved = false, startX = 0, lastX = 0, lastT = 0, flick = 0;
    function render() { inner.style.setProperty('--a', angle + 'deg'); }
    function step(ts) {
      if (!card.isConnected) return;
      var dt = Math.min((ts - last) / 1000 || 0.016, 0.032); last = ts;
      vel += ((target - angle) * 190 - vel * 18) * dt; // spring: stiffness 190, damping 18
      angle += vel * dt; render();
      if (Math.abs(target - angle) < 0.05 && Math.abs(vel) < 0.5) { angle = target; render(); raf = 0; return; }
      raf = requestAnimationFrame(step);
    }
    function run() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(step); } }
    function flipTo(t) {
      target = t; card.setAttribute('aria-pressed', String(Math.round(t / 180) % 2 !== 0)); run();
    }
    card.addEventListener('pointerdown', function (e) {
      down = true; moved = false; startX = lastX = e.clientX; lastT = performance.now(); flick = 0; vel = 0;
      card.setPointerCapture(e.pointerId);
    });
    card.addEventListener('pointermove', function (e) {
      if (!down) return;
      if (Math.abs(e.clientX - startX) > 4) moved = true;
      if (!moved) return;
      var now = performance.now(), dx = e.clientX - lastX;
      angle += dx * 0.9; target = angle; render();
      flick = dx * 0.9 / Math.max(now - lastT, 1); lastX = e.clientX; lastT = now;
    });
    function release() {
      if (!down) return; down = false;
      var rest = Math.round(angle / 180);
      if (!moved) rest = Math.round(target / 180) + 1;          // a click flips one side
      else rest = Math.round((angle + flick * 160) / 180);       // a flick carries further
      flipTo(rest * 180);
    }
    card.addEventListener('pointerup', release);
    card.addEventListener('pointercancel', release);
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flipTo(Math.round(target / 180) * 180 + 180); }
    });
  },
  vars: [['190 / 18', 'Spring stiffness and damping'], ['0.9', 'Degrees turned per pixel of drag'], ['160', 'How far a flick carries (ms of velocity)'], ['.ul-flip-front / back', 'Face backgrounds']]
},

'branched-menu': {
  group: 'Micro Interactions', title: 'Branched Menu',
  desc: 'A collapsible menu that branches each section from a trunk and traces a line to your pick.',
  usage: 'Open a section, then choose an item: the trunk fills down to it and the branch draws across. Collapse the section and the line retreats to its heading.',
  html: `<nav class="ul-tree" aria-label="Sections">
  <i class="ul-tree-trunk"><b></b></i>
  <div class="ul-tree-sec open">
    <button class="ul-tree-head" aria-expanded="true">Brand</button>
    <div class="ul-tree-items"><div>
      <button class="ul-tree-item">Colors</button>
      <button class="ul-tree-item">Typography</button>
      <button class="ul-tree-item">Logo</button>
    </div></div>
  </div>
  <div class="ul-tree-sec">
    <button class="ul-tree-head" aria-expanded="false">Skills</button>
    <div class="ul-tree-items"><div>
      <button class="ul-tree-item">Catalog</button>
      <button class="ul-tree-item">Authoring</button>
    </div></div>
  </div>
  <div class="ul-tree-sec">
    <button class="ul-tree-head" aria-expanded="false">Library</button>
    <div class="ul-tree-items"><div>
      <button class="ul-tree-item">Templates</button>
      <button class="ul-tree-item">Prompts</button>
    </div></div>
  </div>
</nav>`,
  css: `.ul-tree{position:relative;width:230px;margin:0 auto;padding-left:30px;text-align:left}
.ul-tree button{display:block;width:100%;text-align:left;font:inherit;background:none;border:0;
  color:var(--muted);cursor:pointer;transition:color .2s}
.ul-tree button:hover{color:var(--text)}
.ul-tree-trunk{position:absolute;left:8px;top:16px;bottom:16px;width:2px;border-radius:2px;
  background:var(--border)}
.ul-tree-trunk b{position:absolute;left:0;top:0;width:100%;height:var(--h,0px);border-radius:2px;
  background:linear-gradient(#0047ff,#00e297);transition:height .5s cubic-bezier(.23,1,.32,1)}
.ul-tree-head{position:relative;padding:8px 0;font-size:14px;font-weight:600;color:var(--text)!important}
.ul-tree-head::before{content:"";position:absolute;left:-26px;top:50%;width:10px;height:10px;
  margin-top:-5px;border-radius:99px;background:var(--bg);border:2px solid var(--borderStrong);
  transition:border-color .3s}
.ul-tree-sec.has .ul-tree-head::before{border-color:#0047ff}
.ul-tree-items{display:grid;grid-template-rows:0fr;transition:grid-template-rows .35s cubic-bezier(.23,1,.32,1)}
.ul-tree-items>div{overflow:hidden;min-height:0}
.ul-tree-sec.open .ul-tree-items{grid-template-rows:1fr}
.ul-tree-item{position:relative;padding:6px 0 6px 12px;font-size:14px}
.ul-tree-item::before{content:"";position:absolute;left:-22px;top:50%;width:30px;height:2px;
  border-radius:2px;background:linear-gradient(90deg,#0047ff,#00e297);transform:scaleX(0);
  transform-origin:left;transition:transform .35s .12s cubic-bezier(.23,1,.32,1)}
.ul-tree-item.on{color:var(--text);font-weight:500}
.ul-tree-item.on::before{transform:scaleX(1)}`,
  init: function branchedMenu(root) {
    var nav = root.querySelector('.ul-tree'), trunk = nav.querySelector('.ul-tree-trunk');
    var secs = [].slice.call(nav.querySelectorAll('.ul-tree-sec')), picked = null;
    function mid(el) {
      var n = nav.getBoundingClientRect(), r = el.getBoundingClientRect();
      return r.top - n.top + r.height / 2 - trunk.offsetTop;
    }
    function update() {
      secs.forEach(function (s) { s.classList.toggle('has', !!picked && s.contains(picked)); });
      var t = picked, sec = picked && picked.closest('.ul-tree-sec');
      if (sec && !sec.classList.contains('open')) t = sec.querySelector('.ul-tree-head');
      trunk.style.setProperty('--h', (t ? mid(t) : 0) + 'px');
    }
    secs.forEach(function (s) {
      var head = s.querySelector('.ul-tree-head');
      head.addEventListener('click', function () {
        var open = s.classList.toggle('open'); head.setAttribute('aria-expanded', String(open));
        update(); setTimeout(update, 380);
      });
    });
    [].forEach.call(nav.querySelectorAll('.ul-tree-item'), function (b) {
      b.addEventListener('click', function () {
        if (picked) picked.classList.remove('on');
        picked = b; b.classList.add('on'); update();
      });
    });
  },
  vars: [['.5s', 'How long the trunk takes to trace to a pick'], ['.35s', 'Section collapse speed'], ['linear-gradient', 'Trunk and branch color']]
},

'comet-dial': {
  group: 'Micro Interactions', title: 'Comet Dial',
  desc: 'A tick-ring dial you flick by angle, with a comet that streaks behind the lit head.',
  usage: 'Drag around the ring to turn it, or flick and let it spin down. The faster it moves, the longer the comet grows. Arrow keys nudge the value.',
  html: `<div class="ul-dial">
  <canvas width="240" height="240" tabindex="0" role="slider" aria-label="Dial"
    aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"></canvas>
  <output>0</output>
</div>`,
  css: `.ul-dial{position:relative;width:240px;height:240px;margin:0 auto}
.ul-dial canvas{display:block;width:240px;height:240px;touch-action:none;cursor:grab;border-radius:50%}
.ul-dial canvas:active{cursor:grabbing}
.ul-dial output{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
  pointer-events:none;font-size:44px;font-weight:700;letter-spacing:-.03em;color:var(--text);
  font-variant-numeric:tabular-nums}`,
  init: function cometDial(root) {
    var cv = root.querySelector('canvas'), out = root.querySelector('output');
    var dpr = window.devicePixelRatio || 1, S = 240, N = 72, TAU = Math.PI * 2;
    cv.width = cv.height = S * dpr;
    var g = cv.getContext('2d'); g.scale(dpr, dpr);
    var head = 0, vel = 0, drag = false, last = 0, lastAng = 0, lastT = 0, base = '#cfcfd8';
    function ang(e) { var r = cv.getBoundingClientRect(); return Math.atan2(e.clientX - r.left - r.width / 2, -(e.clientY - r.top - r.height / 2)); }
    cv.addEventListener('pointerdown', function (e) { drag = true; vel = 0; lastAng = ang(e); lastT = performance.now(); cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var a = ang(e), d = a - lastAng, now = performance.now();
      if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU;
      head += d; vel = vel * 0.6 + (d / Math.max((now - lastT) / 1000, 0.004)) * 0.4;
      lastAng = a; lastT = now;
    });
    function up() { drag = false; }
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { head += TAU / 20; vel = 2; }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { head -= TAU / 20; vel = -2; }
    });
    function mix(t) { // blue to green
      return 'rgb(' + Math.round(0 + 0 * t) + ',' + Math.round(71 + 155 * t) + ',' + Math.round(255 - 104 * t) + ')';
    }
    function frame(ts) {
      if (!cv.isConnected) return;
      var dt = Math.min((ts - last) / 1000 || 0.016, 0.05); last = ts;
      if (!drag) { head += vel * dt; vel *= Math.exp(-1.5 * dt); if (Math.abs(vel) < 0.02) vel = 0; }
      base = getComputedStyle(cv).getPropertyValue('--borderStrong').trim() || base;
      g.clearRect(0, 0, S, S);
      var dir = vel >= 0 ? 1 : -1, tail = Math.min(0.7 + Math.abs(vel) * 0.28, 3.4);
      var h = ((head % TAU) + TAU) % TAU;
      for (var i = 0; i < N; i++) {
        var a = (i / N) * TAU, behind = (((h - a) * dir) % TAU + TAU) % TAU;
        var lit = behind < tail ? Math.pow(1 - behind / tail, 2) : 0;
        var len = 9 + 15 * lit, r1 = 112, r0 = r1 - len;
        g.beginPath(); g.lineWidth = 2 + 1.5 * lit; g.lineCap = 'round';
        g.strokeStyle = lit > 0.02 ? mix(1 - lit) : base; g.globalAlpha = lit > 0.02 ? 0.25 + 0.75 * lit : 1;
        g.moveTo(120 + Math.sin(a) * r0, 120 - Math.cos(a) * r0);
        g.lineTo(120 + Math.sin(a) * r1, 120 - Math.cos(a) * r1); g.stroke();
      }
      g.globalAlpha = 1;
      var v = Math.round((h / TAU) * 100) % 100;
      if (out.textContent !== String(v)) { out.textContent = v; cv.setAttribute('aria-valuenow', v); }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  },
  vars: [['N = 72', 'Number of ticks'], ['0.7 + speed', 'Comet length at rest, plus growth with speed'], ['1.5', 'How quickly a flick spins down'], ['mix()', 'Blue-to-green comet color']]
},

'fuse-button': {
  group: 'Micro Interactions', title: 'Fuse Button',
  desc: 'An action button whose done state carries an undo on a burning fuse.',
  usage: 'After the action, Undo appears with a fuse burning across it. Press Undo before the spark reaches the end, or the action is committed.',
  replay: true,
  html: `<div class="ul-fuse" data-state="idle" style="--ms:4000ms">
  <button class="ul-fuse-main" type="button">Archive page</button>
  <span class="ul-fuse-done">
    <span class="ul-fuse-label">Archived</span>
    <button class="ul-fuse-undo" type="button">Undo
      <i class="ul-fuse-line"><b></b></i>
    </button>
  </span>
</div>`,
  css: `.ul-fuse{display:flex;justify-content:center}
.ul-fuse button{font:inherit;font-size:14px;font-weight:500;cursor:pointer;border:0;color:var(--text)}
.ul-fuse-main{height:42px;padding:0 20px;border-radius:999px;background:var(--text);color:var(--bg)!important;
  transition:transform .12s cubic-bezier(.23,1,.32,1)}
.ul-fuse-main:active{transform:scale(.96)}
.ul-fuse-done{display:none;align-items:center;gap:6px;height:42px;padding:0 6px 0 18px;
  border-radius:999px;border:1px solid var(--borderStrong);background:var(--bg)}
.ul-fuse-label{font-size:14px;font-weight:500;color:var(--text)}
.ul-fuse-undo{position:relative;height:30px;padding:0 14px;border-radius:999px;background:var(--surface);
  overflow:hidden;transition:background .15s}
.ul-fuse-undo:hover{background:var(--border)}
.ul-fuse-line{position:absolute;left:12px;right:12px;bottom:3px;height:2px;border-radius:2px;
  background:var(--border)}
.ul-fuse-line b{position:absolute;left:0;top:0;height:100%;width:100%;border-radius:2px;
  background:linear-gradient(90deg,#0047ff,#00e297);transform-origin:left}
.ul-fuse-line b::after{content:"";position:absolute;right:-3px;top:-2px;width:6px;height:6px;
  border-radius:99px;background:#00e297;box-shadow:0 0 6px 2px rgba(0,226,151,.8)}
.ul-fuse[data-state=idle] .ul-fuse-done,.ul-fuse[data-state=final] .ul-fuse-main,
.ul-fuse[data-state=done] .ul-fuse-main{display:none}
.ul-fuse[data-state=done] .ul-fuse-done,.ul-fuse[data-state=final] .ul-fuse-done{display:inline-flex}
.ul-fuse[data-state=final] .ul-fuse-undo{display:none}
.ul-fuse[data-state=final] .ul-fuse-done{padding:0 18px}
.ul-fuse[data-state=done] .ul-fuse-line b{animation:ul-burn var(--ms) linear forwards}
@keyframes ul-burn{to{width:0}}
@media(prefers-reduced-motion:reduce){.ul-fuse-line b::after{display:none}}`,
  init: function fuseButton(root) {
    var el = root.querySelector('.ul-fuse'), bar = el.querySelector('.ul-fuse-line b');
    el.querySelector('.ul-fuse-main').addEventListener('click', function () { el.dataset.state = 'done'; });
    el.querySelector('.ul-fuse-undo').addEventListener('click', function () { el.dataset.state = 'idle'; });
    bar.addEventListener('animationend', function () { if (el.dataset.state === 'done') el.dataset.state = 'final'; });
  },
  vars: [['--ms', 'How long the fuse burns before the action commits'], ['data-state', 'idle, done or final'], ['.ul-fuse-line b::after', 'The spark at the head of the fuse']]
},

'call-chip': {
  group: 'Micro Interactions', title: 'Call Chip',
  desc: 'A tool-call chip whose fill wipes across as a live timer ticks, ending green or shaking red.',
  usage: 'Set the duration with <code>data-ms</code> and the outcome with <code>data-result</code> (<code>ok</code> or <code>err</code>). The timer shows real elapsed time.',
  replay: true,
  html: `<div class="ul-chips">
  <div class="ul-chip" data-ms="2400" data-result="ok">
    <span class="ul-chip-fill"></span><span class="ul-chip-ic"></span>
    <span class="ul-chip-name">search_skills</span><span class="ul-chip-time">0.0s</span>
  </div>
  <div class="ul-chip" data-ms="1800" data-result="err">
    <span class="ul-chip-fill"></span><span class="ul-chip-ic"></span>
    <span class="ul-chip-name">fetch_template</span><span class="ul-chip-time">0.0s</span>
  </div>
</div>`,
  css: `.ul-chips{display:flex;flex-direction:column;align-items:center;gap:12px}
.ul-chip{--p:0;position:relative;display:inline-flex;align-items:center;gap:9px;height:36px;padding:0 14px 0 12px;
  overflow:hidden;border:1px solid var(--border);border-radius:999px;background:var(--bg);
  font:13px ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--text)}
.ul-chip>*{position:relative}
.ul-chip .ul-chip-fill{position:absolute;left:0;top:0;bottom:0;width:calc(var(--p) * 100%);
  background:rgba(0,71,255,.14);transition:background .3s}
.ul-chip-time{color:var(--muted);font-variant-numeric:tabular-nums;min-width:34px;text-align:right}
.ul-chip-ic{width:14px;height:14px;border-radius:99px;border:2px solid var(--borderStrong);
  border-top-color:#0047ff;animation:ul-spin .8s linear infinite}
.ul-chip.ok{border-color:rgba(0,226,151,.7)}.ul-chip.ok .ul-chip-fill{background:rgba(0,226,151,.22)}
.ul-chip.ok .ul-chip-ic{animation:none;border:0;background:#00e297;position:relative}
.ul-chip.ok .ul-chip-ic::after{content:"";position:absolute;left:5px;top:2.5px;width:3px;height:7px;
  border:solid #04210f;border-width:0 2px 2px 0;transform:rotate(45deg)}
.ul-chip.err{border-color:rgba(229,72,77,.7);animation:ul-shake .4s}
.ul-chip.err .ul-chip-fill{background:rgba(229,72,77,.2)}
.ul-chip.err .ul-chip-ic{animation:none;border:0;background:#e5484d;position:relative}
.ul-chip.err .ul-chip-ic::before,.ul-chip.err .ul-chip-ic::after{content:"";position:absolute;left:3px;top:6px;
  width:8px;height:2px;border-radius:2px;background:#fff;transform:rotate(45deg)}
.ul-chip.err .ul-chip-ic::after{transform:rotate(-45deg)}
@keyframes ul-spin{to{transform:rotate(360deg)}}
@keyframes ul-shake{20%{transform:translateX(-5px)}40%{transform:translateX(5px)}60%{transform:translateX(-3px)}80%{transform:translateX(2px)}}`,
  init: function callChip(root) {
    [].forEach.call(root.querySelectorAll('.ul-chip'), function (chip) {
      var ms = +chip.dataset.ms, t0 = performance.now(), time = chip.querySelector('.ul-chip-time');
      (function tick(now) {
        if (!chip.isConnected) return;
        var e = Math.min(now - t0, ms);
        chip.style.setProperty('--p', e / ms);
        time.textContent = (e / 1000).toFixed(1) + 's';
        if (e < ms) return requestAnimationFrame(tick);
        chip.classList.add(chip.dataset.result === 'err' ? 'err' : 'ok');
      })(t0);
    });
  },
  vars: [['data-ms', 'How long the call runs'], ['data-result', 'ok (green) or err (shaking red)'], ['--p', 'Fill progress, 0 to 1, set by the script']]
},

'peek-rating': {
  group: 'Micro Interactions', title: 'Peek Rating',
  desc: 'A star rating that lifts a wave of stars up to the pointer, then commits with a pop on click.',
  usage: 'Hover to see the wave; click to commit. Set the number of stars with <code>data-max</code>. Stars are real buttons, so Tab and Enter work.',
  html: `<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <defs><linearGradient id="ul-star-grad" x1="0" x2="1" y1="0" y2="1">
    <stop offset="0" stop-color="#0047ff"/><stop offset="1" stop-color="#00e297"/>
  </linearGradient></defs>
</svg>
<div class="ul-rating" data-max="5" role="group" aria-label="Rating"></div>
<p class="ul-rating-out" aria-live="polite">Not rated</p>`,
  css: `.ul-rating{display:flex;justify-content:center;gap:6px;padding:14px 0 8px;touch-action:none}
.ul-star{width:38px;height:38px;padding:0;border:0;background:none;cursor:pointer;
  transform:translateY(var(--y,0px)) scale(var(--s,1));transition:transform .18s cubic-bezier(.23,1,.32,1)}
.ul-star svg{display:block;width:100%;height:100%;fill:var(--border);stroke:var(--borderStrong);
  stroke-width:1;stroke-linejoin:round;transition:fill .15s}
.ul-star.on svg{fill:url(#ul-star-grad);stroke:transparent}
.ul-star.pop{animation:ul-pop .4s cubic-bezier(.23,1,.32,1)}
@keyframes ul-pop{40%{transform:translateY(var(--y,0px)) scale(1.35)}}
.ul-rating-out{margin:8px 0 0;text-align:center;font-size:13px;color:var(--muted)}`,
  init: function peekRating(root) {
    var box = root.querySelector('.ul-rating'), out = root.querySelector('.ul-rating-out');
    var max = +box.dataset.max, value = 0, hover = 0, stars = [];
    var path = 'M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z';
    for (var i = 0; i < max; i++) {
      var b = document.createElement('button');
      b.className = 'ul-star'; b.type = 'button'; b.setAttribute('aria-label', (i + 1) + ' of ' + max + ' stars');
      b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + path + '"/></svg>';
      (function (n) { b.addEventListener('click', function () {
        value = n; paint(); out.textContent = 'Rated ' + n + ' of ' + max;
        var s = stars[n - 1]; s.classList.remove('pop'); void s.offsetWidth; s.classList.add('pop');
      }); })(i + 1);
      box.appendChild(b); stars.push(b);
    }
    function paint() { stars.forEach(function (s, i) { s.classList.toggle('on', i < (hover || value)); }); }
    box.addEventListener('pointermove', function (e) {
      var x = e.clientX; hover = 0;
      stars.forEach(function (s, i) {
        var r = s.getBoundingClientRect(), d = Math.abs(x - (r.left + r.width / 2));
        var k = Math.max(0, 1 - d / 90); k *= k;                    // wave falloff
        s.style.setProperty('--y', (-12 * k).toFixed(1) + 'px');
        s.style.setProperty('--s', (1 + 0.18 * k).toFixed(3));
        if (x >= r.left - 3) hover = i + 1;
      });
      paint();
    });
    box.addEventListener('pointerleave', function () {
      hover = 0; stars.forEach(function (s) { s.style.setProperty('--y', '0px'); s.style.setProperty('--s', '1'); }); paint();
    });
  },
  vars: [['data-max', 'Number of stars'], ['90', 'Wave width in pixels'], ['-12px', 'How high the nearest star lifts'], ['url(#ul-star-grad)', 'Fill of committed stars']]
},

'pulse-heart': {
  group: 'Micro Interactions', title: 'Pulse Heart',
  desc: 'A like button that contracts to a dot, flips color and pulses back as the count ticks over.',
  usage: 'Toggle it to see the contract, flip and pulse. The count rolls to its new value. It is a real button with <code>aria-pressed</code>.',
  html: `<button class="ul-like" type="button" aria-pressed="false" aria-label="Like">
  <span class="ul-like-ic">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
  </span>
  <span class="ul-like-count"><span>128</span></span>
</button>`,
  css: `.ul-like{display:flex;align-items:center;gap:10px;margin:0 auto;height:44px;padding:0 18px 0 14px;
  border:1px solid var(--border);border-radius:999px;background:var(--bg);color:var(--muted);
  font:inherit;font-size:15px;font-weight:500;cursor:pointer;transition:border-color .2s,color .2s}
.ul-like:hover{border-color:var(--borderStrong)}
.ul-like-ic{display:flex;width:22px;height:22px}
.ul-like-ic svg{width:100%;height:100%;fill:currentColor}
.ul-like[aria-pressed=true]{color:#0047ff;border-color:rgba(0,71,255,.45)}
.ul-like.pulse .ul-like-ic{animation:ul-heart .6s cubic-bezier(.23,1,.32,1)}
@keyframes ul-heart{0%{transform:scale(1)}28%{transform:scale(.18)}60%{transform:scale(1.28)}100%{transform:scale(1)}}
.ul-like-count{position:relative;display:block;height:22px;min-width:28px;overflow:hidden;
  font-variant-numeric:tabular-nums;text-align:left}
.ul-like-count span{display:block;line-height:22px}`,
  init: function pulseHeart(root) {
    var btn = root.querySelector('.ul-like'), box = root.querySelector('.ul-like-count');
    var n = 128, on = false, ease = 'cubic-bezier(.23,1,.32,1)';
    btn.addEventListener('click', function () {
      on = !on; n += on ? 1 : -1;
      btn.classList.remove('pulse'); void btn.offsetWidth; btn.classList.add('pulse');
      setTimeout(function () { btn.setAttribute('aria-pressed', String(on)); }, 170); // flip colour while it is a dot
      var old = box.firstElementChild, next = document.createElement('span'), dir = on ? 1 : -1;
      next.textContent = n; box.appendChild(next);
      next.style.position = 'absolute'; next.style.left = 0; next.style.top = 0;
      old.animate([{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(' + (-22 * dir) + 'px)', opacity: 0 }], { duration: 380, easing: ease, fill: 'forwards' });
      next.animate([{ transform: 'translateY(' + (22 * dir) + 'px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }], { duration: 380, easing: ease }).onfinish = function () {
        next.style.position = ''; if (old.parentNode) old.remove();
      };
    });
  },
  vars: [['.6s', 'Pulse duration'], ['scale(.18)', 'Size of the dot it contracts to'], ['170ms', 'When the color flips, while it is smallest'], ['#0047ff', 'Liked color']]
},

'scrub-field': {
  group: 'Micro Interactions', title: 'Scrub Field',
  desc: 'A number chip you drag to scrub, with rubber-band limits and click to type.',
  usage: 'Drag a value left or right. Past its limits it stretches and springs back. Click without moving to type a number; Enter commits, Escape cancels. Arrow keys step it.',
  html: `<div class="ul-scrubs">
  <div class="ul-scrub" data-min="0" data-max="100" data-value="60" data-unit="%" data-var="--o">
    <span class="ul-scrub-name">Opacity</span><button class="ul-scrub-val" type="button">60%</button>
  </div>
  <div class="ul-scrub" data-min="0" data-max="48" data-value="16" data-unit="px" data-var="--r">
    <span class="ul-scrub-name">Radius</span><button class="ul-scrub-val" type="button">16px</button>
  </div>
  <div class="ul-scrub-demo"></div>
</div>`,
  css: `.ul-scrubs{--o:60;--r:16;display:flex;flex-direction:column;align-items:center;gap:12px}
.ul-scrub{display:flex;align-items:center;justify-content:space-between;gap:24px;width:240px;
  padding:6px 6px 6px 14px;border:1px solid var(--border);border-radius:12px;background:var(--bg);font-size:14px}
.ul-scrub-name{color:var(--muted)}
.ul-scrub-val,.ul-scrub-in{min-width:68px;height:32px;padding:0 10px;border:0;border-radius:8px;
  background:var(--surface);color:var(--text);font:inherit;font-weight:500;text-align:center;
  font-variant-numeric:tabular-nums;cursor:ew-resize;touch-action:none;user-select:none;
  box-shadow:inset 0 0 0 1px var(--border)}
.ul-scrub-val.rest{transition:transform .45s cubic-bezier(.23,1,.32,1)}
.ul-scrub-val:hover{box-shadow:inset 0 0 0 1px var(--borderStrong)}
.ul-scrub-in{cursor:text;outline:2px solid #0047ff;outline-offset:-1px;width:76px}
.ul-scrub-demo{width:84px;height:84px;margin-top:6px;background:linear-gradient(135deg,#0047ff,#00e297);
  opacity:calc(var(--o) / 100);border-radius:calc(var(--r) * 1px)}`,
  init: function scrubField(root) {
    var host = root.querySelector('.ul-scrubs');
    [].forEach.call(root.querySelectorAll('.ul-scrub'), function (f) {
      var min = +f.dataset.min, max = +f.dataset.max, unit = f.dataset.unit, v = +f.dataset.value;
      var btn = f.querySelector('.ul-scrub-val'), per = (max - min) / 200; // 200px sweeps the whole range
      function clamp(x) { return Math.min(max, Math.max(min, x)); }
      function show() { btn.textContent = Math.round(v) + unit; host.style.setProperty(f.dataset.var, Math.round(v)); }
      var down = false, moved = false, sx = 0, sv = 0;
      btn.addEventListener('pointerdown', function (e) {
        down = true; moved = false; sx = e.clientX; sv = v; btn.classList.remove('rest'); btn.setPointerCapture(e.pointerId);
      });
      btn.addEventListener('pointermove', function (e) {
        if (!down) return;
        var dx = e.clientX - sx; if (Math.abs(dx) > 3) moved = true; if (!moved) return;
        var raw = sv + dx * per; v = clamp(raw);
        var over = (raw - v) / per;                                    // pixels beyond the limit
        var pull = Math.sign(over) * 22 * (1 - Math.exp(-Math.abs(over) / 70)); // rubber band
        btn.style.transform = 'translateX(' + pull.toFixed(1) + 'px)'; show();
      });
      function end() {
        if (!down) return; down = false;
        if (moved) { btn.classList.add('rest'); btn.style.transform = ''; return; }
        var input = document.createElement('input');
        input.className = 'ul-scrub-in'; input.value = Math.round(v); input.inputMode = 'numeric';
        input.setAttribute('aria-label', 'Value'); btn.replaceWith(input); input.focus(); input.select();
        var done = false;
        function finish(commit) {
          if (done) return; done = true;
          if (commit && !isNaN(parseFloat(input.value))) v = clamp(parseFloat(input.value));
          input.replaceWith(btn); show();
        }
        input.addEventListener('keydown', function (e) { if (e.key === 'Enter') finish(true); if (e.key === 'Escape') finish(false); });
        input.addEventListener('blur', function () { finish(true); });
      }
      btn.addEventListener('pointerup', end); btn.addEventListener('pointercancel', end);
      btn.addEventListener('keydown', function (e) {
        var s = e.shiftKey ? 10 : 1;
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { v = clamp(v + s); show(); e.preventDefault(); }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { v = clamp(v - s); show(); e.preventDefault(); }
      });
      show();
    });
  },
  vars: [['data-min / data-max', 'Limits of the value'], ['data-unit', 'Suffix shown after the number'], ['data-var', 'CSS variable the value is written to'], ['200px', 'Drag distance that sweeps the full range']]
},

'spring-check': {
  group: 'Micro Interactions', title: 'Spring Check',
  desc: 'A checkbox row where one spring fills the box, draws the tick and strikes through the label.',
  usage: 'A single spring value, <code>--p</code>, drives the fill, the tick and the strike-through together, so they overshoot and settle as one. Inputs are real checkboxes.',
  html: `<ul class="ul-sc">
  <li><label class="ul-sc-row"><input type="checkbox">
    <span class="ul-sc-box"><svg viewBox="0 0 16 16" aria-hidden="true"><path pathLength="1" d="M3.5 8.5l3 3 6-7"/></svg></span>
    <span class="ul-sc-text">Review brand colors<i></i></span></label></li>
  <li><label class="ul-sc-row"><input type="checkbox" checked>
    <span class="ul-sc-box"><svg viewBox="0 0 16 16" aria-hidden="true"><path pathLength="1" d="M3.5 8.5l3 3 6-7"/></svg></span>
    <span class="ul-sc-text">Set MarkOT as typeface<i></i></span></label></li>
  <li><label class="ul-sc-row"><input type="checkbox">
    <span class="ul-sc-box"><svg viewBox="0 0 16 16" aria-hidden="true"><path pathLength="1" d="M3.5 8.5l3 3 6-7"/></svg></span>
    <span class="ul-sc-text">Place the logo<i></i></span></label></li>
</ul>`,
  css: `.ul-sc{margin:0 auto;padding:0;list-style:none;width:260px}
.ul-sc-row{--p:0;display:flex;align-items:center;gap:12px;padding:10px 4px;cursor:pointer;font-size:15px}
.ul-sc-row input{position:absolute;opacity:0;pointer-events:none}
.ul-sc-box{position:relative;flex:none;width:22px;height:22px;border-radius:7px;
  border:1.5px solid var(--borderStrong);display:grid;place-items:center}
.ul-sc-box::before{content:"";position:absolute;inset:-1.5px;border-radius:7px;
  background:linear-gradient(135deg,#0047ff,#00e297);transform:scale(var(--p));opacity:min(var(--p),1)}
.ul-sc-box svg{position:relative;width:14px;height:14px;fill:none;stroke:#fff;stroke-width:2;
  stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1 2;stroke-dashoffset:calc(1 - var(--p))}
.ul-sc-row input:focus-visible+.ul-sc-box{outline:2px solid #0047ff;outline-offset:2px}
.ul-sc-text{position:relative;color:var(--text);opacity:calc(1 - .5 * min(var(--p), 1))}
.ul-sc-text i{position:absolute;left:0;top:52%;width:100%;height:1.5px;background:currentColor;
  transform:scaleX(min(var(--p), 1));transform-origin:left}`,
  init: function springCheck(root) {
    [].forEach.call(root.querySelectorAll('.ul-sc-row'), function (row) {
      var input = row.querySelector('input'), p = input.checked ? 1 : 0, v = 0, raf = 0, last = 0;
      row.style.setProperty('--p', p);
      function step(ts) {
        if (!row.isConnected) return;
        var dt = Math.min((ts - last) / 1000 || 0.016, 0.032); last = ts;
        var target = input.checked ? 1 : 0;
        v += ((target - p) * 320 - v * 16) * dt;                       // one spring: stiffness 320, damping 16
        p += v * dt; row.style.setProperty('--p', p.toFixed(4));
        if (Math.abs(target - p) < 0.001 && Math.abs(v) < 0.01) { p = target; row.style.setProperty('--p', p); raf = 0; return; }
        raf = requestAnimationFrame(step);
      }
      input.addEventListener('change', function () { if (!raf) { last = performance.now(); raf = requestAnimationFrame(step); } });
    });
  },
  vars: [['320 / 16', 'Spring stiffness and damping'], ['--p', 'Spring value, shared by fill, tick and strike'], ['stroke-dasharray', 'Tick draw-in, tied to --p']]
}

});
