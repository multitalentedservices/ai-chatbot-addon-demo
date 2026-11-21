# SIGN-OFF PACK — Prepared for AICOS-112 §0 (Design Systems & Template Library)

Build: Pearl & Vale Dental Studio + FAQ Chatbot Add-On Demo, Portfolio Queue #12
Client-facing owner: BalanceBit Solutions · Production: MTS · Date prepared: 2026-11-21
Status: **prepared by the builder for AICOS-112's §0 sign-off — the sign-off itself is AICOS-112's to record; it has NOT been given yet and is not claimed anywhere in this build.**

## 1. Design-direction note
- **Identity:** an add-on showcase in the MTS Core house register, executed as a *quiet host + loud product* page. The brief's subject is not the dental studio — it is the widget. So the host business (a fictional dental studio) is rendered in a subdued neutral register, and the single violet accent is reserved for the widget and every add-on signal, making the product identifiable in any screenshot at a glance.
- **Register:** clean product-showcase — Sora display headlines, numbered how-it-works steps, an ink "Try to catch it out" challenge band (the demo's conversion moment: it dares the prospect to break the bot), paired can/cannot honesty panels, and scope-tier cards. The widget itself follows researched chat-UX conventions (bottom-right 56px pill launcher, violet header carrying the honesty label permanently, soft-violet bot bubbles vs filled-violet user bubbles, pill quick-reply chips, a persistent action row with the human hand-off).
- **The §0 screenshot test:** with the widget open, no other industry could own this page — a dental price list whose every fact is mirrored in a labelled FAQ bot, plus a leads log page, reads as a chatbot add-on showcase and nothing else; it could not be a clinic site (no practitioners, no appointment engine), a directory, an LMS or a shop.
- **Distinctness from all eleven predecessors:** violet is the first unused primary accent in the queue; Sora+Inter is a new pairing; no predecessor carried a live conversational widget as its centrepiece, a challenge band, or a leads-log surface. Nearest neighbour is Booking Engine (SaaS register) — that build is slate/white multi-skin product UI with no conversational surface and no host business.

## 2. Inspiration references actually used (fresh research, opened 2026-11-21)
- **Tidio/Intercom-class add-on presentation** (comparison research via search — Oversite, Jotform, aitoolcompass): widget-first selling, answers-from-your-own-content framing, scope tiering, hand-off as a headline feature, rules-vs-AI honesty split. Patterns taken, no assets, text or pricing copied — see BUILD-NOTES.md.
- **Chat-widget UX guidance** (Conferbot UI best practices; OscarChat conversion guide; Tidio best practices — via search): launcher size/placement, greeting naming the bot's job, 3–6 quick-reply chips, minimal lead fields, always-visible human option, upfront bot disclosure. Patterns taken — see BUILD-NOTES.md.
- Design-Inspiration-Library: Stripe/Linear restraint informed hierarchy discipline only.

## 3. Palette & type token table (complete — the only colours in the build)
| Token | Hex | Role |
|---|---|---|
| --paper | #FAFAF8 | Warm neutral page ground (host register) |
| --ink | #26232B | Headlines, body text, dark bands, footer |
| --muted | #5A5566 | Secondary text |
| --line | #DDD9E2 | Hairlines, card borders |
| --card | #FFFFFF | Card / panel / widget ground |
| --band | #F1EFF5 | Tinted section band, table headers |
| --accent | #6D28D9 | THE violet: widget, buttons, prices, chips, focus ring |
| --accent-dark | #571CB0 | Accent hover + links + refs |
| --accent-soft | #EFE9FB | Bot bubbles, today's hours row, current-nav pill, status pill ground |
| --err | #B3261E | Semantic error red — token declared for the system; in this build validation errors are delivered as bot messages in the standard bot-bubble treatment, so --err is not rendered (recorded honestly rather than forced) |

Contrast (computed from hex in the battery, all PASS — exact values in tests-output.log): ink on paper 14.80 · ink on card 15.47 · muted on paper 6.87 · accent-dark on paper 9.14 · white on accent 7.10 · white on accent-dark 9.55 · ink on accent-soft 13.05 · header sub-label #E4DBFA on accent 5.35 · error on paper 6.25 · footer text on ink 10.74 · focus ring (accent on paper) 6.80 vs the 3:1 bar.

| Type token | Face | Role |
|---|---|---|
| --disp | "Sora", "Inter", system-ui, sans-serif | Display: H1/H2/H3, prices, refs, widget header (600/700) |
| --sans | "Inter", system-ui, sans-serif | Body, forms, chat (400/600/700); chat input 16px / 52px (no iOS zoom) |

Component tokens: one button system (11px radius, 52px primary / 44px small; filled violet = primary, ghost = secondary, ink = call role), one card system (1px --line border, 14px radius), one table system (band header, hairline rows), one pill system (status + chips share the violet pill language), and the widget system (18px-radius panel with 1.5px accent border, violet header, accent-soft bot bubbles bottom-left squared, accent user bubbles bottom-right squared, 44px+ chips, 52px input + filled Send).

## 4. Evidence filed for the sign-off read
- Full-page captures of every page at 1440 / 768 / 390 + 320px homepage probe: `screenshots/` (paths enumerated in the builder's report and in Scorecard-Verdict.md's component-consistency pass, which includes a dedicated widget line).
- Widget state evidence: `screenshots/flow-widget-open.png`, `flow-widget-answers.png`, `flow-widget-fallback.png`, `flow-callback-error.png`, `flow-callback-confirm.png`, `flow-leads.png` + `screenshots/flow-log.txt`.
- Keyboard walk incl. the full widget open/close cycle: `screenshots/keyboard-walk.md`.
- Test battery: `tests-output.log` — 122 PASS / 0 FAIL, including 15 contrast assertions computed from the tokens above.

## 5. What AICOS-112 is asked to record
- §0 screenshot test result against §1 above (layout could not belong to another industry).
- Palette/type discipline confirmation against §3 (no stray colours in the rendered captures).
- Sign-off, or defects returned as: what is wrong · where · what fixed looks like.
