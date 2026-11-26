/* Little Light Lit Screen & GIF: record a tab, window or screen with your voice, then download it or make a GIF;
   or turn part of any video into a GIF. Everything happens in the browser: nothing is uploaded.
   The recorder is adapted from Lassolve's; the GIF engine and panel are shared with it. */
import { mountGifPanel } from "./gifpanel.js";

const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const KEY = "littlelightlit-screen", NS = "littlelightlit";
const canCount = !navigator.globalPrivacyControl && navigator.doNotTrack !== "1" && /^https?:/.test(location.protocol);
const noCount = () => { try { return localStorage.getItem("littlelightlit-nocount") === "1"; } catch { return false; } };
const count = k => { if (noCount()) return; if (canCount) fetch(`https://abacus.jasoncameron.dev/hit/${NS}/${k}`, { keepalive: true }).catch(() => {}); };

let surface = "browser", rec = null, chunks = [], streams = [], t0 = 0, paused = 0, pauseStart = 0, tick = 0, mime = "", blob = null, micTrack = null, ac = null;
let testStream = null, testCtx = null, liveCtx = null;
const fmt = ms => { const s = Math.floor(ms / 1000); return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`; };
const showErr = m => { $("#err").hidden = false; $("#err").textContent = m; };
const save = () => { try { localStorage.setItem(KEY, JSON.stringify({ surface, sysAudio: $("#sysAudio").checked, mic: $("#mic").checked, countdown: $("#countdown").checked, quality: $("#quality").value, fps: $("#fps").value })); } catch {} };

/* ---------- settings, and whether this browser can record a screen at all ---------- */
$$(".seg button").forEach(b => b.onclick = () => { surface = b.dataset.s; $$(".seg button").forEach(x => x.setAttribute("aria-pressed", x === b)); save(); });
try { const s = JSON.parse(localStorage.getItem(KEY) || "{}"); if (s.surface) $(`[data-s="${s.surface}"]`)?.click(); ["sysAudio", "countdown"].forEach(k => { if (k in s) $("#" + k).checked = s[k]; }); if (s.quality) $("#quality").value = s.quality; if (s.fps) $("#fps").value = s.fps; } catch {}
["#sysAudio", "#countdown", "#quality", "#fps"].forEach(s => $(s).addEventListener("change", save));
const canRecord = !!navigator.mediaDevices?.getDisplayMedia && typeof MediaRecorder !== "undefined";
if (!canRecord) { $("#noScreen").hidden = false; $("#recOpts").hidden = true; $("#start").disabled = true; }          // only the explanation, on phones

/* ---------- modes ---------- */
function setMode(m) {
  if (rec) return;
  $$("#modes button").forEach(b => b.setAttribute("aria-pressed", b.dataset.mode === m));
  const gif = m === "gif"; stopMicTest();
  $("#setup").hidden = gif || !$("#done").hidden; $("#convert").hidden = !gif; if (gif) $("#done").hidden = true;
  $("#title").textContent = gif ? "Video to GIF" : "Record your screen";
  $("#sub").textContent = gif ? "Turn part of any video into an animated GIF, on your device." : "Record a tab, a window or your whole screen, with your voice. Then download it, or make a GIF.";
  history.replaceState(null, "", gif ? "#gif" : location.pathname);
}
$$("#modes button").forEach(b => b.onclick = () => setMode(b.dataset.mode));

/* ---------- your voice: a check before recording, and a meter while recording (decibels, as loudness is heard) ---------- */
function meter(stream, bar) {
  const ctx = new AudioContext(), an = ctx.createAnalyser(); an.fftSize = 512; ctx.createMediaStreamSource(stream).connect(an); ctx.resume().catch(() => {});
  const buf = new Uint8Array(an.fftSize); let shown = 0;
  (function loop() { if (ctx.state === "closed") return; an.getByteTimeDomainData(buf);
    let sum = 0; for (const v of buf) { const x = (v - 128) / 128; sum += x * x; }
    const level = Math.max(0, Math.min(1, (20 * Math.log10(Math.sqrt(sum / buf.length) + 1e-9) + 60) / 54));
    shown = level > shown ? level : shown * 0.9 + level * 0.1; bar.style.width = (shown * 100).toFixed(0) + "%"; requestAnimationFrame(loop); })();
  return ctx;
}
async function startMicTest() {
  stopMicTest(); $("#micTest").hidden = false; $("#micTestMsg").textContent = "Speak to test your microphone";
  try { testStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }); testCtx = meter(testStream, $("#micTestBar"));
    const label = testStream.getAudioTracks()[0]?.label; if (label) $("#micTestMsg").textContent = "Speak to test: " + label; }
  catch { $("#micTestMsg").textContent = "Your browser blocked the microphone. Allow it in the address bar, or your voice won’t be recorded."; }
}
function stopMicTest() { testStream?.getTracks().forEach(t => t.stop()); testStream = null; testCtx?.close(); testCtx = null; $("#micTestBar").style.width = "0"; $("#micTest").hidden = true; }
$("#mic").addEventListener("change", () => { save(); $("#mic").checked ? startMicTest() : stopMicTest(); });

/* ---------- recording ---------- */
function pickMime() { return ["video/mp4;codecs=avc1.42E01F,mp4a.40.2", "video/mp4;codecs=avc1,mp4a", "video/mp4", "video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"].find(m => MediaRecorder.isTypeSupported(m)) || ""; }
$("#start").onclick = async () => {
  if (!canRecord) return;
  $("#err").hidden = true; stopMicTest(); save();
  const q = +$("#quality").value, fps = +$("#fps").value;
  let display;
  try {
    display = await navigator.mediaDevices.getDisplayMedia({
      video: { displaySurface: surface, frameRate: { ideal: fps, max: fps }, ...(q ? { height: { ideal: q, max: q } } : {}), cursor: "always" },
      audio: $("#sysAudio").checked ? { suppressLocalAudioPlayback: false } : false, selfBrowserSurface: "exclude", surfaceSwitching: "include", systemAudio: "include",
    });
  } catch (e) { stopAll(); return showErr(e.name === "NotAllowedError" ? "Recording was cancelled. Choose Start recording to try again." : "Your browser couldn’t start the recording: " + e.message); }
  streams.push(display);
  const tracks = [...display.getVideoTracks()], sys = display.getAudioTracks(); let mic = null;
  if ($("#mic").checked) { try { mic = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }); streams.push(mic); micTrack = mic.getAudioTracks()[0]; } catch { showErr("The microphone was blocked, so your voice won’t be recorded."); } }
  if (sys.length && mic) { ac = new AudioContext(); const dest = ac.createMediaStreamDestination(); ac.createMediaStreamSource(new MediaStream(sys)).connect(dest); ac.createMediaStreamSource(mic).connect(dest); tracks.push(dest.stream.getAudioTracks()[0]); }
  else if (sys.length) tracks.push(sys[0]); else if (mic) tracks.push(micTrack);
  if ($("#countdown").checked) { const c = $("#count"); c.hidden = false; for (let n = 3; n > 0; n--) { c.textContent = n; await new Promise(r => setTimeout(r, 900)); } c.hidden = true; }
  mime = pickMime(); chunks = [];
  rec = new MediaRecorder(new MediaStream(tracks), mime ? { mimeType: mime, videoBitsPerSecond: q === 720 ? 4e6 : 8e6 } : undefined);
  rec.ondataavailable = e => e.data.size && chunks.push(e.data); rec.onstop = finish;
  display.getVideoTracks()[0].addEventListener("ended", () => rec?.state !== "inactive" && rec.stop());
  rec.start(1000); t0 = Date.now(); paused = 0; count("screen_recordings");
  $("#setup").hidden = true; $("#modes").hidden = true; $("#live").hidden = false; $("#muteMic").hidden = !micTrack; $("#title").textContent = "Recording"; $("#sub").textContent = "Little Light Lit is recording what you chose.";
  $("#micLive").hidden = !micTrack; if (micTrack) liveCtx = meter(new MediaStream([micTrack]), $("#micLiveBar"));
  tick = setInterval(() => { const now = rec.state === "paused" ? pauseStart : Date.now(); $("#timer").textContent = fmt(now - t0 - paused); document.title = `● ${$("#timer").textContent} Little Light Lit`; }, 250);
};
$("#pause").onclick = () => {
  if (!rec) return;
  if (rec.state === "recording") { rec.pause(); pauseStart = Date.now(); $("#pause").textContent = "Resume"; $("#state").textContent = "Paused"; $("#dot").style.animation = "none"; }
  else if (rec.state === "paused") { rec.resume(); paused += Date.now() - pauseStart; $("#pause").textContent = "Pause"; $("#state").textContent = "Recording"; $("#dot").style.animation = ""; }
};
$("#muteMic").onclick = () => { if (!micTrack) return; micTrack.enabled = !micTrack.enabled; $("#muteMic").textContent = micTrack.enabled ? "Mute mic" : "Unmute mic"; $("#micLive").style.opacity = micTrack.enabled ? 1 : .45; };
$("#stop").onclick = () => rec?.state !== "inactive" && rec.stop();
function stopAll() { liveCtx?.close(); liveCtx = null; $("#micLive").hidden = true; streams.forEach(s => s.getTracks().forEach(t => t.stop())); streams = []; ac?.close(); ac = null; micTrack = null; }
function finish() {
  clearInterval(tick); $("#modes").hidden = false; const dur = Date.now() - t0 - paused; stopAll();
  const type = (rec.mimeType || mime || "video/webm").split(";")[0]; blob = new Blob(chunks, { type }); rec = null;
  $("#live").hidden = true; $("#done").hidden = false; $("#title").textContent = "Your recording"; $("#sub").textContent = "Watch it back, then download the video, or make a GIF from part of it."; document.title = "Little Light Lit Screen & GIF";
  $("#preview").src = URL.createObjectURL(blob);
  $("#meta").innerHTML = `<span>${fmt(dur)}</span><span>${(blob.size / 1048576).toFixed(1)} MB</span><span>${type.includes("mp4") ? "MP4" : "WebM"}</span>`;
  $("#download").focus();
}
$("#download").onclick = () => { if (!blob) return; const a = document.createElement("a"); a.href = $("#preview").src; a.download = `littlelightlit-recording-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.${blob.type.includes("mp4") ? "mp4" : "webm"}`; a.click(); count("screen_downloads"); };
$("#again").onclick = () => { $("#done").hidden = true; $("#setup").hidden = false; $("#title").textContent = "Record your screen"; $("#sub").textContent = "Record a tab, a window or your whole screen, with your voice. Then download it, or make a GIF."; if ($("#mic").checked) startMicTest(); $("#start").focus(); };
addEventListener("keydown", e => { if (e.key === " " && !$("#live").hidden && document.activeElement.tagName !== "BUTTON") { e.preventDefault(); $("#pause").click(); } });
addEventListener("beforeunload", e => { if (rec) { e.preventDefault(); e.returnValue = ""; } });

/* ---------- GIFs: one panel under each recording, one in Video to GIF ---------- */
mountGifPanel($("#gifRec"), $("#preview"), { baseName: "littlelightlit-recording", note: "Your voice stays in the video download.", onMade: () => count("screen_gifs") });
const src = $("#srcVideo"), drop = $("#drop"), file = $("#file"), wrap = $("#convWrap"), err = $("#convErr");
let url = "", base = "littlelightlit-gif";
mountGifPanel($("#gifConv"), src, { baseName: () => base, onMade: () => count("video_to_gif") });
function open(f) {
  err.hidden = true; if (!f) return;
  if (!/^video\//.test(f.type) && !/\.(mp4|webm|mov|m4v|mkv|ogv)$/i.test(f.name)) { err.hidden = false; err.textContent = "That file isn’t a video. Choose an MP4, WebM or MOV file."; return; }
  if (url) URL.revokeObjectURL(url);
  url = URL.createObjectURL(f); base = f.name.replace(/\.[^.]+$/, "").replace(/[^\w.-]+/g, "-").slice(0, 60) || "littlelightlit-gif";
  src.src = url; wrap.hidden = false; drop.hidden = true;
  $("#srcMeta").innerHTML = `<span>${f.name.replace(/[<>&"]/g, "")}</span><span>${f.size >= 1048576 ? (f.size / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(f.size / 1024)) + " KB"}</span>`;
}
src.addEventListener("error", () => { if (!src.getAttribute("src")) return; err.hidden = false; err.textContent = "Your browser can’t play this video, so it can’t become a GIF. MP4 (H.264) and WebM work best."; wrap.hidden = true; drop.hidden = false; });
file.addEventListener("change", () => open(file.files[0]));
["dragenter", "dragover"].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.add("over"); }));
["dragleave", "drop"].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.remove("over"); }));
drop.addEventListener("drop", e => open(e.dataTransfer.files[0]));
$("#another").onclick = () => { src.pause(); src.removeAttribute("src"); src.load(); wrap.hidden = true; drop.hidden = false; file.value = ""; file.focus(); };

$("#toGif").onclick = () => setMode("gif");
if (location.hash === "#gif" || !canRecord) setMode("gif");          // last, once everything it uses exists; phones open on Video to GIF
