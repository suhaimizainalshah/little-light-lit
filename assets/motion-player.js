/* Little Light Lit Motion player. Plays a Motion document: scenes with keyframed objects, symbols (reusable animated
   groups with their own timeline), click and hover actions, and scene transitions. Used by the editor's preview and
   inside every export. It scales to fit its container and respects "reduce motion". */
(function () {
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const sorted = o => (o.keys || []).slice().sort((a, b) => a.t - b.t);
  /* Each keyframe may set only some properties (k.props); keyframes without props set them all, as before.
     Each property is then animated on its own track: position, scale, rotation and opacity. */
  const PROPS = { pos: ["x", "y"], scale: ["scale"], rotate: ["rotate"], opacity: ["opacity"] };
  const sets = (k, track) => !k.props || PROPS[track].some(p => k.props.includes(p));
  function track(o, name, dur) {
    const k = sorted(o).filter(q => sets(q, name)); if (!k.length) return null;
    const val = q => name === "pos" ? { left: (q.x ?? 0) + "px", top: (q.y ?? 0) + "px" } : name === "scale" ? { scale: String(q.scale ?? 1) } : name === "rotate" ? { rotate: (q.rotate ?? 0) + "deg" } : { opacity: q.opacity ?? 1 };
    const f = k.map(q => ({ offset: Math.min(1, Math.max(0, q.t / dur)), ...val(q), easing: q.ease || "ease-in-out" }));
    if (f[0].offset > 0) f.unshift({ ...f[0], offset: 0 }); if (f[f.length - 1].offset < 1) f.push({ ...f[f.length - 1], offset: 1 }); return f;
  }
  function animateAll(e, o, dur, opt) { return ["pos", "scale", "rotate", "opacity"].map(n => { const f = track(o, n, dur); return f ? e.animate(f, opt) : null; }).filter(Boolean); }
  function frames(o, dur) {
    const k = sorted(o); if (!k.length) k.push({ t: 0, x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 });
    const f = k.map(q => ({ offset: Math.min(1, Math.max(0, q.t / dur)), left: q.x + "px", top: q.y + "px", transform: `scale(${q.scale ?? 1}) rotate(${q.rotate ?? 0}deg)`, opacity: q.opacity ?? 1, easing: q.ease || "ease-in-out" }));
    if (f[0].offset > 0) f.unshift({ ...f[0], offset: 0 }); if (f[f.length - 1].offset < 1) f.push({ ...f[f.length - 1], offset: 1 }); return f;
  }
  function el(o, M, ctx) {
    const sym = o.kind === "symbol" ? (M.symbols || []).find(s => s.id === o.symbol) : null;
    const e = document.createElement(o.actions?.some(a => a.on === "click") ? "button" : "div");
    e.className = "mo-obj"; e.style.cssText = `position:absolute;left:0;top:0;width:${o.w}px;height:${o.h}px;transform-origin:50% 50%;display:flex;align-items:center;justify-content:center;text-align:center;box-sizing:border-box;border:0;padding:0;margin:0;font:${o.weight || 700} ${o.size || 32}px/1.15 ${o.font || "system-ui,sans-serif"};color:${o.color || "#18191c"};background:${o.kind === "rect" || o.kind === "ellipse" ? (o.fill || "#f6c744") : "transparent"};border-radius:${o.kind === "ellipse" ? "50%" : (o.radius || 0) + "px"};overflow:visible;white-space:pre-wrap`;
    if (e.tagName === "BUTTON") { e.type = "button"; e.style.cursor = "pointer"; e.setAttribute("aria-label", o.label || o.text || o.name || "Button"); }
    if (o.kind === "text" || o.kind === "rect" || o.kind === "ellipse") e.textContent = o.text || "";
    if (o.kind === "image" && o.src) e.innerHTML = `<img src="${o.src}" alt="${esc(o.alt || "")}" style="width:100%;height:100%;object-fit:contain;pointer-events:none">`;
    if (sym) { // a symbol: its own objects and its own looping timeline inside this object
      (sym.objects || []).forEach(c => { const ce = el(c, M, ctx); e.append(ce); ctx.symbolAnims.push(...animateAll(ce, c, (sym.duration || 2) * 1000, { duration: (sym.duration || 2) * 1000, iterations: sym.loop === false ? 1 : Infinity, fill: "both" })); });
    }
    return e;
  }
  function render(root, M, opts = {}) {
    root.innerHTML = ""; const W = M.w || 1280, H = M.h || 720, reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const frame = document.createElement("div"); frame.className = "mo-frame"; frame.style.cssText = `position:relative;width:100%;aspect-ratio:${W}/${H};overflow:hidden;background:${M.bg || "#fff"}`;
    const stage = document.createElement("div"); stage.style.cssText = `position:absolute;left:0;top:0;width:${W}px;height:${H}px;transform-origin:0 0`; frame.append(stage); root.append(frame);
    const fit = () => { const k = frame.clientWidth / W; stage.style.transform = `scale(${k})`; }; new ResizeObserver(fit).observe(frame); fit();
    const live = document.createElement("p"); live.setAttribute("aria-live", "polite"); live.style.cssText = "position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)"; root.append(live);
    let cur = -1, anims = [], ctx = null, endTimer = 0;
    const api = {
      scene: i => show(i), next: () => show(cur + 1 < M.scenes.length ? cur + 1 : (opts.wrap ? 0 : cur)), prev: () => show(Math.max(0, cur - 1)),
      play: () => { anims.forEach(a => { if (a.playState === "finished") a.currentTime = 0; a.play(); }); ctx?.symbolAnims.forEach(a => a.play()); },
      pause: () => { anims.forEach(a => a.pause()); ctx?.symbolAnims.forEach(a => a.pause()); },
      restart: () => { anims.forEach(a => { a.currentTime = 0; a.play(); }); },
      seek: t => { anims.forEach(a => { a.pause(); a.currentTime = Math.max(0, t * 1000); }); }, get current() { return cur; }, get time() { return (anims[0]?.currentTime || 0) / 1000; },
    };
    const run = (act) => { if (act.do === "play") api.play(); if (act.do === "pause") api.pause(); if (act.do === "restart") api.restart(); if (act.do === "seek") api.seek(+act.value || 0); if (act.do === "next") api.next(); if (act.do === "prev") api.prev(); if (act.do === "scene") { const i = M.scenes.findIndex(s => s.id === act.value); if (i >= 0) api.scene(i); } if (act.do === "url" && /^https?:\/\//.test(act.value || "")) window.open(act.value, "_blank", "noopener"); };
    /* A small physics engine: each body is a box (or circle) with velocity. Gravity pulls it down, walls and other
       bodies bounce it (restitution), friction slows it, and draggable bodies can be thrown. Fixed bodies never move. */
    let physRaf = 0;
    function physics(list, S, W, H, stage, sceneIndex) {
      cancelAnimationFrame(physRaf); const g = (S.gravity ?? 1) * 1800, walls = S.walls !== false;
      const B = list.map(({ o, e }) => { const p0 = sorted(o)[0] || {}; return { o, e, x: p0.x ?? 0, y: p0.y ?? 0, w: o.w, h: o.h, vx: +(o.physics.vx || 0), vy: +(o.physics.vy || 0), fixed: !!o.physics.fixed, bounce: o.physics.bounce ?? .55, fric: o.physics.friction ?? .1, round: o.kind === "ellipse", drag: null }; });
      B.forEach(b => { if (!o_drag(b)) return; b.e.style.touchAction = "none"; b.e.style.cursor = "grab";
        b.e.addEventListener("pointerdown", ev => { ev.preventDefault(); const k = stage.getBoundingClientRect().width / W; b.drag = { k, ox: ev.clientX / k - b.x, oy: ev.clientY / k - b.y, hist: [] }; try { b.e.setPointerCapture(ev.pointerId); } catch {} });
        b.e.addEventListener("pointermove", ev => { if (!b.drag) return; const nx = ev.clientX / b.drag.k - b.drag.ox, ny = ev.clientY / b.drag.k - b.drag.oy; b.drag.hist.push([performance.now(), nx, ny]); b.drag.hist = b.drag.hist.slice(-5); b.x = nx; b.y = ny; b.vx = b.vy = 0; });
        b.e.addEventListener("pointerup", () => { const h = b.drag?.hist || []; if (h.length > 1) { const [t0, x0, y0] = h[0], [t1, x1, y1] = h[h.length - 1], dt = Math.max(.016, (t1 - t0) / 1000); b.vx = (x1 - x0) / dt; b.vy = (y1 - y0) / dt; } b.drag = null; }); });
      function o_drag(b) { return b.o.physics.draggable && !b.fixed; }
      let last = performance.now(); const step = now => {
        if (cur !== sceneIndex) return; const dt = Math.min(.033, (now - last) / 1000); last = now;
        for (const b of B) { if (b.fixed || b.drag) continue; b.vy += g * dt; b.x += b.vx * dt; b.y += b.vy * dt;
          if (walls) { if (b.y + b.h > H) { b.y = H - b.h; b.vy = -b.vy * b.bounce; b.vx *= 1 - b.fric; if (Math.abs(b.vy) < 40) b.vy = 0; } if (b.y < 0) { b.y = 0; b.vy = -b.vy * b.bounce; } if (b.x < 0) { b.x = 0; b.vx = -b.vx * b.bounce; } if (b.x + b.w > W) { b.x = W - b.w; b.vx = -b.vx * b.bounce; } } }
        for (let i2 = 0; i2 < B.length; i2++) for (let j = i2 + 1; j < B.length; j++) { const a = B[i2], c = B[j]; // collisions, resolved along the smaller overlap
          const ox = Math.min(a.x + a.w, c.x + c.w) - Math.max(a.x, c.x), oy = Math.min(a.y + a.h, c.y + c.h) - Math.max(a.y, c.y); if (ox <= 0 || oy <= 0) continue;
          const am = a.fixed || a.drag ? 0 : 1, cm = c.fixed || c.drag ? 0 : 1; if (!am && !cm) continue; const e2 = Math.min(a.bounce, c.bounce), sh = am && cm ? .5 : 1;
          if (ox < oy) { const d = a.x < c.x ? -1 : 1; if (am) a.x += d * ox * sh; if (cm) c.x -= d * ox * sh; const va = a.vx, vc = c.vx; if (am && cm) { a.vx = vc * e2; c.vx = va * e2; } else if (am) a.vx = -va * e2; else c.vx = -vc * e2; }
          else { const d = a.y < c.y ? -1 : 1; if (am) a.y += d * oy * sh; if (cm) c.y -= d * oy * sh; const va = a.vy, vc = c.vy; if (am && cm) { a.vy = vc * e2; c.vy = va * e2; } else if (am) { a.vy = -va * e2; if (Math.abs(a.vy) < 40) a.vy = 0; a.vx *= 1 - a.fric; } else { c.vy = -vc * e2; if (Math.abs(c.vy) < 40) c.vy = 0; c.vx *= 1 - c.fric; } } }
        for (const b of B) { b.e.style.left = b.x + "px"; b.e.style.top = b.y + "px"; }
        physRaf = requestAnimationFrame(step); };
      if (!reduce) physRaf = requestAnimationFrame(step);
    }
    function show(i) {
      if (!M.scenes[i]) return; clearTimeout(endTimer); const S = M.scenes[i], dur = Math.max(.1, +S.duration || 3) * 1000, old = [...stage.children];
      const layer = document.createElement("div"); layer.style.cssText = `position:absolute;inset:0;background:${S.bg || M.bg || "#fff"}`; stage.append(layer);
      ctx = { symbolAnims: [] }; anims = [];
      const bodies = [];
      (S.objects || []).forEach(o => { const e = el(o, M, ctx); layer.append(e); if (o.physics?.on) { bodies.push({ o, e }); const p0 = (sorted(o)[0]) || {}; e.style.left = (p0.x ?? 0) + "px"; e.style.top = (p0.y ?? 0) + "px"; anims.push(...animateAll(e, { ...o, keys: (o.keys || []).map(k => ({ ...k, props: (k.props || ["x", "y", "scale", "rotate", "opacity"]).filter(p => p !== "x" && p !== "y") })) }, dur, { duration: dur, fill: "both" })); }
        else anims.push(...animateAll(e, o, dur, { duration: dur, fill: "both", iterations: S.onEnd === "loop" ? Infinity : 1 }));
        (o.actions || []).forEach(act => { if (act.on === "click") e.addEventListener("click", () => run(act)); if (act.on === "hover") e.addEventListener("mouseenter", () => run(act)); }); });
      if (bodies.length) physics(bodies, S, W, H, stage, i);
      if (S.transition === "fade" && old.length && !reduce) layer.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, fill: "both" });
      setTimeout(() => old.forEach(n => n.remove()), S.transition === "fade" && !reduce ? 420 : 0);
      cur = i; live.textContent = `${S.name || "Scene " + (i + 1)}`;
      if (reduce || opts.paused) { anims.forEach(a => { a.pause(); if (reduce) a.currentTime = dur - 1; }); ctx.symbolAnims.forEach(a => reduce ? a.pause() : 0); }
      if (!opts.paused && !anims.length && S.onEnd === "next") endTimer = setTimeout(() => cur === i && show(i + 1), dur); // an empty scene still moves on
      if (!opts.paused) anims[0]?.finished.then(() => { if (cur !== i) return; if (S.onEnd === "next" && i + 1 < M.scenes.length) show(i + 1); else if (S.onEnd === "loop") api.restart(); else if (S.onEnd === "first") show(0); }).catch(() => {});
      opts.onScene?.(i);
    }
    show(opts.scene || 0); return api;
  }
  window.LLLMotion = { render, frames, track, PROPS };
})();
