/* Little Light Lit "Make a GIF" panel (shared with Lassolve), used after a screen recording and in Video to GIF. */
import { makeGif, readyDuration, frameTimes, sizeFor, MAX_FRAMES } from "./gifmaker.js";

const fmt = s => { if (!Number.isFinite(s)) return "0:00.0"; const m = Math.floor(s / 60), r = s - m * 60; return `${m}:${r.toFixed(1).padStart(4, "0")}`; };
const mb = n => n >= 1048576 ? (n / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(n / 1024)) + " KB";
let uid = 0;

export function mountGifPanel(root, video, { baseName = "littlelightlit", note = "", onMade = null } = {}) {
  const id = "g" + ++uid;
  root.classList.add("gifpanel");
  root.innerHTML = `
    <h2 class="gp-h">Make a GIF</h2>
    <p class="muted">GIFs have no sound.${note ? " " + note : ""} Short clips of a few seconds work best.</p>
    <div class="gp-range">
      <div><label class="lbl" for="${id}s">Start (seconds)</label><div class="gp-pair"><input type="number" id="${id}s" min="0" step="0.1" value="0" inputmode="decimal"><button type="button" class="btn sm" data-set="start">Set start here</button></div></div>
      <div><label class="lbl" for="${id}e">End (seconds)</label><div class="gp-pair"><input type="number" id="${id}e" min="0" step="0.1" value="0" inputmode="decimal"><button type="button" class="btn sm" data-set="end">Set end here</button></div></div>
    </div>
    <p class="gp-sum muted" id="${id}sum" aria-live="polite"></p>
    <div class="row">
      <div><label class="lbl" for="${id}w">Width</label><select id="${id}w"><option value="320">320 px, smallest</option><option value="480">480 px</option><option value="640" selected>640 px, clear text</option><option value="800">800 px</option><option value="0">Same as the video</option></select></div>
      <div><label class="lbl" for="${id}f">Smoothness</label><select id="${id}f"><option value="5">5 frames a second</option><option value="10" selected>10 frames a second</option><option value="15">15 frames a second</option><option value="20">20 frames a second</option></select></div>
    </div>
    <label class="sw gp-loop"><span>Loop forever<small>Otherwise it plays once</small></span><input type="checkbox" id="${id}l" checked></label>
    <div class="ctrls gp-go"><button type="button" class="btn primary" id="${id}go">Create GIF</button></div>
    <div class="gp-busy" id="${id}busy" hidden><progress id="${id}p" max="1" value="0" aria-label="GIF progress"></progress><span id="${id}st" role="status"></span><button type="button" class="btn sm" id="${id}x">Cancel</button></div>
    <div class="err" id="${id}err" hidden></div>
    <div class="gp-out" id="${id}out" hidden>
      <img id="${id}img" alt="The GIF you made">
      <div class="meta" id="${id}meta"></div>
      <div class="ctrls" style="justify-content:flex-start"><button type="button" class="btn primary" id="${id}dl">Download GIF</button></div>
    </div>`;
  const $ = s => root.querySelector(s), S = $(`#${id}s`), E = $(`#${id}e`), W = $(`#${id}w`), F = $(`#${id}f`), L = $(`#${id}l`), go = $(`#${id}go`);
  let duration = 0, result = null, url = "", ctl = null;
  const showErr = m => { const e = $(`#${id}err`); e.hidden = !m; e.textContent = m || ""; };
  const range = () => { let s = Math.max(0, +S.value || 0), e = Math.min(duration || Infinity, +E.value || 0); return { s, e }; };
  const summary = () => {
    const { s, e } = range(), fps = +F.value, n = frameTimes(s, e, fps).length, { w, h } = sizeFor(video, +W.value), len = Math.max(0, e - s);
    let t = len > 0 ? `${len.toFixed(1)} seconds, ${n} frames, ${w} × ${h} px` : "Choose an end time after the start time.";
    if (len * fps > MAX_FRAMES) t += `. Only the first ${MAX_FRAMES} frames will be used: choose a shorter part or fewer frames a second.`;
    else if (len > 20) t += ". Long GIFs can be very large: a video may suit better.";
    $(`#${id}sum`).textContent = t; go.disabled = !(len > 0);
  };
  async function reset() {
    result = null; $(`#${id}out`).hidden = true; showErr("");
    try { duration = await readyDuration(video); } catch (e) { duration = 0; showErr(e.message); }
    [S, E].forEach(i => i.max = duration ? duration.toFixed(1) : ""); S.value = "0"; E.value = (duration ? Math.min(duration, 15) : 0).toFixed(1);
    summary();
  }
  root.querySelectorAll("[data-set]").forEach(b => b.onclick = () => {
    const t = +video.currentTime.toFixed(1);
    if (b.dataset.set === "start") { S.value = t; if (+E.value <= t) E.value = Math.min(duration, t + 3).toFixed(1); } else { E.value = t; if (+S.value >= t) S.value = Math.max(0, t - 3).toFixed(1); }
    summary();
  });
  [S, E, W, F].forEach(i => i.addEventListener("input", summary));
  go.onclick = async () => {
    const { s, e } = range(); showErr(""); $(`#${id}out`).hidden = true; go.disabled = true; $(`#${id}busy`).hidden = false;
    ctl = new AbortController(); const wasAt = video.currentTime;
    try {
      result = await makeGif(video, { start: s, end: e, fps: +F.value, width: +W.value, loop: L.checked, signal: ctl.signal,
        onProgress: (d, t, stage) => { $(`#${id}p`).value = stage === "palette" ? d / t * 0.15 : 0.15 + d / t * 0.85; $(`#${id}st`).textContent = stage === "palette" ? "Choosing colours" : `Frame ${d} of ${t}`; } });
      if (url) URL.revokeObjectURL(url); url = URL.createObjectURL(result.blob);
      $(`#${id}img`).src = url; $(`#${id}meta`).innerHTML = `<span>${mb(result.blob.size)}</span><span>${result.width} × ${result.height} px</span><span>${(e - s).toFixed(1)} seconds</span><span>${fmt(s)} to ${fmt(e)}</span>`;
      $(`#${id}out`).hidden = false; $(`#${id}dl`).focus();
      onMade?.(result);
    } catch (err) { if (err.name !== "AbortError") showErr("The GIF could not be made: " + err.message); }
    finally { $(`#${id}busy`).hidden = true; go.disabled = false; ctl = null; try { video.currentTime = wasAt; } catch {} }
  };
  $(`#${id}x`).onclick = () => ctl?.abort();
  $(`#${id}dl`).onclick = () => { if (!result) return; const a = document.createElement("a"); a.href = url; a.download = `${typeof baseName === "function" ? baseName() : baseName}-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.gif`; a.click(); };
  video.addEventListener("loadedmetadata", reset);
  if (video.readyState >= 1) reset();
  return { reset };
}
