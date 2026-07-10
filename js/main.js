/*!
 * BIM GLOBAL — main.js
 * Modular front-end behaviour: loader, navigation (desktop dropdown + mobile
 * overlay), scrollspy, scroll reveal, animated counters, scroll-to-top,
 * copy-to-clipboard, and the mailto-based contact form.
 * No external dependencies.
 */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ *
   * 1. Loading screen
   * ------------------------------------------------------------------ */
  var Loader = {
    init: function () {
      var loader = document.getElementById('loader');
      if (!loader) return;
      var hide = function () {
        loader.classList.add('is-hidden');
      };
      // Hide as soon as the page has loaded, with a short minimum so the
      // mark doesn't just flash on fast connections — but never block longer
      // than 1.4s no matter what.
      var minDelay = prefersReducedMotion ? 0 : 400;
      var hideTimer = setTimeout(hide, 1400);
      window.addEventListener('load', function () {
        clearTimeout(hideTimer);
        setTimeout(hide, minDelay);
      });
    }
  };

  /* ------------------------------------------------------------------ *
   * 2. Desktop dropdown (Services submenu)
   * ------------------------------------------------------------------ */
  var Dropdown = {
    init: function () {
      var items = document.querySelectorAll('.has-dropdown');
      if (!items.length) return;

      items.forEach(function (item) {
        var toggle = item.querySelector('.nav-toplink');
        var menu = item.querySelector('.dropdown');
        if (!toggle || !menu) return;

        var open = function () {
          item.setAttribute('data-open', 'true');
          toggle.setAttribute('aria-expanded', 'true');
        };
        var close = function () {
          item.setAttribute('data-open', 'false');
          toggle.setAttribute('aria-expanded', 'false');
        };
        var isOpen = function () { return item.getAttribute('data-open') === 'true'; };

        item.addEventListener('mouseenter', open);
        item.addEventListener('mouseleave', close);

        toggle.addEventListener('click', function (e) {
          e.preventDefault();
          isOpen() ? close() : open();
        });

        toggle.addEventListener('keydown', function (e) {
          if (e.key === 'ArrowDown') { e.preventDefault(); open(); var first = menu.querySelector('a'); if (first) first.focus(); }
          if (e.key === 'Escape') { close(); toggle.focus(); }
        });

        menu.addEventListener('keydown', function (e) {
          if (e.key === 'Escape') { close(); toggle.focus(); }
        });

        document.addEventListener('click', function (e) {
          if (!item.contains(e.target)) close();
        });

        item.addEventListener('focusout', function (e) {
          if (!item.contains(e.relatedTarget)) close();
        });
      });
    }
  };

  /* ------------------------------------------------------------------ *
   * 3. Mobile overlay menu
   * ------------------------------------------------------------------ */
  var MobileMenu = {
    init: function () {
      var openBtn = document.getElementById('hamburgerBtn');
      var menu = document.getElementById('mobileMenu');
      var closeBtn = document.getElementById('mobileMenuClose');
      if (!openBtn || !menu || !closeBtn) return;

      var lastFocused = null;

      var open = function () {
        lastFocused = document.activeElement;
        menu.classList.add('is-open');
        document.body.classList.add('menu-open');
        openBtn.setAttribute('aria-expanded', 'true');
        menu.setAttribute('aria-hidden', 'false');
        closeBtn.focus();
        document.addEventListener('keydown', onKeydown);
      };

      var close = function () {
        menu.classList.remove('is-open');
        document.body.classList.remove('menu-open');
        openBtn.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-hidden', 'true');
        document.removeEventListener('keydown', onKeydown);
        if (lastFocused) lastFocused.focus();
      };

      var onKeydown = function (e) {
        if (e.key === 'Escape') { close(); return; }
        if (e.key === 'Tab') {
          var focusable = menu.querySelectorAll('a, button');
          if (!focusable.length) return;
          var first = focusable[0], last = focusable[focusable.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      };

      openBtn.addEventListener('click', open);
      closeBtn.addEventListener('click', close);

      // Close whenever a real navigation link inside the menu is used
      menu.querySelectorAll('a[href^="#"]').forEach(function (link) {
        link.addEventListener('click', close);
      });

      // Mobile submenu (Services) expand/collapse
      var subToggle = menu.querySelector('.mobile-toplink');
      var submenu = menu.querySelector('.mobile-submenu');
      if (subToggle && submenu) {
        subToggle.addEventListener('click', function () {
          var isOpen = submenu.classList.toggle('is-open');
          subToggle.setAttribute('aria-expanded', String(isOpen));
        });
      }
    }
  };

  /* ------------------------------------------------------------------ *
   * 4. Scrollspy — highlight the active nav link
   * ------------------------------------------------------------------ */
  var ScrollSpy = {
    init: function () {
      var sections = Array.prototype.slice.call(document.querySelectorAll('main > section[id]'));
      var navLinks = Array.prototype.slice.call(document.querySelectorAll('.navlinks a[href^="#"], .mobile-menu-links > li > a[href^="#"]'));
      if (!sections.length || !navLinks.length || !('IntersectionObserver' in window)) return;

      var byId = {};
      navLinks.forEach(function (link) {
        var id = link.getAttribute('href').replace('#', '');
        byId[id] = byId[id] || [];
        byId[id].push(link);
      });

      var setActive = function (id) {
        navLinks.forEach(function (link) { link.removeAttribute('aria-current'); });
        (byId[id] || []).forEach(function (link) { link.setAttribute('aria-current', 'true'); });
      };

      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

      sections.forEach(function (section) { observer.observe(section); });
    }
  };

  /* ------------------------------------------------------------------ *
   * 5. Scroll reveal
   * ------------------------------------------------------------------ */
  var ScrollReveal = {
    init: function () {
      var targets = document.querySelectorAll('.reveal');
      if (!targets.length) return;

      if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        targets.forEach(function (t) { t.classList.add('in-view'); });
        return;
      }

      var observer = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });

      targets.forEach(function (t) { observer.observe(t); });
    }
  };

  /* ------------------------------------------------------------------ *
   * 6. Animated counters (hero stats)
   * ------------------------------------------------------------------ */
  var Counters = {
    init: function () {
      var els = document.querySelectorAll('[data-counter]');
      if (!els.length) return;

      var animate = function (el) {
        var raw = el.getAttribute('data-counter'); // e.g. "35", "100", "7", "5"
        var prefix = el.getAttribute('data-prefix') || '';
        var suffix = el.getAttribute('data-suffix') || '';
        var target = parseFloat(raw);
        if (isNaN(target)) return;

        if (prefersReducedMotion) {
          el.textContent = prefix + target + suffix;
          return;
        }

        var duration = 1200;
        var start = null;

        var step = function (ts) {
          if (start === null) start = ts;
          var progress = Math.min((ts - start) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          var value = Math.round(target * eased);
          el.textContent = prefix + value + suffix;
          if (progress < 1) window.requestAnimationFrame(step);
        };
        window.requestAnimationFrame(step);
      };

      if (!('IntersectionObserver' in window)) {
        els.forEach(animate);
        return;
      }

      var observer = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animate(entry.target);
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.6 });

      els.forEach(function (el) { observer.observe(el); });
    }
  };

  /* ------------------------------------------------------------------ *
   * 7. Scroll-to-top button
   * ------------------------------------------------------------------ */
  var ScrollTop = {
    init: function () {
      var btn = document.getElementById('scrollTopBtn');
      if (!btn) return;

      var toggle = function () {
        if (window.scrollY > 480) btn.classList.add('is-visible');
        else btn.classList.remove('is-visible');
      };

      window.addEventListener('scroll', toggle, { passive: true });
      toggle();

      btn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      });
    }
  };

  /* ------------------------------------------------------------------ *
   * 8. Copy-to-clipboard (email)
   * ------------------------------------------------------------------ */
  var CopyEmail = {
    init: function () {
      var buttons = document.querySelectorAll('[data-copy]');
      buttons.forEach(function (btn) {
        var feedbackId = btn.getAttribute('aria-describedby');
        var feedback = feedbackId ? document.getElementById(feedbackId) : null;
        btn.addEventListener('click', function () {
          var text = btn.getAttribute('data-copy');
          var announce = function (msg) {
            if (feedback) {
              feedback.textContent = msg;
              setTimeout(function () { feedback.textContent = ''; }, 2500);
            }
          };
          var done = function () { announce('Copied to clipboard'); };
          var fail = function () { announce('Could not copy — please copy manually'); };

          if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(done, fail);
          } else {
            // Fallback for older / non-secure contexts
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            try {
              document.execCommand('copy');
              done();
            } catch (err) {
              fail();
            }
            document.body.removeChild(ta);
          }
        });
      });
    }
  };

  /* ------------------------------------------------------------------ *
   * 9. Contact form (mailto — no backend exists yet)
   * ------------------------------------------------------------------ */
  var ContactForm = {
    init: function () {
      var form = document.getElementById('contactForm');
      if (!form) return;
      var status = document.getElementById('formStatus');
      var destination = form.getAttribute('data-to') || 'bimglobal.eg@gmail.com';

      // Only disable native browser validation once JS has taken over with
      // its own accessible validation below. If JS never runs, the form
      // keeps native "required"/"type=email" validation and its plain
      // mailto action/method still submits the message.
      form.setAttribute('novalidate', 'novalidate');

      var showError = function (row, message) {
        row.classList.add('has-error');
        var err = row.querySelector('.field-error');
        if (err) err.textContent = message;
      };
      var clearError = function (row) {
        row.classList.remove('has-error');
        var err = row.querySelector('.field-error');
        if (err) err.textContent = '';
      };

      form.addEventListener('submit', function (e) {
        e.preventDefault();

        var nameField = form.querySelector('#cf-name');
        var emailField = form.querySelector('#cf-email');
        var messageField = form.querySelector('#cf-message');
        var valid = true;

        [nameField, emailField, messageField].forEach(function (field) {
          var row = field.closest('.form-row');
          clearError(row);
          if (!field.value.trim()) {
            showError(row, 'This field is required.');
            valid = false;
          }
        });

        if (emailField.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value.trim())) {
          showError(emailField.closest('.form-row'), 'Enter a valid email address.');
          valid = false;
        }

        if (!valid) {
          status.textContent = 'Please fix the highlighted fields.';
          status.removeAttribute('data-state');
          return;
        }

        var subject = 'New enquiry from ' + nameField.value.trim();
        var body =
          'Name: ' + nameField.value.trim() + '\n' +
          'Email: ' + emailField.value.trim() + '\n\n' +
          messageField.value.trim();

        var mailto = 'mailto:' + destination +
          '?subject=' + encodeURIComponent(subject) +
          '&body=' + encodeURIComponent(body);

        window.location.href = mailto;

        status.setAttribute('data-state', 'success');
        status.textContent = 'Opening your email app with this message pre-filled — send it from there to reach us.';
        form.reset();
      });
    }
  };

  /* ------------------------------------------------------------------ *
   * 10. Footer year
   * ------------------------------------------------------------------ */
  var FooterYear = {
    init: function () {
      var el = document.getElementById('footerYear');
      if (el) el.textContent = new Date().getFullYear();
    }
  };

  /* ------------------------------------------------------------------ *
   * Boot
   * ------------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', function () {
    Loader.init();
    Dropdown.init();
    MobileMenu.init();
    ScrollSpy.init();
    ScrollReveal.init();
    Counters.init();
    ScrollTop.init();
    CopyEmail.init();
    ContactForm.init();
    FooterYear.init();
  });
})();
