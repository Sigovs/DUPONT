"""Sub pages: page bodies. Each function returns the <main> opening part; build.py adds showrooms and footer."""

MAKES = [('Lamborghini', 'lamborghini-208.webp', ''), ('Porsche', 'porsche.svg', ''), ('Aston Martin', 'aston-martin.svg', 'aston-martin-dark.svg'), ('BMW', 'bmw.svg', ''),
         ('Audi', 'audi.svg', 'invert'), ('Maserati', 'maserati.svg', ''), ('Rolls-Royce', 'rolls-royce.svg', ''), ('Ferrari', 'ferrari.svg', ''), ('McLaren', 'mclaren.svg', 'invert'),
         ('Land Rover', 'land-rover.svg', ''), ('Mercedes-Benz', 'mercedes-benz.svg', ''), ('Bugatti', 'bugatti.svg', ''), ('Jaguar', 'jaguar-480.webp', 'lift'),
         ('Bentley', 'bentley.svg', ''), ('Lotus', 'lotus.svg', '')]

STEPS = [('Submit Vehicle Details', 'The first step to selling your car online to duPont REGISTRY Private Client involves just answering a few questions about your vehicle in the form above. This includes specific features, its condition, and its location.'),
         ('Get A Cash Offer Online', 'If our acquisition specialists determine that we’d like to acquire or buy your vehicle, we will promptly send you an offer. There is no obligation to accept our offer and it’s good for 7 days/100 miles: take your time to think it over.'),
         ('We Pick Up The Vehicle', 'We will initiate payment to buy your car based on your preference, ACH or wire transfer, within 2-3 business days following arrival and inspection at our facility.'),
         ('Get Paid', 'Once you’ve accepted our offer, we’ll book a time and location that suits you and we’ll come pick up your car. No sweat.')]

FAQ = [('How Do I Get Paid?', '<p>Payment in the form of a check will be sent in 2-3 business days following arrival and inspection at our facility.</p>'),
       ('What Kind Of Cars Do You Buy?', '<p>Examples of automotive makes we provide online quotes for include:</p><ul class="faq__cols">' + ''.join('<li>%s</li>' % x for x in (
           'Aston Martin', 'Bentley', 'BMW', 'Bugatti', 'Ferrari', 'Jaguar', 'Koenigsegg', 'Lamborghini', 'Lotus', 'Maserati', 'McLaren', 'Mercedes-AMG', 'Pagani', 'Porsche', 'Rolls-Royce')) + '</ul>'),
       ('Can I Sell Multiple Cars?', '<p>Absolutely. We will consider all cars that fit our requirements. Through our online car buying process, we can facilitate the sale of multiple vehicles.</p>'),
       ('What If I Change My Mind After Accepting The Offer?', '<p>As long as your payment or title has not been transferred, we can cancel the transaction on your behalf.</p>'),
       ('How Will The Title Transfer Over?', '<p>We will handle the title transfer so you don’t have to.</p>')]

STATES = ('Alabama,Alaska,Arizona,Arkansas,California,Colorado,Connecticut,Delaware,District of Columbia,Florida,Georgia,Hawaii,Idaho,Illinois,Indiana,Iowa,Kansas,Kentucky,Louisiana,Maine,Maryland,'
          'Massachusetts,Michigan,Minnesota,Mississippi,Missouri,Montana,Nebraska,Nevada,New Hampshire,New Jersey,New Mexico,New York,North Carolina,North Dakota,Ohio,Oklahoma,Oregon,Pennsylvania,'
          'Rhode Island,South Carolina,South Dakota,Tennessee,Texas,Utah,Vermont,Virginia,Washington,West Virginia,Wisconsin,Wyoming').split(',')

CHEV = '<svg class="faq__ch" viewBox="0 0 21 12" aria-hidden="true" focusable="false"><path d="M21 10.5V12h-1.5l-9-9-9 9H0v-1.5L10.5 0z" fill="currentColor"/></svg>'


def faq_items(items):
    return ''.join('''        <div class="faq__i" data-faq>
          <h3 class="faq__h"><button class="faq__b" type="button" id="faq-b%d" aria-expanded="false" aria-controls="faq-p%d"><span>%s</span>%s</button></h3>
          <div class="faq__p" id="faq-p%d" role="region" aria-labelledby="faq-b%d"><div><div class="faq__a">%s</div></div></div>
        </div>
''' % (i, i, q, CHEV, i, i, a) for i, (q, a) in enumerate(items))


def logo(n, f, alt):
    if alt == 'invert':
        return '<img class="makes__invert" src="assets/img/makes/%s" alt="" loading="lazy" decoding="async">' % f
    if alt == 'lift':
        return '<img class="makes__lift" src="assets/img/makes/%s" alt="" loading="lazy" decoding="async">' % f
    if alt:
        return '<img class="makes__light" src="assets/img/makes/%s" alt="" loading="lazy" decoding="async"><img class="makes__dark" src="assets/img/makes/%s" alt="" loading="lazy" decoding="async">' % (f, alt)
    return '<img src="assets/img/makes/%s" alt="" loading="lazy" decoding="async">' % f


def sell(v, m, ARR, ctl):
    S = 'assets/img/sell/'
    steps = ''.join('<li class="steps__c"><h3 class="steps__t">%s</h3><p class="steps__p">%s</p></li>' % s for s in STEPS)
    faq = faq_items(FAQ)

    makes = ''.join('<li><div class="makes__a makes__a--s">%s<span class="vh">%s</span></div></li>' % (logo(n, f, a), n) for n, f, a in MAKES)
    return '''  <main id="main" class="page">
  <section class="page-hero" id="top" aria-labelledby="sp-h">
    <div class="page-hero__in" data-in>
      <picture><source media="(max-width: 759px)" srcset="%shero-phone-603.webp"><img src="%shero-1440.webp" srcset="%shero-1440.webp 1440w, %shero-2400.webp 2400w" sizes="100vw" width="2400" height="1207" alt="A red Ferrari Enzo parked under trees" fetchpriority="high" decoding="async"></picture>
      <div class="page-hero__t">
        <h1 class="page-hero__h" id="sp-h">%s %s</h1>
        <p class="page-hero__p">Ready to sell your exotic, luxury or classic car? duPont REGISTRY’s Private Client Program can provide a cash offer and more</p>
        <a class="button button--photo" href="sell-form.html">Let’s Get Started</a>
      </div>
    </div>
  </section>

  <section class="statement" aria-labelledby="dl-h" data-in>
    <h2 class="kicker" id="dl-h">%s</h2>
    <p class="statement__p"><strong>Join our dealer network</strong> to see why duPont REGISTRY has been trusted worldwide by luxury, exotic, and classic automobile dealers since 1985.</p>
    <a class="button button--line" href="https://news.dupontregistry.com/pages/advertising" target="_blank" rel="noopener" data-external-ok>Join Our Dealer Network</a>
  </section>

  <section class="steps" id="how" aria-labelledby="hw-h" data-in>
    <div class="wrap">
      <div class="page-head"><h2 class="heading" id="hw-h">%s</h2><p class="lead">Trade or sell your car for cash online to duPont REGISTRY in just a few easy steps.</p></div>
      <div class="steps__g">
        <figure class="steps__ph photo-open"><img src="%ssteps-685.webp" width="685" height="713" alt="A dark Ferrari on a mountain road" loading="lazy" decoding="async"></figure>
        <div class="steps__r">
          <ol class="steps__l">%s</ol>
          <a class="button button--w" href="sell-form.html">Let’s get started</a>
        </div>
      </div>
    </div>
  </section>

  <section class="faq" id="faq" aria-labelledby="fq-h" data-in>
    <div class="wrap">
      <div class="page-head"><h2 class="heading" id="fq-h">%s</h2><p class="lead">Whether you’re seeking expert guidance, we provide valuable insights to help you make informed decisions.</p></div>
      <div class="faq__l">
%s      </div>
    </div>
  </section>

  <section class="band" aria-labelledby="rd-h" data-in>
    <div class="band__in">
      <picture><source media="(max-width: 559px)" srcset="%sready-phone-390.webp"><img src="%sready-1440.webp" width="1440" height="591" alt="Ferraris lined up outside an arcade" loading="lazy" decoding="async"></picture>
      <div class="page-hero__t">
        <h2 class="band__h" id="rd-h">%s %s</h2>
        <p class="page-hero__p">Ready to sell your exotic, luxury or classic car? duPont REGISTRY’s Private Client Program can provide a cash offer and more</p>
        <a class="button button--photo" href="sell-form.html">Let’s Get Started</a>
      </div>
    </div>
  </section>

  <section class="makes" aria-labelledby="mk-h" data-rail data-in>
    <div class="wrap"><div class="page-head"><h2 class="heading" id="mk-h">%s %s</h2></div></div>
    <ul class="rail makes__rail" aria-label="Makes">%s</ul>
    <div class="wrap"><div class="makes__c">%s</div></div>
  </section>
''' % (S, S, S, S, m('Sell Your Supercar'), m('Online', 1), m('Our Dealers Network'), m('How it Works'), S, steps, m('FAQ'), faq, S, S,
       m('Ready to Sell'), m('Your Car Online?', 1), m('Get Car Quotes Online'), m('By Make and Model', 1), makes, ctl('make'))


def field(label, name, kind='text', extra='', opts=None):
    if opts is not None:
        return '<label class="field"><select name="%s" %s required><option value="" selected disabled hidden></option>%s</select><span class="field__l">%s</span></label>' % (name, extra, ''.join('<option>%s</option>' % o for o in opts), label)
    return '<label class="field"><input name="%s" type="%s" placeholder=" " %s required><span class="field__l">%s</span></label>' % (name, kind, extra, label)


