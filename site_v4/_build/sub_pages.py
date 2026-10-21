"""V4 sub pages (2026-10-21): inventory.html (SRP) and car.html (VDP).

The shell — head, header, mobile menu and the showrooms footer — is lifted from index.html, so the three pages of the
client preview share one header and one footer. In-page anchors of the home page (#showrooms, #services …) are
rewritten to index.html#… on the sub pages. Run from anywhere:  python3 site_v4/_build/sub_pages.py
"""
import os, re

HERE = os.path.dirname(os.path.abspath(__file__))
V4 = os.path.dirname(HERE)
VER = 'v4-2'

src = open(os.path.join(V4, 'index.html'), encoding='utf-8').read()

head_end = src.index('</head>')
body_open = src.index('<body')
main_open = src.index('<main id="main">')
foot_open = src.index('<footer class="scene foot bwf"')
foot_close = src.index('</footer>', foot_open) + len('</footer>')

head = src[:head_end]
head = re.sub(r'\s*<link rel="preload" as="image"[^>]*>', '', head)          # the hero's car plate
head = re.sub(r'\s*<link rel="stylesheet" href="assets/css/v3\.css[^"]*">', '', head)
chrome = src[src.index('>', body_open) + 1:main_open]                          # skip link, header, mobile menu
footer = src[foot_open:foot_close]


def to_home(html):
    """header / menu anchors point at the home page's sections"""
    return re.sub(r'href="#(?!main\b)([\w-]+)"', r'href="index.html#\1"', html)


chrome = to_home(chrome).replace('data-ink="light"', 'data-ink="dark"', 1)

SCRIPTS = '''  <script src="assets/data/sel13.js?v={v}"></script>
  <script src="assets/vendor/gsap.min.js" defer></script>
  <script src="assets/vendor/lenis.min.js" defer></script>
  <script src="assets/js/chrome.js?v={v}" defer></script>
  <script src="assets/js/sub.js?v={v}" defer></script>
  <script src="assets/js/beam-footer.js?v=2" defer></script>
'''.format(v=VER)


def page(name, title, desc, body_class, main):
    h = head
    h = re.sub(r'<title>.*?</title>', '<title>%s</title>' % title, h)
    h = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="%s">' % desc, h)
    h += '  <link rel="stylesheet" href="assets/css/sub.css?v=%s">\n' % VER
    out = (h + '</head>\n<body class="%s">' % body_class + chrome + main + '\n  ' + footer + '\n' + SCRIPTS +
           '</body>\n</html>\n')
    open(os.path.join(V4, name), 'w', encoding='utf-8').write(out)
    print('wrote', name, len(out))


ARR = ('<svg class="arr" viewBox="0 0 16 10" width="16" height="10" aria-hidden="true" focusable="false">'
       '<path d="M0 5h14M10 1l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>')

SRP = '''
  <main id="main" class="sub inv" data-srp>
    <header class="inv__head">
      <p class="sub__kicker">Inventory</p>
      <h1 class="sub__h disp"><span class="sub__h1">Available now</span> <span class="sub__h2">Three showrooms, one collection</span></h1>
      <p class="sub__line" data-inv-asof>Prices and miles as listed on duPont REGISTRY</p>
    </header>
    <div class="inv__bar" data-inv-bar>
      <div class="inv__bar-in">
        <div class="inv__rooms" role="group" aria-label="Showroom" data-inv-rooms></div>
        <div class="inv__filters">
          <label class="inv__f"><span class="vh">Make</span><select data-inv-make><option value="">All makes</option></select></label>
          <label class="inv__f"><span class="vh">Model</span><select data-inv-model disabled><option value="">All models</option></select></label>
          <label class="inv__f"><span class="vh">Sort</span><select data-inv-sort>
            <option value="featured">Featured</option>
            <option value="price-desc">Price: high to low</option>
            <option value="price-asc">Price: low to high</option>
            <option value="miles-asc">Mileage: lowest first</option>
            <option value="year-desc">Year: newest first</option>
          </select></label>
          <label class="inv__f inv__f--q"><span class="vh">Keyword</span><input type="search" placeholder="Make, model or keyword" data-inv-q autocomplete="off"></label>
        </div>
      </div>
    </div>
    <div class="inv__meta"><p class="inv__count" aria-live="polite" data-inv-count></p><button class="inv__clear" type="button" data-inv-clear hidden>Clear filters</button></div>
    <ul class="inv__grid" data-inv-grid></ul>
    <div class="inv__empty" data-inv-empty hidden>
      <p class="sub__h2 disp">Nothing matches that search</p>
      <p class="inv__empty-t">Try another make, or clear the filters to see all cars.</p>
      <button class="btn sub__btn" type="button" data-inv-clear>Clear filters</button>
    </div>
  </main>'''

