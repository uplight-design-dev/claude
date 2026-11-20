/* Uplight Labs components. Each entry is the real source shown on its docs page:
   the preview runs exactly this html, css and js. They use the site tokens
   (--bg, --surface, --border, --text, --muted) so they follow light and dark. */
window.ULComponents = {

  'chroma-card': {
    group: 'Interface', title: 'Chroma Card',
    desc: 'A card with a soft Uplight blue-to-green spotlight that follows the pointer.',
    usage: 'Wrap any content in <code>.ul-card</code>. The glow position is driven by two CSS variables, so it costs one event listener per card.',
    html: `<div class="ul-grid">
  <article class="ul-card">
    <h3>Brand styles</h3>
    <p>Colors, type and logo rules in one place.</p>
  </article>
  <article class="ul-card">
    <h3>Skills</h3>
    <p>Teach Claude how Uplight works.</p>
  </article>
</div>`,
    css: `.ul-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.ul-card{--x:50%;--y:50%;position:relative;overflow:hidden;padding:22px;
  border:1px solid var(--border);border-radius:14px;background:var(--bg);
  transition:border-color .2s}
.ul-card::before{content:"";position:absolute;inset:0;pointer-events:none;opacity:0;
  transition:opacity .3s;
  background:radial-gradient(260px circle at var(--x) var(--y),
    rgba(0,71,255,.16), rgba(0,226,151,.10) 45%, transparent 70%)}
.ul-card:hover{border-color:var(--borderStrong)}
.ul-card:hover::before{opacity:1}
.ul-card h3{position:relative;margin:0 0 6px;font-size:16px;font-weight:500}
.ul-card p{position:relative;margin:0;font-size:14px;line-height:1.55}
@media(max-width:560px){.ul-grid{grid-template-columns:1fr}}`,
    init: function chromaCard(root) {
      root.querySelectorAll('.ul-card').forEach(function (card) {
        card.addEventListener('pointermove', function (e) {
          var r = card.getBoundingClientRect();
          card.style.setProperty('--x', (e.clientX - r.left) + 'px');
          card.style.setProperty('--y', (e.clientY - r.top) + 'px');
        });
      });
    },
    vars: [['--x / --y', 'Glow position, set by the script'], ['rgba(0,71,255,.16)', 'Glow start color (Uplight blue)'], ['rgba(0,226,151,.10)', 'Glow end color (Uplight green)'], ['260px', 'Glow radius']]
  },

  'browser-window': {
    group: 'Interface', title: 'Browser Window',
    desc: 'A browser frame for showing a page, screenshot or prototype in context.',
    usage: 'Put anything inside <code>.ul-browser-body</code>: an image, an iframe or live markup. Change the address text in the bar.',
    html: `<div class="ul-browser">
  <div class="ul-browser-bar">
    <i></i><i></i><i></i>
    <span>your-site.com</span>
  </div>
  <div class="ul-browser-body">Your page goes here</div>
</div>`,
    css: `.ul-browser{overflow:hidden;border:1px solid var(--border);border-radius:12px;background:var(--bg)}
.ul-browser-bar{display:flex;align-items:center;gap:6px;height:40px;padding:0 14px;
  border-bottom:1px solid var(--border);background:var(--surface)}
.ul-browser-bar i{width:10px;height:10px;border-radius:99px;background:var(--borderStrong)}
.ul-browser-bar span{flex:1;max-width:300px;margin:0 auto;padding:4px 12px;border-radius:7px;
  background:var(--bg);border:1px solid var(--border);font-size:12px;color:var(--muted);
  text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ul-browser-body{display:flex;align-items:center;justify-content:center;min-height:190px;
  padding:24px;font-size:15px;color:var(--muted);
  background:linear-gradient(135deg,rgba(0,71,255,.08),rgba(0,226,151,.08))}`,
    init: null,
    vars: [['span text', 'Address shown in the bar'], ['min-height', 'Body height'], ['linear-gradient', 'Placeholder fill, replace with your content']]
  },

  'terminal-replay': {
    group: 'Interface', title: 'Terminal Replay',
    desc: 'A terminal that types commands and prints their output, line by line.',
    usage: 'Describe the session in <code>data-lines</code> as <code>["cmd", text]</code> and <code>["out", text]</code> pairs. The terminal is always dark, in both themes.',
    replay: true,
    html: `<div class="ul-term">
  <div class="ul-term-bar"><i></i><i></i><i></i></div>
  <div class="ul-term-body" data-lines='[
    ["cmd","ls uplight-brand/"],
    ["out","SKILL.md  assets  references"],
    ["cmd","head -n 3 uplight-brand/SKILL.md"],
    ["out","---"],
    ["out","name: uplight-brand"],
    ["out","description: Apply Uplight brand styles"]
  ]'></div>
</div>`,
    css: `.ul-term{overflow:hidden;border:1px solid #25232e;border-radius:12px;background:#0f0e14;color:#e8e7ee}
.ul-term-bar{display:flex;gap:6px;padding:12px 14px;border-bottom:1px solid #25232e}
.ul-term-bar i{width:10px;height:10px;border-radius:99px;background:#3b3748}
.ul-term-body{min-height:176px;padding:16px 18px;font:13px/1.8 ui-monospace,SFMono-Regular,Menlo,monospace}
.ul-line{white-space:pre-wrap}
.ul-line.ul-cmd::before{content:"$ ";color:#00e297}
.ul-line.ul-out{color:#9a97a8}
.ul-line.ul-typing::after{content:"";display:inline-block;width:7px;height:14px;margin-left:2px;
  vertical-align:-2px;background:#e8e7ee;animation:ul-blink 1s steps(1) infinite}
@keyframes ul-blink{50%{opacity:0}}`,
    init: function terminalReplay(root) {
      var body = root.querySelector('.ul-term-body');
      var lines = JSON.parse(body.dataset.lines);
      var i = 0;
      body.textContent = '';
      function next() {
        if (i >= lines.length) return;
        var item = lines[i++];
        var row = document.createElement('div');
        row.className = 'ul-line ul-' + item[0];
        body.appendChild(row);
        if (item[0] === 'out') { row.textContent = item[1]; setTimeout(next, 260); return; }
        var n = 0;
        row.classList.add('ul-typing');
        (function type() {
          row.textContent = item[1].slice(0, ++n);
          if (n < item[1].length) { setTimeout(type, 38); }
          else { row.classList.remove('ul-typing'); setTimeout(next, 380); }
        })();
      }
      next();
    },
    vars: [['data-lines', 'The session, as JSON pairs'], ['38', 'Milliseconds per typed character'], ['260 / 380', 'Pause after output / after a command']]
  },

  'simple-graph': {
    group: 'Interface', title: 'Simple Graph',
    desc: 'A line graph that draws itself in, with an Uplight blue-to-green stroke.',
    usage: 'Replace the two <code>d</code> attributes with your own path. Keep <code>pathLength="1"</code> on the line so the draw-in works at any length. The numbers here are sample data.',
    replay: true,
    html: `<figure class="ul-graph">
  <svg viewBox="0 0 400 160" role="img" aria-label="Sample line graph trending up">
    <defs>
      <linearGradient id="ul-stroke" x1="0" x2="1">
        <stop offset="0" stop-color="#0047ff"/><stop offset="1" stop-color="#00e297"/>
      </linearGradient>
      <linearGradient id="ul-fill" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stop-color="#0047ff" stop-opacity=".16"/>
        <stop offset="1" stop-color="#0047ff" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <path class="ul-grid-line" d="M0 40H400M0 80H400M0 120H400"/>
    <path class="ul-area" fill="url(#ul-fill)" d="M0 120C40 110 60 70 100 80S160 130 200 90S280 30 320 50S380 20 400 10V160H0Z"/>
    <path class="ul-line-path" pathLength="1" d="M0 120C40 110 60 70 100 80S160 130 200 90S280 30 320 50S380 20 400 10"/>
  </svg>
  <figcaption>Sample data</figcaption>
</figure>`,
    css: `.ul-graph{margin:0}
.ul-graph svg{display:block;width:100%;height:auto;overflow:visible}
.ul-graph figcaption{margin-top:10px;font-size:12px;color:var(--muted)}
.ul-grid-line{fill:none;stroke:var(--border);stroke-width:1}
.ul-line-path{fill:none;stroke:url(#ul-stroke);stroke-width:3;stroke-linecap:round;
  stroke-dasharray:1;stroke-dashoffset:1;
  animation:ul-draw 1.4s cubic-bezier(.23,1,.32,1) .1s forwards}
.ul-area{opacity:0;animation:ul-fade .8s ease 1s forwards}
@keyframes ul-draw{to{stroke-dashoffset:0}}
@keyframes ul-fade{to{opacity:1}}
@media(prefers-reduced-motion:reduce){.ul-line-path{animation:none;stroke-dashoffset:0}.ul-area{animation:none;opacity:1}}`,
    init: null,
    vars: [['stop-color', 'Gradient stops for line and fill'], ['1.4s', 'Draw-in duration'], ['d attributes', 'Your data path']]
  }
};
