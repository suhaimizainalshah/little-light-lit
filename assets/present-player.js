/* Little Light Lit Present player: a zooming canvas presentation with interactive elements.
   Frames sit on a large canvas; presenting moves a camera along your path, zooming and panning between frames.
   Buttons and hotspots can go to any frame, open a pop-up window, show a tooltip or open a web page.
   Keyboard: → or Space next, ← back, O overview, Esc closes a pop-up. Respects "reduce motion". */
(function () {
  const FW = 1600, FH = 900; // every frame is designed at 1600 × 900 and scaled on the canvas
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const md = s => esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\n/g, "<br>");
  const CSS = `.pp{position:relative;width:100%;height:100%;overflow:hidden;background:var(--pp-bg,#f1efea);font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;outline:none}
.pp-world{position:absolute;left:0;top:0;transform-origin:0 0;will-change:transform}.pp.anim .pp-world{transition:transform .9s cubic-bezier(.65,0,.35,1)}
.pp-frame{position:absolute;width:${FW}px;height:${FH}px;transform-origin:0 0;overflow:hidden;border-radius:18px;box-shadow:0 10px 40px rgba(0,0,0,.15)}
.pp-item{position:absolute;display:flex;align-items:center;justify-content:center;text-align:center;box-sizing:border-box;line-height:1.25;white-space:pre-wrap;border:0;margin:0;padding:12px;font:inherit;overflow:hidden}
.pp-item img{width:100%;height:100%;object-fit:contain}button.pp-item{cursor:pointer;transition:transform .15s,box-shadow .15s}button.pp-item:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.18)}
button.pp-item:focus-visible{outline:5px solid #2453d6;outline-offset:4px}.pp-hot{border-radius:50%!important;background:rgba(255,255,255,.92)!important;color:#c23a22!important;font-weight:900!important;box-shadow:0 0 0 6px rgba(194,58,34,.35);animation:ppPulse 1.8s infinite}
@keyframes ppPulse{50%{box-shadow:0 0 0 14px rgba(194,58,34,.12)}}
.pp-tip{position:absolute;z-index:5;max-width:420px;background:#18191c;color:#fff;border-radius:12px;padding:12px 16px;font-size:24px;pointer-events:none;box-shadow:0 6px 18px rgba(0,0,0,.3)}
.pp-pop{position:absolute;inset:0;z-index:20;display:grid;place-items:center;background:rgba(10,12,16,.55);padding:4%}.pp-pop[hidden]{display:none}
.pp-win{background:#fff;color:#18191c;border-radius:18px;max-width:720px;width:100%;max-height:80%;overflow:auto;padding:26px 28px;box-shadow:0 20px 60px rgba(0,0,0,.35);font-size:18px;line-height:1.5}
.pp-win h2{margin:0 0 10px;font-size:26px}.pp-win img{max-width:100%;border-radius:10px;margin-top:10px}.pp-win .x{float:right;border:0;background:#eee;border-radius:999px;width:38px;height:38px;font-size:20px;cursor:pointer}
.pp-ctl{position:absolute;z-index:10;left:50%;bottom:14px;transform:translateX(-50%);display:flex;gap:6px;align-items:center;background:rgba(24,25,28,.82);color:#fff;border-radius:999px;padding:6px 8px;backdrop-filter:blur(6px)}
.pp-ctl button{border:0;background:transparent;color:#fff;font:600 14px system-ui;padding:8px 12px;border-radius:999px;cursor:pointer}.pp-ctl button:hover{background:rgba(255,255,255,.15)}.pp-ctl button:focus-visible{outline:3px solid #9fb7ff}
.pp-ctl span{font:600 13px system-ui;padding:0 6px;opacity:.85;min-width:56px;text-align:center}
.pp-ov .pp-frame{cursor:zoom-in}.pp-ov .pp-frame:hover{box-shadow:0 0 0 8px #2453d6}
.pp-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
@media (prefers-reduced-motion:reduce){.pp.anim .pp-world{transition:none}.pp-hot{animation:none}}`;
  function itemEl(it, go, popup, tip) {
    const act = it.action && it.action.do && it.action.do !== "none", e = document.createElement(act ? "button" : "div");
    e.className = "pp-item" + (it.kind === "hotspot" ? " pp-hot" : ""); if (act) e.type = "button";
    const r = it.kind === "shape-circle" || it.kind === "hotspot" ? "50%" : (it.radius ?? (it.kind === "button" ? 18 : 0)) + "px";
    e.style.cssText = `left:${it.x}px;top:${it.y}px;width:${it.w}px;height:${it.h}px;font-size:${it.size || 40}px;font-weight:${it.kind === "heading" ? 800 : it.weight || (it.kind === "button" ? 700 : 400)};color:${it.color || "#18191c"};background:${it.fill || (it.kind === "button" ? "#2453d6" : "transparent")};border-radius:${r};text-align:${it.align || "center"};justify-content:${it.align === "left" ? "flex-start" : "center"};align-items:${it.valign === "top" ? "flex-start" : it.valign === "bottom" ? "flex-end" : "center"}`;
    if (it.kind === "image") e.innerHTML = it.src ? `<img src="${it.src}" alt="${esc(it.alt || "")}">` : ""; else if (it.kind === "hotspot") e.textContent = it.text || "+"; else e.innerHTML = md(it.text || "");
    if (act) { e.setAttribute("aria-label", it.label || it.text || (it.action.do === "popup" ? it.popup?.title : "") || "Button");
      e.addEventListener("click", ev => { ev.stopPropagation(); const a = it.action; if (a.do === "goto") go(a.target); if (a.do === "next") go("+1"); if (a.do === "prev") go("-1"); if (a.do === "popup") popup(it.popup || {}, e); if (a.do === "url" && /^https?:\/\//.test(a.value || "")) window.open(a.value, "_blank", "noopener"); }); }
    if (it.tooltip) { e.addEventListener("mouseenter", () => tip(it.tooltip, e)); e.addEventListener("mouseleave", () => tip(null)); e.addEventListener("focus", () => tip(it.tooltip, e)); e.addEventListener("blur", () => tip(null)); if (!act) { e.tabIndex = 0; e.setAttribute("aria-label", it.tooltip); } }
    return e;
  }
  function render(root, P, opts = {}) {
    if (!document.getElementById("pp-css")) { const st = document.createElement("style"); st.id = "pp-css"; st.textContent = CSS; document.head.append(st); }
    root.innerHTML = ""; const box = document.createElement("div"); box.className = "pp"; box.tabIndex = 0; box.setAttribute("role", "region"); box.setAttribute("aria-roledescription", "presentation"); box.setAttribute("aria-label", P.title || "Presentation"); box.style.setProperty("--pp-bg", P.canvasBg || "#f1efea"); root.append(box);
    const world = document.createElement("div"); world.className = "pp-world"; box.append(world);
    const live = document.createElement("p"); live.className = "pp-sr"; live.setAttribute("aria-live", "polite"); box.append(live);
    const pop = document.createElement("div"); pop.className = "pp-pop"; pop.hidden = true; box.append(pop);
    const frames = P.frames || [], byId = Object.fromEntries(frames.map(f => [f.id, f])), path = (P.path || frames.map(f => f.id)).filter(id => byId[id]);
    let pos = -1, current = null, overview = false, lastFocus = null, tipEl = null;
    const tip = (t, el) => { tipEl?.remove(); tipEl = null; if (!t || !el) return; tipEl = document.createElement("div"); tipEl.className = "pp-tip"; tipEl.textContent = t; el.parentElement.append(tipEl); tipEl.style.left = Math.max(0, Math.min(FW - 440, el.offsetLeft)) + "px"; tipEl.style.top = (el.offsetTop > 140 ? el.offsetTop - 90 : el.offsetTop + el.offsetHeight + 16) + "px"; };
    const popup = (p, from) => { lastFocus = from; pop.innerHTML = `<div class="pp-win" role="dialog" aria-modal="true" aria-label="${esc(p.title || "Details")}"><button class="x" type="button" aria-label="Close">✕</button><h2>${esc(p.title || "")}</h2><div>${md(p.body || "")}</div>${p.src ? `<img src="${p.src}" alt="${esc(p.alt || "")}">` : ""}</div>`; pop.hidden = false; const x = pop.querySelector(".x"); x.focus(); x.onclick = closePop; pop.onclick = e => { if (e.target === pop) closePop(); }; };
    const closePop = () => { pop.hidden = true; pop.innerHTML = ""; lastFocus?.focus(); };
    frames.forEach(f => { const el = document.createElement("section"); el.className = "pp-frame"; el.dataset.id = f.id; el.setAttribute("aria-label", f.name || "Frame"); el.style.cssText = `left:${f.x}px;top:${f.y}px;transform:scale(${(f.w || FW) / FW});background:${f.bg || "#ffffff"}`;
      (f.items || []).forEach(it => el.append(itemEl(it, go, popup, tip))); el.addEventListener("click", () => { if (overview) { const i = path.indexOf(f.id); i >= 0 ? goPos(i) : focusFrame(f); } }); world.append(el); });
    function camera(x, y, w, h, animate = true) { const bw = box.clientWidth || 1, bh = box.clientHeight || 1, k = Math.min(bw / w, bh / h) * (opts.margin ?? .96); const tx = bw / 2 - (x + w / 2) * k, ty = bh / 2 - (y + h / 2) * k; box.classList.toggle("anim", animate); world.style.transform = `translate(${tx}px,${ty}px) scale(${k})`; }
    const fbox = f => [f.x, f.y, f.w || FW, (f.w || FW) * FH / FW];
    function focusFrame(f, animate = true) { overview = false; box.classList.remove("pp-ov"); current = f; camera(...fbox(f), animate); world.querySelectorAll(".pp-frame").forEach(el => { const on = el.dataset.id === f.id; el.inert = !on; el.setAttribute("aria-hidden", String(!on)); }); live.textContent = `${f.name || "Frame"}${pos >= 0 ? `, ${pos + 1} of ${path.length}` : ""}`; tip(null); count(); opts.onChange?.(f, pos); }
    function goPos(i, animate = true) { if (!path.length) return; pos = Math.max(0, Math.min(path.length - 1, i)); focusFrame(byId[path[pos]], animate); }
    function go(t) { if (t === "+1") return goPos(pos + 1); if (t === "-1") return goPos(pos - 1); const i = path.indexOf(t); if (i >= 0) goPos(i); else if (byId[t]) { focusFrame(byId[t]); } }
    function showOverview() { if (!frames.length) return; overview = true; box.classList.add("pp-ov"); const xs = frames.map(fbox), x0 = Math.min(...xs.map(b => b[0])), y0 = Math.min(...xs.map(b => b[1])), x1 = Math.max(...xs.map(b => b[0] + b[2])), y1 = Math.max(...xs.map(b => b[1] + b[3])); camera(x0 - 200, y0 - 200, x1 - x0 + 400, y1 - y0 + 400); world.querySelectorAll(".pp-frame").forEach(el => { el.inert = false; el.removeAttribute("aria-hidden"); }); live.textContent = "Overview: select a frame to zoom in"; count(); }
    // controls
    const ctl = document.createElement("div"); ctl.className = "pp-ctl"; ctl.setAttribute("role", "toolbar"); ctl.setAttribute("aria-label", "Presentation controls");
    const btn = (label, fn, aria) => { const b = document.createElement("button"); b.type = "button"; b.textContent = label; b.setAttribute("aria-label", aria || label); b.onclick = e => { e.stopPropagation(); fn(); }; ctl.append(b); return b; };
    btn("‹", () => goPos(pos - 1), "Previous"); const n = document.createElement("span"); ctl.append(n); btn("›", () => goPos(pos + 1), "Next"); btn("Overview", showOverview, "Overview"); if (opts.onExit) btn("Exit", opts.onExit, "Exit presentation");
    if (opts.controls !== false) box.append(ctl);
    function count() { n.textContent = overview ? "All" : path.length ? `${pos + 1} / ${path.length}` : ""; }
    box.addEventListener("keydown", e => { if (!pop.hidden) { if (e.key === "Escape") { e.preventDefault(); closePop(); } return; } if (/^(ArrowRight|PageDown| )$/.test(e.key) && !e.target.closest("button")) { e.preventDefault(); goPos(pos + 1); } if (/^(ArrowLeft|PageUp)$/.test(e.key)) { e.preventDefault(); goPos(pos - 1); } if (e.key.toLowerCase() === "o") showOverview(); if (e.key === "Escape" && opts.onExit) opts.onExit(); if (e.key === "Home") goPos(0); if (e.key === "End") goPos(path.length - 1); });
    new ResizeObserver(() => { if (overview) showOverview(); else if (current) camera(...fbox(current), false); }).observe(box);
    requestAnimationFrame(() => { if (opts.start === "overview" || P.startOverview) showOverview(); else goPos(opts.at || 0, false); box.focus({ preventScroll: true }); });
    return { next: () => goPos(pos + 1), prev: () => goPos(pos - 1), go, overview: showOverview, get pos() { return pos; }, get frame() { return current; } };
  }
  // the editor draws elements exactly as presenting does, without their interactions
  window.LLLPresent = { render, FW, FH, item: it => { const e = itemEl({ ...it, action: null, tooltip: null }, () => {}, () => {}, () => {}); return e; }, css: CSS };
})();
