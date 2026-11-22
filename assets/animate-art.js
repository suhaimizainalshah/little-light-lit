/* Little Light Lit Animate: vector art drawn in code (no image files), in two modes:
   "color" for cartoon scenes and "line" for whiteboard sketching.
   Characters: feet at (0,0), about 310 units tall. Props: centred, about 200 units across. */
(() => {
  const INK = "#1b1f24";
  const SKIN = ["#F6D7C3", "#EBC09F", "#D9A47E", "#B9825B", "#8D5A3B", "#5E3A25"];
  const HAIRC = ["#1F1B18", "#4A2F20", "#7A4B2A", "#B9853F", "#D8C07A", "#9AA0A6", "#C2452D", "#5A3E8C"];
  const OUTFIT = ["#2B6CB0", "#E0412B", "#2F855A", "#B7791F", "#6B46C1", "#1B1F24", "#E2E8F0", "#D53F8C", "#0F9DB0"];
  const HAIR = [["short", "Short"], ["long", "Long"], ["bun", "Bun"], ["curly", "Curly"], ["bald", "Bald"], ["hijab", "Hijab"], ["cap", "Cap"]];
  const TOPS = [["tshirt", "T-shirt"], ["collared", "Collared shirt"], ["blazer", "Blazer"], ["dress", "Dress"]];
  const BOTTOMS = [["trousers", "Trousers"], ["skirt", "Skirt"], ["shorts", "Shorts"]];
  const GLASSES = [["none", "None"], ["round", "Round"], ["square", "Square"]];
  const BEARD = [["none", "None"], ["stubble", "Stubble"], ["full", "Full beard"]];
  const EXPR = [["happy", "Happy"], ["neutral", "Neutral"], ["sad", "Sad"], ["surprised", "Surprised"], ["angry", "Cross"], ["thinking", "Thinking"]];
  const POSE = [["stand", "Stand"], ["wave", "Wave"], ["point", "Point"], ["think", "Think"], ["cheer", "Cheer"], ["shrug", "Shrug"]];
  const DEFAULT_LOOK = { skin: 1, hair: "short", hairColor: 0, top: "tshirt", topColor: 0, bottom: "trousers", bottomColor: 5, glasses: "none", beard: "none" };

  // Paint helper: fill + outline in colour mode, outline only in line mode
  // Colour mode: fill, a soft outline, then gentle shading on the right half, as if lit from the left
  const OUTLINE = "#2B2420";
  function painter(c, mode, lw = 5) {
    return (fill, stroke = INK, w = lw) => {
      if (mode === "line") { c.lineWidth = w * 1.1; c.strokeStyle = INK; c.stroke(); return; }
      if (fill) { c.fillStyle = fill; c.fill(); }
      if (stroke) { c.lineWidth = w * .78; c.strokeStyle = stroke === INK ? OUTLINE : stroke; c.stroke(); }
      if (fill && c.clip && !c.isRecorder) { c.save(); c.clip(); c.globalCompositeOperation = "multiply"; c.fillStyle = "rgba(60,40,30,.13)"; c.fillRect(6, -420, 420, 560); c.globalCompositeOperation = "source-over"; c.fillStyle = "rgba(255,255,255,.10)"; c.fillRect(-420, -420, 380, 560); c.restore(); }
    };
  }
  const rr = (c, x, y, w, h, r) => { c.beginPath(); c.roundRect(x, y, w, h, r); };
  const circ = (c, x, y, r) => { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); };
  const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255; const f = v => Math.max(0, Math.min(255, Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k))); return `rgb(${f(r)},${f(g)},${f(b)})`; };

  // Arm angles in degrees from pointing straight down: [upper, lower]; positive = outwards
  const POSES = {
    stand: { L: [8, 4], R: [8, 4] }, wave: { L: [8, 4], R: [150, 25] }, point: { L: [8, 4], R: [88, 0] },
    think: { L: [8, 4], R: [35, 135] }, cheer: { L: [155, 10], R: [155, 10] }, shrug: { L: [55, -70], R: [55, -70] },
  };
  function arm(c, side, upper, lower, sleeve, skin, F, mode) {
    const sx = side * 44, sy = -192, d1 = upper * Math.PI / 180, d2 = (upper + lower) * Math.PI / 180;
    const ex = sx + side * Math.sin(d1) * 50, ey = sy + Math.cos(d1) * 50, hx = ex + side * Math.sin(d2) * 46, hy = ey + Math.cos(d2) * 46;
    c.lineCap = "round"; c.lineJoin = "round";
    if (mode === "line") { c.beginPath(); c.moveTo(sx, sy); c.lineTo(ex, ey); c.lineTo(hx, hy); c.lineWidth = 5.5; c.strokeStyle = INK; c.stroke(); }
    else {
      c.beginPath(); c.moveTo(sx, sy); c.lineTo(ex, ey); c.lineTo(hx, hy); c.lineWidth = 24; c.strokeStyle = INK; c.stroke();
      c.lineWidth = 15; c.strokeStyle = sleeve; c.stroke();
    }
    circ(c, hx, hy, 11); F(skin, INK, 4);
    return { hx, hy };
  }
  function character(c, look = DEFAULT_LOOK, o = {}) {
    const mode = o.mode || "color", F = painter(c, mode), L = { ...DEFAULT_LOOK, ...look };
    const skin = SKIN[L.skin] || SKIN[1], hairC = HAIRC[L.hairColor] || HAIRC[0], top = OUTFIT[L.topColor] ?? OUTFIT[0], bottom = OUTFIT[L.bottomColor] ?? OUTFIT[5];
    const t = o.t || 0, pose = POSES[o.pose] ? JSON.parse(JSON.stringify(POSES[o.pose])) : POSES.stand;
    if (o.pose === "wave") pose.R[1] = 25 + Math.sin(t * 9) * 22;
    const dress = L.top === "dress";
    // soft ground shadow
    if (mode !== "line" && !c.isRecorder) { c.save(); c.beginPath(); c.ellipse(0, 2, 70, 12, 0, 0, Math.PI * 2); c.fillStyle = "rgba(20,20,30,.16)"; c.fill(); c.restore(); }
    // legs and shoes
    const legC = dress || L.bottom !== "trousers" ? skin : bottom;
    [-1, 1].forEach(s => { rr(c, s > 0 ? 5 : -27, -112, 22, 104, 10); F(legC, INK, 4.5); c.beginPath(); c.ellipse(s * 20, -6, 22, 10, 0, 0, Math.PI * 2); F("#2D3748", INK, 4); });
    if (!dress && L.bottom === "skirt") { c.beginPath(); c.moveTo(-40, -112); c.lineTo(40, -112); c.lineTo(50, -58); c.quadraticCurveTo(0, -48, -50, -58); c.closePath(); F(bottom); }
    if (!dress && L.bottom === "shorts") { c.beginPath(); c.moveTo(-38, -112); c.lineTo(38, -112); c.lineTo(36, -72); c.lineTo(3, -72); c.lineTo(0, -95); c.lineTo(-3, -72); c.lineTo(-36, -72); c.closePath(); F(bottom); }
    // torso
    if (dress) { c.beginPath(); c.moveTo(-40, -200); c.lineTo(40, -200); c.lineTo(58, -70); c.quadraticCurveTo(0, -58, -58, -70); c.closePath(); F(top); }
    else { rr(c, -46, -204, 92, 100, 22); F(top); }
    if (L.top === "collared") { c.beginPath(); c.moveTo(-16, -204); c.lineTo(0, -184); c.lineTo(16, -204); c.lineTo(8, -178); c.lineTo(0, -184); c.lineTo(-8, -178); c.closePath(); F("#FFFFFF", INK, 3.5); }
    if (L.top === "blazer") { c.beginPath(); c.moveTo(-12, -204); c.lineTo(0, -150); c.lineTo(12, -204); c.closePath(); F("#FFFFFF", INK, 3.5); c.beginPath(); c.moveTo(-12, -204); c.lineTo(-24, -170); c.lineTo(-6, -170); c.moveTo(12, -204); c.lineTo(24, -170); c.lineTo(6, -170); c.lineWidth = 3.5; c.strokeStyle = mode === "line" ? INK : shade(top, -.35); c.stroke(); }
    // arms
    const sleeve = L.top === "tshirt" || dress ? top : top;
    const hands = { L: arm(c, -1, pose.L[0], pose.L[1], sleeve, skin, F, mode), R: arm(c, 1, pose.R[0], pose.R[1], sleeve, skin, F, mode) };
    // neck
    if (L.hair !== "hijab") { rr(c, -11, -216, 22, 18, 6); F(skin, INK, 4); }
    // hair behind head
    const hx = 0, hy = -258, R = 50;
    if (L.hair === "long") { c.beginPath(); c.moveTo(-54, -270); c.quadraticCurveTo(-64, -200, -46, -182); c.lineTo(46, -182); c.quadraticCurveTo(64, -200, 54, -270); c.closePath(); F(hairC); }
    if (L.hair === "hijab") { c.beginPath(); c.ellipse(hx, hy + 6, R + 14, R + 20, 0, 0, Math.PI * 2); F(hairC); c.beginPath(); c.moveTo(-50, -230); c.quadraticCurveTo(0, -176, 50, -230); c.lineTo(46, -196); c.quadraticCurveTo(0, -180, -46, -196); c.closePath(); F(hairC); }
    if (L.hair === "bun") { circ(c, hx, hy - 56, 20); F(hairC); }
    // head and ears
    if (L.hair !== "hijab") { [-1, 1].forEach(s => { circ(c, s * 50, hy + 4, 10); F(skin, INK, 4); }); }
    c.beginPath(); c.ellipse(hx, hy, L.hair === "hijab" ? R - 6 : R, L.hair === "hijab" ? R - 2 : R + 2, 0, 0, Math.PI * 2); F(skin);
    // hair on top
    if (L.hair === "short" || L.hair === "cap") { c.beginPath(); c.moveTo(-50, -262); c.quadraticCurveTo(-52, -318, 0, -312); c.quadraticCurveTo(52, -318, 50, -262); c.quadraticCurveTo(30, -290, 0, -286); c.quadraticCurveTo(-34, -290, -50, -262); c.closePath(); F(hairC); }
    if (L.hair === "long" || L.hair === "bun") { c.beginPath(); c.moveTo(-52, -258); c.quadraticCurveTo(-50, -318, 0, -312); c.quadraticCurveTo(50, -318, 52, -258); c.quadraticCurveTo(20, -296, -12, -282); c.quadraticCurveTo(-34, -276, -52, -258); c.closePath(); F(hairC); }
    if (L.hair === "curly") { [[-42, -284], [-22, -302], [2, -310], [26, -302], [44, -284], [-50, -262], [50, -262]].forEach(([x, y]) => { circ(c, x, y, 17); F(hairC, INK, 4); }); }
    if (L.hair === "cap") { c.beginPath(); c.moveTo(-50, -270); c.quadraticCurveTo(0, -330, 50, -270); c.closePath(); F(OUTFIT[(L.topColor + 1) % OUTFIT.length]); c.beginPath(); c.ellipse(34, -270, 34, 8, 0, 0, Math.PI * 2); F(OUTFIT[(L.topColor + 1) % OUTFIT.length]); }
    // beard
    if (L.beard === "full") { c.beginPath(); c.moveTo(-48, -250); c.quadraticCurveTo(-44, -198, 0, -196); c.quadraticCurveTo(44, -198, 48, -250); c.quadraticCurveTo(26, -224, 0, -230); c.quadraticCurveTo(-26, -224, -48, -250); c.closePath(); F(hairC); }
    if (L.beard === "stubble" && mode !== "line") { c.beginPath(); c.moveTo(-44, -246); c.quadraticCurveTo(0, -192, 44, -246); c.quadraticCurveTo(0, -222, -44, -246); c.fillStyle = "rgba(40,30,25,.28)"; c.fill(); }
    face(c, o.expr || "happy", o.talking ? (Math.sin(t * 22) > 0) : false, mode, L);
    return hands;
  }
  function face(c, expr, mouthOpen, mode, L) {
    const ey = -262, big = expr === "surprised";
    c.fillStyle = INK; c.strokeStyle = INK; c.lineCap = "round";
    [-1, 1].forEach(s => { c.beginPath(); c.ellipse(s * 18, ey, big ? 7 : 5.5, big ? 8.5 : 7, 0, 0, Math.PI * 2); c.fill(); if (mode !== "line") { c.beginPath(); c.arc(s * 18 + 2, ey - 3, 1.8, 0, Math.PI * 2); c.fillStyle = "#fff"; c.fill(); c.fillStyle = INK; } });
    // brows
    c.lineWidth = 4.5; c.beginPath();
    const brow = { happy: [-2, -2], neutral: [0, 0], sad: [6, -4], surprised: [-8, -8], angry: [-6, 8], thinking: [2, -7] }[expr] || [0, 0];
    [-1, 1].forEach(s => { const inner = s * 9, outer = s * 28; c.moveTo(inner, ey - 16 + (s < 0 ? brow[1] : brow[1]) * .4 + (expr === "angry" ? 6 : 0) - (expr === "sad" ? -2 : 0)); c.lineTo(outer, ey - 16 + brow[0] * .5); });
    c.stroke();
    // cheeks
    if (mode !== "line" && (expr === "happy" || expr === "surprised")) { c.fillStyle = "rgba(232,90,90,.22)"; [-1, 1].forEach(s => { c.beginPath(); c.ellipse(s * 30, ey + 14, 9, 5, 0, 0, Math.PI * 2); c.fill(); }); }
    // mouth
    c.lineWidth = 4.5; c.strokeStyle = INK; c.fillStyle = mode === "line" ? "transparent" : "#7A2E2E"; const my = -232;
    if (mouthOpen || expr === "surprised") { c.beginPath(); c.ellipse(0, my, mouthOpen ? 10 : 8, mouthOpen ? 8 : 10, 0, 0, Math.PI * 2); if (mode !== "line") c.fill(); c.stroke(); }
    else if (expr === "happy") { c.beginPath(); c.arc(0, my - 10, 15, .15 * Math.PI, .85 * Math.PI); c.stroke(); }
    else if (expr === "sad") { c.beginPath(); c.arc(0, my + 10, 13, 1.2 * Math.PI, 1.8 * Math.PI); c.stroke(); }
    else if (expr === "thinking") { c.beginPath(); c.moveTo(-10, my + 2); c.quadraticCurveTo(4, my - 4, 12, my - 1); c.stroke(); }
    else { c.beginPath(); c.moveTo(-11, my); c.lineTo(11, my); c.stroke(); }
    // glasses
    if (L.glasses !== "none") { c.lineWidth = 3.5; c.strokeStyle = INK; c.beginPath(); [-1, 1].forEach(s => { if (L.glasses === "round") c.moveTo(s * 18 + 13, ey), c.arc(s * 18, ey, 13, 0, Math.PI * 2); else c.rect(s * 18 - 13, ey - 10, 26, 20); }); c.moveTo(-5, ey); c.lineTo(5, ey); c.stroke(); }
  }
  const CHAR_BOX = { x: -112, y: -332, w: 224, h: 344 };

  /* ---------- Props ---------- */
  const PROPS = {
    lightbulb: ["Idea bulb", (c, F, k) => { c.beginPath(); c.arc(0, -25, 55, Math.PI * .8, Math.PI * 2.2); c.lineTo(22, 40); c.lineTo(-22, 40); c.closePath(); F(k || "#F6C744"); rr(c, -24, 42, 48, 34, 6); F("#A0AEC0"); c.beginPath(); c.moveTo(-14, 10); c.lineTo(0, -25); c.lineTo(14, 10); c.lineWidth = 4; c.stroke(); [[-90, -40], [90, -40], [0, -105], [-66, -95], [66, -95]].forEach(([x, y]) => { c.beginPath(); c.moveTo(x * .78, y * .78 - 10); c.lineTo(x, y - 10); c.lineWidth = 5; c.strokeStyle = "#1b1f24"; c.stroke(); }); }],
    laptop: ["Laptop", (c, F, k) => { rr(c, -80, -70, 160, 100, 10); F(k || "#2D3748"); rr(c, -68, -58, 136, 76, 4); F("#90CDF4"); c.beginPath(); c.moveTo(-100, 34); c.lineTo(100, 34); c.lineTo(86, 56); c.lineTo(-86, 56); c.closePath(); F("#A0AEC0"); }],
    phone: ["Phone", (c, F, k) => { rr(c, -45, -85, 90, 170, 16); F(k || "#2D3748"); rr(c, -35, -70, 70, 130, 6); F("#90CDF4"); circ(c, 0, 72, 6); F("#A0AEC0"); }],
    chart: ["Bar chart", (c, F, k) => { c.beginPath(); c.moveTo(-90, -80); c.lineTo(-90, 70); c.lineTo(95, 70); c.lineWidth = 6; c.strokeStyle = "#1b1f24"; c.stroke(); [[-65, 40], [-20, 75], [25, 110], [70, 140]].forEach(([x, h], i) => { rr(c, x - 16, 70 - h, 32, h, 4); F(i === 3 ? (k || "#2F855A") : "#90CDF4"); }); }],
    pie: ["Pie chart", (c, F, k) => { c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 80, -Math.PI / 2, Math.PI * .7); c.closePath(); F(k || "#2B6CB0"); c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 80, Math.PI * .7, Math.PI * 1.15); c.closePath(); F("#F6C744"); c.beginPath(); c.moveTo(6, -6); c.arc(6, -6, 80, Math.PI * 1.15, Math.PI * 1.5); c.closePath(); F("#E0412B"); }],
    money: ["Money", (c, F, k) => { [[-30, 20], [0, 0], [30, -20]].forEach(([x, y]) => { rr(c, x - 70, y - 38, 140, 76, 8); F(k || "#68D391"); circ(c, x, y, 20); F("#C6F6D5"); }); }],
    coin: ["Coins", (c, F, k) => { [[-40, 30], [30, 30], [-5, -25]].forEach(([x, y]) => { c.beginPath(); c.ellipse(x, y, 42, 42, 0, 0, Math.PI * 2); F(k || "#F6C744"); c.beginPath(); c.ellipse(x, y, 28, 28, 0, 0, Math.PI * 2); F("#FAE29C"); }); }],
    clock: ["Clock", (c, F, k) => { circ(c, 0, 0, 85); F(k || "#FFFFFF"); circ(c, 0, 0, 72); F("#FFFFFF", null); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; c.beginPath(); c.moveTo(Math.sin(a) * 60, -Math.cos(a) * 60); c.lineTo(Math.sin(a) * 70, -Math.cos(a) * 70); c.lineWidth = 4; c.strokeStyle = "#1b1f24"; c.stroke(); } c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -48); c.moveTo(0, 0); c.lineTo(36, 10); c.lineWidth = 7; c.stroke(); }],
    globe: ["Globe", (c, F, k) => { circ(c, 0, 0, 82); F(k || "#63B3ED"); c.beginPath(); c.moveTo(-50, -40); c.quadraticCurveTo(-20, -70, 10, -50); c.quadraticCurveTo(30, -20, 0, -5); c.quadraticCurveTo(-30, 10, -50, -40); F("#68D391"); c.beginPath(); c.moveTo(20, 20); c.quadraticCurveTo(60, 10, 55, 45); c.quadraticCurveTo(30, 70, 15, 50); c.closePath(); F("#68D391"); }],
    house: ["House", (c, F, k) => { c.beginPath(); c.moveTo(-90, -10); c.lineTo(0, -90); c.lineTo(90, -10); c.closePath(); F(k || "#E0412B"); rr(c, -70, -10, 140, 90, 4); F("#F7E7CE"); rr(c, -18, 25, 36, 55, 4); F("#7A4B2A"); rr(c, 30, 5, 28, 24, 3); F("#90CDF4"); }],
    book: ["Book", (c, F, k) => { c.beginPath(); c.moveTo(0, -55); c.quadraticCurveTo(-50, -75, -95, -55); c.lineTo(-95, 60); c.quadraticCurveTo(-50, 40, 0, 60); c.quadraticCurveTo(50, 40, 95, 60); c.lineTo(95, -55); c.quadraticCurveTo(50, -75, 0, -55); c.closePath(); F(k || "#FFFFFF"); c.beginPath(); c.moveTo(0, -55); c.lineTo(0, 60); c.lineWidth = 4; c.stroke(); }],
    school: ["School", (c, F, k) => { rr(c, -100, -20, 200, 95, 4); F(k || "#F6AD55"); c.beginPath(); c.moveTo(-110, -20); c.lineTo(0, -80); c.lineTo(110, -20); c.closePath(); F("#C05621"); rr(c, -16, 25, 32, 50, 3); F("#7A4B2A"); [-70, -40, 40, 70].forEach(x => { rr(c, x - 11, 0, 22, 22, 2); F("#90CDF4"); }); circ(c, 0, -38, 14); F("#FFFFFF"); }],
    rocket: ["Rocket", (c, F, k) => { c.beginPath(); c.moveTo(0, -95); c.quadraticCurveTo(42, -50, 34, 40); c.lineTo(-34, 40); c.quadraticCurveTo(-42, -50, 0, -95); c.closePath(); F(k || "#E2E8F0"); circ(c, 0, -30, 16); F("#63B3ED"); c.beginPath(); c.moveTo(-34, 10); c.lineTo(-62, 55); c.lineTo(-30, 40); c.closePath(); F("#E0412B"); c.beginPath(); c.moveTo(34, 10); c.lineTo(62, 55); c.lineTo(30, 40); c.closePath(); F("#E0412B"); c.beginPath(); c.moveTo(-20, 42); c.quadraticCurveTo(0, 105, 20, 42); c.closePath(); F("#F6AD55"); }],
    heart: ["Heart", (c, F, k) => { c.beginPath(); c.moveTo(0, 70); c.bezierCurveTo(-110, 0, -60, -90, 0, -40); c.bezierCurveTo(60, -90, 110, 0, 0, 70); F(k || "#E53E3E"); }],
    star: ["Star", (c, F, k) => { c.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 38 : 88, a = i / 10 * Math.PI * 2 - Math.PI / 2; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); F(k || "#F6C744"); }],
    check: ["Tick", (c, F, k) => { circ(c, 0, 0, 80); F(k || "#2F855A"); c.beginPath(); c.moveTo(-38, 2); c.lineTo(-10, 32); c.lineTo(42, -30); c.lineWidth = 14; c.strokeStyle = "#fff"; c.lineCap = "round"; c.stroke(); }],
    cross: ["Cross", (c, F, k) => { circ(c, 0, 0, 80); F(k || "#E53E3E"); c.beginPath(); c.moveTo(-32, -32); c.lineTo(32, 32); c.moveTo(32, -32); c.lineTo(-32, 32); c.lineWidth = 14; c.strokeStyle = "#fff"; c.lineCap = "round"; c.stroke(); }],
    arrow: ["Arrow", (c, F, k) => { c.beginPath(); c.moveTo(-90, -18); c.lineTo(30, -18); c.lineTo(30, -50); c.lineTo(95, 0); c.lineTo(30, 50); c.lineTo(30, 18); c.lineTo(-90, 18); c.closePath(); F(k || "#2B6CB0"); }],
    speech: ["Speech bubble", (c, F, k) => { c.beginPath(); c.roundRect(-100, -75, 200, 120, 30); c.moveTo(-40, 45); c.lineTo(-60, 85); c.lineTo(-10, 45); F(k || "#FFFFFF"); }],
    thought: ["Thought bubble", (c, F, k) => { [[0, -20, 70], [-60, 0, 45], [60, 0, 45], [-35, -55, 45], [35, -55, 45]].forEach(([x, y, r]) => { circ(c, x, y, r); F(k || "#FFFFFF"); }); circ(c, -70, 65, 14); F(k || "#FFFFFF"); circ(c, -90, 92, 8); F(k || "#FFFFFF"); }],
    tree: ["Tree", (c, F, k) => { rr(c, -14, 0, 28, 85, 6); F("#7A4B2A"); [[0, -55, 55], [-42, -15, 42], [42, -15, 42], [0, -5, 45]].forEach(([x, y, r]) => { circ(c, x, y, r); F(k || "#48BB78"); }); }],
    car: ["Car", (c, F, k) => { c.beginPath(); c.moveTo(-100, 30); c.lineTo(-100, -5); c.lineTo(-60, -10); c.lineTo(-35, -50); c.lineTo(40, -50); c.lineTo(65, -10); c.lineTo(100, -2); c.lineTo(100, 30); c.closePath(); F(k || "#E0412B"); rr(c, -28, -42, 30, 28, 4); F("#90CDF4"); rr(c, 10, -42, 32, 28, 4); F("#90CDF4"); [-55, 55].forEach(x => { circ(c, x, 32, 20); F("#2D3748"); circ(c, x, 32, 8); F("#A0AEC0"); }); }],
    gear: ["Gear", (c, F, k) => { c.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, r = i % 2 ? 62 : 84; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); F(k || "#A0AEC0"); circ(c, 0, 0, 26); F("#FFFFFF"); }],
    lock: ["Padlock", (c, F, k) => { c.beginPath(); c.arc(0, -20, 40, Math.PI, 0); c.lineWidth = 16; c.strokeStyle = "#718096"; c.stroke(); c.lineWidth = 5; c.strokeStyle = "#1b1f24"; rr(c, -60, -20, 120, 95, 12); F(k || "#F6C744"); circ(c, 0, 18, 12); F("#2D3748"); }],
    trophy: ["Trophy", (c, F, k) => { c.beginPath(); c.moveTo(-50, -80); c.lineTo(50, -80); c.quadraticCurveTo(48, 0, 0, 10); c.quadraticCurveTo(-48, 0, -50, -80); c.closePath(); F(k || "#F6C744"); rr(c, -10, 10, 20, 35, 3); F(k || "#F6C744"); rr(c, -42, 45, 84, 26, 5); F("#7A4B2A"); }],
    people: ["Group", (c, F, k) => { [[-55, 10, "#90CDF4"], [55, 10, "#FBB6CE"], [0, -5, k || "#68D391"]].forEach(([x, y, col]) => { circ(c, x, y - 45, 24); F("#EBC09F"); c.beginPath(); c.roundRect(x - 34, y - 18, 68, 70, 24); F(col); }); }],
    calendar: ["Calendar", (c, F, k) => { rr(c, -80, -70, 160, 145, 10); F("#FFFFFF"); rr(c, -80, -70, 160, 36, 10); F(k || "#E0412B"); for (let r = 0; r < 3; r++) for (let q = 0; q < 4; q++) { rr(c, -62 + q * 34, -18 + r * 30, 22, 18, 3); F(r === 1 && q === 2 ? (k || "#E0412B") : "#E2E8F0", null); } }],
  };
  const PROP_BOX = { x: -112, y: -112, w: 224, h: 224 };
  function prop(c, name, color, mode = "color") { const p = PROPS[name] || PROPS.star; c.lineJoin = "round"; c.lineCap = "round"; c.lineWidth = 5; c.strokeStyle = INK; p[1](c, painter(c, mode, 5), color); }

  /* ---------- Backgrounds ---------- */
  const BGS = [["plain", "Plain"], ["whiteboard", "Whiteboard"], ["chalkboard", "Chalkboard"], ["paper", "Paper"], ["classroom", "Classroom"], ["office", "Office"], ["park", "Park"], ["city", "City"], ["night", "Night sky"]];
  function background(c, name, W, H, color) {
    const g = (a, b) => { const gr = c.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, a); gr.addColorStop(1, b); return gr; };
    c.save();
    if (name === "chalkboard") { c.fillStyle = "#24443A"; c.fillRect(0, 0, W, H); c.strokeStyle = "#7A4B2A"; c.lineWidth = Math.max(W, H) * .02; c.strokeRect(0, 0, W, H); }
    else if (name === "paper") { c.fillStyle = "#FBF6EA"; c.fillRect(0, 0, W, H); c.strokeStyle = "rgba(43,108,176,.18)"; c.lineWidth = 1.5; for (let y = H * .12; y < H; y += H * .06) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); } c.strokeStyle = "rgba(224,65,43,.35)"; c.beginPath(); c.moveTo(W * .08, 0); c.lineTo(W * .08, H); c.stroke(); }
    else if (name === "whiteboard") { c.fillStyle = "#FFFFFF"; c.fillRect(0, 0, W, H); }
    else if (name === "classroom") { c.fillStyle = "#F7E7CE"; c.fillRect(0, 0, W, H); c.fillStyle = "#C9A27E"; c.fillRect(0, H * .78, W, H * .22); c.fillStyle = "#7A4B2A"; c.fillRect(W * .2 - 8, H * .1 - 8, W * .6 + 16, H * .42 + 16); c.fillStyle = "#24443A"; c.fillRect(W * .2, H * .1, W * .6, H * .42); }
    else if (name === "office") { c.fillStyle = "#EDF2F7"; c.fillRect(0, 0, W, H); c.fillStyle = "#CBD5E0"; c.fillRect(0, H * .8, W, H * .2); c.fillStyle = "#BEE3F8"; c.fillRect(W * .62, H * .1, W * .3, H * .4); c.strokeStyle = "#A0AEC0"; c.lineWidth = 8; c.strokeRect(W * .62, H * .1, W * .3, H * .4); c.beginPath(); c.moveTo(W * .77, H * .1); c.lineTo(W * .77, H * .5); c.stroke(); c.fillStyle = "#68D391"; c.beginPath(); c.arc(W * .1, H * .7, H * .07, 0, Math.PI * 2); c.fill(); c.fillStyle = "#B7791F"; c.fillRect(W * .085, H * .72, W * .03, H * .08); }
    else if (name === "park") { c.fillStyle = g("#90CDF4", "#E6F6FF"); c.fillRect(0, 0, W, H); c.fillStyle = "#68D391"; c.beginPath(); c.moveTo(0, H * .72); c.quadraticCurveTo(W * .5, H * .62, W, H * .72); c.lineTo(W, H); c.lineTo(0, H); c.fill(); c.fillStyle = "#FFFFFF"; [[.15, .15], [.7, .1]].forEach(([x, y]) => { c.beginPath(); c.arc(W * x, H * y, H * .05, 0, Math.PI * 2); c.arc(W * x + H * .06, H * y - H * .02, H * .06, 0, Math.PI * 2); c.arc(W * x + H * .12, H * y, H * .045, 0, Math.PI * 2); c.fill(); }); c.fillStyle = "#F6E05E"; c.beginPath(); c.arc(W * .9, H * .12, H * .06, 0, Math.PI * 2); c.fill(); }
    else if (name === "city") { c.fillStyle = g("#FBD38D", "#FEEBC8"); c.fillRect(0, 0, W, H); const bw = W / 9; for (let i = 0; i < 9; i++) { const h = H * (.25 + ((i * 37) % 5) * .07); c.fillStyle = i % 2 ? "#4A5568" : "#718096"; c.fillRect(i * bw, H * .8 - h, bw - 6, h); c.fillStyle = "rgba(254,252,191,.7)"; for (let y = H * .8 - h + 14; y < H * .78; y += 26) for (let x = i * bw + 10; x < i * bw + bw - 16; x += 20) c.fillRect(x, y, 8, 12); } c.fillStyle = "#2D3748"; c.fillRect(0, H * .8, W, H * .2); }
    else if (name === "night") { c.fillStyle = g("#1A202C", "#2C5282"); c.fillRect(0, 0, W, H); c.fillStyle = "#FFFFFF"; for (let i = 0; i < 60; i++) { const x = (i * 97) % W, y = (i * 53) % (H * .7); c.fillRect(x, y, 2, 2); } c.fillStyle = "#FEFCBF"; c.beginPath(); c.arc(W * .82, H * .18, H * .07, 0, Math.PI * 2); c.fill(); }
    else { c.fillStyle = color || "#FFFFFF"; c.fillRect(0, 0, W, H); }
    c.restore();
  }
  const isDark = name => name === "chalkboard" || name === "night";

  /* ---------- Drawing hand (pen tip at 0,0) ---------- */
  function hand(c, skin = SKIN[1], tool = "marker") {
    c.save(); c.lineJoin = "round"; c.lineCap = "round"; c.strokeStyle = OUTLINE; c.lineWidth = 3;
    c.rotate(-0.55);
    if (tool === "pen") { rr(c, -4, -2, 8, 96, 4); c.fillStyle = "#CBD5E0"; c.fill(); c.stroke(); c.beginPath(); c.moveTo(-4, -2); c.lineTo(0, -16); c.lineTo(4, -2); c.closePath(); c.fillStyle = "#4A5568"; c.fill(); rr(c, -5, 60, 10, 30, 3); c.fillStyle = "#2B6CB0"; c.fill(); }
    else if (tool === "chalk") { rr(c, -7, -10, 14, 60, 4); c.fillStyle = "#F7FAFC"; c.fill(); c.stroke(); }
    else { rr(c, -7, -6, 14, 86, 5); c.fillStyle = "#1b1f24"; c.fill(); c.beginPath(); c.moveTo(-6, -6); c.lineTo(0, -16); c.lineTo(6, -6); c.fill(); rr(c, -8, 52, 16, 30, 4); c.fillStyle = "#E0412B"; c.fill(); }
    c.beginPath(); c.ellipse(16, 70, 30, 40, -0.2, 0, Math.PI * 2); c.fillStyle = skin; c.fill(); c.stroke();
    c.beginPath(); c.ellipse(-8, 46, 13, 22, 0.3, 0, Math.PI * 2); c.fill(); c.stroke();
    rr(c, -6, 100, 64, 120, 18); c.fillStyle = "#2B6CB0"; c.fill(); c.stroke();
    c.restore();
  }

  window.LightLitArt = { INK, SKIN, HAIRC, OUTFIT, HAIR, TOPS, BOTTOMS, GLASSES, BEARD, EXPR, POSE, DEFAULT_LOOK, character, CHAR_BOX, PROPS, PROP_BOX, prop, BGS, background, isDark, hand };
})();
