/* Interface, background and gallery components. */
Object.assign(window.ULComponents, {

'signal-map': {
  group: 'Interface', title: 'Signal Map', wide: true,
  desc: 'A dotted world map with signals arcing between cities.',
  usage: 'Signals fly between cities on their own. Hover a city to see its name; click it to send signals out to a few others. Replace the <code>CITIES</code> list with your own sites.',
  html: `<div class="ul-map">
  <canvas aria-label="Dotted world map with signals arcing between cities" role="img"></canvas>
</div>`,
  css: `.ul-map{position:relative;width:100%}
.ul-map canvas{display:block;width:100%;height:auto;cursor:default}`,
  init: function signalMap(root) {
    var cv = root.querySelector('canvas'), g = cv.getContext('2d');
    // Land mask: 160 columns x 68 rows, lat 78 to -58, one bit per cell, hex encoded.
    var LAND = [
      '0000003004f8ffffff00010000000006000000000000000395f803fffe000000006001ffc00760000000007896fc01fffc00000000800ffffd8000008020004fc6ff007ffc00000800837ffffffffffe',
      '01ffffffffffffffffffff00ffe48000000000101ffffffffffffffffffffc003800800000000000dffffffffffffffffffff860400000000000000001ffffffff00e07800001f3fffffffffffffffff',
      '01fffffffc07803800003f3ffffffffffffff97800f03ffffc0790000000373ffffffffffffe1100005007ffff03f80000060e7ffffffffffffc0780010003ffffe7fc000002007ffffffffffff00700',
      '000001fffff7fe00000b3fffffffffffffff0600000001fffffffc0000037ffffffffffffffd0000000000ffffffe3000001fffffffffffffffd00000000007fffff60000001fffffffffffffffd0000',
      '0000007fffffd0000001f9f9f9fffffffff800000000007fffff8000000f84f039fffffffff300000000007fffff0000000f0377fcffffffffc200000000007ffffe0000000f014ffcfffffff0820000',
      '0000003ffffc0000000e0a0ffefffffffcc600000000003ffffc00000007f812fffffffff89c00000000000ffff80000000ff800fffffffffc2000000000000bfff00000000fff7ffffffffffc000000',
      '00000007fc100000001ffffdf9fffffffc00000000000005f8100000003ffffefcfffffff800000000000002f8000000007ffffe7e83fffff80000000000000078100000007fffff7fc1fffff4000000',
      '000000007884000000ffffffffc1fe7f000000000000000039808000007fffffbfc0fc3e80000000000000001f800000007fffff9f00783f040000000000000001e0000000ffffffdc00701f04000000',
      '0000000000600000007ffffff000700780000000000000000021c000007fffffe60020030300000000000000000bf800003ffffffc00200000000000000000000007fc00001ffffffc00100801000000',
      '000000000003ff8000093ffff800002418000000000000000007ff8000000ffff800001430000000000000000007ffc000000ffff000000cf900000000000000000fffc000000fffe000000476300000',
      '00000000000ffffc00000fffc0000006705e000000000000000fffff000007ff800000020607900000000000000fffff800003ffc0000001c0038000000000000007ffff000003ffc000000001014100',
      '000000000007ffff000003ffc000000000000000000000000003fffe000003ffc000000000390000000000000003fffe000007ffc400000000f18000000000000000fffe000007ff8c00000003fd8000',
      '0000000000007ffc000003ff0c00000003ff80000000000000007ffc000003ff0c0000000fffc0400000000000007ff8000003ff180000001fffe0000000000000007fe0000001fe080000001ffff000',
      '0000000000007fc0000001fe000000001ffff000000000000000ffc0000001fc000000001ffff000000000000000ff80000000f8000000001ffff000000000000000ff80000000f0000000001e0fe000',
      '000000000000fc0000000000000000000003e000000000000000fe0000000000000000000003e000000000000001f000000000000000000000000006000000000001f00000000000000000000000c008',
      '000000000000e000000000000000000000004008000000000001e000000000000000000000000030000000000001c000000000000000000000000000000000000003c000000000000000000000000000',
      '0000000000018000000000000000000000000000000000000001c000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000000000'
    ].join('');
    var COLS = 160, ROWS = 68, LAT_TOP = 78, LAT_SPAN = 136;
    var CITIES = [['New York', 40.7, -74], ['Denver', 39.7, -105], ['San Francisco', 37.8, -122.4], ['Mexico City', 19.4, -99.1],
      ['Sao Paulo', -23.5, -46.6], ['London', 51.5, -0.1], ['Frankfurt', 50.1, 8.7], ['Lagos', 6.5, 3.4],
      ['Johannesburg', -26.2, 28], ['Dubai', 25.2, 55.3], ['Mumbai', 19.1, 72.9], ['Singapore', 1.35, 103.8],
      ['Tokyo', 35.7, 139.7], ['Sydney', -33.9, 151.2]];
    var W = 0, H = 0, dpr = window.devicePixelRatio || 1, cell = 0;
    var dots = [], pts = [], layer = null, base = '#cfcfd8', frames = 0;
    var signals = [], ripples = [], hover = -1, lastLaunch = 0;
    function bit(c, r) { return (parseInt(LAND.charAt(r * 40 + (c >> 2)), 16) >> (3 - (c & 3))) & 1; }
    function layout() {
      W = cv.parentNode.clientWidth || 560; cell = W / COLS; H = Math.round(cell * ROWS * (LAT_SPAN / ROWS) / (360 / COLS));
      cv.width = W * dpr; cv.height = H * dpr; cv.style.height = H + 'px';
      dots = [];
      for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) if (bit(c, r)) dots.push([(c + 0.5) * cell, (r + 0.5) * H / ROWS]);
      pts = CITIES.map(function (p) { return { name: p[0], x: (p[2] + 180) / 360 * W, y: (LAT_TOP - p[1]) / LAT_SPAN * H }; });
      paintLayer();
    }
    function paintLayer() {
      layer = document.createElement('canvas'); layer.width = W * dpr; layer.height = H * dpr;
      var l = layer.getContext('2d'); l.scale(dpr, dpr); l.fillStyle = base;
      dots.forEach(function (d) { l.beginPath(); l.arc(d[0], d[1], cell * 0.3, 0, 6.2832); l.fill(); });
    }
    function launch(a, b) { if (a === b) return; signals.push({ a: a, b: b, t0: performance.now(), dur: 1100 + Math.hypot(pts[a].x - pts[b].x, pts[a].y - pts[b].y) * 4 }); }
    function pos(s, u) {
      var A = pts[s.a], B = pts[s.b], mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2 - Math.hypot(A.x - B.x, A.y - B.y) * 0.3;
      var k = 1 - u; return [k * k * A.x + 2 * k * u * mx + u * u * B.x, k * k * A.y + 2 * k * u * my + u * u * B.y];
    }
    function nearest(e) {
      var r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, best = -1, bd = 14;
      pts.forEach(function (p, i) { var d = Math.hypot(p.x - x, p.y - y); if (d < bd) { bd = d; best = i; } });
      return best;
    }
    cv.addEventListener('pointermove', function (e) { hover = nearest(e); cv.style.cursor = hover > -1 ? 'pointer' : 'default'; });
    cv.addEventListener('pointerleave', function () { hover = -1; });
    cv.addEventListener('click', function (e) {
      var i = nearest(e); if (i < 0) return;
      for (var k = 0; k < 3; k++) launch(i, Math.floor(Math.random() * pts.length));
    });
    function frame(now) {
      if (!cv.isConnected) return;
      if (frames++ % 40 === 0) { var c = getComputedStyle(cv).getPropertyValue('--borderStrong').trim(); if (c && c !== base) { base = c; paintLayer(); } }
      if (now - lastLaunch > 780) { lastLaunch = now; launch(Math.floor(Math.random() * pts.length), Math.floor(Math.random() * pts.length)); }
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H); g.drawImage(layer, 0, 0, W, H);
      // ripples light up the dots around a city
      ripples = ripples.filter(function (r) { return now - r.t0 < 1500; });
      ripples.forEach(function (r) {
        var t = (now - r.t0) / 1500, R = t * cell * 16, fade = 1 - t;
        dots.forEach(function (d) {
          var dd = Math.hypot(d[0] - r.x, d[1] - r.y), k = Math.exp(-Math.pow((dd - R) / (cell * 2.2), 2)) * fade;
          if (k > 0.05) { g.fillStyle = 'rgba(0,226,151,' + (k * 0.95).toFixed(2) + ')'; g.beginPath(); g.arc(d[0], d[1], cell * 0.42, 0, 6.2832); g.fill(); }
        });
      });
      // signals
      signals = signals.filter(function (s) {
        var u = (now - s.t0) / s.dur;
        if (u >= 1) { ripples.push({ x: pts[s.b].x, y: pts[s.b].y, t0: now }); return false; }
        var e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
        for (var i = 0; i < 14; i++) {
          var p = pos(s, Math.max(0, e - i * 0.012)), a = (1 - i / 14);
          g.fillStyle = 'rgba(0,71,255,' + (a * 0.9).toFixed(2) + ')'; g.beginPath(); g.arc(p[0], p[1], 2.2 * a + 0.4, 0, 6.2832); g.fill();
        }
        var h = pos(s, e); g.fillStyle = '#00e297'; g.beginPath(); g.arc(h[0], h[1], 2.6, 0, 6.2832); g.fill();
        return true;
      });
      // markers + hover label
      pts.forEach(function (p, i) {
        g.fillStyle = i === hover ? '#00e297' : '#0047ff'; g.beginPath(); g.arc(p.x, p.y, i === hover ? 4.5 : 3, 0, 6.2832); g.fill();
      });
      if (hover > -1) {
        var P = pts[hover]; g.font = '500 12px MarkOT, system-ui, sans-serif'; var tw = g.measureText(P.name).width + 16;
        var lx = Math.min(Math.max(P.x - tw / 2, 4), W - tw - 4), ly = P.y - 30;
        g.fillStyle = 'rgba(15,14,20,.92)'; g.beginPath(); g.roundRect ? g.roundRect(lx, ly, tw, 22, 7) : g.rect(lx, ly, tw, 22); g.fill();
        g.fillStyle = '#fff'; g.fillText(P.name, lx + 8, ly + 15);
      }
      requestAnimationFrame(frame);
    }
    layout();
    if (window.ResizeObserver) new ResizeObserver(function () { if (cv.parentNode && cv.parentNode.clientWidth !== W) layout(); }).observe(root);
    requestAnimationFrame(frame);
  },
  vars: [['CITIES', 'Name, latitude and longitude of each point'], ['780', 'Milliseconds between automatic signals'], ['0.3', 'How far each route bows upward'], ['LAND', 'Land mask. Swap for another region if you re-rasterize']]
},

