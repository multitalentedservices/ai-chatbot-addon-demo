/* Premium layer — Pearl & Vale Chatbot Add-On, index page ONLY (per-page loading rule).
   Lenis smooth scroll (P2) + GSAP ScrollTrigger product-UI composition (P3/P5),
   vendored under assets/vendor/. All effects run FROM visible defaults (gsap.from /
   count-up from the printed figure's own element), so no-JS and reduced-motion
   visitors get the complete static page — the stat numerals are printed in the HTML
   and the count-up only re-animates them to the SAME stated figures.
   Signature moment: the live demo panel counter-drifts (scrubbed parallax) against the
   product copy column as the hero scrolls — the product, held centre-stage. (A pin
   variant was rejected on full-page-capture evidence; see the P3 note below.) */
(function () {
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* Static capture mode (?static=1 / data-static): stand down like reduced
     motion — printed stat figures and the composed hero are the final state. */
  var STATIC = /[?&]static=1(?:&|$)/.test(window.location.search) || document.documentElement.hasAttribute("data-static");
  if (STATIC) document.documentElement.setAttribute("data-static", "");
  if (reduced || STATIC || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  var lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* Hero composition entrance: statement lines settle, demo panel rises into place. */
  gsap.from(".phero-copy > *", { y: 24, autoAlpha: 0, duration: 0.75, ease: "power3.out", stagger: 0.09, delay: 0.05 });
  gsap.from(".demo-shell", { y: 34, autoAlpha: 0, duration: 0.85, ease: "power3.out", delay: 0.25 });

  /* Oversized stat numerals count up ONCE at 85% viewport — to the exact figures
     already printed in the HTML (data-stat-num), never beyond them. */
  document.querySelectorAll("[data-stat-num]").forEach(function (el) {
    var target = Number(el.getAttribute("data-stat-num"));
    var obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: "top 85%", once: true,
      onEnter: function () {
        gsap.to(obj, { v: target, duration: 0.9, ease: "power2.out", onUpdate: function () { el.textContent = Math.round(obj.v); } });
      }
    });
  });

  /* P3 — THE signature scene: the live demo panel rides a scrubbed parallax counter-drift
     against the copy column as the hero scrolls (desktop + phone alike; transform-only).
     A PIN was built first and REJECTED on evidence: ScrollTrigger pinning switches the
     panel to fixed positioning mid-scroll, which tears it in full-page captures (the
     fleet's staged evidence) — fragments of the panel stitched at both page edges in
     index-desktop.png, read by eye 2026-11-22. The scrubbed drift keeps the product
     centre-stage through the whole hero scroll with zero layout risk. */
  gsap.fromTo(".demo-panel", { y: 26 }, {
    y: -26, ease: "none",
    scrollTrigger: { trigger: ".phero", start: "top top", end: "bottom top", scrub: 0.6 }
  });
})();