def sell_form(v, m, ARR):
    zipf = field('Zip Code', 'zip', 'text', 'inputmode="numeric" maxlength="5" pattern="[0-9]{5}" autocomplete="postal-code"')
    panes = [('plate', 'License Plate', field('License Plate', 'plate', 'text', 'maxlength="10" autocapitalize="characters" autocomplete="off"') + field('State', 'state', opts=STATES) + zipf),
             ('vin', 'VIN', field('VIN Number', 'vin', 'text', 'minlength="11" maxlength="17" pattern="[A-HJ-NPR-Za-hj-npr-z0-9]{11,17}" autocapitalize="characters" autocomplete="off"') + zipf),
             ('make', 'Make Model', field('Make', 'make', extra='data-make', opts=[]) + field('Model', 'model', extra='data-model disabled', opts=[]) + field('Year', 'year', opts=range(2027, 1929, -1)) + zipf)]
    tabs = ''.join('<button class="sell-form__tab" type="button" role="tab" id="sf-t-%s" aria-controls="sf-%s" aria-selected="%s" tabindex="%s">%s</button>' % (k, k, 'true' if i == 0 else 'false', '0' if i == 0 else '-1', n) for i, (k, n, _) in enumerate(panes))
    body = ''.join('<form class="sell-form__pane" id="sf-%s" role="tabpanel" aria-labelledby="sf-t-%s" data-sell-by="%s" novalidate%s>%s<button class="button sell-form__go" type="submit" disabled>Submit</button></form>' % (k, k, k, '' if i == 0 else ' hidden', f) for i, (k, _, f) in enumerate(panes))
    return '''  <main id="main" class="page sell-form">
  <section class="sell-form__s" id="top" aria-labelledby="sf-h">
    <picture class="sell-form__bg" aria-hidden="true"><source media="(max-width: 759px)" srcset="assets/img/sell/form-phone-796.webp"><img src="assets/img/sell/form-2400.webp" width="2400" height="722" alt="" fetchpriority="high" decoding="async"></picture>
    <div class="sell-form__cards">
      <div class="sell-form__card" data-sellform>
        <h1 class="sell-form__h" id="sf-h">Sell your car</h1>
        <div class="sell-form__tabs" role="tablist" aria-label="Find your car by">%s</div>
        %s
        <div class="sell-form__done" data-sell-done tabindex="-1" hidden></div>
      </div>
      <div class="sell-form__card sell-form__card--d">
        <h2 class="sell-form__dh">Dealers</h2>
        <p class="sell-form__dp"><a href="https://news.dupontregistry.com/pages/advertising" target="_blank" rel="noopener" data-external-ok>Join our dealer</a> network to see why duPont REGISTRY has been trusted worldwide by luxury, exotic, and classic automobile dealers since 1985.</p>
      </div>
    </div>
  </section>
''' % (tabs, body)


# ------------------------------------------------------------------ insurance
COVER = [('High-Value Liability Coverage', 'Secure your financial future with liability coverage tailored for high-net-worth individuals. We provide the high limits necessary to protect your assets.', 'A Ferrari engine bay with red intake manifolds'),
         ('Rare Spare Parts Coverage', 'Our specialized exotic car insurance includes comprehensive coverage for your vehicle’s rare and OEM spare parts to maintain its original integrity.', 'Ferraris on a lawn at an outdoor show'),
         ('White-Glove Concierge Experience', 'We provide a tailored concierge experience for every client, prioritizing your specific needs and executing every request with the highest level of professionalism.', 'A white Rolls-Royce Dawn in a city square')]

WHY = [('Luxury car Insurance Claims', 'Filing a claim for a high-value asset should never be stressful. We have simplified the process for collector car insurance, offering dedicated phone and online filing to ensure your claim is handled by people who know your car’s worth.', 'A white Porsche 911 GT3 RS 4.0 by a brick wall'),
       ('White-Glove Speed', 'Time is a priority for our clients. Our claims process is built for speed, starting within 48 hours of your report. We resolve high-value auto insurance claims quickly to get your vehicle back to showroom condition.', 'A gloved hand opening a car door'),
       ('Choice of Repair Specialist', 'You maintain complete control over your investment. Unlike standard carriers, we support your right to choose the certified technician and ensure your exotic car insurance policy uses only genuine OEM parts.', 'A blue Aston Martin DBS Superleggera on the road')]

INS_FAQ = [('What is duPont REGISTRY Insurance?', 'duPont REGISTRY Insurance is a specialized insurance program designed to protect high-value assets, including luxury homes, exotic and classic cars, yachts, private aircraft, fine art, jewelry, wine collections, and collectibles. Our program is tailored for individuals who require premium coverage with concierge-level service. Whether you own a single high-value asset or a diverse collection, we provide customized insurance solutions to meet your unique needs.'),
 ('What makes duPont REGISTRY Insurance different from standard insurance providers?', 'We focus exclusively on high-net-worth coverage. Our policies offer Agreed Value Coverage to ensure full payouts without depreciation, Worldwide Protection for your assets wherever life takes you, Concierge Claims Service for a seamless white-glove experience, and Customizable Coverage designed for rare, collectible, and one-of-a-kind assets. Every policy is built around your specific lifestyle and portfolio.'),
 ('What is Agreed Value coverage and why does it matter?', 'Agreed Value coverage means your asset’s value is established upfront when the policy is written. In the event of a total loss, you receive that full agreed-upon amount — no depreciation, no negotiation. This is especially important for classic cars, fine art, and collectibles where standard policies often fall short.'),
 ('How does the claims process work?', 'Our claims advocacy team manages every detail on your behalf. From the moment you report an incident, a personal claims specialist coordinates inspections, documentation, and resolution. Our goal is a fast, hassle-free experience that reflects the level of service you’d expect from duPont REGISTRY.'),
 ('Can I bundle multiple asset types under one program?', 'Yes. Many of our clients insure a combination of vehicles, properties, watercraft, and collections through us. Bundling simplifies your coverage, and our team ensures every asset is properly valued and protected.'),
 ('How do I get a quote for my luxury assets?', 'Getting a quote is simple, complimentary, and comes with no obligation. Click the Request a Complimentary Review button on this page and provide your email. Our team will connect you with a high-net-worth insurance specialist who will tailor a coverage recommendation to your needs.'),
 ('Do expensive cars require an appraisal to confirm their value?', 'Typically, appraisals are not required. We will contact you during the underwriting process if we need further documentation supporting a vehicle’s value, but this is uncommon.'),
 ('Can I insure other types of high-end vehicles under my car insurance?', 'We provide coverage for various luxury vehicle types, including vintage motorcycles, military vehicles, sports vehicles, and more.'),
 ('Is luxury car insurance more expensive than regular auto insurance?', 'Not necessarily. In many cases, luxury car insurance is more affordable than standard auto insurance. This is because luxury car owners typically drive their collectible vehicles less frequently, reducing the likelihood of accidents.'),
 ('What if I’m not sure what option is best for me?', 'That’s what we’re here for. Contact our concierge team to narrow down your options and find the right insurance plan for you.'),
 ('How Much Does Exotic Car Insurance Cost?', 'Exotic car insurance typically costs between $5,000 and $20,000+ per year. High-end hypercars like a Bugatti can cost over $50,000 annually to insure, while standard luxury cars usually range from $5,500 to $6,600+ per year.')]


def insurance(m, ARR):
    I = 'assets/img/insurance/'
    Q = 'insurance-quote.html'
    cover = ''.join('''<li class="cover__c" data-more>
          <figure class="cover__ph photo-open" style="--d:%d"><img src="%scover-%d.webp" width="870" height="808" alt="%s" loading="lazy" decoding="async"></figure>
          <div class="cover__b">
            <h3 class="cover__t">%s</h3>
            <div class="cover__s">
              <button class="cover__more" type="button" aria-expanded="false">Read More <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M8 13.33l.94-.94L5.22 8.67zM8 2.67v8.11L4.28 7.06l-.94.94L8 12.66 12.66 8l-.94-.94-3.05 3.05V2.67z" fill="currentColor"/></svg></button>
              <div class="cover__x"><p class="cover__p">%s</p><a class="cover__a" href="%s" aria-label="Get a quote: %s">Get a Quote %s</a></div>
            </div>
          </div>
        </li>
        ''' % (i, I, i + 1, alt, t, p, Q, t, ARR) for i, (t, p, alt) in enumerate(COVER))
    li = ''.join('''<li class="why__i%s" data-why-i>
            <h3 class="why__t">%s</h3>
            <p class="why__p">%s</p>
            <figure class="why__m"><img src="%swhy-%d.webp" width="1342" height="1116" alt="%s" loading="lazy" decoding="async"></figure>
          </li>
          ''' % (' is-on' if i == 0 else '', t, p, I, i + 1, alt) for i, (t, p, alt) in enumerate(WHY))
    ph = ''.join('<img class="why__ph%s" src="%swhy-%d.webp" width="1342" height="1116" alt="" %sdecoding="async" data-why-ph>' % (' is-on' if i == 0 else '', I, i + 1, 'loading="lazy" ') for i in range(3))
    faq = faq_items([(q, '<p>%s</p>' % a) for q, a in INS_FAQ])
    return '''  <main id="main" class="page">
  <section class="page-hero page-hero--c" id="top" aria-labelledby="in-h">
    <div class="page-hero__in" data-in>
      <picture><source media="(max-width: 759px)" srcset="%shero-phone-780.webp"><img src="%shero-1400.webp" srcset="%shero-1400.webp 1400w, %shero-2088.webp 2088w" sizes="100vw" width="2088" height="1050" alt="A white Porsche 911 GT3 RS on a ramp" fetchpriority="high" decoding="async"></picture>
      <div class="page-hero__t">
        <p class="page-hero__k">Bespoke Coverage for High-Value Vehicles.</p>
        <h1 class="page-hero__h" id="in-h">%s</h1>
        <p class="page-hero__p">Protect your automotive investment with the industry leader. We provide specialized luxury car insurance and exotic vehicle coverage designed for the unique needs of collectors and high-net-worth owners.</p>
        <a class="button button--photo" href="%s">Get a Quote</a>
      </div>
    </div>
  </section>

  <section class="intro" aria-labelledby="wd-h" data-in>
    <div class="wrap intro__g">
      <h2 class="intro__k" id="wd-h">Why Choose duPont REGISTRY Insurance?</h2>
      <p class="intro__p">Since 1985, we have defined the luxury automotive lifestyle. Our A+ rated high-value auto insurance is crafted by specialists with decades of experience in the collector car market. We ensure your vehicle receives the expert care it deserves through policies that respect its true market value.</p>
    </div>
  </section>

  <section class="cover" aria-labelledby="cv-h" data-in>
    <div class="wrap">
      <h2 class="heading" id="cv-h">%s</h2>
      <ul class="cover__g">
        %s</ul>
    </div>
  </section>

  <section class="why" aria-labelledby="wy-h" data-why data-in>
    <div class="why__pin">
      <div class="wrap why__g">
        <div class="why__l">
          <h2 class="heading" id="wy-h">%s</h2>
          <ol class="why__ol">
          %s</ol>
        </div>
        <div class="why__r" aria-hidden="true">%s</div>
      </div>
    </div>
  </section>

  <section class="vband" aria-labelledby="rq-h" data-in>
    <video src="assets/video/insurance-loop.mp4" poster="%sband-poster.webp" autoplay muted loop playsinline preload="metadata" disablepictureinpicture aria-hidden="true" data-inview></video>
    <div class="vband__t">
      <h2 class="heading" id="rq-h">%s %s</h2>
      <p class="lead">Your collection is a masterpiece that deserves more than standard coverage. Contact our concierge team today for a bespoke exotic car insurance quote that recognizes the true value of your investment.</p>
      <a class="button button--photo" href="%s">Get a Quote</a>
    </div>
  </section>

  <section class="faq faq--top" id="faq" aria-labelledby="fq-h" data-in>
    <div class="wrap">
      <div class="page-head"><h2 class="heading" id="fq-h">%s</h2><p class="lead">Whether you’re seeking expert guidance, we provide valuable insights to help you make informed decisions.</p></div>
      <div class="faq__l">
%s      </div>
    </div>
  </section>

  <section class="band band--c" aria-labelledby="rc-h" data-in>
    <div class="band__in">
      <picture><source media="(max-width: 759px)" srcset="%squote-phone-786.webp"><img src="%squote-1400.webp" srcset="%squote-1400.webp 1400w, %squote-2088.webp 2088w" sizes="100vw" width="2088" height="1050" alt="A man on the phone in the back of a car" loading="lazy" decoding="async"></picture>
      <div class="page-hero__t">
        <h2 class="band__h" id="rc-h">%s %s</h2>
        <p class="page-hero__p">Stop relying on standard auto insurance. Secure a bespoke policy built specifically to protect your high-value collection.</p>
        <a class="button button--photo" href="%s">Get Your Quote Now</a>
      </div>
    </div>
  </section>
''' % (I, I, I, I, m('Exotic &amp; Luxury Car Insurance'), Q, m('What We Cover'), cover, m('Why Choose Us?'), li, ph, I,
       m('Request Your Exclusive'), m('Custom Insurance Quote', 1), Q, m('FAQ'), faq, I, I, I, I, m('Request Your'), m('Complimentary Quote', 1), Q)