'stipple-gradient': {
  group: 'Backgrounds', title: 'Stipple Gradient', wide: true,
  desc: 'A slow-folding Uplight gradient dithered into fine stipple.',
  usage: 'A WebGL shader folds two colors together and dithers the result to a few levels per channel. Raise <code>uLevels</code> for a finer grain, lower it for bolder dots. It falls back to a plain gradient without WebGL.',
  html: `<div class="ul-stipple"><canvas aria-hidden="true"></canvas></div>`,
  css: `.ul-stipple{position:relative;width:100%;height:300px;border-radius:12px;overflow:hidden;
  background:linear-gradient(135deg,#0047ff,#00e297 60%,#05060f)}
.ul-stipple canvas{position:absolute;inset:0;width:100%;height:100%;display:block}`,
  init: function stippleGradient(root) {
    var box = root.querySelector('.ul-stipple'), cv = box.querySelector('canvas');
    var gl = cv.getContext('webgl', { antialias: false }); if (!gl) return;
    var vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    var fs = 'precision highp float;uniform vec2 uRes;uniform float uTime,uPx,uLevels;' +
      'uniform vec3 uA,uB,uBg;' +
      'float ign(vec2 p){return fract(52.9829189*fract(dot(p,vec2(0.06711056,0.00583715))));}' +
      'void main(){' +
      ' vec2 cell=floor(gl_FragCoord.xy/uPx);' +
      ' vec2 uv=gl_FragCoord.xy/uRes; vec2 p=vec2(uv.x*uRes.x/uRes.y,uv.y)*1.3; float t=uTime*0.1;' +
      ' for(int i=0;i<6;i++){float f=float(i);' +
      '  p+=0.32*vec2(sin(p.y*1.7+t+f*1.3),cos(p.x*1.9-t*1.1+f*2.1));' +
      '  p=mat2(0.8776,-0.4794,0.4794,0.8776)*p;}' +
      ' float m=0.5+0.5*sin(p.x*1.5+p.y*0.9+t);' +
      ' vec3 col=mix(uA,uB,smoothstep(0.,1.,m));' +
      ' col=mix(uBg,col,smoothstep(0.05,0.85,distance(uv,vec2(0.,0.))));' +
      ' vec3 q=floor(col*(uLevels-1.)+ign(cell))/(uLevels-1.);' +
      ' gl_FragColor=vec4(q,1.);}';
    function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; }
    var pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(pr); if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return; gl.useProgram(pr);
    var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var U = function (n) { return gl.getUniformLocation(pr, n); };
    gl.uniform3f(U('uA'), 0 / 255, 71 / 255, 255 / 255);
    gl.uniform3f(U('uB'), 0 / 255, 226 / 255, 151 / 255);
    gl.uniform3f(U('uBg'), 5 / 255, 6 / 255, 15 / 255);
    gl.uniform1f(U('uLevels'), 4);
    var dpr = Math.min(window.devicePixelRatio || 1, 2), t0 = performance.now();
    function size() { cv.width = box.clientWidth * dpr; cv.height = box.clientHeight * dpr; gl.viewport(0, 0, cv.width, cv.height); gl.uniform2f(U('uRes'), cv.width, cv.height); gl.uniform1f(U('uPx'), 1.5 * dpr); }
    size(); if (window.ResizeObserver) new ResizeObserver(size).observe(box);
    var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    (function draw(now) {
      if (!cv.isConnected) return;
      gl.uniform1f(U('uTime'), still ? 8 : (now - t0) / 1000); gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!still) requestAnimationFrame(draw);
    })(t0);
  },
  vars: [['uA / uB', 'The two gradient colors (Uplight blue and green)'], ['uBg', 'Deep corner color the gradient melts into'], ['uLevels', 'Colour levels per channel, 4 by default'], ['uPx', 'Size of each stipple dot in pixels'], ['0.1', 'Speed of the fold animation']]
},

