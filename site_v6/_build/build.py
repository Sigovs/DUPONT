"""Builds the three pages: index.html, inventory.html, car.html.   python3 site_v6/_build/build.py"""
import os, re, sys, hashlib
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import mains

def rd(p): return open(os.path.join(HERE, p), encoding='utf-8').read()
def v(path):
    return path + '?v=' + hashlib.md5(open(os.path.join(OUT, path), 'rb').read()).hexdigest()[:8]
def css(*names): return ''.join('  <link rel="stylesheet" href="%s">\n' % v(n) for n in names)
def js(*names): return ''.join('  <script src="%s" defer></script>\n' % v(n) for n in names)

HEADER, FTR = rd('partials/header.html'), rd('partials/footer.html')
HEADER = re.sub(r'<button type="submit" class="btn btn--red">Search</button>', '<button type="submit" class="b6">Search</button>', HEADER)
ARR = '<svg class="arr6" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M8 2.67l-.94.94 3.72 3.72H2.67v1.34h8.11l-3.72 3.72.94.94L13.33 8z"/></svg>'
PV = '<svg viewBox="0 0 16 10" width="16" height="10" aria-hidden="true" focusable="false"><path d="M16 5H2M6 1L2 5l4 4" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>'
NX = '<svg viewBox="0 0 16 10" width="16" height="10" aria-hidden="true" focusable="false"><path d="M0 5h14M10 1l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>'
CHEV = '<svg viewBox="0 0 21 12" aria-hidden="true" focusable="false"><path d="M21 10.5V12h-1.5l-9-9-9 9H0v-1.5L10.5 0z" fill="currentColor"/></svg>'

def ctl(what): return ('<div class="r6__ctl"><button class="r6__b" type="button" data-prev aria-label="Previous %s">%s</button><span class="r6__n" data-n></span>'
                       '<button class="r6__b" type="button" data-next aria-label="Next %s">%s</button></div>' % (what, PV, what, NX))
def m(t, d=0): return '<span class="m6" style="--d:%d"><span>%s</span></span>' % (d, t)

HEAD = '''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <script>try{document.documentElement.dataset.theme=localStorage.getItem("dr-theme")||"dark"}catch(e){document.documentElement.dataset.theme="dark"}document.documentElement.classList.add("js")</script>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>%s</title>
  <meta name="description" content="%s">
  <meta name="robots" content="noindex, nofollow">
  <link rel="icon" href="data:,">
  <link rel="preload" href="assets/fonts/manrope-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="assets/fonts/roboto-latin.woff2" as="font" type="font/woff2" crossorigin>
'''

