/* Little Light Lit Course player. Renders a course from its data, in the editor's preview and in exported files.
   Blocks: heading, text, image, video, accordion, tabs, flashcards, process, timeline, labelled graphic, question
   (8 types), interactive scene (states, layers, rules, variables), animation (keyframes) and simulation (watch, try, test).
   Scores are reported to an LMS through SCORM 1.2 or 2004 when one is found. Everything runs in the browser. */
(function () {
  const CSS = `.cp{--a:var(--a-l,#c23a22);--ai:#fff;--ink:#18191c;--mu:#5b616a;--ln:#e2e0da;--sf:#f6f5f2;--card:#fff;--ok:#1e7a46;--bad:#b42318;font:16px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:var(--ink);max-width:780px;margin:0 auto;padding:0 18px 60px}
@media (prefers-color-scheme:dark){.cp{--ink:#eceef1;--mu:#a3aab4;--ln:#30343b;--sf:#1f2227;--card:#1a1c20;--a:var(--a-d,#ff7b62);--ai:#14161a;--ok:#7ad6a0;--bad:#ff9b8f}}
.cp *{box-sizing:border-box}.cp h1{font-size:2rem;line-height:1.2;margin:28px 0 8px}.cp h2{font-size:1.45rem;margin:0 0 6px}.cp h3{font-size:1.15rem;margin:0 0 4px}
.cp-block{margin:26px 0}.cp img{max-width:100%;height:auto;border-radius:10px}.cp figcaption{color:var(--mu);font-size:.9rem;margin-top:4px}
.cp a{color:var(--a)}.cp button{font:inherit}.cp :focus-visible{outline:3px solid #2453d6;outline-offset:2px}
.cp-btn{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--ln);background:var(--card);color:var(--ink);border-radius:10px;padding:8px 14px;cursor:pointer;font-weight:600}
.cp-btn.pri{background:var(--a);border-color:var(--a);color:var(--ai)}.cp-btn:disabled{opacity:.5;cursor:default}
.cp details{border:1px solid var(--ln);border-radius:12px;margin:8px 0;background:var(--card)}.cp summary{cursor:pointer;padding:12px 14px;font-weight:650}.cp details>div{padding:0 14px 12px}
.cp-tabs [role=tablist]{display:flex;gap:4px;border-bottom:2px solid var(--ln);overflow-x:auto}.cp-tabs [role=tab]{border:0;background:none;padding:9px 14px;cursor:pointer;color:var(--mu);font-weight:650;border-bottom:3px solid transparent;margin-bottom:-2px}
.cp-tabs [role=tab][aria-selected=true]{color:var(--ink);border-bottom-color:var(--a)}.cp-tabs [role=tabpanel]{padding:14px 2px}
.cp-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px}.cp-card{min-height:140px;border:1px solid var(--ln);border-radius:14px;background:var(--card);padding:16px;text-align:left;cursor:pointer;color:var(--ink)}
.cp-card[aria-pressed=true]{background:var(--sf)}.cp-card small{display:block;color:var(--mu);margin-top:8px;font-size:.8rem}
.cp-proc{border:1px solid var(--ln);border-radius:14px;padding:18px;background:var(--card)}.cp-proc .cp-nav{display:flex;justify-content:space-between;align-items:center;margin-top:14px}.cp-dots{color:var(--mu);font-size:.9rem}
.cp-tl{list-style:none;padding:0;margin:0;border-left:3px solid var(--ln)}.cp-tl li{position:relative;padding:0 0 18px 20px}.cp-tl li::before{content:"";position:absolute;left:-9px;top:6px;width:15px;height:15px;border-radius:50%;background:var(--a);border:3px solid var(--card)}.cp-tl b{display:block;color:var(--a);font-size:.9rem}
.cp-lg{position:relative}.cp-pin{position:absolute;transform:translate(-50%,-50%);width:32px;height:32px;border-radius:50%;border:3px solid #fff;background:var(--a);color:var(--ai);font-weight:800;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,.3)}
.cp-pop{margin-top:10px;border:1px solid var(--ln);border-radius:12px;padding:12px 14px;background:var(--card)}
.cp-q{border:1px solid var(--ln);border-radius:14px;padding:18px;background:var(--card)}.cp-q fieldset{border:0;padding:0;margin:0}.cp-q legend{font-weight:650;margin-bottom:8px;padding:0}
.cp-opt{display:flex;gap:10px;align-items:flex-start;padding:9px 12px;border:1px solid var(--ln);border-radius:10px;margin:6px 0;cursor:pointer}.cp-opt input{margin-top:5px}
.cp-fb{margin-top:12px;padding:10px 12px;border-radius:10px;font-weight:600}.cp-fb.ok{background:color-mix(in srgb,var(--ok) 14%,transparent);color:var(--ok)}.cp-fb.bad{background:color-mix(in srgb,var(--bad) 12%,transparent);color:var(--bad)}
.cp-row{display:flex;gap:8px;align-items:center;margin:6px 0;flex-wrap:wrap}.cp-row select,.cp-blank{font:inherit;padding:5px 8px;border:1px solid var(--ln);border-radius:8px;background:var(--card);color:var(--ink)}.cp-blank{width:9em}
.cp-ord li{cursor:grab;display:flex;gap:8px;align-items:center;padding:8px 10px;border:1px solid var(--ln);border-radius:10px;margin:6px 0;background:var(--card)}.cp-ord li span{flex:1}.cp-ord .cp-btn{padding:4px 8px}
.cp-hot{position:relative;cursor:crosshair;display:inline-block;max-width:100%}.cp-hot img{display:block}.cp-mark{position:absolute;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;border:3px solid #fff;background:var(--a);pointer-events:none}
.cp-stage{position:relative;width:100%;aspect-ratio:16/9;border-radius:14px;overflow:hidden;background:var(--sf);border:1px solid var(--ln)}
.cp-obj{position:absolute;display:flex;align-items:center;justify-content:center;text-align:center;border-radius:10px;padding:4px 8px;border:0;font-weight:650;line-height:1.25;overflow:hidden;transition:background .15s,color .15s,transform .15s}
.cp-obj img{width:100%;height:100%;object-fit:contain;border-radius:0}button.cp-obj{cursor:pointer}
.cp-layer{position:absolute;inset:0}.cp-layer[hidden]{display:none}
.cp-sim{border:1px solid var(--ln);border-radius:14px;padding:14px;background:var(--card)}.cp-sim .cp-shot{position:relative;margin-top:10px;cursor:pointer}.cp-sim .cp-shot img{display:block;width:100%}
.cp-target{position:absolute;border:3px solid var(--a);border-radius:6px;box-shadow:0 0 0 9999px rgba(0,0,0,.35);pointer-events:none;animation:cpPulse 1.2s ease-in-out infinite}@keyframes cpPulse{50%{border-color:#f6c744}}
.cp-seg{display:inline-flex;gap:4px;background:var(--sf);border-radius:10px;padding:3px}.cp-seg button{border:0;background:none;padding:6px 12px;border-radius:8px;cursor:pointer;color:var(--mu);font-weight:650}.cp-seg button[aria-pressed=true]{background:var(--card);color:var(--ink);box-shadow:0 1px 3px rgba(0,0,0,.12)}
.cp-end{margin-top:40px;padding:22px;border-radius:16px;background:var(--sf);text-align:center}.cp-bar{height:10px;border-radius:999px;background:var(--ln);overflow:hidden;margin:10px auto;max-width:320px}.cp-bar span{display:block;height:100%;background:var(--a)}
.cp-narr{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:0 0 10px}.cp-narr audio{height:36px;max-width:100%}.cp-narr details{flex-basis:100%;font-size:.92rem;color:var(--mu)}.cp-narr summary{cursor:pointer;padding:0;font-weight:600}
.cp-chips{display:flex;flex-wrap:wrap;gap:8px;min-height:48px;padding:8px;border:2px dashed var(--ln);border-radius:12px}
.cp-chip{border:1px solid var(--ln);background:var(--card);color:var(--ink);border-radius:999px;padding:7px 14px;font-weight:600;cursor:grab;touch-action:none;user-select:none}
.cp-chip[aria-pressed=true]{outline:3px solid var(--a);outline-offset:2px}.cp-chip.drag{position:fixed;z-index:9999;pointer-events:none;box-shadow:0 8px 20px rgba(0,0,0,.25);cursor:grabbing}
.cp-zones{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin-top:10px}.cp-zone{border:2px dashed var(--ln);border-radius:12px;padding:8px;min-height:90px}.cp-zone>b{display:block;margin-bottom:6px}
.cp-zone.over,.cp-chips.over,.cp-slot.over{border-color:var(--a);background:color-mix(in srgb,var(--a) 8%,transparent)}.cp-zone .cp-drop{display:flex;flex-wrap:wrap;gap:6px}
.cp-zone[tabindex]:focus-visible,.cp-slot[tabindex]:focus-visible{outline:3px solid #2453d6}
.cp-mrow{display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:center;margin:6px 0}.cp-slot{min-height:44px;border:2px dashed var(--ln);border-radius:10px;padding:4px;display:flex;align-items:center}
.cp-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
@media (prefers-reduced-motion:reduce){.cp *{animation:none!important;transition:none!important}}`;
  /* An author's colour, adjusted for each mode so text and buttons keep at least 4.5:1 contrast */
  const lum = c => { const v = [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16) / 255).map(x => x <= .03928 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4); return .2126 * v[0] + .7152 * v[1] + .0722 * v[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + .05) / (y + .05); };
  const mix = (c, t, f) => "#" + [1, 3, 5].map(i => Math.round(parseInt(c.slice(i, i + 2), 16) * (1 - f) + parseInt(t.slice(i, i + 2), 16) * f).toString(16).padStart(2, "0")).join("");
  const fit = (c, toward, against) => { for (let f = 0; f <= 1; f += .05) { const m = mix(c, toward, f); if (ratio(m, against) >= 4.5) return m; } return toward; };
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  // simple formatting: **bold**, _italic_, [link](https://…), "- " lists, blank lines between paragraphs
  const md = s => esc(s).split(/\n{2,}/).map(p => /^- /m.test(p) ? `<ul>${p.split(/\n/).filter(l => l.trim()).map(l => `<li>${inl(l.replace(/^- /, ""))}</li>`).join("")}</ul>` : `<p>${inl(p).replace(/\n/g, "<br>")}</p>`).join("");
  const inl = s => s.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/(^|\W)_(.+?)_(?=\W|$)/g, "$1<i>$2</i>").replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const h = (tag, attrs = {}, html = "") => { const e = document.createElement(tag); for (const [k, v] of Object.entries(attrs)) { if (k.startsWith("on")) e.addEventListener(k.slice(2), v); else if (v !== false && v != null) e.setAttribute(k, v === true ? "" : v); } if (html) e.innerHTML = html; return e; };

  /* ---------- SCORM: find the LMS, report score and completion ---------- */
  function lms() {
    let w = window, api = null, v = null;
    for (let i = 0; i < 10 && w; i++) { try { if (w.API_1484_11) { api = w.API_1484_11; v = 2004; break; } if (w.API) { api = w.API; v = 12; break; } } catch {} if (w.parent === w) break; w = w.parent; }
    if (!api && window.opener) try { api = window.opener.API_1484_11 || window.opener.API; v = window.opener.API_1484_11 ? 2004 : 12; } catch {}
    if (!api) return null;
    const call = (a, b) => { try { return v === 2004 ? { init: () => api.Initialize(""), set: (k, x) => api.SetValue(k, String(x)), commit: () => api.Commit(""), end: () => api.Terminate("") }[a](...(b || [])) : { init: () => api.LMSInitialize(""), set: (k, x) => api.LMSSetValue(k, String(x)), commit: () => api.LMSCommit(""), end: () => api.LMSFinish("") }[a](...(b || [])); } catch {} };
    call("init"); addEventListener("pagehide", () => call("end"));
    return { v, report(score, max, done, pass) {
      const pct = max ? Math.round(score / max * 100) : 100;
      if (v === 2004) { call("set", ["cmi.score.raw", score]); call("set", ["cmi.score.max", max]); call("set", ["cmi.score.min", 0]); call("set", ["cmi.score.scaled", max ? (score / max).toFixed(2) : 1]); call("set", ["cmi.completion_status", done ? "completed" : "incomplete"]); if (done) call("set", ["cmi.success_status", pct >= pass ? "passed" : "failed"]); }
      else { call("set", ["cmi.core.score.raw", score]); call("set", ["cmi.core.score.max", max]); call("set", ["cmi.core.score.min", 0]); call("set", ["cmi.core.lesson_status", done ? (pct >= pass ? "passed" : "failed") : "incomplete"]); }
      call("commit");
    } };
  }

  function render(root, C, opts = {}) {
    if (!document.getElementById("cp-css")) document.head.append(h("style", { id: "cp-css" }, CSS));
    root.innerHTML = ""; root.className = "cp";
    if (/^#[0-9a-f]{6}$/i.test(C.accent || "")) { root.style.setProperty("--a-l", fit(C.accent, "#000000", "#ffffff")); root.style.setProperty("--a-d", fit(C.accent, "#ffffff", "#1a1c20")); }
    const S = { vars: Object.fromEntries((C.vars || []).map(v => [v.name, isNaN(+v.value) || v.value === "" ? v.value : +v.value])), results: {}, rerun: [] };
    const scorm = opts.scorm === false ? null : lms();
    // activities that count: questions, scored simulations, and scenes that can be marked complete
    const qs = C.blocks.filter(b => b.type === "question" || b.type === "simulation" && b.scored || b.type === "scene" && (b.rules || []).some(r => (r.then || []).some(x => x.do === "complete")));
    const tally = () => { const max = qs.reduce((a, b) => a + (+b.points || 1), 0), got = qs.reduce((a, b) => a + (S.results[b.id]?.score || 0), 0), done = qs.every(b => S.results[b.id]); return { max, got, done }; };
    const update = () => { const t = tally(); end.innerHTML = qs.length ? `<h2>${t.done ? "Well done, you’ve finished" : "Your progress"}</h2><p>${t.done ? `You scored <b>${t.got} of ${t.max}</b>.` : `${qs.filter(b => S.results[b.id]).length} of ${qs.length} activities done.`}</p><div class="cp-bar" role="progressbar" aria-label="Score" aria-valuemin="0" aria-valuemax="${t.max}" aria-valuenow="${t.got}"><span style="width:${t.max ? t.got / t.max * 100 : 0}%"></span></div>` : `<h2>You’ve reached the end</h2>`; scorm?.report(t.got, t.max, t.done || !qs.length, C.passMark ?? 60); opts.onProgress?.(t); };
    const interp = s => String(s ?? "").replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => S.vars[k] ?? "");
    root.append(h("h1", {}, esc(C.title || "Untitled course")));
    if (C.intro) root.append(h("div", { class: "cp-intro" }, md(C.intro)));
    // narration goes in after each block draws, as some blocks replace their whole section
    for (const b of C.blocks) { const sec = h("section", { class: "cp-block", id: "b-" + b.id, "data-type": b.type }); try { (R[b.type] || (() => {}))(sec, b, S, update, interp, root); narrate(sec, b); } catch (e) { sec.textContent = "This block couldn’t be shown."; } root.append(sec); }
    if (opts.sls) { // Singapore Student Learning Space: send the score as xAPI state, following MOE's published method
      let prm = null; const init = () => { if (prm || !window.ADL) return prm; const u = new URLSearchParams(location.search); try { ADL.XAPIWrapper.changeConfig({ endpoint: u.get("endpoint") + "/", auth: `Basic ${u.get("auth")}` }); prm = { agent: JSON.parse(u.get("agent")), stateId: u.get("stateId"), activityId: u.get("activityId") }; } catch (e) { console.warn("Not running inside SLS", e); } return prm; };
      const prev = opts.onProgress; opts.onProgress = t => { try { const p = init(); if (p) ADL.XAPIWrapper.sendState(p.activityId, p.agent, p.stateId, null, { score: t.got }); } catch (e) { console.error(e); } prev?.(t); };
    }
    const end = h("div", { class: "cp-end", role: "status", "aria-live": "polite" }); root.append(end); update();
    return S;
  }
  // what a block says, for text-to-speech and the transcript
  const spoken = b => [b.title, b.text, b.prompt, b.caption, ...(b.items || []).map(x => typeof x === "string" ? x : `${x.title || x.text || ""}. ${x.body || ""}`), ...(b.cards || []).map(c => `${c.front}: ${c.back}`), ...(b.steps || []).map(x => `${x.title || x.instruction || ""}. ${x.body || ""}`), ...(b.events || []).map(e => `${e.date}, ${e.title}. ${e.body || ""}`), ...(b.choices || []).map(c => c.text)].filter(Boolean).join(". ").replace(/\*\*|_|\[[^\]]*\]\([^)]*\)/g, "").replace(/\s+/g, " ").trim();
  function narrate(sec, b) {
    const n = b.narration; if (!n || (!n.src && !n.tts)) return;
    const bar = h("div", { class: "cp-narr" }), script = n.transcript || (n.tts ? spoken(b) : "");
    if (n.src) bar.append(h("audio", { controls: true, preload: "none", src: n.src, "aria-label": "Narration" }));
    else if (n.tts && "speechSynthesis" in window) {
      const btn = h("button", { class: "cp-btn", type: "button", "aria-pressed": "false" }, "▶ Listen");
      btn.onclick = () => { const on = btn.getAttribute("aria-pressed") === "true"; speechSynthesis.cancel(); if (on) { btn.setAttribute("aria-pressed", "false"); btn.textContent = "▶ Listen"; return; } const u = new SpeechSynthesisUtterance(script); u.lang = n.lang || document.documentElement.lang || "en"; u.rate = +n.rate || 1; u.onend = u.onerror = () => { btn.setAttribute("aria-pressed", "false"); btn.textContent = "▶ Listen"; }; speechSynthesis.speak(u); btn.setAttribute("aria-pressed", "true"); btn.textContent = "■ Stop"; };
      bar.append(btn);
    }
    if (script) { const d = h("details"); d.append(h("summary", {}, "Transcript"), h("p", {}, esc(script))); bar.append(d); }
    sec.prepend(bar);
  }
  /* ---------- drag and drop that works with a mouse, touch and the keyboard ----------
     Pointer: drag a chip onto a zone. Keyboard: Space or Enter picks a chip up, then Space or Enter on a zone drops it. */
  function dnd(container, onDrop) {
    let held = null;
    const zones = () => [...container.querySelectorAll("[data-zone]")];
    const announce = t => { let live = container.querySelector(".cp-live"); if (!live) { live = h("p", { class: "cp-sr cp-live", "aria-live": "assertive" }); container.append(live); } live.textContent = t; };
    container.addEventListener("keydown", e => {
      const chip = e.target.closest(".cp-chip"), zone = e.target.closest("[data-zone]");
      if (!(e.key === " " || e.key === "Enter")) { if (e.key === "Escape" && held) { held.setAttribute("aria-pressed", "false"); held = null; announce("Cancelled."); } return; }
      if (chip && !held) { e.preventDefault(); e.stopPropagation(); held = chip; chip.setAttribute("aria-pressed", "true"); announce(`Picked up ${chip.textContent}. Move to a place and press Space to drop it.`); return; }
      if (held && (zone || chip)) { e.preventDefault(); e.stopPropagation(); const z = zone || chip.closest("[data-zone]"); const c = held; held = null; c.setAttribute("aria-pressed", "false"); if (z && z !== c.closest("[data-zone]")) { onDrop(c, z); announce(`Dropped ${c.textContent} in ${z.dataset.label || "place"}.`); c.focus(); } }
    }, true);
    container.addEventListener("pointerdown", e => {
      const chip = e.target.closest(".cp-chip"); if (!chip || e.button > 0) return; e.preventDefault();
      const r = chip.getBoundingClientRect(), ghost = chip.cloneNode(true), dx = e.clientX - r.left, dy = e.clientY - r.top; let moved = false, over = null;
      const move = m => { if (!moved && Math.hypot(m.clientX - e.clientX, m.clientY - e.clientY) < 4) return; if (!moved) { moved = true; ghost.classList.add("drag"); ghost.style.width = r.width + "px"; document.body.append(ghost); chip.style.opacity = ".35"; }
        ghost.style.left = m.clientX - dx + "px"; ghost.style.top = m.clientY - dy + "px"; const el = document.elementFromPoint(m.clientX, m.clientY)?.closest("[data-zone]"); if (el !== over) { over?.classList.remove("over"); over = el && container.contains(el) ? el : null; over?.classList.add("over"); } };
      const up = () => { removeEventListener("pointermove", move); removeEventListener("pointerup", up); ghost.remove(); chip.style.opacity = ""; over?.classList.remove("over"); if (moved && over && over !== chip.closest("[data-zone]")) onDrop(chip, over); else if (!moved) chip.focus(); };
      addEventListener("pointermove", move); addEventListener("pointerup", up);
    });
  }
  const result = (S, b, ok, score, update, box, msgOk, msgBad, retry) => {
    S.results[b.id] = { score: ok ? (+b.points || 1) : score || 0, ok }; const fb = box.querySelector(".cp-fb") || box.appendChild(h("div", { class: "cp-fb", role: "status" }));
    fb.className = "cp-fb " + (ok ? "ok" : "bad"); fb.innerHTML = ok ? "✓ " + esc(msgOk || "Correct!") : "✗ " + esc(msgBad || "Not quite.") + (retry ? ` <button class="cp-btn" type="button">Try again</button>` : "");
    fb.querySelector("button")?.addEventListener("click", () => { delete S.results[b.id]; fb.remove(); retry(); update(); }); update();
  };

  const R = {
    heading(s, b) { s.append(h(b.level === 3 ? "h3" : "h2", {}, esc(b.text))); },
    text(s, b, S, u, interp) { s.innerHTML = md(interp(b.text)); },
    image(s, b) { if (!b.src) return; const f = h("figure", { style: "margin:0" }); f.append(h("img", { src: b.src, alt: b.alt || "" })); if (b.caption) f.append(h("figcaption", {}, esc(b.caption))); s.append(f); },
    video(s, b) {
      const y = /(?:youtu\.be\/|v=|embed\/)([\w-]{11})/.exec(b.url || "");
      if (y) s.innerHTML = `<div style="position:relative;aspect-ratio:16/9"><iframe src="https://www.youtube-nocookie.com/embed/${y[1]}" title="${esc(b.title || "Video")}" style="position:absolute;inset:0;width:100%;height:100%;border:0;border-radius:12px" allow="fullscreen; picture-in-picture" allowfullscreen></iframe></div>`;
      else if (b.src || b.url) s.innerHTML = `<video controls playsinline style="width:100%;border-radius:12px" src="${esc(b.src || b.url)}">${b.captions ? `<track kind="captions" src="${esc(b.captions)}" default>` : ""}</video>`;
      if (b.caption) s.append(h("p", { style: "color:var(--mu);font-size:.9rem" }, esc(b.caption)));
    },
    accordion(s, b) { if (b.title) s.append(h("h2", {}, esc(b.title))); (b.items || []).forEach(it => { const d = h("details"); d.append(h("summary", {}, esc(it.title)), h("div", {}, md(it.body))); s.append(d); }); },
    tabs(s, b) {
      if (b.title) s.append(h("h2", {}, esc(b.title))); const w = h("div", { class: "cp-tabs" }), list = h("div", { role: "tablist", "aria-label": b.title || "Tabs" }); w.append(list);
      const items = b.items || [], panels = items.map((it, i) => { const p = h("div", { role: "tabpanel", id: `tp-${b.id}-${i}`, "aria-labelledby": `tb-${b.id}-${i}`, tabindex: "0", hidden: i > 0 }, md(it.body)); return p; });
      const tabs = items.map((it, i) => h("button", { role: "tab", id: `tb-${b.id}-${i}`, "aria-controls": `tp-${b.id}-${i}`, "aria-selected": i === 0 ? "true" : "false", tabindex: i === 0 ? "0" : "-1", type: "button", onclick: () => sel(i), onkeydown: e => { const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (k) { e.preventDefault(); sel((i + k + items.length) % items.length, true); } } }, esc(it.title)));
      const sel = (i, focus) => { tabs.forEach((t, j) => { t.setAttribute("aria-selected", j === i); t.tabIndex = j === i ? 0 : -1; panels[j].hidden = j !== i; }); if (focus) tabs[i].focus(); };
      tabs.forEach(t => list.append(t)); panels.forEach(p => w.append(p)); s.append(w);
    },
    flashcards(s, b) {
      if (b.title) s.append(h("h2", {}, esc(b.title))); const g = h("div", { class: "cp-cards" });
      (b.cards || []).forEach(c => { const card = h("button", { class: "cp-card", type: "button", "aria-pressed": "false" }); const show = back => { card.innerHTML = `<span>${md(back ? c.back : c.front)}</span><small>${back ? "Back · select to flip" : "Front · select to flip"}</small>`; card.setAttribute("aria-pressed", back); }; card.onclick = () => show(card.getAttribute("aria-pressed") !== "true"); show(false); g.append(card); });
      s.append(g);
    },
    process(s, b) {
      const steps = b.steps || []; if (!steps.length) return; let i = 0; if (b.title) s.append(h("h2", {}, esc(b.title)));
      const box = h("div", { class: "cp-proc" }), body = h("div", { "aria-live": "polite" }), nav = h("div", { class: "cp-nav" });
      const prev = h("button", { class: "cp-btn", type: "button", onclick: () => go(-1) }, "‹ Back"), next = h("button", { class: "cp-btn pri", type: "button", onclick: () => go(1) }, "Next ›"), dots = h("span", { class: "cp-dots" });
      const go = d => { i = Math.max(0, Math.min(steps.length - 1, i + d)); body.innerHTML = `<h3>${esc(steps[i].title)}</h3>${md(steps[i].body)}`; dots.textContent = `Step ${i + 1} of ${steps.length}`; prev.disabled = i === 0; next.disabled = i === steps.length - 1; };
      nav.append(prev, dots, next); box.append(body, nav); s.append(box); go(0);
    },
    timeline(s, b) { if (b.title) s.append(h("h2", {}, esc(b.title))); s.append(h("ol", { class: "cp-tl" }, (b.events || []).map(e => `<li><b>${esc(e.date)}</b><h3>${esc(e.title)}</h3>${md(e.body)}</li>`).join(""))); },
    labelled(s, b) {
      if (b.title) s.append(h("h2", {}, esc(b.title))); if (!b.src) return; const w = h("div", { class: "cp-lg" }); w.append(h("img", { src: b.src, alt: b.alt || "" }));
      const pop = h("div", { class: "cp-pop", "aria-live": "polite", hidden: true });
      (b.pins || []).forEach((p, i) => { const btn = h("button", { class: "cp-pin", type: "button", style: `left:${p.x}%;top:${p.y}%`, "aria-label": `${i + 1}: ${p.title}`, "aria-expanded": "false", onclick: () => { const open = btn.getAttribute("aria-expanded") === "true"; w.querySelectorAll(".cp-pin").forEach(x => x.setAttribute("aria-expanded", "false")); if (open) { pop.hidden = true; return; } btn.setAttribute("aria-expanded", "true"); pop.hidden = false; pop.innerHTML = `<h3>${i + 1}. ${esc(p.title)}</h3>${md(p.body)}`; } }, String(i + 1)); w.append(btn); });
      s.append(w, pop);
    },

    /* ---------- questions ---------- */
    question(s, b, S, update) {
      const box = h("div", { class: "cp-q" }), t = b.qtype || "mc", fs = h("fieldset"), sub = h("button", { class: "cp-btn pri", type: "button" }, "Check answer");
      fs.append(h("legend", {}, md(b.prompt).replace(/^<p>|<\/p>$/g, ""))); box.append(fs);
      const done = (ok, part) => { sub.disabled = true; fs.disabled = true; result(S, b, ok, part, update, box, b.right, b.wrong, b.retry !== false ? () => { sub.disabled = false; fs.disabled = false; build(); } : null); };
      const build = () => {
        [...fs.children].slice(1).forEach(n => n.remove());
        if (t === "mc" || t === "mr" || t === "tf") {
          const ch = t === "tf" ? [{ text: "True", correct: !!b.answer }, { text: "False", correct: !b.answer }] : (b.shuffle ? shuffle(b.choices || []) : b.choices || []);
          ch.forEach((c, i) => { const l = h("label", { class: "cp-opt" }); l.append(h("input", { type: t === "mr" ? "checkbox" : "radio", name: "q" + b.id, value: i }), h("span", {}, esc(c.text))); fs.append(l); });
          sub.onclick = () => { const picked = [...fs.querySelectorAll("input")].map((x, i) => x.checked ? i : -1).filter(i => i >= 0); if (!picked.length) return; done(ch.every((c, i) => !!c.correct === picked.includes(i))); };
        } else if (t === "fill") {
          const p = h("p"); let k = 0; const answers = []; p.innerHTML = esc(b.text || "").replace(/\[([^\]]+)\]/g, (_, a) => { answers.push(a.split("|").map(x => x.trim().toLowerCase())); return `<input class="cp-blank" aria-label="Blank ${++k}" autocomplete="off">`; }); fs.append(p);
          sub.onclick = () => { const vals = [...p.querySelectorAll("input")].map(x => x.value.trim().toLowerCase()); const right = vals.filter((v, i) => answers[i].includes(v)).length; done(right === answers.length, 0); };
        } else if (t === "match" && b.dnd !== false) {
          const pairs = b.pairs || [], bank = h("div", { class: "cp-chips", "data-zone": "bank", "data-label": "the answer bank", tabindex: "0", "aria-label": "Answers to place" });
          shuffle(pairs.map(p => p.right)).forEach(x => bank.append(h("button", { class: "cp-chip", type: "button", "aria-pressed": "false" }, esc(x))));
          fs.append(h("p", { class: "cp-sr" }, "Drag each answer to its match. With a keyboard, press Space on an answer, then Space on a slot.")); fs.append(bank);
          pairs.forEach((p, i) => { const row = h("div", { class: "cp-mrow" }); row.append(h("b", {}, esc(p.left)), h("div", { class: "cp-slot", "data-zone": "s" + i, "data-label": p.left, tabindex: "0", "aria-label": `Match for ${p.left}` })); fs.append(row); });
          dnd(fs, (chip, zone) => { if (zone.dataset.zone !== "bank" && zone.querySelector(".cp-chip")) bank.append(zone.querySelector(".cp-chip")); zone.append(chip); });
          sub.onclick = () => { const v = pairs.map((p, i) => fs.querySelector(`[data-zone="s${i}"] .cp-chip`)?.textContent); if (v.some(x => !x)) return; done(v.every((x, i) => x === pairs[i].right)); };
        } else if (t === "match") {
          const pairs = b.pairs || [], rights = shuffle(pairs.map(p => p.right));
          pairs.forEach((p, i) => { const r = h("div", { class: "cp-row" }); r.append(h("span", { style: "flex:1;font-weight:600" }, esc(p.left)), h("select", { "aria-label": `Match for ${p.left}` }, `<option value="">Choose…</option>${rights.map(x => `<option>${esc(x)}</option>`).join("")}`)); fs.append(r); });
          sub.onclick = () => { const v = [...fs.querySelectorAll("select")].map(x => x.value); if (v.some(x => !x)) return; done(v.every((x, i) => x === pairs[i].right)); };
        } else if (t === "order") {
          let items = shuffle((b.items || []).map((x, i) => ({ x, i }))); if (items.every((o, k) => o.i === k) && items.length > 1) items.reverse();
          const ol = h("ol", { class: "cp-ord", style: "padding:0;list-style:none" }); fs.append(ol);
          const draw = focusIdx => { ol.innerHTML = ""; items.forEach((o, k) => { const li = h("li"); li.append(h("b", {}, k + 1 + "."), h("span", {}, esc(o.x)), h("button", { class: "cp-btn", type: "button", "aria-label": `Move “${o.x}” up`, disabled: k === 0, onclick: () => { [items[k - 1], items[k]] = [items[k], items[k - 1]]; draw(k - 1); } }, "↑"), h("button", { class: "cp-btn", type: "button", "aria-label": `Move “${o.x}” down`, disabled: k === items.length - 1, onclick: () => { [items[k + 1], items[k]] = [items[k], items[k + 1]]; draw(k + 1); } }, "↓")); ol.append(li); }); if (focusIdx != null) ol.children[focusIdx]?.querySelector("button:not(:disabled)")?.focus(); };
          draw(); sub.onclick = () => done(items.every((o, k) => o.i === k));
          ol.addEventListener("pointerdown", e => { const li = e.target.closest("li"); if (!li || e.target.closest("button")) return; e.preventDefault(); const from = [...ol.children].indexOf(li); li.style.opacity = ".5";
            const up = u => { removeEventListener("pointerup", up); li.style.opacity = ""; const tgt = document.elementFromPoint(u.clientX, u.clientY)?.closest(".cp-ord li"); const to = tgt ? [...ol.children].indexOf(tgt) : -1; if (to >= 0 && to !== from) { const [m] = items.splice(from, 1); items.splice(to, 0, m); draw(); } };
            addEventListener("pointerup", up); });

        } else if (t === "categorize" && b.dnd !== false) {
          const cats = b.categories || [], bank = h("div", { class: "cp-chips", "data-zone": "bank", "data-label": "the starting area", tabindex: "0", "aria-label": "Items to sort" }), zs = h("div", { class: "cp-zones" });
          shuffle(b.items || []).forEach(it => { const c = h("button", { class: "cp-chip", type: "button", "aria-pressed": "false" }, esc(it.text)); c.dataset.cat = it.cat; bank.append(c); });
          cats.forEach(c => { const z = h("div", { class: "cp-zone", "data-zone": "c", "data-cat": c, "data-label": c, tabindex: "0", "aria-label": `Group: ${c}` }); z.append(h("b", {}, esc(c)), h("div", { class: "cp-drop" })); zs.append(z); });
          fs.append(h("p", { class: "cp-sr" }, "Drag each item into its group. With a keyboard, press Space on an item, then Space on a group.")); fs.append(bank, zs);
          dnd(fs, (chip, zone) => (zone.querySelector(".cp-drop") || zone).append(chip));
          sub.onclick = () => { const chips = [...fs.querySelectorAll(".cp-chip")]; if (chips.some(c => c.closest("[data-zone]")?.dataset.zone === "bank")) return; done(chips.every(c => c.closest("[data-zone]").dataset.cat === c.dataset.cat)); };
        } else if (t === "categorize") {
          const cats = b.categories || [], its = shuffle(b.items || []);
          its.forEach(it => { const r = h("div", { class: "cp-row" }); r.append(h("span", { style: "flex:1" }, esc(it.text)), h("select", { "aria-label": `Category for ${it.text}` }, `<option value="">Choose…</option>${cats.map(c => `<option>${esc(c)}</option>`).join("")}`)); r.dataset.cat = it.cat; fs.append(r); });
          sub.onclick = () => { const rows = [...fs.querySelectorAll(".cp-row")]; if (rows.some(r => !r.querySelector("select").value)) return; done(rows.every(r => r.querySelector("select").value === r.dataset.cat)); };
        } else if (t === "hotspot") {
          const w = h("div", { class: "cp-hot", role: "img", "aria-label": b.alt || "Picture to click" }); w.append(h("img", { src: b.src || "", alt: "" })); let pt = null; const mark = h("span", { class: "cp-mark", hidden: true }); w.append(mark);
          w.onclick = e => { const r = w.getBoundingClientRect(); pt = { x: (e.clientX - r.left) / r.width * 100, y: (e.clientY - r.top) / r.height * 100 }; mark.hidden = false; mark.style.left = pt.x + "%"; mark.style.top = pt.y + "%"; };
          fs.append(w, h("p", { style: "color:var(--mu);font-size:.9rem" }, "Click the right place on the picture, then check your answer."));
          sub.onclick = () => { if (!pt) return; const z = b.target || { x: 0, y: 0, w: 0, h: 0 }; done(pt.x >= z.x && pt.x <= z.x + z.w && pt.y >= z.y && pt.y <= z.y + z.h); };
        }
      };
      build(); const row = h("div", { style: "margin-top:12px" }); row.append(sub); box.append(row); s.append(box);
    },

    /* ---------- interactive scene: objects with states, layers, rules and variables ---------- */
    scene(s, b, S, update, interp, root) {
      if (b.title) s.append(h("h2", {}, esc(b.title)));
      const stage = h("div", { class: "cp-stage", style: b.bg ? `background:${b.bg}` : "" }), els = {}, layers = {};
      (b.layers || []).forEach(L => { layers[L.id] = h("div", { class: "cp-layer", hidden: !L.visible, "data-layer": L.name }); });
      const rulesFor = (o, ev) => (b.rules || []).filter(r => r.obj === o && r.event === ev);
      const style = (o, st) => { const x = { ...(o.states?.normal || {}), ...(o.states?.[st] || {}) }; return `background:${x.fill || "transparent"};color:${x.color || "inherit"};${x.scale ? `transform:scale(${x.scale})` : ""}`; };
      const draw = o => { const e = els[o.id]; if (!e) return; const cur = e.dataset.state || "normal"; e.style.cssText = `left:${o.x}%;top:${o.y}%;width:${o.w}%;height:${o.h}%;font-size:${o.size || 16}px;` + style(o, cur); if (o.kind !== "image") e.innerHTML = esc(interp(o.text)); };
      const redrawAll = () => (b.objects || []).forEach(draw);
      const test = c => { if (!c || !c.var) return true; const v = S.vars[c.var], w = isNaN(+c.val) ? c.val : +c.val; return { "=": v == w, "≠": v != w, ">": v > w, "<": v < w, "≥": v >= w, "≤": v <= w }[c.op || "="]; };
      const act = a => {
        if (a.do === "show" && layers[a.target]) layers[a.target].hidden = false;
        if (a.do === "hide" && layers[a.target]) layers[a.target].hidden = true;
        if (a.do === "toggle" && layers[a.target]) layers[a.target].hidden = !layers[a.target].hidden;
        if (a.do === "state" && els[a.target]) els[a.target].dataset.state = a.value || "normal";
        if (a.do === "set") S.vars[a.target] = isNaN(+a.value) || a.value === "" ? a.value : +a.value;
        if (a.do === "add") S.vars[a.target] = (+S.vars[a.target] || 0) + (+a.value || 0);
        if (a.do === "goto") root.querySelector("#b-" + a.target)?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
        if (a.do === "complete") { S.results[b.id] = { score: +b.points || 1, ok: true }; update(); }
        redrawAll(); S.rerun.forEach(f => f());
      };
      const fire = (o, ev) => rulesFor(o, ev).forEach(r => { if (test(r.cond)) (r.then || []).forEach(act); });
      (b.objects || []).forEach(o => {
        const clickable = (b.rules || []).some(r => r.obj === o.id && r.event === "click"), e = h(clickable ? "button" : "div", { class: "cp-obj", type: clickable ? "button" : null, "data-id": o.id });
        if (o.kind === "image" && o.src) e.append(h("img", { src: o.src, alt: o.alt || "" }));
        if (clickable) e.addEventListener("click", () => { e.dataset.visited = "1"; if (!["selected"].includes(e.dataset.state)) e.dataset.state = (o.states?.visited ? "visited" : e.dataset.state || "normal"); draw(o); fire(o.id, "click"); });
        e.addEventListener("mouseenter", () => { if ((e.dataset.state || "normal") === "normal" && o.states?.hover) { e.dataset.state = "hover"; draw(o); } fire(o.id, "hover"); });
        e.addEventListener("mouseleave", () => { if (e.dataset.state === "hover") { e.dataset.state = e.dataset.visited && o.states?.visited ? "visited" : "normal"; draw(o); } });
        els[o.id] = e; (o.layer && layers[o.layer] ? layers[o.layer] : stage).append(e); draw(o);
      });
      Object.values(layers).forEach(l => stage.append(l)); s.append(stage);
      S.rerun.push(redrawAll); (b.rules || []).filter(r => r.event === "start").forEach(r => { if (test(r.cond)) (r.then || []).forEach(act); });
    },

    /* ---------- animation: keyframes on a timeline, played with the Web Animations API ---------- */
    animation(s, b) {
      if (b.title) s.append(h("h2", {}, esc(b.title)));
      const stage = h("div", { class: "cp-stage", style: b.bg ? `background:${b.bg}` : "" }), dur = Math.max(0.2, +b.duration || 3) * 1000, anims = [];
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      (b.objects || []).forEach(o => {
        const e = h("div", { class: "cp-obj", style: `left:0;top:0;width:${o.w}%;height:${o.h}%;font-size:${o.size || 18}px;background:${o.fill || "transparent"};color:${o.color || "inherit"}` });
        if (o.kind === "image" && o.src) e.append(h("img", { src: o.src, alt: o.alt || "" })); else e.textContent = o.text || "";
        const kf = (o.keys || []).slice().sort((a, c) => a.t - c.t); if (!kf.length) kf.push({ t: 0, x: 10, y: 10, scale: 1, rotate: 0, opacity: 1 });
        const frame = k => ({ offset: Math.min(1, Math.max(0, k.t * 1000 / dur)), left: k.x + "%", top: k.y + "%", transform: `scale(${k.scale ?? 1}) rotate(${k.rotate ?? 0}deg)`, opacity: k.opacity ?? 1, easing: b.easing || "ease-in-out" });
        const frames = kf.map(frame); if (frames[0].offset > 0) frames.unshift({ ...frames[0], offset: 0 }); if (frames[frames.length - 1].offset < 1) frames.push({ ...frames[frames.length - 1], offset: 1 });
        stage.append(e); const a = e.animate(frames, { duration: dur, iterations: b.loop ? Infinity : 1, fill: "both" }); a.pause(); if (reduce) a.currentTime = dur - 1; anims.push(a);
      });
      const ctl = h("div", { class: "cp-row" }), play = h("button", { class: "cp-btn", type: "button", onclick: () => { anims.forEach(a => { if (a.playState === "finished") a.currentTime = 0; a.playState === "running" ? a.pause() : a.play(); }); play.textContent = anims[0]?.playState === "running" ? "Pause" : "Play"; } }, "Play"),
        replay = h("button", { class: "cp-btn", type: "button", onclick: () => { anims.forEach(a => { a.currentTime = 0; a.play(); }); play.textContent = "Pause"; } }, "Replay");
      ctl.append(play, replay); s.append(stage, ctl);
      anims.forEach(a => a.onfinish = () => { play.textContent = "Play"; });
      if (!reduce && b.autoplay !== false) { const io = new IntersectionObserver(es => { if (es.some(x => x.isIntersecting)) { anims.forEach(a => a.play()); play.textContent = "Pause"; io.disconnect(); } }, { threshold: .5 }); io.observe(stage); }
    },

    /* ---------- software simulation: watch, try or test ---------- */
    simulation(s, b, S, update) {
      if (b.title) s.append(h("h2", {}, esc(b.title))); const steps = b.steps || []; if (!steps.length) return;
      const box = h("div", { class: "cp-sim" }), seg = h("div", { class: "cp-seg", role: "group", "aria-label": "Mode" }), info = h("p", { "aria-live": "polite", style: "margin:10px 0 0" }), shot = h("div", { class: "cp-shot" }), img = h("img", { alt: "" }), tgt = h("div", { class: "cp-target", hidden: true }), typing = h("div", { class: "cp-row", hidden: true }), nav = h("div", { class: "cp-row" });
      shot.append(img, tgt); let mode = b.modes?.[0] || "try", i = 0, misses = 0, score = 0, timer = null;
      const modes = (b.modes && b.modes.length ? b.modes : ["watch", "try", "test"]); const names = { watch: "Watch", try: "Try it", test: "Test" };
      modes.forEach(m => seg.append(h("button", { type: "button", "aria-pressed": m === mode, onclick: () => { mode = m; seg.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x.textContent === names[m])); start(); } }, names[m])));
      const box2 = st => { const z = st.target || { x: 40, y: 40, w: 20, h: 10 }; Object.assign(tgt.style, { left: z.x + "%", top: z.y + "%", width: z.w + "%", height: z.h + "%" }); };
      const show = () => {
        clearTimeout(timer); const st = steps[i]; img.src = st.src || ""; img.alt = `Step ${i + 1}: ${st.instruction || ""}`; box2(st); misses = 0;
        info.innerHTML = `<b>Step ${i + 1} of ${steps.length}.</b> ${esc(st.instruction || "")}`; tgt.hidden = mode === "test" || mode === "try"; if (mode === "watch") tgt.hidden = false;
        typing.hidden = st.kind !== "type" || mode === "watch"; typing.innerHTML = ""; if (!typing.hidden) { const inp = h("input", { class: "cp-blank", "aria-label": "Type here", style: "width:16em" }), go = h("button", { class: "cp-btn pri", type: "button" }, "Enter"); const chk = () => { if (inp.value.trim().toLowerCase() === String(st.text || "").trim().toLowerCase()) next(true); else wrong(); }; go.onclick = chk; inp.onkeydown = e => { if (e.key === "Enter") chk(); }; typing.append(inp, go); }
        if (mode === "watch") timer = setTimeout(() => next(true), (+b.watchDelay || 2.5) * 1000);
      };
      const wrong = () => { misses++; if (mode === "try") { info.innerHTML = `<b>Step ${i + 1} of ${steps.length}.</b> ${esc(steps[i].instruction || "")} <span style="color:var(--bad)">${misses >= 2 ? "Look for the highlighted area." : "Not there. Try again."}</span>`; if (misses >= 2) tgt.hidden = false; } else if (mode === "test") next(false); };
      const next = ok => { if (mode === "test" && ok) score++; if (i < steps.length - 1) { i++; show(); } else finish(); };
      const finish = () => { clearTimeout(timer); tgt.hidden = true; if (mode === "test") { const ok = score === steps.length; S.results[b.id] = { score: b.scored ? Math.round((+b.points || 1) * score / steps.length) : 0, ok }; update(); info.innerHTML = `<b>Finished.</b> You got ${score} of ${steps.length} steps right first time.`; } else info.innerHTML = `<b>Finished.</b> ${mode === "watch" ? "Now try it yourself." : "Well done. Ready for the test?"}`; nav.innerHTML = ""; nav.append(h("button", { class: "cp-btn", type: "button", onclick: start }, "Start again")); };
      shot.addEventListener("click", e => { if (mode === "watch") return; const st = steps[i]; if (st.kind === "type") return; const r = shot.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * 100, y = (e.clientY - r.top) / r.height * 100, z = st.target || {}; (x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h) ? next(true) : wrong(); });
      const start = () => { i = 0; score = 0; nav.innerHTML = ""; show(); };
      box.append(seg, info, shot, typing, nav); s.append(box); start();
    },
  };
  window.LLLCourse = { render, css: CSS };
})();