def insurance_quote(m, ARR):
    f = field
    return '''  <main id="main" class="page">
  <section class="quote" id="top" aria-labelledby="iq-h">
    <div class="quote__card" data-quote="insurance-quote" data-quote-done-text="The next steps, Your Vehicle and Background &amp; Goals, come from the quote provider.">
      <ol class="quote__steps" aria-label="Steps"><li aria-current="step">1. Get Started</li><li>2. Your Vehicle</li><li>3. Background &amp; Goals</li></ol>
      <h1 class="quote__h" id="iq-h">Let’s Get Started</h1>
      <div class="quote__start" data-quote-start><button class="button button--w" type="button">Get started</button></div>
      <div data-quote-body hidden>
      <p class="quote__s">Tell us about yourself.</p>
      <form class="quote__f" id="iq-f" novalidate>
        %s%s
        <div class="quote__w">%s</div>
        %s%s
        <div class="quote__go"><button class="button" type="submit">Next %s</button></div>
      </form>
      <button class="quote__over" type="button" data-quote-over>Start Over</button>
      </div>
      <div class="sell-form__done" data-quote-done tabindex="-1" hidden></div>
    </div>
  </section>
''' % (f('First Name', 'first', extra='autocomplete="given-name"'), f('Last Name', 'last', extra='autocomplete="family-name"'), f('Primary home address', 'address', extra='autocomplete="street-address"'),
       f('Email', 'email', 'email', 'autocomplete="email"'), f('Phone number', 'phone', 'tel', 'autocomplete="tel" pattern="[0-9+() .-]{10,20}"'), ARR)


# ------------------------------------------------------------------ finance
FIN_FAQ = [('What is duPont REGISTRY Finance?', 'duPont REGISTRY is the leading marketplace in luxury and exotic cars for over 40 years. Through our expansive network of lending partners — including our preferred lending partner, LLP Exotic Auto Finance — we offer tailored financing and leasing solutions for virtually every buyer and every situation. Whether you’re financing, leasing, or exploring equity-based options, we’ll match you with the right program.'),
 ('Who can apply?', 'Our solutions are available to individuals, businesses, and foreign nationals. Whether you’re a first-time luxury buyer, a seasoned collector, or leasing through your company, our expansive offering means there’s a solution for everyone.'),
 ('What types of vehicles qualify?', 'We cover high-end, luxury, and exotic vehicles — Porsche, Ferrari, Lamborghini, McLaren, Aston Martin, Bugatti, Rolls-Royce, Bentley, Mercedes-Benz, BMW, and more. Eligible price ranges vary by lender and program, so contact us to discuss your specific vehicle'),
 ('How much car can I afford?', 'That depends on your income, credit score, and liabilities. Your debt-to-income ratio is a key factor. Use our payment estimator at dupontregistry.com/finance for a starting point, and don’t forget insurance, warranty, and maintenance costs.'),
 ('What is the typical down payment?', 'Down payments vary by program and lender, but generally range from 10–35% of the vehicle price plus taxes, dealer fees, and registration. Some of our equity-based programs require higher down payments but offer approval rates over 95% with minimal income documentation'),
 ('What is the average monthly payment?', 'A rough estimate is 1–1.5% of the vehicle’s value per month. A $200,000 car with 20% down comes to roughly $3,000/month. Use our payment estimator for a more precise number.'),
 ('How do I apply?', 'Visit dupontregistry.com/finance or call <a href="tel:+12018224870" data-external-ok>(201) 822-4870</a>. Our team will walk you through the application process and match you with the best program for your situation. Pre-approval is available so you can shop with confidence anywhere in the country.'),
 ('What terms and rates are offered?', 'Terms and rates vary by lender and program. Depending on the structure, terms can range from 13 months up to 96 months, and rates are competitive based on your credit profile, financial history, and the vehicle. Our team will help you find the best fit — contact us for a personalized quote.'),
 ('Can I finance a vehicle at auction?', 'Yes. We offer solutions tailored to auction purchases so you can bid fully approved and with confidence.'),
 ('Is my personal information secure?', 'Absolutely. We employ robust security measures to keep your data safe and confidential throughout the process.'),
 ('How quickly can I get approved?', 'In many cases, decisions come within minutes. Required documentation varies by program, but typically includes a valid driver’s license, a completed application, and supporting financial documents.'),
 ('Can I lease through my business?', 'Yes — we offer both personal and business leases through select programs. In many states, leasing also offers tax advantages such as paying sales tax only on payments rather than the full purchase price. We recommend consulting your tax advisor for details.'),
 ('Where can I purchase my vehicle?', 'Anywhere in the continental U.S. We work with dealerships, private sellers, and auction houses, and have a network of hundreds of preferred dealers who know our process. Private seller purchases may require additional steps for title transfer.'),
 ('What are my options with a vehicle I already own?', 'If you have an existing lease or loan with us, you can trade in at any time — get a payoff, sell the car, and keep the difference, or use the equity in your vehicle towards the purchase of your next car. If you own your vehicle outright or have a loan elsewhere, you could potentially access your vehicle’s equity through our sale-leaseback program or refinance your existing loan. A sale-leaseback allows you to access capital against your vehicle’s value while continuing to drive it.'),
 ('Where can I find more information?', 'Visit dupontregistry.com/finance or call <a href="tel:+12018224870" data-external-ok>(201) 822-4870</a>. We’re here to help every step of the way.')]
FIN_WHY = [('price', 'Maximum target price', 'Search for pre-qualified cars based on the payment structures that work for you'),
           ('credit', 'Structure Your Deal Anywhere', 'Take the voucher to a dealer to complete the credit application and finalize the purchase or secure pre-qualification to power your next purchase at auction'),
           ('deal', 'No Credit Impact', 'Get pre-qualified instantly without any impact to your credit score')]
FIN_SERV = [('Signature Lease Program', 'Leases designed around your needs, offering customized terms, competitive payments and greater flexibility for exotic and high-line vehicle ownership with no maximum amount.', 'Learn More', 'lease', 'An orange Lamborghini Revuelto'),
            ('dR Collector Finance', 'Whether you’re expanding your collection or need access to liquidity for your business, dR Collector Finance offers flexible lines of credit to tap into the value of your collection for whatever need you have.', 'Learn More', 'collectors', 'A silver Porsche 959'),
            ('Current Account Holders', 'Whether you have a lease or financed your car at the dealership, our team is ready to answer questions about your account.', 'Customers', 'customers', 'A yellow Porsche 911 GT3 RS')]
FIN_STRIP = ['Refinancing Solutions', 'Multi-Vehicle Collections', 'High-Value Transactions', 'Personal or business loans/leases', 'Does not report to credit bureaus', 'Extended warranty and insurance']
FIN_MAKES = ['Lamborghini', 'Aston Martin', 'Porsche', 'Maserati', 'BMW', 'Audi', 'Rolls-Royce', 'McLaren', 'Land Rover', 'Mercedes-Benz', 'Bugatti', 'Jaguar', 'Bentley', 'Lotus']
IN_STOCK = ['Porsche', 'Ferrari', 'McLaren', 'Aston Martin', 'Dodge']


EXT = ' target="_blank" rel="noopener" data-external-ok'
FIN_EST = [('Maximum Target Price', '$--', 'The highest estimated vehicle price that fits your buy ability profile.'), ('Loan Term', '--', 'The estimated financing length used in this calculation.'),
           ('Buy Ability', '$--', 'Your estimated target price based on income, credit tier, APR, and down payment.'), ('Down Payment $', '$--', 'The estimated amount due up front based on the selected financing tier.'),
           ('Mo. Payment', '$--', 'The estimated monthly payment limit used to calculate your buy ability.'), ('APR', '--%', 'The estimated annual percentage rate tied to the selected credit tier and loan term.')]
