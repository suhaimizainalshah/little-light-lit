/* Little Light Lit shared UX helpers, loaded on every page.
   1. Drag and drop anywhere: drop files anywhere in the window to open them. Each page sets
      window.LightLitDrop = { accept(file) -> bool, open(files), label, reject }.
   2. Enter confirms: in any open dialog, Enter runs the main action (the button marked
      data-primary, or the first .primary button) instead of closing or doing nothing.
   3. Inputs with data-enter="#buttonId" run that button when Enter is pressed. */
(() => {
  if (window.__lightlitUx) return; window.__lightlitUx = true;

  /* ---------- drag and drop anywhere ---------- */
  const css = document.createElement("style");
  css.textContent = `.lightlit-drop{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;background:color-mix(in srgb,var(--stage,#e2e6ea) 82%,transparent);backdrop-filter:blur(2px);pointer-events:none;opacity:0;transition:opacity .12s}
  .lightlit-drop.on{opacity:1}
  .lightlit-drop div{display:grid;justify-items:center;gap:.5rem;padding:2.2rem 3rem;border:3px dashed var(--guide,#0f9db0);border-radius:22px;background:var(--panel,#fff);color:var(--ink,#1b1f24);font:700 1.35rem/1.3 var(--ui,system-ui,sans-serif);text-align:center;box-shadow:0 30px 60px -30px rgba(0,0,0,.45)}
  .lightlit-drop svg{width:46px;height:46px;color:var(--guide,#0f9db0)}
  .lightlit-drop small{font:500 .9rem var(--ui,system-ui,sans-serif);color:var(--muted,#5a646e)}
  .lightlit-drop.bad div{border-color:var(--accent,#e0412b)}
  .drop.drag::after,.stage.drag::after{display:none!important}
  @media (prefers-reduced-motion:reduce){.lightlit-drop{transition:none}}`;
  document.head.appendChild(css);
  let overlay = null, depth = 0;
  const hasFiles = e => [...(e.dataTransfer?.types || [])].includes("Files");
  function show(e) {
    const cfg = window.LightLitDrop; if (!cfg) return;
    if (!overlay) { overlay = document.createElement("div"); overlay.className = "lightlit-drop"; overlay.setAttribute("aria-hidden", "true"); overlay.innerHTML = `<div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg><span class="t"></span><small class="s"></small></div>`; document.body.appendChild(overlay); }
    const items = [...(e.dataTransfer?.items || [])].filter(i => i.kind === "file"), types = items.map(i => i.type).filter(Boolean);
    const ok = !types.length || !cfg.acceptType || types.some(t => cfg.acceptType(t));
    overlay.classList.toggle("bad", !ok);
    overlay.querySelector(".t").textContent = ok ? (typeof cfg.label === "function" ? cfg.label() : cfg.label || "Drop to open") : "This file type can’t be opened here";
    overlay.querySelector(".s").textContent = ok ? (cfg.hint || "") : (cfg.reject || "");
    overlay.classList.add("on");
  }
  const hide = () => { depth = 0; overlay?.classList.remove("on"); };
  addEventListener("dragenter", e => { if (!hasFiles(e) || e.defaultPrevented) return; e.preventDefault(); depth++; show(e); });
  addEventListener("dragover", e => { if (!hasFiles(e)) return; e.preventDefault(); if (!e.defaultPrevented || window.LightLitDrop) e.dataTransfer.dropEffect = "copy"; });
  addEventListener("dragleave", e => { if (!hasFiles(e)) return; depth = Math.max(0, depth - 1); if (!depth || e.clientX <= 0 || e.clientY <= 0 || e.clientX >= innerWidth || e.clientY >= innerHeight) hide(); });
  addEventListener("drop", e => {
    if (!hasFiles(e)) return; e.preventDefault(); hide(); if (e.defaultPrevented && e.__lightlitHandled) return;
    const cfg = window.LightLitDrop; if (!cfg) return;
    const files = [...e.dataTransfer.files], good = cfg.accept ? files.filter(cfg.accept) : files;
    if (!good.length) { cfg.onReject?.(files); return; }
    if (good.length < files.length) cfg.onPartial?.(files.length - good.length);
    cfg.open(good);
  });
  addEventListener("blur", hide);

  /* ---------- Enter confirms the main action in dialogs ---------- */
  const primaryOf = d => d.querySelector("[data-primary]:not([disabled]):not([hidden])") || d.querySelector(".primary:not([disabled]):not([hidden])");
  document.addEventListener("keydown", e => {
    if (e.key !== "Enter" || e.isComposing || e.shiftKey || e.altKey) return;
    const t = e.target, dlg = t.closest?.("dialog[open]");
    if (t.matches?.("[data-enter]")) { const b = document.querySelector(t.dataset.enter); if (b && !b.disabled) { e.preventDefault(); b.click(); } return; }
    if (!dlg) return;
    if (t.matches("textarea, select, a[href], summary") || (t.matches("button") && !t.matches("[value=cancel]"))) return;
    const b = primaryOf(dlg); if (b) { e.preventDefault(); b.click(); }
  }, true);
  /* forms with method="dialog" submit on Enter; run the main action instead of closing */
  document.addEventListener("submit", e => { const dlg = e.target.closest?.("dialog"); if (!dlg) return; const b = primaryOf(dlg); if (b && e.submitter?.value !== "cancel") { e.preventDefault(); b.click(); } }, true);
  /* when a dialog opens, put focus on its main action so Enter works straight away */
  const orig = HTMLDialogElement.prototype.showModal;
  HTMLDialogElement.prototype.showModal = function () { orig.call(this); const auto = this.querySelector("[autofocus]"); if (!auto) setTimeout(() => primaryOf(this)?.focus({ preventScroll: true }), 0); };
})();

