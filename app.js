(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
  var C = window.ULComponents || {};

  /* component pages are generated from components*.js */
  var anchor = $('#pn');
  Object.keys(C).forEach(function (k) {
    var c = C[k], sec = document.createElement('section');
    sec.className = 'page'; sec.dataset.id = k; sec.dataset.group = c.group || 'Interface';
    sec.dataset.title = c.title; sec.dataset.component = k; sec.dataset.tag = 'New';
    anchor.parentNode.insertBefore(sec, anchor);
  });

  var pages = $$('.page').map(function (el) {
    return { el: el, id: el.dataset.id, group: el.dataset.group, title: el.dataset.title, desc: el.dataset.desc,
      soon: el.hasAttribute('data-soon'), comp: el.dataset.component || '', tag: el.hasAttribute('data-soon') ? 'Soon' : (el.dataset.tag || '') };
  });
  pages.forEach(function (p) { if (p.comp && C[p.comp]) p.desc = C[p.comp].desc; });
  var groups = ['Get started', 'Brand', 'Skills', 'Components', 'Micro Interactions', 'Interface', 'Backgrounds', 'Blocks', 'Products', 'Library'];
  var compGroups = ['Components', 'Micro Interactions', 'Interface', 'Backgrounds', 'Blocks'];
  var top = [['Docs', 'intro', ['Get started']], ['Brand', 'colors', ['Brand']], ['Skills', 'skills', ['Skills']], ['Components', 'components', compGroups], ['Products', 'products', ['Products']]];
  pages = pages.map(function (p, i) { p.n = i; return p; })
    .sort(function (a, b) { return (groups.indexOf(a.group) - groups.indexOf(b.group)) || (a.n - b.n); });
  var cur = pages[0];
  var ICON_GRID = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>';

  /* ---- shared component CSS, injected once (the same text shown on each page) ---- */
  var style = document.createElement('style'); style.id = 'ul-components';
  style.textContent = Object.keys(C).map(function (k) { return C[k].css; }).join('\n');
  document.head.appendChild(style);

  /* ---- placeholder pages ---- */
  pages.forEach(function (p) {
    if (p.soon) p.el.innerHTML = '<h2 id="ready">Ready for content</h2><div class="empty"><b>Nothing here yet</b><span>This page is part of the template. Add a short overview, then the guides, assets or examples that belong under it.</span></div>';
  });

  /* ---- component pages ---- */
  function codeBlock(c, id) {
    var panes = [['HTML', c.html], ['CSS', c.css], ['JavaScript', c.init ? c.init.toString() : '// No JavaScript needed.']];
    return '<div class="code" data-code="' + id + '"><div class="codehead"><div class="tabs">' +
      panes.map(function (t, i) { return '<button class="' + (i ? '' : 'on') + '" data-tab="' + i + '">' + t[0] + '</button>'; }).join('') +
      '</div><button class="copy">Copy</button></div>' +
      panes.map(function (t, i) { return '<pre class="pane mono' + (i ? '' : ' on') + '">' + esc(t[1]) + '</pre>'; }).join('') + '</div>';
  }
  pages.forEach(function (p) {
    if (!p.comp || !C[p.comp]) return;
    var c = C[p.comp];
    p.el.innerHTML = '<h2 id="preview">Preview</h2><div class="demo' + (c.wide ? ' wide' : '') + (c.flush ? ' flush' : '') + '">' +
      (c.replay ? '<button class="ctl sm replay">Replay</button>' : '') +
      '<div class="stage" data-stage></div></div>' +
      '<p style="margin-top:16px">' + c.usage + '</p>' +
      '<h2 id="code">Code</h2>' + codeBlock(c, p.comp) +
      '<h2 id="customize">Customize</h2><div class="table"><div class="tr two th" style="min-width:0"><span>Part</span><span>What it controls</span></div>' +
      c.vars.map(function (v) { return '<div class="tr two" style="min-width:0"><b class="mono" style="font-size:13px">' + esc(v[0]) + '</b><span>' + esc(v[1]) + '</span></div>'; }).join('') + '</div>';
  });
  function mount(p) {
    var c = C[p.comp], st = $('[data-stage]', p.el);
    st.innerHTML = c.html;
    if (c.init) c.init(st);
  }
  document.addEventListener('click', function (e) {
    var rp = e.target.closest('.replay');
    if (rp) { var pg = rp.closest('.page'); mount(pages.filter(function (x) { return x.el === pg; })[0]); return; }
    var tab = e.target.closest('.tabs button');
    if (tab) {
      var box = tab.closest('.code'), i = +tab.dataset.tab;
      $$('.tabs button', box).forEach(function (b, k) { b.classList.toggle('on', k === i); });
      $$('.pane', box).forEach(function (b, k) { b.classList.toggle('on', k === i); });
      return;
    }
    var cp = e.target.closest('.codehead .copy');
    if (cp) { var bx = cp.closest('.code'); copy($('.pane.on', bx).textContent); flash(cp, 'Copied'); }
  });

  /* ---- components overview cards ---- */
  $('#compcards').innerHTML = compGroups.slice(1).map(function (g) {
    var list = pages.filter(function (p) { return p.comp && p.group === g; });
    if (!list.length) return '';
    var id = g.toLowerCase().replace(/[^a-z]+/g, '-');
    return '<h2 id="' + id + '">' + g + '</h2><div class="grid2">' + list.map(function (p) {
      return '<a class="card" href="#/' + p.id + '"><b>' + p.title + '<span class="tag">' + p.tag + '</span></b><span>' + p.desc + '</span></a>';
    }).join('') + '</div>';
  }).join('');

  /* ---- nav ---- */
  $('#side').innerHTML = '<a class="browse" href="#/components">' + ICON_GRID + '<span>Browse components</span></a>' +
    groups.map(function (g) {
      return '<div class="group"><p class="grouplabel">' + g + '</p>' + pages.filter(function (p) { return p.group === g; }).map(function (p) {
        return '<a class="navitem" data-id="' + p.id + '" href="#/' + p.id + '"><span>' + p.title + '</span>' + (p.tag ? '<span class="tag">' + p.tag + '</span>' : '') + '</a>';
      }).join('') + '</div>';
    }).join('');
  $('#topnav').innerHTML = top.map(function (t) { return '<a class="toplink" data-g="' + t[2].join('|') + '" href="#/' + t[1] + '">' + t[0] + '</a>'; }).join('');

  /* ---- markdown export ---- */
  function toMarkdown() {
    var out = ['# ' + cur.title, '', cur.desc, ''];
    $$('h2,p,pre,.card,.step,.tr:not(.th),.row,.callout,.sw,.empty', cur.el).forEach(function (el) {
      if (el.parentElement && el.parentElement.closest('.card,.step,.tr,.row,.callout,.sw,pre,.empty,.code')) return;
      var t = el.textContent.replace(/\s+\n/g, '\n').replace(/[ \t]+/g, ' ').trim();
      if (!t) return;
      if (el.tagName === 'H2') out.push('', '## ' + t, '');
      else if (el.tagName === 'PRE') out.push('```', el.textContent.replace(/\s+$/, ''), '```', '');
      else if (el.matches('.card,.step,.tr,.row,.sw')) out.push('- ' + t.replace(/\s*\n\s*/g, ': '));
      else out.push(t, '');
    });
    if (cur.comp && C[cur.comp]) {
      var c = C[cur.comp];
      out.push('', '## Code', '', '```html', c.html, '```', '', '```css', c.css, '```');
      if (c.init) out.push('', '```js', c.init.toString(), '```');
    }
    return out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
  }

  /* ---- routing ---- */
  var spy = [];
  function route() {
    var id = (location.hash.match(/^#\/([^?#]+)/) || [])[1] || 'intro';
    cur = pages.filter(function (p) { return p.id === id; })[0] || pages[0];
    var i = pages.indexOf(cur);
    pages.forEach(function (p) {
      p.el.classList.toggle('on', p === cur);
      if (p.comp && p !== cur) { var s = $('[data-stage]', p.el); if (s) s.innerHTML = ''; }
    });
    if (cur.comp) mount(cur);
    $('#h1').textContent = cur.title; $('#lead').textContent = cur.desc;
    $('#cgroup').textContent = cur.group; $('#ctitle').textContent = cur.title;
    document.title = cur.title + ' · Uplight Labs';
    $$('.navitem').forEach(function (a) { a.classList.toggle('active', a.dataset.id === cur.id); });
    $$('.toplink').forEach(function (a) { a.classList.toggle('active', a.dataset.g.split('|').indexOf(cur.group) > -1); });
    var hs = $$('h2', cur.el);
    $('#toc').innerHTML = '<b>On this page</b>' + hs.map(function (h) { return '<a href="#' + h.id + '" data-anchor="' + h.id + '">' + h.textContent + '</a>'; }).join('');
    spy = hs;
    var pr = pages[i - 1], nx = pages[i + 1];
    $('#pn').innerHTML = (pr ? '<a href="#/' + pr.id + '"><small>Previous</small>← ' + pr.title + '</a>' : '') + (nx ? '<a class="next" href="#/' + nx.id + '"><small>Next</small>' + nx.title + ' →</a>' : '');
    $('#side').classList.remove('open'); closeSearch(); $('#menu').classList.remove('on');
    window.scrollTo(0, 0); onScroll();
  }
  window.addEventListener('hashchange', route);

  function onScroll() {
    var active = spy.length ? spy[0].id : '';
    spy.forEach(function (h) { if (h.getBoundingClientRect().top < 120) active = h.id; });
    $$('#toc a').forEach(function (a) { a.classList.toggle('on', a.dataset.anchor === active); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-anchor]');
    if (a) { e.preventDefault(); var t = document.getElementById(a.dataset.anchor); if (t) t.scrollIntoView({ behavior: 'smooth' }); }
    if (!e.target.closest('#actions')) $('#menu').classList.remove('on');
  });

  /* ---- actions ---- */
  function flash(btn, text, ms) { var o = btn.textContent; btn.textContent = text; setTimeout(function () { btn.textContent = o; }, ms || 1500); }
  function copy(t) { try { var p = navigator.clipboard.writeText(t); if (p && p.catch) p.catch(function () {}); } catch (e) {} }
  $('#copybtn').addEventListener('click', function () { copy(toMarkdown()); flash($('#copylabel'), 'Copied'); });
  $('#morebtn').addEventListener('click', function (e) { e.stopPropagation(); $('#menu').classList.toggle('on'); });
  $('#copylink').addEventListener('click', function () { copy(location.href); $('#menu').classList.remove('on'); flash($('#copylabel'), 'Link copied'); });
  $$('.sw').forEach(function (b) {
    b.addEventListener('click', function () { var s = b.querySelector('small'), o = s.textContent; copy(b.dataset.hex); s.textContent = 'Copied'; setTimeout(function () { s.textContent = o; }, 1500); });
  });

  /* ---- theme ---- */
  var root = document.documentElement;
  try { var saved = localStorage.getItem('labs-theme'); if (saved) root.dataset.theme = saved; } catch (e) {}
  $('#themebtn').addEventListener('click', function () {
    var n = root.dataset.theme === 'dark' ? 'light' : 'dark'; root.dataset.theme = n;
    try { localStorage.setItem('labs-theme', n); } catch (e) {}
  });
  $('#menubtn').addEventListener('click', function () { $('#side').classList.toggle('open'); });

  /* ---- search ---- */
  function closeSearch() { $('#search').classList.remove('on'); }
  function openSearch() { $('#search').classList.add('on'); $('#q').value = ''; renderResults(); $('#q').focus(); }
  function renderResults() {
    var q = $('#q').value.trim().toLowerCase();
    var r = pages.filter(function (p) { return !q || (p.title + ' ' + p.group + ' ' + p.desc).toLowerCase().indexOf(q) > -1; }).slice(0, 8);
    $('#results').innerHTML = r.length ? r.map(function (p) { return '<a href="#/' + p.id + '">' + p.title + '<small>' + p.group + ' · ' + p.desc + '</small></a>'; }).join('') : '<div style="padding:20px 12px;font-size:14px;color:var(--muted)">No pages match that search.</div>';
  }
  $('#searchbtn').addEventListener('click', openSearch);
  $('#sclose').addEventListener('click', closeSearch);
  $('#search').addEventListener('click', function (e) { if (e.target === this) closeSearch(); });
  $('#q').addEventListener('input', renderResults);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeSearch(); $('#menu').classList.remove('on'); }
    var tag = (e.target.tagName || '').toLowerCase();
    if (e.key === '/' && tag !== 'input' && tag !== 'textarea') { e.preventDefault(); openSearch(); }
  });

  route();
})();