FIN_POP = [('636880', '2022 Mercedes-Benz AMG SL 55 for sale', 87187, '1,502', '10,424', '(615) 471-0221', 'mercedes-benz/amg--sl--55/2022/W1KVK8AB8NF007383'),
           ('624690', '2021 Ferrari F8 Spider for sale', 597911, '10,303', '4,663', '(805) 706-0009', 'ferrari/f8--spider/2021/ZFF93LMA3M0262962'),
           ('636450', '2025 Lamborghini Urus SE for sale', 280487, '4,833', '7,823', '(615) 471-0221', 'lamborghini/urus--se/2025/ZPBUD6ZL0SLA37095'),
           ('645389', '2016 Porsche 911 GT3 RS for sale', 230479, '3,972', '16,875', '(615) 471-0221', 'porsche/911--gt3--rs/2016/WP0AF2A91GS192099'),
           ('651549', '2019 Porsche 911 Speedster for sale', 609991, '10,512', '179', '(805) 706-0009', 'porsche/911--speedster/2019/WP0CF2A95KS172259'),
           ('649142', '2021 Jeep Grand Cherokee Trackhawk for sale', 109899, '1,894', '10,447', '(615) 471-0221', 'jeep/grand--cherokee--trackhawk/2021/1C4RJFN98MC842748')]


def tip(text, label):
    return '<button class="tip" type="button" aria-label="%s: %s"><svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><circle cx="8" cy="8" r="6.6" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M7.4 7h1.2v4.4H7.4zM7.4 4.6h1.2v1.3H7.4z" fill="currentColor"/></svg><span class="tip__t" aria-hidden="true">%s</span></button>' % (label, text, text)


def pop_card(cid, title, price, est, miles, tel, path):
    url = 'https://www.dupontregistry.com/car/%s/%s' % (path, cid)
    down = '{:,}'.format(int(price * .15 + .5))
    return '''<li class="car-card pop"><a class="car-card__a" href="%s"%s><span class="car-card__ph"><img src="assets/img/finance/pop-%s.webp" width="480" height="320" alt="%s" loading="lazy" decoding="async" draggable="false"></span><span class="car-card__t">%s</span><span class="car-card__p">$%s</span></a>
      <p class="pop__m"><span>est. $%s/mo %s</span><span>%s miles</span></p>
      <a class="car-card__go" href="%s"%s>Check Availability</a>
      <a class="pop__tel t-num" href="tel:+1%s" data-external-ok>+1 %s</a>
      <button class="car-card__save" type="button" data-save="%s" aria-pressed="false" aria-label="Save the %s"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z" fill="var(--heart, none)" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg></button></li>
    ''' % (url, EXT, cid, title.replace(' for sale', ''), title, '{:,}'.format(price), est, tip('Est. 8.99%% APR for 180 months with $%s down' % down, 'Estimate'), miles, url, EXT, ''.join(x for x in tel if x.isdigit()), tel, cid, title.replace(' for sale', ''))


def finance(m, ARR, ctl):
    I = 'assets/img/finance/'
    strip = ''.join('<li>%s</li>' % x for x in FIN_STRIP)
    why = ''.join('<li class="fwhy__i"><span class="fwhy__ic" aria-hidden="true"><img src="%sicon-%s.svg" alt="" loading="lazy" decoding="async"></span><div><h3 class="fwhy__t">%s</h3><p class="fwhy__p">%s</p></div></li>' % (I, k, t, x) for k, t, x in FIN_WHY)
    est = ''.join('<div><dt>%s</dt><dd>%s%s</dd></div>' % (t, n, tip(x, t)) for t, n, x in FIN_EST)
    serv = ''.join('''<li class="fserv__c">
          <picture><source media="(max-width: 1279px)" srcset="%sservice-%d-phone-800.webp"><img src="%sservice-%d-1400.webp" srcset="%sservice-%d-1400.webp 1400w, %sservice-%d-2740.webp 2740w" sizes="100vw" width="2740" height="756" alt="%s" loading="lazy" decoding="async"></picture>
          <div class="fserv__x"><h3 class="fserv__t">%s</h3><p class="fserv__p">%s</p><a class="button button--photo" href="https://www.dupontregistry.com/finance/%s" target="_blank" rel="noopener" data-external-ok>%s</a></div>
        </li>
        ''' % (I, n + 1, I, n + 1, I, n + 1, I, n + 1, alt, t, x, slug, cta) for n, (t, x, cta, slug, alt) in enumerate(FIN_SERV))
    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    def hours(v): return ''.join('<div><dt>%s</dt><dd class="t-num">%s</dd></div>' % x for x in zip(days, v))
    credit = hours(['09:00 AM – 08:00 PM'] * 5 + ['10:00 AM – 05:00 PM', 'Closed']); cust = hours(['09:30 AM – 06:00 PM'] * 5 + ['Closed', 'Closed'])
    by = {n: (f, a) for n, f, a in MAKES}
    makes = ''.join('<li><a class="makes__a" href="inventory.html%s">%s<span class="vh">%s cars</span></a></li>' % ('?make=' + n.replace(' ', '%20') if n in IN_STOCK else '', logo(n, *by[n]), n) for n in FIN_MAKES)
    faq = faq_items([(q, '<p>%s</p>' % a) for q, a in FIN_FAQ])
    f = field
    def chk(name, text): return '<label class="chk"><input type="checkbox" name="%s" required><span>%s</span></label>' % (name, text)
    dlg = '''<dialog class="dlg" id="prequal" aria-labelledby="pq-h" data-prequal data-lenis-prevent>
    <div class="dlg__in">
      <div class="dlg__top"><h2 class="dlg__h" id="pq-h">Let’s Get Started</h2><button class="dlg__x" type="button" data-dlg-close aria-label="Close"><svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="M5 5l14 14M19 5L5 19" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></button></div>
      <form class="dlg__f" id="pq-f" novalidate>
        %s
        %s
        %s
        <button class="button button--w dlg__go" type="submit">Let’s Get Started</button>
      </form>
      <div class="sell-form__done" data-prequal-done tabindex="-1" hidden></div>
    </div>
  </dialog>
''' % (f('Annual Income', 'income', extra='inputmode="numeric" pattern="[$0-9,. ]{2,14}"') + f('Credit Score', 'score', opts=['740+', '720–739', '700–719', '680–699'])
          + f('First Name', 'first', extra='autocomplete="given-name"') + f('Last Name', 'last', extra='autocomplete="family-name"')
          + f('Email Address', 'email', 'email', 'autocomplete="email"') + f('Phone Number', 'phone', 'tel', 'autocomplete="tel" pattern="[0-9+() .-]{10,20}"')
          + '<div class="dlg__w">%s</div>' % f('Address', 'address', extra='autocomplete="street-address"')
          + f('City', 'city', extra='autocomplete="address-level2"') + '<div class="dlg__2">%s%s</div>' % (f('ZIP Code', 'zip', extra='inputmode="numeric" maxlength="5" pattern="[0-9]{5}" autocomplete="postal-code"'), f('State', 'state', opts=STATES)),
          chk('fcra', 'You understand and agree that you are providing instructions to duPont REGISTRY Finance under the Fair Credit Reporting Act (“FCRA”) to access information from your personal credit profile or other information from one or more consumer reporting agencies such as Equifax, Experian, or TransUnion. You authorize duPont REGISTRY Finance to obtain such information solely to conduct a pre-qualification for credit. By checking the box and proceeding, we will initiate a “soft pull” of your credit and this will not affect your credit score.'),
          '<a class="dlg__pn" href="https://www.dupontregistry.com/privacy"' + EXT + '>Privacy Notice</a>' + chk('privacy', 'I have read and agree to the terms of the <a href="https://www.dupontregistry.com/privacy" target="_blank" rel="noopener" data-external-ok>Privacy Notice</a>. By providing my contact information, I consent that duPont REGISTRY can contact me about offers and product information.'))
    return '''  <main id="main" class="page">
  <nav class="subnav" aria-label="Finance"><ul><li><a href="finance.html" aria-current="page">Home</a></li><li><button type="button" data-prequal-open>My Carffordability™</button></li>%s</ul></nav>
  <section class="page-hero page-hero--w" id="top" aria-labelledby="fi-h">
    <div class="page-hero__in" data-in>
      <picture><source media="(max-width: 1359px)" srcset="%shero-phone-780.webp"><img src="%shero-1440.webp" srcset="%shero-1440.webp 1440w, %shero-2784.webp 2784w" sizes="100vw" width="2784" height="1046" alt="A lilac Lamborghini Aventador SVJ on black" fetchpriority="high" decoding="async"></picture>
      <div class="page-hero__t">
        <h1 class="page-hero__h" id="fi-h">%s %s</h1>
        <ul class="page-hero__l"><li>No Credit Hit to pre-qualify</li><li>No $ Limit</li><li>Flexible terms</li></ul>
        <p class="page-hero__p">Exotic Car <span class="hl">FINANCING</span> &amp; Luxury Supercar <span class="hl">LOANS</span> for Porsche, Lamborghini, McLaren &amp; More — Pre-Qualify Today With No Credit Impact or Obligation</p>
        <button class="button button--photo" type="button" data-prequal-open>Get Pre-Qualified</button>
      </div>
    </div>
  </section>

  <section class="statement" aria-labelledby="ex-h" data-in>
    <h2 class="kicker" id="ex-h">%s</h2>
    <p class="statement__p">Premium leasing and financing solutions tailored to exotic, luxury, and collector vehicles, backed by trusted expertise and concierge-style service.</p>
    <ul class="strip">%s</ul>
  </section>

  <section class="fcars" aria-labelledby="fc-h" data-rail data-in>
    <div class="wrap"><div class="fcars__h"><h2 class="heading" id="fc-h">%s</h2><div class="rail__bar"><a class="button button--line" href="inventory.html">Show All %s</a>%s</div></div></div>
    <ul class="rail" aria-label="Most popular cars">%s</ul>
  </section>

  <section class="fwhy" id="estimate" aria-labelledby="fw-h" data-in>
    <div class="wrap">
      <h2 class="heading" id="fw-h">%s</h2>
      <div class="fwhy__card">
        <img class="fwhy__bg" src="%swhy-2400.webp" width="2400" height="654" alt="" loading="lazy" decoding="async">
        <ul class="fwhy__l">%s</ul>
        <div class="fwhy__e">
          <h3 class="fwhy__et">Estimate my Payment and see cars within my Carffordability™</h3>
          <dl class="fwhy__dl">%s</dl>
          <button class="button button--photo" type="button" data-prequal-open>Let’s get started</button>
        </div>
      </div>
    </div>
  </section>

  <section class="fserv" aria-labelledby="fs-h" data-in>
    <div class="wrap">
      <h2 class="heading" id="fs-h">%s</h2>
      <ul class="fserv__l">
        %s</ul>
    </div>
  </section>

  <section class="fhours" aria-label="Pre-qualification and business hours" data-in>
    <div class="wrap fhours__g">
      <div class="fhours__ph">
        <img src="%sprequalified-1584.webp" width="1584" height="1160" alt="The rear wheel of a purple McLaren P1" loading="lazy" decoding="async">
        <p>Get pre-qualified for flexible financing with personalized terms designed specifically for high-value, exotic, luxury, and collector vehicles—without impacting your credit.</p>
        <button class="button button--photo" type="button" data-prequal-open>Get Pre-Qualified</button>
      </div>
      <div class="fhours__c">
        <div class="fhours__top"><h2 class="fhours__t" id="fh-h">Business Hours ET</h2>
          <div class="seg" role="tablist" aria-labelledby="fh-h"><button type="button" role="tab" id="fh-t1" aria-controls="fh-1" aria-selected="true" tabindex="0">Credit</button><button type="button" role="tab" id="fh-t2" aria-controls="fh-2" aria-selected="false" tabindex="-1">Customers</button></div></div>
        <dl class="fhours__dl" id="fh-1" role="tabpanel" aria-labelledby="fh-t1">%s</dl>
        <dl class="fhours__dl" id="fh-2" role="tabpanel" aria-labelledby="fh-t2" hidden>%s</dl>
        <div class="fhours__q"><p><strong>Have Questions?</strong> We’re here to help. Contact our team for personalized assistance.</p><a class="button t-num" href="tel:+12018224870" data-external-ok>201-822-4870</a></div>
      </div>
    </div>
  </section>

  <section class="makes" aria-labelledby="mk-h" data-rail data-in>
    <div class="wrap"><div class="fcars__h"><h2 class="heading" id="mk-h">%s</h2><div class="rail__bar"><a class="button button--line" href="inventory.html">Show All %s</a>%s</div></div></div>
    <ul class="rail makes__rail" aria-label="Makes">%s</ul>
  </section>

  <section class="faq faq--top" id="faq" aria-labelledby="fq-h" data-in>
    <div class="wrap">
      <div class="page-head"><h2 class="heading" id="fq-h">%s</h2><p class="lead">Whether you’re new to finance or seeking expert guidance, we provide valuable insights to help you make informed decisions.</p></div>
      <div class="faq__l">
%s      </div>
      <p class="legal">NMLS ID #: 2403781 · <a href="https://nmlsconsumeraccess.org/Home.aspx/MainSearch" target="_blank" rel="noopener" data-external-ok>NMLS Consumer Access</a><br>Luxury Lease Partners, LLC<br>Loans made or arranged pursuant to a California Finance Law License #60DBO-195822</p>
    </div>
  </section>
%s''' % (''.join('<li><a href="https://www.dupontregistry.com/finance/%s"' % x.lower() + EXT + '>%s</a></li>' % x for x in ('Customers', 'Lease', 'Collectors', 'Dealers')), I, I, I, I, m('Exotic Car Leasing &amp;'), m('Luxury Supercar Loans', 1), m('Experience Beyond the Ordinary'), strip, m('Most Popular Cars'), ARR, ctl('car'), ''.join(pop_card(*x) for x in FIN_POP),
       m('Why Finance Through duPont REGISTRY?'), I, why, est, m('Our Services'), serv, I, credit, cust, m('Experts in Premium Brands'), ARR, ctl('make'), makes, m('FAQ'), faq, dlg)


