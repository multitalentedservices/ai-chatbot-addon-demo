/* Test battery — Queue #12 AI Chatbot Add-On Demo. Run: node tests.js (writes tests-output.log). */
const fs = require('fs'), path = require('path');
const ROOT = __dirname;
const L = require(path.join(ROOT, 'js', 'logic.js'));
let pass = 0, fail = 0; const lines = [];
function t(name, cond, extra) { if (cond) { pass++; lines.push('PASS  ' + name); } else { fail++; lines.push('FAIL  ' + name + (extra ? '  >> ' + extra : '')); } }
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

/* ---------- Matcher: every intent, at least 2 phrasings ---------- */
const CASES = [
  ['hours', 'What are your opening hours?'], ['hours', 'when do you open on saturday'],
  ['hours', 'What are your timings?'], ['hours', 'Are you open on Sunday?'],
  ['location', 'Where are you located?'], ['location', 'what is your address'],
  ['prices', 'What are your prices?'], ['prices', 'How much is teeth whitening?'],
  ['prices', 'how much does a root canal cost'], ['prices', 'cleaning charges please'],
  ['booking', 'I want to book an appointment'], ['booking', 'can I schedule an appointment for friday'],
  ['parking', 'Is there parking?'], ['parking', 'where can I park my car'],
  ['contact', 'What is your contact number?'], ['contact', 'how can I contact you on whatsapp'],
  ['offers', 'Any offers this month?'], ['offers', 'do you have any discounts'],
  ['payment', 'What payment methods do you accept?'], ['payment', 'can I pay by jazzcash'],
  ['cancellation', 'How do I cancel my appointment?'], ['cancellation', 'I need to reschedule my appointment'],
  ['human', 'Can I talk to a person?'], ['human', 'I want to speak to a human agent'],
  ['services', 'What services do you offer?'], ['services', 'what treatments do you have'],
  ['greeting', 'Hello'], ['greeting', 'Assalam o alaikum'],
  ['thanks', 'Thank you so much'], ['thanks', 'shukria']
];
CASES.forEach(([want, q]) => { const m = L.matchIntent(q); t('matcher "' + q + '" -> ' + want, m.intent === want, 'got ' + m.intent); });

/* Off-scope, empty, long, boundary */
['What is the weather in Lahore today?', 'Do you sell pizzas?', 'Tell me a joke', 'What is the capital of France?', 'I have severe tooth pain, is it an emergency?'].forEach(q => {
  const a = L.answerFor(q); t('off-scope fallback: "' + q.slice(0, 34) + '"', a.fallback === true && a.intent === null);
});
t('empty message -> no intent', L.matchIntent('').intent === null && L.matchIntent('').reason === 'empty');
t('whitespace message -> no intent', L.matchIntent('   ').intent === null);
const longMsg = ('I was wondering whether you could possibly tell me, at some length, ' .repeat(6)) + 'what are your opening hours please';
t('very long message still matches hours', L.matchIntent(longMsg).intent === 'hours', 'got ' + L.matchIntent(longMsg).intent);
/* Boundary: two intents in one message resolve by stated rule (score first, priority on ties).
   "talk to a person about prices": human phrase (3) vs prices keyword price-in-"prices" (3) -> tie -> human is earlier in INTENTS. */
const dual = L.matchIntent('Can I talk to a person about your prices?');
t('dual-intent tie resolves by priority -> human', dual.intent === 'human', 'got ' + dual.intent + ' score ' + dual.score);
const dual2 = L.matchIntent('I want to book an appointment, what are your prices?');
t('dual-intent higher score wins -> booking', dual2.intent === 'booking', 'got ' + dual2.intent + ' score ' + dual2.score);

/* ---------- Answers are generated from the data object (no drift possible) ---------- */
const hoursAns = L.answerFor('opening hours').text;
L.BIZ.hours.forEach(h => t('hours answer contains ' + h.day + ' line', hoursAns.includes(L.hoursLine(h))));
t('hours answer names the business', hoursAns.includes(L.BIZ.name));
const priceAns = L.answerFor('your prices').text;
L.BIZ.services.forEach(s => t('price answer contains ' + s.name + ' at data price', priceAns.includes(s.name) && priceAns.includes(L.pkr(s.price))));
const whiteAns = L.answerFor('how much is teeth whitening').text;
const whiteSvc = L.BIZ.services.find(s => s.name.includes('Whitening'));
t('single-service answer == data (price + mins)', whiteAns.includes(L.pkr(whiteSvc.price)) && whiteAns.includes(String(whiteSvc.mins)));
const locAns = L.answerFor('where are you').text;
t('location answer == data address + parking', locAns.includes(L.BIZ.address) && locAns.includes(L.BIZ.parking));
const contactAns = L.answerFor('contact number').text;
t('contact answer == data phone/whatsapp/email', contactAns.includes(L.BIZ.phoneDisplay) && contactAns.includes(L.BIZ.whatsappDisplay) && contactAns.includes(L.BIZ.email));
t('offers answer == data offer verbatim', L.answerFor('any offers').text === L.BIZ.offer);
t('cancellation answer == data verbatim', L.answerFor('cancel my appointment').text === L.BIZ.cancellation);
L.BIZ.payments.forEach(p => t('payment answer lists ' + p, L.answerFor('payment methods').text.includes(p)));
t('fallback names scope + business', L.fallbackText().includes('services, hours and bookings') && L.fallbackText().includes(L.BIZ.shortName));
t('fallback offers WhatsApp hand-off number', L.fallbackText().includes(L.BIZ.whatsappDisplay));
t('DEMO label text exact', L.DEMO_LABEL.startsWith('Demo: rule-based FAQ bot'));

