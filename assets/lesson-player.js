/* Booth Lessons: the student player. It runs inside every exported lesson and inside the teacher's preview.
   Modes: "standalone" (students hand in a file, code or email), "scorm" (reports to Moodle, Canvas and other
   SCORM 1.2 platforms), and "sls" (reports the score to Singapore's Student Learning Space through xAPI). */
(() => {
  const L = window.LESSON, MODE = window.LESSON_MODE || "standalone", $ = s => document.querySelector(s), esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  /* ---------- interface languages ---------- */
  const T = {
    en: { locked: "This video plays straight through, without skipping.", speedCap: "Playback speed is limited to {x}×.", again: "Watch again", restart: "Start over", look: "Drag to look around", resetView: "Reset view", close: "Close", savedShort: "Saved", pick: "Choose", ending: "Your ending: {e}", start: "Start", before: "Before you start", name: "Your name", cls: "Class", needName: "Please type your name.", q: "Question", open: "Your thoughts", poll: "Quick poll", note: "Note", know: "Something to know", type: "Type your answer", all: "Choose all that apply.", rew: "Watch that part again", submit: "Submit", cont: "Continue", write: "Please write an answer first.", choose: "Choose an answer first.", thanks: "Thanks! Your response is saved.", right: "Correct.", wrong: "Not quite.", again: "Try again", of: "of", correct: "correct", done: "All done", got: "You got {a} of {b} right", watched: "Thanks for watching", skipped: "{n} skipped", dl: "Download my answers", copy: "Copy my answers code", send: "Send my answers", email: "Email my answers", saved: "Saved. Hand this file in to your teacher.", copied: "Copied. Paste it wherever your teacher asked.", sending: "Sending…", sent: "Sent to your teacher.", fail: "Couldn’t send. Use “Download my answers” instead.", hint: "The video pauses for each question.", noskip: "You can rewind, but not skip ahead.", resume: "Welcome back: you can carry on where you left off.", lms: "Your result has been saved.", emailed: "Your email app should open. Press send to hand in.", play: "Play", pause: "Pause" },
    ms: { locked: "Video ini dimainkan terus tanpa melangkau.", speedCap: "Kelajuan main terhad kepada {x}×.", again: "Tonton semula", restart: "Mula semula", look: "Seret untuk melihat sekeliling", resetView: "Set semula pandangan", close: "Tutup", savedShort: "Disimpan", pick: "Pilih", ending: "Pengakhiran anda: {e}", start: "Mula", before: "Sebelum anda mula", name: "Nama anda", cls: "Kelas", needName: "Sila taip nama anda.", q: "Soalan", open: "Pendapat anda", poll: "Undian ringkas", note: "Nota", know: "Perlu tahu", type: "Taip jawapan anda", all: "Pilih semua yang betul.", rew: "Tonton bahagian itu semula", submit: "Hantar", cont: "Teruskan", write: "Sila tulis jawapan dahulu.", choose: "Pilih jawapan dahulu.", thanks: "Terima kasih! Jawapan anda disimpan.", right: "Betul.", wrong: "Belum tepat.", again: "Cuba lagi", of: "daripada", correct: "betul", done: "Selesai", got: "Anda betul {a} daripada {b}", watched: "Terima kasih kerana menonton", skipped: "{n} dilangkau", dl: "Muat turun jawapan saya", copy: "Salin kod jawapan saya", send: "Hantar jawapan saya", email: "E-mel jawapan saya", saved: "Disimpan. Serahkan fail ini kepada guru anda.", copied: "Disalin. Tampal di tempat yang diminta guru.", sending: "Menghantar…", sent: "Dihantar kepada guru anda.", fail: "Tidak dapat dihantar. Gunakan “Muat turun jawapan saya”.", hint: "Video akan berhenti untuk setiap soalan.", noskip: "Anda boleh undur, tetapi tidak boleh langkau ke hadapan.", resume: "Selamat kembali: anda boleh sambung dari tempat tadi.", lms: "Keputusan anda telah disimpan.", emailed: "Aplikasi e-mel anda akan dibuka. Tekan hantar.", play: "Main", pause: "Jeda" },
    zh: { locked: "此视频需连续观看，不能跳过。", speedCap: "播放速度最高为 {x}×。", again: "再看一遍", restart: "重新开始", look: "拖动以环顾四周", resetView: "重置视角", close: "关闭", savedShort: "已保存", pick: "选择", ending: "你的结局：{e}", start: "开始", before: "开始之前", name: "你的名字", cls: "班级", needName: "请输入你的名字。", q: "问题", open: "你的想法", poll: "快速投票", note: "注意", know: "需要知道", type: "输入你的答案", all: "选择所有正确答案。", rew: "再看一遍这部分", submit: "提交", cont: "继续", write: "请先写下答案。", choose: "请先选择答案。", thanks: "谢谢！你的回答已保存。", right: "正确。", wrong: "不太对。", again: "再试一次", of: "/", correct: "正确", done: "完成", got: "你答对了 {a} / {b}", watched: "感谢观看", skipped: "跳过了 {n} 题", dl: "下载我的答案", copy: "复制我的答案代码", send: "发送我的答案", email: "用电邮发送答案", saved: "已保存。请把文件交给老师。", copied: "已复制。粘贴到老师要求的地方。", sending: "发送中…", sent: "已发送给老师。", fail: "发送失败。请使用“下载我的答案”。", hint: "视频会在每个问题处暂停。", noskip: "你可以倒退，但不能快进。", resume: "欢迎回来：可以从上次停下的地方继续。", lms: "你的成绩已保存。", emailed: "电邮应用将打开，请按发送。", play: "播放", pause: "暂停" },
    ta: { locked: "இந்தக் காணொளி தவிர்க்காமல் தொடர்ந்து இயங்கும்.", speedCap: "இயக்க வேகம் {x}× வரை மட்டுமே.", again: "மீண்டும் பார்", restart: "மீண்டும் தொடங்கு", look: "சுற்றிப் பார்க்க இழுக்கவும்", resetView: "பார்வையை மீட்டமை", close: "மூடு", savedShort: "சேமிக்கப்பட்டது", pick: "தேர்ந்தெடு", ending: "உங்கள் முடிவு: {e}", start: "தொடங்கு", before: "தொடங்கும் முன்", name: "உங்கள் பெயர்", cls: "வகுப்பு", needName: "உங்கள் பெயரைத் தட்டச்சு செய்யவும்.", q: "கேள்வி", open: "உங்கள் கருத்து", poll: "விரைவு வாக்கெடுப்பு", note: "குறிப்பு", know: "தெரிந்துகொள்ள", type: "உங்கள் பதிலைத் தட்டச்சு செய்யவும்", all: "சரியானவை அனைத்தையும் தேர்ந்தெடுக்கவும்.", rew: "அந்தப் பகுதியை மீண்டும் பார்", submit: "சமர்ப்பி", cont: "தொடர்", write: "முதலில் பதில் எழுதவும்.", choose: "முதலில் ஒரு பதிலைத் தேர்ந்தெடுக்கவும்.", thanks: "நன்றி! உங்கள் பதில் சேமிக்கப்பட்டது.", right: "சரி.", wrong: "சரியில்லை.", again: "மீண்டும் முயற்சி", of: "/", correct: "சரி", done: "முடிந்தது", got: "{b} இல் {a} சரி", watched: "பார்த்ததற்கு நன்றி", skipped: "{n} தவிர்க்கப்பட்டது", dl: "என் பதில்களைப் பதிவிறக்கு", copy: "என் பதில் குறியீட்டை நகலெடு", send: "என் பதில்களை அனுப்பு", email: "பதில்களை மின்னஞ்சல் செய்", saved: "சேமிக்கப்பட்டது. இதை உங்கள் ஆசிரியரிடம் ஒப்படைக்கவும்.", copied: "நகலெடுக்கப்பட்டது.", sending: "அனுப்புகிறது…", sent: "ஆசிரியருக்கு அனுப்பப்பட்டது.", fail: "அனுப்ப முடியவில்லை. பதிவிறக்கவும்.", hint: "ஒவ்வொரு கேள்விக்கும் காணொளி நிற்கும்.", noskip: "பின்னோக்கிச் செல்லலாம், முன்னோக்கித் தாவ முடியாது.", resume: "மீண்டும் வருக: விட்ட இடத்திலிருந்து தொடரலாம்.", lms: "உங்கள் மதிப்பெண் சேமிக்கப்பட்டது.", emailed: "மின்னஞ்சல் செயலி திறக்கும். அனுப்பு அழுத்தவும்.", play: "இயக்கு", pause: "இடைநிறுத்து" },
    id: { locked: "Video ini diputar langsung tanpa bisa dilewati.", speedCap: "Kecepatan putar dibatasi hingga {x}×.", again: "Tonton lagi", restart: "Mulai ulang", look: "Seret untuk melihat sekeliling", resetView: "Atur ulang tampilan", close: "Tutup", savedShort: "Tersimpan", pick: "Pilih", ending: "Akhir ceritamu: {e}", start: "Mulai", before: "Sebelum mulai", name: "Nama kamu", cls: "Kelas", needName: "Silakan ketik namamu.", q: "Pertanyaan", open: "Pendapatmu", poll: "Jajak pendapat", note: "Catatan", know: "Perlu diketahui", type: "Ketik jawabanmu", all: "Pilih semua yang benar.", rew: "Tonton bagian itu lagi", submit: "Kirim", cont: "Lanjut", write: "Tulis jawaban dulu.", choose: "Pilih jawaban dulu.", thanks: "Terima kasih! Jawabanmu tersimpan.", right: "Benar.", wrong: "Belum tepat.", again: "Coba lagi", of: "dari", correct: "benar", done: "Selesai", got: "Kamu benar {a} dari {b}", watched: "Terima kasih sudah menonton", skipped: "{n} terlewat", dl: "Unduh jawabanku", copy: "Salin kode jawabanku", send: "Kirim jawabanku", email: "Kirim lewat email", saved: "Tersimpan. Serahkan file ini ke gurumu.", copied: "Tersalin. Tempel di tempat yang diminta guru.", sending: "Mengirim…", sent: "Terkirim ke gurumu.", fail: "Gagal mengirim. Gunakan “Unduh jawabanku”.", hint: "Video berhenti di setiap pertanyaan.", noskip: "Kamu bisa mundur, tapi tidak bisa melompat maju.", resume: "Selamat datang kembali: lanjutkan dari tempat terakhir.", lms: "Nilaimu sudah tersimpan.", emailed: "Aplikasi email akan terbuka. Tekan kirim.", play: "Putar", pause: "Jeda" },
    vi: { locked: "Video này phát liên tục, không thể tua.", speedCap: "Tốc độ phát tối đa {x}×.", again: "Xem lại", restart: "Bắt đầu lại", look: "Kéo để nhìn xung quanh", resetView: "Đặt lại góc nhìn", close: "Đóng", savedShort: "Đã lưu", pick: "Chọn", ending: "Kết thúc của em: {e}", start: "Bắt đầu", before: "Trước khi bắt đầu", name: "Tên của em", cls: "Lớp", needName: "Vui lòng nhập tên.", q: "Câu hỏi", open: "Suy nghĩ của em", poll: "Bình chọn nhanh", note: "Ghi chú", know: "Điều cần biết", type: "Nhập câu trả lời", all: "Chọn tất cả đáp án đúng.", rew: "Xem lại đoạn đó", submit: "Gửi", cont: "Tiếp tục", write: "Vui lòng viết câu trả lời trước.", choose: "Vui lòng chọn đáp án trước.", thanks: "Cảm ơn! Câu trả lời đã được lưu.", right: "Đúng.", wrong: "Chưa đúng.", again: "Thử lại", of: "/", correct: "đúng", done: "Hoàn thành", got: "Em đúng {a} / {b} câu", watched: "Cảm ơn đã xem", skipped: "Bỏ qua {n} câu", dl: "Tải câu trả lời", copy: "Sao chép mã câu trả lời", send: "Gửi câu trả lời", email: "Gửi qua email", saved: "Đã lưu. Hãy nộp tệp này cho giáo viên.", copied: "Đã sao chép. Dán vào nơi giáo viên yêu cầu.", sending: "Đang gửi…", sent: "Đã gửi cho giáo viên.", fail: "Không gửi được. Hãy dùng “Tải câu trả lời”.", hint: "Video sẽ dừng ở mỗi câu hỏi.", noskip: "Em có thể tua lại nhưng không thể tua nhanh.", resume: "Chào mừng trở lại: em có thể học tiếp từ chỗ cũ.", lms: "Kết quả của em đã được lưu.", emailed: "Ứng dụng email sẽ mở. Hãy bấm gửi.", play: "Phát", pause: "Tạm dừng" },
  };
  const t = (k, v = {}) => ((T[L.lang] || T.en)[k] ?? T.en[k]).replace(/\{(\w)\}/g, (_, x) => v[x] ?? "");
  document.documentElement.lang = L.lang || "en";
  const SKIP = L.skip || (L.noSkip ? "rewind" : "allow"), CAP = SKIP === "allow" ? 0 : L.maxSpeed ?? 2, FREE_AFTER = L.freeAfter !== false;
  const Q = [...L.items].sort((a, b) => a.t - b.t), ans = {}, started = new Date().toISOString(), lms = MODE !== "standalone";
  let furthest = 0, overlay = null, student = { name: "", cls: "" }, V = null, finished = false, lastT = 0, reviewing = false, endSnap = null, lmsSent = false, prevS = 0, posOK = 0;
  const restricted = () => SKIP !== "allow" && !reviewing;
  const clips = L.clips?.length ? L.clips : null, VIDS = window.LESSON_VIDEOS || null, CAPS = window.LESSON_CAPTIONS || {};
  let curClip = clips ? clips[0].id : null; const seen = new Set(), furthestBy = {}, durBy = {}, path = clips ? [clips[0].name] : [];
  const isAuto = q => q.type === "branch" || q.type === "jump", isVR = () => clips ? !!clips.find(c => c.id === curClip)?.vr : !!L.vr;
  const clipQ = () => Q.filter(q => !clips || (q.clip || clips[0].id) === curClip), cName = id => clips?.find(c => c.id === id)?.name || "";
  const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  document.title = L.title || "Video lesson";
  document.body.innerHTML = `
  <header><h1>${esc(L.title || "Video lesson")}</h1><span id="score" aria-live="polite"></span></header>
  <main>
    <div class="stage"><div id="media"></div><div class="flash" id="flash" role="status" hidden></div><div class="card-wrap" id="cardWrap" hidden><div class="card" id="card" role="dialog" aria-modal="true" aria-labelledby="cardTitle"></div></div></div>
    <div class="bar"><button id="play" aria-label="${t("play")}">▶</button><div class="track" id="track"><i id="fill"></i></div><span id="time">0:00</span></div>
    <p class="hint" id="hintLine">${SKIP === "locked" ? t("locked") + " " : SKIP === "rewind" ? t("noskip") + " " : ""}${CAP ? t("speedCap", { x: CAP }) + " " : ""}${t("hint")}</p>
  </main>`;
  /* ---------- platform bridges ---------- */
  const Bridge = { start() {}, answer() {}, end() {} };
  if (MODE === "scorm") {
    let api = null; for (let w = window, i = 0; w && i < 12; i++) { try { if (w.API) { api = w.API; break; } } catch { break; } if (w.parent === w) break; w = w.parent; } if (!api && window.opener) try { api = window.opener.API; } catch {}
    const g = k => { try { return api?.LMSGetValue(k) || ""; } catch { return ""; } }, s = (k, v) => { try { api?.LMSSetValue(k, String(v)); } catch {} }, commit = () => { try { api?.LMSCommit(""); } catch {} };
    const t0 = Date.now(); let n = 0;
    Bridge.start = () => { try { api?.LMSInitialize(""); } catch {} const nm = g("cmi.core.student_name"); if (nm) { const [last, first] = nm.split(",").map(x => x.trim()); student.name = first ? `${first} ${last}` : nm; } const st = g("cmi.core.lesson_status"); if (!st || st === "not attempted") s("cmi.core.lesson_status", "incomplete"); commit(); };
    Bridge.answer = (q, a) => { const p = `cmi.interactions.${n++}.`; s(p + "id", `q${Q.indexOf(q) + 1}_${q.id}`); s(p + "type", q.type === "open" ? "fill-in" : "choice"); s(p + "student_response", [].concat(a.answer).join(",").slice(0, 250)); s(p + "result", a.correct === undefined ? "neutral" : (a.correct ? "correct" : "wrong")); commit(); };
    Bridge.end = r => { const pct = r.score.gradable ? Math.round(r.score.correct / r.score.gradable * 100) : 100; s("cmi.core.score.min", 0); s("cmi.core.score.max", 100); s("cmi.core.score.raw", pct); s("cmi.core.lesson_status", r.score.gradable ? (pct >= (L.pass ?? 60) ? "passed" : "failed") : "completed"); const sec = Math.round((Date.now() - t0) / 1000); s("cmi.core.session_time", `${String(Math.floor(sec / 3600)).padStart(4, "0")}:${String(Math.floor(sec / 60) % 60).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`); commit(); try { api?.LMSFinish(""); } catch {} };
    if (!api) console.warn("No SCORM platform found: results won’t be recorded.");
  }
  if (MODE === "sls") {
    // MOE’s published method: read the launch parameters SLS adds to the address, then send the score as xAPI state
    let prm = null; const init = () => { if (prm || !window.ADL) return prm; const u = new URLSearchParams(location.search); try { ADL.XAPIWrapper.changeConfig({ endpoint: u.get("endpoint") + "/", auth: `Basic ${u.get("auth")}` }); prm = { agent: JSON.parse(u.get("agent")), stateId: u.get("stateId"), activityId: u.get("activityId") }; } catch (e) { console.warn("Not running inside SLS", e); } return prm; };
    const sendScore = score => { try { const p = init(); if (p) ADL.XAPIWrapper.sendState(p.activityId, p.agent, p.stateId, null, { score }); } catch (e) { console.error(e); } };
    Bridge.start = () => init(); Bridge.answer = () => sendScore(score()); Bridge.end = r => sendScore(r.score.correct);
  }
  /* ---------- saving progress on this device ---------- */
  const KEY = `booth-lesson-${L.id}`;
  const store = { get() { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; } }, set() { if (window.LESSON_PREVIEW) return; try { localStorage.setItem(KEY, JSON.stringify({ ans, furthest, student, done: finished, clip: curClip, path, seen: [...seen] })); } catch {} } };
  /* ---------- video adapters ---------- */
  function fileAdapter(src) {
    const v = document.createElement("video"); v.src = src; v.playsInline = true; v.preload = "metadata"; $("#media").appendChild(v);
    const cap = () => { v.querySelectorAll("track").forEach(x => x.remove()); const txt = typeof CAPS === "string" ? CAPS : CAPS[curClip]; if (txt) { const tr = document.createElement("track"); tr.kind = "captions"; tr.default = true; tr.srclang = L.lang || "en"; tr.label = "Captions"; tr.src = URL.createObjectURL(new Blob([txt], { type: "text/vtt" })); v.appendChild(tr); } }; cap();
    v.addEventListener("click", () => { if (!overlay) v.paused ? v.play() : v.pause(); });
    v.addEventListener("seeking", () => { if (!restricted()) return; if (SKIP === "locked" ? Math.abs(v.currentTime - posOK) > .8 : v.currentTime > furthest + .8) v.currentTime = SKIP === "locked" ? posOK : furthest; });
    if (SKIP !== "allow") {
      v.disablePictureInPicture = true; v.setAttribute("controlslist", "nodownload noplaybackrate noremoteplayback"); v.setAttribute("disableremoteplayback", "");
      v.addEventListener("contextmenu", e => { if (restricted()) e.preventDefault(); });
      v.addEventListener("ratechange", () => { if (CAP && restricted() && v.playbackRate > CAP) v.playbackRate = CAP; });
      v.addEventListener("enterpictureinpicture", () => { if (restricted()) document.exitPictureInPicture?.().catch(() => {}); });
    }
    v.addEventListener("ended", clipEnded);
    const vr = (clips || []).some(c => c.vr) || L.vr ? makeVR(v, $("#media")) : null; vr?.set(isVR());
    return Promise.resolve({ play: () => v.play(), pause: () => v.pause(), time: () => v.currentTime, seek: s => (v.currentTime = s), dur: () => v.duration || 0, paused: () => v.paused, el: v, setSrc: src => { v.src = src; cap(); v.load(); vr?.set(isVR()); } });
  }
  function ytAdapter(id) {
    return new Promise(res => {
      const d = document.createElement("div"); d.id = "yt"; $("#media").appendChild(d);
      window.onYouTubeIframeAPIReady = () => { const p = new YT.Player("yt", { videoId: id, host: "https://www.youtube-nocookie.com", playerVars: { rel: 0, playsinline: 1, controls: SKIP === "allow" ? 1 : 0, disablekb: SKIP === "allow" ? 0 : 1, cc_load_policy: 1, hl: L.lang || "en" }, events: { onReady: () => res({ play: () => p.playVideo(), pause: () => p.pauseVideo(), time: () => p.getCurrentTime() || 0, seek: s => p.seekTo(s, true), dur: () => p.getDuration() || 0, paused: () => p.getPlayerState() !== 1, el: null, rate: () => p.getPlaybackRate?.() || 1, setRate: r => p.setPlaybackRate?.(r) }), onStateChange: e => { if (e.data === 0) clipEnded(); } } }); };
      const s = document.createElement("script"); s.src = "https://www.youtube.com/iframe_api"; document.head.appendChild(s);
    });
  }
  /* ---------- questions ---------- */
  const order = {};
  function show(q) {
    V.pause(); overlay = q; const a = ans[q.id] || {}, card = $("#card"), multi = q.type === "mc" && q.choices.filter(c => c.ok).length > 1;
    if (q.choices && !order[q.id]) { order[q.id] = q.choices.map((_, i) => i); if (L.shuffle && q.type === "mc") for (let i = order[q.id].length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[q.id][i], order[q.id][j]] = [order[q.id][j], order[q.id][i]]; } }
    let body = "";
    if (q.type === "branch") body = `<div class="choices" role="radiogroup">${q.choices.map((c, i) => `<label class="choice" data-i="${i}"><input type="radio" name="c" value="${i}"><span>${esc(c.text)}</span></label>`).join("")}</div>`;
    else if (q.type === "note") body = `<div class="note">${esc(q.text).replace(/\n/g, "<br>")}</div>${q.link ? (lms ? `<p class="small">${esc(q.link)}</p>` : `<p><a href="${esc(q.link)}" target="_blank" rel="noopener">${esc(q.link)}</a></p>`) : ""}`;
    else if (q.type === "open") body = `<textarea id="openA" rows="4" placeholder="${t("type")}">${esc(a.answer || "")}</textarea>`;
    else body = `<div class="choices" role="${multi ? "group" : "radiogroup"}">${order[q.id].map(i => `<label class="choice" data-i="${i}"><input type="${multi ? "checkbox" : "radio"}" name="c" value="${i}"><span>${esc(q.choices[i].text)}</span></label>`).join("")}</div>${multi ? `<p class="small">${t("all")}</p>` : ""}`;
    card.innerHTML = `<p class="kind">${q.type === "branch" ? esc(cName(curClip) || t("q")) : t({ mc: "q", open: "open", poll: "poll", note: "note" }[q.type])} · ${fmt(q.t)}</p><h2 id="cardTitle">${esc(q.prompt || (q.type === "note" ? t("know") : ""))}</h2>${body}<div class="fb" id="fb" aria-live="polite"></div>
      <div class="actions">${q.type !== "note" && q.type !== "branch" && L.rewatch !== false && SKIP !== "locked" ? `<button class="ghost" id="rewatch">${t("rew")}</button>` : ""}<button id="submit">${q.type === "note" ? t("cont") : q.type === "branch" ? t("pick") : t("submit")}</button></div>`;
    if (q.type === "note") { card.insertAdjacentHTML("afterbegin", `<button class="x" id="closeX" aria-label="${t("close")}">✕</button>`); $("#closeX").onclick = () => submit(q); if (q.auto > 0) autoContinue(q.auto * 1000, () => overlay === q && submit(q)); }
    if (q.type === "open" && q.required === false) $("#submit").insertAdjacentHTML("beforebegin", `<button class="ghost" id="skipQ">${t("cont")}</button>`), $("#skipQ").onclick = () => { const a = ans[q.id] || (ans[q.id] = { tries: 0 }); a.answer = ""; store.set(); next(); };
    $("#cardWrap").hidden = false; setTimeout(() => (card.querySelector("input, textarea, #submit") || card).focus(), 30);
    $("#rewatch") && ($("#rewatch").onclick = () => { const prev = Q.filter(x => x.t < q.t - .5).pop(); hide(); posOK = prev ? prev.t + .3 : 0; V.seek(posOK); V.play(); });
    $("#submit").onclick = () => submit(q);
  }
  let autoT = null, flashT = null;
  function hide() { clearTimeout(autoT); autoT = null; $("#cardWrap").hidden = true; overlay = null; setTimeout(() => $("#play")?.focus({ preventScroll: true }), 0); }
  function flash(m) { const f = $("#flash"); f.textContent = m; f.hidden = false; clearTimeout(flashT); flashT = setTimeout(() => (f.hidden = true), 1600); }
  // after an answer: close by itself, with a draining bar; a click anywhere or Enter continues sooner
  function autoContinue(ms, then) { clearTimeout(autoT); const card = $("#card"); card.querySelector(".auto")?.remove(); card.insertAdjacentHTML("beforeend", `<div class="auto" aria-hidden="true"><i style="animation-duration:${ms}ms"></i></div>`); autoT = setTimeout(then, ms); }
  $("#cardWrap").addEventListener("click", e => { if (e.target.id !== "cardWrap" || !overlay) return; if (overlay.type === "note") return submit(overlay); if (autoT) { const b = $("#submit"); b?.click(); } });
  addEventListener("keydown", e => {
    if (!overlay || $("#cardWrap").hidden) return; const ae = document.activeElement, inArea = ae?.tagName === "TEXTAREA", inText = inArea || (ae?.tagName === "INPUT" && !["radio", "checkbox"].includes(ae.type));
    if (e.key === "Escape" && overlay.type === "note") { e.preventDefault(); return submit(overlay); }
    if (!inText && /^[1-9]$/.test(e.key)) { const c = document.querySelectorAll(".choices input")[+e.key - 1]; if (c && !c.disabled) { e.preventDefault(); c.checked = c.type === "checkbox" ? !c.checked : true; c.focus(); } return; }
    if (e.key === "Enter" && (!inArea || e.ctrlKey || e.metaKey)) { const b = $("#submit"), go = $("#go"); if (go) { e.preventDefault(); return go.click(); } if (b) { e.preventDefault(); b.click(); } }
  });
  function submit(q) {
    const a = ans[q.id] || (ans[q.id] = { tries: 0 }), fb = $("#fb");
    if (q.type === "note") { a.answer = "seen"; a.at = V.time(); store.set(); return next(); }
    if (q.type === "branch") { const pick = document.querySelector(".choices input:checked"); if (!pick) { fb.textContent = t("choose"); return; } const o = q.choices[+pick.value]; a.tries++; if (a.answer === undefined || L.retries) { a.answer = [o.text]; if (q.choices.some(c => c.ok)) a.correct = !!o.ok; } a.at = V.time(); seen.add(q.id); path.push(`“${o.text}”`); store.set(); Bridge.answer(q, a); hide(); updateScore(); return jumpTo(o.to, o.at); }
    if (q.type === "open") { const v = $("#openA").value.trim(); if (!v && q.required !== false) { fb.textContent = t("write"); return; } a.answer = v; a.at = V.time(); a.tries++; store.set(); Bridge.answer(q, a); next(); return flash(t("savedShort")); }
    const picked = [...document.querySelectorAll(".choices input:checked")].map(i => +i.value); if (!picked.length) { fb.textContent = t("choose"); return; }
    a.tries++; a.answer = picked.map(i => q.choices[i].text); a.at = V.time();
    if (q.type === "poll") { fb.innerHTML = `<b>${t("thanks")}</b>`; store.set(); Bridge.answer(q, a); finishBtn(); return autoContinue(1300, next); }
    const right = q.choices.map((c, i) => c.ok ? i : -1).filter(i => i >= 0), ok = right.length === picked.length && right.every(i => picked.includes(i));
    if (a.correct === undefined || L.retries) a.correct = ok;
    document.querySelectorAll(".choice").forEach(el => { const i = +el.dataset.i; if (L.showAnswers !== false) el.classList.toggle("right", right.includes(i)); if (picked.includes(i) && !right.includes(i)) el.classList.add("wrong"); });
    fb.innerHTML = (ok ? `<b class="ok">${t("right")}</b> ` : `<b class="no">${t("wrong")}</b> `) + esc(ok ? (q.fbOk || "") : (q.fbNo || ""));
    store.set();
    if (!ok && L.retries && a.tries < 3) { $("#submit").textContent = t("again"); $("#submit").onclick = () => { document.querySelectorAll(".choice").forEach(el => el.classList.remove("right", "wrong")); fb.textContent = ""; $("#submit").textContent = t("submit"); $("#submit").onclick = () => submit(q); }; return; }
    Bridge.answer(q, a); finishBtn(); updateScore();
    const words = (fb.textContent || "").split(/\s+/).length; autoContinue(Math.min(7000, (ok ? 1400 : 2200) + words * 260), next);
  }
  function finishBtn() { document.querySelectorAll(".choices input").forEach(i => i.disabled = true); $("#submit").textContent = t("cont"); $("#submit").onclick = next; }
  function next() { hide(); updateScore(); V.play(); }
  const gradable = () => Q.filter(q => q.type === "mc" || (q.type === "branch" && q.choices.some(c => c.ok))), score = () => gradable().filter(q => ans[q.id]?.correct).length;
  /* ---------- moving between clips ---------- */
  function jumpTo(to, at) { if (to === "__end") return end(); if (to === "__time") return seekWithin(+at || 0); if (to) return goto(to); V.play(); }
  // jump to a time in the same clip: choices and jump points after that time ask again
  function seekWithin(tm) { clipQ().filter(q => isAuto(q) && q.t > tm + .3).forEach(q => seen.delete(q.id)); furthest = Math.max(furthest, tm); lastT = tm; prevS = tm; posOK = tm; path.push(`→ ${fmt(tm)}`); V.seek(tm); store.set(); V.play(); }
  function goto(id) { creditClip(false); if (!clips || !VIDS?.[id]) return end(); curClip = id; furthest = 0; lastT = 0; prevS = 0; posOK = 0; clipQ().filter(isAuto).forEach(q => seen.delete(q.id)); path.push(cName(id)); V.setSrc(VIDS[id]); drawMarkers(); store.set(); V.play(); }
  function creditClip(full) { if (!clips || !V) return; const d = V.dur(); durBy[curClip] = d; furthestBy[curClip] = Math.max(furthestBy[curClip] || 0, full ? d : V.time()); }
  function clipEnded() { creditClip(true); if (!clips) return end(); const i = clips.findIndex(c => c.id === curClip), c = clips[i], rule = c?.end || "next"; if (rule === "end") return end(); if (rule === "next") return clips[i + 1] ? goto(clips[i + 1].id) : end(); return goto(rule); }
  function updateScore() { if (gradable().length) $("#score").textContent = `${score()} ${t("of")} ${gradable().length} ${t("correct")}`; }
  /* ---------- timing, skipping and progress ---------- */
  function loop() {
    if (V && !finished) {
      const s = V.time(), d = V.dur();
      if (restricted()) {
        if (!V.el) { if (SKIP === "locked" ? Math.abs(s - posOK) > 1.5 : s > furthest + 1.5) V.seek(SKIP === "locked" ? posOK : furthest); if (CAP && V.rate?.() > CAP) V.setRate(CAP); }
        else if (V.el.controls) V.el.controls = false;
      }
      if (s >= posOK && s - posOK < 1.5) posOK = s;
      if (s > furthest && s - lastT < 1.5) { furthest = s; if (Math.floor(s) % 5 === 0) store.set(); } lastT = s;
      if (clips) { furthestBy[curClip] = Math.max(furthestBy[curClip] || 0, furthest); durBy[curClip] = d; }
      const playedThrough = s >= prevS && s - prevS < 1, crossed = x => playedThrough && x.t > prevS - .05 && x.t <= s + .02;
      if (!overlay) { const q = clipQ().find(x => (isAuto(x) ? !seen.has(x.id) : !ans[x.id]?.answer) && crossed(x)); if (q) { if (q.type === "jump") { seen.add(q.id); prevS = s; jumpTo(q.to, q.at); } else show(q); } }
      if (!overlay) prevS = s;
      if (d) { $("#fill").style.width = `${s / d * 100}%`; $("#time").textContent = `${fmt(s)} / ${fmt(d)}`; }
      $("#play").textContent = V.paused() ? "▶" : "❚❚"; $("#play").setAttribute("aria-label", V.paused() ? t("play") : t("pause"));
    }
    requestAnimationFrame(loop);
  }
  function drawMarkers() { const d = V.dur(); if (!d) return setTimeout(drawMarkers, 400); $("#track").querySelectorAll("b").forEach(b => b.remove()); clipQ().filter(q => q.type !== "jump").forEach(q => { const b = document.createElement("b"); b.style.left = `${q.t / d * 100}%`; b.title = fmt(q.t); $("#track").appendChild(b); }); }
  $("#play").onclick = () => { if (overlay) return; V.paused() ? V.play() : V.pause(); };
  $("#track").onclick = e => { if (overlay) return; const r = e.currentTarget.getBoundingClientRect(), s = (e.clientX - r.left) / r.width * V.dur(); if (restricted() && SKIP === "locked") return flash(t("locked")); V.seek(restricted() ? Math.min(s, furthest) : s); };
  /* ---------- the end: results and handing in ---------- */
  function response() {
    const qs = Q.filter(q => q.type !== "jump").map(q => ({ id: q.id, type: q.type, t: Math.round(q.t), prompt: q.prompt || q.text || "", answer: ans[q.id]?.answer ?? null, correct: (q.type === "mc" || (q.type === "branch" && q.choices.some(c => c.ok))) ? !!ans[q.id]?.correct : null, tries: ans[q.id]?.tries || 0 }));
    const d = V.dur() || 1, wat = clips ? Math.round(Object.keys(durBy).reduce((n, k) => n + (furthestBy[k] || 0), 0) / Math.max(1, Object.values(durBy).reduce((n, x) => n + (x || 0), 0)) * 100) : Math.round(furthest / d * 100);
    const r = { kind: "booth-lesson-response", v: 1, lesson: { id: L.id, title: L.title }, student: { name: student.name, cls: student.cls }, startedAt: started, finishedAt: new Date().toISOString(), watched: Math.min(100, wat), score: { correct: score(), gradable: gradable().length }, answers: qs };
    if (clips && clips.length > 1 || path.some(x => x.startsWith("→"))) { r.path = (endSnap || { path }).path.slice(); r.ending = endSnap ? endSnap.ending : cName(curClip); }
    r.check = sum(JSON.stringify([r.lesson.id, r.student, r.score, r.answers]) + L.id); return r;
  }
  function sum(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }
  const toCode = o => "BL1." + btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  function summary(r) { const lines = [L.title, `${t("name")}: ${r.student.name}${r.student.cls ? ` (${r.student.cls})` : ""}`]; if (r.score.gradable) lines.push(`Score: ${r.score.correct} / ${r.score.gradable}`); lines.push(`Watched: ${r.watched}%`); if (r.path) lines.push(`Path: ${r.path.join(" → ")}`); lines.push(""); r.answers.filter(a => a.type !== "note").forEach((a, i) => lines.push(`${i + 1}. ${a.prompt}`, `   ${a.answer === null ? "(skipped)" : [].concat(a.answer).join(", ")}${a.correct === null ? "" : a.correct ? "  ✓" : "  ✗"}`)); return lines.join("\n"); }
  function end() {
    if (finished) return; creditClip(false); finished = true; hide(); if (!endSnap) endSnap = { path: path.slice(), ending: cName(curClip) }; $("#play").textContent = "▶"; $("#play").setAttribute("aria-label", t("play")); const unanswered = Q.filter(q => q.type !== "note" && q.type !== "branch" && q.type !== "jump" && (!clips || path.includes(cName(q.clip || clips[0].id))) && !ans[q.id]?.answer).length;
    const head = `<p class="kind">${t("done")}</p><h2 id="cardTitle">${gradable().length ? t("got", { a: score(), b: gradable().length }) : t("watched")}</h2>${clips && clips.length > 1 ? `<p><b>${esc(t("ending", { e: cName(curClip) }))}</b></p>` : ""}${unanswered ? `<p class="small">${t("skipped", { n: unanswered })}</p>` : ""}`;
    if (lms) { if (!lmsSent) { lmsSent = true; Bridge.end(response()); } store.set(); $("#card").innerHTML = `${head}<p>${t("lms")}</p>${replayRow()}`; $("#cardWrap").hidden = false; bindReplay(); return; }
    $("#card").innerHTML = `${head}<label class="field">${t("name")}<input id="sName" autocomplete="name" value="${esc(student.name)}"></label>${L.askClass ? `<label class="field">${t("cls")}<input id="sCls" value="${esc(student.cls)}"></label>` : ""}
      ${L.handIn ? `<p class="small">${esc(L.handIn)}</p>` : ""}
      <div class="actions wrap">${L.email ? `<button id="mail">${t("email")}</button>` : ""}${L.sheet ? `<button id="send">${t("send")}</button>` : ""}<button id="dl" class="${L.sheet || L.email ? "ghost" : ""}">${t("dl")}</button><button id="copy" class="ghost">${t("copy")}</button></div><p class="fb" id="fb" aria-live="polite"></p>`;
    $("#card").insertAdjacentHTML("beforeend", replayRow()); $("#cardWrap").hidden = false; store.set(); bindReplay();
    const ready = () => { student.name = $("#sName").value.trim(); student.cls = $("#sCls")?.value.trim() || ""; if (!student.name) { $("#fb").textContent = t("needName"); $("#sName").focus(); return null; } store.set(); return response(); };
    const saveFile = r => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(r, null, 1)], { type: "application/json" })); a.download = `${(L.title || "lesson").replace(/[^\w]+/g, "-")}-${student.name.replace(/[^\w]+/g, "-")}.json`; a.click(); };
    $("#dl").onclick = () => { const r = ready(); if (!r) return; saveFile(r); $("#fb").textContent = t("saved"); };
    $("#copy").onclick = async () => { const r = ready(); if (!r) return; const code = toCode(r); try { await navigator.clipboard.writeText(code); $("#fb").textContent = t("copied"); } catch { prompt(t("copy"), code); } };
    $("#mail") && ($("#mail").onclick = () => { const r = ready(); if (!r) return; const code = toCode(r); let body = `${summary(r)}\n\nAnswers code (for the teacher’s Booth dashboard):\n${code}`; if (body.length > 1800) { body = `${summary(r)}\n\nThe full answers file has been downloaded. Please attach it to this email.`; saveFile(r); } window.LESSON_MAILTO = `mailto:${encodeURIComponent(L.email)}?subject=${encodeURIComponent(`${L.title}: ${student.name}`)}&body=${encodeURIComponent(body.slice(0, 1900))}`; location.href = window.LESSON_MAILTO; $("#fb").textContent = t("emailed"); });
    $("#send") && ($("#send").onclick = async () => { const r = ready(); if (!r) return; $("#fb").textContent = t("sending"); try { await fetch(L.sheet, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" }, body: JSON.stringify(r) }); $("#fb").textContent = t("sent"); } catch { $("#fb").textContent = t("fail"); } });
  }
  /* ---------- after the end: close, watch again or start over ---------- */
  const replayRow = () => `<div class="actions wrap replay"><button class="ghost" id="again">↺ ${t("again")}</button><button class="ghost" id="restart">${t("restart")}</button></div>`;
  function bindReplay() {
    const card = $("#card"); card.insertAdjacentHTML("afterbegin", `<button class="x" id="endX" aria-label="${t("close")}">✕</button>`); overlay = { id: "_end", type: "end" };
    $("#endX").onclick = review; $("#again").onclick = watchAgain; $("#restart").onclick = startOver;
  }
  function review() { reviewing = FREE_AFTER; finished = false; hide(); }
  function watchAgain() { review(); seen.clear(); furthest = FREE_AFTER ? Infinity : 0; prevS = 0; posOK = 0; if (clips && curClip !== clips[0].id) { curClip = clips[0].id; V.setSrc(VIDS[curClip]); drawMarkers(); } V.seek(0); V.play(); }
  function startOver() { try { localStorage.removeItem(KEY); } catch {} location.reload(); }
  addEventListener("keydown", e => { if (e.key === "Escape" && overlay?.type === "end") { e.preventDefault(); review(); } });

  /* ---------- 360° video: a small built-in viewer (no extra files) ---------- */
  function makeVR(v, host) {
    const gc = document.createElement("canvas"), pc = document.createElement("canvas"), tip = document.createElement("div");
    gc.className = pc.className = "vr"; tip.className = "vrtip"; tip.innerHTML = `<span>${t("look")}</span><button type="button" id="vrReset">${t("resetView")}</button>`;
    host.append(gc, pc, tip); let on = false, yaw = 0, pitch = 0, fov = 1.4, mode = "gl", drag = null, gl = null, prog = null, tex = null, u = {}, raf = 0;
    try { gl = gc.getContext("webgl2") || gc.getContext("webgl"); } catch {}
    if (gl) {
      const vs = "attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}";
      const fs = "precision highp float;uniform sampler2D tex;uniform float yaw,pitch,fov,aspect;varying vec2 uv;void main(){vec2 q=uv*2.-1.;q.x*=aspect;float f=1./tan(fov*.5);vec3 d=normalize(vec3(q.x,q.y,-f));float cp=cos(pitch),sp=sin(pitch);d=vec3(d.x,d.y*cp-d.z*sp,d.y*sp+d.z*cp);float cy=cos(yaw),sy=sin(yaw);d=vec3(d.x*cy+d.z*sy,d.y,-d.x*sy+d.z*cy);float lon=atan(d.x,-d.z),lat=asin(clamp(d.y,-1.,1.));gl_FragColor=texture2D(tex,vec2(lon/6.2831853+.5,.5-lat/3.14159265));}";
      const sh = (type, src) => { const x = gl.createShader(type); gl.shaderSource(x, src); gl.compileShader(x); return x; };
      prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(prog); gl.useProgram(prog);
      const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW); const loc = gl.getAttribLocation(prog, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      ["yaw", "pitch", "fov", "aspect"].forEach(k => u[k] = gl.getUniformLocation(prog, k));
    } else mode = "pan";
    const size = c => { const r = host.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1); const w = Math.round(r.width * d), h = Math.round(r.height * d); if (c.width !== w || c.height !== h) { c.width = w; c.height = h; } };
    function frame() {
      raf = 0; if (!on) return; if (!document.hidden && v.readyState >= 2) {
        if (mode === "gl") { size(gc); try { gl.viewport(0, 0, gc.width, gc.height); gl.bindTexture(gl.TEXTURE_2D, tex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, v); gl.uniform1f(u.yaw, yaw); gl.uniform1f(u.pitch, pitch); gl.uniform1f(u.fov, fov); gl.uniform1f(u.aspect, gc.width / gc.height); gl.drawArrays(gl.TRIANGLES, 0, 3); } catch (e) { mode = "pan"; show(); } }
        else { size(pc); const x = pc.getContext("2d"), vw = v.videoWidth, vh = v.videoHeight, sw = vw * fov / (Math.PI * 2), shh = Math.min(vh, sw * pc.height / pc.width), sy = Math.max(0, Math.min(vh - shh, (.5 - pitch / Math.PI) * vh - shh / 2)); let sx = ((yaw / (Math.PI * 2) + .5) * vw - sw / 2) % vw; if (sx < 0) sx += vw; const first = Math.min(sw, vw - sx), k = pc.width / sw; x.drawImage(v, sx, sy, first, shh, 0, 0, first * k, pc.height); if (first < sw) x.drawImage(v, 0, sy, sw - first, shh, first * k, 0, (sw - first) * k, pc.height); }
      }
      raf = requestAnimationFrame(frame);
    }
    function show() { gc.hidden = !on || mode !== "gl"; pc.hidden = !on || mode !== "pan"; tip.hidden = !on; v.style.opacity = on ? "0" : ""; if (on && !raf) raf = requestAnimationFrame(frame); }
    [gc, pc].forEach(c => {
      c.addEventListener("pointerdown", e => { drag = { x: e.clientX, y: e.clientY, yaw, pitch, moved: false }; c.setPointerCapture(e.pointerId); });
      c.addEventListener("pointermove", e => { if (!drag) return; const r = c.getBoundingClientRect(), dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true; yaw = drag.yaw - dx / r.width * fov * (r.width / r.height); pitch = Math.max(-1.45, Math.min(1.45, drag.pitch + dy / r.height * fov)); tip.classList.add("used"); });
      c.addEventListener("pointerup", () => { if (drag && !drag.moved && !overlay) { v.paused ? v.play() : v.pause(); } drag = null; });
      c.addEventListener("wheel", e => { e.preventDefault(); fov = Math.max(.6, Math.min(1.9, fov + e.deltaY * .0015)); }, { passive: false });
      c.tabIndex = 0; c.setAttribute("aria-label", t("look")); c.addEventListener("keydown", e => { const st = .08; if (e.key === "ArrowLeft") yaw -= st; else if (e.key === "ArrowRight") yaw += st; else if (e.key === "ArrowUp") pitch = Math.min(1.45, pitch + st); else if (e.key === "ArrowDown") pitch = Math.max(-1.45, pitch - st); else return; e.preventDefault(); e.stopPropagation(); });
    });
    tip.querySelector("button").onclick = () => { yaw = 0; pitch = 0; fov = 1.4; };
    return { set(x) { on = !!x; show(); } };
  }

  /* ---------- start ---------- */
  async function start() {
    Bridge.start();
    const saved = !window.LESSON_PREVIEW && store.get();
    if (saved && !saved.done && clips && saved.clip && VIDS?.[saved.clip]) { curClip = saved.clip; path.length = 0; path.push(...(saved.path || [cName(curClip)])); (saved.seen || []).forEach(x => seen.add(x)); }
    V = await (L.yt ? ytAdapter(L.yt) : fileAdapter(VIDS ? VIDS[curClip] : (window.LESSON_VIDEO || L.videoFile)));
    if (saved && !saved.done) { Object.assign(ans, saved.ans || {}); furthest = saved.furthest || 0; if (!student.name) student = { ...student, ...(saved.student || {}) }; if (furthest > 2) { posOK = Math.max(0, furthest - 2); V.seek(posOK); $("#hintLine").textContent = t("resume"); } }
    drawMarkers(); updateScore(); loop();
    const intro = (inner, go) => { $("#card").innerHTML = `<p class="kind">${t("before")}</p><h2 id="cardTitle">${esc(L.title || "Video lesson")}</h2>${L.intro ? `<p>${esc(L.intro)}</p>` : ""}${inner}<div class="actions"><button id="go">${t("start")}</button></div><p class="fb" id="fb"></p>`; $("#cardWrap").hidden = false; overlay = { id: "_start" }; $("#go").onclick = go; };
    if (L.askName && !lms && !student.name) intro(`<label class="field">${t("name")}<input id="sName0" autocomplete="name"></label>`, () => { const n = $("#sName0").value.trim(); if (!n) return ($("#fb").textContent = t("needName")); student.name = n; store.set(); hide(); V.play(); });
    else if (L.intro && !(saved && !saved.done)) intro("", () => { hide(); V.play(); });
  }
  start();
})();