# ------------------------------------------------------------------ protect, ship: one layout, two sets of content
def service(m, ARR, c):
    I = 'assets/img/%s/' % c['key']; Q = c['quote']
    cards = ''.join('''<li class="cover__c" data-more>
          <figure class="cover__ph photo-open" style="--d:%d"><img src="%scard-%d.webp" width="830" height="769" alt="%s" loading="lazy" decoding="async"></figure>
          <div class="cover__b">
            <h3 class="cover__t">%s</h3>
            <div class="cover__s">
              <button class="cover__more" type="button" aria-expanded="false">Read More <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M8 13.33l.94-.94L5.22 8.67zM8 2.67v8.11L4.28 7.06l-.94.94L8 12.66 12.66 8l-.94-.94-3.05 3.05V2.67z" fill="currentColor"/></svg></button>
              <div class="cover__x"><p class="cover__p">%s</p><a class="cover__a" href="%s" aria-label="Get a quote: %s">Get a Quote %s</a></div>
            </div>
          </div>
        </li>
        ''' % (i, I, i + 1, alt, t, x, Q, t, ARR) for i, (t, x, alt) in enumerate(c['cards']))
    li = ''.join('''<li class="why__i%s" data-why-i>
            <h3 class="why__t">%s</h3>
            <p class="why__p">%s</p>
            <figure class="why__m"><img src="%swhy-%d.webp" width="1310" height="1084" alt="%s" loading="lazy" decoding="async"></figure>
          </li>
          ''' % (' is-on' if i == 0 else '', t, x, I, i + 1, alt) for i, (t, x, alt) in enumerate(c['why']))
    ph = ''.join('<img class="why__ph%s" src="%swhy-%d.webp" width="1310" height="1084" alt="" loading="lazy" decoding="async" data-why-ph>' % (' is-on' if i == 0 else '', I, i + 1) for i in range(3))
    lines = lambda t: ' '.join(m(x, i) for i, x in enumerate(t))
    def photo(n, w, alt, extra): return '<picture><source media="(max-width: 759px)" srcset="%s%s-phone-%s.webp"><img src="%s%s-1400.webp" srcset="%s%s-1400.webp 1400w, %s%s-2040.webp 2040w" sizes="100vw" width="2040" height="1004" alt="%s" %s decoding="async"></picture>' % (I, n, w, I, n, I, n, I, n, alt, extra)
    return '''  <main id="main" class="page">
  <section class="page-hero page-hero--c" id="top" aria-labelledby="sv-h">
    <div class="page-hero__in" data-in>
      %s
      <div class="page-hero__t">
        <h1 class="page-hero__h" id="sv-h">%s</h1>
        <p class="page-hero__p">%s</p>
        <a class="button button--photo" href="%s">Get a Quote</a>
      </div>
    </div>
  </section>

  <div class="badges">%s</div>

  <section class="intro intro--b" aria-labelledby="wd-h" data-in>
    <div class="wrap intro__g">
      <h2 class="intro__k" id="wd-h">%s</h2>
      <p class="intro__p">%s</p>
    </div>
  </section>

  <section class="cover" aria-labelledby="cv-h" data-in>
    <div class="wrap">
      <h2 class="heading" id="cv-h">%s</h2>
      <ul class="cover__g">
        %s</ul>
    </div>
  </section>

  <section class="why" aria-labelledby="wy-h" data-why data-in>
    <div class="why__pin">
      <div class="wrap why__g">
        <div class="why__l">
          <h2 class="heading" id="wy-h">%s</h2>
          <ol class="why__ol">
          %s</ol>
        </div>
        <div class="why__r" aria-hidden="true">%s</div>
      </div>
    </div>
  </section>

  %s

  <section class="faq faq--top" id="faq" aria-labelledby="fq-h" data-in>
    <div class="wrap">
      <div class="page-head"><h2 class="heading" id="fq-h">%s</h2><p class="lead">Whether you’re seeking expert guidance, we provide valuable insights to help you make informed decisions.</p></div>
      <div class="faq__l">
%s      </div>
    </div>
  </section>

  <section class="band band--c band--d" aria-labelledby="rc-h" data-in>
    <div class="band__in">
      %s
      <div class="page-hero__t">
        <h2 class="band__h" id="rc-h">%s</h2>
        <a class="button button--photo" href="%s">Get a Quote</a>
      </div>
    </div>
  </section>
''' % (photo('hero', '780', c['hero_alt'], 'fetchpriority="high"'), lines(c['h1']), c['lead'], Q, c['badges'], c['intro_k'], c['intro'], m(c['cards_h']), cards, m(c['why_h']), li, ph,
       c['band'](m, photo, Q), m('FAQ'), faq_items([(q, '<p>%s</p>' % a) for q, a in c['faq']]), photo('last', '786', c['last_alt'], 'loading="lazy"'), lines(c['last']), Q)


def protect_band(m, photo, Q):
    return '''<section class="vband" aria-labelledby="rq-h" data-in>
    <video src="assets/video/protect-loop.mp4" poster="assets/img/protect/band-poster.webp" autoplay muted loop playsinline preload="metadata" disablepictureinpicture aria-hidden="true" data-inview></video>
    <div class="vband__t">
      <h2 class="heading" id="rq-h">%s %s</h2>
      <a class="button button--photo" href="%s">Get a Quote</a>
    </div>
  </section>''' % (m('Get Your Custom'), m('Protection Quote', 1), Q)


def ship_band(m, photo, Q):
    return '''<section class="band band--c" aria-labelledby="rq-h" data-in>
    <div class="band__in">
      %s
      <div class="page-hero__t">
        <h2 class="band__h" id="rq-h">%s %s</h2>
        <a class="button button--photo" href="%s">Get a Quote</a>
      </div>
    </div>
  </section>''' % (photo('band', '786', 'A grey Ferrari coming down a trailer ramp', 'loading="lazy"'), m('Get Your Personalized'), m('Quote Today', 1), Q)


