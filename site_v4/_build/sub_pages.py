"""V4 sub pages (2026-10-21): inventory.html (SRP) and car.html (VDP).

The shell — head, header, mobile menu and the showrooms footer — is lifted from index.html, so the three pages of the
client preview share one header and one footer. In-page anchors of the home page (#showrooms, #services …) are
rewritten to index.html#… on the sub pages. Run from anywhere:  python3 site_v4/_build/sub_pages.py
"""
import os, re

HERE = os.path.dirname(os.path.abspath(__file__))
V4 = os.path.dirname(HERE)
VER = 'v4-5'

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
    </header>
    <div class="inv__bar" data-inv-bar>
      <div class="inv__bar-in">
        <button class="inv__ftoggle" type="button" data-inv-ftoggle aria-expanded="false" aria-controls="inv-filters"><svg viewBox="0 0 20 14" width="18" height="13" aria-hidden="true" focusable="false"><path d="M1 3h18M1 11h18" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="6" cy="3" r="2.2" fill="var(--ivory)" stroke="currentColor" stroke-width="1.5"/><circle cx="14" cy="11" r="2.2" fill="var(--ivory)" stroke="currentColor" stroke-width="1.5"/></svg>Filters<span class="inv__fcount" data-inv-fcount></span></button>
        <div class="inv__filters" id="inv-filters">
          <div class="inv__cell inv__cell--year" data-dd data-dd-label="Year"><select class="inv__native" data-inv-year tabindex="-1" aria-hidden="true"><option value="">Any year</option></select></div>
          <div class="inv__cell inv__cell--make" data-dd data-dd-label="Make"><select class="inv__native" data-inv-make tabindex="-1" aria-hidden="true"><option value="">All makes</option></select></div>
          <div class="inv__cell inv__cell--model" data-dd data-dd-label="Model"><select class="inv__native" data-inv-model tabindex="-1" aria-hidden="true" disabled><option value="">All models</option></select></div>
          <div class="inv__cell inv__cell--price" data-inv-price>
            <button class="inv__dd-btn" type="button" data-inv-pbtn aria-expanded="false" aria-controls="inv-pop"><span class="inv__lab">Price</span><span class="inv__val" data-inv-pval>Any</span><svg class="inv__chev" viewBox="0 0 10 6" width="10" height="6" aria-hidden="true" focusable="false"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.4"/></svg></button>
            <div class="inv__pop" id="inv-pop" data-inv-pop hidden role="group" aria-label="Price range">
              <div class="inv__pvals"><span data-pmin-l>No min</span><span data-pmax-l>No max</span></div>
              <div class="inv__range"><span class="inv__track"><span class="inv__fill" data-pfill></span></span>
                <input type="range" min="0" max="16" step="1" value="0" data-pmin aria-label="Minimum price">
                <input type="range" min="0" max="16" step="1" value="16" data-pmax aria-label="Maximum price"></div>
              <button class="inv__preset" type="button" data-inv-preset>Any price</button>
            </div>
          </div>
          <div class="inv__cell inv__cell--more">
            <button class="inv__dd-btn" type="button" data-inv-more aria-expanded="false" aria-controls="inv-adv"><span class="inv__lab">Refine</span><span class="inv__val">More filters<span data-inv-mcount></span></span><svg class="inv__ico" viewBox="0 0 20 14" width="18" height="13" aria-hidden="true" focusable="false"><path d="M1 3h18M1 11h18" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="6" cy="3" r="2.2" fill="var(--ivory)" stroke="currentColor" stroke-width="1.5"/><circle cx="14" cy="11" r="2.2" fill="var(--ivory)" stroke="currentColor" stroke-width="1.5"/></svg></button>
          </div>
          <label class="inv__cell inv__cell--search"><svg class="inv__loupe" viewBox="0 0 16 16" width="15" height="15" aria-hidden="true" focusable="false"><circle cx="7" cy="7" r="5.2" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M11 11l4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg><span class="vh">Keyword</span><input type="search" placeholder="Make, model or keyword" data-inv-q autocomplete="off"></label>
        </div>
      </div>
      <div class="inv__adv" id="inv-adv" data-inv-adv hidden></div>
    </div>
    <div class="inv__sub">
      <div class="inv__rooms" role="group" aria-label="Showroom" data-inv-rooms></div>
      <div class="inv__cell inv__cell--sort" data-dd data-dd-label="Sort by"><select class="inv__native" data-inv-sort tabindex="-1" aria-hidden="true">
        <option value="featured">Featured</option>
        <option value="price-desc">Price: high to low</option>
        <option value="price-asc">Price: low to high</option>
        <option value="miles-asc">Mileage: lowest first</option>
        <option value="year-desc">Year: newest first</option>
        <option value="year-asc">Year: oldest first</option>
      </select></div>
    </div>
    <div class="inv__meta"><p class="inv__count" aria-live="polite" data-inv-count></p><ul class="inv__tags" data-inv-tags aria-label="Active filters"></ul><button class="inv__clear" type="button" data-inv-clear hidden>Clear filters</button></div>
    <ul class="inv__grid" data-inv-grid></ul>
    <div class="inv__empty" data-inv-empty hidden>
      <p class="sub__h2 disp">Nothing matches that search</p>
      <p class="inv__empty-t">Try another make, or clear the filters to see all cars.</p>
      <button class="btn sub__btn" type="button" data-inv-clear>Clear filters</button>
    </div>
  </main>'''

VDP = '''
  <main id="main" class="sub vdp" data-vdp>
    <nav class="vdp__sn" aria-label="On this page" data-vdp-sn>
      <div class="vdp__sn-in">
        <p class="vdp__sn-t"><span class="disp" data-sn-title></span><span class="vdp__sn-p t-num" data-sn-price></span></p>
        <ul class="vdp__sn-l"><li><a href="#vdp-ov">Overview</a></li><li data-sn-opt><a href="#vdp-options">Options</a></li><li><a href="#vdp-specs">Specifications</a></li><li><a href="#vdp-finance">Finance</a></li><li><a href="#vdp-contact">Showroom</a></li></ul>
        <button class="btn btn--red sub__btn" type="button" data-inq-intent="availability">Inquire ''' + ARR + '''</button>
      </div>
    </nav>
    <div class="vdp__mb" data-vdp-mb><a class="btn sub__btn sub__btn--line" data-mb-call href="#vdp-contact">Call</a><button class="btn btn--red sub__btn" type="button" data-inq-intent="availability">Inquire ''' + ARR + '''</button></div>
    <div class="vdp__bar">
    <nav class="vdp__crumbs" aria-label="Breadcrumb"><ol>
      <li><a href="inventory.html">Inventory</a></li>
      <li><a href="inventory.html" data-vdp-room-link></a></li>
      <li aria-current="page" data-vdp-crumb></li>
    </ol></nav>
    <div class="vdp__acts">
      <button class="vdp__act" type="button" data-vdp-save aria-pressed="false"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z" fill="var(--heart, none)" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg><span data-vdp-save-l>Save</span></button>
      <button class="vdp__act" type="button" data-vdp-share><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M12 15V3.5M7.5 8 12 3.5 16.5 8M5 12.5V20h14v-7.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Share</span></button>
      <button class="vdp__act" type="button" data-vdp-text aria-expanded="false" aria-haspopup="dialog"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><rect x="6.5" y="2.5" width="11" height="19" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M10.5 18.5h3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg><span data-vdp-text-l>Send to phone</span></button><div class="vdp__s2p" data-s2p hidden role="dialog" aria-label="Send this car to your phone"><form data-s2p-form novalidate><label class="inq__f"><span>Your mobile number</span><input name="tel" type="tel" autocomplete="tel" placeholder="(555) 123-4567" required></label><button class="btn btn--red sub__btn" type="submit">Send link</button><p class="vdp__s2p-ph">We text you a link to this car. Prototype — nothing is sent.</p></form><p class="vdp__s2p-done" data-s2p-done hidden tabindex="-1"></p></div>
      <p class="vdp__toast" data-vdp-toast role="status" aria-live="polite"></p>
    </div>
    </div>
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
        <div class="vdp__pbox">
          <p class="vdp__price t-num" data-vdp-price></p>
          <div class="vdp__pricing" data-vdp-pricing></div>
          <p class="vdp__pnote" id="vdp-pnote" data-vdp-pnote hidden>Prices are set by the showroom and exclude taxes, title and registration. Confirm the final, out-the-door price with the showroom before you buy.</p>
        </div>
        <div class="vdp__cta">
          <button class="btn btn--red sub__btn" type="button" data-vdp-avail aria-haspopup="dialog">Inquire ''' + ARR + '''</button>
          <a class="btn sub__btn sub__btn--line" href="#vdp-contact" data-vdp-call></a>
        </div>
        <dl class="vdp__quick" data-vdp-quick></dl>
        <ul class="vdp__tools">
          <li><button type="button" data-inq-intent="viewing"><svg class="vdp__ti" viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false"><rect x="2.5" y="4" width="15" height="13" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M2.5 8h15M6.5 2v4M13.5 2v4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg><span>Schedule a viewing</span></button></li>
          <li><button type="button" data-inq-intent="trade"><svg class="vdp__ti" viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false"><path d="M3 7h12l-3-3M17 13H5l3 3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Value my trade</span></button></li>
          <li data-vdp-paycell><a href="#vdp-finance"><svg class="vdp__ti" viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false"><rect x="4" y="2.5" width="12" height="15" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M7 6.5h6M7 10.5h.01M10 10.5h.01M13 10.5h.01M7 13.8h.01M10 13.8h.01M13 13.8h.01" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg><span>Estimate a payment</span></a></li>
          <li><button class="vdp__carfax" type="button" data-vdp-carfax aria-expanded="false" aria-controls="vdp-carfax-note"><img class="vdp__carfax-logo" src="assets/img/brand/carfax.svg" width="127" height="30" alt="CARFAX"><span>Report</span></button></li>
        </ul>
        <p class="vdp__carfax-note" id="vdp-carfax-note" data-vdp-carfax-note hidden></p>
      </aside>
    </div>
    <section class="vdp__body" aria-labelledby="vdp-ov">
      <div class="vdp__story">
        <p class="sub__kicker">The car</p>
        <h2 class="vdp__h disp" id="vdp-ov">Overview</h2>
        <p class="vdp__lead" data-vdp-lead></p>
        <div class="vdp__ov" data-vdp-ov></div>
        <div class="vdp__opts" data-vdp-opts-wrap id="vdp-options"><h3 class="vdp__h3">Options</h3><ul class="vdp__optlist" data-vdp-opts></ul></div>
        <p class="vdp__close" data-vdp-close></p>
      </div>
      <div class="vdp__specs" id="vdp-specs"><h3 class="sub__kicker vdp__spec-k">Specifications</h3><ul class="vdp__figs" data-vdp-figs></ul><div class="vdp__groups" data-vdp-spec></div></div>
    </section>
    <section class="vdp__fin" id="vdp-finance" aria-labelledby="vdp-fin-h" data-vdp-fin>
      <div class="vdp__fin-hd">
        <p class="sub__kicker">Finance</p>
        <h2 class="vdp__h disp" id="vdp-fin-h">Estimate a payment</h2>
        <p class="vdp__fin-sub">Your own figures, worked out here in the browser. Nothing is sent.</p>
      </div>
      <form class="vdp__calc" data-vdp-calc novalidate>
        <label class="inq__f"><span>Vehicle price</span><input name="price" inputmode="numeric" autocomplete="off"></label>
        <label class="inq__f"><span>Down payment</span><input name="down" inputmode="numeric" autocomplete="off"></label>
        <label class="inq__f"><span>Term</span><select name="term"><option value="36">36 months</option><option value="48">48 months</option><option value="60" selected>60 months</option><option value="72">72 months</option><option value="84">84 months</option></select></label>
        <label class="inq__f"><span>APR <i>your rate</i></span><input name="apr" inputmode="decimal" placeholder="e.g. 7.5" autocomplete="off"></label>
      </form>
      <div class="vdp__calc-out" aria-live="polite">
        <p class="vdp__calc-k">Estimated monthly payment</p>
        <p class="vdp__calc-n disp" data-calc-n>—</p>
        <p class="vdp__calc-f" data-calc-f>Enter your rate to see the estimate.</p>
        <div class="vdp__calc-cta">
          <button class="btn btn--red sub__btn" type="button" data-inq-intent="finance">Get pre-qualified ''' + ARR + '''</button>
          <button class="vdp__lnk" type="button" data-inq-intent="trade">Value my trade</button>
        </div>
        <p class="vdp__calc-legal">An estimate from the figures you enter, not an offer or a quote. It leaves out tax, title, registration and fees; the rate depends on the lender and your credit. Leasing is also available through the showroom.</p>
      </div>
    </section>
    <section class="vdp__buy" aria-labelledby="vdp-buy-h" data-vdp-buy hidden>
      <div class="vdp__buy-hd"><p class="sub__kicker">The showroom</p><h2 class="vdp__h disp" id="vdp-buy-h">Buying from Select</h2></div>
      <ul class="vdp__buy-l" data-vdp-buy-l></ul>
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
    <div class="inq" data-inq hidden>
      <div class="inq__scrim" data-inq-close></div>
      <div class="inq__sheet" role="dialog" aria-modal="true" aria-labelledby="inq-h" data-lenis-prevent>
        <div class="inq__top">
          <p class="sub__kicker" id="inq-h">Inquire about this car</p>
          <button class="inq__x" type="button" data-inq-close aria-label="Close">×</button>
        </div>
        <div class="inq__car" data-inq-car></div>
        <div class="inq__intents" role="radiogroup" aria-label="What can the showroom do for you?" data-inq-intents>
          <button type="button" class="chip chip--s" role="radio" data-intent="availability">Availability</button><button type="button" class="chip chip--s" role="radio" data-intent="viewing">Viewing</button><button type="button" class="chip chip--s" role="radio" data-intent="trade">Trade-in</button><button type="button" class="chip chip--s" role="radio" data-intent="finance">Finance</button><button type="button" class="chip chip--s" role="radio" data-intent="video">Video</button>
        </div>
        <form class="inq__form" data-inq-form novalidate>
          <div class="inq__row">
            <label class="inq__f"><span>First name</span><input name="first" autocomplete="given-name" required></label>
            <label class="inq__f"><span>Last name</span><input name="last" autocomplete="family-name" required></label>
          </div>
          <label class="inq__f"><span>Email</span><input name="email" type="email" autocomplete="email" required></label>
          <label class="inq__f"><span>Phone <i>optional</i></span><input name="phone" type="tel" autocomplete="tel"></label>
          <div class="inq__row" data-intent-f="viewing" hidden>
            <label class="inq__f"><span>Preferred day</span><input name="vday" type="date"></label>
            <label class="inq__f"><span>Time</span><select name="vtime"><option>Any time</option><option>Morning</option><option>Afternoon</option><option>Evening</option></select></label>
          </div>
          <fieldset class="inq__fs" data-intent-f="trade" hidden>
            <legend>Your current car</legend>
            <div class="inq__row inq__row--3">
              <label class="inq__f"><span>Year</span><input name="tyear" inputmode="numeric" maxlength="4"></label>
              <label class="inq__f"><span>Make &amp; model</span><input name="tmodel"></label>
              <label class="inq__f"><span>Mileage</span><input name="tmiles" inputmode="numeric"></label>
            </div>
          </fieldset>
          <div class="inq__pref" role="radiogroup" aria-label="Best way to reach you" data-inq-pref>
            <span class="inq__pref-k">Best way to reach you</span><button type="button" class="chip chip--s" role="radio" aria-checked="false" data-pref="Call">Call</button><button type="button" class="chip chip--s" role="radio" aria-checked="false" data-pref="Text">Text</button><button type="button" class="chip chip--s" role="radio" aria-checked="true" data-pref="Email">Email</button>
          </div>
          <label class="inq__f"><span>Message</span><textarea name="msg" rows="6" data-inq-msg></textarea></label>
          <p class="inq__err" data-inq-err hidden>Please add your name and a valid email.</p>
          <button class="btn btn--red sub__btn inq__send" type="submit">Send inquiry ''' + ARR + '''</button>
          <p class="inq__ph">Prototype — the form is not connected yet; nothing is sent.</p>
        </form>
        <div class="inq__done" data-inq-done hidden tabindex="-1"></div>
      </div>
    </div>
  </main>'''

page('inventory.html', 'Inventory — duPont REGISTRY Select',
     'Exotic and collector cars available now at duPont REGISTRY Select — Southern California, Naples and Miami.',
     'sub-page srp-page', SRP)
page('car.html', 'duPont REGISTRY Select — Vehicle',
     'A car available now at duPont REGISTRY Select.', 'sub-page vdp-page', VDP)