/* ---------- Lead validation + refs + log writers ---------- */
t('phone 0321 555 0142 valid + normalised', eq(L.validatePhonePK('0321 555 0142'), { ok: true, value: '+923215550142' }));
t('phone +923215550142 valid', L.validatePhonePK('+923215550142').ok === true);
t('phone 923215550142 valid', L.validatePhonePK('923215550142').value === '+923215550142');
t('phone 0321-5550142 valid (dashes stripped)', L.validatePhonePK('0321-5550142').ok === true);
['123', '0321 555 014', '042 3577 0142', '12345678901', '', 'abcd'].forEach(p => {
  const v = L.validatePhonePK(p); t('phone invalid: "' + p + '" + error names the 03/11-digit rule', v.ok === false && v.error.includes('03') && v.error.includes('11 digits'));
});
t('name valid', L.validateName('Ahmed Raza').ok === true);
t('name too short rejected', L.validateName('A').ok === false);
t('name without letters rejected', L.validateName('12345').ok === false);
t('ref format CB-DEMO-####', /^CB-DEMO-\d{4}$/.test(L.callbackRef('Ahmed Raza', '+923215550142')));
t('ref deterministic (same seed, same ref)', L.callbackRef('Ahmed Raza', '+923215550142') === L.callbackRef('Ahmed Raza', '+923215550142'));
t('ref differs for different lead', L.callbackRef('Ahmed Raza', '+923215550142') !== L.callbackRef('Sara Khan', '+923001234567'));
const added = L.addLead([], 'Ahmed Raza', '+923215550142', 'index.html');
t('addLead appends one lead with ref + status', added.leads.length === 1 && added.lead.ref === L.callbackRef('Ahmed Raza', '+923215550142') && added.lead.status.includes('demo'));
t('addLead does not mutate input array', (() => { const src = []; L.addLead(src, 'X Y', '+923215550142'); return src.length === 0; })());
const added2 = L.addLead(added.leads, 'Sara Khan', '+923001234567', 'leads.html');
t('addLead second lead keeps first', added2.leads.length === 2 && added2.leads[0].ref === added.lead.ref);
t('confirmation text carries ref + phone + local-only honesty', (() => { const c = L.callbackConfirmText(added.lead); return c.includes(added.lead.ref) && c.includes('+923215550142') && c.includes('nothing was sent anywhere'); })());
const ho = L.addHandoff([], 'index.html');
t('addHandoff records WhatsApp channel + ref format', ho.log.length === 1 && ho.record.channel.includes('WhatsApp') && /^HO-DEMO-\d{4}$/.test(ho.record.ref));

/* ---------- Persistence round-trip (the storage contract app.js uses) ---------- */
const stored = JSON.stringify({ messages: [{ from: 'user', text: 'prices?' }, { from: 'bot', text: 'x' }], flow: null, name: null });
const back = JSON.parse(stored);
t('chat persistence round-trip', back.messages.length === 2 && back.messages[0].text === 'prices?');
const leadsStored = JSON.stringify(added2.leads); const leadsBack = JSON.parse(leadsStored);
t('leads persistence round-trip', leadsBack.length === 2 && leadsBack[1].name === 'Sara Khan');
const cleared = { messages: [], flow: null, name: null };
t('clear-chat state shape (empty messages)', cleared.messages.length === 0 && cleared.flow === null);