# ------------------------------------------------------------------ showrooms + footer (every page)
ROOMS = [
 ('01', 'Murrieta, CA', 'Southern California', 'duPont REGISTRY Select SoCal', '26900 Jefferson Ave<br>Murrieta, CA 92562', 'Mon–Fri 9–6 · Sat 10–5 · Sun closed', '(951) 292-6100',
  'https://www.dupontregistry.com/dealer/dupont--registry--select--socal/814', '26900+Jefferson+Ave%2C+Murrieta%2C+CA+92562', 'assets/img/v6/rooms/socal.webp', 'The showroom floor at Select SoCal, Murrieta', '50% 50%'),
 ('02', 'Naples, FL', 'Naples', 'duPont REGISTRY Select Naples', '2365 Linwood Ave.<br>Naples, FL 34112', 'Hours not published — call ahead', '(239) 449-9191',
  'https://www.dupontregistry.com/dealer/dupont--registry--select--naples/7426', '2365+Linwood+Ave%2C+Naples%2C+FL+34112', 'assets/img/v6/rooms/naples.webp', 'Two Dodge Vipers outside the Naples showroom', '50% 50%'),
 ('03', 'Miami, FL', 'Miami', 'duPont REGISTRY Miami', '5972 NE 4th Ave<br>Miami, FL 33137', 'Hours not published — call ahead', '(615) 471-0221',
  'https://www.dupontregistry.com/dealer/dupont--registry--select--miami/3730', '5972+NE+4th+Ave%2C+Miami%2C+FL+33137', 'assets/img/v6/rooms/miami.webp', 'Three Ferraris with their engine covers open', '50% 50%'),
]
def rooms():
    li = ''
    for i, (n, city, name, dealer, addr, hours, tel, web, mp, img, alt, op) in enumerate(ROOMS):
        li += '''      <li class="s6__i">
        <figure class="s6__ph o6" style="--d:%d"><img src="%s" alt="%s" style="object-position:%s" loading="lazy" decoding="async"></figure>
        <p class="s6__no"><b>%s</b><span>%s</span></p>
        <h3 class="s6__t">%s</h3>
        <p class="s6__d">%s</p>
        <address class="s6__a">%s</address>
        <dl class="s6__f"><dt>Hours</dt><dd>%s</dd><dt>Phone</dt><dd class="t-num">%s</dd></dl>
        <div class="s6__c"><a class="b6" href="%s" target="_blank" rel="noopener">Visit Website %s<span class="vh"> — %s</span></a><a class="b6 b6--line" href="https://www.google.com/maps/dir/?api=1&amp;destination=%s" target="_blank" rel="noopener">Directions<span class="vh"> to %s</span></a></div>
      </li>
''' % (i, v(img), alt, op, n, city, name, dealer, addr, hours, tel, web, ARR, name, mp, name)
    return '''  <section class="s6" id="showrooms" aria-labelledby="rooms-h" data-in>
    <div class="wrap">
      <p class="k6">%s</p>
      <h2 class="h6" id="rooms-h">%s</h2>
      <p class="p6">duPont REGISTRY Select brings the brand to life across three showrooms, where enthusiasts can experience a curated collection of exceptional automobiles in person.</p>
      <ul class="s6__l">
%s      </ul>
    </div>
  </section>
''' % (m('Showrooms'), m('Visit a showroom', 1), li)

TAIL = rooms() + '  </main>\n  <footer class="ft6">\n' + FTR + '  </footer>\n'

# ------------------------------------------------------------------ home
HERO = [('01', 'Four Porsche 911 GT2 RS outside the Select SoCal showroom, Murrieta', '50%', '66%', '.45', '78%'),
        ('02', 'Four Porsche 911s lined up inside the showroom', '50%', '78%', '.45', '62%'),
        ('03', 'A McLaren 765LT Spider and a Lamborghini Huracán EVO Spyder', '50%', '56%', '.52', '62%')]
def slide(i, s):
    n, alt, ox, oy, ov, mx = s; b = 'assets/img/v6/hero/%s-' % n
    ss = '%s828.webp 828w, %s1440.webp 1440w, %s2400.webp 2400w' % (b, b, b)
    src = ('src="%s1440.webp" srcset="%s" fetchpriority="high"' % (b, ss)) if i == 0 else ('src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" data-src="%s1440.webp" data-srcset="%s"' % (b, ss))
    mob = '<source media="(max-width: 759px)" %ssrcset="assets/img/v6/hero/m%s.webp">' % ('' if i == 0 else 'data-', n)
    return ('      <div class="hr__s%s" style="--ox:%s;--oy:%s;--ov:%s;--mx:%s"><picture>' + mob + '<img %s sizes="(max-width: 759px) 160vw, 100vw" width="2400" height="1600" alt="%s" decoding="async"></picture></div>\n') % (' is-on' if i == 0 else '', ox, oy, ov, mx, src, alt)

