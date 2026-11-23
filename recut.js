/* Little Light Lit: automatic silence detection (Recut-style), shared by the Audio and Video studios.
   Works on decoded audio (Float32Array channels). Everything runs on the device. */
(() => {
  const WIN = 0.02; // 20 ms analysis windows
  function levels(chs, sr) {
    const n = Math.max(1, Math.round(WIN * sr)), len = chs[0].length, out = new Float32Array(Math.ceil(len / n));
    for (let w = 0; w < out.length; w++) {
      let peak = 0;
      for (const d of chs) { let s = 0; const a = w * n, b = Math.min(len, a + n); for (let i = a; i < b; i++) s += d[i] * d[i]; const rms = Math.sqrt(s / Math.max(1, b - a)); if (rms > peak) peak = rms; }
      out[w] = 20 * Math.log10(peak + 1e-9);
    }
    return out;
  }
  /* A level a little above the quietest 15% of the recording: usually room tone or breaths. */
  function autoThreshold(chs, sr) {
    const lv = [...levels(chs, sr)].filter(v => v > -120).sort((a, b) => a - b);
    if (!lv.length) return -45;
    const floor = lv[Math.floor(lv.length * 0.15)], speech = lv[Math.floor(lv.length * 0.7)];
    return Math.max(-65, Math.min(-22, Math.max(floor + 8, speech - 28)));
  }
  /* Returns the parts to remove, in seconds: [[start, end], …]. keepPause leaves a natural gap. */
  function find(chs, sr, { thresholdDb = -40, minSilence = 0.6, keepPause = 0.2 } = {}) {
    const lv = levels(chs, sr), dur = chs[0].length / sr, out = [];
    let start = -1;
    for (let w = 0; w <= lv.length; w++) {
      const quiet = w < lv.length && lv[w] < thresholdDb;
      if (quiet && start < 0) start = w;
      if (!quiet && start >= 0) {
        const a = start * WIN, b = Math.min(dur, w * WIN);
        if (b - a >= minSilence) {
          const edgeA = a <= 0.001, edgeB = b >= dur - 0.001; // trim fully at the very start and end
          const ra = edgeA ? 0 : a + keepPause / 2, rb = edgeB ? dur : b - keepPause / 2;
          if (rb - ra > 0.05) out.push([ra, rb]);
        }
        start = -1;
      }
    }
    return out;
  }
  function keep(dur, cuts) {
    const k = []; let t = 0;
    for (const [a, b] of cuts) { if (a > t + 0.01) k.push([t, a]); t = b; }
    if (dur > t + 0.01) k.push([t, dur]);
    return k;
  }
  const total = cuts => cuts.reduce((s, [a, b]) => s + (b - a), 0);
  /* Join the kept parts of an AudioBuffer with short crossfades so cuts don’t click. */
  function cutBuffer(ctx, buf, cuts) {
    const sr = buf.sampleRate, parts = keep(buf.duration, cuts), fade = Math.round(0.008 * sr);
    const lens = parts.map(([a, b]) => Math.round((b - a) * sr)), len = Math.max(1, lens.reduce((s, n) => s + n, 0));
    const out = ctx.createBuffer(buf.numberOfChannels, len, sr);
    for (let c = 0; c < buf.numberOfChannels; c++) {
      const src = buf.getChannelData(c), dst = out.getChannelData(c); let o = 0;
      parts.forEach(([a], i) => {
        const s0 = Math.round(a * sr), n = lens[i];
        for (let j = 0; j < n; j++) {
          let v = src[s0 + j] || 0;
          if (i > 0 && j < fade) v *= j / fade;
          if (i < parts.length - 1 && j > n - fade) v *= (n - j) / fade;
          dst[o + j] = v;
        }
        o += n;
      });
    }
    return out;
  }
  window.LightLitRecut = { find, keep, total, autoThreshold, cutBuffer };
})();