PROTECT = dict(key='protect', quote='protect-quote.html', hero_alt='A silver Porsche 911 GT3 RS by a workshop door', last_alt='A white Porsche 911 Speedster in a dark showroom',
    h1=['Exotic Car Warranty &amp;', 'Luxury Vehicle Protection'],
    lead='Exotic and highline vehicles demand more than a standard extended warranty. duPont Registry Protect offers Vehicle Service Plans built to cover the parts and systems that factory warranties miss.',
    badges='<img src="assets/img/protect/priority-one.svg" width="201" height="72" alt="PriorityOne Unlimited EV+" loading="lazy" decoding="async"><img src="assets/img/protect/a-plus.svg" width="134" height="105" alt="A+ Unlimited EV+" loading="lazy" decoding="async">',
    intro_k='Protection Built for Exotics',
    intro='High-end cars carry extreme repair costs, a single engine or transmission failure on a Ferrari, Lamborghini, or Porsche can run into the tens of thousands. Standard extended warranties and factory coverage often exclude the specialized components these vehicles require. duPont Registry Protect fills that gap with a vehicle service Plans built specifically for exotic, highline, and luxury car ownership.',
    cards_h='Coverage to Fit Your Lifestyle',
    cards=[('Our Best Coverage With More Than 750 Parts Covered', 'PriorityOne Unlimited offers exclusionary coverage with unlimited mileage and eligibility for vehicles up to 10 years and 150,000 miles.', 'A Ferrari engine bay from above'),
           ('Mid Level Coverage More Than 260 Parts Covered', 'Alpha Warranty’s A+ Unlimited delivers enhanced mid-level protection with exceptional benefits for vehicles up to 10 years or 175,000 miles.', 'The red and black cabin of a Porsche 911 GT2 RS'),
           ('Wheel and Tire Coverage Including Carbon Fiber', 'duPont A La Car offers essential level coverage with unlimited mileage and eligibility for vehicles up to 10 years and 175,000 miles.', 'The front wheel of a red Ferrari Enzo')],
    why_h='Features &amp; Benefits',
    why=[('Unlimited Mileage Term Length', 'Enjoy coverage that remains active for the entire term of your plan, with no mileage limits—ideal for vehicles driven as often or as little as you choose.', 'A McLaren with its door raised'),
         ('Roadside Assistance', 'Provides reliable support for unexpected roadside events, helping get you back on the road quickly and safely.', 'The steering wheel of a Lamborghini Urus'),
         ('Coverage for Electric Vehicles', 'Designed specifically for electric vehicles, with coverage that addresses advanced systems and evolving EV technology.', 'A red and black seat back')],
    band=protect_band,
    faq=[(q, 'duPont Registry Protect is a premium vehicle protection program designed specifically for luxury, exotic, and high-value vehicles. It offers tailored coverage options that help protect against the high cost of unexpected repairs.') for q in ('What is duPont Registry Protect?', 'Which vehicles are covered?', 'What does the coverage include?', 'Are there mileage limits on the plans?', 'Can I choose my own repair facility?', 'How do I get a quote or enroll?')],
    last=['Request Your', 'Complimentary Quote'])

SHIP = dict(key='ship', quote='ship-quote.html', hero_alt='A white Porsche 911 Speedster on the ramp of an enclosed trailer', last_alt='A black Lamborghini Centenario leaving a trailer',
    h1=['duPont REGISTRY Logistics', 'Excellence. Delivered.'],
    lead='Elevate Your Auto Transport Experience Reliable. Secure. White-Glove Service.',
    badges='<p class="badges__f"><img src="assets/img/ship/fmcsa.webp" width="172" height="180" alt="FMCSA" loading="lazy" decoding="async"><span class="t-num">MC: 01732284<br>DOT: 4409989</span></p>',
    intro_k='Why Trust duPont REGISTRY Logistics',
    intro='At duPont REGISTRY Logistics, we understand that your vehicle is more than just transportation, it’s an investment, a passion, and a statement. Whether you’re relocating, purchasing a luxury car, attending an auto show, or shipping a vehicle to a collector, our premium auto transport service ensures a seamless and stress-free experience.',
    cards_h='How It Works',
    cards=[('Get a Personalized Quote', 'Provide your vehicle and route details, choose open or enclosed transport, and receive a transparent, competitive quote.', 'A red Porsche 911 on the road'),
           ('Book with Confidence', 'Finalize your quote and schedule transport effortlessly.', 'A man on the phone with a laptop in the back of a car'),
           ('Secure Pickup &amp; White-Glove Delivery', 'Our professional carriers ensure timely pickup and safe delivery to your home, showroom, or auction, handling every detail with precision and care.', 'Two people shaking hands by a silver car')],
    why_h='Luxury Vehicle Transport, Perfected',
    why=[('Luxury Transport Experts', 'With decades in the high-end automotive industry, we specialize in handling exotic, collector, and luxury vehicles with the care they deserve.', 'A car carrier loaded with four cars'),
         ('Trusted Network', 'We partner only with vetted, top-tier carriers to ensure your vehicle is in the best hands from pickup to delivery.', 'Two men shaking hands in front of a house'),
         ('Comprehensive Services', 'Choose from enclosed transport for added protection, expedited shipping for time-sensitive needs, and door-to-door delivery for the ultimate convenience.', 'A grey Aston Martin on the ramp of an enclosed trailer')],
    band=ship_band,
    faq=[('What are my responsibilities during vehicle inspections?', 'You or your delegate must inspect the vehicle with the driver at both pick-up and delivery. Document any damages and the odometer reading on the Bill of Lading and retain a signed copy for your records.'),
         ('What contact information should I provide?', 'Provide valid phone numbers and email addresses for the person available during loading and delivery. They must be an adult with a valid driver’s license.'),
         ('Will my vehicle be picked up and delivered to my door?', 'We aim for door-to-door service, but if the truck cannot reach your door, we may ask to meet in a nearby parking lot for safety. Notify us if that’s not possible.'),
         ('What documents and items must I provide at pickup and delivery?', 'You or your representative must be present to sign the condition report and provide one complete set of keys, including any for locked compartments. Remove personal accessories from the keys.'),
         ('How should I prepare my vehicle’s gas level?', 'Ensure your gas level is between 1/8 to 1/4 tank before transport.'),
         ('How do I prepare my vehicle for transport?', 'Check antifreeze, battery, fluids, and tire pressure. Ensure the emergency brake works. Remove spare tire covers, grill covers, bedliners, and other car cover'),
         ('Are there any minimum vehicle requirements?', 'The vehicle must be free of personal items, operable, and free of leaks. The driver’s door, window, and emergency brake must work. Provide any special starting instructions.'),
         ('How do I protect my vehicle from loss or damage?', 'Lower/remove the antenna, fold mirrors, remove interior valuables, and ensure the vehicle is clean. For convertibles, lock the top securely. You may remove license plates.'),
         ('Are there safety considerations I should know?', 'Inform us of any modifications. Vehicles must be under 7 feet tall with at least 4 inches of ground clearance. Remove detachable aftermarket accessories and truck bed shells not permanently affixed.')],
    last=['Trust duPont REGISTRY Logistics', 'for Your Auto Transport Needs'])


def protect_quote(m, ARR):
    f = field
    return '''  <main id="main" class="page">
  <section class="quote" id="top" aria-labelledby="iq-h">
    <div class="quote__card" data-quote="protect-quote" data-quote-done-text="Thank you. The team would be in touch with your quote.">
      <p class="quote__brand">duPont REGISTRY Protect</p>
      <h1 class="quote__h quote__h--s" id="iq-h">Protect Your Car with duPont REGISTRY</h1>
      <form class="quote__f" id="iq-f" novalidate>
        %s%s
        <div class="quote__w">%s</div><div class="quote__w">%s</div><div class="quote__w">%s</div>
        <div class="quote__go"><button class="button" type="submit">Submit</button></div>
      </form>
      <div class="sell-form__done" data-quote-done tabindex="-1" hidden></div>
    </div>
  </section>
''' % (f('First Name', 'first', extra='autocomplete="given-name"'), f('Last Name', 'last', extra='autocomplete="family-name"'), f('Email', 'email', 'email', 'autocomplete="email"'),
       f('Phone Number', 'phone', 'tel', 'autocomplete="tel" pattern="[0-9+() .-]{10,20}"'), f('Vin Number', 'vin', extra='minlength="11" maxlength="17" pattern="[A-HJ-NPR-Za-hj-npr-z0-9]{11,17}" autocapitalize="characters" autocomplete="off"'))


def ship_quote(m, ARR):
    f = field
    steps = ''.join('<li%s><span>%s</span></li>' % (' aria-current="step"' if i == 0 else '', t) for i, t in enumerate(('Route Info', 'Options', 'Book', 'Delivery', 'Review')))
    return '''  <main id="main" class="page">
  <section class="quote quote--cars" id="top" aria-labelledby="iq-h">
    <picture class="quote__bg" aria-hidden="true"><source media="(max-width: 1151px)" srcset="data:image/gif;base64,R0lGODlhAQABAAAAACw="><img src="assets/img/ship/form-2400.webp" width="2400" height="1068" alt="" decoding="async"></picture>
    <h1 class="vh" id="iq-h">Get a quote to ship your vehicle</h1>
    <ol class="dots" aria-label="Steps">%s</ol>
    <div class="quote__card" data-quote="ship-quote" data-quote-done-text="The next steps, Options, Book, Delivery and Review, follow from the carrier rates.">
      <h2 class="quote__h quote__h--s">Please fill in the required information</h2>
      <p class="quote__n">Enter your information to start quote process</p>
      <form class="quote__f quote__f--6" id="iq-f" novalidate>
        <div class="q3">%s</div><div class="q3">%s</div><div class="q3">%s</div><div class="q3">%s</div><div class="q3">%s</div><div class="q3">%s</div>
        <fieldset class="radios"><legend>Drivable</legend><label><input type="radio" name="drivable" value="Yes" checked> Yes</label><label><input type="radio" name="drivable" value="No"> No</label></fieldset>
        <p class="quote__w quote__n quote__n--l">Please provide your contact information so that we can save your quote for future reference</p>
        <div class="q2">%s</div><div class="q2">%s</div><div class="q2">%s</div>
        <p class="quote__w quote__n quote__n--l">* This quote is not final. The sales team will provide the final quote once the request is processed.</p>
        <div class="quote__w"><button class="button quote__full" type="submit">Get My Best Rates</button></div>
      </form>
      <div class="sell-form__done" data-quote-done tabindex="-1" hidden></div>
    </div>
  </section>
''' % (steps, f('Ship From (City or ZIP)', 'from', extra='autocomplete="off"'), f('Ship To (City or ZIP)', 'to', extra='autocomplete="off"'),
       f('Make', 'make', extra='data-make', opts=[]), f('Model', 'model', extra='data-model disabled', opts=[]), f('Year', 'year', opts=range(2027, 1929, -1)), f('Type', 'type', opts=['Car', 'SUV', 'Pickup', 'Van', 'Motorcycle', 'Other']),
       f('Full Name', 'name', extra='autocomplete="name"'), f('Email Address', 'email', 'email', 'autocomplete="email"'), f('Phone Number', 'phone', 'tel', 'autocomplete="tel" pattern="[0-9+() .-]{10,20}"'))


