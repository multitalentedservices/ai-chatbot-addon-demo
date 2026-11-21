/* Pearl & Vale — chat widget behaviour (DOM layer). All decisions live in js/logic.js.
   Storage keys: pv_chat (conversation), pv_leads (local sheet-log stub), pv_handoffs (WhatsApp log).
   DEMO ONLY: nothing leaves this browser. */
(function () {
  'use strict';
  var L = window.ChatLogic;
  var PAGE = location.pathname.split('/').pop() || 'index.html';
  var $ = function (s, r) { return (r || document).querySelector(s); };

  function read(key, dflt) { try { var v = JSON.parse(localStorage.getItem(key)); return v == null ? dflt : v; } catch (e) { return dflt; } }
  function write(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) {} }

  /* ---------- Services + hours rendered FROM the data object (page == bot facts) ---------- */
  var svcHost = $('[data-services]');
  if (svcHost) {
    svcHost.innerHTML = L.BIZ.services.map(function (s) {
      return '<article class="card"><h3>' + s.name + '</h3><p class="mins">About ' + s.mins + ' minutes</p><p class="price">' + L.pkr(s.price) + '</p></article>';
    }).join('');
  }
  var hoursHost = $('[data-hours]');
  if (hoursHost) {
    hoursHost.innerHTML = L.BIZ.hours.map(function (h) {
      var today = h.day === 'Sunday';
      return '<tr' + (today ? ' class="today"' : '') + '><td>' + h.day + (today ? ' (today)' : '') + '</td><td>' + (h.open ? h.open + ' \u2013 ' + h.close : 'Closed') + '</td></tr>';
    }).join('');
  }
  document.querySelectorAll('[data-biz]').forEach(function (el) {
    var k = el.getAttribute('data-biz');
    if (L.BIZ[k]) el.textContent = L.BIZ[k];
  });

  /* ---------- Leads view (leads.html) ---------- */
  var leadsHost = $('[data-leads]');
  if (leadsHost) {
    var leads = read('pv_leads', []);
    var hands = read('pv_handoffs', []);
    if (!leads.length) {
      leadsHost.innerHTML = '<div class="empty"><b>No callback leads yet in this browser.</b><br>Open the chat on the home page, tap \u201cRequest a callback\u201d, complete the two questions \u2014 then come back here and the lead will be listed. That round-trip is the demo.</div>';
    } else {
      leadsHost.innerHTML = '<table class="log"><thead><tr><th>Reference</th><th>Name</th><th>Phone</th><th>Captured (demo clock)</th><th>Status</th></tr></thead><tbody>' +
        leads.map(function (x) { return '<tr><td class="ref">' + x.ref + '</td><td>' + x.name + '</td><td>' + x.phone + '</td><td>' + x.when + '</td><td><span class="pill">' + x.status + '</span></td></tr>'; }).join('') + '</tbody></table>';
    }
    var handHost = $('[data-handoffs]');
    if (handHost) {
      handHost.innerHTML = hands.length
        ? '<table class="log"><thead><tr><th>Reference</th><th>Channel</th><th>From page</th><th>Clicked (demo clock)</th></tr></thead><tbody>' +
          hands.map(function (x) { return '<tr><td class="ref">' + x.ref + '</td><td>' + x.channel + '</td><td>' + x.page + '</td><td>' + x.when + '</td></tr>'; }).join('') + '</tbody></table>'
        : '<div class="empty">No WhatsApp hand-offs recorded yet in this browser. The hand-off button inside the chat writes a row here when clicked.</div>';
    }
    var sum = $('[data-log-summary]');
    if (sum) sum.textContent = 'Local sheet-log in this browser: ' + leads.length + ' callback lead(s) \u00b7 ' + hands.length + ' WhatsApp hand-off click(s). Production wiring replaces this stub with the business\u2019s Google Sheet \u2014 same columns, same references.';
  }

  /* ---------- The widget ---------- */
  var launcher = $('[data-chat-launcher]'), panel = $('[data-chat-panel]');
  if (!launcher || !panel) return;
  var msgsEl = $('[data-chat-msgs]', panel), chipsEl = $('[data-chat-chips]', panel),
      form = $('[data-chat-form]', panel), input = $('[data-chat-input]', panel),
      closeBtn = $('[data-chat-close]', panel), clearBtn = $('[data-chat-clear]', panel),
      waBtn = $('[data-chat-wa]', panel);

  var state = read('pv_chat', null);
  if (!state || !Array.isArray(state.messages)) state = { messages: [], flow: null, name: null };
  function save() { write('pv_chat', state); }

  function render() {
    msgsEl.innerHTML = state.messages.map(function (m) {
      return '<div class="msg ' + m.from + '">' + m.text.replace(/</g, '&lt;') + '<span class="stamp">Demo clock \u00b7 ' + L.DEMO_CLOCK.split(' \u00b7 ')[1].replace(' (fixed demo clock)', '') + '</span></div>';
    }).join('');
    msgsEl.scrollTop = msgsEl.scrollHeight;
  }
  function push(from, text) { state.messages.push({ from: from, text: text }); save(); render(); }
  function greet() {
    push('bot', 'Hello \u2014 I\u2019m the ' + L.BIZ.shortName + ' FAQ assistant. ' + L.DEMO_LABEL + '. Ask me about services, prices, hours or bookings, or tap a suggestion below.');
  }
  if (!state.messages.length) greet(); else render();

  chipsEl.innerHTML = L.CHIPS.map(function (c, i) {
    return '<button type="button" class="chip" data-chip="' + i + '">' + c.label + '</button>';
  }).join('');
  chipsEl.addEventListener('click', function (e) {
    var b = e.target.closest('[data-chip]'); if (!b) return;
    var chip = L.CHIPS[Number(b.getAttribute('data-chip'))];
    if (chip.action === 'callback') startCallback();
    else { push('user', chip.label); respond(chip.query); }
    input.focus();
  });

  function startCallback() {
    state.flow = 'name'; state.name = null; save();
    push('bot', 'I can arrange that. First \u2014 what is your full name?');
  }
  function respond(text) {
    var a = L.answerFor(text);
    push('bot', a.text);
  }
  function handleUser(text) {
    push('user', text);
    if (state.flow === 'name') {
      var v = L.validateName(text);
      if (!v.ok) { push('bot', v.error); return; }
      state.name = v.value; state.flow = 'phone'; save();
      push('bot', 'Thank you, ' + v.value.split(' ')[0] + '. And the best Pakistani mobile number to call you back on? (For example 0321 555 0142.)');
      return;
    }
    if (state.flow === 'phone') {
      var p = L.validatePhonePK(text);
      if (!p.ok) { push('bot', p.error); return; }
      var out = L.addLead(read('pv_leads', []), state.name, p.value, PAGE);
      write('pv_leads', out.leads);
      state.flow = null; state.name = null; save();
      push('bot', L.callbackConfirmText(out.lead));
      return;
    }
    respond(text);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var text = input.value.trim();
    if (!text) { push('bot', 'You sent an empty message \u2014 type a question about our services, prices, hours or bookings, or tap a suggestion below.'); input.focus(); return; }
    input.value = '';
    handleUser(text.slice(0, 500));
    input.focus();
  });

  waBtn.addEventListener('click', function () {
    var out = L.addHandoff(read('pv_handoffs', []), PAGE);
    write('pv_handoffs', out.log);
  });
  clearBtn.addEventListener('click', function () {
    state = { messages: [], flow: null, name: null }; save(); greet(); input.focus();
  });

  function openPanel() {
    panel.hidden = false; launcher.hidden = true;
    render();
    input.focus();
  }
  function closePanel() {
    panel.hidden = true; launcher.hidden = false;
    launcher.focus();
  }
  launcher.addEventListener('click', openPanel);
  closeBtn.addEventListener('click', closePanel);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !panel.hidden) closePanel();
  });
})();
