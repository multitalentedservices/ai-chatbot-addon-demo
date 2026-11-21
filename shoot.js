/* Pearl & Vale + Chatbot Add-On — screenshot + audit + flow runner (adapted from Queue #11 harness).
   Standard sets capture the widget CLOSED (lesson 35: fixed launcher must not stitch over content);
   open states are proven in dedicated flow captures. Modes: default, --nojs, --probe320, --reduced, --flows, --keyboard. */
const { chromium } = require('/home/hatch/workspace/tools/screenshot-engine/node_modules/playwright');
const fs = require('fs'), path = require('path');
const ROOT = '/home/hatch/workspace/portfolio-builds/ai-chatbot-addon-demo';
const EXEC = '/home/hatch/workspace/tools/screenshot-engine/browsers/chrome-headless-shell-linux64/chrome-headless-shell';
const OUT = process.argv[2]; const NOJS = process.argv.includes('--nojs'), PROBE = process.argv.includes('--probe320'), FLOWS = process.argv.includes('--flows'), REDUCED = process.argv.includes('--reduced'), KEYBOARD = process.argv.includes('--keyboard');
const PAGES = [['index', 'index.html'], ['leads', 'leads.html']];
const VIEWPORTS = PROBE ? [['probe320', 320, 700]] : [['phone', 390, 844], ['tablet', 768, 1024], ['desktop', 1440, 900]];
async function auditPage(page) { return page.evaluate(() => { const vw = window.innerWidth; const bad = []; document.querySelectorAll('body *').forEach(el => { const r = el.getBoundingClientRect(); if (r.width > 0 && (r.right > vw + 1 || r.left < -1)) { if (el.closest('.skip') || el.closest('.chat-launcher') || el.closest('.chat-panel')) return; let clipped = false; for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) { const ox = getComputedStyle(a).overflowX; if (ox === 'hidden' || ox === 'clip' || ox === 'auto' || ox === 'scroll') { clipped = true; break; } } if (!clipped) bad.push({ el: el.tagName.toLowerCase() + '.' + String(el.className).split(' ').join('.'), right: Math.round(r.right) }); } }); const broken = []; document.querySelectorAll('img').forEach(im => { if (im.complete && im.naturalWidth === 0) broken.push(im.getAttribute('src')); }); const textBad = []; document.querySelectorAll('body *').forEach(el => { if (el.children.length || !el.textContent || !el.textContent.trim() || el.closest('.skip') || el.closest('.chat-panel')) return; if (el.scrollWidth > el.clientWidth + 1) textBad.push({ el: el.tagName.toLowerCase(), sw: el.scrollWidth, cw: el.clientWidth, text: el.textContent.trim().slice(0, 40) }); }); return { overflowX: document.documentElement.scrollWidth - vw, badEls: bad.slice(0, 12), brokenImgs: broken, textBad: textBad.slice(0, 12) }; }); }
async function settle(page) { if (NOJS) { await page.waitForTimeout(500); return; } await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 50)); } window.scrollTo(0, 0); }); await page.waitForTimeout(250); }
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: EXEC, args: ['--proxy-server=http://hatch-egress-proxy:3128', '--no-sandbox', '--force-color-profile=srgb'] });
  if (KEYBOARD) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } }); const page = await ctx.newPage(); const rows = [];
    const rec = async (label, i) => { const info = await page.evaluate(() => { const el = document.activeElement; if (!el) return null; const cs = getComputedStyle(el); return { tag: el.tagName.toLowerCase(), text: (el.textContent || el.value || el.id || '').trim().replace(/\s+/g, ' ').slice(0, 44), cls: (typeof el.className === 'string' ? el.className : '') || el.id || '', outline: cs.outlineWidth + ' ' + cs.outlineStyle + ' ' + cs.outlineColor }; }); rows.push(`| ${label} | ${i} | ${info ? info.tag + ' — ' + info.text : '?'} | ${info.cls} | ${info.outline} |`); };
    await page.goto('file://' + path.join(ROOT, 'index.html'), { waitUntil: 'load' }); await page.waitForTimeout(500);
    /* Walk the page tab order until the launcher is focused (cap 30). */
    let launcherStop = -1;
    for (let i = 1; i <= 30; i++) { await page.keyboard.press('Tab'); await page.waitForTimeout(90); await rec('index page', i); const isL = await page.evaluate(() => document.activeElement && document.activeElement.hasAttribute('data-chat-launcher')); if (isL) { launcherStop = i; await page.screenshot({ path: path.join(OUT, 'keyboard-focus-launcher.png') }); break; } }
    rows.push(`| index page | — | LAUNCHER reached at Tab stop ${launcherStop} | data-chat-launcher | — |`);
    /* Open with Enter: focus must move INTO the panel (to the input). */
    await page.keyboard.press('Enter'); await page.waitForTimeout(350);
    await rec('widget OPEN (after Enter)', 0);
    await page.screenshot({ path: path.join(OUT, 'keyboard-widget-open.png') });
    for (let i = 1; i <= 2; i++) { await page.keyboard.press('Tab'); await page.waitForTimeout(90); await rec('widget open, Tab', i); if (i === 1) await page.screenshot({ path: path.join(OUT, 'keyboard-focus-send.png') }); }
    /* Back to the input, then Shift+Tab walks the panel's own controls in reverse DOM order:
       Clear chat -> WhatsApp a person -> chips (reversed) -> Close. Proves every widget control is keyboard-reachable. */
    await page.keyboard.press('Shift+Tab'); await page.waitForTimeout(90); await rec('widget open, back at', 0);
    for (let i = 1; i <= 11; i++) { await page.keyboard.press('Shift+Tab'); await page.waitForTimeout(90); await rec('widget open, Shift+Tab', i); if (i === 2) await page.screenshot({ path: path.join(OUT, 'keyboard-focus-wa.png') }); }
    /* Esc closes; focus must return to the launcher. */
    await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    const after = await page.evaluate(() => ({ panelHidden: document.querySelector('[data-chat-panel]').hidden, focusIsLauncher: document.activeElement.hasAttribute('data-chat-launcher') }));
    rows.push(`| widget Esc | — | panel hidden = ${after.panelHidden} · focus back on launcher = ${after.focusIsLauncher} | — | — |`);
    await page.screenshot({ path: path.join(OUT, 'keyboard-after-esc.png') });
    fs.writeFileSync(path.join(OUT, 'keyboard-walk.md'), '# Keyboard walk — Pearl & Vale Chatbot Add-On (Demo)\n\nMethod: Playwright Tab/Shift+Tab/Enter/Escape at 1280px on index.html; focused element + computed outline recorded per stop. All controls are native buttons/links/inputs (lesson 34) — no visually-hidden inputs exist, so no focus-host case arises (lesson 20 checked, not applicable). The widget cycle is included: launcher reached by Tab, Enter opens the panel and focus lands on the message input, Tab/Shift+Tab move through the panel controls with visible focus, Escape closes the panel and focus returns to the launcher.\n\n| Surface | Stop | Focused element | Class/id | Outline |\n|---|---|---|---|---|\n' + rows.join('\n') + '\n');
    console.log('KEYBOARD DONE'); await browser.close(); return;
  }
  if (FLOWS) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } }); const page = await ctx.newPage(); const log = [];
    const panelShot = async n => { await page.locator('[data-chat-panel]').screenshot({ path: path.join(OUT, n) }); };
    const lastBot = async () => page.evaluate(() => { const m = document.querySelectorAll('[data-chat-msgs] .msg.bot'); return m.length ? m[m.length - 1].textContent : ''; });
    const send = async text => { await page.fill('[data-chat-input]', text); await page.click('[data-chat-form] button[type="submit"]'); await page.waitForTimeout(250); };
    await page.goto('file://' + path.join(ROOT, 'index.html'), { waitUntil: 'load' }); await page.waitForTimeout(500);
    /* 1) Open widget */
    await page.click('[data-chat-launcher]'); await page.waitForTimeout(400);
    log.push('panel visible after launcher click -> ' + await page.evaluate(() => !document.querySelector('[data-chat-panel]').hidden));
    log.push('greeting contains honesty label -> ' + (await lastBot()).includes('rule-based FAQ bot'));
    log.push('focus after open is the input -> ' + await page.evaluate(() => document.activeElement.hasAttribute('data-chat-input')));
    await panelShot('flow-widget-open.png');
    /* 2) Quick-reply chip: Opening hours */
    await page.click('[data-chip="0"]'); await page.waitForTimeout(300);
    const hoursTxt = await lastBot();
    log.push('chip "Opening hours" answer has Mon 9:00 AM + Sunday Closed -> ' + (hoursTxt.includes('9:00 AM') && hoursTxt.includes('Sunday: Closed')));
    /* 3) Exact FAQ question */
    await send('How much is teeth whitening?');
    log.push('exact FAQ answer == data (PKR 18,000, 60 mins) -> ' + (await lastBot()).includes('PKR 18,000'));
    /* 4) Keyword-variant question */
    await send('cleaning charges please');
    const varTxt = await lastBot();
    log.push('keyword-variant answer == data (Cleaning & Polishing PKR 4,500) -> ' + (varTxt.includes('Cleaning & Polishing') && varTxt.includes('PKR 4,500')));
    await panelShot('flow-widget-answers.png');
    /* 5) Off-scope -> honest fallback + hand-off offer */
    await send('What is the weather in Lahore today?');
    const fb = await lastBot();
    log.push('off-scope fallback CONTENT -> ' + fb.replace(/\s+/g, ' ').slice(0, 190));
    log.push('fallback names scope + WhatsApp -> ' + (fb.includes('I can only answer about') && fb.includes('WhatsApp')));
    await panelShot('flow-widget-fallback.png');
    /* 6) WhatsApp hand-off click: firing recorded (popup closed immediately) */
    const popupP = page.waitForEvent('popup', { timeout: 4000 }).catch(() => null);
    await page.click('[data-chat-wa]');
    const popup = await popupP; if (popup) { await popup.waitForTimeout(300); await popup.close(); }
    await page.waitForTimeout(300);
    const hands = await page.evaluate(() => JSON.parse(localStorage.getItem('pv_handoffs') || '[]'));
    log.push('FIRING whatsapp hand-off log -> ' + JSON.stringify(hands));
    /* 7) Callback flow: name -> BAD phone (rendered bot error asserted) -> valid phone -> ref */
    await page.click('[data-chip="4"]'); await page.waitForTimeout(300);
    log.push('callback flow asks name -> ' + (await lastBot()).includes('full name'));
    await send('Ahmed Raza');
    log.push('callback flow asks phone -> ' + (await lastBot()).includes('mobile number'));
    await send('123');
    const errTxt = await lastBot();
    log.push('bad phone bot error CONTENT -> ' + errTxt.replace(/\s+/g, ' ').slice(0, 170));
    log.push('error names the constraint (03 + 11 digits) -> ' + (errTxt.includes('03') && errTxt.includes('11 digits')));
    await panelShot('flow-callback-error.png');
    await send('0321 555 0142');
    const conf = await lastBot();
    const ref = (conf.match(/CB-DEMO-\d{4}/) || [])[0];
    log.push('callback confirmation CONTENT -> ' + conf.replace(/\s+/g, ' ').slice(0, 240));
    log.push('callback ref -> ' + ref);
    await panelShot('flow-callback-confirm.png');
    const leads = await page.evaluate(() => JSON.parse(localStorage.getItem('pv_leads') || '[]'));
    log.push('FIRING stored leads -> ' + JSON.stringify(leads.map(x => x.ref + ':' + x.name + ':' + x.phone)));
    /* 8) Persistence across reload */
    await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(400);
    await page.click('[data-chat-launcher]'); await page.waitForTimeout(300);
    const persisted = await page.evaluate(ref => document.querySelector('[data-chat-msgs]').textContent.includes(ref), ref);
    log.push('conversation persists across reload (ref still in chat) -> ' + persisted);
    /* 9) Cross-surface: the lead renders on leads.html */
    await page.goto('file://' + path.join(ROOT, 'leads.html'), { waitUntil: 'load' }); await page.waitForTimeout(500);
    const leadsTxt = (await page.textContent('[data-leads]')).replace(/\s+/g, ' ');
    log.push('CROSS-SURFACE leads view contains ref + name + normalised phone -> ' + (leadsTxt.includes(ref) && leadsTxt.includes('Ahmed Raza') && leadsTxt.includes('+923215550142')));
    const handTxt = (await page.textContent('[data-handoffs]')).replace(/\s+/g, ' ');
    log.push('CROSS-SURFACE hand-off row visible -> ' + (handTxt.includes('WhatsApp hand-off') && /HO-DEMO-\d{4}/.test(handTxt)));
    log.push('log summary -> ' + (await page.textContent('[data-log-summary]')).trim());
    await page.screenshot({ path: path.join(OUT, 'flow-leads.png'), fullPage: true });
    /* 10) Clear chat resets the conversation (leads log untouched) */
    await page.goto('file://' + path.join(ROOT, 'index.html'), { waitUntil: 'load' }); await page.waitForTimeout(400);
    await page.click('[data-chat-launcher]'); await page.waitForTimeout(300);
    await page.click('[data-chat-clear]'); await page.waitForTimeout(300);
    const afterClear = await page.evaluate(() => { const m = document.querySelectorAll('[data-chat-msgs] .msg'); const s = JSON.parse(localStorage.getItem('pv_chat')); return { rendered: m.length, stored: s.messages.length, leads: JSON.parse(localStorage.getItem('pv_leads') || '[]').length }; });
    log.push('clear chat -> rendered msgs ' + afterClear.rendered + ' (fresh greeting), stored ' + afterClear.stored + ', leads preserved ' + afterClear.leads);
    await panelShot('flow-callback-cleared.png');
    fs.writeFileSync(path.join(OUT, 'flow-log.txt'), log.join('\n') + '\n'); console.log(log.join('\n')); console.log('FLOWS DONE'); await browser.close(); return;
  }
  const results = {};
  for (const [pname, file] of PAGES) { for (const [vname, w, h] of VIEWPORTS) { const ctx = await browser.newContext({ viewport: { width: w, height: h }, javaScriptEnabled: !NOJS, reducedMotion: REDUCED ? 'reduce' : 'no-preference' }); const page = await ctx.newPage(); await page.goto('file://' + path.join(ROOT, file), { waitUntil: 'load' }); await page.waitForTimeout(400); await settle(page); results[pname + '@' + vname] = await auditPage(page); await page.screenshot({ path: path.join(OUT, pname + '-' + vname + '.png'), fullPage: true }); await ctx.close(); } }
  fs.writeFileSync(path.join(OUT, 'audit.json'), JSON.stringify(results, null, 2));
  const bad = Object.entries(results).filter(([, a]) => a.overflowX > 1 || a.badEls.length || a.brokenImgs.length || a.textBad.length);
  console.log('combos:', Object.keys(results).length, '| problem combos:', bad.length); bad.forEach(([k, a]) => console.log(k, JSON.stringify(a)));
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
