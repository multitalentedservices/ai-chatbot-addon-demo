# Keyboard walk — Pearl & Vale Chatbot Add-On (Demo)

Method: Playwright Tab/Shift+Tab/Enter/Escape at 1280px on index.html; focused element + computed outline recorded per stop. All controls are native buttons/links/inputs (lesson 34) — no visually-hidden inputs exist, so no focus-host case arises (lesson 20 checked, not applicable). The widget cycle is included: launcher reached by Tab, Enter opens the panel and focus lands on the message input, Tab/Shift+Tab move through the panel controls with visible focus, Escape closes the panel and focus returns to the launcher.

| Surface | Stop | Focused element | Class/id | Outline |
|---|---|---|---|---|
| index page | 1 | a — Skip to content | skip | 3px solid rgb(109, 40, 217) |
| index page | 2 | a — Pearl & ValeDental Studio · Gulberg, Lahore | brand | 3px solid rgb(109, 40, 217) |
| index page | 3 | a — The studio |  | 3px solid rgb(109, 40, 217) |
| index page | 4 | a — The chatbot add-on |  | 3px solid rgb(109, 40, 217) |
| index page | 5 | a — Leads log (demo) |  | 3px solid rgb(109, 40, 217) |
| index page | 6 | a — Call 042 3577 0142 | head-call | 3px solid rgb(109, 40, 217) |
| index page | 7 | a — See treatments & prices | btn | 3px solid rgb(109, 40, 217) |
| index page | 8 | a — How the add-on works | btn ghost | 3px solid rgb(109, 40, 217) |
| index page | 9 | a — 042 3577 0142 |  | 3px solid rgb(109, 40, 217) |
| index page | 10 | button — Open the chat widget | btn | 3px solid rgb(109, 40, 217) |
| index page | 11 | a — See this demo's log |  | 3px solid rgb(109, 40, 217) |
| index page | 12 | a — See the leads this demo has captured | btn ghost | 3px solid rgb(109, 40, 217) |
| index page | 13 | button — Chat — FAQ demo | chat-launcher | 3px solid rgb(109, 40, 217) |
| index page | — | LAUNCHER reached at Tab stop 13 | data-chat-launcher | — |
| widget OPEN (after Enter) | 0 | input — chat-input | chat-input | 3px solid rgb(109, 40, 217) |
| widget open, Tab | 1 | button — Send |  | 3px solid rgb(109, 40, 217) |
| widget open, Tab | 2 | body — Skip to content DEMO — Pearl & Vale Dental S |  | 0px none rgb(38, 35, 43) |
| widget open, back at | 0 | button — Send |  | 3px solid rgb(109, 40, 217) |
| widget open, Shift+Tab | 1 | input — chat-input | chat-input | 3px solid rgb(109, 40, 217) |
| widget open, Shift+Tab | 2 | button — Clear chat | clear-btn | 3px solid rgb(109, 40, 217) |
| widget open, Shift+Tab | 3 | a — WhatsApp a person | wa-btn | 3px solid rgb(109, 40, 217) |
| widget open, Shift+Tab | 4 | button — Talk to a person | chip | 3px solid rgb(109, 40, 217) |
| widget open, Shift+Tab | 5 | button — Request a callback | chip | 3px solid rgb(109, 40, 217) |
| widget open, Shift+Tab | 6 | button — Where are you? | chip | 3px solid rgb(109, 40, 217) |
| widget open, Shift+Tab | 7 | button — Book an appointment | chip | 3px solid rgb(109, 40, 217) |
| widget open, Shift+Tab | 8 | button — Prices | chip | 3px solid rgb(109, 40, 217) |
| widget open, Shift+Tab | 9 | button — Opening hours | chip | 3px solid rgb(109, 40, 217) |
| widget open, Shift+Tab | 10 | div — Hello — I’m the Pearl & Vale FAQ assistant.  | chat-msgs | 3px solid rgb(109, 40, 217) |
| widget open, Shift+Tab | 11 | button — ✕ |  | 3px solid rgb(109, 40, 217) |
| widget Esc | — | panel hidden = true · focus back on launcher = true | — | — |
