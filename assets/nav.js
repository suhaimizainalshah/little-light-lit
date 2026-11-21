/* Booth studio menu: show as many studios as fit, always whole, and move the rest into "More".
   The current studio always stays visible. Recalculates when the window or header changes size. */
(() => {
  const DESC = { "./": "Edit photos and make passport photos", "./#batch": "Compress or resize many photos at once", "photobooth.html": "Snap a photo booth strip with your camera", "design.html": "Posts, posters, slides and more", "video.html": "Edit clips, add music and export video", "audio.html": "Edit, clean up and record audio", "animate.html": "Whiteboard and cartoon explainers", "lesson.html": "Interactive video lessons and quizzes", "360.html": "View and edit 360° photos and videos", "3d.html": "Build and export 3D models" };
  const css = `
.modes{overflow:hidden!important}
.modes a[data-more-hidden]{display:none!important}
.modes .m-hide{display:revert}
.nav-more{display:none;align-items:center;gap:.25rem;border:0;background:transparent;font:inherit;font-weight:600;font-size:.9rem;color:var(--muted,#5A646E);padding:.4rem .75rem;border-radius:999px;cursor:pointer;white-space:nowrap}
.nav-more:hover,.nav-more[aria-expanded=true]{color:var(--ink,#1B1F24);background:var(--panel,#fff)}
.nav-more svg{width:14px;height:14px;transition:transform .15s}
.nav-more[aria-expanded=true] svg{transform:rotate(180deg)}
.nav-more.show{display:inline-flex}.nav-more{flex-shrink:0}.modes.nav-collapsed{min-width:max-content}
.nav-menu{position:fixed;z-index:70;min-width:260px;max-width:min(340px,92vw);max-height:70vh;overflow:auto;padding:.35rem;background:var(--panel,#fff);border:1px solid var(--line,#E2E5EA);border-radius:14px;box-shadow:0 18px 40px -18px rgba(0,0,0,.45)}
.nav-menu[hidden]{display:none}
.nav-menu a{display:grid;gap:.1rem;padding:.55rem .7rem;border-radius:10px;text-decoration:none;color:var(--ink,#1B1F24)}
.nav-menu a:hover,.nav-menu a:focus-visible{background:var(--soft,#EDF0F3);outline:none}
.nav-menu b{font-weight:700;font-size:.92rem}.nav-menu small{color:var(--muted,#5A646E);font-size:.8rem}
@media (max-width:860px){.nav-more{padding:.35rem .55rem;font-size:.84rem}}
.top.nav-tight .ibtn:has(svg) .t,.top.nav-tight .ib:has(svg) .t,.top.nav-tight .btn:has(svg) .t{display:none}
.top.nav-tight .brand span{display:none}
.top.nav-tight .modes a{padding:.4rem .65rem}
.top [data-act-hidden]{display:none!important}
.act-more{display:none;flex-shrink:0}.act-more.show{display:inline-flex}
.nav-menu button.act{display:flex;align-items:center;gap:.6rem;width:100%;padding:.55rem .7rem;border:0;border-radius:10px;background:transparent;color:var(--ink,#1B1F24);font:inherit;font-weight:600;font-size:.92rem;text-align:left;cursor:pointer}
.nav-menu button.act:hover,.nav-menu button.act:focus-visible{background:var(--soft,#EDF0F3);outline:none}
.nav-menu button.act:disabled{opacity:.45;cursor:default}
.nav-menu button.act svg{width:18px;height:18px;flex-shrink:0}`;
  function init() {
    const nav = document.querySelector("nav.modes"); if (!nav) return;
    const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
    const links = [...nav.querySelectorAll("a")];
    const more = document.createElement("button"); more.type = "button"; more.className = "nav-more"; more.setAttribute("aria-haspopup", "true"); more.setAttribute("aria-expanded", "false");
    more.innerHTML = 'More<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
    nav.appendChild(more);
    const menu = document.createElement("div"); menu.className = "nav-menu"; menu.hidden = true; menu.setAttribute("role", "menu"); menu.setAttribute("aria-label", "More studios"); document.body.appendChild(menu);
    document.querySelectorAll(".top .ibtn, .top .ib, .top .btn").forEach(btn => { const t = btn.querySelector(".t"); if (t && btn.querySelector("svg") && !btn.getAttribute("aria-label")) btn.setAttribute("aria-label", t.textContent.trim()); });
    const current = links.find(a => a.getAttribute("aria-current") === "page");
    const top = document.querySelector(".top"), fits = () => nav.scrollWidth <= nav.clientWidth + 1;
    function layout() {
      links.forEach(a => a.removeAttribute("data-more-hidden")); more.classList.remove("show"); top?.classList.remove("nav-tight"); nav.classList.remove("nav-collapsed"); setLabel("More");
      if (fits()) return fillMenu([]);
      top?.classList.add("nav-tight"); // first, turn header button labels into icons to make room
      if (fits()) return fillMenu([]);
      more.classList.add("show");
      const hidden = [];
      for (let i = links.length - 1; i >= 0 && !fits(); i--) { if (links[i] === current) continue; links[i].setAttribute("data-more-hidden", ""); hidden.unshift(links[i]); }
      // very narrow: one menu named after the current studio, listing every studio
      if (!fits() && current) { current.setAttribute("data-more-hidden", ""); nav.classList.add("nav-collapsed"); setLabel(current.textContent.trim()); return fillMenu(links, current); }
      setLabel("More"); fillMenu(hidden);
    }
    function setLabel(t) { more.firstChild.nodeValue = t; }
    function fillMenu(hidden, cur) {
      menu.innerHTML = hidden.map(a => `<a role="menuitem" href="${a.getAttribute("href")}"${a === cur ? ' aria-current="page" style="background:var(--soft,#EDF0F3)"' : ""}><b>${a.textContent.trim()}${a === cur ? " ✓" : ""}</b><small>${DESC[a.getAttribute("href")] || ""}</small></a>`).join("");
      more.setAttribute("aria-label", hidden.length ? `More studios: ${hidden.map(a => a.textContent.trim()).join(", ")}` : "More studios");
      if (!hidden.length) close();
    }
    function open() { const r = more.getBoundingClientRect(); menu.hidden = false; const w = menu.offsetWidth; menu.style.top = `${Math.round(r.bottom + 6)}px`; menu.style.left = `${Math.round(Math.max(8, Math.min(r.right - w, innerWidth - w - 8)))}px`; more.setAttribute("aria-expanded", "true"); menu.querySelector("a")?.focus(); }
    function close() { menu.hidden = true; more.setAttribute("aria-expanded", "false"); }
    more.addEventListener("click", e => { e.stopPropagation(); menu.hidden ? open() : close(); });
    document.addEventListener("click", e => { if (!menu.hidden && !menu.contains(e.target)) close(); });
    menu.addEventListener("click", e => { if (e.target.closest("a")) close(); });
    addEventListener("keydown", e => {
      if (menu.hidden) return; const items = [...menu.querySelectorAll("a")], i = items.indexOf(document.activeElement);
      if (e.key === "Escape") { close(); more.focus(); }
      else if (e.key === "ArrowDown") { e.preventDefault(); items[(i + 1) % items.length]?.focus(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); items[(i - 1 + items.length) % items.length]?.focus(); }
    });
    /* ---------- header actions: on narrow screens, secondary buttons move into "⋯" ---------- */
    const primary = [...top.querySelectorAll(":scope > .btn.primary, :scope > .primary")].pop();
    const actMore = document.createElement("button"); actMore.type = "button"; actMore.className = `${top.querySelector(".ibtn") ? "ibtn" : "ib"} act-more`; actMore.setAttribute("aria-label", "More actions"); actMore.title = "More actions"; actMore.setAttribute("aria-haspopup", "true"); actMore.setAttribute("aria-expanded", "false");
    actMore.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>';
    primary ? top.insertBefore(actMore, primary) : top.appendChild(actMore);
    const actMenu = document.createElement("div"); actMenu.className = "nav-menu"; actMenu.hidden = true; actMenu.setAttribute("role", "menu"); actMenu.setAttribute("aria-label", "More actions"); document.body.appendChild(actMenu);
    let actHidden = [];
    const secondary = () => [...top.querySelectorAll(":scope > .ibtn, :scope > .ib")].filter(b => b !== actMore && !/undo|redo/i.test(b.id) && !b.hidden && !b.closest("[hidden]"));
    const label = b => b.getAttribute("aria-label") || b.title?.split(" (")[0] || b.textContent.trim();
    function layoutActions() {
      top.querySelectorAll("[data-act-hidden]").forEach(b => b.removeAttribute("data-act-hidden")); actMore.classList.remove("show"); actHidden = [];
      if (top.scrollWidth <= top.clientWidth + 1) return;
      actMore.classList.add("show");
      const list = secondary().filter(b => getComputedStyle(b).display !== "none");
      for (let i = list.length - 1; i >= 0 && top.scrollWidth > top.clientWidth + 1; i--) { list[i].setAttribute("data-act-hidden", ""); actHidden.unshift(list[i]); }
      if (!actHidden.length) actMore.classList.remove("show");
    }
    function openActs() {
      actMenu.innerHTML = ""; actHidden.forEach(orig => { const b = document.createElement("button"); b.type = "button"; b.className = "act"; b.setAttribute("role", "menuitem"); b.disabled = orig.disabled; const svg = orig.querySelector("svg"); b.innerHTML = `${svg ? svg.outerHTML : ""}<span>${label(orig)}</span>`; b.onclick = () => { closeActs(); orig.click(); }; actMenu.appendChild(b); });
      const r = actMore.getBoundingClientRect(); actMenu.hidden = false; const w = actMenu.offsetWidth; actMenu.style.top = `${Math.round(r.bottom + 6)}px`; actMenu.style.left = `${Math.round(Math.max(8, Math.min(r.right - w, innerWidth - w - 8)))}px`; actMore.setAttribute("aria-expanded", "true"); actMenu.querySelector("button:not(:disabled)")?.focus();
    }
    function closeActs() { actMenu.hidden = true; actMore.setAttribute("aria-expanded", "false"); }
    actMore.addEventListener("click", e => { e.stopPropagation(); close(); actMenu.hidden ? openActs() : closeActs(); });
    document.addEventListener("click", e => { if (!actMenu.hidden && !actMenu.contains(e.target)) closeActs(); });
    addEventListener("keydown", e => { if (e.key === "Escape" && !actMenu.hidden) { closeActs(); actMore.focus(); } });
    const fullLayout = () => { layout(); layoutActions(); };
    addEventListener("resize", () => { close(); closeActs(); fullLayout(); });
    let ro = null; if (window.ResizeObserver) { ro = new ResizeObserver(() => fullLayout()); ro.observe(top || nav); }
    document.fonts?.ready.then(fullLayout); setTimeout(fullLayout, 0); fullLayout();
  }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", init) : init();
})();