VDP = '''
  <main id="main" class="sub vdp" data-vdp>
    <nav class="vdp__crumbs" aria-label="Breadcrumb"><ol>
      <li><a href="inventory.html">Inventory</a></li>
      <li><a href="inventory.html" data-vdp-room-link></a></li>
      <li aria-current="page" data-vdp-crumb></li>
    </ol></nav>
    <div class="vdp__top">
      <section class="vdp__gal" aria-label="Photographs" data-vdp-gal>
        <div class="vdp__stage">
          <button class="vdp__main" type="button" data-vdp-open aria-label="Open the photographs full screen">
            <img data-vdp-img alt="" decoding="async" fetchpriority="high">
          </button>
          <div class="vdp__nav">
            <button class="vdp__arr vdp__arr--prev" type="button" data-vdp-prev aria-label="Previous photograph">''' + ARR + '''</button>
            <span class="vdp__n t-num" data-vdp-n></span>
            <button class="vdp__arr" type="button" data-vdp-next aria-label="Next photograph">''' + ARR + '''</button>
          </div>
        </div>
        <ul class="vdp__thumbs" data-vdp-thumbs data-lenis-prevent></ul>
      </section>
      <aside class="vdp__panel" data-vdp-panel>
        <p class="vdp__room" data-vdp-room></p>
        <h1 class="vdp__title disp" data-vdp-title></h1>
        <p class="vdp__price" data-vdp-price></p>
        <dl class="vdp__quick" data-vdp-quick></dl>
        <div class="vdp__cta">
          <a class="btn btn--red sub__btn" href="#vdp-contact" data-vdp-avail>Check availability ''' + ARR + '''</a>
          <a class="btn sub__btn sub__btn--line" href="#vdp-contact" data-vdp-call></a>
        </div>
        <p class="vdp__asof" data-vdp-asof></p>
      </aside>
    </div>
    <section class="vdp__body" aria-labelledby="vdp-ov">
      <div class="vdp__story">
        <p class="sub__kicker">The car</p>
        <h2 class="vdp__h disp" id="vdp-ov">Overview</h2>
        <p class="vdp__lead" data-vdp-lead></p>
        <div class="vdp__ov" data-vdp-ov></div>
        <div class="vdp__opts" data-vdp-opts-wrap><h3 class="vdp__h3">Options</h3><ul class="vdp__optlist" data-vdp-opts></ul></div>
        <p class="vdp__close" data-vdp-close></p>
      </div>
      <div class="vdp__specs"><h3 class="vdp__h3">Specifications</h3><dl class="vdp__spec" data-vdp-spec></dl></div>
    </section>
    <section class="vdp__room-b" id="vdp-contact" aria-labelledby="vdp-room-h" data-vdp-contact></section>
    <section class="vdp__more" aria-labelledby="vdp-more-h">
      <div class="vdp__more-hd">
        <h2 class="vdp__h disp" id="vdp-more-h">More from Select</h2>
        <a class="btn sub__btn sub__btn--line" href="inventory.html">View all cars ''' + ARR + '''</a>
      </div>
      <ul class="inv__grid inv__grid--more" data-vdp-more></ul>
    </section>
    <div class="lbox" data-lbox hidden role="dialog" aria-modal="true" aria-label="Photographs" data-lenis-prevent>
      <button class="lbox__x" type="button" data-lbox-close aria-label="Close">×</button>
      <img class="lbox__img" data-lbox-img alt="">
      <button class="lbox__arr lbox__arr--prev" type="button" data-lbox-prev aria-label="Previous photograph">''' + ARR + '''</button>
      <button class="lbox__arr" type="button" data-lbox-next aria-label="Next photograph">''' + ARR + '''</button>
      <span class="lbox__n t-num" data-lbox-n></span>
    </div>
  </main>'''

page('inventory.html', 'Inventory — duPont REGISTRY Select',
     'Exotic and collector cars available now at duPont REGISTRY Select — Southern California, Naples and Miami.',
     'sub-page srp-page', SRP)
page('car.html', 'duPont REGISTRY Select — Vehicle',
     'A car available now at duPont REGISTRY Select.', 'sub-page vdp-page', VDP)