# ------------------------------------------------------------------ paint protection
def paint(m, ARR):
    I = 'assets/img/paint/'; T = 'href="tel:+19512340622" data-external-ok'
    def photo(n, alt, extra): return '<picture><source media="(max-width: 759px)" srcset="%s%s-phone-780.webp"><img src="%s%s-1200.webp" srcset="%s%s-1200.webp 1200w, %s%s-1920.webp 1920w" sizes="100vw" width="1920" height="973" alt="%s" %s decoding="async"></picture>' % (I, n, I, n, I, n, I, n, alt, extra)
    cards = ''.join('''<li class="cover__c cover__c--s">
          <figure class="cover__ph photo-open" style="--d:%d"><img src="%scard-%d.webp" width="830" height="553" alt="%s" loading="lazy" decoding="async"></figure>
          <div class="cover__b"><h3 class="cover__t">%s</h3><p class="cover__p">%s</p></div>
        </li>
        ''' % (i, I, i + 1, alt, t, x) for i, (t, x, alt) in enumerate([
            ('Full Body Coverage', 'All painted surfaces &amp; headlights', 'A McLaren 765LT in orange'),
            ('Full Nose Coverage', 'Front bumper, hood, front fenders, side view mirrors &amp; headlights', 'The nose of a McLaren 765LT'),
            ('Individual Coverage Options', 'Rockers, rear bumper, windshield surround, and more…', 'The rocker panel of a McLaren 765LT')]))
    f = field
    return '''  <main id="main" class="page">
  <section class="page-hero page-hero--c page-hero--p" id="top" aria-labelledby="pp-h">
    <div class="page-hero__in" data-in>
      %s
      <div class="page-hero__t">
        <p class="page-hero__k">Paint Protection</p>
        <h1 class="page-hero__h" id="pp-h">%s %s</h1>
        <div class="page-hero__b"><a class="button button--photo t-num" %s>Call Us: 951-234-0622</a><a class="button button--glass" href="#quote">Quote Request</a></div>
      </div>
    </div>
  </section>

  <section class="intro" aria-labelledby="po-h" data-in>
    <div class="wrap intro__g">
      <h2 class="intro__k" id="po-h">Podium Protection Film</h2>
      <div><p class="intro__p">Correctly installing Xpel is a skill set that takes years to master. Installation techniques can make a huge difference in the end result and can mean the difference between a car that appears average and one that truly shines in its protection and aesthetics. At Podium Protection Film, we prioritize precision and expertise in every installation, guaranteeing that your vehicle receives top-notch care and achieves the flawless finish it deserves.</p>
      <a class="button button--line intro__b" href="#quote">Contact us for more information</a></div>
    </div>
  </section>

  <section class="duo" aria-labelledby="cf-h" data-in>
    <div class="wrap duo__g">
      <figure class="duo__ph photo-open"><img src="%sfilm-1310.webp" width="1310" height="992" alt="The front wing and headlight of a McLaren 765LT" loading="lazy" decoding="async"></figure>
      <div class="duo__t"><h2 class="heading" id="cf-h">%s %s</h2>
        <p class="duo__p">Clear paint protection film, also referred to as clear bra or PPF, offers an effective solution for shielding your car’s original paint from various environmental elements and damage. Its unique self-healing properties make it highly effective against common issues like rock chips, bug splatters, tar, and light scratches, thereby helping to maintain the pristine appearance of your vehicle over time.</p>
        <a class="button" href="#quote">Talk to our specialists today</a></div>
    </div>
  </section>

  <section class="duo duo--r" aria-labelledby="xp-h" data-in>
    <div class="wrap duo__g">
      <figure class="duo__ph photo-open"><img src="%sxpel-1310.webp" width="1310" height="992" alt="The fender and wheel of a McLaren 765LT" loading="lazy" decoding="async"></figure>
      <div class="duo__t"><h2 class="heading" id="xp-h">%s</h2>
        <p class="duo__p">We’ve partnered with Xpel, the global leader in PPF technology, to offer you the best protection film available. Whether you choose to protect specific areas or prefer full coverage for your vehicle, we tailor comprehensive solutions to your preferences. With premium-grade products like Xpel Ultimate Plus for a glossy finish or Xpel STEALTH for matte or satin finishes, we ensure top-notch results.</p>
        <p class="duo__p">Unlike most clear bra companies, we never cut corners. We maintain a pristine workspace to deliver installations that are as close to perfect as possible. Podium employs industry-leading equipment and factory-trained professionals for flawless finishes. Utilizing cutting-edge technology and software, we precisely cut our clear bra kits, and our installers are skilled in custom installations if needed. Our goal is to minimize seams and leave no bubbles or stretching, providing unparalleled clear bra services to the Inland Empire and the surrounding areas.</p>
        <a class="button t-num" %s>Call Us: 951-234-0622</a></div>
    </div>
  </section>

  <section class="cover cover--p" aria-labelledby="co-h" data-in>
    <div class="wrap">
      <h2 class="heading" id="co-h">%s</h2>
      <ul class="cover__g">
        %s</ul>
    </div>
  </section>

  <section class="band band--c band--t" aria-labelledby="fp-h" data-in>
    <div class="band__in">
      %s
      <div class="page-hero__t">
        <h2 class="band__h" id="fp-h">%s %s</h2>
        <p class="page-hero__p">No matter how flawless a paint job may appear, nothing can rival the worth of factory paint. Preserving your original paint is pivotal in safeguarding your investment. Taking prompt action is essential. Putting off or delaying only heightens the likelihood of your fresh factory paint gathering scratches and rock chips. Just one pebble hitting your car’s bumper at high speeds on the freeway is enough to highlight the significance of clear bra paint protection. With more rock chips added, you’ll lament not having acted sooner. For luxury vehicles, high-end sports cars, and exotics, choosing clear film paint protection is an indisputable decision.</p>
        <a class="button button--photo" href="#quote">Talk to our specialists today</a>
      </div>
    </div>
  </section>

  <section class="quote quote--p" id="quote" aria-labelledby="iq-h">
    <div class="quote__card" data-quote="paint-quote" data-quote-done-text="Thank you. The specialists would be in touch with your quote.">
      <h2 class="quote__h" id="iq-h">Quote Request</h2>
      <form class="quote__f" id="iq-f" novalidate>
        %s%s%s%s
        <div class="quote__w">%s</div><div class="quote__w">%s</div>
        <div class="quote__go"><button class="button" type="submit">Submit</button></div>
      </form>
      <div class="sell-form__done" data-quote-done tabindex="-1" hidden></div>
      <p class="quote__foot t-num">Podium Protection Film · 26900 Jefferson Ave, Murrieta, CA 92562 · <a %s>951-234-0622</a><br>Mon–Fri 9:00am–6:00pm PST · Sat 10:00am–5:00pm PST · Sun closed</p>
    </div>
  </section>
''' % (photo('hero', 'The hood of an orange McLaren 765LT', 'fetchpriority="high"'), m('Preserve Your Investment With'), m('the Leaders in Paint Protection', 1), T,
       I, m('Clear Paint'), m('Protection Film', 1), I, m('Partnered With Xpel'), T, m('Coverage Options'), cards, photo('band', 'The hood vent of an orange McLaren 765LT', 'loading="lazy"'), m('Nothing Can Rival'), m('Factory Paint', 1),
       f('Name', 'name', extra='autocomplete="name"'), f('Phone', 'phone', 'tel', 'autocomplete="tel" pattern="[0-9+() .-]{10,20}"'), f('Your Email', 'email', 'email', 'autocomplete="email"'), f('Year, Make, Model', 'car', extra='autocomplete="off"'),
       f('Select Service', 'service', opts=['Full-Front PPF', 'Full-Car PPF', 'Custom Coverage PPF']),
       '<label class="field field--ta"><textarea name="message" rows="4" placeholder=" "></textarea><span class="field__l">Your Message</span></label>', T)


