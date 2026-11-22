/* Premium-layer checks — Pearl & Vale Chatbot Add-On (separate from tests.js, unamended).
   Run: node premium-checks.js — vendored-file hashes vs Install-Record, per-page TOTAL
   gzip JS vs P8, hero-demo isolation (data-demo-* only, widget surface untouched),
   stat figures == figures the site already states (from the logic data object). */
const fs = require('fs'), path = require('path'), zlib = require('zlib'), crypto = require('crypto');
const ROOT = __dirname;
let pass = 0, fail = 0; const lines = [];
function t(name, ok, extra) { lines.push((ok ? 'PASS' : 'FAIL') + ' | ' + name + (extra ? ' | ' + extra : '')); ok ? pass++ : fail++; }
const SHA = {
  'assets/vendor/gsap.min.js': '3d1bea374ab1b703cc5c4105358eec63c4465efdc573931dc116e34a0a190c1b',
  'assets/vendor/ScrollTrigger.min.js': 'b5bb360661f478f0ff6ffa11500d8ce5e2b6aaf6f7288237cdca3aac9548035a',
  'assets/vendor/lenis.min.js': '80f53e77f1c13e379fc246d2b5e299188e20bcb2b2fe7ebb13e8e8c7563a6da7',
  'assets/vendor/lenis.css': '2f668ae84a668327f246faf8a770383a2bf69196d214290fbc4d5548910606c5'
};
Object.entries(SHA).forEach(([f, want]) => {
  const p = path.join(ROOT, f);
  const got = fs.existsSync(p) ? crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex') : 'MISSING';
  t('vendored ' + f + ' sha256 == Install-Record', got === want);
});
const css = fs.readFileSync(path.join(ROOT, 'css/style.css'), 'utf8');
t('P1 base rule intact: a{color:var(--accent-dark);text-decoration:none}', /a\{color:var\(--accent-dark\);text-decoration:none\}/.test(css));
const idx = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
t('hero demo present with LIVE panel + static transcript fallback', idx.includes('data-demo-panel') && idx.includes('data-demo-static-note') && idx.includes('PKR 18,000'));
t('exactly ONE corner-widget surface (data-chat-panel appears once)', (idx.match(/data-chat-panel/g) || []).length === 1);
const hero = fs.readFileSync(path.join(ROOT, 'js/hero-demo.js'), 'utf8');
t('hero-demo isolation: no data-chat- selectors used in code', !/data-chat-/.test(hero.replace(/\/\*[\s\S]*?\*\//g, '')));
t('hero demo writes the SAME lead log (pv_leads) + hand-off log (pv_handoffs)', hero.includes('pv_leads') && hero.includes('pv_handoffs'));
const L = require(path.join(ROOT, 'js/logic.js'));
t('stat honesty: 13 intents / 6 services in the data object == printed stats', L.INTENTS.length === 13 && L.BIZ.services.length === 6 && idx.includes('data-stat-num="13"') && idx.includes('data-stat-num="6"'));
t('static transcript hours answer == logic-generated answer', L.answerFor('What are your opening hours?').text.split('\n').every(line => idx.replace(/&amp;/g, '&').includes(line.trim()) || line.trim() === ''));
function pageGzipJS(page) {
  const html = fs.readFileSync(path.join(ROOT, page), 'utf8');
  const srcs = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(m => m[1]).filter(s => !/^https?:/.test(s));
  let total = 0; const parts = [];
  srcs.forEach(s => { const b = zlib.gzipSync(fs.readFileSync(path.join(ROOT, s))).length; total += b; parts.push(s.split('/').pop() + ' ' + b); });
  const inline = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].reduce((a, m) => a + zlib.gzipSync(Buffer.from(m[1])).length, 0);
  return { total: total + inline, parts: parts.join(' + ') + (inline ? ' + inline ' + inline : '') };
}
const pi = pageGzipJS('index.html');
t('P8 index (hero page) total gzip JS <= 90 KB', pi.total <= 90 * 1024, pi.total + ' B = ' + pi.parts);
const pl = pageGzipJS('leads.html');
t('P8 leads (plain page) total gzip JS <= 20 KB, no vendor files', pl.total <= 20 * 1024 && !/vendor/.test(fs.readFileSync(path.join(ROOT, 'leads.html'), 'utf8')), pl.total + ' B = ' + pl.parts);
console.log(lines.join('\n')); console.log('---'); console.log('TOTAL: ' + pass + ' PASS / ' + fail + ' FAIL');
process.exit(fail ? 1 : 0);
