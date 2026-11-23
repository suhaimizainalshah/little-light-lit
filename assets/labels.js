/* Little Light Lit honest labels: IPTC "digital source type" (http://cv.iptc.org/newscodes/digitalsourcetype/) written into saved
   JPEG and PNG files as standard XMP, so tools such as AI Asli can tell how an image was made.
   Rules: describe what this studio did accurately; never remove or soften an AI label that came with an imported picture;
   a composite containing an AI-generated picture is labelled "edited with generative AI". Runs entirely on this device. */
(() => {
  const DST = "http://cv.iptc.org/newscodes/digitalsourcetype/";
  const AI = new Set(["trainedAlgorithmicMedia", "compositeWithTrainedAlgorithmicMedia", "compositeSynthetic", "algorithmicMedia"]);
  const KNOWN = /digitalsourcetype\/(trainedAlgorithmicMedia|compositeWithTrainedAlgorithmicMedia|compositeSynthetic|algorithmicMedia|algorithmicallyEnhanced|composite|compositeCapture|digitalCreation|humanEdits|minorHumanEdits|digitalCapture|computationalCapture|screenCapture|digitalArt)\b/;
  async function readSource(file) { try { const t = new TextDecoder("latin1").decode(new Uint8Array(await file.slice(0, 4e6).arrayBuffer())); const m = t.match(KNOWN); if (m) return m[1]; if (/compositeWithTrainedAlgorithmicMedia/.test(t)) return "compositeWithTrainedAlgorithmicMedia"; if (/trainedAlgorithmicMedia/.test(t)) return "trainedAlgorithmicMedia"; } catch {} return null; }
  // mine: what this studio did. sources: labels found in imported pictures. composite: the result combines several pictures.
  function decide({ mine, sources = [], composite = true }) { const ai = sources.filter(s => AI.has(s)); if (!ai.length) return mine; return composite ? "compositeWithTrainedAlgorithmicMedia" : ai.includes("trainedAlgorithmicMedia") ? "trainedAlgorithmicMedia" : ai[0]; }
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  function packet(label, { steps = [], sources = [], tool = "Little Light Lit" } = {}) { const src = [...new Set(sources.filter(Boolean))]; return `<?xpacket begin="\uFEFF" id="W5M0MpCehiHzreSzNTczkc9d"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="" xmlns:Iptc4xmpExt="http://iptc.org/std/Iptc4xmpExt/2008-02-29/" xmlns:xmp="http://ns.adobe.com/xap/1.0/" xmlns:lll="https://github.com/suhaimizainalshah/littlelightlit/ns/1.0/" Iptc4xmpExt:DigitalSourceType="${DST}${label}" xmp:CreatorTool="${esc(tool)}" lll:AIAssistedSteps="${esc(steps.join(", ") || "none")}"${src.length ? ` lll:SourceTypes="${esc(src.map(s => DST + s).join(" "))}"` : ""}/></rdf:RDF></x:xmpmeta><?xpacket end="w"?>`; }
  const T = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  const crc = b => { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = T[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
  async function label(blob, { label: l, steps, sources, tool } = {}) {
    try {
      if (!blob || !l || !/^image\/(jpeg|png)$/.test(blob.type)) return blob;
      const u = new Uint8Array(await blob.arrayBuffer()), enc = new TextEncoder(), x = enc.encode(packet(l, { steps, sources, tool }));
      if (blob.type === "image/jpeg" && u[0] === 0xFF && u[1] === 0xD8) { const head = enc.encode("http://ns.adobe.com/xap/1.0/\0"), len = 2 + head.length + x.length; if (len > 65535) return blob; let at = 2; if (u[2] === 0xFF && u[3] === 0xE0) at = 4 + ((u[4] << 8) | u[5]); const seg = new Uint8Array(4 + head.length + x.length); seg.set([0xFF, 0xE1, len >> 8, len & 255]); seg.set(head, 4); seg.set(x, 4 + head.length); return new Blob([u.slice(0, at), seg, u.slice(at)], { type: blob.type }); }
      if (blob.type === "image/png" && u[1] === 0x50) { const data = new Uint8Array([...enc.encode("XML:com.adobe.xmp"), 0, 0, 0, 0, 0, ...x]), type = enc.encode("iTXt"), chunk = new Uint8Array(12 + data.length), dv = new DataView(chunk.buffer); dv.setUint32(0, data.length); chunk.set(type, 4); chunk.set(data, 8); dv.setUint32(8 + data.length, crc(new Uint8Array([...type, ...data]))); return new Blob([u.slice(0, 33), chunk, u.slice(33)], { type: blob.type }); }
    } catch {}
    return blob;
  }
  window.LightLitLabels = { readSource, decide, label, packet };
})();