/* ---------- What is this file really? ----------
   Reads a file's first bytes to find its real format, whatever its name says, so a program or web page renamed
   as a photo is refused. Exact for the formats Little Light Lit opens; no model or download needed. */
window.LightLitSniff = async function (f) {
  try {
    const u = new Uint8Array(await f.slice(0, 4096).arrayBuffer()), t = new TextDecoder("latin1").decode(u), at = (o, ...b) => b.every((x, i) => u[o + i] === x);
    if (at(0, 0xFF, 0xD8, 0xFF)) return "jpeg"; if (at(0, 0x89, 0x50, 0x4E, 0x47)) return "png"; if (t.startsWith("GIF8")) return "gif";
    if (t.startsWith("RIFF") && t.slice(8, 12) === "WEBP") return "webp"; if (t.startsWith("BM")) return "bmp";
    if (t.slice(4, 8) === "ftyp") return /^(heic|heix|mif1|msf1)/.test(t.slice(8, 12)) ? "heic" : /^avif/.test(t.slice(8, 12)) ? "avif" : "video";
    if (t.startsWith("MZ") || at(0, 0x7F, 0x45, 0x4C, 0x46) || at(0, 0xCF, 0xFA, 0xED, 0xFE) || t.startsWith("#!")) return "program";
    if (/^\s*<svg/i.test(t)) return "svg"; if (/^\s*(<!doctype html|<html|<script)/i.test(t)) return "html";
    if (t.slice(0, 1024).includes("%PDF-")) return "pdf"; if (at(0, 0x50, 0x4B, 0x03, 0x04)) return "zip";
  } catch {}
  return "unknown";
};
window.LightLitPhotoKinds = new Set(["jpeg", "png", "gif", "webp", "bmp", "avif"]);
window.LightLitWhyNot = function (name, kind) {
  if (kind === "program" || kind === "html") return `“${name}” isn’t a photo: it looks like ${kind === "program" ? "a program" : "a web page"}, so it wasn’t opened. Files that hide what they are can be harmful.`;
  if (kind === "heic") return `“${name}” is a HEIC photo, which this browser may not open. Export it as JPEG first.`;
  if (kind === "pdf") return `“${name}” is a PDF, not a photo. Open PDFs in If Leaves Weave.`;
  return `“${name}” isn’t a photo. Open a JPG, PNG, WebP or GIF.`;
};