# ------------------------------------------------------------------ about
def about(m, ARR):
    I = 'assets/img/about/'
    X = lambda href, t: '<a href="%s"%s>%s</a>' % (href, EXT, t)
    brand = lambda n, slug: X('https://www.dupontregistry.com/used-%s-for-sale' % slug, n)
    lead = 'Since 1985, duPont REGISTRY has been the premier exotic and luxury car marketplace, connecting discerning collectors with the world’s most sought-after automobiles. What began as a high-end lifestyle magazine has evolved into a complete digital ecosystem, where you can buy, sell, auction, finance, insure, and ship a car safely all in one place.'
    slides = ''.join('<img class="slides__i%s" src="%shero-%d.webp" width="931" height="930" alt="%s" %sdecoding="async" data-slide>' % (' is-on' if i == 1 else '', I, i, alt, 'fetchpriority="high" ' if i == 1 else 'loading="lazy" ') for i, alt in ((1, 'A red Bugatti Chiron'), (2, 'A white Lamborghini Huracan'), (3, 'A red Ferrari F8')))
    serv = [('Buy', 'inventory.html', 'Browse and purchase from a curated selection of investment-grade exotic, luxury, and classic cars from trusted private sellers and world-class dealers.'),
            ('Sell', 'sell.html', 'List your car in front of a global audience of serious, high-net-worth buyers, with the reach and reputation of duPont REGISTRY behind it.'),
            ('Consign', 'sell.html', 'Hand the whole sale to our team. We photograph, list, market, and negotiate on your behalf, with full white glove service from start to finish.'),
            ('Auction', 'https://live.dupontregistry.com/', 'Enter your car into duPont REGISTRY Live, our online auction platform, and reach active bidders in real time with a guaranteed reserve.'),
            ('Finance', 'finance.html', 'Fund your purchase through tailored financing built for exotic and collector cars, in partnership with LLP Exotic Auto Finance.'),
            ('Lease', 'finance.html', 'Choose a refined path to ownership with flexible leasing designed for high-value vehicles.'),
            ('Insure', 'insurance.html', 'Protect your car with specialist insurance made for exotic and collector vehicles, arranged through the same platform.'),
            ('Transport', 'ship.html', 'Ship your car anywhere with enclosed, fully insured, white glove transport, handled door to door.'),
            ('Garage', 'https://garage.dupontregistry.com/', 'Manage your entire collection in one app, track each car’s value with the duPont REGISTRY Index, and connect with a community of collectors, free to use and always evolving.')]
    li = ''.join('<li><a href="%s"%s>%s</a>: %s</li>' % (h, EXT if h.startswith('http') else '', n, t) for n, h, t in serv)
    group = [('duPont REGISTRY', 'https://www.dupontregistry.com'), ('Elferspot', 'https://www.elferspot.com'), ('LLP Exotic Auto Finance', 'https://llp.finance'), ('Cars on 5th', 'https://www.carsonfifth.com'),
             ('Canossa Events', 'https://canossa.com'), ('Cavallino', 'https://www.cavallino.com'), ('Supercar Owners Circle', 'https://www.supercarownerscircle.com'), ('Petrolicious', 'https://petrolicious.com'),
             ('Retromobile USA', 'https://www.retromobile.us'), ('FerrariChat', 'https://www.ferrarichat.com')]
    gl = ', '.join(X(h, n) for n, h in group) + ', and ' + X('https://sothebysmotorsport.com', 'Sotheby’s Motorsport')
    def blk(id, h, img, w, hgt, alt, body, rev=False):
        return '''  <section class="ab%s" aria-labelledby="%s" data-in>
    <div class="wrap"><div class="ab__c">
      <div class="ab__t"><h2 class="heading" id="%s">%s</h2>%s</div>
      <figure class="ab__ph photo-open"><img src="%s%s.webp" width="%s" height="%s" alt="%s" loading="lazy" decoding="async"></figure>
    </div></div>
  </section>
''' % (' ab--r' if rev else '', id, id, h, body, I, img, w, hgt, alt)
    p = lambda t: '<p class="ab__p">%s</p>' % t
    return '''  <main id="main" class="page">
  <section class="page-hero page-hero--c page-hero--a" id="top" aria-labelledby="ab-h">
    <div class="page-hero__in slides" data-in data-slides>
      %s
      <div class="page-hero__t">
        <h1 class="page-hero__h" id="ab-h">%s</h1>
        <p class="page-hero__p">%s</p>
        <a class="button button--photo" href="#heritage">Learn More</a>
      </div>
      <div class="slides__d" role="group" aria-label="Photographs">%s</div>
    </div>
  </section>

%s%s%s%s%s''' % (slides, m('Driving Luxury Since 1985'), lead,
       ''.join('<button class="slides__b" type="button" aria-label="Photograph %d of 3"%s data-dot></button>' % (i, ' aria-current="true"' if i == 1 else '') for i in (1, 2, 3)),
       blk('heritage', m('Our Heritage:') + ' ' + m('The Authority in', 1) + ' ' + m('Exotic Cars', 2), 'heritage', 1200, 382, 'A silver Porsche 911 GT2 RS in a dark studio',
           p('We have defined the luxury automotive lifestyle for over four decades. Our platform is not just a listing service, it is a global destination for investment-grade exotic, supercars, hypercars, luxury SUVs, and classic collectibles. We provide a trusted bridge between elite private sellers, world-class dealerships, and an audience of high-net-worth enthusiasts.')).replace('class="ab"', 'class="ab" id="heritage"', 1),
       blk('ab-net', m('A Global Network of') + ' ' + m('Buyers and Sellers', 1), 'network', 931, 930, 'A red McLaren 720S Spider',
           p('Having connected millions of buyers and sellers across the globe, duPont REGISTRY has earned its reputation as the go-to destination for those seeking results in the world of fine automobiles. Whether you are looking for exotic cars for sale, classic cars for sale, or luxury vehicles, our trusted platform is where passionate enthusiasts, serious collectors, and car dealerships turn when it matters most.'), True),
       blk('ab-why', m('Why the World’s Top') + ' ' + m('Collectors Choose Us?', 1), 'collectors', 1200, 465, 'A white Rolls-Royce Ghost',
           p('duPont REGISTRY remains the gold standard for verified luxury listings. We curate an inventory that represents the pinnacle of engineering and design, featuring iconic brands such as:')
           + '<ul class="ab__l"><li>%s, %s, and %s</li><li>%s, %s, and %s</li><li>%s, %s, and %s</li><li>%s, %s, %s</li></ul>' % (
               brand('Ferrari', 'ferrari'), brand('Lamborghini', 'lamborghini'), brand('McLaren', 'mclaren'), brand('Porsche', 'porsche'), brand('Rolls-Royce', 'rolls_royce'), brand('Bentley', 'bentley'),
               brand('Bugatti', 'bugatti'), brand('Koenigsegg', 'Koenigsegg'), brand('Pagani', 'pagani'), brand('Maserati', 'maserati'), brand('Aston Martin', 'aston__martin'), brand('Mercedes', 'mercedes_benz'))),
       blk('ab-mkt', m('The Marketplace') + ' ' + m('Experience', 1), 'marketplace', 931, 930, 'A silver Mercedes-Benz G-Class',
           p('duPont REGISTRY is more than a place to browse listings. We manage the entire journey of owning a luxury car, from the first search to delivery and beyond. Every service below is built into the same platform.')
           + '<ul class="ab__l ab__l--s">%s</ul><h3 class="ab__h3">More Than a Transaction</h3>' % li
           + p('Beyond the sale, duPont REGISTRY is the heartbeat of automotive culture. We provide deep market insights, luxury lifestyle trends, and a community for those who view automobiles not just as transportation, but as investable assets and works of art.'), True),
       blk('ab-grp', m('Part of the duPont') + ' ' + m('REGISTRY Group Ecosystem', 1), 'group', 452, 279, 'A yellow Ferrari 458 Speciale Aperta',
           p('At the core of %s, we leverage advanced technology and proprietary data to strengthen our leadership position. We constantly innovate and evolve, cementing our status as the most influential, sophisticated, and forward-thinking ultra-luxury and exotic automotive marketplace.' % X('https://dupontregistrygroup.com/', 'duPont REGISTRY Group'))
           + p('<strong>duPont REGISTRY Group</strong> facilitates billions of dollars in transactions and redefines how enthusiasts and collectors engage within the luxury automotive world. Its portfolio includes %s.' % gl)))


# ------------------------------------------------------------------ contact
GROUP_LOGOS = [('Cavallino', 'cavallino-white.svg', 'cavallino-black.svg', 'https://www.cavallino.com'), ('Petrolicious', 'logotype_petrolicious_white.webp', 'logotype_petrolicious_black.webp', 'https://petrolicious.com'),
               ('Retromobile', 'retromobile-white.svg', 'retromobile-black.svg', 'https://www.retromobile.us'), ('Supercar Owners Circle', 'soc-white.svg', 'soc-black.svg', 'https://www.supercarownerscircle.com'),
               ('duPont REGISTRY', 'dupont_registry_logo_centralized_negative.webp', 'dupont_registry_logo_centralized_black.webp', 'https://www.dupontregistry.com'), ('Canossa', 'canossa-white.svg', 'canossa-black.svg', 'https://canossa.com'),
               ('Elferspot', 'elferspot_logo_filled_black_outline_negative.webp', 'elferspot_logo_filled_black_outline.webp', 'https://www.elferspot.com')]


def contact(m, ARR):
    I = 'assets/img/contact/'
    f = field
    def chk(name, text): return '<label class="chk"><input type="checkbox" name="%s"><span>%s</span></label>' % (name, text)
    one = ''.join('<li><a href="%s"%s><img class="logo-d" src="%s%s" alt="%s" loading="lazy" decoding="async"><img class="logo-l" src="%s%s" alt="" loading="lazy" decoding="async"></a></li>' % (h, EXT, I, d, n, I, l) for n, d, l, h in GROUP_LOGOS)
    two = one.replace('alt="', 'aria-hidden="true" alt="', 0)
    return '''  <main id="main" class="page">
  <section class="ct" id="top" aria-labelledby="ct-h">
    <div class="wrap ct__g">
      <div class="ct__l" data-in>
        <figure class="ct__ph photo-open"><img src="%scontact-car.webp" width="1440" height="490" alt="A white Lamborghini Diablo SV" fetchpriority="high" decoding="async"></figure>
        <h1 class="ct__h" id="ct-h">%s</h1>
        <p class="ct__p">Looking to elevate your brand with <strong>duPont REGISTRY</strong>? Whether you’re interested in <strong>digital, print, native content, event sponsorships, or custom marketing solutions,</strong> our team is here to help craft the perfect advertising strategy for your business. Fill out the form and our team will be in contact with you shortly.</p>
        <p class="ct__m">Phone: <a href="tel:+17275739339" data-external-ok class="t-num">+1 (727) 573-9339</a><br>Address: 5972 NE 4th Avenue Miami, FL 33137 USA</p>
      </div>
      <div class="ct__card" data-quote="contact" data-quote-done-text="Thank you. Our team will be in contact with you shortly.">
        <h2 class="ct__ch">Connect With the Premier Luxury Marketplace</h2>
        <form class="quote__f" id="ct-f" novalidate>
          %s%s%s%s
          <div class="quote__w">%s</div>
          <div class="quote__w"><label class="field field--ta"><textarea name="message" rows="3" placeholder=" " required></textarea><span class="field__l">What can we help you with today?</span></label></div>
          <fieldset class="quote__w ct__sms"><legend>Would you like to receive SMS notifications from duPont Registry?</legend>
          %s%s</fieldset>
          <p class="quote__w ct__fine">By providing your mobile number and checking the above box(es), you agree to receive related text messages from duPont Registry at the phone number you provided when signing up. Reply STOP to unsubscribe, Reply HELP for help. Message frequency varies. Message &amp; data rates may apply.</p>
          <p class="quote__w ct__fine">Consent is not a condition of purchase. For more information, please review our <a href="https://www.dupontregistry.com/privacy"%s>Privacy Policy</a> and <a href="https://www.dupontregistry.com/terms"%s>Terms of Service</a>.</p>
          <div class="quote__go quote__go--l"><button class="button" type="submit">Submit</button></div>
        </form>
        <div class="sell-form__done" data-quote-done tabindex="-1" hidden></div>
      </div>
    </div>
  </section>

  <section class="logos" aria-label="duPont REGISTRY Group brands">
    <div class="logos__m" data-marquee><ul class="logos__l">%s</ul><ul class="logos__l" aria-hidden="true">%s</ul></div>
  </section>
''' % (I, m('Get In Touch'), f('First Name', 'first', extra='autocomplete="given-name"'), f('Last Name', 'last', extra='autocomplete="family-name"'), f('Email', 'email', 'email', 'autocomplete="email"'),
       '<label class="field"><input name="phone" type="tel" placeholder=" " value="+1 " autocomplete="tel"><span class="field__l">Phone Number</span></label>',
       f('Inquiry Type', 'inquiry', opts=['Buy', 'Sell', 'Auction', 'Dealer Inquiry', 'Advertising', 'Magazine Subscription', 'Support', 'Other']),
       chk('sms_marketing', 'Yes, I agree to receive marketing/promotional SMS messages from duPont Registry, including special offers, exclusive incentives, event invitations, and dealership news.'),
       chk('sms_info', 'Yes, I agree to receive informational/transactional SMS messages from duPont Registry, such as appointment reminders, service updates, vehicle status notifications, and important account-related information.'),
       EXT, EXT, one, one.replace(EXT, EXT + ' tabindex="-1"'))