MARQ = [(n, 'assets/img/v6/marque/%s' % n.lower().replace(' ', '-')) for n in ('Ferrari', 'Porsche', 'Lamborghini', 'McLaren', 'Aston Martin', 'Ford')]
ALT = {'Ferrari': 'Red Ferrari 458 Spider', 'Porsche': 'Blue Porsche 911 GT2 RS', 'Lamborghini': 'Yellow Lamborghini Countach', 'McLaren': 'Orange McLaren 765LT', 'Aston Martin': 'Blue Aston Martin Vantage Roadster', 'Ford': 'White Ford GT with blue stripes'}
LOGO = {'Ferrari': (63, 88), 'Porsche': (68, 88), 'Lamborghini': (77, 88), 'McLaren': (120, 12), 'Aston Martin': (119, 27), 'Ford': (118, 45)}
REV = [('James M.', 'Owner - 2006 Ford GT', 'The car was exactly as described, down to the last mark on the sill. No surprises at delivery — just the car, and the paperwork in order.'),
       ('Laura R.', 'Owner - 2019 Porsche 911 Speedster', 'They found the car we had been looking for, and told us honestly what it needed before we committed.'),
       ('Daniel K.', 'Owner - 2021 McLaren 765LT', 'Delivery was arranged around our schedule, not theirs. The car arrived detailed and fully charged.'),
       ('Andrea S.', 'Seller - 2015 Ferrari 458 Speciale', 'Selling through the showroom was quieter than I expected — one offer, one call, done in a week.'),
       ('Michael T.', 'Owner - 2018 Porsche 911 GT2 RS', 'Every question answered by someone who had actually driven the car. That is rare.')]
IG = [[('01-DeR-igHJc8U', 'westcoastexoticcars/reel/DeR-igHJc8U', 'Two Ferrari 488 Pista in the showroom', '@westcoastexoticcars · Oct 9'),
       ('10-Dd_6Yuhm_ns', 'westcoastexoticcars/p/Dd_6Yuhm_ns', 'Orange Porsche 911 GT3 RS, Select Miami', '@westcoastexoticcars · Oct 2'),
       ('05-DeK4d0_l1yZ', 'dupontregistry/p/DeK4d0_l1yZ', 'Porsche 911 Speedster, Select SoCal', '@dupontregistry · Oct 6')],
      [('09-DeCZhXzm65Y', 'westcoastexoticcars/p/DeCZhXzm65Y', 'White Lamborghini Huracán STO on the road', '@westcoastexoticcars · Oct 3'),
       ('08-DeHqc3VGnvo', 'westcoastexoticcars/p/DeHqc3VGnvo', 'McLaren 765LT, Select SoCal', '@westcoastexoticcars · Oct 5'),
       ('12-Dd6w76aMAku', 'aml_dupont/reel/Dd6w76aMAku', 'Black Porsche 911 GT2 RS in the showroom', '@aml_dupont · Sep 30')],
      [('07-DeIGISigQwn', 'aml_dupont/reel/DeIGISigQwn', 'Blue Porsche 911 GT2 RS under the palms', '@aml_dupont · Oct 5'),
       ('02-DeR87_3PUp1', 'aml_dupont/reel/DeR87_3PUp1', 'Two Porsche 911 GT3 RS outside the Naples showroom', '@aml_dupont · Oct 9'),
       ('06-DeKckLuD8_5', 'westcoastexoticcars/p/DeKckLuD8_5', 'Black Porsche 911 GT3 Touring, Select Naples', '@westcoastexoticcars · Oct 6')]]
def igcol(c): return '<ul class="ig6__c">' + ''.join('<li><a href="https://www.instagram.com/%s/" target="_blank" rel="noopener"><img src="assets/img/ig/%s.webp" alt="%s" width="480" height="600" loading="lazy" decoding="async">%s</a></li>' % (u, f, a, cap) for f, u, a, cap in c) + '</ul>'
def loc(k, name, o):
    return '''      <div class="lo__row" data-loc="%s">
        <h3 class="lo__h"><button class="lo__b" type="button" aria-expanded="%s" aria-controls="lo-%s"><span class="lo__n">%s</span><span class="lo__x"><span>Explore our inventory</span>%s</span></button></h3>
        <div class="lo__p%s" id="lo-%s"><div data-loc-body>
          <div class="r6__bar"><a class="b6 b6--line" href="inventory.html?showroom=%s" style="min-width:188px">Show All %s</a>%s</div>
          <ul class="r6" data-lenis-prevent-touch aria-label="Cars in %s"></ul>
        </div></div>
      </div>
''' % (k, 'true' if o else 'false', k, name, CHEV, ' is-open' if o else '', k, k, ARR, ctl('car'), name)

