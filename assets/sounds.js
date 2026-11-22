/* Little Light Lit: "Find music and sounds" panel, shared by the Video and Audio studios.
   Links out to official trend charts and free music libraries, and builds credit lines.
   Little Light Lit never downloads audio from other websites. */
(() => {
  const TREND = [
    ["TikTok Creative Center: trending songs", "https://ads.tiktok.com/business/creativecenter/inspiration/popular/music", "Top songs by country and week. Filter to “approved for business use” if you post for a brand."],
    ["YouTube Charts", "https://charts.youtube.com/", "Top songs and trending music videos by country."],
    ["Shazam charts", "https://www.shazam.com/charts/top-200/world", "What people are identifying right now, worldwide or by city."],
    ["Spotify Charts", "https://charts.spotify.com/", "Top 50 and Viral 50 by country (free login)."],
  ];
  const FREE = [
    ["YouTube Audio Library", "https://studio.youtube.com/", "Free music and sound effects for YouTube creators. Open YouTube Studio, then Audio Library. Some tracks need a credit."],
    ["Pixabay Music", "https://pixabay.com/music/", "Free tracks under the Pixabay Content License, no credit required."],
    ["Free Music Archive", "https://freemusicarchive.org/", "Independent music under Creative Commons. Check each track’s licence."],
    ["Freesound", "https://freesound.org/", "Sound effects under Creative Commons. Many need a credit."],
    ["Incompetech (Kevin MacLeod)", "https://incompetech.com/music/", "Thousands of tracks under CC BY 4.0. Credit required."],
  ];
  const LICENCES = ["Creative Commons BY 4.0", "Creative Commons BY-SA 4.0", "Creative Commons 0 (public domain)", "Pixabay Content License", "YouTube Audio Library", "Used under the platform’s music licence", "Licensed from the rights holder", "My own recording"];
  const css = `
  .snd{width:min(640px,94vw);max-height:88vh;overflow:auto}
  .snd .dlg{gap:1.1rem}
  .snd ul{list-style:none;margin:0;padding:0;display:grid;gap:.45rem}
  .snd li a{display:grid;gap:.1rem;padding:.6rem .75rem;border:1px solid var(--line);border-radius:10px;text-decoration:none;color:inherit}
  .snd li a:hover{border-color:var(--accent)}
  .snd li strong{font-weight:700}
  .snd li span{font-size:.85rem;color:var(--muted)}
  .snd .tip{padding:.8rem .9rem;border-radius:10px;background:color-mix(in srgb,var(--guide) 12%,var(--panel));font-size:.92rem}
  .snd .tip p{margin:.3rem 0 0}
  .snd output{display:block;padding:.6rem .75rem;border-radius:8px;background:var(--paper);border:1px dashed var(--line);font-size:.9rem;white-space:pre-wrap;min-height:2.6em}`;
  let dlg = null;
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const link = ([t, u, d]) => `<li><a href="${u}" target="_blank" rel="noopener"><strong>${esc(t)} ↗</strong><span>${esc(d)}</span></a></li>`;
  function build() {
    const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
    dlg = document.createElement("dialog"); dlg.className = "snd"; dlg.setAttribute("aria-labelledby", "sndTitle");
    dlg.innerHTML = `<div class="dlg">
      <h2 id="sndTitle">Find music and sounds</h2>
      <div class="tip"><strong>Using a trending sound?</strong>
        <p>Trending songs are copyrighted. TikTok, Instagram Reels and YouTube Shorts license them for use inside their own apps. Export your video from Little Light Lit without that song, then add the trending sound in the app when you post. The sound stays credited and linked, and your video won’t be muted or get a copyright claim.</p>
        <p>Naming the song in your caption or a file’s details is polite, but it doesn’t give you permission. Only a licence does.</p></div>
      <div class="group"><span class="lbl">See what’s trending</span><ul>${TREND.map(link).join("")}</ul>
        <p class="note">Instagram: in the Reels editor, tap Audio. Sounds marked with an upward arrow are trending.</p></div>
      <div class="group"><span class="lbl">Free music you can download and use</span><ul>${FREE.map(link).join("")}</ul></div>
      <div class="group"><span class="lbl">Make a credit line</span>
        <div class="row2"><div class="field"><label for="cTitle">Track title</label><input type="text" id="cTitle"></div><div class="field"><label for="cArtist">Artist</label><input type="text" id="cArtist"></div></div>
        <div class="row2"><div class="field"><label for="cLic">Licence</label><select id="cLic">${LICENCES.map(l => `<option>${esc(l)}</option>`).join("")}</select></div><div class="field"><label for="cLink">Link (optional)</label><input type="text" id="cLink" inputmode="url"></div></div>
        <output id="cOut" aria-live="polite"></output>
        <div style="display:flex;gap:.5rem;flex-wrap:wrap"><button class="btn primary" id="cCopy" type="button" data-primary>Copy for your caption</button><button class="btn" id="cUse" type="button" hidden>Add to my video</button></div></div>
      <div style="display:flex;justify-content:flex-end"><button class="btn" id="sndClose" type="button">Close</button></div></div>`;
    document.body.appendChild(dlg);
    const $ = s => dlg.querySelector(s);
    const line = () => { const t = $("#cTitle").value.trim(), a = $("#cArtist").value.trim(), l = $("#cLic").value, u = $("#cLink").value.trim(); if (!t && !a) return ""; return `Music: “${t || "Untitled"}”${a ? ` by ${a}` : ""} (${l})${u ? `\n${u}` : ""}`; };
    const upd = () => ($("#cOut").textContent = line() || "Fill in the track and artist to see your credit.");
    ["#cTitle", "#cArtist", "#cLic", "#cLink"].forEach(id => $(id).addEventListener("input", upd)); upd();
    $("#cCopy").onclick = async () => { const t = line(); if (!t) return; try { await navigator.clipboard.writeText(t); $("#cCopy").textContent = "Copied"; setTimeout(() => ($("#cCopy").textContent = "Copy for your caption"), 1500); } catch {} };
    $("#cUse").onclick = () => { const t = line(); if (t && window.LightLitSounds.onCredit) { window.LightLitSounds.onCredit(t, { title: $("#cTitle").value.trim(), artist: $("#cArtist").value.trim(), licence: $("#cLic").value, link: $("#cLink").value.trim() }); dlg.close(); } };
    $("#sndClose").onclick = () => dlg.close();
  }
  window.LightLitSounds = {
    onCredit: null,
    open(prefill = {}) { if (!dlg) build(); const $ = s => dlg.querySelector(s); if (prefill.title != null) $("#cTitle").value = prefill.title; if (prefill.artist != null) $("#cArtist").value = prefill.artist; $("#cTitle").dispatchEvent(new Event("input")); $("#cUse").hidden = !this.onCredit; dlg.showModal(); },
  };
})();
