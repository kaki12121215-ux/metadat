/* Metadat · procesado de la foto: películas, ajustes, recorte, histograma y desenfoque. */
(function () {
  // Películas propias. Valores pensados como "carácter", no como imitación de ninguna marca.
  // Películas propias. Cada una parte del carácter de un tipo de película o de un look de color conocido.
  const CATS = [['all', 'Todas'], ['color', 'Color'], ['bn', 'B/N'], ['cine', 'Cine'], ['tema', 'Temas']];
  const FILMS = [
    { id: 'none', name: 'Ninguna', desc: 'La foto tal cual', cat: 'all' },
    // --- color: negativos y diapositivas clásicas
    { id: 'retrato400', cat: 'color', name: 'Retrato 400', desc: 'Negativo de retrato: piel cálida, sombras suaves', warm: .07, sat: -.06, con: -.06, fade: .05, sh: [6, 2, -4], hi: [8, 4, -6], grain: .18 },
    { id: 'retrato160', cat: 'color', name: 'Retrato 160', desc: 'Negativo fino, delicado y limpio', warm: .04, sat: -.12, con: -.1, fade: .07, sh: [0, 3, 4], hi: [6, 4, 0], grain: .1 },
    { id: 'pastel400', cat: 'color', name: 'Pastel 400', desc: 'Tonos pastel, verdes menta y luces altas', warm: -.02, tint: -.03, sat: -.14, con: -.14, fade: .09, exp: .12, sh: [-2, 6, 6], hi: [2, 5, 2], grain: .12 },
    { id: 'paisaje100', cat: 'color', name: 'Paisaje 100', desc: 'Diapositiva de paisaje: color intenso y detalle', warm: .02, sat: .2, vib: .15, con: .12, sh: [-2, 0, 6], hi: [4, 3, -2], grain: .06 },
    { id: 'vivida100', cat: 'color', name: 'Vívida 100', desc: 'Negativo moderno, muy saturado y nítido', warm: .03, sat: .28, con: .16, sh: [0, -2, 4], hi: [6, 2, -4], grain: .04 },
    { id: 'dorada200', cat: 'color', name: 'Dorada 200', desc: 'Negativo de diario: cálido y con grano fino', warm: .14, sat: .06, con: .04, fade: .06, sh: [8, 4, -6], hi: [12, 6, -10], grain: .22 },
    { id: 'super400', cat: 'color', name: 'Súper 400', desc: 'Negativo de consumo: verdes fríos y magentas vivos', warm: -.03, tint: -.04, sat: .08, con: .08, fade: .03, sh: [-4, 6, 2], hi: [4, 0, 4], grain: .2 },
    { id: 'diapositiva50', cat: 'color', name: 'Diapositiva 50', desc: 'Negros profundos y color vivo', warm: -.02, sat: .24, con: .22, sh: [-4, 0, 8], hi: [2, 2, 0], grain: .05 },
    { id: 'croma64', cat: 'color', name: 'Croma 64', desc: 'Diapositiva de los 60: rojos densos, cielos profundos', warm: .05, sat: .14, con: .24, fade: .02, sh: [4, -2, -6], hi: [8, 4, -8], grain: .1, vig: .15 },
    { id: 'instantanea600', cat: 'color', name: 'Instantánea 600', desc: 'Foto instantánea: lavada, verdosa y suave', warm: .06, tint: -.05, sat: -.18, con: -.16, fade: .14, sh: [0, 10, 8], hi: [10, 8, -6], grain: .16, vig: .2 },
    // --- blanco y negro
    { id: 'plata400', cat: 'bn', name: 'Plata 400', desc: 'Blanco y negro de reportaje, con contraste', bw: 1, con: .18, fade: .04, grain: .3 },
    { id: 'plata100', cat: 'bn', name: 'Plata 100', desc: 'Blanco y negro suave, grano muy fino', bw: 1, con: -.04, fade: .08, sh: [2, 2, 4], grain: .12 },
    { id: 'grano3200', cat: 'bn', name: 'Grano 3200', desc: 'Película rápida forzada: grano grueso', bw: 1, con: .26, fade: .08, exp: .08, grain: .7 },
    { id: 'carbon', cat: 'bn', name: 'Carbón', desc: 'Alto contraste, negros cerrados', bw: 1, con: .5, exp: -.05, grain: .15, vig: .2 },
    { id: 'filtrorojo', cat: 'bn', name: 'Filtro rojo', desc: 'Como con filtro rojo: cielos oscuros y dramáticos', bw: 1, mix: [.9, .25, -.15], con: .22, grain: .2 },
    { id: 'sepia', cat: 'bn', name: 'Sepia', desc: 'Virado sepia de copia antigua', bw: 1, con: .04, fade: .1, sh: [14, 6, -8], hi: [16, 10, -8], grain: .2 },
    { id: 'selenio', cat: 'bn', name: 'Selenio', desc: 'Virado frío, violáceo en las sombras', bw: 1, con: .12, sh: [2, 0, 12], hi: [4, 2, 4], grain: .16 },
    { id: 'cianotipo', cat: 'bn', name: 'Cianotipo', desc: 'Copia azul de Prusia', bw: 1, con: .16, fade: .06, sh: [-22, -4, 26], hi: [-12, 4, 16], grain: .1 },
    // --- cine
    { id: 'cine800t', cat: 'cine', name: 'Cine 800T', desc: 'Negativo de tungsteno: noches azuladas', warm: -.12, sat: -.02, con: .06, fade: .06, sh: [-6, 4, 12], hi: [10, 4, -8], grain: .34 },
    { id: 'azulnaranja', cat: 'cine', name: 'Azul y naranja', desc: 'El etalonaje de superproducción: pieles cálidas, sombras verdiazules', sat: .1, con: .14, sh: [-16, 4, 16], hi: [16, 6, -14], grain: .08 },
    { id: 'sinblanqueo', cat: 'cine', name: 'Sin blanqueo', desc: 'Proceso sin blanqueo: desaturado y muy contrastado', sat: -.5, con: .4, fade: .03, sh: [0, 2, 4], grain: .28 },
    { id: 'thriller', cat: 'cine', name: 'Thriller', desc: 'Dominante verde y luces amarillentas', tint: -.06, sat: -.12, con: .18, sh: [-8, 10, -2], hi: [8, 10, -12], grain: .14, vig: .2 },
    { id: 'nocheamericana', cat: 'cine', name: 'Noche americana', desc: 'Día rodado como noche: oscuro y azul', warm: -.18, sat: -.3, con: .2, exp: -.5, sh: [-8, 0, 16], hi: [-6, 2, 12], vig: .35 },
    { id: 'western', cat: 'cine', name: 'Western', desc: 'Polvo y sol: ocres cálidos, poco color', warm: .16, sat: -.2, con: .16, fade: .05, sh: [10, 4, -8], hi: [14, 8, -12], grain: .2, vig: .2 },
    { id: 'tecnicolor', cat: 'cine', name: 'Tricromía', desc: 'Color de cine clásico en tres tiras: primarios muy vivos', sat: .4, vib: .2, con: .2, sh: [-4, 0, 6], hi: [6, 0, -4], grain: .1 },
    // --- temas
    { id: 'anos70', cat: 'tema', name: 'Años 70', desc: 'Copia envejecida: cálida y desvaída', warm: .12, sat: -.1, con: -.1, fade: .16, sh: [12, 6, 0], hi: [10, 6, -12], grain: .26 },
    { id: 'mate', cat: 'tema', name: 'Mate', desc: 'Negros levantados y poco contraste', sat: -.08, con: -.16, fade: .18, sh: [2, 4, 6] },
    { id: 'invierno', cat: 'tema', name: 'Invierno 160', desc: 'Fría y desaturada', warm: -.08, sat: -.24, con: -.02, fade: .1, sh: [0, 4, 8], hi: [0, 2, 6], grain: .12 },
    { id: 'verano', cat: 'tema', name: 'Verano', desc: 'Sol de tarde: cálida y saturada', warm: .12, sat: .16, vib: .2, con: .06, exp: .1, hi: [10, 4, -8] },
    { id: 'crepusculo', cat: 'tema', name: 'Crepúsculo', desc: 'Sombras violetas y luces anaranjadas', sat: .06, con: .1, fade: .04, sh: [8, -6, 20], hi: [18, 4, -12], grain: .1 },
    { id: 'bosque', cat: 'tema', name: 'Bosque', desc: 'Verdes profundos y apagados, aire húmedo', tint: -.04, sat: -.16, con: .12, fade: .06, sh: [-6, 8, 2], hi: [4, 6, -6], vig: .2 },
    { id: 'neon', cat: 'tema', name: 'Neón', desc: 'Ciudad de noche: magentas y cianes', tint: .06, sat: .3, con: .2, sh: [6, -8, 22], hi: [16, -4, 10], grain: .2 }
  ];

  const ADJ = [
    { id: 'exp', name: 'Exposición', min: -100, max: 100 },
    { id: 'bri', name: 'Brillo', min: -100, max: 100 },
    { id: 'con', name: 'Contraste', min: -100, max: 100 },
    { id: 'hil', name: 'Luces', min: -100, max: 100 },
    { id: 'sha', name: 'Sombras', min: -100, max: 100 },
    { id: 'whi', name: 'Blancos', min: -100, max: 100 },
    { id: 'bla', name: 'Negros', min: -100, max: 100 },
    { id: 'sat', name: 'Saturación', min: -100, max: 100 },
    { id: 'vib', name: 'Viveza', min: -100, max: 100 },
    { id: 'tem', name: 'Temperatura', min: -100, max: 100 },
    { id: 'tin', name: 'Tono', min: -100, max: 100 },
    { id: 'spl', name: 'Tono partido', min: -100, max: 100 },
    { id: 'cla', name: 'Claridad', min: -100, max: 100 },
    { id: 'shp', name: 'Nitidez', min: 0, max: 100 },
    { id: 'fad', name: 'Desvanecido', min: 0, max: 100 },
    { id: 'gra', name: 'Grano', min: 0, max: 100 },
    { id: 'vig', name: 'Viñeta', min: 0, max: 100 },
    { id: 'blu', name: 'Desenfoque', min: 0, max: 100 }
  ];

  const clamp = v => v < 0 ? 0 : v > 255 ? 255 : v;

  // Ventana de recorte: proporción (h/w) + encuadre { z: zoom >= 1, cx, cy: centro de 0 a 1 }
  const dimsOf = img => [img.videoWidth || img.naturalWidth || img.width, img.videoHeight || img.naturalHeight || img.height];
  function cropWin(img, ratio, view) {
    const [iw, ih] = dimsOf(img);
    let sw = iw, sh = ih;
    if (ratio) { if (ih / iw > ratio) sh = iw * ratio; else sw = ih / ratio; }
    const z = view && view.z > 1 ? view.z : 1; sw /= z; sh /= z;
    const cx = view && view.cx != null ? view.cx : .5, cy = view && view.cy != null ? view.cy : .5;
    const sx = Math.max(0, Math.min(iw - sw, cx * iw - sw / 2)), sy = Math.max(0, Math.min(ih - sh, cy * ih - sh / 2));
    return { sx, sy, sw, sh, iw, ih };
  }
  // Recorta la foto (o el fotograma del vídeo) y devuelve un canvas de lado máximo maxSide.
  // Si se pasa "into" y ya tiene el tamaño correcto, se reutiliza (para el vídeo, fotograma a fotograma).
  function crop(img, ratio, maxSide, view, into) {
    const { sx, sy, sw, sh } = cropWin(img, ratio, view);
    const k = Math.min(1, maxSide / Math.max(sw, sh));
    const W = Math.max(1, Math.round(sw * k)), H = Math.max(1, Math.round(sh * k));
    const c = into || document.createElement('canvas');
    if (c.width !== W) c.width = W; if (c.height !== H) c.height = H;
    const x = c.getContext('2d');
    x.imageSmoothingQuality = 'high';
    x.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
    return c;
  }

  // Aplica película + ajustes sobre un canvas (en sitio)
  function process(cv, st) {
    const film = FILMS.find(f => f.id === st.film) || FILMS[0];
    const a = st.adj || {}, A = k => (a[k] || 0) / 100;
    const I = (st.filmAmt == null ? 100 : st.filmAmt) / 100;
    const fx = film.id === 'none' ? {} : film, f = k => (fx[k] || 0) * I;
    const exp = A('exp') * 1.2 + f('exp'), bri = A('bri'), con = A('con') + f('con'), hil = A('hil'), sha = A('sha'), whi = A('whi'), bla = A('bla');
    const sat = A('sat') + f('sat'), vib = A('vib') + f('vib'), tem = A('tem') * .12 + f('warm'), tin = A('tin') * .08 + f('tint');
    const fade = Math.max(0, A('fad')) * .25 + f('fade'), bw = f('bw'), mix = fx.mix || [.3, .59, .11], spl = A('spl');
    const grain = Math.max(A('gra'), f('grain') * .6), vig = Math.max(A('vig'), f('vig')), cla = A('cla'), shp = A('shp'), blu = A('blu');
    const shT = (fx.sh || [0, 0, 0]).map((v, i) => v * I + spl * [-12, 2, 12][i]), hiT = (fx.hi || [0, 0, 0]).map((v, i) => v * I + spl * [14, 5, -12][i]);
    const plain = ![exp, bri, con, hil, sha, whi, bla, sat, vib, tem, tin, fade, bw, grain, vig, cla, shp, blu].some(Boolean) && !shT.some(Boolean) && !hiT.some(Boolean);
    if (plain) return cv;
    const lut = new Float32Array(256);
    const cf = con >= 0 ? 1 + con * 1.6 : 1 + con * .8, eg = Math.pow(2, exp);
    for (let i = 0; i < 256; i++) {
      let v = i / 255 * eg;
      v = v + bri * .35 * (1 - Math.abs(Math.min(1, v) - .5));
      const u = Math.min(1, Math.max(0, v)), iu = 1 - u;
      v += sha * .25 * iu * iu * iu * (u > .02 ? 1 : u * 50) + hil * .25 * u * u * u * (iu > .02 ? 1 : iu * 50) * 1.6 * (1 - u * .4);
      v += whi * .2 * Math.pow(u, 6) + bla * .2 * Math.pow(iu, 6);
      v = (v - .5) * cf + .5;
      v = fade + v * (1 - fade);
      lut[i] = Math.min(1, Math.max(0, v)) * 255;
    }
    const x = cv.getContext('2d', { willReadFrequently: true });
    const w = cv.width, h = cv.height;
    const soft = div => { // copia desenfocada del mismo tamaño
      const sw = Math.max(4, Math.round(w / div)), sh2 = Math.max(4, Math.round(h / div));
      const s = document.createElement('canvas'); s.width = sw; s.height = sh2; const sx = s.getContext('2d'); sx.imageSmoothingQuality = 'high'; sx.drawImage(cv, 0, 0, sw, sh2);
      const b = document.createElement('canvas'); b.width = w; b.height = h; const bx = b.getContext('2d', { willReadFrequently: true }); bx.imageSmoothingQuality = 'high'; bx.drawImage(s, 0, 0, w, h);
      return bx.getImageData(0, 0, w, h).data;
    };
    const B = (cla || blu) ? soft(Math.max(6, w / 60)) : null, Sm = shp ? soft(2) : null;
    const d = x.getImageData(0, 0, w, h), p = d.data;
    const cx = w / 2, cy = h / 2, md = Math.hypot(cx, cy);
    let seed = 1337;
    const rnd = () => { seed = (seed * 1664525 + 1013904223) | 0; return ((seed >>> 8) & 0xffff) / 65536 - .5; };
    const gAmp = grain * 38 * Math.max(.6, Math.min(1.4, w / 1600));
    const needD = vig || blu;
    for (let y = 0; y < h; y++) {
      for (let xx = 0; xx < w; xx++) {
        const o = (y * w + xx) * 4;
        let r0 = p[o], g0 = p[o + 1], b0 = p[o + 2], det = 0;
        const dd = needD ? Math.hypot(xx - cx, y - cy) / md : 0;
        if (cla || shp) {
          const L0 = .2126 * r0 + .7152 * g0 + .0722 * b0;
          if (cla) { const LB = .2126 * B[o] + .7152 * B[o + 1] + .0722 * B[o + 2], t0 = L0 / 255; det += cla * .9 * (L0 - LB) * (1 - Math.abs(2 * t0 - 1) * .7); }
          if (shp) det += shp * 1.8 * (L0 - (.2126 * Sm[o] + .7152 * Sm[o + 1] + .0722 * Sm[o + 2]));
        }
        if (blu) { let k = (dd - .28) / .5; k = k < 0 ? 0 : k > 1 ? 1 : k; k *= blu; r0 += (B[o] - r0) * k; g0 += (B[o + 1] - g0) * k; b0 += (B[o + 2] - b0) * k; det *= 1 - k; }
        let r = lut[r0 | 0], g = lut[g0 | 0], b = lut[b0 | 0];
        r += tem * 127; b -= tem * 127; g -= tin * 127; r += tin * 38; b += tin * 38;
        const L = .2126 * r + .7152 * g + .0722 * b;
        if (sat || vib) {
          let k = 1 + sat;
          if (vib) { const mx = r > g ? (r > b ? r : b) : (g > b ? g : b), mn = r < g ? (r < b ? r : b) : (g < b ? g : b); k += vib * (1 - (mx - mn) / 255) * 1.1; }
          if (k < 0) k = 0; r = L + (r - L) * k; g = L + (g - L) * k; b = L + (b - L) * k;
        }
        if (bw) { const l2 = mix[0] * r + mix[1] * g + mix[2] * b; r += (l2 - r) * bw; g += (l2 - g) * bw; b += (l2 - b) * bw; }
        const t = L / 255, ws = (1 - t) * (1 - t), wh = t * t;
        r += shT[0] * ws + hiT[0] * wh + det; g += shT[1] * ws + hiT[1] * wh + det; b += shT[2] * ws + hiT[2] * wh + det;
        if (vig) { const fv = 1 - vig * .75 * Math.pow(Math.max(0, dd - .35) / .65, 1.6); r *= fv; g *= fv; b *= fv; }
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

  window.MetaImg = { FILMS, CATS, ADJ, crop, cropWin, dimsOf, process, histogram, blurred, palette, colorName };
})();
