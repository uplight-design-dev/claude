(function () {
  var $ = function (s) { return document.querySelector(s); };
  var pages = [].slice.call(document.querySelectorAll('.page')).map(function (el) {
    return { el: el, id: el.dataset.id, group: el.dataset.group, title: el.dataset.title, desc: el.dataset.desc, soon: el.hasAttribute('data-soon') };
  });
  var groups = ['Get started', 'Brand', 'Skills', 'Products', 'Library'];
  var top = [['Docs', 'intro', 'Get started'], ['Brand', 'colors', 'Brand'], ['Skills', 'skills', 'Skills'], ['Products', 'products', 'Products']];
  var cur = pages[0];

  pages.forEach(function (p) {
    if (p.soon) p.el.innerHTML = '<h2 id="ready">Ready for content</h2><div class="empty"><b>Nothing here yet</b><span>This page is part of the template. Add a short overview, then the guides, assets or examples that belong under it.</span></div>';
  });

  $('#side').innerHTML = groups.map(function (g) {
    return '<div class="group"><div class="grouplabel">' + g + '</div>' + pages.filter(function (p) { return p.group === g; }).map(function (p) {
      return '<a class="navitem" data-id="' + p.id + '" href="#/' + p.id + '"><span>' + p.title + '</span>' + (p.soon ? '<span class="soon">Soon</span>' : '') + '</a>';
    }).join('') + '</div>';
  }).join('');
  $('#topnav').innerHTML = top.map(function (t) { return '<a class="toplink" data-g="' + t[2] + '" href="#/' + t[1] + '">' + t[0] + '</a>'; }).join('');

  function route() {
    var id = (location.hash.match(/^#\/(.+)$/) || [])[1] || 'intro';
    cur = pages.filter(function (p) { return p.id === id; })[0] || pages[0];
    var i = pages.indexOf(cur);
    pages.forEach(function (p) { p.el.classList.toggle('on', p === cur); });
    $('#h1').textContent = cur.title; $('#lead').textContent = cur.desc;
    $('#cgroup').textContent = cur.group; $('#ctitle').textContent = cur.title;
    document.title = cur.title + ' · Uplight Labs';
    [].forEach.call(document.querySelectorAll('.navitem'), function (a) { a.classList.toggle('active', a.dataset.id === cur.id); });
    [].forEach.call(document.querySelectorAll('.toplink'), function (a) { a.classList.toggle('active', a.dataset.g === cur.group); });
    $('#toc').innerHTML = '<b>On this page</b>' + [].map.call(cur.el.querySelectorAll('h2'), function (h) { return '<a href="#' + h.id + '" data-anchor="' + h.id + '">' + h.textContent + '</a>'; }).join('');
    var pr = pages[i - 1], nx = pages[i + 1];
    $('#pn').innerHTML = (pr ? '<a href="#/' + pr.id + '"><small>Previous</small>← ' + pr.title + '</a>' : '') + (nx ? '<a class="next" href="#/' + nx.id + '"><small>Next</small>' + nx.title + ' →</a>' : '');
    $('#side').classList.remove('open'); closeSearch(); window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);

  // in-page TOC anchors must not clobber the route hash
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-anchor]');
    if (a) { e.preventDefault(); var t = document.getElementById(a.dataset.anchor); if (t) t.scrollIntoView({ behavior: 'smooth' }); }
  });

  function flash(btn, text, ms) { var o = btn.textContent; btn.textContent = text; setTimeout(function () { btn.textContent = o; }, ms || 1500); }
  function copy(t) { try { navigator.clipboard.writeText(t); } catch (e) {} }
  $('#copybtn').addEventListener('click', function () { copy('# ' + cur.title + '\n\n' + cur.desc + '\n'); flash(this, 'Copied'); });
  [].forEach.call(document.querySelectorAll('.sw'), function (b) {
    b.addEventListener('click', function () { var s = b.querySelector('small'), o = s.textContent; copy(b.dataset.hex); s.textContent = 'Copied'; setTimeout(function () { s.textContent = o; }, 1500); });
  });

  var root = document.documentElement;
  try { var saved = localStorage.getItem('labs-theme'); if (saved) root.dataset.theme = saved; } catch (e) {}
  $('#themebtn').addEventListener('click', function () {
    var n = root.dataset.theme === 'dark' ? 'light' : 'dark'; root.dataset.theme = n;
    try { localStorage.setItem('labs-theme', n); } catch (e) {}
  });
  $('#menubtn').addEventListener('click', function () { $('#side').classList.toggle('open'); });

  function closeSearch() { $('#search').classList.remove('on'); }
  function renderResults() {
    var q = $('#q').value.trim().toLowerCase();
    var r = pages.filter(function (p) { return !q || (p.title + ' ' + p.group + ' ' + p.desc).toLowerCase().indexOf(q) > -1; }).slice(0, 8);
    $('#results').innerHTML = r.length ? r.map(function (p) { return '<a href="#/' + p.id + '">' + p.title + '<small>' + p.group + ' · ' + p.desc + '</small></a>'; }).join('') : '<div style="padding:20px 12px;font-size:14px;color:var(--muted)">No pages match that search.</div>';
  }
  $('#searchbtn').addEventListener('click', function () { $('#search').classList.add('on'); $('#q').value = ''; renderResults(); $('#q').focus(); });
  $('#sclose').addEventListener('click', closeSearch);
  $('#search').addEventListener('click', function (e) { if (e.target === this) closeSearch(); });
  $('#q').addEventListener('input', renderResults);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSearch(); });

  route();
})();
