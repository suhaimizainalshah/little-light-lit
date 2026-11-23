/* Compact mode, shared by Little Light Lit and Folio.
   The side panel becomes a drawer that slides in over the work, so the canvas or document gets the full width.
   Open it from the header button, the "Tools" tab on the right edge, or by choosing a tool in the rail.
   Close it with Esc, the close button or a click outside. The choice is remembered per app. */
(() => {
  const app = document.currentScript?.dataset.app || "littlelightlit", KEY = `${app}-compact`;
  const css = `
.cm-btn[aria-pressed=true]{background:var(--soft,#EDF0F3);color:var(--ink,#1B1F24)}
body.compact .work{grid-template-columns:1fr!important}
body.compact .work:has(> .rail:not([hidden])){grid-template-columns:var(--rail,84px) 1fr!important}
body.compact .work > .side:not([hidden]):not(.closed){position:fixed;top:var(--cm-top,58px);right:0;bottom:0;width:min(380px,94vw);max-height:none!important;z-index:45;border-left:1px solid var(--line,#E2E5EA);border-top:0;background:var(--panel,#fff);box-shadow:-20px 0 40px -26px rgba(0,0,0,.5);transform:translateX(104%);visibility:hidden;transition:transform .22s ease,visibility 0s linear .22s;display:block;overflow:auto}
body.compact.cm-open .work > .side:not([hidden]):not(.closed){transform:none;visibility:visible;transition:transform .22s ease}
.cm-scrim{position:fixed;left:0;right:0;bottom:0;top:var(--cm-top,58px);z-index:44;background:rgba(10,12,16,.18);display:none}
body.compact.cm-open .cm-scrim{display:block}
.cm-tab{position:fixed;right:0;top:50%;transform:translateY(-50%);z-index:43;display:none;align-items:center;gap:.35rem;writing-mode:vertical-rl;padding:.8rem .45rem;border:1px solid var(--line,#E2E5EA);border-right:0;border-radius:12px 0 0 12px;background:var(--panel,#fff);color:var(--ink,#1B1F24);font:700 .85rem/1 system-ui,sans-serif;box-shadow:-6px 0 18px -12px rgba(0,0,0,.45);cursor:pointer}
.cm-tab svg{width:16px;height:16px;transform:rotate(90deg)}
body.compact:not(.cm-open):has(.work > .side:not([hidden]):not(.closed)) .cm-tab{display:flex}
.cm-close{position:sticky;top:0;z-index:2;display:none;justify-content:flex-end;padding:.4rem .5rem 0;background:var(--panel,#fff)}
.cm-close button{border:0;background:transparent;font-size:1.05rem;padding:.3rem .55rem;border-radius:8px;color:var(--muted,#5A646E);cursor:pointer}
.cm-close button:hover{background:var(--soft,#EDF0F3)}
body.compact .cm-close{display:flex}
@media (prefers-reduced-motion:reduce){body.compact .work > .side{transition:none!important}}`;
  const icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16"/></svg>';
  function init() {
    const top = document.querySelector(".top"), side = document.querySelector(".work > .side"); if (!top || !side) return;
    const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
    // header button, placed before the main action (Save, Download, Export…)
    const btn = document.createElement("button"); btn.className = `${top.querySelector(".ibtn") ? "ibtn" : top.querySelector(".ib") ? "ib" : "ibtn"} cm-btn`; btn.type = "button"; btn.title = "Compact mode: hide the side panel (Ctrl+\\)"; btn.setAttribute("aria-pressed", "false"); btn.innerHTML = `${icon}<span class="t">Compact</span>`;
    const main = [...top.querySelectorAll(".btn.primary, .btn.danger, .primary")].pop(); main ? top.insertBefore(btn, main) : top.appendChild(btn);
    const tab = document.createElement("button"); tab.className = "cm-tab"; tab.type = "button"; tab.innerHTML = `${icon}Tools`; tab.setAttribute("aria-label", "Show the tools panel");
    const scrim = document.createElement("div"); scrim.className = "cm-scrim"; scrim.setAttribute("aria-hidden", "true");
    document.body.append(tab, scrim);
    const close = document.createElement("div"); close.className = "cm-close"; close.innerHTML = `<button type="button" aria-label="Close the panel">✕</button>`; side.prepend(close);
    const measure = () => document.documentElement.style.setProperty("--cm-top", `${Math.round(top.getBoundingClientRect().bottom)}px`);
    const setOpen = on => { document.body.classList.toggle("cm-open", on && document.body.classList.contains("compact")); tab.setAttribute("aria-expanded", on); if (on) setTimeout(() => side.querySelector("input, select, textarea, button:not(.cm-close button)")?.focus({ preventScroll: true }), 230); };
    const setCompact = on => { document.body.classList.toggle("compact", on); btn.setAttribute("aria-pressed", on); setOpen(false); measure(); try { localStorage.setItem(KEY, on ? "1" : "0"); } catch {} dispatchEvent(new Event("resize")); };
    btn.onclick = () => setCompact(!document.body.classList.contains("compact"));
    tab.onclick = () => setOpen(true); scrim.onclick = () => setOpen(false); close.firstChild.onclick = () => setOpen(false);
    // choosing a tool in the rail opens the drawer with that tool's settings
    document.addEventListener("click", e => { if (!document.body.classList.contains("compact")) return; if (e.target.closest(".rail .tool, .rail [data-tool]")) setTimeout(() => setOpen(true), 0); });
    addEventListener("keydown", e => {
      if ((e.ctrlKey || e.metaKey) && e.key === "\\") { e.preventDefault(); return setCompact(!document.body.classList.contains("compact")); }
      if (e.key === "Escape" && document.body.classList.contains("cm-open") && !document.querySelector("dialog[open]")) { setOpen(false); btn.focus(); }
    });
    addEventListener("resize", measure);
    let saved = null; try { saved = localStorage.getItem(KEY); } catch {}
    if (saved === "1") setCompact(true); else measure();
    window.LightLitCompact = { set: setCompact, open: setOpen };
  }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", init) : init();
})();