'animated-list': {
  group: 'Interface', title: 'Animated List',
  desc: 'A live notification feed with cards that morph into place.',
  usage: 'New cards grow out of their icon at the top while older ones dim and leave at the bottom. The feed pauses on hover. The text here is sample content.',
  html: `<div class="ul-feed" data-interval="2600" data-max="6">
  <ol class="ul-feed-list" aria-live="polite"></ol>
</div>`,
  css: `.ul-feed{position:relative;height:330px;overflow:hidden;
  -webkit-mask-image:linear-gradient(#000 62%,transparent);mask-image:linear-gradient(#000 62%,transparent)}
.ul-feed-list{margin:0;padding:0;list-style:none}
.ul-n{display:grid;grid-template-rows:0fr;opacity:var(--o,1);
  transition:grid-template-rows .85s cubic-bezier(.23,1,.32,1),opacity .6s}
.ul-n.in{grid-template-rows:1fr}
.ul-n>div{min-height:0;overflow:hidden;padding-bottom:10px}
.ul-n-card{display:flex;align-items:center;gap:12px;width:100%;max-width:58px;padding:9px;
  border:1px solid var(--border);border-radius:20px;background:var(--bg);
  transition:max-width .85s .12s cubic-bezier(.23,1,.32,1)}
.ul-n.in .ul-n-card{max-width:100%}
.ul-n-ic{flex:none;display:grid;place-items:center;width:38px;height:38px;border-radius:13px;
  background:linear-gradient(135deg,var(--c1),var(--c2));color:#fff;font-size:15px;font-weight:700}
.ul-n-tx{flex:1;min-width:0;text-align:left;opacity:0;transition:opacity .4s .45s}
.ul-n-tx b,.ul-n-tx span{display:block;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.ul-n-tx b{font-size:14px;font-weight:600;color:var(--text)}
.ul-n-tx span{font-size:13px;color:var(--muted)}
.ul-n time{flex:none;opacity:0;padding-right:6px;font-size:12px;color:var(--muted);
  font-variant-numeric:tabular-nums;transition:opacity .4s .45s}
.ul-n.in .ul-n-tx,.ul-n.in time{opacity:1}
@media(prefers-reduced-motion:reduce){.ul-n,.ul-n-card,.ul-n-tx,.ul-n time{transition:none}}`,
  init: function animatedList(root) {
    var feed = root.querySelector('.ul-feed'), list = feed.firstElementChild;
    var every = +feed.dataset.interval, max = +feed.dataset.max, paused = false, n = 0;
    var pool = [
      ['B', 'Brand skill updated', 'The UCC 2027 palette is in the catalog', '#0047ff', '#00e297'],
      ['T', 'New template', 'The quarterly deck is ready to use', '#000f9f', '#0047ff'],
      ['P', 'Prompt added', 'Webinar follow-up email, tested', '#0047ff', '#000f9f'],
      ['R', 'Review requested', 'Landing page copy needs a second look', '#00b87a', '#0047ff'],
      ['C', 'Component published', 'Chroma Card joined the library', '#0047ff', '#00e297'],
      ['F', 'Fonts refreshed', 'MarkOT Medium was added', '#000f9f', '#00e297']
    ];
    feed.addEventListener('pointerenter', function () { paused = true; });
    feed.addEventListener('pointerleave', function () { paused = false; });
    function ago(t) { var s = Math.floor((Date.now() - t) / 1000); return s < 5 ? 'now' : s < 60 ? s + 's' : Math.floor(s / 60) + 'm'; }
    function dim() { [].forEach.call(list.children, function (li, i) { li.style.setProperty('--o', Math.max(0.28, 1 - i * 0.15)); }); }
    function add(instant) {
      var d = pool[n++ % pool.length], li = document.createElement('li');
      li.className = 'ul-n'; li.dataset.t = Date.now();
      li.style.setProperty('--c1', d[3]); li.style.setProperty('--c2', d[4]);
      li.innerHTML = '<div><div class="ul-n-card"><span class="ul-n-ic">' + d[0] + '</span>' +
        '<span class="ul-n-tx"><b>' + d[1] + '</b><span>' + d[2] + '</span></span><time>now</time></div></div>';
      list.insertBefore(li, list.firstChild); dim();
      if (instant) li.classList.add('in'); else { void li.offsetWidth; li.classList.add('in'); }
      while (list.children.length > max) {
        var old = list.lastElementChild; old.classList.remove('in'); old.style.setProperty('--o', 0);
        (function (o) { setTimeout(function () { o.remove(); }, 900); })(old);
        list.removeChild(old); list.appendChild(old);   // keep it last while it collapses
        break;
      }
    }
    for (var i = 0; i < 4; i++) add(true);
    (function loop() {
      setTimeout(function () {
        if (!feed.isConnected) return;
        if (!paused) add(false);
        loop();
      }, every);
    })();
    setInterval(function () {
      if (!feed.isConnected) return;
      [].forEach.call(list.children, function (li) { var t = li.querySelector('time'); if (t) t.textContent = ago(+li.dataset.t); });
    }, 1000);
  },
  vars: [['data-interval', 'Milliseconds between new cards'], ['data-max', 'Cards kept before the oldest leaves'], ['pool', 'The sample items the feed cycles through'], ['--o', 'Opacity of older cards']]
},

