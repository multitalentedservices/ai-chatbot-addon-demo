/* Pearl & Vale Dental Studio — AI Chatbot Add-On Demo (Portfolio Queue #12)
   ONE pure-logic module shared by the site (js/app.js) and the Node test battery (tests.js).
   The bot is a RULE-BASED FAQ demo. Every answer is GENERATED from the BIZ data object below,
   so an answer can never drift from the facts stated on the page itself.
   No network calls exist anywhere in this build: lead capture is a LOCAL STUB (localStorage). */
(function (global) {
  'use strict';

  var DEMO_LABEL = 'Demo: rule-based FAQ bot — a production add-on connects to an AI model + the business\u2019s own data';
  var DEMO_CLOCK = 'Sunday 22 November 2026 \u00b7 11:00 AM PKT (fixed demo clock)';

  /* ---------- THE business-data object: the single source of truth ---------- */
  var BIZ = {
    name: 'Pearl & Vale Dental Studio',
    shortName: 'Pearl & Vale',
    tagline: 'Gentle, honest dentistry in Gulberg',
    city: 'Gulberg, Lahore',
    address: '14-B Main Boulevard, Gulberg III, Lahore',
    phoneDisplay: '042 3577 0142',
    phoneTel: '+924235770142',
    whatsappDisplay: '0321 555 0142',
    whatsappUrl: 'https://wa.me/923215550142',
    email: 'care@pearlandvale.example',
    parking: 'Free patient parking behind the studio, off Service Lane 4 \u2014 tell the guard you are visiting Pearl & Vale.',
    offer: 'This month: a free consultation is included with every Cleaning & Polishing appointment (demo offer).',
    cancellation: 'You can cancel or reschedule free of charge up to 4 hours before your appointment \u2014 just call or message us.',
    payments: ['Cash', 'Debit and credit cards', 'JazzCash', 'EasyPaisa'],
    hours: [
      { day: 'Monday', open: '9:00 AM', close: '8:00 PM' },
      { day: 'Tuesday', open: '9:00 AM', close: '8:00 PM' },
      { day: 'Wednesday', open: '9:00 AM', close: '8:00 PM' },
      { day: 'Thursday', open: '9:00 AM', close: '8:00 PM' },
      { day: 'Friday', open: '9:00 AM', close: '8:00 PM' },
      { day: 'Saturday', open: '10:00 AM', close: '6:00 PM' },
      { day: 'Sunday', open: null, close: null }
    ],
    services: [
      { name: 'Consultation & Check-up', price: 1500, mins: 30 },
      { name: 'Cleaning & Polishing', price: 4500, mins: 45 },
      { name: 'Teeth Whitening', price: 18000, mins: 60 },
      { name: 'Root Canal Treatment', price: 25000, mins: 90 },
      { name: 'Braces Consultation', price: 3000, mins: 30 },
      { name: 'Dental Implant (single)', price: 85000, mins: 120 }
    ]
  };

  function pkr(n) { return 'PKR ' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function hoursLine(h) { return h.open ? h.day + ': ' + h.open + ' \u2013 ' + h.close : h.day + ': Closed'; }
  function todayHours() { return BIZ.hours[6]; } /* demo clock is a Sunday */
  function serviceByName(q) {
    var s = null;
    BIZ.services.forEach(function (sv) {
      var key = sv.name.toLowerCase();
      if (q.indexOf('whitening') > -1 && key.indexOf('whitening') > -1) s = sv;
      else if (q.indexOf('root canal') > -1 && key.indexOf('root canal') > -1) s = sv;
      else if (q.indexOf('cleaning') > -1 && key.indexOf('cleaning') > -1) s = sv;
      else if (q.indexOf('implant') > -1 && key.indexOf('implant') > -1) s = sv;
      else if (q.indexOf('braces') > -1 && key.indexOf('braces') > -1) s = sv;
      else if ((q.indexOf('consultation') > -1 || q.indexOf('check-up') > -1 || q.indexOf('checkup') > -1) && key.indexOf('consultation') > -1 && !s) s = sv;
    });
    return s;
  }

  /* ---------- Answer builders: every fact interpolated from BIZ ---------- */
  var ANSWERS = {
    hours: function () {
      return 'Our opening hours at ' + BIZ.name + ' are:\n' + BIZ.hours.map(hoursLine).join('\n') +
        '\nToday (' + DEMO_CLOCK.split(' \u00b7')[0] + ') we are closed \u2014 the studio is closed on Sundays.';
    },
    location: function () {
      return 'You\u2019ll find us at ' + BIZ.address + '. ' + BIZ.parking;
    },
    prices: function (q) {
      var sv = serviceByName(q || '');
      if (sv) return sv.name + ' costs ' + pkr(sv.price) + ' and takes about ' + sv.mins + ' minutes at ' + BIZ.shortName + '. Would you like to book it, or see the full price list?';
      return 'Here are our current prices at ' + BIZ.shortName + ':\n' + BIZ.services.map(function (s) { return s.name + ' \u2014 ' + pkr(s.price); }).join('\n') + '\nAsk me about any single treatment for its duration.';
    },
    services: function () {
      return 'We offer ' + BIZ.services.length + ' treatments at ' + BIZ.shortName + ': ' + BIZ.services.map(function (s) { return s.name; }).join(', ') + '. Ask me for prices, or tap \u201cBook an appointment\u201d.';
    },
    booking: function () {
      return 'You can book in three ways: tap \u201cRequest a callback\u201d below and we\u2019ll phone you back, call us on ' + BIZ.phoneDisplay + ', or message us on WhatsApp at ' + BIZ.whatsappDisplay + '. Appointments run ' + BIZ.hours[0].open + ' \u2013 ' + BIZ.hours[0].close + ' Monday to Friday.';
    },
    parking: function () { return BIZ.parking; },
    contact: function () {
      return 'You can reach ' + BIZ.name + ' on ' + BIZ.phoneDisplay + ', on WhatsApp at ' + BIZ.whatsappDisplay + ', or by email at ' + BIZ.email + '. We\u2019re at ' + BIZ.address + '.';
    },
    offers: function () { return BIZ.offer; },
    payment: function () {
      return 'We accept ' + BIZ.payments.slice(0, -1).join(', ') + ' and ' + BIZ.payments[BIZ.payments.length - 1] + '. Payment is taken at the studio after your treatment \u2014 we never ask for card details in chat.';
    },
    cancellation: function () { return BIZ.cancellation; },
    human: function () {
      return 'Of course \u2014 a person can help with anything I can\u2019t. Tap the WhatsApp button below to message the ' + BIZ.shortName + ' team directly (' + BIZ.whatsappDisplay + '), or tap \u201cRequest a callback\u201d and we\u2019ll phone you.';
    },
    greeting: function () {
      return 'Hello, and welcome to ' + BIZ.name + '. I can answer questions about our services, prices, hours and bookings \u2014 or tap one of the suggestions below.';
    },
    thanks: function () { return 'You\u2019re welcome. Anything else about ' + BIZ.shortName + ' \u2014 prices, hours, or booking?'; }
  };

  function fallbackText() {
    return 'I can only answer about ' + BIZ.shortName + '\u2019s services, hours and bookings in this demo \u2014 that question is outside my FAQ scope. Try one of the suggestions below, tap \u201cRequest a callback\u201d, or message a person on WhatsApp (' + BIZ.whatsappDisplay + ').';
  }

  /* ---------- Intent matching: keyword scoring, stated priority rule ----------
     Rule: each intent scores exact-phrase hits (3 pts) + keyword hits (weights below).
     A match needs score >= 3. Ties (and only ties) resolve by PRIORITY order — the order
     of INTENTS below, human help first, so "talk to a person about prices" reaches a human. */
  var INTENTS = [
    { id: 'human', phrases: ['talk to a person', 'speak to a human', 'real person', 'human help', 'call me', 'someone real'], keywords: [['human', 3], ['person', 2], ['agent', 3], ['someone', 2], ['staff', 2]] },
    { id: 'booking', phrases: ['book an appointment', 'make an appointment', 'book appointment', 'i want to book', 'schedule an appointment'], keywords: [['book', 3], ['appointment', 3], ['schedule', 2], ['reserve', 2], ['visit', 1]] },
    { id: 'cancellation', phrases: ['cancel my appointment', 'reschedule my appointment', 'change my appointment'], keywords: [['cancel', 3], ['reschedule', 3], ['postpone', 3]] },
    { id: 'hours', phrases: ['opening hours', 'what time do you open', 'what time do you close', 'when do you open', 'when are you open'], keywords: [['hours', 3], ['open', 2], ['close', 2], ['timing', 3], ['timings', 3], ['sunday', 2], ['saturday', 1]] },
    { id: 'prices', phrases: ['how much', 'price list', 'what does it cost', 'your prices', 'charges'], keywords: [['price', 3], ['cost', 3], ['charge', 2], ['fee', 2], ['fees', 2], ['whitening', 2], ['implant', 2], ['root canal', 2], ['cleaning', 1]] },
    { id: 'services', phrases: ['what services', 'what treatments', 'what do you offer', 'list of services', 'treatments do you'], keywords: [['service', 3], ['services', 3], ['treatment', 3], ['treatments', 3], ['offer', 1]] },
    { id: 'location', phrases: ['where are you', 'your location', 'your address', 'how do i get there', 'directions'], keywords: [['where', 2], ['location', 3], ['address', 3], ['directions', 3], ['reach you', 2]] },
    { id: 'parking', phrases: ['is there parking', 'car parking', 'where can i park'], keywords: [['parking', 3], ['park', 3]] },
    { id: 'contact', phrases: ['contact number', 'phone number', 'your number', 'email address', 'how can i contact'], keywords: [['contact', 3], ['phone', 2], ['number', 2], ['email', 2], ['whatsapp', 2]] },
    { id: 'offers', phrases: ['any offers', 'any deals', 'any discounts', 'special offer'], keywords: [['offer', 3], ['offers', 3], ['deal', 3], ['discount', 3], ['promotion', 3]] },
    { id: 'payment', phrases: ['payment methods', 'how can i pay', 'do you accept card', 'do you take card'], keywords: [['pay', 2], ['payment', 3], ['card', 2], ['jazzcash', 3], ['easypaisa', 3], ['cash', 2]] },
    { id: 'greeting', phrases: ['hello', 'hi there', 'good morning', 'good afternoon', 'assalam'], keywords: [['hello', 3], ['hi', 2], ['hey', 2], ['salam', 3]] },
    { id: 'thanks', phrases: ['thank you', 'thanks a lot'], keywords: [['thank', 3], ['thanks', 3], ['shukria', 3]] }
  ];

  function normalize(text) {
    return ' ' + String(text || '').toLowerCase().replace(/[^a-z0-9\u00e0-\u024f ]+/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
  }

  function matchIntent(text) {
    var raw = String(text || '').trim();
    if (!raw) return { intent: null, score: 0, reason: 'empty' };
    var q = normalize(raw);
    var best = null;
    INTENTS.forEach(function (it, idx) {
      var score = 0;
      it.phrases.forEach(function (p) { if (q.indexOf(' ' + p + ' ') > -1 || q.trim() === p) score += 3; });
      it.keywords.forEach(function (kw) { if (q.indexOf(' ' + kw[0] + ' ') > -1 || q.indexOf(' ' + kw[0]) === 0) score += kw[1]; });
      if (score >= 3 && (!best || score > best.score)) best = { intent: it.id, score: score, priority: idx };
    });
    if (!best) return { intent: null, score: 0, reason: 'off-scope' };
    return { intent: best.intent, score: best.score, reason: 'matched' };
  }

  function answerFor(text) {
    var m = matchIntent(text);
    if (!m.intent) return { intent: null, text: fallbackText(), fallback: true };
    return { intent: m.intent, text: ANSWERS[m.intent](normalize(text)), fallback: false };
  }

  var CHIPS = [
    { label: 'Opening hours', query: 'What are your opening hours?' },
    { label: 'Prices', query: 'What are your prices?' },
    { label: 'Book an appointment', query: 'I want to book an appointment' },
    { label: 'Where are you?', query: 'Where are you located?' },
    { label: 'Request a callback', action: 'callback' },
    { label: 'Talk to a person', query: 'Can I talk to a person?' }
  ];

  /* ---------- Lead capture: validation, refs, local sheet-log writers ---------- */
  function validateName(name) {
    var n = String(name || '').trim();
    if (n.length < 2) return { ok: false, error: 'Please tell me your full name (at least 2 characters) so the studio can ask for you by name.' };
    if (!/[a-zA-Z]/.test(n)) return { ok: false, error: 'Your name needs letters in it \u2014 please type your name as it appears on your ID.' };
    return { ok: true, value: n };
  }
  function validatePhonePK(input) {
    var digits = String(input || '').replace(/[\s\-()]+/g, '');
    if (/^\+923\d{9}$/.test(digits)) return { ok: true, value: digits };
    if (/^923\d{9}$/.test(digits)) return { ok: true, value: '+' + digits };
    if (/^03\d{9}$/.test(digits)) return { ok: true, value: '+92' + digits.slice(1) };
    return { ok: false, error: 'That doesn\u2019t look like a valid Pakistani mobile number \u2014 it must start with 03 and have 11 digits in total (for example 0321 555 0142). Please check it and type it again.' };
  }
  function hashCode(str) { var h = 0; for (var i = 0; i < str.length; i++) { h = ((h << 5) - h + str.charCodeAt(i)) | 0; } return Math.abs(h); }
  function makeRef(prefix, seed) { return prefix + '-DEMO-' + (1000 + (hashCode(String(seed)) % 9000)); }
  function callbackRef(name, phone) { return makeRef('CB', name.toLowerCase().trim() + '|' + phone); }
  function handoffRef(page) { return makeRef('HO', page + '|' + DEMO_CLOCK); }

  /* Pure log writers: take the parsed array, return a NEW array + the record (storage lives in app.js). */
  function addLead(leads, name, phone, sourcePage) {
    var lead = { ref: callbackRef(name, phone), name: name, phone: phone, source: sourcePage || 'chat widget', when: DEMO_CLOCK, status: 'New (demo)' };
    return { leads: (leads || []).concat([lead]), lead: lead };
  }
  function addHandoff(log, page) {
    var rec = { ref: handoffRef(page + '|' + (log ? log.length : 0)), channel: 'WhatsApp hand-off', page: page || 'index.html', when: DEMO_CLOCK };
    return { log: (log || []).concat([rec]), record: rec };
  }
  function callbackConfirmText(lead) {
    return 'Thank you, ' + lead.name.split(' ')[0] + ' \u2014 your callback request is saved with reference ' + lead.ref + '. ' + BIZ.shortName + ' will call ' + lead.phone + ' during opening hours. (Demo: this request was written to a local log in your browser only \u2014 nothing was sent anywhere.)';
  }

  var api = {
    BIZ: BIZ, DEMO_LABEL: DEMO_LABEL, DEMO_CLOCK: DEMO_CLOCK, CHIPS: CHIPS, INTENTS: INTENTS,
    pkr: pkr, hoursLine: hoursLine, todayHours: todayHours, serviceByName: serviceByName,
    matchIntent: matchIntent, answerFor: answerFor, fallbackText: fallbackText,
    validateName: validateName, validatePhonePK: validatePhonePK,
    makeRef: makeRef, callbackRef: callbackRef, handoffRef: handoffRef,
    addLead: addLead, addHandoff: addHandoff, callbackConfirmText: callbackConfirmText
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.ChatLogic = api;
})(typeof window !== 'undefined' ? window : globalThis);
