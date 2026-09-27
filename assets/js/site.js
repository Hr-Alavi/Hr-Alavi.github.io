/* ==========================================================================
   Site behaviour (no dependencies). Replaces the old main.min.js bundle.
   - theme toggle, mobile menu, header scroll state, back-to-top
   - scroll reveal, number counters, rotating hero words, card spotlight
   - publications: search + type filters, BibTeX viewer, copy citation
   - project status, photo gallery + lightbox
   - on-demand MathJax / Mermaid / Plotly for pages that use them
   ========================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("reveal-ready");

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(selector, scope) { return (scope || document).querySelector(selector); }
  function $all(selector, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(selector)); }

  function storageGet(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function storageSet(key, value) { try { localStorage.setItem(key, value); } catch (e) { /* private mode */ } }

  /* ---------- Theme ---------- */
  function currentTheme() { return root.getAttribute("data-theme") === "dark" ? "dark" : "light"; }

  function applyTheme(theme) {
    if (theme === "dark") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
    $all("[data-theme-toggle]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    });
    document.dispatchEvent(new CustomEvent("themechange", { detail: { theme: theme } }));
  }

  applyTheme(currentTheme());

  $all("[data-theme-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      storageSet("theme", next);
      applyTheme(next);
    });
  });

  if (window.matchMedia) {
    var schemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    var onSchemeChange = function (e) {
      var saved = storageGet("theme");
      if (saved !== "dark" && saved !== "light") applyTheme(e.matches ? "dark" : "light");
    };
    if (schemeQuery.addEventListener) schemeQuery.addEventListener("change", onSchemeChange);
    else if (schemeQuery.addListener) schemeQuery.addListener(onSchemeChange);
  }

  /* ---------- Mobile navigation ---------- */
  var navToggle = $("[data-nav-toggle]");
  var nav = $("#site-nav");

  function setNav(open) {
    if (!navToggle) return;
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Menu");
    document.body.classList.toggle("nav-open", open);
  }

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      setNav(navToggle.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setNav(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setNav(false); });
    document.addEventListener("click", function (e) {
      if (document.body.classList.contains("nav-open") && !e.target.closest(".site-header")) setNav(false);
    });
    window.addEventListener("resize", function () { if (window.innerWidth > 960) setNav(false); });
  }

  /* ---------- Header state, progress bar, back-to-top ---------- */
  var header = $(".site-header");
  var progress = $(".scroll-progress span");
  var toTop = $("[data-to-top]");
  var ticking = false;

  function onScroll() {
    var y = window.pageYOffset || root.scrollTop;
    if (header) header.classList.toggle("is-scrolled", y > 8);
    if (progress) {
      var max = root.scrollHeight - window.innerHeight;
      progress.style.transform = "scaleX(" + (max > 0 ? Math.min(y / max, 1) : 0) + ")";
    }
    if (toTop) toTop.classList.toggle("is-visible", y > 700);
    ticking = false;
  }

  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- Scroll reveal + counters ---------- */
  function countUp(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (!target || reduceMotion) { el.textContent = target || el.textContent; return; }
    var start = null;
    var duration = 1400;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }

  var revealEls = $all(".reveal");
  var counters = $all("[data-count]");

  if ("IntersectionObserver" in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
    revealEls.forEach(function (el) { revealObserver.observe(el); });

    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        countUp(entry.target);
        countObserver.unobserve(entry.target);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { el.textContent = "0"; countObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Rotating words in the hero ---------- */
  $all("[data-rotator]").forEach(function (rotator) {
    var words = $all(":scope > span", rotator);
    if (words.length < 2 || reduceMotion) return;
    var index = 0;
    window.setInterval(function () {
      var current = words[index];
      index = (index + 1) % words.length;
      current.classList.remove("is-active");
      current.classList.add("is-leaving");
      words[index].classList.add("is-active");
      window.setTimeout(function () { current.classList.remove("is-leaving"); }, 500);
    }, 2600);
  });

  /* ---------- Spotlight that follows the pointer on theme cards ---------- */
  $all("[data-spotlight]").forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      var rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - rect.left) + "px");
      card.style.setProperty("--my", (e.clientY - rect.top) + "px");
    });
  });

  /* ---------- Clipboard + toast ---------- */
  var toastEl = null;
  var toastTimer = null;

  function toast(message) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      document.body.appendChild(toastEl);
    }
    toastEl.innerHTML = '<i class="fa-solid fa-check" aria-hidden="true"></i>';
    toastEl.appendChild(document.createTextNode(message));
    toastEl.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toastEl.classList.remove("is-visible"); }, 1900);
  }

  function legacyCopy(text) {
    return new Promise(function (resolve, reject) {
      var area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      try { if (document.execCommand("copy")) resolve(); else reject(new Error("copy failed")); }
      catch (err) { reject(err); }
      document.body.removeChild(area);
    });
  }

  function copyText(text, message) {
    var attempt = navigator.clipboard && window.isSecureContext
      ? navigator.clipboard.writeText(text).catch(function () { return legacyCopy(text); })
      : legacyCopy(text);
    return attempt
      .then(function () { toast(message || "Copied"); })
      .catch(function () { toast("Copy failed: please select the text and copy it manually"); });
  }

  /* ---------- BibTeX viewer ---------- */
  var bibCache = {};

  function toggleBibtex(btn) {
    var body = btn.closest(".pub__body") || btn.parentNode;
    var box = $(".pub__bib", body);
    if (box && !box.hidden) {
      box.hidden = true;
      btn.setAttribute("aria-expanded", "false");
      return;
    }
    if (!box) {
      box = document.createElement("div");
      box.className = "pub__bib";
      box.innerHTML = '<pre tabindex="0"><code>Loading…</code></pre>' +
        '<button class="pill" type="button" data-copy-bib><i class="fa-regular fa-copy" aria-hidden="true"></i>Copy</button>';
      body.appendChild(box);
    }
    box.hidden = false;
    btn.setAttribute("aria-expanded", "true");
    var url = btn.getAttribute("data-bibtex");
    var code = $("code", box);
    if (bibCache[url]) { code.textContent = bibCache[url]; return; }
    fetch(url)
      .then(function (res) { if (!res.ok) throw new Error(res.status); return res.text(); })
      .then(function (text) { bibCache[url] = text.trim(); code.textContent = bibCache[url]; })
      .catch(function () { code.textContent = "Could not load the BibTeX file. Try downloading it: " + url; });
  }

  document.addEventListener("click", function (e) {
    var bibBtn = e.target.closest("[data-bibtex]");
    if (bibBtn) { toggleBibtex(bibBtn); return; }

    var copyBib = e.target.closest("[data-copy-bib]");
    if (copyBib) {
      copyText($("code", copyBib.parentNode).textContent, "BibTeX copied");
      return;
    }

    var copyBtn = e.target.closest("[data-copy]");
    if (copyBtn) copyText(copyBtn.getAttribute("data-copy"), copyBtn.getAttribute("data-copy-msg"));
  });

  /* ---------- Publications: search + filters ---------- */
  var pubRoot = $("[data-pubs]");
  if (pubRoot) {
    var items = $all(".pub", pubRoot);
    var years = $all(".pub-year", pubRoot);
    var input = $("#pub-search", pubRoot);
    var chips = $all("[data-filter]", pubRoot);
    var shown = $("[data-pub-shown]", pubRoot);
    var empty = $(".pub-empty", pubRoot);
    var params = new URLSearchParams(window.location.search);
    var state = { type: params.get("type") || "all", q: params.get("q") || "" };
    if (!chips.some(function (c) { return c.getAttribute("data-filter") === state.type; })) state.type = "all";
    if (input) input.value = state.q;

    // "a|b c" matches items containing "a", or both "b" and "c".
    var matches = function (haystack, query) {
      var groups = query.toLowerCase().split("|").map(function (g) { return g.trim(); }).filter(Boolean);
      if (!groups.length) return true;
      return groups.some(function (group) {
        return group.split(/\s+/).every(function (term) { return haystack.indexOf(term) !== -1; });
      });
    };

    var applyFilters = function (updateUrl) {
      var count = 0;
      items.forEach(function (item) {
        var ok = (state.type === "all" || item.getAttribute("data-type") === state.type) &&
          matches(item.getAttribute("data-search") || "", state.q);
        item.hidden = !ok;
        if (ok) { count += 1; item.classList.add("is-visible"); }
      });
      years.forEach(function (year) { year.hidden = !$(".pub:not([hidden])", year); });
      chips.forEach(function (chip) {
        var on = chip.getAttribute("data-filter") === state.type;
        chip.classList.toggle("is-active", on);
        chip.setAttribute("aria-pressed", on ? "true" : "false");
      });
      if (shown) shown.textContent = count;
      if (empty) empty.hidden = count !== 0;
      if (updateUrl && window.history.replaceState) {
        var next = new URLSearchParams();
        if (state.q) next.set("q", state.q);
        if (state.type !== "all") next.set("type", state.type);
        var qs = next.toString();
        window.history.replaceState(null, "", window.location.pathname + (qs ? "?" + qs : "") + window.location.hash);
      }
    };

    var debounce = null;
    if (input) {
      input.addEventListener("input", function () {
        window.clearTimeout(debounce);
        debounce = window.setTimeout(function () { state.q = input.value.trim(); applyFilters(true); }, 120);
      });
    }
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () { state.type = chip.getAttribute("data-filter"); applyFilters(true); });
    });
    $all("[data-pub-reset]", pubRoot).forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.q = ""; state.type = "all";
        if (input) input.value = "";
        applyFilters(true);
        if (input) input.focus();
      });
    });
    if (state.q || state.type !== "all") applyFilters(false);
  }

  /* ---------- Project status (keeps badges right between site rebuilds) ---------- */
  var now = new Date();
  var nowYm = now.getFullYear() * 100 + now.getMonth() + 1;
  $all("[data-end]").forEach(function (el) {
    var parts = (el.getAttribute("data-end") || "").split("-");
    var year = parseInt(parts[0], 10);
    if (!year) return;
    var month = parseInt(parts[1], 10) || 12;
    var ongoing = year * 100 + month >= nowYm;
    el.textContent = ongoing ? "Ongoing" : "Completed";
    el.classList.toggle("status--ongoing", ongoing);
    el.classList.toggle("status--done", !ongoing);
  });

  /* ---------- Photo strip + lightbox ---------- */
  $all("[data-scroller]").forEach(function (section) {
    var track = $("[data-scroller-track]", section);
    if (!track) return;
    $all("[data-scroll-dir]", section).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var dir = btn.getAttribute("data-scroll-dir") === "next" ? 1 : -1;
        track.scrollBy({ left: dir * track.clientWidth * 0.8, behavior: reduceMotion ? "auto" : "smooth" });
      });
    });
  });

  var lightbox = $("#lightbox");
  var lightboxLinks = $all("[data-lightbox]");
  if (lightbox && lightboxLinks.length && typeof lightbox.showModal === "function") {
    var lbImg = $("img", lightbox);
    var lbCaption = $("figcaption", lightbox);
    var lbIndex = 0;
    var showPhoto = function (i) {
      lbIndex = (i + lightboxLinks.length) % lightboxLinks.length;
      var link = lightboxLinks[lbIndex];
      var thumb = $("img", link);
      lbImg.src = link.getAttribute("href");
      lbImg.alt = thumb ? thumb.alt : "";
      lbCaption.textContent = link.getAttribute("data-caption") || (thumb ? thumb.alt : "");
    };
    lightboxLinks.forEach(function (link, i) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        showPhoto(i);
        lightbox.showModal();
      });
    });
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox || e.target.closest("[data-lb-close]")) { lightbox.close(); return; }
      var navBtn = e.target.closest("[data-lb-nav]");
      if (navBtn) showPhoto(lbIndex + (navBtn.getAttribute("data-lb-nav") === "next" ? 1 : -1));
    });
    lightbox.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") showPhoto(lbIndex + 1);
      if (e.key === "ArrowLeft") showPhoto(lbIndex - 1);
    });
  }

  /* ---------- Optional libraries, loaded only when a page needs them ---------- */
  function loadScript(src, attrs) {
    var s = document.createElement("script");
    s.src = src;
    s.defer = true;
    Object.keys(attrs || {}).forEach(function (k) { s.setAttribute(k, attrs[k]); });
    document.head.appendChild(s);
    return s;
  }

  var content = $("#main");
  var text = content ? content.textContent : "";
  if (/\$\$|\\\(|\\\[/.test(text)) {
    loadScript("https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js", { id: "MathJax-script" });
  }

  if ($("code.language-mermaid")) {
    import("https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs").then(function (m) {
      m.default.initialize({ startOnLoad: false, theme: currentTheme() === "dark" ? "dark" : "default" });
      return m.default.run({ querySelector: "code.language-mermaid" });
    }).catch(function () { /* diagram stays as code */ });
  }

  var plots = $all("pre > code.language-plotly");
  if (plots.length) {
    loadScript("https://cdn.plot.ly/plotly-2.35.2.min.js").addEventListener("load", function () {
      plots.forEach(function (code) {
        try {
          var spec = JSON.parse(code.textContent);
          var holder = document.createElement("div");
          code.parentNode.parentNode.insertBefore(holder, code.parentNode.nextSibling);
          code.parentNode.hidden = true;
          window.Plotly.newPlot(holder, spec.data, spec.layout || {}, { responsive: true });
        } catch (err) { /* leave the JSON visible */ }
      });
    });
  }
})();
