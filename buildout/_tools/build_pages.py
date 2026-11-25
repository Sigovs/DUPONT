"""Writes the sub pages into site/ from bodies.py. Header, showrooms and footer come from site/inventory.html.
   Internal: not part of the package sent to developers (the pages it writes are plain HTML)."""
import os, re, sys
sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.abspath(__file__)); SITE = os.path.join(HERE, '..', 'site')
sys.path.insert(0, HERE)
import bodies
inv = open(os.path.join(SITE, 'inventory.html'), encoding='utf-8').read()
home = open(os.path.join(SITE, 'index.html'), encoding='utf-8').read()
HEAD = inv[:inv.index('<link rel="stylesheet" href="assets/css/catalog.css">')] + '<link rel="stylesheet" href="assets/css/pages.css?v=18">\n</head>\n'
CHROME = inv[inv.index('  <a class="skip'):inv.index('  <main id="main"')]
ROOMS = inv[inv.index('  <section class="showrooms"'):inv.index('  <footer class="site-footer">')]
FOOT = inv[inv.index('  <footer class="site-footer">'):].replace('assets/js/inventory.js', 'assets/js/pages.js?v=8')
CTL = re.search(r'<div class="rail__ctl">.*?</div>', home, re.S).group(0)
def ctl(what): return CTL.replace('Previous car', 'Previous ' + what).replace('Next car', 'Next ' + what)
def m(t, d=0): return '<span class="line-mask" style="--d:%d"><span>%s</span></span>' % (d, t)
def write(name, title, desc, cls, body):
    h = re.sub(r'<title>.*?</title>', '<title>%s</title>' % title, HEAD)
    h = re.sub(r'(<meta name="description" content=")[^"]*', lambda x: x.group(1) + desc, h)
    rooms = ROOMS.replace('</main>\n', '').replace('  </main>', '')
    open(os.path.join(SITE, name), 'w', encoding='utf-8').write(h + '<body class="%s">\n' % cls + CHROME + body + rooms.rstrip() + '\n  </main>\n' + FOOT)
    print('wrote', name)
write('sell.html', 'Sell Your Car — duPont REGISTRY Select', 'Sell your exotic, luxury or classic car: submit the details, get a cash offer, and we pick up the car.', 'page-sell', bodies.sell(None, m, '', ctl))
write('sell-form.html', 'Sell Your Car: Details — duPont REGISTRY Select', 'Start with the license plate, the VIN, or the make and model.', 'page-sell-form', bodies.sell_form(None, m, ''))
ARR = re.search(r'<svg class="arrow".*?</svg>', home, re.S).group(0)
write('insurance.html', 'Exotic &amp; Luxury Car Insurance — duPont REGISTRY Select', 'Specialized luxury car insurance and exotic vehicle coverage for collectors and high-net-worth owners.', 'page-insurance', bodies.insurance(m, ARR))
write('insurance-quote.html', 'Insurance Quote — duPont REGISTRY Select', 'Request a complimentary quote for your exotic, luxury or classic car.', 'page-insurance-quote', bodies.insurance_quote(m, ARR))
write('finance.html', 'Exotic Car Financing &amp; Luxury Supercar Loans — duPont REGISTRY Select', 'Leasing and financing for exotic, luxury and collector vehicles. Pre-qualify with no credit impact.', 'page-finance', bodies.finance(m, ARR, ctl))
write('protect.html', 'Exotic Car Warranty &amp; Luxury Vehicle Protection — duPont REGISTRY Select', 'Vehicle service plans for exotic, highline and luxury cars.', 'page-protect', bodies.service(m, ARR, bodies.PROTECT))
write('protect-quote.html', 'Protect Quote — duPont REGISTRY Select', 'Request a vehicle protection quote.', 'page-protect-quote', bodies.protect_quote(m, ARR))
write('ship.html', 'Luxury Car Transport — duPont REGISTRY Select', 'Auto transport for exotic, collector and luxury vehicles.', 'page-ship', bodies.service(m, ARR, bodies.SHIP))
write('ship-quote.html', 'Ship Quote — duPont REGISTRY Select', 'Get a quote to ship your vehicle.', 'page-ship-quote', bodies.ship_quote(m, ARR))
write('paint-protection.html', 'Paint Protection — duPont REGISTRY Select', 'Clear paint protection film, installed with Xpel: full body, full nose and individual coverage.', 'page-paint', bodies.paint(m, ARR))
write('about.html', 'About Us — duPont REGISTRY Select', 'Driving luxury since 1985: the premier exotic and luxury car marketplace.', 'page-about', bodies.about(m, ARR))
write('contact.html', 'Contact Us — duPont REGISTRY Select', 'Get in touch with duPont REGISTRY: advertising, buying, selling and support.', 'page-contact', bodies.contact(m, ARR))
write('service.html', 'Service — duPont REGISTRY Select', 'Expert service for your exotic and luxury vehicle: maintenance, repairs, PPF, tint and detail.', 'page-service', bodies.service_page(m, ARR))
