/* Muslims in CSE — shared site scripts */
(function () {
  'use strict';

  /* Scroll-reveal.
     Fail-safe by design: .reveal elements are visible by default in CSS, and are
     only hidden once this script adds .js-reveal to <html>. If the script never
     runs, nothing is ever stuck invisible.
     Uses a plain scroll handler rather than IntersectionObserver — fewer moving
     parts, predictable in every browser, and trivial cost for a handful of nodes. */
  function initReveals() {
    var items = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
    if (!items.length) return;

    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return; // leave everything visible, no animation

    document.documentElement.classList.add('js-reveal');

    function show(el) { el.classList.add('is-visible'); }

    function update() {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      for (var i = items.length - 1; i >= 0; i--) {
        var el = items[i];
        var r = el.getBoundingClientRect();
        // Reveal once any part of it is inside the viewport (with a small margin).
        if (r.top < vh - 40 && r.bottom > 0) {
          show(el);
          items.splice(i, 1);
        }
      }
      if (!items.length) teardown();
    }

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        ticking = false;
        update();
      });
    }

    function teardown() {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    update(); // reveal whatever is already on screen

    // Last-resort safety net: if something has kept anything hidden after 5s
    // (odd rendering, zero-height viewport, etc.), just show it.
    setTimeout(function () {
      if (!items.length) return;
      for (var i = 0; i < items.length; i++) show(items[i]);
      items.length = 0;
      teardown();
    }, 5000);
  }

  /* Prev/next buttons for horizontal photo strips.
     The strip is natively scrollable (swipe / trackpad / scrollbar / arrow keys),
     so these buttons are a convenience layer only — if this never runs, the
     gallery still works. */
  function initScrollers() {
    var buttons = document.querySelectorAll('[data-scroll][data-target]');

    Array.prototype.forEach.call(buttons, function (btn) {
      btn.addEventListener('click', function () {
        var strip = document.getElementById(btn.getAttribute('data-target'));
        if (!strip) return;

        var card = strip.querySelector('.shot');
        // Advance by one card (plus the flex gap), falling back to ~80% of the view.
        var step = card
          ? card.getBoundingClientRect().width + 14
          : strip.clientWidth * 0.8;

        strip.scrollBy({
          left: btn.getAttribute('data-scroll') === 'prev' ? -step : step,
          behavior: 'smooth'
        });
      });
    });
  }

  function init() {
    initReveals();
    initScrollers();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