'gradient-carousel': {
  group: 'Interface', title: 'Gradient Carousel', wide: true,
  desc: 'A 3D carousel that tints the background from each card.',
  usage: 'Drag, flick, scroll sideways, use the arrow buttons or the arrow keys. The glow behind the carousel takes the color of the centered card. Slides are described in <code>data-slides</code> as title and two colors.',
  html: `<div class="ul-gc" tabindex="0" role="region" aria-roledescription="carousel" aria-label="Gradient carousel"
  data-slides='[["Brand styles","#0047ff","#00e297"],["Skills","#000f9f","#0047ff"],["Components","#00b87a","#0047ff"],["Templates","#0047ff","#000f9f"],["Prompts","#00e297","#0047ff"],["Resources","#000f9f","#00e297"]]'>
  <div class="ul-gc-bg"></div>
  <div class="ul-gc-track"></div>
  <button class="ul-gc-btn ul-gc-prev" aria-label="Previous slide"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>
  <button class="ul-gc-btn ul-gc-next" aria-label="Next slide"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>
</div>`,
  css: `@property --ul-tint{syntax:'<color>';inherits:false;initial-value:#0047ff}
.ul-gc{--ul-tint:#0047ff;position:relative;height:340px;overflow:hidden;border-radius:14px;
  background:var(--surface);perspective:1100px;touch-action:pan-y;outline-offset:4px;cursor:grab;
  transition:--ul-tint .7s ease}
.ul-gc:active{cursor:grabbing}
.ul-gc-bg{position:absolute;inset:-25%;pointer-events:none;filter:blur(30px);opacity:.5;
  background:radial-gradient(50% 55% at 50% 55%,var(--ul-tint),transparent 72%)}
.ul-gc-track{position:absolute;inset:0;transform-style:preserve-3d}
.ul-gc-card{position:absolute;left:50%;top:50%;display:flex;align-items:flex-end;width:190px;height:190px;
  margin:-95px 0 0 -95px;padding:16px;border-radius:20px;color:#fff;font-size:18px;font-weight:700;
  letter-spacing:-.02em;box-shadow:0 18px 40px rgba(5,10,40,.28);will-change:transform;user-select:none}
.ul-gc-btn{position:absolute;top:50%;width:36px;height:36px;margin-top:-18px;border:0;border-radius:99px;
  background:var(--bg);color:var(--text);font-size:22px;line-height:1;cursor:pointer;
  box-shadow:0 0 0 1px var(--border);transition:transform .12s}
.ul-gc-btn svg{width:18px;height:18px;margin:auto;display:block;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.ul-gc-btn:active{transform:scale(.94)}.ul-gc-prev{left:14px}.ul-gc-next{right:14px}`,
  init: function gradientCarousel(root) {
    var gc = root.querySelector('.ul-gc'), track = gc.querySelector('.ul-gc-track');
    var slides = JSON.parse(gc.dataset.slides), cards = [], N = slides.length;
    var pos = 2, target = 2, vel = 0, drag = false, lastX = 0, lastT = 0, last = 0, raf = 0;   // start on the third card
    var GAP = 210, DEPTH = 190, ROT = 36, MIN = 0.86;
    slides.forEach(function (s) {
      var c = document.createElement('div'); c.className = 'ul-gc-card'; c.textContent = s[0];
      c.style.background = 'linear-gradient(145deg,' + s[1] + ',' + s[2] + ')'; track.appendChild(c); cards.push(c);
    });
    function render() {
      cards.forEach(function (c, i) {
        var o = i - pos, a = Math.min(Math.abs(o), 2.5);
        c.style.transform = 'translateX(' + (o * GAP * (1 - Math.min(a, 2) * 0.09)).toFixed(1) + 'px) translateZ(' + (-a * DEPTH * 0.55).toFixed(1) +
          'px) rotateY(' + (-Math.max(-1, Math.min(1, o)) * ROT).toFixed(1) + 'deg) scale(' + (1 - (1 - MIN) * Math.min(a, 1)).toFixed(3) + ')';
        c.style.zIndex = String(100 - Math.round(a * 10)); c.style.opacity = String(Math.max(0.25, 1 - a * 0.22));
      });
      gc.style.setProperty('--ul-tint', slides[Math.max(0, Math.min(N - 1, Math.round(pos)))][1]);
    }
    function step(ts) {
      if (!gc.isConnected) return;
      var dt = Math.min((ts - last) / 1000 || 0.016, 0.032); last = ts;
      if (!drag) {
        vel += ((target - pos) * 90 - vel * 13) * dt; pos += vel * dt;
        if (Math.abs(target - pos) < 0.0008 && Math.abs(vel) < 0.01) { pos = target; render(); raf = 0; return; }
      }
      render(); raf = requestAnimationFrame(step);
    }
    function run() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(step); } }
    function go(i) { target = Math.max(0, Math.min(N - 1, Math.round(i))); run(); }
    gc.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.ul-gc-btn')) return;
      drag = true; lastX = e.clientX; lastT = performance.now(); vel = 0; gc.setPointerCapture(e.pointerId); run();
    });
    gc.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var now = performance.now(), d = -(e.clientX - lastX) / GAP;
      pos = Math.max(-0.4, Math.min(N - 0.6, pos + d)); vel = d / Math.max((now - lastT) / 1000, 0.008) * 0.6; lastX = e.clientX; lastT = now;
    });
    function up() { if (!drag) return; drag = false; go(pos + vel * 0.18); }
    gc.addEventListener('pointerup', up); gc.addEventListener('pointercancel', up);
    var wheelAt = 0;
    gc.addEventListener('wheel', function (e) {
      if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;          // vertical scroll keeps scrolling the page
      e.preventDefault();
      var now = performance.now(); if (now - wheelAt < 280 || Math.abs(e.deltaX) < 8) return;
      wheelAt = now; go(target + (e.deltaX > 0 ? 1 : -1));
    }, { passive: false });
    gc.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') go(target + 1); if (e.key === 'ArrowLeft') go(target - 1); });
    gc.querySelector('.ul-gc-prev').addEventListener('click', function () { go(target - 1); });
    gc.querySelector('.ul-gc-next').addEventListener('click', function () { go(target + 1); });
    render();
  },
  vars: [['data-slides', 'Title and two colors for each card'], ['ROT (36)', 'Rotation of cards away from the center'], ['DEPTH (190)', 'How far side cards recede'], ['MIN (.86)', 'Scale of side cards'], ['90 / 13', 'Spring stiffness and damping']]
},

