# PERFORMANCE PACK — Pearl & Vale + FAQ Chatbot Add-On (Queue #12)

Purpose: everything the served-preview measurement needs from the build side. The main agent serves finished sites via GitHub Pages; this pack records the measured local weights and the weight-discipline choices made so the served numbers can pass when measured. **No Lighthouse or Core Web Vitals numbers are claimed anywhere in this pack — none exist yet (see the pending section).**

## Measured weights (local, 2026-11-21, from the test battery + filesystem)
- Code (2 HTML pages + css/style.css + js/logic.js + js/app.js): **50,801 B total** — budget < 400 KB, using ~12% of it.
  - Largest single file: js/logic.js (14,293 B — the shared data + matcher + answer module).
- Media: **232,414 B total across 2 photographs** — budget ≤ 1.6 MB, using ~14% of it.
- Per-image sizes (each compressed under the ≤ 120 KB ceiling loop BEFORE any HTML referenced it, lesson 39):
  - assets/hero.jpg — 117,551 B (1400×933, quality stepped to fit the ceiling)
  - assets/treatment.jpg — 114,863 B (1400×933)
  - assets/favicon.svg — text, negligible.

## Weight-discipline choices (why the served numbers should pass)
- **Zero JavaScript libraries and zero CSS frameworks.** Hand-coded vanilla JS + one stylesheet; the only third-party request is Google Fonts (Sora + Inter, `display=swap`, with `preconnect` hints — text renders on the system fallback first).
- **No network calls at all in the product code** — the battery asserts zero fetch/XHR/beacon/analytics; the chat, the matcher and the lead log are entirely local, so the widget adds no runtime latency beyond its own ~22 KB of JS.
- **Two photographs total** (lesson 32 applied to a showcase: one per surface family — hero for the host page, treatment room for the leads page, lazy-loaded there). The widget itself is pure UI — no imagery, no icon fonts, no emoji.
- **No layout-shift machinery:** images carry fixed heights/frames, the chat panel is `position:fixed` and `hidden` until opened (it never injects into document flow), and there are no sticky bars, popups or late banners. The only animation is a subtle hero scale drift, disabled under `prefers-reduced-motion`.
- **Reveal-by-default:** all page content is visible without JS; the services grid and hours table render from the data object on DOMContentLoaded-equivalent script-at-body-end, with full noscript fallbacks carrying the same facts as text.

## Served-preview CWV: PENDING — to be measured on the GitHub Pages preview by the main agent
- LCP / INP / CLS: **not measured** — the build is not deployed, and no numbers are estimated or invented here (honesty rule).
- Expected risk points to check at measurement: hero image weight on slow mobile (117 KB, single image — should be the LCP element), font swap behaviour, and widget-open interaction latency (pure local DOM work — expected to be a non-issue, stated as expectation, not measurement).
- Fixed by: the main agent deploying the GitHub Pages preview and filing a measured Lighthouse report against this pack; Area 7 of the scorecard is scored on partial (weight) evidence until then.