HOME = '''  <main id="main">
  <section class="hr" id="top" aria-label="Welcome">
    <div class="hr__in" data-hero>
%s      <div class="hr__t" data-in>
        <p class="hr__k">%s</p>
        <h1 class="hr__h">%s %s</h1>
        <p class="hr__p">Exceptional inventory, transparent pricing, and dedicated expert support from click to keys.</p>
        <a class="b6 b6--w" href="inventory.html">View the collection %s</a>
      </div>
      <div class="hr__c" role="group" aria-label="Photographs">
        <button class="hr__d" type="button" aria-label="Photograph 1 of 3" aria-current="true"></button><button class="hr__d" type="button" aria-label="Photograph 2 of 3"></button><button class="hr__d" type="button" aria-label="Photograph 3 of 3"></button>
        <button class="hr__nx" type="button" aria-label="Next photograph"><svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false"><path d="M3.33 8h9.34M8 3.34L12.67 8 8 12.67" fill="none" stroke="currentColor" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      </div>
    </div>
  </section>

  <section class="an" id="inventory" aria-labelledby="an-h" data-available data-in>
    <div class="wrap">
      <p class="k6">%s</p>
      <h2 class="h6" id="an-h">%s</h2>
      <p class="p6">Six of 13 · prices and miles as of 21 Oct 2026</p>
      <div class="r6__bar"><a class="b6 b6--line b6--w" href="inventory.html">View the collection %s</a>%s</div>
    </div>
    <ul class="r6" aria-label="Cars available now"></ul>
  </section>

  <section class="mq" id="collection" aria-labelledby="mq-h" data-marque data-in>
    <div class="mq__in">
      <div class="mq__t">
        <p class="k6">%s</p>
        <h2 class="h6" id="mq-h">%s %s</h2>
        <p class="p6" style="max-width:22.5em">Explore a handpicked selection of exceptional cars from the world’s most celebrated marques.</p>
        <ul class="mq__l">%s</ul>
        <a class="b6 b6--w mq__cta" href="inventory.html">View All %s</a>
      </div>
      <div class="mq__ph o6">%s</div>
    </div>
  </section>

  <section class="se" id="sell" aria-labelledby="se-h" data-in>
    <video src="assets/video/sell-loop.mp4" poster="assets/video/sell-poster.webp" autoplay muted loop playsinline preload="metadata" disablepictureinpicture aria-hidden="true"></video>
    <div class="se__t">
      <p class="k6">%s</p>
      <h2 class="h6" id="se-h">%s</h2>
      <p class="p6">Connect with your nearest showroom to discuss selling your car or trading it in for your next one.</p>
      <a class="b6 b6--w" href="#showrooms">Talk to a specialist %s</a>
    </div>
  </section>

  <section class="rw" id="reviews" aria-labelledby="rw-h" data-reviews data-in>
    <p class="k6">%s</p>
    <h2 class="h6" id="rw-h">%s %s</h2>
    <div class="rw__v" role="group" aria-roledescription="carousel" aria-label="Reviews" tabindex="0">%s</div>
    <div class="rw__c">%s</div>
    <p class="rw__demo">Sample reviews</p>
  </section>

  <section class="ig6" id="instagram" aria-labelledby="ig-h" data-ig data-in>
    <div class="ig6__pin">
      <div class="ig6__h">
        <p class="k6">%s</p>
        <h2 class="h6" id="ig-h">%s</h2>
        <p class="p6">See the latest arrivals and get a behind-the-scenes look at the showroom.<span class="ig6__at">@westcoastexoticcars</span></p>
        <a class="b6 b6--w" href="https://www.instagram.com/westcoastexoticcars/" target="_blank" rel="noopener">Follow Us %s</a>
      </div>
      <div class="ig6__v"><div class="ig6__w">%s</div></div>
    </div>
  </section>

  <section class="lo" id="locations" aria-labelledby="lo-h" data-in>
    <div class="wrap"><p class="k6">%s</p><h2 class="h6" id="lo-h">%s</h2></div>
    <div class="lo__l">
%s    </div>
  </section>
''' % (''.join(slide(i, s) for i, s in enumerate(HERO)), m('SELECT by duPont REGISTRY'), m('A Trusted Partner For', 1), m('You and Your Vehicle', 2), ARR,
       m('The Collection'), m('Available Now', 1), ARR, ctl('car'),
       m('Browse by marque'), m('Chosen.', 1), m('One at a time.', 2),
       ''.join('<li><button class="mq__b" type="button" data-make="%s" aria-pressed="%s"><img src="%s" alt="%s" width="%d" height="%d"></button></li>' % (n, 'true' if i == 0 else 'false', v('assets/img/v6/logo/%s.svg' % n.lower().replace(' ', '-')), n, *LOGO[n]) for i, (n, _) in enumerate(MARQ)), ARR,
       ''.join('<img%s data-make="%s" src="%s.webp" srcset="%s-800.webp 800w, %s.webp 1520w" sizes="(max-width: 1151px) 94vw, 55vw" alt="%s" width="1520" height="1436" loading="lazy" decoding="async">' % (' class="is-on"' if i == 0 else '', n, p, p, p, ALT[n]) for i, (n, p) in enumerate(MARQ)),
       m('Sell or trade'), m('Ready to Sell Your Car?', 1), ARR,
       m('From owners'), m('In Their Words', 1), m('Buyers and Sellers', 2),
       ''.join('<figure class="rw__s" data-o="%d" style="--o:%d"%s><figcaption class="rw__w">%s<br>%s</figcaption><blockquote class="rw__q">“%s”</blockquote></figure>' % (i, i, ' data-far' if i > 1 else '', a, b, q) for i, (a, b, q) in enumerate(REV)), ctl('review'),
       m('Instagram'), m('Seen at Select', 1), ARR, ''.join(igcol(c) for c in IG),
       m('SoCal &nbsp;|&nbsp; Naples &nbsp;|&nbsp; Miami'), m('Three Locations. One Standard Of Excellence.', 1),
       loc('socal', 'SoCal', True) + loc('miami', 'Miami', False) + loc('naples', 'Naples', False))

