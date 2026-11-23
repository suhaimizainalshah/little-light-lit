/* Little Light Lit Animate: pen paths, so the drawing hand follows real shapes.
   1. record(): runs the vector art against a stand-in canvas and keeps every line it would draw.
   2. text(): lays out words in a single-line pen font (EMS fonts, SIL Open Font License).
   3. traceSVG(): follows the paths of an imported SVG illustration, in document order. */
(() => {
  const SEG = 14;
  function poly() { return []; }
  /* ---------- 1. Recorder: a minimal canvas that keeps paths instead of pixels ---------- */
  function recorder() {
    let m = [1, 0, 0, 1, 0, 0]; const stack = [], out = []; let subs = [], curSub = null, committed = false, cx = 0, cy = 0, sx = 0, sy = 0;
    const T = (x, y) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
    const add = (x, y) => { if (!curSub) { curSub = []; subs.push(curSub); } const [a, b] = T(x, y); curSub.push(a, b); cx = x; cy = y; committed = false; };
    const R = {
      isRecorder: true, lineWidth: 1, strokeStyle: "", fillStyle: "", lineCap: "", lineJoin: "", globalAlpha: 1, globalCompositeOperation: "", filter: "",
      save() { stack.push(m.slice()); }, restore() { if (stack.length) m = stack.pop(); },
      translate(x, y) { m = [m[0], m[1], m[2], m[3], m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]]; },
      scale(a, b) { m = [m[0] * a, m[1] * a, m[2] * b, m[3] * b, m[4], m[5]]; },
      rotate(r) { const c = Math.cos(r), s = Math.sin(r); m = [m[0] * c + m[2] * s, m[1] * c + m[3] * s, -m[0] * s + m[2] * c, -m[1] * s + m[3] * c, m[4], m[5]]; },
      beginPath() { subs = []; curSub = null; committed = false; },
      moveTo(x, y) { curSub = null; add(x, y); sx = x; sy = y; },
      lineTo(x, y) { if (!curSub) { add(x, y); sx = x; sy = y; } else add(x, y); },
      closePath() { if (curSub && curSub.length >= 4) { curSub.push(curSub[0], curSub[1]); } cx = sx; cy = sy; curSub = null; },
      quadraticCurveTo(qx, qy, x, y) { const x0 = cx, y0 = cy; for (let i = 1; i <= SEG; i++) { const t = i / SEG, u = 1 - t; add(u * u * x0 + 2 * u * t * qx + t * t * x, u * u * y0 + 2 * u * t * qy + t * t * y); } },
      bezierCurveTo(a, b, c2, d, x, y) { const x0 = cx, y0 = cy; for (let i = 1; i <= SEG; i++) { const t = i / SEG, u = 1 - t; add(u * u * u * x0 + 3 * u * u * t * a + 3 * u * t * t * c2 + t * t * t * x, u * u * u * y0 + 3 * u * u * t * b + 3 * u * t * t * d + t * t * t * y); } },
      ellipse(x, y, rx, ry, rot, a0, a1, ccw) {
        let span = a1 - a0; if (!ccw && span < 0) span += Math.PI * 2; if (ccw && span > 0) span -= Math.PI * 2; if (Math.abs(a1 - a0) >= Math.PI * 2 - 1e-6) span = ccw ? -Math.PI * 2 : Math.PI * 2;
        const n = Math.max(8, Math.ceil(Math.abs(span) / (Math.PI * 2) * 40)), c = Math.cos(rot), s = Math.sin(rot);
        for (let i = 0; i <= n; i++) { const a = a0 + span * i / n, px = Math.cos(a) * rx, py = Math.sin(a) * ry; const X = x + px * c - py * s, Y = y + px * s + py * c; if (i === 0 && !curSub) { add(X, Y); sx = X; sy = Y; } else add(X, Y); }
      },
      arc(x, y, r, a0, a1, ccw) { R.ellipse(x, y, r, r, 0, a0, a1, ccw); },
      rect(x, y, w, h) { R.moveTo(x, y); R.lineTo(x + w, y); R.lineTo(x + w, y + h); R.lineTo(x, y + h); R.closePath(); },
      roundRect(x, y, w, h, r = 0) {
        r = Math.min(Array.isArray(r) ? r[0] : r, Math.abs(w) / 2, Math.abs(h) / 2); if (!r) return R.rect(x, y, w, h);
        R.moveTo(x + r, y); R.lineTo(x + w - r, y); R.ellipse(x + w - r, y + r, r, r, 0, -Math.PI / 2, 0); R.lineTo(x + w, y + h - r); R.ellipse(x + w - r, y + h - r, r, r, 0, 0, Math.PI / 2);
        R.lineTo(x + r, y + h); R.ellipse(x + r, y + h - r, r, r, 0, Math.PI / 2, Math.PI); R.lineTo(x, y + r); R.ellipse(x + r, y + r, r, r, 0, Math.PI, Math.PI * 1.5); R.closePath();
      },
      stroke() { commit(); }, fill() { commit(); }, clip() {}, fillRect() {}, strokeRect() {}, clearRect() {}, fillText() {}, strokeText() {}, setLineDash() {}, drawImage() {},
      createLinearGradient: () => ({ addColorStop() {} }), createRadialGradient: () => ({ addColorStop() {} }), measureText: () => ({ width: 0 }),
      result: () => out,
    };
    function commit() { if (committed) return; for (const p of subs) if (p.length >= 4) out.push(p.slice()); committed = true; }
    return R;
  }
  function record(draw) { const r = recorder(); draw(r); return finish(r.result()); }

  /* ---------- helpers ---------- */
  function finish(polys) { let len = 0; const ls = polys.map(p => { let l = 0; for (let i = 2; i < p.length; i += 2) l += Math.hypot(p[i] - p[i - 2], p[i + 1] - p[i - 1]); len += l; return l; }); let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity; for (const p of polys) for (let i = 0; i < p.length; i += 2) { x0 = Math.min(x0, p[i]); x1 = Math.max(x1, p[i]); y0 = Math.min(y0, p[i + 1]); y1 = Math.max(y1, p[i + 1]); } return { polys, lens: ls, len, box: polys.length ? { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } : { x: 0, y: 0, w: 1, h: 1 } }; }
  /* Draw the first `upto` units of length; returns the pen tip in local coordinates */
  function drawUpTo(c, S, upto) {
    let left = upto, tip = null;
    for (let k = 0; k < S.polys.length && left > 0; k++) {
      const p = S.polys[k]; c.beginPath(); c.moveTo(p[0], p[1]); let x = p[0], y = p[1];
      for (let i = 2; i < p.length; i += 2) { const d = Math.hypot(p[i] - x, p[i + 1] - y); if (d >= left) { const t = left / d; x += (p[i] - x) * t; y += (p[i + 1] - y) * t; c.lineTo(x, y); left = 0; break; } left -= d; x = p[i]; y = p[i + 1]; c.lineTo(x, y); }
      c.stroke(); tip = [x, y];
    }
    return tip;
  }
  /* ---------- SVG path data (absolute and relative) ---------- */
  function parsePath(d, k = 1, ox = 0, oy = 0, flipY = false) {
    const polys = []; let cur = null, x = 0, y = 0, sx = 0, sy = 0;
    const P = (X, Y) => { cur.push(ox + X * k, oy + (flipY ? -Y : Y) * k); };
    const toks = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e[-+]?\d+)?/g) || []; let i = 0, cmd = "";
    const num = () => +toks[i++];
    while (i < toks.length) {
      if (/[a-zA-Z]/.test(toks[i])) cmd = toks[i++]; const rel = cmd === cmd.toLowerCase(), C = cmd.toUpperCase();
      if (C === "Z") { if (cur && cur.length >= 2) cur.push(cur[0], cur[1]); x = sx; y = sy; cur = null; continue; }
      if (C === "M") { let nx = num(), ny = num(); if (rel) { nx += x; ny += y; } x = sx = nx; y = sy = ny; cur = []; polys.push(cur); P(x, y); cmd = rel ? "l" : "L"; continue; }
      if (!cur) { cur = []; polys.push(cur); P(x, y); }
      if (C === "L") { let nx = num(), ny = num(); if (rel) { nx += x; ny += y; } x = nx; y = ny; P(x, y); }
      else if (C === "H") { let nx = num(); if (rel) nx += x; x = nx; P(x, y); }
      else if (C === "V") { let ny = num(); if (rel) ny += y; y = ny; P(x, y); }
      else if (C === "C" || C === "Q") { const n = C === "C" ? 6 : 4, v = []; for (let j = 0; j < n; j++) v.push(num()); if (rel) for (let j = 0; j < n; j += 2) { v[j] += x; v[j + 1] += y; } for (let s = 1; s <= SEG; s++) { const t = s / SEG, u = 1 - t; let X, Y; if (C === "C") { X = u * u * u * x + 3 * u * u * t * v[0] + 3 * u * t * t * v[2] + t * t * t * v[4]; Y = u * u * u * y + 3 * u * u * t * v[1] + 3 * u * t * t * v[3] + t * t * t * v[5]; } else { X = u * u * x + 2 * u * t * v[0] + t * t * v[2]; Y = u * u * y + 2 * u * t * v[1] + t * t * v[3]; } P(X, Y); } x = v[n - 2]; y = v[n - 1]; }
      else { const skip = { S: 4, T: 2, A: 7 }[C] || 2, v = []; for (let j = 0; j < skip; j++) v.push(num()); let nx = v[skip - 2], ny = v[skip - 1]; if (rel) { nx += x; ny += y; } x = nx; y = ny; P(x, y); }
    }
    return polys.filter(p => p.length >= 4);
  }
  /* ---------- 2. Single-line pen fonts ---------- */
  const FONT_FILES = { Script: "script", Casual: "casual", Print: "print" }, loading = {};
  function loadFont(name) { const F = window.LightLitStrokeFonts?.[name]; if (F) return Promise.resolve(F); return loading[name] ||= new Promise((res, rej) => { const s = document.createElement("script"); s.src = `vendor/strokefonts/${FONT_FILES[name]}.js`; s.onload = () => res(window.LightLitStrokeFonts[name]); s.onerror = rej; document.head.appendChild(s); }); }
  function text(str, fontName, fs, align = "center", lineH = 1.3) {
    const F = window.LightLitStrokeFonts?.[fontName]; if (!F) { loadFont(fontName); return null; }
    const k = fs * 1.25 / F.upm, lines = String(str).split("\n"), lh = fs * lineH, widths = lines.map(l => [...l].reduce((w, ch) => w + (F.glyphs[ch] || F.glyphs[" "] || [378])[0] * k, 0)), W = Math.max(...widths, fs * .5), H = lines.length * lh, polys = [];
    lines.forEach((l, li) => { let x = align === "left" ? -W / 2 : align === "right" ? W / 2 - widths[li] : -widths[li] / 2; const base = -H / 2 + lh * (li + .5) + F.cap * k / 2; for (const ch of l) { const g = F.glyphs[ch] || F.glyphs[" "] || [378, ""]; if (g[1]) polys.push(...parsePath(g[1], k, x, base, true)); x += g[0] * k; } });
    const S = finish(polys); S.box = { x: -W / 2, y: -H / 2, w: W, h: H }; return S;
  }
  /* ---------- 3. Imported SVG illustrations ---------- */
  function cleanSVG(src) {
    const doc = new DOMParser().parseFromString(src, "image/svg+xml"), root = doc.documentElement; if (!root || root.nodeName.toLowerCase() !== "svg" || doc.querySelector("parsererror")) return null;
    root.querySelectorAll("script, foreignObject, iframe").forEach(n => n.remove());
    root.querySelectorAll("*").forEach(n => { for (const a of [...n.attributes]) if (/^on/i.test(a.name) || (/href$/i.test(a.name) && /^\s*javascript:/i.test(a.value))) n.removeAttribute(a.name); });
    return root;
  }
  function traceSVG(src) {
    const root = cleanSVG(src); if (!root) return null;
    let vb = (root.getAttribute("viewBox") || "").split(/[\s,]+/).map(Number); if (vb.length !== 4 || vb.some(isNaN)) { const w = parseFloat(root.getAttribute("width")) || 500, h = parseFloat(root.getAttribute("height")) || 500; vb = [0, 0, w, h]; root.setAttribute("viewBox", vb.join(" ")); }
    root.setAttribute("width", vb[2]); root.setAttribute("height", vb[3]);
    const host = document.createElement("div"); host.style.cssText = "position:fixed;left:-99999px;top:0;visibility:hidden;pointer-events:none"; host.appendChild(document.importNode(root, true)); document.body.appendChild(host);
    const svg = host.firstChild, inv = svg.getScreenCTM()?.inverse(), polys = []; let total = 0;
    const els = [...svg.querySelectorAll("path, circle, ellipse, rect, line, polyline, polygon")].filter(el => !el.closest("defs, clipPath, mask, symbol, pattern, marker"));
    const lens = els.map(el => { try { return el.getTotalLength(); } catch { return 0; } }); total = lens.reduce((a, b) => a + b, 0);
    const step = Math.max(Math.max(vb[2], vb[3]) / 500, total / 30000);
    els.forEach((el, i) => {
      const L = lens[i]; if (!L || !inv) return; const cs = getComputedStyle(el); if (cs.display === "none" || (cs.fill === "none" && cs.stroke === "none")) return;
      const M = inv.multiply(el.getScreenCTM()), n = Math.min(1200, Math.max(6, Math.ceil(L / step))); let cur = [], px = null, py = null;
      for (let j = 0; j <= n; j++) { const p = el.getPointAtLength(L * j / n), x = M.a * p.x + M.c * p.y + M.e, y = M.b * p.x + M.d * p.y + M.f; if (px != null && Math.hypot(x - px, y - py) > step * 4) { if (cur.length >= 4) polys.push(cur); cur = []; } cur.push(x - vb[0] - vb[2] / 2, y - vb[1] - vb[3] / 2); px = x; py = y; }
      if (cur.length >= 4) polys.push(cur);
    });
    host.remove(); const S = finish(polys); S.box = { x: -vb[2] / 2, y: -vb[3] / 2, w: vb[2], h: vb[3] }; S.svg = new XMLSerializer().serializeToString(root); return S;
  }
  window.LightLitStrokes = { record, drawUpTo, parsePath, text, loadFont, traceSVG, FONTS: Object.keys(FONT_FILES) };
})();
