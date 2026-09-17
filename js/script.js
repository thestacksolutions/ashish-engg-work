/**
 * Ashish Engineering Works — site scripts
 * Sections: 1. Header/nav  2. Mobile menu  3. Product catalogue
 * 4. Scroll reveal  5. Counters  6. Back to top  7. Contact form
 */
(function () {
  "use strict";

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  document.addEventListener("DOMContentLoaded", function () {
    initHeader();
    initMobileNav();
    initProducts();
    initScrollReveal();
    initCounters();
    initBackToTop();
    initContactForm();
    $("#year").textContent = new Date().getFullYear();
  });

  /* 1. Sticky header state + active link highlight ------------------- */
  function initHeader() {
    var header = $("#siteHeader");
    var toggleScrolled = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 24);
    };
    toggleScrolled();
    window.addEventListener("scroll", toggleScrolled, { passive: true });

    var links = $$(".nav-links a");
    var sections = links
      .map(function (a) { return document.querySelector(a.getAttribute("href")); })
      .filter(Boolean);

    if ("IntersectionObserver" in window && sections.length) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = "#" + entry.target.id;
            links.forEach(function (a) {
              a.classList.toggle("is-active", a.getAttribute("href") === id);
            });
          }
        });
      }, { rootMargin: "-45% 0px -45% 0px" });
      sections.forEach(function (s) { obs.observe(s); });
    }
  }

  /* 2. Mobile nav toggle ----------------------------------------------- */
  function initMobileNav() {
    var toggle = $("#navToggle");
    var panel = $("#navPanel");
    var closeBtn = $("#navClose");
    if (!toggle || !panel) return;

    function setOpen(open) {
      panel.classList.toggle("is-open", open);
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    }

    toggle.addEventListener("click", function () {
      setOpen(!panel.classList.contains("is-open"));
    });

    if (closeBtn) {
      closeBtn.addEventListener("click", function () { setOpen(false); });
    }

    // Close on Escape for keyboard users
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && panel.classList.contains("is-open")) setOpen(false);
    });

    $$("a", panel).forEach(function (a) {
      a.addEventListener("click", function () { setOpen(false); });
    });
  }

  /* 3. Product catalogue: fetch JSON, render tabs + grid --------------- */
  function initProducts() {
    var tabRow = $("#tabRow");
    var grid = $("#productGrid");
    var blurb = $("#productBlurb");
    if (!tabRow || !grid) return;

    fetch("data/products.json")
      .then(function (res) {
        if (!res.ok) throw new Error("Failed to load product data");
        return res.json();
      })
      .then(function (data) {
        renderCatalogue(data.categories, tabRow, grid, blurb);
      })
      .catch(function (err) {
        grid.innerHTML = '<p style="color:var(--ink-500);">Product catalogue could not be loaded right now. Please contact us directly for our full product list.</p>';
        console.error(err);
      });
  }

  function renderCatalogue(categories, tabRow, grid, blurb) {
    tabRow.innerHTML = categories
      .map(function (cat, i) {
        return '<button class="tab-btn' + (i === 0 ? " is-active" : "") +
          '" role="tab" aria-selected="' + (i === 0) + '" data-slug="' + cat.slug + '">' +
          cat.name + "</button>";
      })
      .join("");

    function paint(slug) {
      var cat = categories.find(function (c) { return c.slug === slug; }) || categories[0];
      blurb.textContent = cat.blurb;

      grid.innerHTML = cat.items
        .map(function (item, i) {
          return (
            '<article class="product-card" style="animation-delay:' + (i * 45) + 'ms">' +
            '<div class="product-thumb">' +
            '<img src="assets/images/' + item.image + '" alt="' + item.alt + '" loading="lazy" width="400" height="400">' +
            "</div>" +
            '<h3 class="product-name">' + item.name + "</h3>" +
            "</article>"
          );
        })
        .join("");
    }

    tabRow.addEventListener("click", function (e) {
      var btn = e.target.closest(".tab-btn");
      if (!btn) return;
      $$(".tab-btn", tabRow).forEach(function (b) {
        b.classList.toggle("is-active", b === btn);
        b.setAttribute("aria-selected", String(b === btn));
      });
      paint(btn.dataset.slug);
    });

    paint(categories[0].slug);
  }

  /* 4. Scroll reveal via IntersectionObserver --------------------------- */
  function initScrollReveal() {
    var targets = $$(".reveal");
    if (!("IntersectionObserver" in window) || !targets.length) {
      targets.forEach(function (t) { t.classList.add("is-visible"); });
      return;
    }
    var obs = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -40px 0px" });
    targets.forEach(function (t) { obs.observe(t); });
  }

  /* 5. Animated counters for hero stats ---------------------------------- */
  function initCounters() {
    var counters = $$(".hero-stat b");
    if (!counters.length) return;

    function animate(el) {
      var target = parseInt(el.dataset.count, 10);
      var suffix = el.dataset.suffix || "";
      var isYear = el.dataset.format === "year";
      // Years count up from a recent starting point so the motion reads
      // as "counting up to founding year" rather than from zero.
      var rangeStart = isYear ? target - 24 : 0;
      var duration = 1200;
      var start = null;

      function step(ts) {
        if (start === null) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var value = Math.round(rangeStart + (target - rangeStart) * eased);
        el.textContent = value + suffix;
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target + suffix;
      }
      requestAnimationFrame(step);
    }

    if ("IntersectionObserver" in window) {
      var obs = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animate(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.6 });
      counters.forEach(function (c) { obs.observe(c); });
    } else {
      counters.forEach(function (c) { c.textContent = c.dataset.count + (c.dataset.suffix || ""); });
    }
  }

  /* 6. Back-to-top button -------------------------------------------------- */
  function initBackToTop() {
    var btn = $("#backToTop");
    if (!btn) return;
    window.addEventListener("scroll", function () {
      btn.classList.toggle("is-visible", window.scrollY > 700);
    }, { passive: true });
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* 7. Contact form — redirects to WhatsApp with the enquiry pre-filled -- */
  // Owner's WhatsApp number (with country code, digits only, no + or spaces).
  var WHATSAPP_NUMBER = "919820635605";

  function initContactForm() {
    var form = $("#enquiryForm");
    var status = $("#formStatus");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.className = "form-status";
      status.textContent = "";

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var data = new FormData(form);
      var lines = [
        "New enquiry from the website:",
        "",
        "Name: " + data.get("name"),
        "Phone: " + data.get("phone"),
        "Email: " + data.get("email"),
        "Product / Specification: " + (data.get("product") || "-"),
        "Message: " + data.get("message")
      ];
      var text = encodeURIComponent(lines.join("\n"));

      status.textContent = "Taking you to WhatsApp to send your enquiry…";
      status.className = "form-status is-success";

      /* window.location.href = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + text; */

      var isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      var waUrl = isMobile
        ? "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + text
        : "https://web.whatsapp.com/send?phone=" + WHATSAPP_NUMBER + "&text=" + text;

      /* window.location.href = waUrl; */

      window.open(waUrl, "_blank", "noopener");
      form.reset();
    });
  }
})();
