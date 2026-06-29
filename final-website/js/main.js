/* ============================================================
   გაზქურის მონიტორინგის სისტემა — interactions
   ============================================================ */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- NAV ---------- */
  var nav = document.getElementById('nav');
  var burger = document.getElementById('burger');
  var links = document.querySelector('.nav__links');

  window.addEventListener('scroll', function () {
    nav.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });

  burger.addEventListener('click', function () {
    burger.classList.toggle('open');
    links.classList.toggle('open');
  });
  links.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      burger.classList.remove('open');
      links.classList.remove('open');
    }
  });

  /* ---------- SCROLL REVEAL ---------- */
  var revealSel = '.section__head,.bigstat,.flow__step,.innovation,.comp,.bom,' +
    '.table--matrix,.state,.logic-card,.code,.testcard,.scenario,.gallery__item,' +
    '.demo,.guide,.member,.future';
  var revealEls = document.querySelectorAll(revealSel);
  if ('IntersectionObserver' in window && !reduced) {
    revealEls.forEach(function (el, i) {
      el.setAttribute('data-reveal', '');
      el.style.transitionDelay = (Math.min(i % 4, 3) * 70) + 'ms';
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- COUNT-UP STATS ---------- */
  var counters = document.querySelectorAll('.stat__num[data-count]');
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = 1300, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          reduced
            ? en.target.textContent = en.target.getAttribute('data-count') + (en.target.getAttribute('data-suffix') || '')
            : animateCount(en.target);
          co.unobserve(en.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { co.observe(c); });
  }

  /* ---------- HERO THERMAL CANVAS ---------- */
  var canvas = document.getElementById('thermal');
  if (canvas && !reduced) {
    var ctx = canvas.getContext('2d');
    var COLS = 32, ROWS = 24, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var cw, ch, cellW, cellH;

    // iron colormap stops
    var stops = [
      [0.00, 14, 12, 40], [0.18, 50, 20, 90], [0.38, 130, 25, 130],
      [0.55, 200, 40, 70], [0.72, 255, 110, 0], [0.88, 255, 180, 20], [1.00, 255, 235, 130]
    ];
    function iron(v) {
      v = Math.max(0, Math.min(1, v));
      for (var i = 1; i < stops.length; i++) {
        if (v <= stops[i][0]) {
          var a = stops[i - 1], b = stops[i];
          var t = (v - a[0]) / (b[0] - a[0]);
          return 'rgb(' + Math.round(a[1] + (b[1] - a[1]) * t) + ',' +
            Math.round(a[2] + (b[2] - a[2]) * t) + ',' +
            Math.round(a[3] + (b[3] - a[3]) * t) + ')';
        }
      }
      return 'rgb(255,235,130)';
    }

    function resize() {
      cw = canvas.clientWidth; ch = canvas.clientHeight;
      canvas.width = cw * dpr; canvas.height = ch * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cellW = cw / COLS; cellH = ch / ROWS;
    }
    resize();
    window.addEventListener('resize', resize);

    // animated heat source — simulates ignite -> burn -> extinguish cycle
    var t = 0;
    // two hotspots (two burners) with phase-shifted intensity cycles
    var sources = [
      { x: COLS * 0.34, y: ROWS * 0.46, phase: 0.0, spread: 5.5 },
      { x: COLS * 0.66, y: ROWS * 0.56, phase: 0.5, spread: 4.5 }
    ];
    function cycleIntensity(p) {
      // 0..1 sawtooth-ish: rise, hold, drop
      var x = (p % 1);
      if (x < 0.25) return x / 0.25 * 0.9 + 0.1;          // ignite
      if (x < 0.55) return 1.0;                            // burning
      if (x < 0.75) return 1 - (x - 0.55) / 0.20 * 0.85;   // cooling
      return 0.15 - Math.min(0.15, (x - 0.75) * 0.4);      // idle/cold
    }

    function draw() {
      t += 0.0016;
      ctx.clearRect(0, 0, cw, ch);
      for (var r = 0; r < ROWS; r++) {
        for (var c = 0; c < COLS; c++) {
          var v = 0.04 + 0.03 * Math.sin((c + r) * 0.6 + t * 8); // ambient noise
          for (var s = 0; s < sources.length; s++) {
            var src = sources[s];
            var inten = cycleIntensity(t * 0.12 + src.phase);
            var dx = c - src.x, dy = r - src.y;
            var d2 = dx * dx + dy * dy;
            v += inten * Math.exp(-d2 / (src.spread * src.spread)) * 1.05;
          }
          v += (Math.random() - 0.5) * 0.015; // sensor noise
          ctx.fillStyle = iron(v);
          ctx.fillRect(c * cellW, r * cellH, cellW + 1, cellH + 1);
        }
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ---------- SCENARIO TEMPERATURE CHART (SVG) ---------- */
  var chartEl = document.getElementById('chart');
  if (chartEl) {
    // representative curve from Appendix-B scenario (gas burner)
    var data = [
      { x: 0, y: 35 }, { x: 1, y: 36 }, { x: 2, y: 41 },
      { x: 3, y: 80, mark: 'fire', label: 'ცეცხლის ანთება' },
      { x: 4, y: 95 }, { x: 5, y: 120 }, { x: 6, y: 135, label: 'პიკი 135°C' },
      { x: 7, y: 128 }, { x: 8, y: 104 }, { x: 9, y: 78 }, { x: 10, y: 62 },
      { x: 11, y: 54.8, mark: 'off', label: '<55°C' },
      { x: 12, y: 54 },
      { x: 13, y: 53.7, mark: 'alarm', label: 'განგაში' }
    ];
    var Tmin = 30, Tmax = 145, Xmax = 13;

    function buildChart() {
      var W = chartEl.clientWidth, H = chartEl.clientHeight;
      var padL = 46, padR = 16, padT = 16, padB = 28;
      var iw = W - padL - padR, ih = H - padT - padB;
      function px(x) { return padL + (x / Xmax) * iw; }
      function py(y) { return padT + (1 - (y - Tmin) / (Tmax - Tmin)) * ih; }

      var svgNS = 'http://www.w3.org/2000/svg';
      var svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%');

      // defs gradient
      var defs = document.createElementNS(svgNS, 'defs');
      defs.innerHTML =
        '<linearGradient id="lg" x1="0" y1="1" x2="0" y2="0">' +
        '<stop offset="0" stop-color="#7dd3fc"/><stop offset="0.45" stop-color="#e63946"/>' +
        '<stop offset="0.8" stop-color="#ff7b00"/><stop offset="1" stop-color="#ffe169"/></linearGradient>' +
        '<linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="rgba(255,123,0,0.28)"/><stop offset="1" stop-color="rgba(255,123,0,0)"/></linearGradient>';
      svg.appendChild(defs);

      function line(x1, y1, x2, y2, cls) {
        var l = document.createElementNS(svgNS, 'line');
        l.setAttribute('x1', x1); l.setAttribute('y1', y1);
        l.setAttribute('x2', x2); l.setAttribute('y2', y2);
        l.setAttribute('class', cls); svg.appendChild(l);
      }
      function text(x, y, str, cls, anchor) {
        var tx = document.createElementNS(svgNS, 'text');
        tx.setAttribute('x', x); tx.setAttribute('y', y);
        tx.setAttribute('class', cls); tx.setAttribute('text-anchor', anchor || 'start');
        tx.textContent = str; svg.appendChild(tx);
      }

      // Y grid + labels
      [40, 55, 80, 120].forEach(function (v) {
        line(padL, py(v), W - padR, py(v), v === 80 || v === 55 ? 'gl gl--th' : 'gl');
        text(padL - 8, py(v) + 4, v + '°', 'yl', 'end');
      });
      // threshold labels
      text(W - padR, py(80) - 6, 'ანთება 80°C', 'thl thl--fire', 'end');
      text(W - padR, py(55) - 6, 'ჩაქრობა 55°C', 'thl thl--off', 'end');

      // build path
      var d = '', fillD = '';
      data.forEach(function (p, i) {
        var X = px(p.x), Y = py(p.y);
        d += (i === 0 ? 'M' : 'L') + X + ' ' + Y + ' ';
      });
      fillD = d + 'L' + px(Xmax) + ' ' + py(Tmin) + ' L' + px(0) + ' ' + py(Tmin) + ' Z';

      var fp = document.createElementNS(svgNS, 'path');
      fp.setAttribute('d', fillD); fp.setAttribute('fill', 'url(#fill)'); svg.appendChild(fp);

      var path = document.createElementNS(svgNS, 'path');
      path.setAttribute('d', d.trim());
      path.setAttribute('fill', 'none'); path.setAttribute('stroke', 'url(#lg)');
      path.setAttribute('stroke-width', '3'); path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-linejoin', 'round');
      svg.appendChild(path);

      // animate stroke draw
      if (!reduced) {
        var len = path.getTotalLength();
        path.style.strokeDasharray = len; path.style.strokeDashoffset = len;
        path.style.transition = 'stroke-dashoffset 1.8s ease';
        requestAnimationFrame(function () { path.style.strokeDashoffset = '0'; });
      }

      // markers
      data.forEach(function (p) {
        if (!p.mark) return;
        var X = px(p.x), Y = py(p.y);
        var col = p.mark === 'fire' ? '#ff7b00' : p.mark === 'off' ? '#7dd3fc' : '#e63946';
        var c = document.createElementNS(svgNS, 'circle');
        c.setAttribute('cx', X); c.setAttribute('cy', Y); c.setAttribute('r', 6);
        c.setAttribute('fill', col); c.setAttribute('stroke', '#0a0b12'); c.setAttribute('stroke-width', '2.5');
        svg.appendChild(c);
        var up = p.mark === 'alarm';
        text(X, up ? Y + 22 : Y - 14, p.label, 'ml', X > W * 0.7 ? 'end' : 'middle');
      });

      chartEl.innerHTML = '';
      chartEl.appendChild(svg);
    }

    var built = false;
    if ('IntersectionObserver' in window) {
      var so = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && !built) { built = true; buildChart(); }
        });
      }, { threshold: 0.3 });
      so.observe(chartEl);
    } else { buildChart(); }

    var rt;
    window.addEventListener('resize', function () {
      if (!built) return;
      clearTimeout(rt); rt = setTimeout(buildChart, 200);
    });
  }

  /* ---------- ACTIVE NAV HIGHLIGHT ---------- */
  var sections = document.querySelectorAll('section[id]');
  var navMap = {};
  document.querySelectorAll('.nav__links a').forEach(function (a) {
    navMap[a.getAttribute('href').slice(1)] = a;
  });
  if ('IntersectionObserver' in window) {
    var ao = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var a = navMap[en.target.id];
        if (a && en.isIntersecting) {
          Object.keys(navMap).forEach(function (k) { navMap[k].style.color = ''; });
          a.style.color = 'var(--text)';
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(function (s) { ao.observe(s); });
  }
})();
