/* Metadat · procesado de la foto: películas, ajustes, recorte, histograma y desenfoque. */
(function () {
  // Películas propias. Valores pensados como "carácter", no como imitación de ninguna marca.
  const FILMS = [
    { id: 'none', name: 'Ninguna', desc: 'La foto tal cual' },
    { id: 'retrato400', name: 'Retrato 400', desc: 'Piel cálida, sombras suaves', warm: .08, sat: -.06, con: -.06, fade: .05, sh: [6, 2, -4], hi: [8, 4, -6], grain: .18 },
    { id: 'retrato160', name: 'Retrato 160', desc: 'Delicada y limpia', warm: .04, sat: -.12, con: -.1, fade: .07, sh: [0, 3, 4], hi: [6, 4, 0], grain: .1 },
    { id: 'paisaje100', name: 'Paisaje 100', desc: 'Color intenso, mucho detalle', warm: .02, sat: .2, con: .12, fade: 0, sh: [-2, 0, 6], hi: [4, 3, -2], grain: .06 },
    { id: 'dorada200', name: 'Dorada 200', desc: 'Cálida y con grano fino', warm: .14, sat: .06, con: .04, fade: .06, sh: [8, 4, -6], hi: [12, 6, -10], grain: .22 },
    { id: 'plata400', name: 'Plata 400', desc: 'Blanco y negro con contraste', bw: 1, con: .18, fade: .04, grain: .3 },
    { id: 'plata100', name: 'Plata 100', desc: 'Blanco y negro suave', bw: 1, con: -.04, fade: .08, sh: [2, 2, 4], grain: .12 },
    { id: 'diapositiva50', name: 'Diapositiva 50', desc: 'Negros profundos, color vivo', warm: -.02, sat: .24, con: .22, fade: 0, sh: [-4, 0, 8], hi: [2, 2, 0], grain: .05 },
    { id: 'cine800t', name: 'Cine 800T', desc: 'Luz de tungsteno, noche', warm: -.12, sat: -.02, con: .06, fade: .06, sh: [-6, 4, 12], hi: [10, 4, -8], grain: .34, halo: 1 },
    { id: 'invierno', name: 'Invierno 160', desc: 'Fría y desaturada', warm: -.08, sat: -.24, con: -.02, fade: .1, sh: [0, 4, 8], hi: [0, 2, 6], grain: .12 }
  ];

  const ADJ = [
    { id: 'bri', name: 'Brillo', min: -100, max: 100 },
    { id: 'con', name: 'Contraste', min: -100, max: 100 },
    { id: 'sat', name: 'Saturación', min: -100, max: 100 },
    { id: 'tem', name: 'Temperatura', min: -100, max: 100 },
    { id: 'tin', name: 'Tono', min: -100, max: 100 },
    { id: 'sha', name: 'Sombras', min: -100, max: 100 },
    { id: 'gra', name: 'Grano', min: 0, max: 100 },
    { id: 'vig', name: 'Viñeta', min: 0, max: 100 }
  ];

  const clamp = v => v < 0 ? 0 : v > 255 ? 255 : v;

  // Recorta la foto a una proporción (h/w) y devuelve un canvas de ancho máximo maxW
  function crop(img, ratio, maxSide) {
    const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    let sx = 0, sy = 0, sw = iw, sh = ih;
    if (ratio) {
      if (ih / iw > ratio) { sh = iw * ratio; sy = (ih - sh) / 2; }
      else { sw = ih / ratio; sx = (iw - sw) / 2; }
    }
    const k = Math.min(1, maxSide / Math.max(sw, sh));
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(sw * k)); c.height = Math.max(1, Math.round(sh * k));
    const x = c.getContext('2d');
    x.imageSmoothingQuality = 'high';
    x.drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
    return c;
  }

  // Aplica película + ajustes sobre un canvas (en sitio)
  function process(cv, st) {
    const film = FILMS.find(f => f.id === st.film) || FILMS[0];
    const a = st.adj || {};
    const I = (st.filmAmt == null ? 100 : st.filmAmt) / 100;
    const fx = film.id === 'none' ? {} : film;
    const bri = (a.bri || 0) / 100, con = (a.con || 0) / 100 + (fx.con || 0) * I, sat = (a.sat || 0) / 100 + (fx.sat || 0) * I;
    const tem = (a.tem || 0) / 100 * .12 + (fx.warm || 0) * I, tin = (a.tin || 0) / 100 * .08, sha = (a.sha || 0) / 100;
    const fade = (fx.fade || 0) * I, bw = (fx.bw || 0) * I;
    const grain = Math.max((a.gra || 0) / 100, (fx.grain || 0) * I * .6), vig = (a.vig || 0) / 100;
    const shT = (fx.sh || [0, 0, 0]).map(v => v * I), hiT = (fx.hi || [0, 0, 0]).map(v => v * I);
    const plain = !bri && !con && !sat && !tem && !tin && !sha && !fade && !bw && !grain && !vig && !shT.some(Boolean) && !hiT.some(Boolean);
    if (plain) return cv;
    // curva tonal común
    const lut = new Float32Array(256);
    const cf = con >= 0 ? 1 + con * 1.6 : 1 + con;
    for (let i = 0; i < 256; i++) {
      let v = i / 255;
      v = v + bri * .35 * (1 - Math.abs(v - .5));
      if (sha) v = v + sha * .25 * Math.pow(1 - v, 3) * (v > .02 ? 1 : v * 50);
      v = (v - .5) * cf + .5;
      v = fade + v * (1 - fade);
      lut[i] = Math.min(1, Math.max(0, v)) * 255;
    }
    const x = cv.getContext('2d', { willReadFrequently: true });
    const w = cv.width, h = cv.height;
    const d = x.getImageData(0, 0, w, h), p = d.data;
    const cx = w / 2, cy = h / 2, md = Math.hypot(cx, cy);
    let seed = 1337;
    const rnd = () => { seed = (seed * 1664525 + 1013904223) | 0; return ((seed >>> 8) & 0xffff) / 65536 - .5; };
    const gAmp = grain * 38 * Math.max(.6, Math.min(1.4, w / 1600));
    for (let y = 0; y < h; y++) {
      for (let xx = 0; xx < w; xx++) {
        const o = (y * w + xx) * 4;
        let r = lut[p[o]], g = lut[p[o + 1]], b = lut[p[o + 2]];
        r += tem * 255 * .5; b -= tem * 255 * .5; g -= tin * 255 * .5; r += tin * 255 * .15; b += tin * 255 * .15;
        const L = .2126 * r + .7152 * g + .0722 * b;
        if (sat) { r = L + (r - L) * (1 + sat); g = L + (g - L) * (1 + sat); b = L + (b - L) * (1 + sat); }
        if (bw) { const l2 = .3 * r + .59 * g + .11 * b; r += (l2 - r) * bw; g += (l2 - g) * bw; b += (l2 - b) * bw; }
        const t = L / 255;
        const ws = (1 - t) * (1 - t), wh = t * t;
        r += shT[0] * ws + hiT[0] * wh; g += shT[1] * ws + hiT[1] * wh; b += shT[2] * ws + hiT[2] * wh;
        if (vig) { const dd = Math.hypot(xx - cx, y - cy) / md; const f = 1 - vig * .75 * Math.pow(Math.max(0, dd - .35) / .65, 1.6); r *= f; g *= f; b *= f; }
        if (grain) { const n = rnd() * gAmp * (1 - Math.abs(t - .5)); r += n; g += n; b += n; }
        p[o] = clamp(r); p[o + 1] = clamp(g); p[o + 2] = clamp(b);
      }
    }
    x.putImageData(d, 0, 0);
    return cv;
  }

  function histogram(cv) {
    const s = document.createElement('canvas'), k = Math.min(1, 220 / Math.max(cv.width, cv.height));
    s.width = Math.max(1, cv.width * k | 0); s.height = Math.max(1, cv.height * k | 0);
    const x = s.getContext('2d', { willReadFrequently: true }); x.drawImage(cv, 0, 0, s.width, s.height);
    const p = x.getImageData(0, 0, s.width, s.height).data, H = new Array(32).fill(0);
    for (let i = 0; i < p.length; i += 4) H[Math.min(31, (.2126 * p[i] + .7152 * p[i + 1] + .0722 * p[i + 2]) / 8 | 0)]++;
    const m = Math.max(...H); return H.map(v => v / (m || 1));
  }

  // desenfoque barato: reducir y ampliar dos veces
  function blurred(cv, small = 18) {
    const a = document.createElement('canvas'); a.width = small; a.height = Math.max(1, Math.round(small * cv.height / cv.width));
    a.getContext('2d').drawImage(cv, 0, 0, a.width, a.height);
    const b = document.createElement('canvas'); b.width = a.width * 4; b.height = a.height * 4;
    const bx = b.getContext('2d'); bx.imageSmoothingQuality = 'high'; bx.drawImage(a, 0, 0, b.width, b.height);
    return b;
  }

  // colores principales (cuantización simple por cubos)
  function palette(cv, n = 5) {
    const s = document.createElement('canvas'); s.width = 64; s.height = Math.max(1, Math.round(64 * cv.height / cv.width));
    const x = s.getContext('2d', { willReadFrequently: true }); x.drawImage(cv, 0, 0, s.width, s.height);
    const p = x.getImageData(0, 0, s.width, s.height).data, B = new Map();
    for (let i = 0; i < p.length; i += 4) {
      const k = (p[i] >> 5) << 6 | (p[i + 1] >> 5) << 3 | (p[i + 2] >> 5);
      const e = B.get(k) || [0, 0, 0, 0]; e[0] += p[i]; e[1] += p[i + 1]; e[2] += p[i + 2]; e[3]++; B.set(k, e);
    }
    const cols = [...B.values()].map(e => [e[0] / e[3], e[1] / e[3], e[2] / e[3], e[3]]);
    // puntuar: frecuencia + algo de saturación para que salgan los acentos
    cols.forEach(c => { const mx = Math.max(c[0], c[1], c[2]), mn = Math.min(c[0], c[1], c[2]); c[4] = c[3] * (1 + 2.2 * (mx - mn) / 255); });
    cols.sort((a, b) => b[4] - a[4]);
    const out = [];
    for (const c of cols) {
      if (out.every(o => Math.hypot(o[0] - c[0], o[1] - c[1], o[2] - c[2]) > 56)) out.push(c);
      if (out.length === n) break;
    }
    while (out.length < n) out.push(out[out.length - 1] || [128, 128, 128]);
    out.sort((a, b) => (.3 * a[0] + .59 * a[1] + .11 * a[2]) - (.3 * b[0] + .59 * b[1] + .11 * b[2]));
    return out.map(c => '#' + c.slice(0, 3).map(v => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase());
  }

  function colorName(hex) {
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 510, s = mx === mn ? 0 : (mx - mn) / 255;
    if (s < .12) return l < .18 ? 'Hollín' : l < .42 ? 'Grafito' : l < .7 ? 'Niebla' : 'Yeso';
    let hh; const d = mx - mn;
    if (mx === r) hh = ((g - b) / d) % 6; else if (mx === g) hh = (b - r) / d + 2; else hh = (r - g) / d + 4;
    hh = (hh * 60 + 360) % 360;
    const dark = l < .3;
    if (hh < 15 || hh >= 345) return dark ? 'Granate' : 'Teja';
    if (hh < 40) return dark ? 'Óxido' : l > .7 ? 'Arena' : 'Tejado';
    if (hh < 65) return dark ? 'Oliva' : l > .65 ? 'Cielo' : 'Ocre';
    if (hh < 160) return dark ? 'Musgo' : 'Liquen';
    if (hh < 200) return dark ? 'Petróleo' : 'Turquesa';
    if (hh < 250) return dark ? 'Índigo' : l > .6 ? 'Azul claro' : 'Mar';
    if (hh < 300) return dark ? 'Ciruela' : 'Lavanda';
    return dark ? 'Vino' : 'Rosa';
  }

  window.MetaImg = { FILMS, ADJ, crop, process, histogram, blurred, palette, colorName };
})();
