/* ==========================================================================
   Homepage hero: a building "scanned" into a digital twin.
   A LiDAR-style point cloud is captured by a rising scan plane, the BIM
   wireframe resolves, then IoT sensors come online. Plain canvas 2D.
   Pauses off-screen; draws one static frame for reduced-motion users.
   ========================================================================== */
(function () {
  "use strict";

  var canvas = document.getElementById("twin-canvas");
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext("2d");
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hudScan = document.querySelector('[data-hud="scan"]');
  var hudPoints = document.querySelector('[data-hud="points"]');

  /* Seeded random: the same "scan" on every visit */
  var seed = 20240611;
  function rand() {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  }

  /* Massing model, units ~ storeys: [x0, x1, z0, z1, y0, y1], y is up */
  var BOXES = [
    [-1.9, 1.9, -1.25, 1.25, 0, 0.9],     // podium
    [-1.35, 0.15, -0.85, 0.75, 0.9, 4.2], // main tower
    [0.45, 1.45, -0.95, 0.35, 0.9, 2.6],  // second tower
    [-0.95, -0.3, -0.45, 0.2, 4.2, 4.6]   // rooftop plant
  ];
  var TOP = 4.6;
  var MID_Y = 2.1;
  var FLOOR = 0.33;

  function insideOther(x, y, z, skip) {
    for (var i = 0; i < BOXES.length; i++) {
      if (i === skip) continue;
      var b = BOXES[i];
      var e = 0.004;
      if (x > b[0] + e && x < b[1] - e && z > b[2] + e && z < b[3] - e && y > b[4] - e && y < b[5] + e) return true;
    }
    return false;
  }

  /* ---- Point cloud: horizontal scan lines on the facades, scatter on roofs ---- */
  var points = [];

  function isWindow(u, y, box, isPodium) {
    var v = ((y - box[4]) % FLOOR) / FLOOR;
    var c = (u % 0.3) / 0.3;
    if (isPodium) return v > 0.12 && v < 0.88 && c > 0.08 && c < 0.92 && y < box[5] - 0.05;
    return v > 0.28 && v < 0.82 && c > 0.22 && c < 0.78;
  }

  BOXES.forEach(function (b, bi) {
    var isPodium = bi === 0;
    var faces = [
      { len: b[3] - b[2], at: function (u) { return [b[0], b[2] + u]; } }, // west
      { len: b[3] - b[2], at: function (u) { return [b[1], b[2] + u]; } }, // east
      { len: b[1] - b[0], at: function (u) { return [b[0] + u, b[2]]; } }, // north
      { len: b[1] - b[0], at: function (u) { return [b[0] + u, b[3]]; } }  // south
    ];
    faces.forEach(function (f) {
      for (var y = b[4] + 0.05; y < b[5]; y += 0.1) {
        var count = Math.round(f.len * 7);
        for (var k = 0; k < count; k++) {
          var u = rand() * f.len;
          var yy = y + (rand() - 0.5) * 0.024;
          if (bi !== 3 && isWindow(u, yy, b, isPodium) && rand() < 0.85) continue;
          var xz = f.at(u);
          var n = (rand() - 0.5) * 0.02;
          if (insideOther(xz[0], yy, xz[1], bi)) continue;
          points.push({ x: xz[0] + n, y: yy, z: xz[1] + n });
        }
      }
    });
    var roof = Math.round((b[1] - b[0]) * (b[3] - b[2]) * 14);
    for (var r = 0; r < roof; r++) {
      var rx = b[0] + rand() * (b[1] - b[0]);
      var rz = b[2] + rand() * (b[3] - b[2]);
      if (insideOther(rx, b[5], rz, bi)) continue;
      points.push({ x: rx, y: b[5], z: rz });
    }
  });

  /* ---- Wireframe: box edges + floor outlines ---- */
  var edges = [];
  var floors = [];

  function loop(target, b, y) {
    target.push([b[0], y, b[2], b[1], y, b[2]]);
    target.push([b[1], y, b[2], b[1], y, b[3]]);
    target.push([b[1], y, b[3], b[0], y, b[3]]);
    target.push([b[0], y, b[3], b[0], y, b[2]]);
  }

  BOXES.forEach(function (b, bi) {
    loop(edges, b, b[4]);
    loop(edges, b, b[5]);
    edges.push([b[0], b[4], b[2], b[0], b[5], b[2]]);
    edges.push([b[1], b[4], b[2], b[1], b[5], b[2]]);
    edges.push([b[1], b[4], b[3], b[1], b[5], b[3]]);
    edges.push([b[0], b[4], b[3], b[0], b[5], b[3]]);
    if (bi === 3) return;
    for (var y = b[4] + FLOOR; y < b[5] - 0.05; y += FLOOR) loop(floors, b, y);
  });

  /* ---- Ground grid (split into short pieces so it can fade radially) ---- */
  var grid = [];
  var G = 3.2;
  for (var g = -G; g <= G + 0.001; g += 0.4) {
    for (var s = -G; s < G - 0.001; s += 0.4) {
      grid.push([g, 0, s, g, 0, s + 0.4]);
      grid.push([s, 0, g, s + 0.4, 0, g]);
    }
  }

  /* ---- IoT sensors that light up once the twin is complete ---- */
  var sensors = [
    { x: -1.35, y: 3.25, z: 0.1, p: 0 },
    { x: 0.15, y: 2.05, z: -0.35, p: 0.35 },
    { x: 1.45, y: 1.75, z: -0.3, p: 0.7 },
    { x: -0.62, y: 4.6, z: -0.12, p: 0.15 },
    { x: 0.9, y: 0.5, z: 1.25, p: 0.55 },
    { x: -1.9, y: 0.45, z: -0.5, p: 0.85 }
  ];

  /* ---- Camera ---- */
  var W = 0;
  var H = 0;
  var dpr = 1;
  var focal = 1;
  var yaw = 0.7;
  var pitch = 0.42;
  var yawOffset = 0;
  var pitchOffset = 0;
  var targetYaw = 0;
  var targetPitch = 0;
  var CAM = 12;

  var cosY = 1, sinY = 0, cosP = 1, sinP = 0;
  function setCamera() {
    cosY = Math.cos(yaw + yawOffset); sinY = Math.sin(yaw + yawOffset);
    cosP = Math.cos(pitch + pitchOffset); sinP = Math.sin(pitch + pitchOffset);
  }

  var out = [0, 0, 0, 0];
  function project(x, y, z) {
    var x1 = x * cosY - z * sinY;
    var z1 = x * sinY + z * cosY;
    var y1 = y - MID_Y;
    var y2 = y1 * cosP - z1 * sinP;
    var z2 = y1 * sinP + z1 * cosP;
    var sc = focal / (CAM - z2);
    out[0] = W / 2 + x1 * sc;
    out[1] = H * 0.5 - y2 * sc;
    out[2] = z2;
    out[3] = sc;
    return out;
  }

  function resize() {
    var rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(1, Math.round(rect.width * dpr));
    H = Math.max(1, Math.round(rect.height * dpr));
    canvas.width = W;
    canvas.height = H;
    focal = Math.min(W, H) * 1.36;
  }

  function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  /* ---- Timeline ---- */
  var CYCLE = 12;
  var SCAN = 6.5;
  var HOLD = 4.5;

  function stateAt(t) {
    var c = t % CYCLE;
    if (c < SCAN) {
      var k = easeInOut(c / SCAN);
      return { scanY: -0.15 + k * (TOP + 0.35), resolved: 0, fade: 0, progress: k };
    }
    if (c < SCAN + HOLD) {
      return { scanY: TOP + 1, resolved: clamp01((c - SCAN) / 0.9), fade: 0, progress: 1 };
    }
    var f = clamp01((c - SCAN - HOLD) / (CYCLE - SCAN - HOLD));
    return { scanY: TOP + 1, resolved: 1 - f, fade: f, progress: 1 };
  }

  /* 3 height bands (teal -> cyan -> blue) x 5 alpha levels; slot 0 = not yet scanned */
  var buckets = [];
  for (var bi2 = 0; bi2 < 15; bi2++) buckets.push([]);
  var BAND_RGB = ["rgba(94, 234, 212, ", "rgba(103, 232, 249, ", "rgba(125, 211, 252, "];
  var LEVEL_ALPHA = [0, 0.38, 0.55, 0.72, 0.92];
  var lastHud = 0;

  function strokeSegments(list, style, width, filter) {
    ctx.beginPath();
    for (var i = 0; i < list.length; i++) {
      var e = list[i];
      if (filter && !filter(e)) continue;
      var a = project(e[0], e[1], e[2]);
      var ax = a[0], ay = a[1];
      var b = project(e[3], e[4], e[5]);
      ctx.moveTo(ax, ay);
      ctx.lineTo(b[0], b[1]);
    }
    ctx.strokeStyle = style;
    ctx.lineWidth = width;
    ctx.stroke();
  }

  function draw(t) {
    var st = stateAt(t);
    setCamera();
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = "round";
    ctx.globalCompositeOperation = "source-over";

    /* soft glow on the ground under the building */
    var base = project(0, 0, 0);
    var glowR = Math.min(W, H) * 0.42;
    var halo = ctx.createRadialGradient(base[0], base[1], 0, base[0], base[1], glowR);
    halo.addColorStop(0, "rgba(45, 212, 191, " + (0.1 + 0.06 * st.resolved).toFixed(3) + ")");
    halo.addColorStop(1, "rgba(45, 212, 191, 0)");
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, W, H);

    /* ground grid, fading towards the edges */
    for (var ring = 0; ring < 3; ring++) {
      var r0 = ring * 1.1;
      var r1 = r0 + 1.1;
      strokeSegments(grid, "rgba(148, 163, 184, " + (0.13 - ring * 0.04).toFixed(3) + ")", dpr, function (e) {
        var mx = (e[0] + e[3]) / 2;
        var mz = (e[2] + e[5]) / 2;
        var d = Math.sqrt(mx * mx + mz * mz);
        return d >= r0 && d < r1;
      });
    }

    /* wireframe: faint everywhere, bright where the scan has passed */
    var faint = "rgba(148, 163, 184, " + (0.13 + 0.05 * st.resolved).toFixed(3) + ")";
    strokeSegments(edges, faint, dpr);

    ctx.globalCompositeOperation = "lighter";
    var bright = "rgba(94, 234, 212, " + (0.42 + 0.33 * st.resolved).toFixed(3) + ")";
    ctx.beginPath();
    for (var i = 0; i < edges.length; i++) {
      var e = edges[i];
      var ya = e[1], yb = e[4];
      if (Math.min(ya, yb) > st.scanY) continue;
      var tEnd = 1;
      if (Math.max(ya, yb) > st.scanY && yb !== ya) tEnd = (st.scanY - ya) / (yb - ya);
      var pa = project(e[0], ya, e[2]);
      var ax = pa[0], ay = pa[1];
      var pb = project(e[0] + (e[3] - e[0]) * tEnd, ya + (yb - ya) * tEnd, e[2] + (e[5] - e[2]) * tEnd);
      ctx.moveTo(ax, ay);
      ctx.lineTo(pb[0], pb[1]);
    }
    ctx.strokeStyle = bright;
    ctx.lineWidth = 1.2 * dpr;
    ctx.stroke();

    /* floor outlines appear below the scan plane */
    strokeSegments(floors, "rgba(94, 234, 212, " + (0.1 + 0.1 * st.resolved).toFixed(3) + ")", dpr, function (f) {
      return f[1] <= st.scanY;
    });

    /* points, batched by colour band (height) and alpha level (depth) */
    for (var bIdx = 0; bIdx < buckets.length; bIdx++) buckets[bIdx].length = 0;
    var glow = [];
    var captured = 0;
    var capturedAlpha = 1 - 0.85 * st.fade;
    for (var p = 0; p < points.length; p++) {
      var pt = points[p];
      var pr = project(pt.x, pt.y, pt.z);
      var size = Math.max(1.2 * dpr, pr[3] / focal * 12 * 2.1 * dpr);
      var depth = clamp01((pr[2] + 3) / 6);
      if (pt.y <= st.scanY) {
        captured++;
        if (st.progress < 1 && st.scanY - pt.y < 0.14) {
          glow.push(pr[0], pr[1], size * 1.6);
        } else {
          var level = 1 + Math.min(3, Math.floor((0.3 + 0.7 * depth) * capturedAlpha * 4));
          var band = pt.y < 1.4 ? 0 : pt.y < 3 ? 1 : 2;
          buckets[band * 5 + level].push(pr[0], pr[1], size);
        }
      } else {
        buckets[0].push(pr[0], pr[1], size * 0.8);
      }
    }
    for (var l = 0; l < buckets.length; l++) {
      var arr = buckets[l];
      if (!arr.length) continue;
      var lvl = l % 5;
      ctx.fillStyle = l === 0 ? "rgba(148, 163, 184, 0.1)" : BAND_RGB[Math.floor(l / 5)] + LEVEL_ALPHA[lvl] + ")";
      ctx.beginPath();
      for (var q = 0; q < arr.length; q += 3) ctx.rect(arr[q] - arr[q + 2] / 2, arr[q + 1] - arr[q + 2] / 2, arr[q + 2], arr[q + 2]);
      ctx.fill();
    }
    if (glow.length) {
      ctx.fillStyle = "rgba(186, 250, 255, 0.95)";
      ctx.beginPath();
      for (var gq = 0; gq < glow.length; gq += 3) ctx.rect(glow[gq] - glow[gq + 2] / 2, glow[gq + 1] - glow[gq + 2] / 2, glow[gq + 2], glow[gq + 2]);
      ctx.fill();
    }

    /* the scan plane */
    if (st.progress < 1) {
      var pad = 0.45;
      var c1 = project(-1.9 - pad, st.scanY, -1.25 - pad).slice();
      var c2 = project(1.9 + pad, st.scanY, -1.25 - pad).slice();
      var c3 = project(1.9 + pad, st.scanY, 1.25 + pad).slice();
      var c4 = project(-1.9 - pad, st.scanY, 1.25 + pad).slice();
      ctx.beginPath();
      ctx.moveTo(c1[0], c1[1]);
      ctx.lineTo(c2[0], c2[1]);
      ctx.lineTo(c3[0], c3[1]);
      ctx.lineTo(c4[0], c4[1]);
      ctx.closePath();
      ctx.fillStyle = "rgba(45, 212, 191, 0.07)";
      ctx.fill();
      ctx.strokeStyle = "rgba(94, 234, 212, 0.7)";
      ctx.lineWidth = 1.2 * dpr;
      ctx.stroke();
    }

    /* sensors: pulsing rings once the twin has resolved */
    if (st.resolved > 0) {
      ctx.globalCompositeOperation = "lighter";
      for (var si = 0; si < sensors.length; si++) {
        var sn = sensors[si];
        var sp = project(sn.x, sn.y, sn.z);
        var ph = (t * 0.7 + sn.p) % 1;
        ctx.beginPath();
        ctx.arc(sp[0], sp[1], (4 + ph * 18) * dpr, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(96, 165, 250, " + ((1 - ph) * 0.8 * st.resolved).toFixed(3) + ")";
        ctx.lineWidth = 1.3 * dpr;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(sp[0], sp[1], 2.6 * dpr, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(191, 219, 254, " + st.resolved.toFixed(3) + ")";
        ctx.fill();
      }
    }
    ctx.globalCompositeOperation = "source-over";

    /* HUD, throttled */
    var now = (window.performance && performance.now()) || Date.now();
    if (now - lastHud > 120 || reduceMotion) {
      lastHud = now;
      if (hudScan) hudScan.textContent = Math.round(st.progress * 100) + "%";
      if (hudPoints) hudPoints.textContent = captured.toLocaleString("en-GB");
    }
  }

  /* ---- Loop control ---- */
  var running = false;
  var visible = true;
  var start = null;
  var raf = 0;

  function tick(ts) {
    if (!running) return;
    if (start === null) start = ts;
    var t = (ts - start) / 1000;
    yaw = 0.7 + t * 0.14;
    yawOffset += (targetYaw - yawOffset) * 0.06;
    pitchOffset += (targetPitch - pitchOffset) * 0.06;
    draw(t);
    raf = window.requestAnimationFrame(tick);
  }

  function play() {
    if (running || reduceMotion || !visible || document.hidden) return;
    running = true;
    raf = window.requestAnimationFrame(tick);
  }

  function pause() {
    running = false;
    window.cancelAnimationFrame(raf);
  }

  function staticFrame() {
    yaw = 0.95;
    draw(SCAN + HOLD * 0.5);
  }

  resize();
  if (reduceMotion) staticFrame(); else play();

  if ("ResizeObserver" in window) {
    new ResizeObserver(function () { resize(); if (!running) staticFrame(); }).observe(canvas);
  } else {
    window.addEventListener("resize", function () { resize(); if (!running) staticFrame(); });
  }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) play(); else pause();
    }).observe(canvas);
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) pause(); else play();
  });

  var hero = canvas.closest(".hero") || document;
  hero.addEventListener("pointermove", function (e) {
    targetYaw = (e.clientX / window.innerWidth - 0.5) * 0.7;
    targetPitch = (e.clientY / window.innerHeight - 0.5) * 0.14;
  });
  hero.addEventListener("pointerleave", function () { targetYaw = 0; targetPitch = 0; });
})();