'depth-image': {
  group: 'Interface', title: 'Depth Image', wide: true,
  desc: 'An image relit with depth by a light that follows the cursor.',
  usage: 'Depth is estimated from the picture\'s brightness, turned into surface normals, then lit by a point light under your pointer. Without a pointer it orbits on its own. Choose your own image with the button.',
  html: `<div class="ul-depth">
  <canvas aria-label="Image relit by a moving light" role="img"></canvas>
  <label class="ul-depth-pick">Use your own image
    <input type="file" accept="image/*" hidden>
  </label>
</div>`,
  css: `.ul-depth{position:relative;width:100%;height:340px;border-radius:12px;overflow:hidden;background:#05060f;
  cursor:crosshair}
.ul-depth canvas{display:block;width:100%;height:100%}
.ul-depth-pick{position:absolute;right:12px;bottom:12px;padding:7px 12px;border-radius:9px;cursor:pointer;
  background:rgba(255,255,255,.14);color:#fff;font-size:12px;font-weight:500;backdrop-filter:blur(8px);
  transition:background .15s}
.ul-depth-pick:hover{background:rgba(255,255,255,.24)}`,
  init: function depthImage(root) {
    var box = root.querySelector('.ul-depth'), cv = box.querySelector('canvas'), file = box.querySelector('input');
    var gl = cv.getContext('webgl'); if (!gl) return;
    var vs = 'attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
    var fs = 'precision highp float;varying vec2 v;uniform sampler2D uTex;uniform vec2 uScale,uTexel,uLight;' +
      'float lum(vec2 u){return dot(texture2D(uTex,u).rgb,vec3(.299,.587,.114));}' +
      'float h(vec2 u){float s=0.;for(int x=-2;x<=2;x++)for(int y=-2;y<=2;y++)s+=lum(u+vec2(float(x),float(y))*uTexel*2.);return s/25.;}' +
      'void main(){' +
      ' vec2 u=(v-.5)*uScale+.5; vec3 c=texture2D(uTex,u).rgb;' +
      ' float e=uTexel.x*3.;' +
      ' float dx=h(u+vec2(e,0.))-h(u-vec2(e,0.)); float dy=h(u+vec2(0.,e))-h(u-vec2(0.,e));' +
      ' vec3 n=normalize(vec3(-dx*5.,-dy*5.,1.));' +
      ' vec3 L=vec3((uLight-v)*vec2(1.6,1.),.42); float d=length(L); L/=d;' +
      ' float diff=max(dot(n,L),0.)/(1.+d*d*2.2);' +
      ' float spec=pow(max(dot(reflect(-L,n),vec3(0.,0.,1.)),0.),22.)/(1.+d*d*3.);' +
      ' gl_FragColor=vec4(c*(.12+diff*2.3)+spec*.35,1.);}';
    function sh(t, s) { var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; }
    var pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(pr); if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return; gl.useProgram(pr);
    var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var U = function (n) { return gl.getUniformLocation(pr, n); };
    var tex = gl.createTexture(), tw = 1024, th = 640;
    function upload(src) {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      tw = src.width; th = src.height; gl.uniform2f(U('uTexel'), 1 / tw, 1 / th); fit();
    }
    function artwork() {            // a brand-colored picture drawn in code, so no image file is needed
      var c = document.createElement('canvas'); c.width = 1024; c.height = 640; var g = c.getContext('2d');
      var bg = g.createLinearGradient(0, 0, 1024, 640); bg.addColorStop(0, '#000f9f'); bg.addColorStop(1, '#0047ff');
      g.fillStyle = bg; g.fillRect(0, 0, 1024, 640);
      function blob(x, y, r, a, b) { var q = g.createRadialGradient(x - r * .3, y - r * .3, r * .1, x, y, r); q.addColorStop(0, a); q.addColorStop(1, b); g.fillStyle = q; g.beginPath(); g.arc(x, y, r, 0, 6.2832); g.fill(); }
      blob(300, 330, 230, '#7dffd0', '#00b87a'); blob(640, 250, 170, '#9fb8ff', '#0047ff'); blob(760, 440, 120, '#00e297', '#006c4c');
      g.lineWidth = 26; g.strokeStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.arc(560, 340, 270, 0.4, 3.9); g.stroke();
      return c;
    }
    function fit() {
      var a = cv.width / cv.height, b = tw / th;
      gl.uniform2f(U('uScale'), a > b ? 1 : a / b, a > b ? b / a : 1);
    }
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    function size() { cv.width = box.clientWidth * dpr; cv.height = box.clientHeight * dpr; gl.viewport(0, 0, cv.width, cv.height); fit(); }
    size(); if (window.ResizeObserver) new ResizeObserver(size).observe(box);
    upload(artwork());
    var want = [0.5, 0.5], cur = [0.5, 0.5], inside = false, t0 = performance.now();
    box.addEventListener('pointermove', function (e) { var r = box.getBoundingClientRect(); inside = true; want = [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height]; });
    box.addEventListener('pointerleave', function () { inside = false; });
    file.addEventListener('change', function () {
      var f = file.files[0]; if (!f) return; var img = new Image();
      img.onload = function () {
        var k = Math.min(1, 1024 / Math.max(img.width, img.height)), c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); upload(c);
      };
      img.src = URL.createObjectURL(f);
    });
    (function draw(now) {
      if (!cv.isConnected) return;
      if (!inside) { var t = (now - t0) / 1000; want = [0.5 + 0.34 * Math.cos(t * 0.6), 0.5 + 0.3 * Math.sin(t * 0.8)]; }
      cur[0] += (want[0] - cur[0]) * 0.12; cur[1] += (want[1] - cur[1]) * 0.12;
      gl.uniform2f(U('uLight'), cur[0], cur[1]); gl.drawArrays(gl.TRIANGLES, 0, 3);
      requestAnimationFrame(draw);
    })(t0);
  },
  vars: [['5.', 'Strength of the surface tilt, in the shader'], ['.42', 'Height of the light above the image'], ['0.12', 'How closely the light follows the pointer'], ['artwork()', 'The built-in picture, replace with your own']]
}

});
