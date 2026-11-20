/* Metadat · vídeo: leer los datos del archivo (MOV/MP4), abrirlo y exportarlo con el marco.
   La exportación usa el codificador del propio móvil (WebCodecs) y un empaquetador MP4/MOV propio. */
(function () {
  'use strict';
  const td = new TextDecoder();
  const cc = (dv, o) => String.fromCharCode(dv.getUint8(o), dv.getUint8(o + 1), dv.getUint8(o + 2), dv.getUint8(o + 3));
  const wait = ms => new Promise(r => setTimeout(r, ms));

  // ------------------------------------------------------------------ lectura
  async function slice(file, a, b) { return new DataView(await file.slice(a, b).arrayBuffer()); }
  function kids(dv, a, b) {
    const out = []; let o = a;
    while (o + 8 <= b) {
      let sz = dv.getUint32(o), hs = 8; const t = cc(dv, o + 4);
      if (sz === 1) { sz = Number(dv.getBigUint64(o + 8)); hs = 16; } else if (sz === 0) sz = b - o;
      if (sz < 8 || o + sz > b) break;
      out.push({ t, o, sz, c: o + hs, e: o + sz }); o += sz;
    }
    return out;
  }
  const kid = (dv, box, t) => kids(dv, box.c, box.e).find(k => k.t === t);
  async function findTop(file, type) {
    let o = 0; const n = file.size;
    while (o + 8 <= n) {
      const h = await slice(file, o, Math.min(n, o + 16)); let sz = h.getUint32(0), hs = 8; const t = cc(h, 4);
      if (sz === 1) { sz = Number(h.getBigUint64(8)); hs = 16; } else if (sz === 0) sz = n - o;
      if (sz < 8) return null;
      if (t === type) return { o, sz, hs };
      o += sz;
    }
    return null;
  }
  // claves de QuickTime (meta > keys + ilst), como las que guardan el iPhone y Blackmagic Camera
  function readKeys(dv, meta, K) {
    // en QuickTime "meta" no lleva versión; en MP4 sí. Se detecta mirando si empieza por hdlr
    let a = meta.c; if (cc(dv, a + 4) !== 'hdlr' && cc(dv, a + 8) === 'hdlr') a += 4;
    const ch = kids(dv, a, meta.e), keys = ch.find(k => k.t === 'keys'), ilst = ch.find(k => k.t === 'ilst');
    if (!keys || !ilst) return;
    const names = []; let o = keys.c + 8; const n = dv.getUint32(keys.c + 4);
    for (let i = 0; i < n && o + 8 <= keys.e; i++) { const sz = dv.getUint32(o); names.push(td.decode(new Uint8Array(dv.buffer, dv.byteOffset + o + 8, Math.max(0, sz - 8)))); o += sz; }
    kids(dv, ilst.c, ilst.e).forEach(it => {
      const idx = dv.getUint32(it.o + 4), name = names[idx - 1]; if (!name) return;
      const data = kids(dv, it.c, it.e).find(k => k.t === 'data'); if (!data) return;
      const type = dv.getUint32(data.c) & 0xffffff, v0 = data.c + 8, len = data.e - v0;
      let v = null;
      if (type === 1 || type === 2) v = td.decode(new Uint8Array(dv.buffer, dv.byteOffset + v0, len));
      else if (type === 23 && len >= 4) v = dv.getFloat32(v0);
      else if (type === 24 && len >= 8) v = dv.getFloat64(v0);
      else if ((type === 21 || type === 22) && len >= 1 && len <= 4) { v = 0; for (let i = 0; i < len; i++) v = v * 256 + dv.getUint8(v0 + i); }
      if (v != null) K[name] = typeof v === 'string' ? v.replace(/\0+$/, '').trim() : v;
    });
  }
  async function parse(file) {
    const M = { keys: {}, fps: 0, dur: 0, codec: '', hasAudio: false, created: null, w: 0, h: 0 };
    try {
      const mv = await findTop(file, 'moov'); if (!mv || mv.sz > 80e6) return M;
      const dv = await slice(file, mv.o, mv.o + mv.sz); const moov = { c: mv.hs, e: mv.sz };
      kids(dv, moov.c, moov.e).forEach(b => {
        if (b.t === 'mvhd') { const v = dv.getUint8(b.c); const ct = v ? Number(dv.getBigUint64(b.c + 4)) : dv.getUint32(b.c + 4); const ts = dv.getUint32(b.c + (v ? 20 : 12)); const du = v ? Number(dv.getBigUint64(b.c + 24)) : dv.getUint32(b.c + 16); if (ts) M.dur = du / ts; if (ct > 0) M.created = new Date((ct - 2082844800) * 1000); }
        if (b.t === 'meta') readKeys(dv, b, M.keys);
        if (b.t === 'udta') { const m = kid(dv, b, 'meta'); if (m) readKeys(dv, m, M.keys); kids(dv, b.c, b.e).forEach(u => { if (u.t === '©xyz') { const l = dv.getUint16(u.c); M.keys['com.apple.quicktime.location.ISO6709'] = M.keys['com.apple.quicktime.location.ISO6709'] || td.decode(new Uint8Array(dv.buffer, dv.byteOffset + u.c + 4, l)); } }); }
        if (b.t === 'trak') {
          const md = kid(dv, b, 'mdia'); if (!md) return; const hd = kid(dv, md, 'hdlr'); if (!hd) return; const ht = cc(dv, hd.c + 8);
          if (ht === 'soun') { M.hasAudio = true; if (!M.atrack) { try { const mi = kid(dv, md, 'minf'), sb = mi && kid(dv, mi, 'stbl'), mh = kid(dv, md, 'mdhd'); const v = dv.getUint8(mh.c); M.atrack = audioTable(dv, sb, dv.getUint32(mh.c + (v ? 20 : 12))); } catch (e) { console.warn('audio tabla', e); } } }
          if (ht !== 'vide' || M.codec) return;
          const mdhd = kid(dv, md, 'mdhd'); const v = dv.getUint8(mdhd.c); const ts = dv.getUint32(mdhd.c + (v ? 20 : 12));
          const minf = kid(dv, md, 'minf'), stbl = minf && kid(dv, minf, 'stbl');
          if (stbl) {
            const sd = kid(dv, stbl, 'stsd'); if (sd) M.codec = cc(dv, sd.c + 12);
            const tt = kid(dv, stbl, 'stts'); if (tt) { let n = 0, d = 0; const c = dv.getUint32(tt.c + 4); for (let i = 0; i < c; i++) { const a = dv.getUint32(tt.c + 8 + i * 8), dd = dv.getUint32(tt.c + 12 + i * 8); n += a; d += a * dd; } if (d && ts) M.fps = n * ts / d; }
          }
          const tk = kid(dv, b, 'tkhd'); if (tk) { M.w = Math.round(dv.getUint32(tk.e - 8) / 65536); M.h = Math.round(dv.getUint32(tk.e - 4) / 65536); }
          try { M.track = sampleTable(dv, b, md, stbl, ts, tk); } catch (e) { console.warn('tabla', e); }
        }
      });
    } catch (e) { console.warn('parse vídeo', e); }
    return M;
  }

  // Tabla de la pista de sonido: se copia tal cual al exportar (sin volver a comprimir)
  function audioTable(dv, stbl, ts) {
    const K = t => kid(dv, stbl, t);
    const sd = K('stsd'), eo = sd.c + 8, esz = dv.getUint32(eo);
    const entry = new Uint8Array(dv.buffer.slice(dv.byteOffset + eo, dv.byteOffset + eo + esz));
    const sz = K('stsz'), cs = dv.getUint32(sz.c + 4), n = dv.getUint32(sz.c + 8);
    const size = i => cs || dv.getUint32(sz.c + 12 + i * 4);
    const co = K('co64') || K('stco'), big = co.t === 'co64', nc = dv.getUint32(co.c + 4);
    const sc = K('stsc'), ns = dv.getUint32(sc.c + 4), runs = [];
    for (let i = 0; i < ns; i++) runs.push([dv.getUint32(sc.c + 8 + i * 12), dv.getUint32(sc.c + 12 + i * 12)]);
    const offs = new Float64Array(n), sizes = new Uint32Array(n); let si = 0;
    for (let c = 0; c < nc && si < n; c++) { let per = 0; for (const r of runs) if (r[0] <= c + 1) per = r[1]; let o = big ? Number(dv.getBigUint64(co.c + 8 + c * 8)) : dv.getUint32(co.c + 8 + c * 4); for (let k = 0; k < per && si < n; k++) { offs[si] = o; sizes[si] = size(si); o += sizes[si]; si++; } }
    const tt = K('stts'), dts = new Float64Array(n), durs = new Uint32Array(n); let t = 0, j = 0; const ne = dv.getUint32(tt.c + 4);
    for (let e = 0; e < ne; e++) { const c = dv.getUint32(tt.c + 8 + e * 8), d = dv.getUint32(tt.c + 12 + e * 8); for (let k = 0; k < c && j < n; k++) { dts[j] = t; durs[j++] = d; t += d; } }
    return { entry, ts, n, offs, sizes, dts, durs, cs };
  }
  // Copia el sonido original entre a y b
  async function copyAudio(file, T, a, b) {
    let i0 = -1, i1 = -1;
    for (let i = 0; i < T.n; i++) { const t = T.dts[i] / T.ts; if (t >= a - 1e-4 && i0 < 0) i0 = i; if (t < b - 1e-4) i1 = i + 1; }
    if (i0 < 0 || i1 <= i0) return null;
    const units = []; let i = i0;
    while (i < i1) {
      let j = i + 1, end = T.offs[i] + T.sizes[i];
      while (j < i1 && T.offs[j] === end && end - T.offs[i] < 4e6) { end += T.sizes[j]; j++; }
      units.push({ d: new Uint8Array(await file.slice(T.offs[i], end).arrayBuffer()), n: j - i, t: (T.dts[i] / T.ts) - a });
      i = j;
    }
    return { mode: 'copy', entry: T.entry, ts: T.ts, units, sizes: T.cs ? null : Array.from(T.sizes.subarray(i0, i1)), cs: T.cs, count: i1 - i0, durs: Array.from(T.durs.subarray(i0, i1)) };
  }

  // Tabla de muestras de la pista de vídeo: dónde está cada fotograma en el archivo y cuándo se ve
  function sampleTable(dv, trak, mdia, stbl, ts, tk) {
    const K = t => kid(dv, stbl, t);
    const sd = K('stsd'), entry = { o: sd.c + 8 }; entry.sz = dv.getUint32(entry.o); entry.t = cc(dv, entry.o + 4);
    let desc = null; kids(dv, entry.o + 8 + 78, entry.o + entry.sz).forEach(k => { if (k.t === 'hvcC' || k.t === 'avcC') desc = new Uint8Array(dv.buffer.slice(dv.byteOffset + k.c, dv.byteOffset + k.e)); });
    const cw = dv.getUint16(entry.o + 8 + 24), ch = dv.getUint16(entry.o + 8 + 26);
    const sz = K('stsz'), cs = dv.getUint32(sz.c + 4), n = dv.getUint32(sz.c + 8), sizes = new Array(n);
    for (let i = 0; i < n; i++) sizes[i] = cs || dv.getUint32(sz.c + 12 + i * 4);
    const co = K('co64') || K('stco'), big = co.t === 'co64', nc = dv.getUint32(co.c + 4), cofs = new Array(nc);
    for (let i = 0; i < nc; i++) cofs[i] = big ? Number(dv.getBigUint64(co.c + 8 + i * 8)) : dv.getUint32(co.c + 8 + i * 4);
    const sc = K('stsc'), ns = dv.getUint32(sc.c + 4), runs = [];
    for (let i = 0; i < ns; i++) runs.push([dv.getUint32(sc.c + 8 + i * 12), dv.getUint32(sc.c + 12 + i * 12)]);
    const offs = new Array(n); let si = 0;
    for (let c = 0; c < nc && si < n; c++) { let per = 0; for (const r of runs) if (r[0] <= c + 1) per = r[1]; let o = cofs[c]; for (let k = 0; k < per && si < n; k++) { offs[si] = o; o += sizes[si]; si++; } }
    const tt = K('stts'), dts = new Array(n); let t = 0, j = 0; const ne = dv.getUint32(tt.c + 4);
    for (let e = 0; e < ne; e++) { const c = dv.getUint32(tt.c + 8 + e * 8), d = dv.getUint32(tt.c + 12 + e * 8); for (let k = 0; k < c && j < n; k++) { dts[j++] = t; t += d; } }
    const ct = K('ctts'), cto = new Array(n).fill(0);
    if (ct) { const v = dv.getUint8(ct.c), m = dv.getUint32(ct.c + 4); let q = 0; for (let e = 0; e < m; e++) { const c = dv.getUint32(ct.c + 8 + e * 8); const o = dv.getInt32(ct.c + 12 + e * 8); /* con signo: Blackmagic usa negativos aunque la versión sea 0 */ for (let k = 0; k < c && q < n; k++) cto[q++] = o; } }
    const ss = K('stss'); let keys = null;
    if (ss) { keys = new Set(); const m = dv.getUint32(ss.c + 4); for (let e = 0; e < m; e++) keys.add(dv.getUint32(ss.c + 8 + e * 4) - 1); }
    // lista de edición: desde dónde empieza a verse
    let start = 0; const ed = kid(dv, trak, 'edts'), el = ed && kid(dv, ed, 'elst');
    if (el) { const v = dv.getUint8(el.c), m = dv.getUint32(el.c + 4); for (let e = 0; e < m; e++) { const mt = v ? Number(dv.getBigInt64(el.c + 8 + e * 20 + 8)) : dv.getInt32(el.c + 8 + e * 12 + 4); if (mt >= 0) { start = mt; break; } } }
    const S = []; for (let i = 0; i < n; i++) S.push({ o: offs[i], s: sizes[i], dts: dts[i], pts: (dts[i] + cto[i] - start) / ts, key: keys ? keys.has(i) : true });
    // giro: matriz de tkhd
    let rot = 0; if (tk) { const v = dv.getUint8(tk.c), mo = tk.c + (v ? 52 : 40); const a = dv.getInt32(mo) / 65536, b2 = dv.getInt32(mo + 4) / 65536; rot = Math.round(Math.atan2(b2, a) * 180 / Math.PI); rot = ((rot % 360) + 360) % 360; }
    return { fourcc: entry.t, desc, cw, ch, S, ts, rot };
  }
  const hx = n => n.toString(16).toUpperCase();
  function codecString(T) {
    const d = T.desc; if (!d) return null;
    if (/^avc/.test(T.fourcc)) return 'avc1.' + [d[1], d[2], d[3]].map(x => x.toString(16).padStart(2, '0')).join('');
    if (/^hvc|^hev/.test(T.fourcc)) {
      const sp = d[1] >> 6, tier = (d[1] >> 5) & 1, prof = d[1] & 31;
      let comp = ((d[2] << 24) | (d[3] << 16) | (d[4] << 8) | d[5]) >>> 0, rev = 0; for (let i = 0; i < 32; i++) { rev = (rev << 1) | (comp & 1); comp >>>= 1; } rev >>>= 0;
      const cons = [d[6], d[7], d[8], d[9], d[10], d[11]]; while (cons.length && !cons[cons.length - 1]) cons.pop();
      return [T.fourcc, (sp ? 'ABC'[sp - 1] : '') + prof, hx(rev), (tier ? 'H' : 'L') + d[12], ...cons.map(hx)].join('.');
    }
    return null;
  }
  // ¿Se puede leer el vídeo fotograma a fotograma con el decodificador del móvil?
  async function decoderFor(M) {
    const T = M.track; if (!T || !window.VideoDecoder || !T.S.length) return null;
    const codec = codecString(T); if (!codec) return null;
    const cfg = { codec, codedWidth: T.cw, codedHeight: T.ch, description: T.desc };
    try { const s = await VideoDecoder.isConfigSupported(cfg); if (s && s.supported) return cfg; } catch (e) { }
    try { const c2 = Object.assign({}, cfg, { hardwareAcceleration: 'prefer-hardware' }); const s = await VideoDecoder.isConfigSupported(c2); if (s && s.supported) return c2; } catch (e) { }
    return null;
  }
  // Recorre los fotogramas entre a y b en orden; cb(frameDibujable, i) es síncrona y debe devolver una promesa si hay que esperar
  async function eachFrame(file, M, cfg, a, b, cb, cancelled) {
    const T = M.track, Sx = T.S;
    // empezar en el fotograma clave anterior a "a"
    let first = 0; for (let i = 0; i < Sx.length; i++) { if (Sx[i].key && Sx[i].pts <= a + 1e-3) first = i; }
    const q = []; let err = null, done = false;
    const dec = new VideoDecoder({ output: f => q.push(f), error: e => { err = e; } });
    dec.configure(cfg);
    // lienzo derecho (aplica el giro del iPhone)
    const up = document.createElement('canvas'), ux = up.getContext('2d'); let idx = 0;
    const upright = f => {
      const w = f.displayWidth, h = f.displayHeight, r = T.rot, sw = r % 180 ? h : w, sh = r % 180 ? w : h;
      if (up.width !== sw) up.width = sw; if (up.height !== sh) up.height = sh;
      ux.setTransform(1, 0, 0, 1, 0, 0); ux.translate(sw / 2, sh / 2); ux.rotate(r * Math.PI / 180); ux.drawImage(f, -w / 2, -h / 2, w, h); ux.setTransform(1, 0, 0, 1, 0, 0);
      return up;
    };
    const drain = async () => {
      q.sort((x, y) => x.timestamp - y.timestamp);
      while (q.length) {
        const f = q.shift(), t = f.timestamp / 1e6;
        if (t < a - 1e-3 || t >= b - 1e-3 || done) { f.close(); if (t >= b - 1e-3) done = true; continue; }
        const c = upright(f); f.close();
        const p = cb(c, idx++); if (p && p.then) await p;
      }
    };
    for (let i = first; i < Sx.length && !done; i++) {
      if (cancelled && cancelled()) break; if (err) throw err;
      const s = Sx[i];
      const data = new Uint8Array(await file.slice(s.o, s.o + s.s).arrayBuffer());
      dec.decode(new EncodedVideoChunk({ type: s.key ? 'key' : 'delta', timestamp: Math.round(s.pts * 1e6), data }));
      while (dec.decodeQueueSize > 2) await wait(2);
      if (q.length) await drain(); // el decodificador entrega los fotogramas ya en orden de visionado
      if (s.pts > b + 1) break;
    }
    if (!(cancelled && cancelled())) { await dec.flush(); await drain(); }
    q.forEach(f => f.close()); try { dec.close(); } catch (e) { }
    if (err) throw err;
    return idx;
  }

  // ------------------------------------------------------------------ abrir
  function once(el, ev, ms = 8000) { return new Promise((res, rej) => { const t = setTimeout(() => { el.removeEventListener(ev, f); rej(new Error('timeout ' + ev)); }, ms); const f = () => { clearTimeout(t); el.removeEventListener(ev, f); res(); }; el.addEventListener(ev, f); }); }
  async function openVideo(src, hidden = true) {
    const v = document.createElement('video');
    v.muted = true; v.playsInline = true; v.setAttribute('playsinline', ''); v.setAttribute('webkit-playsinline', ''); v.preload = 'auto';
    if (hidden) { v.style.cssText = 'position:fixed;left:-10px;top:0;width:2px;height:2px;opacity:0;pointer-events:none'; document.body.appendChild(v); }
    const meta = once(v, 'loadedmetadata', 15000); v.src = src; await meta;
    if (v.readyState < 2) { try { await v.play(); v.pause(); } catch (e) { } if (v.readyState < 2) await once(v, 'loadeddata', 15000).catch(() => { }); }
    return v;
  }
  // Ir a un instante y esperar a que el fotograma esté de verdad listo para dibujarse
  async function seek(v, t) {
    t = Math.max(0, Math.min(v.duration - .001, t));
    if (Math.abs(v.currentTime - t) < .0005 && v.readyState >= 2) return;
    const p = once(v, 'seeked', 8000); v.currentTime = t; await p;
    if (v.requestVideoFrameCallback) await Promise.race([new Promise(r => v.requestVideoFrameCallback(() => r())), wait(60)]);
    else await wait(15);
  }

  // ------------------------------------------------------------------ codificar
  // calidad: muy por encima de lo que graba el iPhone (unos 40 Mb/s en 4K), según el tamaño final
  const BR = { hevc: 50e6, avc: 80e6 };
  const bitrateFor = (kind, w, h) => Math.round(Math.min(160e6, Math.max(12e6, BR[kind] * (w * h) / (3840 * 2160) * 1.05)));
  const even = n => Math.max(16, Math.floor(n / 4) * 4);
  // Busca la mejor combinación que acepta este móvil: primero HEVC, luego H.264; si no cabe, baja un poco el tamaño
  async function pickConfig(W, H, fps, mode) {
    if (!window.VideoEncoder) return null;
    const list = mode === 'full'
      ? [['hevc', 'hvc1.1.6.L180.B0'], ['hevc', 'hvc1.1.6.L183.B0'], ['avc', 'avc1.64003C'], ['hevc', 'hvc1.1.6.L156.B0'], ['avc', 'avc1.640034']]
      : [['hevc', 'hvc1.1.6.L153.B0'], ['hevc', 'hvc1.1.6.L156.B0'], ['avc', 'avc1.640034'], ['avc', 'avc1.640033'], ['avc', 'avc1.640028']];
    let k = 1;
    for (let tries = 0; tries < 8; tries++) {
      const w = even(W * k), h = even(H * k);
      for (const [kind, codec] of list) {
        const cfg = { codec, width: w, height: h, bitrate: bitrateFor(kind, w, h), framerate: fps, latencyMode: 'quality', bitrateMode: 'variable' };
        const fm = window.__metadatAnnexB ? 'annexb' : null; // solo para pruebas
        if (kind === 'hevc') cfg.hevc = { format: fm || 'hevc' }; else cfg.avc = { format: fm || 'avc' };
        try { const s = await VideoEncoder.isConfigSupported(cfg); if (s && s.supported) return { kind, cfg, k }; } catch (e) { }
      }
      k *= .88;
    }
    return null;
  }
  async function audioMode(sampleRate, ch) {
    if (window.AudioEncoder) {
      try { const s = await AudioEncoder.isConfigSupported({ codec: 'mp4a.40.2', sampleRate, numberOfChannels: ch, bitrate: 256000 }); if (s && s.supported) return 'aac'; } catch (e) { }
    }
    return 'pcm';
  }
  async function decodeAudio(file) {
    if (file.size > 700e6) throw new Error('grande');
    const AC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const ac = new AC(2, 48000, 48000); const buf = await file.arrayBuffer();
    return await new Promise((res, rej) => { const p = ac.decodeAudioData(buf, res, rej); if (p && p.then) p.then(res, rej); });
  }

  /* opts: { file, src (url), a, b, fps, sound, size: {W,H}, big, draw(video) -> canvas W×H, onProgress(k, eta), cancelled() }
     devuelve { blob, ext, type, kind, sound } */
  async function exportVideo(o) {
    const fps = o.fps || 30, N = Math.max(1, Math.round((o.b - o.a) * fps));
    const pick = await pickConfig(o.size.W, o.size.H, fps, o.mode);
    if (!pick) throw Object.assign(new Error('Sin codificador'), { code: 'nocodec' });
    const { kind, cfg } = pick;
    if (cfg.width !== o.size.W || cfg.height !== o.size.H) o.resize && o.resize(cfg.width, cfg.height);

    // sonido (opcional; si falla, sale sin sonido y se avisa)
    let AU = null, soundNote = '', COPY = null;
    if (o.sound && o.M && o.M.atrack) { try { COPY = await copyAudio(o.file, o.M.atrack, o.a, o.b); } catch (e) { console.warn('copiar audio', e); } }
    if (o.sound && !COPY) {
      try {
        const ab = await decodeAudio(o.file); const sr = ab.sampleRate, ch = Math.min(2, ab.numberOfChannels);
        const a0 = Math.round(o.a * sr), a1 = Math.min(ab.length, Math.round(o.b * sr)), len = Math.max(0, a1 - a0);
        const planes = []; for (let c = 0; c < ch; c++) planes.push(ab.getChannelData(c).slice(a0, a0 + len));
        AU = { sr, ch, len, planes, mode: await audioMode(sr, ch) };
      } catch (e) { console.warn('audio', e); soundNote = 'nosound'; }
    }
    const container = 'mov'; // el formato del iPhone: Fotos lo guarda siempre

    // vídeo
    const vchunks = []; let vdesc = null, encErr = null;
    const enc = new VideoEncoder({
      output: (ch, md) => { const d = new Uint8Array(ch.byteLength); ch.copyTo(d); vchunks.push({ d, ts: ch.timestamp, key: ch.type === 'key' }); if (md && md.decoderConfig && md.decoderConfig.description && !vdesc) vdesc = new Uint8Array(md.decoderConfig.description.buffer ? md.decoderConfig.description.buffer.slice(md.decoderConfig.description.byteOffset || 0, (md.decoderConfig.description.byteOffset || 0) + md.decoderConfig.description.byteLength) : md.decoderConfig.description); },
      error: e => { encErr = e; }
    });
    enc.configure(cfg);
    const t0 = performance.now(), gop = Math.max(1, Math.round(fps * 2)), kEnd = AU && AU.mode === 'aac' ? .96 : .99;
    const cancelErr = () => Object.assign(new Error('cancel'), { code: 'cancel' });
    const put = async (src, i) => {
      if (encErr) throw encErr;
      const cv = o.draw(src);
      const vf = new VideoFrame(cv, { timestamp: Math.round(i * 1e6 / fps), duration: Math.round(1e6 / fps) });
      enc.encode(vf, { keyFrame: i % gop === 0 }); vf.close();
      while (enc.encodeQueueSize > 3) await wait(4);
      const k = Math.min(1, (i + 1) / N), el = (performance.now() - t0) / 1000;
      o.onProgress && o.onProgress(k * kEnd, el / k - el);
    };
    // 1) leer los fotogramas originales uno a uno con el decodificador (exacto y rápido)
    let used = 'seek', count = 0;
    const dcfg = o.M ? await decoderFor(o.M) : null;
    if (dcfg) {
      try { count = await eachFrame(o.file, o.M, dcfg, o.a, o.b, (c, i) => put(c, i), o.cancelled); used = 'decoder'; }
      catch (e) { console.warn('decoder, se usa el otro método', e); if (e.code === 'cancel') throw e; if (count) throw e; }
    }
    if (o.cancelled && o.cancelled()) { try { enc.close(); } catch (e) { } throw cancelErr(); }
    // 2) si no, buscando cada instante en el reproductor
    if (used === 'seek') {
      const v = o.video; v.pause(); v.muted = true;
      for (let i = 0; i < N; i++) {
        if (o.cancelled && o.cancelled()) { try { enc.close(); } catch (e) { } throw cancelErr(); }
        await seek(v, o.a + (i + .25) / fps); await put(v, i);
      }
      count = N;
    }
    if (!count) throw new Error('Sin fotogramas');
    await enc.flush(); enc.close(); if (encErr) throw encErr;
    fixAnnexB(vchunks, kind, d => { vdesc = d; }, vdesc);
    if (!vdesc) throw Object.assign(new Error('Sin descripción del códec'), { code: 'nocodec' });

    // audio
    let A = COPY;
    if (!A && AU) {
      if (AU.mode === 'aac') {
        const achunks = []; let adesc = null, aerr = null;
        const ae = new AudioEncoder({ output: (ch, md) => { const d = new Uint8Array(ch.byteLength); ch.copyTo(d); achunks.push({ d, ts: ch.timestamp, dur: ch.duration }); if (md && md.decoderConfig && md.decoderConfig.description && !adesc) adesc = new Uint8Array(md.decoderConfig.description.buffer ? md.decoderConfig.description.buffer.slice(0) : md.decoderConfig.description); }, error: e => { aerr = e; } });
        ae.configure({ codec: 'mp4a.40.2', sampleRate: AU.sr, numberOfChannels: AU.ch, bitrate: 256000 });
        const B = 4096;
        for (let p = 0; p < AU.len; p += B) {
          const n = Math.min(B, AU.len - p), data = new Float32Array(n * AU.ch);
          for (let c = 0; c < AU.ch; c++) data.set(AU.planes[c].subarray(p, p + n), c * n);
          const ad = new AudioData({ format: 'f32-planar', sampleRate: AU.sr, numberOfFrames: n, numberOfChannels: AU.ch, timestamp: Math.round(p * 1e6 / AU.sr), data });
          ae.encode(ad); ad.close();
        }
        await ae.flush(); ae.close(); if (aerr) throw aerr;
        if (!adesc) adesc = asc(AU.sr, AU.ch);
        A = { mode: 'aac', sr: AU.sr, ch: AU.ch, chunks: achunks, desc: adesc };
      } else {
        // PCM 16 bits intercalado (little endian, "sowt"): sin pérdida, cabe en MOV
        const pcm = new Int16Array(AU.len * AU.ch);
        for (let i = 0; i < AU.len; i++) for (let c = 0; c < AU.ch; c++) { const s = Math.max(-1, Math.min(1, AU.planes[c][i])); pcm[i * AU.ch + c] = s < 0 ? s * 32768 : s * 32767; }
        A = { mode: 'pcm', sr: AU.sr, ch: AU.ch, pcm: new Uint8Array(pcm.buffer), frames: AU.len };
      }
    }
    o.onProgress && o.onProgress(1, 0);
    const blob = mux({ container, kind, W: cfg.width, H: cfg.height, fps, vchunks, vdesc, A });
    return { blob, ext: container, type: container === 'mov' ? 'video/quicktime' : 'video/mp4', kind, sound: !!A, soundNote, W: cfg.width, H: cfg.height, used, frames: count };
  }
  // Si el codificador entrega los fotogramas con códigos de inicio (Annex B), se pasan al formato de MP4/MOV
  function nalsOf(d) {
    const out = []; let i = 0, st = -1;
    const isSC = k => d[k] === 0 && d[k + 1] === 0 && (d[k + 2] === 1 || (d[k + 2] === 0 && d[k + 3] === 1));
    while (i < d.length - 3) { if (isSC(i)) { const len = d[i + 2] === 1 ? 3 : 4; if (st >= 0) out.push(d.subarray(st, i)); st = i + len; i += len; } else i++; }
    if (st >= 0) out.push(d.subarray(st)); return out.map(n => { let e = n.length; while (e > 0 && n[e - 1] === 0) e--; return n.subarray(0, e); }).filter(n => n.length);
  }
  function unescape(n) { const o = []; for (let i = 0; i < n.length; i++) { if (i >= 2 && n[i] === 3 && n[i - 1] === 0 && n[i - 2] === 0) continue; o.push(n[i]); } return new Uint8Array(o); }
  function fixAnnexB(ch, kind, setDesc, desc) {
    if (!ch.length) return; const d0 = ch[0].d;
    if (!(d0[0] === 0 && d0[1] === 0 && (d0[2] === 1 || (d0[2] === 0 && d0[3] === 1)))) return;
    console.info('Metadat: Annex B convertido'); const hevc = kind === 'hevc', ps = { vps: null, sps: null, pps: null };
    ch.forEach(c => {
      const keep = [];
      nalsOf(c.d).forEach(n => {
        const t = hevc ? (n[0] >> 1) & 63 : n[0] & 31;
        if (hevc ? t === 32 : false) { ps.vps = ps.vps || n; return; }
        if (hevc ? t === 33 : t === 7) { ps.sps = ps.sps || n; return; }
        if (hevc ? t === 34 : t === 8) { ps.pps = ps.pps || n; return; }
        if (hevc ? t === 35 || t === 39 || t === 40 : t === 9 || t === 6) return; // delimitadores y SEI
        keep.push(n);
      });
      let L = 0; keep.forEach(n => L += 4 + n.length); const o = new Uint8Array(L); let k = 0;
      keep.forEach(n => { o[k] = n.length >>> 24; o[k + 1] = n.length >> 16 & 255; o[k + 2] = n.length >> 8 & 255; o[k + 3] = n.length & 255; o.set(n, k + 4); k += 4 + n.length; });
      c.d = o;
    });
    if (desc && desc.length > 7 && desc[0] === 1) return; // ya había descripción buena
    if (!ps.sps || !ps.pps) return;
    const arr = (t, n) => cat([u8([0x80 | t]), u16(1), u16(n.length), n]);
    if (hevc) {
      if (!ps.vps) return; const r = unescape(ps.sps); // r[0..1] cabecera; r[2] ids; r[3..14] perfil
      setDesc(cat([u8([1, r[3]]), r.subarray(4, 8), r.subarray(8, 14), u8([r[14]]), u8([0xF0, 0, 0xFC, 0xFD, 0xF8, 0xF8, 0, 0, 0x0F, 3]), arr(32, ps.vps), arr(33, ps.sps), arr(34, ps.pps)]));
    } else {
      setDesc(cat([u8([1, ps.sps[1], ps.sps[2], ps.sps[3], 0xFF, 0xE1]), u16(ps.sps.length), ps.sps, u8([1]), u16(ps.pps.length), ps.pps]));
    }
  }
  function asc(sr, ch) { const R = [96000, 88200, 64000, 48000, 44100, 32000, 24000, 22050, 16000, 12000, 11025, 8000]; const fi = Math.max(0, R.indexOf(sr)); return new Uint8Array([(2 << 3) | (fi >> 1), ((fi & 1) << 7) | (ch << 3)]); }

  // ------------------------------------------------------------------ empaquetar (MP4 / MOV)
  const u8 = a => new Uint8Array(a);
  const u16 = n => u8([n >> 8 & 255, n & 255]);
  const u32 = n => u8([n >>> 24 & 255, n >>> 16 & 255, n >>> 8 & 255, n & 255]);
  const i32 = n => u32(n >>> 0);
  const u64 = n => { const hi = Math.floor(n / 4294967296), lo = n >>> 0; return cat([u32(hi), u32(lo)]); };
  const str = s => u8([...s].map(c => c.charCodeAt(0)));
  const zeros = n => new Uint8Array(n);
  function cat(parts) { let n = 0; parts.forEach(p => n += p.length); const o = new Uint8Array(n); let k = 0; parts.forEach(p => { o.set(p, k); k += p.length; }); return o; }
  const box = (t, ...p) => { const b = cat(p); return cat([u32(b.length + 8), str(t), b]); };
  const full = (t, v, f, ...p) => box(t, u8([v, f >> 16 & 255, f >> 8 & 255, f & 255]), ...p);
  const MATRIX = cat([u32(0x10000), u32(0), u32(0), u32(0), u32(0x10000), u32(0), u32(0), u32(0), u32(0x40000000)]);

  function mux({ container, kind, W, H, fps, vchunks, vdesc, A }) {
    const mov = container === 'mov';
    const now = Math.floor(Date.now() / 1000) + 2082844800;
    const ftyp = mov ? box('ftyp', str('qt  '), u32(0), str('qt  ')) : box('ftyp', str('isom'), u32(512), str('isom'), str('iso2'), str('mp41'), str('mp42'));
    const head = ftyp.length + 16; // mdat con tamaño de 64 bits
    // datos: vídeo y audio intercalados por segundos, para que se reproduzca fluido
    const parts = []; let off = head;
    const vOff = [], aOff = [];
    const aUnits = A ? (A.mode === 'copy' ? A.units.map(u => u.d) : A.mode === 'aac' ? A.chunks.map(c => c.d) : (() => { const out = [], per = A.sr, bpf = 2 * A.ch; for (let p = 0; p < A.frames; p += per) out.push(A.pcm.subarray(p * bpf, Math.min(A.frames, p + per) * bpf)); return out; })()) : [];
    const aTimes = A ? (A.mode === 'copy' ? A.units.map(u => u.t) : A.mode === 'aac' ? A.chunks.map(c => c.ts / 1e6) : aUnits.map((_, i) => i)) : [];
    let ai = 0;
    vchunks.forEach((c, i) => {
      const t = i / fps;
      while (ai < aUnits.length && aTimes[ai] <= t + .5) { aOff.push(off); parts.push(aUnits[ai]); off += aUnits[ai].length; ai++; }
      vOff.push(off); parts.push(c.d); off += c.d.length;
    });
    while (ai < aUnits.length) { aOff.push(off); parts.push(aUnits[ai]); off += aUnits[ai].length; ai++; }
    const mdatSize = off - ftyp.length;
    const mdatHead = cat([u32(1), str('mdat'), u64(mdatSize)]);

    // pista de vídeo
    const VTS = Math.round(fps * 1000) % 1000 === 0 ? fps * 1000 : 90000, vd = Math.round(VTS / fps);
    const n = vchunks.length, vDur = n * vd;
    // orden de decodificación vs. presentación (por si el codificador usa fotogramas B)
    const pts = vchunks.map(c => Math.round(c.ts * VTS / 1e6));
    let shift = 0; pts.forEach((p, i) => { shift = Math.max(shift, i * vd - p); });
    const offs = pts.map((p, i) => p + shift - i * vd), needCtts = offs.some(x => x !== 0);
    const vEntry = box(kind === 'hevc' ? 'hvc1' : 'avc1', zeros(6), u16(1), u16(0), u16(0), zeros(12), u16(W), u16(H), u32(0x480000), u32(0x480000), u32(0), u16(1),
      cat([u8([8]), str('Metadat'), zeros(24)]), u16(0x18), u16(0xffff),
      box(kind === 'hevc' ? 'hvcC' : 'avcC', vdesc),
      box('pasp', u32(1), u32(1)));
    const keys = []; vchunks.forEach((c, i) => { if (c.key) keys.push(i + 1); });
    const vStbl = box('stbl',
      full('stsd', 0, 0, u32(1), vEntry),
      full('stts', 0, 0, u32(1), u32(n), u32(vd)),
      ...(needCtts ? [full('ctts', 0, 0, u32(n), ...offs.map(x => cat([u32(1), u32(x)])))] : []),
      ...(keys.length && keys.length < n ? [full('stss', 0, 0, u32(keys.length), ...keys.map(u32))] : []),
      full('stsc', 0, 0, u32(1), u32(1), u32(1), u32(1)),
      full('stsz', 0, 0, u32(0), u32(n), ...vchunks.map(c => u32(c.d.length))),
      full('co64', 0, 0, u32(n), ...vOff.map(u64)));
    const MTS = 1000, mvDur = Math.round(n / fps * MTS);
    const dinf = box('dinf', full('dref', 0, 0, u32(1), full('url ', 0, 1)));
    const hdlr = (t, name) => full('hdlr', 0, 0, mov ? str('mhlr') : u32(0), str(t), zeros(12), str(name + '\0'));
    const edts = shift ? box('edts', full('elst', 0, 0, u32(1), u32(mvDur), i32(shift), u32(0x10000))) : null;
    const vTrak = box('trak',
      full('tkhd', 0, 3, u32(now), u32(now), u32(1), u32(0), u32(mvDur), zeros(8), u16(0), u16(0), u16(0), u16(0), MATRIX, u32(W * 65536), u32(H * 65536)),
      ...(edts ? [edts] : []),
      box('mdia', full('mdhd', 0, 0, u32(now), u32(now), u32(VTS), u32(vDur), u16(0x55c4), u16(0)), hdlr('vide', 'Video'),
        box('minf', full('vmhd', 0, 1, u16(0), u16(0), u16(0), u16(0)), dinf, vStbl)));

    // pista de audio
    let aTrak = null;
    if (A) {
      let entry, stts, stsz, stsc, aDur, ATS = A.sr;
      if (A.mode === 'copy') {
        ATS = A.ts; entry = A.entry; aDur = A.durs.reduce((x, y) => x + y, 0);
        const rl = []; A.durs.forEach(d => { const l = rl[rl.length - 1]; if (l && l[1] === d) l[0]++; else rl.push([1, d]); });
        stts = full('stts', 0, 0, u32(rl.length), ...rl.map(([c, d]) => cat([u32(c), u32(d)])));
        stsz = A.cs ? full('stsz', 0, 0, u32(A.cs), u32(A.count)) : full('stsz', 0, 0, u32(0), u32(A.count), ...A.sizes.map(u32));
        const sr = []; A.units.forEach((u, i) => { const l = sr[sr.length - 1]; if (!l || l[1] !== u.n) sr.push([i + 1, u.n]); });
        stsc = full('stsc', 0, 0, u32(sr.length), ...sr.map(([f, n]) => cat([u32(f), u32(n), u32(1)])));
      } else if (A.mode === 'aac') {
        const es = esds(A.desc, A.ch);
        entry = box('mp4a', zeros(6), u16(1), zeros(8), u16(A.ch), u16(16), u16(0), u16(0), u32(A.sr * 65536), es);
        const m = A.chunks.length; aDur = m * 1024;
        stts = full('stts', 0, 0, u32(1), u32(m), u32(1024));
        stsz = full('stsz', 0, 0, u32(0), u32(m), ...A.chunks.map(c => u32(c.d.length)));
        stsc = full('stsc', 0, 0, u32(1), u32(1), u32(1), u32(1));
      } else {
        entry = box('sowt', zeros(6), u16(1), u16(0), u16(0), u32(0), u16(A.ch), u16(16), u16(0), u16(0), u32(A.sr * 65536));
        aDur = A.frames;
        stts = full('stts', 0, 0, u32(1), u32(A.frames), u32(1));
        stsz = full('stsz', 0, 0, u32(2 * A.ch), u32(A.frames));
        const per = A.sr, m = aUnits.length, last = A.frames - per * (m - 1);
        stsc = last === per || m === 1 ? full('stsc', 0, 0, u32(1), u32(1), u32(m === 1 ? A.frames : per), u32(1))
          : full('stsc', 0, 0, u32(2), u32(1), u32(per), u32(1), u32(m), u32(last), u32(1));
      }
      const aStbl = box('stbl', full('stsd', 0, 0, u32(1), entry), stts, stsc, stsz, full('co64', 0, 0, u32(aOff.length), ...aOff.map(u64)));
      const adMs = Math.round(aDur / ATS * MTS);
      aTrak = box('trak',
        full('tkhd', 0, 3, u32(now), u32(now), u32(2), u32(0), u32(adMs), zeros(8), u16(0), u16(1), u16(0x0100), u16(0), MATRIX, u32(0), u32(0)),
        box('mdia', full('mdhd', 0, 0, u32(now), u32(now), u32(ATS), u32(aDur), u16(0x55c4), u16(0)), hdlr('soun', 'Sound'),
          box('minf', full('smhd', 0, 0, u16(0), u16(0)), dinf, aStbl)));
    }
    const mvhd = full('mvhd', 0, 0, u32(now), u32(now), u32(MTS), u32(mvDur), u32(0x10000), u16(0x100), zeros(10), MATRIX, zeros(24), u32(A ? 3 : 2));
    const moov = box('moov', mvhd, vTrak, ...(aTrak ? [aTrak] : []));
    return new Blob([ftyp, mdatHead, ...parts, moov], { type: mov ? 'video/quicktime' : 'video/mp4' });
  }
  function esds(asc, ch) {
    const desc = (tag, body) => cat([u8([tag, body.length]), body]);
    const dsi = desc(0x05, asc);
    const dcd = desc(0x04, cat([u8([0x40, 0x15, 0, 0, 0]), u32(320000), u32(256000), dsi]));
    const sl = desc(0x06, u8([0x02]));
    const es = desc(0x03, cat([u16(ch ? 1 : 1), u8([0]), dcd, sl]));
    return full('esds', 0, 0, es);
  }

  window.MetaVideo = { parse, openVideo, seek, exportVideo, pickConfig, audioMode, decoderFor, eachFrame, mux, copyAudio, isVideo: f => /^video\//.test(f.type || '') || /\.(mov|mp4|m4v|hevc)$/i.test(f.name || '') };
})();
