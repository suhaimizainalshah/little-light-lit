/* Little Light Lit GIF maker (shared with Lassolve): turns part of a video into an animated GIF, on this device.
   Made for screen recordings, where most of the screen stays still between frames:
   - one palette for the whole GIF, built from frames spread across the clip, so colours stay steady and text stays crisp;
   - each frame stores only the pixels that changed; the rest are transparent, so the frame before shows through;
   - frames that are identical to the one before are merged into a longer frame, so pauses cost almost nothing.
   GIFs cannot hold sound. Uses gifenc by Matt DesLauriers (MIT licence, vendor/gifenc/LICENSE.md). */
import { GIFEncoder, quantize } from "../vendor/gifenc/gifenc.esm.js";

/* Each pixel gets the palette colour nearest to it, remembered for each exact colour.
   (gifenc's own applyPalette groups similar colours to save time, which shifted the whites and greys of screen recordings.) */
function mapToPalette(rgba, palette, cache, count) {
  const out = new Uint8Array(rgba.length / 4);
  for (let i = 0, p = 0; i < rgba.length; i += 4, p++) {
    const key = (rgba[i] << 16) | (rgba[i + 1] << 8) | rgba[i + 2];
    let best = cache.get(key);
    if (best === undefined) {
      let bd = Infinity; best = 0;
      for (let k = 0; k < count; k++) { const c = palette[k], dr = c[0] - rgba[i], dg = c[1] - rgba[i + 1], db = c[2] - rgba[i + 2], d = 2 * dr * dr + 4 * dg * dg + 3 * db * db; if (d < bd) { bd = d; best = k; } }
      cache.set(key, best);
    }
    out[p] = best;
  }
  return out;
}

export const MAX_FRAMES = 900;                       // 90 seconds at 10 frames a second

/* Recordings made by Chrome's MediaRecorder often report an infinite length until the end has been read once. */
export async function readyDuration(video) {
  if (video.readyState < 1) await new Promise((res, rej) => { video.addEventListener("loadedmetadata", res, { once: true }); video.addEventListener("error", () => rej(new Error("This video could not be opened.")), { once: true }); });
  if (Number.isFinite(video.duration) && video.duration > 0) return video.duration;
  await new Promise(res => {
    const done = () => { if (Number.isFinite(video.duration)) { video.removeEventListener("durationchange", done); res(); } };
    video.addEventListener("durationchange", done); video.currentTime = 1e101; setTimeout(res, 4000);
  });
  video.currentTime = 0;
  return Number.isFinite(video.duration) ? video.duration : 0;
}

function seek(video, t) {
  return new Promise((res, rej) => {
    if (Math.abs(video.currentTime - t) < 1e-3 && video.readyState >= 2) return res();
    const ok = () => { clean(); res(); }, bad = () => { clean(); rej(new Error("The video could not be read at " + t.toFixed(2) + " s.")); };
    const clean = () => { video.removeEventListener("seeked", ok); video.removeEventListener("error", bad); };
    video.addEventListener("seeked", ok); video.addEventListener("error", bad); video.currentTime = t;
  });
}

export function sizeFor(video, width) {
  const vw = video.videoWidth || 640, vh = video.videoHeight || 360, w = Math.min(width || vw, vw);
  return { w: Math.max(2, Math.round(w / 2) * 2), h: Math.max(2, Math.round(w * vh / vw / 2) * 2) };
}

export function frameTimes(start, end, fps) {
  const out = [], step = 1 / fps;
  for (let t = start; t < end - 1e-6 && out.length < MAX_FRAMES; t += step) out.push(+t.toFixed(4));
  return out;
}

/**
 * Make a GIF from part of a video.
 * @param {HTMLVideoElement} video  a loaded video element (it is paused and seeked while the GIF is made)
 * @param {{start:number, end:number, fps:number, width:number, loop:boolean, onProgress?:(done:number, total:number, stage:string)=>void, signal?:AbortSignal}} o
 * @returns {Promise<{blob: Blob, frames: number, width: number, height: number}>}
 */
export async function makeGif(video, o) {
  const fps = Math.max(1, Math.min(30, o.fps || 10)), times = frameTimes(o.start, o.end, fps);
  if (!times.length) throw new Error("Choose an end time after the start time.");
  const { w, h } = sizeFor(video, o.width), cv = document.createElement("canvas"); cv.width = w; cv.height = h;
  const cx = cv.getContext("2d", { willReadFrequently: true }); cx.imageSmoothingQuality = "high";
  const check = () => { if (o.signal?.aborted) throw new DOMException("The GIF was cancelled.", "AbortError"); };
  const grab = async t => { check(); await seek(video, t); cx.drawImage(video, 0, 0, w, h); return cx.getImageData(0, 0, w, h).data; };
  video.pause();

  // 1. one palette for the whole GIF, from up to 12 frames spread across the clip (255 colours, plus one for "unchanged")
  const picks = [...new Set(Array.from({ length: Math.min(12, times.length) }, (_, i) => times[Math.round(i * (times.length - 1) / Math.max(1, Math.min(12, times.length) - 1))]))];
  const sample = new Uint8ClampedArray(picks.length * w * h * 4);
  for (let i = 0; i < picks.length; i++) { sample.set(await grab(picks[i]), i * w * h * 4); o.onProgress?.(i + 1, picks.length, "palette"); }
  const palette = quantize(sample, 255, { format: "rgb565" });
  const clear = palette.length, cache = new Map(); palette.push([255, 0, 255]);   // the "unchanged" colour, never shown

  // 2. frames: only changed pixels; identical frames become one longer frame
  const gif = GIFEncoder(), delay = 1000 / fps;
  let shown = null, pending = null, pendingDelay = 0, written = 0;
  const flush = () => { if (!pending) return;
    gif.writeFrame(pending.index, w, h, written === 0 ? { palette, delay: pendingDelay, repeat: o.loop === false ? -1 : 0 } : { delay: pendingDelay, transparent: true, transparentIndex: clear, dispose: 1 });
    written++; pending = null; };
  for (let i = 0; i < times.length; i++) {
    const index = mapToPalette(await grab(times[i]), palette, cache, clear);
    if (cache.size > 400000) cache.clear();                                    // very colourful video: keep memory in check
    if (!shown) { pending = { index }; pendingDelay = delay; shown = index; }
    else {
      const out = new Uint8Array(index.length); let changed = 0;
      for (let p = 0; p < index.length; p++) { if (index[p] === shown[p]) out[p] = clear; else { out[p] = index[p]; changed++; } }
      if (!changed) pendingDelay += delay;                                    // nothing moved: show the last frame longer
      else { flush(); pending = { index: out }; pendingDelay = delay; shown = index; }
    }
    o.onProgress?.(i + 1, times.length, "frames");
    if (i % 4 === 3) await new Promise(r => setTimeout(r, 0));                // keep the page responsive
  }
  flush(); gif.finish();
  return { blob: new Blob([gif.bytes()], { type: "image/gif" }), frames: written, width: w, height: h };
}