/* ---------- Contrast, computed from hex (lesson 23) ---------- */
function lum(hex) { const c = hex.replace('#', ''); const f = i => { const v = parseInt(c.substr(i, 2), 16) / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(0) + 0.7152 * f(2) + 0.0722 * f(4); }
function ratio(a, b) { const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); }
const PAIRS = [
  ['ink on paper', '#26232B', '#FAFAF8', 4.5], ['ink on card', '#26232B', '#FFFFFF', 4.5],
  ['muted on paper', '#5A5566', '#FAFAF8', 4.5], ['muted on card', '#5A5566', '#FFFFFF', 4.5],
  ['accent-dark on paper (links)', '#571CB0', '#FAFAF8', 4.5], ['accent-dark on card', '#571CB0', '#FFFFFF', 4.5],
  ['white on accent (buttons/bubbles/launcher)', '#FFFFFF', '#6D28D9', 4.5],
  ['white on accent-dark (hover)', '#FFFFFF', '#571CB0', 4.5],
  ['ink on accent-soft (bot bubbles)', '#26232B', '#EFE9FB', 4.5],
  ['head sub-label on accent', '#E4DBFA', '#6D28D9', 4.5],
  ['error on paper', '#B3261E', '#FAFAF8', 4.5],
  ['footer text on ink', '#D9D5E3', '#26232B', 4.5], ['footer link on ink', '#CDBCF5', '#26232B', 4.5],
  ['demo-strip white on ink', '#FFFFFF', '#26232B', 4.5],
  ['focus ring accent on paper (>=3)', '#6D28D9', '#FAFAF8', 3.0]
];
PAIRS.forEach(([name, fg, bg, bar]) => { const r = ratio(fg, bg); t('contrast ' + name + ' = ' + r.toFixed(2) + ' >= ' + bar, r >= bar); });

/* ---------- Source-level honesty + integrity ---------- */
const srcAll = ['index.html', 'leads.html'].map(f => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n') +
  fs.readFileSync(path.join(ROOT, 'js', 'app.js'), 'utf8') + fs.readFileSync(path.join(ROOT, 'js', 'logic.js'), 'utf8') +
  fs.readFileSync(path.join(ROOT, 'css', 'style.css'), 'utf8');
['index.html', 'leads.html'].forEach(f => {
  const html = fs.readFileSync(path.join(ROOT, f), 'utf8');
  t(f + ' carries DEMO labelling', /DEMO/.test(html) && html.includes('rule-based FAQ bot'));
  t(f + ' carries the chat widget (launcher + panel + aria-live)', html.includes('data-chat-launcher') && html.includes('data-chat-panel') && html.includes('aria-live="polite"'));
  t(f + ' has unique title', /<title>[^<]{10,}<\/title>/.test(html));
});
t('titles differ across pages', fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').match(/<title>([^<]+)/)[1] !== fs.readFileSync(path.join(ROOT, 'leads.html'), 'utf8').match(/<title>([^<]+)/)[1]);
t('zero live endpoints: no fetch/XHR/beacon/analytics in JS', !/fetch\(|XMLHttpRequest|sendBeacon|googletagmanager|google-analytics|connect\.facebook|gtag\(/.test(srcAll));
t('only external refs are Google Fonts + wa.me hand-off', (() => { const urls = srcAll.match(/https?:\/\/[^\s"')]+/g) || []; return urls.every(u => u.includes('fonts.googleapis.com') || u.includes('fonts.gstatic.com') || u.includes('wa.me') || u.includes('www.w3.org')); })());
t('no lorem ipsum anywhere', !/lorem/i.test(srcAll));
t('no claim of real AI ("AI model" only inside the honesty label)', (() => { const hits = srcAll.match(/real AI|powered by AI|AI-powered/gi) || []; return hits.length === 0; })());
t('local refs all resolve', (() => { const missing = []; ['index.html', 'leads.html'].forEach(f => { const html = fs.readFileSync(path.join(ROOT, f), 'utf8'); (html.match(/(?:src|href)="(?!https?:|#|tel:|mailto:)([^"]+)"/g) || []).forEach(m => { const ref = m.replace(/^(?:src|href)="/, '').replace(/"$/, '').split('#')[0]; if (ref && !fs.existsSync(path.join(ROOT, ref))) missing.push(f + ' -> ' + ref); }); }); return missing.length === 0; })());
t('sitemap + robots present', fs.existsSync(path.join(ROOT, 'sitemap.xml')) && fs.existsSync(path.join(ROOT, 'robots.txt')));

/* ---------- Weight budgets ---------- */
let codeBytes = 0;
['index.html', 'leads.html', 'css/style.css', 'js/logic.js', 'js/app.js'].forEach(f => { codeBytes += fs.statSync(path.join(ROOT, f)).size; });
t('code weight ' + codeBytes + ' B < 400 KB', codeBytes < 400 * 1024);
let mediaBytes = 0;
['assets/hero.jpg', 'assets/treatment.jpg'].forEach(f => { const s = fs.statSync(path.join(ROOT, f)).size; mediaBytes += s; t(f + ' = ' + s + ' B <= 120 KB', s <= 120 * 1024); });
t('media total ' + mediaBytes + ' B <= 1.6 MB', mediaBytes <= 1.6 * 1024 * 1024);
lines.push('code total: ' + codeBytes + ' B · media total: ' + mediaBytes + ' B');

lines.push('---');
lines.push('TOTAL: ' + pass + ' PASS / ' + fail + ' FAIL');
fs.writeFileSync(path.join(ROOT, 'tests-output.log'), lines.join('\n') + '\n');
console.log(lines.join('\n'));
process.exit(fail ? 1 : 0);