def write(name, title, desc, cls, styles, body, scripts):
    h = HEAD % (title, desc) + css(*styles) + '</head>\n<body class="%s">\n' % cls
    open(os.path.join(OUT, name), 'w', encoding='utf-8').write(h + body + scripts + '</body>\n</html>\n'); print('wrote', name)

BASE_JS = js('assets/data/sel13.js', 'assets/vendor/gsap.min.js', 'assets/vendor/lenis.min.js', 'assets/js/chrome.js', 'assets/js/card.js')
write('index.html', 'duPont REGISTRY Select — Exotic and collector cars', 'duPont REGISTRY Select: exotic and collector cars at three showrooms — Southern California, Naples and Miami.', 'home',
      ['assets/vendor/lenis.css', 'assets/css/v5.css', 'assets/css/v6.css', 'assets/css/home.css'], HEADER + HOME + TAIL, BASE_JS + js('assets/js/home.js', 'assets/js/v5.js'))

def to_home(h): return re.sub(r'href="#(?!main\b|vdp|showrooms\b)([\w-]+)"', r'href="index.html#\1"', h)
def sub(main): return to_home(HEADER) + main + '\n' + TAIL.split('  </main>')[0] + to_home('  <footer class="ft6">\n' + FTR + '  </footer>\n')
SUBCSS = ['assets/vendor/lenis.css', 'assets/css/v4.css', 'assets/css/sub.css', 'assets/css/v5.css', 'assets/css/v5-theme.css', 'assets/css/v6.css']
if os.path.exists(os.path.join(OUT, 'assets/css/sub6.css')): SUBCSS.append('assets/css/sub6.css')
write('inventory.html', 'Inventory — duPont REGISTRY Select', 'Exotic and collector cars available now at duPont REGISTRY Select — Southern California, Naples and Miami.', 'sub-page srp-page', SUBCSS, sub(mains.SRP), BASE_JS + js('assets/js/sub.js', 'assets/js/v5.js'))
write('car.html', 'duPont REGISTRY Select — Vehicle', 'A car available now at duPont REGISTRY Select.', 'sub-page vdp-page', SUBCSS, sub(mains.VDP), BASE_JS + js('assets/js/sub.js', 'assets/js/v5.js'))
