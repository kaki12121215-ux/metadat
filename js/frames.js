/* Metadat · los 30 marcos, dibujados en canvas sobre un lienzo de 1080 de ancho (luego se escala). */
(function () {
  const THEMES = {
    claro: { bg: '#FFFFFF', pa: '#F7F6F2', ink: '#15171A', m1: '#5C6064', m2: '#8E9193', ln: '#E3E5E5', back: '#ECEBE6', fs: '#E9E6DE', fh: '#FFFFFF', fe: '#C46A1C', mp: '#C6CACB', mr: '#A9AEAF', mt: '#F3F1EC', ck: '#2A2C2F', tint: 'rgba(255,255,255,.38)', bri: 1.12, sh: 'rgba(30,25,15,.18)', logo: 'negro' },
    oscuro: { bg: '#141517', pa: '#1A1B1E', ink: '#EDEFEF', m1: '#AEB2B5', m2: '#7C8186', ln: '#2D3034', back: '#0A0B0C', fs: '#121110', fh: '#2A2C2F', fe: '#E0892F', mp: '#363A3F', mr: '#4D5258', mt: '#222326', ck: '#55595E', tint: 'rgba(0,0,0,.34)', bri: .7, sh: 'rgba(0,0,0,.55)', logo: 'blanco' }
  };
  const CYAN = '#0093B8', DOTC = ['#0093B8', '#D4357C', '#EDBB2A'];
  const FAM = { i: 'MInter', d: 'MInterD', s: 'MLora', si: 'MLoraI', m: 'MMono' };

  class G {
    constructor(x, T, d, P, o) { this.x = x; this.T = T; this.d = d; this.P = P; this.o = o; this.ts = o.ts || 1; }
    font(s, w = 400, f = 'i') { const it = f === 'si' ? 'italic ' : ''; this.x.font = `${it}${w} ${s * this.ts}px ${FAM[f]}, Inter, system-ui, sans-serif`; }
    meas(str, o = {}) {
      str = this.prep(str, o); if (!str) return 0;
      this.font(o.s || 16, o.w || 400, o.f || 'i');
      const ls = (o.ls || 0) * this.ts;
      return this.x.measureText(str).width + (ls ? ls * (str.length - 1) : 0);
    }
    prep(str, o) { str = str == null ? '' : String(str); return o.up ? str.toUpperCase() : str; }
    text(str, x, y, o = {}) {
      str = this.prep(str, o); if (!str) return 0;
      const X = this.x; let s = o.s || 16;
      if (o.max) { while (s > 6 && this.meas(str, Object.assign({}, o, { s, up: false })) > o.max) s -= .5; }
      this.font(s, o.w || 400, o.f || 'i');
      X.fillStyle = o.c || this.T.ink;
      X.textBaseline = o.base || 'middle';
      const ls = (o.ls || 0) * this.ts;
      const w = X.measureText(str).width + (ls ? ls * (str.length - 1) : 0);
      let sx = o.al === 'right' ? x - w : o.al === 'center' ? x - w / 2 : x;
      if (!ls) { X.textAlign = 'left'; X.fillText(str, sx, y); }
      else { X.textAlign = 'left'; for (const ch of str) { X.fillText(ch, sx, y); sx += X.measureText(ch).width + ls; } }
      return w;
    }
    rect(x, y, w, h, c) { this.x.fillStyle = c; this.x.fillRect(x, y, w, h); }
    line(x1, y1, x2, y2, c, lw = 1, dash) { const X = this.x; X.save(); X.strokeStyle = c; X.lineWidth = lw; if (dash) X.setLineDash(dash); X.beginPath(); X.moveTo(x1, y1); X.lineTo(x2, y2); X.stroke(); X.restore(); }
    rrect(x, y, w, h, r, c, stroke) { const X = this.x; X.beginPath(); X.moveTo(x + r, y); X.arcTo(x + w, y, x + w, y + h, r); X.arcTo(x + w, y + h, x, y + h, r); X.arcTo(x, y + h, x, y, r); X.arcTo(x, y, x + w, y, r); X.closePath(); if (stroke) { X.strokeStyle = c; X.lineWidth = stroke; X.stroke(); } else { X.fillStyle = c; X.fill(); } }
    circle(x, y, r, c, stroke) { const X = this.x; X.beginPath(); X.arc(x, y, r, 0, Math.PI * 2); if (stroke) { X.strokeStyle = c; X.lineWidth = stroke; X.stroke(); } else { X.fillStyle = c; X.fill(); } }
    photo(x, y, w, h, pos = [.5, .5], r = 0) {
      const P = this.P, X = this.x; if (!P) return;
      const k = Math.max(w / P.width, h / P.height), sw = w / k, sh = h / k;
      const sx = (P.width - sw) * pos[0], sy = (P.height - sh) * pos[1];
      if (!this.o._ph) this.o._ph = [x, y, w, h];
      X.save(); if (r) { this.rrect(x, y, w, h, r, '#000'); X.clip(); }
      X.drawImage(P, sx, sy, sw, sh, x, y, w, h); X.restore();
    }
    shadow(blur, oy, c, fn) { const X = this.x; X.save(); X.shadowColor = c; X.shadowBlur = blur * (this.o.scale || 1); X.shadowOffsetY = oy * (this.o.scale || 1); fn(); X.restore(); }
    dots(x, y, r = 4.5, gap = 6) { DOTC.forEach((c, i) => this.circle(x + r + i * (2 * r + gap), y, r, c)); return 3 * 2 * r + 2 * gap; }
    dotsW(r = 4.5, gap = 6) { return 6 * r + 2 * gap; }
    // logo de la marca (imagen) o, si no hay, el nombre de la marca
    logoW(h, white) { const L = this.logoImg(white); if (L === false) return 0; if (L) return h * this.ts * L.width / L.height; return this.meas(this.d.make, { s: h * .62, w: 600, ls: 1.2, up: true }); }
    logo(x, yc, h, white, al = 'left', alpha = 1) {
      const L = this.logoImg(white); if (L === false) return 0;
      const w = this.logoW(h, white); const sx = al === 'right' ? x - w : al === 'center' ? x - w / 2 : x;
      this.x.save(); this.x.globalAlpha = alpha;
      if (L) { const hh = h * this.ts; this.x.drawImage(L, sx, yc - hh / 2, w, hh); }
      else this.text(this.d.make, sx, yc, { s: h * .62, w: 600, ls: 1.2, up: true, c: white === true ? '#fff' : this.T.ink });
      this.x.restore(); return w;
    }
    logoImg(white) {
      const o = this.o; if (!o.showLogo) return false;
      const wh = white === true || (white !== false && this.T.logo === 'blanco');
      const c = o.customLogo; if (c && (c.claro || c.oscuro)) return wh ? (c.oscuro || c.claro) : (c.claro || c.oscuro);
      if (!this.d.make) return false;
      if (/apple|iphone|ipad/i.test(this.d.make) && o.logos && o.logos.negro) return wh ? o.logos.blanco : o.logos.negro;
      return null;
    }
  }

  const J = (arr, sep = ' · ') => arr.filter(Boolean).join(sep);
  const EXP = (d, sep) => J([d.mm, d.f, d.s0, d.iso], sep);
  const EXP3 = (d, sep) => J([d.f, d.s0, d.iso], sep);

  // ---------------------------------------------------------------- marcos
  const F = [];
  const def = (id, name, desc, h, draw, extra = {}) => F.push(Object.assign({ id, name, desc, h, draw }, extra));
  const ph = (w, r) => Math.round(w * r);

  def('banda', 'Banda', 'La firma de Metadat: datos en columnas bajo la foto', r => ph(1080, r) + 170, (g, d, T, r) => {
    const H = ph(1080, r); g.photo(0, 0, 1080, H); const yc = H + 85;
    let x = 48; const lw = g.logo(x, yc, 42); if (lw) { x += lw + 22; g.line(x, yc - 25, x, yc + 25, T.ln); x += 22; }
    const cols = [['ISO', d.isoN], ['Velocidad', d.s0], ['Apertura', d.f], ['Focal', d.mm]].filter(c => c[1]);
    let xr = 1080 - 48 - g.dotsW(); g.dots(xr, yc); xr -= 24;
    const colX = [];
    cols.forEach((c, i) => { const w = Math.max(g.meas(c[0], { s: 13.5, ls: 1.1, up: true }), g.meas(c[1], { s: 22, w: 500 })); xr -= w; colX.push([xr, c]); if (i < cols.length - 1) { xr -= 18; g.line(xr, yc - 25, xr, yc + 25, T.ln); xr -= 18; } });
    colX.forEach(([cx, c]) => { g.text(c[0], cx, yc - 14, { s: 13.5, ls: 1.1, up: true, c: T.m2 }); g.text(c[1], cx, yc + 14, { s: 22, w: 500 }); });
    const maxW = xr - x - 20;
    g.text(d.cam, x, yc - (d.date || d.place ? 13 : 0), { s: 29, w: 600, f: 'd', max: maxW }); g.text(J([d.date, d.place]), x, yc + 19, { s: 18, c: T.m2, max: maxW });
  });

  def('galeria', 'Galería', 'Paspartú amplio y una cartela centrada', r => 120 + ph(780, r) + 60 + 32 + 20 + 30 + 1 + 20 + 22 + 96 + 10, (g, d, T, r) => {
    g.rect(0, 0, 1080, 9999, T.pa); const H = ph(780, r); g.photo(150, 120, 780, H); let y = 120 + H + 60;
    const lw = g.logo(540, y + 16, 32, undefined, 'center'); if (lw) y += 52;
    g.text(d.cam, 540, y + 12, { s: 24, w: 500, f: 'd', al: 'center' }); y += 24 + 20;
    g.line(525, y, 555, y, T.ink); y += 30;
    g.text(EXP(d, '   '), 540, y, { s: 16.5, ls: 2.6, up: true, c: T.m1, al: 'center', max: 760 });
  });

  def('negativo', 'Negativo', 'Tira de película con perforaciones y rotulación de borde', r => 104 * 2 + ph(960, r), (g, d, T, r) => {
    const H = ph(960, r); g.rect(0, 0, 1080, H + 208, T.fs);
    const holes = y => { for (let i = 0; i < 26; i++) g.rrect(18 + i * ((1080 - 36 - 22) / 25), y - 15, 22, 30, 4, T.fh); };
    holes(52); holes(104 + H + 52); g.photo(60, 104, 960, H, undefined, 3);
    const ed = (y, a) => { const xs = [70, 380, 690, 1010]; a.forEach((t, i) => g.text(t, xs[i], y, { s: 18, ls: 2, f: 'm', c: T.fe, al: i === 3 ? 'right' : 'left' })); };
    ed(87, ['METADAT 400', J([d.mm, d.f], '  ').toUpperCase(), '14', '▸ 14A']);
    const yb = 104 + H + 17; ed(yb, [J([d.s0, d.iso], '  '), '', '15', '▸ 15A']);
    let x = 380; const lw = g.logo(x, yb, 19, undefined, 'left', .85); g.text(d.cam.toUpperCase(), x + (lw ? lw + 10 : 0), yb, { s: 18, ls: 2, f: 'm', c: T.fe });
  });

  def('ficha', 'Ficha', 'Cartela de archivo con los datos en tabla', r => {
    return 60 + ph(960, r) + 44 + 52 + 5 * 58 + 56;
  }, (g, d, T, r) => {
    const H = ph(960, r); g.photo(60, 60, 960, H); let y = 60 + H + 44 + 18;
    g.text('Detalle', 60, y, { s: 31, w: 600, f: 'd' });
    const lw = g.logo(1020, y, 28, undefined, 'right'); g.text('N.º 0142', 1020 - (lw ? lw + 24 : 0), y, { s: 16.5, ls: .6, c: T.m2, al: 'right' });
    y += 34; g.line(60, y, 1020, y, T.ink);
    [['Cámara', d.cam], ['Objetivo', d.lens || d.mm], ['Exposición', EXP3(d)], ['Fecha', J([d.date, d.time], ', ')], ['Lugar', d.place]].forEach(([k, v]) => {
      g.text(k, 60, y + 29, { s: 14.5, ls: 1.2, up: true, c: T.m2 }); g.text(v || '—', 300, y + 29, { s: 20.5, c: v ? T.ink : T.m2, max: 720 }); y += 58; g.line(60, y, 1020, y, T.ln);
    });
  });

  def('instantanea', 'Instantánea', 'Marco de foto instantánea, con nota a mano alzada', r => 62 + ph(956, r) + 236, (g, d, T, r) => {
    const H = ph(956, r); g.rect(0, 0, 1080, H + 400, T.pa); g.photo(62, 62, 956, H); const yc = 62 + H + 118;
    g.text(d.note || d.place || '', 68, yc, { s: 42, f: 'si', max: 560 });
    const lw = g.logoW(28); let y = yc - (lw ? 34 : 14);
    if (lw) { g.logo(1012, y, 28, undefined, 'right'); y += 38; }
    g.text(d.cam, 1012, y, { s: 15.4, ls: 1.8, up: true, c: T.m2, al: 'right', max: 400 }); g.text(EXP3(d), 1012, y + 29, { s: 15.4, ls: 1.8, up: true, c: T.m2, al: 'right', max: 400 });
  });

  def('minimo', 'Mínimo', 'Filo fino y una sola línea de datos', r => 24 + ph(1032, r) + 100, (g, d, T, r) => {
    const H = ph(1032, r); g.photo(24, 24, 1032, H); const yc = 24 + H + 50;
    const parts = [d.mm, d.f, d.s0, d.iso].filter(Boolean); const lw = g.logoW(19);
    const cw = g.meas(d.cam, { s: 16.6, w: 600, ls: 1.6, up: true }); let tot = (lw ? lw + 10 : 0) + cw;
    parts.forEach(p => tot += 28 + g.meas(p, { s: 16.6, ls: 1.6 }));
    let x = 540 - tot / 2; if (lw) { g.logo(x, yc, 19); x += lw + 10; }
    x += g.text(d.cam, x, yc, { s: 16.6, w: 600, ls: 1.6, up: true }); parts.forEach(p => { x += 28; x += g.text(p, x, yc, { s: 16.6, ls: 1.6, c: T.m1 }); });
  });

  def('lomo', 'Lomo', 'Datos en vertical en el lateral, como el lomo de un libro', r => 40 + ph(890, r) + 40, (g, d, T, r) => {
    const H = ph(890, r); g.photo(40, 40, 890, H); const cx = 40 + 890 + 75;
    g.text('N.º', cx, 52, { s: 14, ls: 1, c: T.m2, al: 'center' }); g.text('0142', cx, 70, { s: 14, ls: 1, c: T.m2, al: 'center' }); g.dots(cx - g.dotsW() / 2, 110);
    g.logo(cx, 40 + H - 16, 32, undefined, 'center');
    const X = g.x; X.save(); X.translate(cx, 40 + H / 2); X.rotate(-Math.PI / 2);
    const items = [['b', d.cam], ['l'], ['t', d.mm], ['t', d.f], ['t', d.s0], ['t', d.iso], ['l'], ['t', d.date]].filter(i => i[0] === 'l' || i[1]);
    const wOf = i => i[0] === 'l' ? 40 : i[0] === 'b' ? g.meas(i[1], { s: 20.5, w: 600, ls: .5, up: true, f: 'd' }) : g.meas(i[1], { s: 17.9, ls: 2.2, up: true });
    let tot = items.reduce((a, i) => a + wOf(i), 0) + 30 * (items.length - 1); let x = -tot / 2;
    items.forEach(i => { if (i[0] === 'l') g.line(x, 0, x + 40, 0, T.ln); else if (i[0] === 'b') g.text(i[1], x, 0, { s: 20.5, w: 600, ls: .5, up: true, f: 'd' }); else g.text(i[1], x, 0, { s: 17.9, ls: 2.2, up: true, c: T.m1 }); x += wOf(i) + 30; });
    X.restore();
  });

  def('revista', 'Revista', 'Título con serifa y créditos de página', r => 100 + 40 + ph(940, r) + 46 + 160 + 22 + 90, (g, d, T, r) => {
    g.text('Cuaderno de campo', 70, 50, { s: 14.7, ls: 2.4, up: true }); g.text(d.issue || '', 1010, 50, { s: 14.7, ls: 2.4, up: true, al: 'right' });
    g.line(70, 100, 1010, 100, T.ink); const H = ph(940, r); g.photo(70, 140, 940, H);
    let y = 140 + H + 46; const t = (d.title || 'Sin título').split('\n');
    t.forEach((ln, i) => g.text(ln, 70, y + 66 + i * 76, { s: 76, f: i === 0 ? 's' : 'si', base: 'alphabetic', max: 560 }));
    let ry = y + 30; const lw = g.logoW(28); if (lw) { g.logo(1010, ry, 28, undefined, 'right'); ry += 40; }
    [d.sign ? 'Fotografía: ' + d.sign : '', J([d.cam, d.mm], ', '), EXP3(d)].filter(Boolean).forEach(l => { g.text(l, 1010, ry, { s: 16.6, c: T.m1, al: 'right' }); ry += 29; });
    y += 160 + 22; g.line(70, y, 1010, y, T.ln); g.text(d.place, 70, y + 34, { s: 14.7, ls: 2, up: true, c: T.m2 }); g.text('14', 1010, y + 34, { s: 14.7, ls: 2, c: T.m2, al: 'right' });
  });

  function mapArt(g, T, x, y) {
    const X = g.x; X.save(); X.translate(x, y); X.beginPath(); X.rect(0, 0, 300, 170); X.clip(); X.lineWidth = 1; X.strokeStyle = T.mp;
    const P = s => { X.beginPath(); new Function('X', s)(X); X.stroke(); };
    P('X.moveTo(-10,44);X.bezierCurveTo(60,56,120,34,180,50);X.bezierCurveTo(240,66,270,74,310,62)');
    P('X.moveTo(-10,118);X.bezierCurveTo(70,110,130,132,210,114);X.bezierCurveTo(260,102,280,106,310,112)');
    P('X.moveTo(40,-10);X.lineTo(64,180)'); P('X.moveTo(128,-10);X.bezierCurveTo(120,50,140,110,132,180)'); P('X.moveTo(220,-10);X.lineTo(196,180)');
    X.setLineDash([3, 4]); P('X.moveTo(90,-10);X.bezierCurveTo(150,60,230,74,310,140)'); X.setLineDash([]);
    X.strokeStyle = T.mr; X.lineWidth = 2.4; P('X.moveTo(-10,86);X.lineTo(310,92)');
    X.restore(); g.circle(x + 150, y + 89, 14, 'rgba(0,147,184,.16)'); g.circle(x + 150, y + 89, 6, T.bg); g.circle(x + 150, y + 89, 4.5, CYAN);
  }

  def('mapa', 'Mapa', 'Plano del lugar con coordenadas', r => ph(1080, r) + 240, (g, d, T, r) => {
    const H = ph(1080, r); g.photo(0, 0, 1080, H); const yc = H + 120;
    let x = 50; const lw = g.logo(x, yc, 50); if (lw) x += lw + 24;
    g.line(756, H + 35, 756, H + 205, T.ln); mapArt(g, T, 756, H + 35);
    g.text(d.place || 'Sin lugar', x, yc - 30, { s: 36, w: 600, f: 'd', max: 680 - x }); g.text(d.gps, x, yc + 8, { s: 18, c: T.m1 });
    g.text(J([J([d.date, d.time], ', '), d.cam, d.f, d.s0]), x, yc + 44, { s: 14, ls: 1.4, up: true, c: T.m2, max: 720 - x });
  });

  def('tecnico', 'Técnico', 'Hoja técnica con marcas de corte', r => 70 + ph(940, r) + 38 + 92 + 82, (g, d, T, r) => {
    g.line(40, 40, 66, 40, T.m2); g.line(40, 40, 40, 66, T.m2); g.line(1040, 40, 1014, 40, T.m2); g.line(1040, 40, 1040, 66, T.m2);
    const H = ph(940, r); g.photo(70, 70, 940, H); let y = 70 + H + 38; g.line(70, y, 1010, y, T.ln);
    const c = [['Focal', d.mm], ['Apertura', d.f], ['Velocidad', d.s], ['Sensibilidad', d.iso]];
    c.forEach((k, i) => { const x = 70 + i * 235 + (i ? 18 : 0); if (i) g.line(70 + i * 235, y, 70 + i * 235, y + 92, T.ln); g.text(k[0], x, y + 30, { s: 13.4, ls: 1.6, up: true, c: T.m2 }); g.text(k[1] || '—', x, y + 64, { s: 31 }); });
    y += 92; g.line(70, y, 1010, y, T.ln); const yc = y + 34;
    let x = 70; const lw = g.logo(x, yc, 20, undefined, 'left', .8); x += lw ? lw + 12 : 0;
    g.text(J([d.cam, d.dims, d.fmt]).toUpperCase(), x, yc, { s: 16.6, ls: 1, f: 'm', c: T.m2, max: 420 });
    g.text(d.stamp, 780, yc, { s: 16.6, ls: 1, f: 'm', c: T.m2, al: 'center' }); g.dots(1010 - g.dotsW(), yc);
  });

  def('firma', 'Firma', 'Tu nombre como autor, con discreción', r => 48 + ph(984, r) + 186, (g, d, T, r) => {
    const H = ph(984, r); g.photo(48, 48, 984, H); const yc = 48 + H + 93;
    g.text(d.sign || 'Tu nombre', 52, yc, { s: 46, f: 'si', max: 560 });
    let y = yc - 34; if (g.logoW(28)) { g.logo(1028, y - 4, 28, undefined, 'right'); y += 36; } else y += 18;
    g.text(J(['© ' + (d.year || ''), d.place]), 1028, y, { s: 15.4, ls: 1.9, up: true, c: T.m2, al: 'right' }); g.text(J([d.cam, d.f, d.s0]), 1028, y + 29, { s: 15.4, ls: 1.9, up: true, c: T.m2, al: 'right' });
  });

  def('paleta', 'Paleta', 'Los colores principales de la foto', r => 40 + ph(1000, r) + 28 + 96 + 66 + 30 + 1 + 70, (g, d, T, r) => {
    const H = ph(1000, r); g.photo(40, 40, 1000, H); let y = 40 + H + 28; const pal = d.pal || [];
    const cw = (1000 - 48) / 5;
    pal.forEach((c, i) => { const x = 40 + i * (cw + 12); g.rrect(x, y, cw, 96, 2, c); g.text(d.palN ? d.palN[i] : '', x, y + 118, { s: 17.3, w: 500 }); g.text(c, x, y + 143, { s: 15.4, ls: .4, c: T.m2 }); });
    y += 96 + 66 + 30; g.line(40, y, 1040, y, T.ln); const yc = y + 35;
    let x = 40; const lw = g.logo(x, yc, 19, undefined, 'left', .6); x += lw ? lw + 10 : 0;
    g.text(J([d.cam, d.f, d.s0, d.iso]), x, yc, { s: 14.7, ls: 1.8, up: true, c: T.m2 }); g.text(d.date, 1040, yc, { s: 14.7, ls: 1.8, up: true, c: T.m2, al: 'right' });
  });

  def('bruma', 'Bruma', 'La propia foto desenfocada hace de fondo', r => 118 + ph(780, r) + 260, (g, d, T, r) => {
    const H = ph(780, r), FH = 118 + H + 260; const B = g.o.blur;
    if (B) { const k = Math.max(1080 / B.width, FH / B.height); g.x.drawImage(B, (1080 - B.width * k) / 2, (FH - B.height * k) / 2, B.width * k, B.height * k); }
    g.rect(0, 0, 1080, FH, T.bri > 1 ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.3)'); g.rect(0, 0, 1080, FH, T.tint);
    g.shadow(70, 30, T.sh, () => g.rrect(150, 118, 780, H, 10, '#000')); g.photo(150, 118, 780, H, undefined, 10);
    let y = 118 + H + 70; if (g.logoW(36)) { g.logo(540, y, 36, undefined, 'center'); y += 50; }
    g.text(d.cam, 540, y, { s: 27, w: 600, f: 'd', al: 'center' }); g.text(EXP(d, '   '), 540, y + 40, { s: 16.6, ls: 2.6, up: true, c: T.m1, al: 'center', max: 900 });
  });

  def('cine', 'Cine', 'Formato panorámico con franjas y subtítulo', () => 720, (g, d, T) => {
    g.text(d.place, 44, 64, { s: 14.7, ls: 3, up: true, c: T.m2 }); g.text('2,39 : 1', 1036, 64, { s: 14.7, ls: 3, c: T.m2, al: 'right' });
    g.logo(540, 64, 23, undefined, 'center', .75); g.photo(0, 130, 1080, 460, [.5, .3]);
    g.text(J([d.cam, J([d.mm, d.f, d.s0, d.iso], ', ')], '  —  '), 540, 655, { s: 21.8, al: 'center', max: 1000 });
  });

  def('visor', 'Visor', 'Los datos dentro de la foto, como en un visor', r => 60 + ph(1020, r), (g, d, T, r) => {
    const H = ph(1020, r), X = g.x; g.photo(30, 30, 1020, H);
    let gr = X.createLinearGradient(0, 30 + H, 0, 30 + H * .78); gr.addColorStop(0, 'rgba(0,0,0,.45)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); X.fillStyle = gr; X.fillRect(30, 30, 1020, H);
    gr = X.createLinearGradient(0, 30, 0, 30 + H * .12); gr.addColorStop(0, 'rgba(0,0,0,.28)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); X.fillStyle = gr; X.fillRect(30, 30, 1020, H);
    const W = 'rgba(255,255,255,.88)', b = (x, y, dx, dy) => { g.line(x, y, x + dx, y, W, 1.5); g.line(x, y, x, y + dy, W, 1.5); };
    b(70, 70, 46, 46); b(1010, 70, -46, 46); b(70, 30 + H - 40, 46, -46); b(1010, 30 + H - 40, -46, -46);
    const fx = 30 + 1020 * (d.focus ? d.focus[0] : .5), fy = 30 + H * (d.focus ? d.focus[1] : .5);
    X.save(); X.strokeStyle = 'rgba(255,255,255,.6)'; X.lineWidth = 1; X.strokeRect(fx - 65, fy - 65, 130, 130); X.restore(); g.circle(fx, fy, 3.5, '#EDBB2A');
    let x = 130; const lw = g.logo(x, 88, 20, true, 'left', .9); x += lw ? lw + 10 : 0;
    g.text(d.cam, x, 88, { s: 15.4, ls: 2.4, up: true, c: W }); g.text(d.time, 950, 88, { s: 15.4, ls: 2.4, c: W, al: 'right' });
    const hu = [d.mm, d.f, d.s0, d.iso].filter(Boolean).map(s => s.toUpperCase()); let tot = hu.reduce((a, s) => a + g.meas(s, { s: 20.5, ls: 1.8 }), 0) + 42 * (hu.length - 1);
    let hx = 540 - tot / 2; hu.forEach((s, i) => { hx += g.text(s, hx, 30 + H - 82, { s: 20.5, ls: 1.8, c: i === 0 ? '#EDBB2A' : '#fff' }) + 42; });
  });

  // ---------------------------------------------------------------- 16–30
  def('museo', 'Museo', 'Cartela de sala alineada a la izquierda', r => 110 + ph(800, r) + 56 + 150 + 100, (g, d, T, r) => {
    g.rect(0, 0, 1080, 9999, T.pa); const H = ph(800, r); g.photo(140, 110, 800, H); let y = 110 + H + 56;
    g.line(140, y, 140, y + 150, T.ink); const x = 162;
    g.text(d.sign || 'Autor', x, y + 14, { s: 23, w: 600, f: 'd' }); g.text(J([(d.title || 'Sin título').replace('\n', ' '), d.year], ', '), x, y + 50, { s: 24, f: 'si', max: 640 });
    g.text(J(['Fotografía digital', d.cam]), x, y + 92, { s: 16.5, c: T.m1 }); g.text(EXP(d), x, y + 124, { s: 14.5, ls: 1.4, up: true, c: T.m2 });
    g.logo(940, y + 130, 30, undefined, 'right');
  });

  def('diapositiva', 'Diapositiva', 'Montura de diapositiva con rotulación', r => 70 + 86 + ph(800, r) + 120 + 70, (g, d, T, r) => {
    const H = ph(800, r), FH = 70 + 86 + H + 120 + 70; g.rect(0, 0, 1080, FH, T.back);
    g.shadow(40, 18, T.sh, () => g.rrect(70, 70, 940, 86 + H + 120, 36, T.mt)); g.rrect(70, 70, 940, 86 + H + 120, 36, T.mt);
    g.text('METADAT · 15', 140, 113, { s: 17, ls: 1.6, f: 'm', c: T.m1 }); g.text((d.stamp || '').slice(2, 10).replace(/-/g, '.'), 940, 113, { s: 17, ls: 1.6, f: 'm', c: T.m1, al: 'right' });
    g.photo(140, 156, 800, H, undefined, 6); const yc = 156 + H + 60;
    let x = 140; const lw = g.logo(x, yc, 22); x += lw ? lw + 10 : 0; g.text((d.cam || '').toUpperCase(), x, yc, { s: 17, ls: 1.6, f: 'm', c: T.m1, max: 380 });
    g.text(EXP3(d).toUpperCase(), 940, yc, { s: 17, ls: 1.6, f: 'm', c: T.m1, al: 'right', max: 380 });
  });

  def('sello', 'Sello', 'Sello postal dentado con el valor de la focal', r => 92 * 2 + (Math.round((76 + ph(820, r) + 136) / 32) * 32), (g, d, T, r) => {
    const sx = 92, sy = 92, W = 896, H = Math.round((76 + ph(820, r) + 136) / 32) * 32; g.rect(0, 0, 1080, H + 184, T.back);
    g.shadow(24, 10, T.sh, () => g.rect(sx, sy, W, H, T.bg)); g.rect(sx, sy, W, H, T.bg);
    for (let i = 0; i < W / 32; i++) { g.circle(sx + 16 + i * 32, sy, 9.3, T.back); g.circle(sx + 16 + i * 32, sy + H, 9.3, T.back); }
    for (let i = 0; i < H / 32; i++) { g.circle(sx, sy + 16 + i * 32, 9.3, T.back); g.circle(sx + W, sy + 16 + i * 32, 9.3, T.back); }
    const ph2 = H - 76 - 136; g.photo(sx + 38, sy + 38, W - 76, ph2);
    const by = sy + 38 + ph2 + 136 - 6; if (g.logoW(24)) g.logo(sx + 38, by - 78, 24);
    g.text(d.place, sx + 38, by - 36, { s: 15, ls: 3.4, up: true, c: T.m1, max: 500 }); g.text(d.year, sx + 38, by - 8, { s: 15, ls: 3.4, c: T.m1 });
    const uw = g.meas('mm', { s: 18, ls: 1 }); g.text('mm', sx + W - 38, by - 4, { s: 18, ls: 1, c: T.m2, al: 'right', base: 'alphabetic' });
    g.text(d.mmN || '—', sx + W - 38 - uw - 6, by, { s: 92, f: 's', ls: -2, al: 'right', base: 'alphabetic' });
  });

  def('esquinas', 'Esquinas', 'Álbum de fotos con esquineras de papel', r => 110 + ph(860, r) + 62 + 70 + 90, (g, d, T, r) => {
    g.rect(0, 0, 1080, 9999, T.pa); const H = ph(860, r), X = g.x;
    g.shadow(8, 2, T.sh, () => g.rect(110, 110, 860, H, '#000')); g.photo(110, 110, 860, H);
    const tri = (pts) => { X.beginPath(); X.moveTo(...pts[0]); X.lineTo(...pts[1]); X.lineTo(...pts[2]); X.closePath(); X.fillStyle = T.ck; X.fill(); };
    const a = 92, l = 110 - 18, t = 110 - 18, rr = 970 + 18, bb = 110 + H + 18;
    tri([[l, t], [l + a, t], [l, t + a]]); tri([[rr, t], [rr - a, t], [rr, t + a]]); tri([[l, bb], [l + a, bb], [l, bb - a]]); tri([[rr, bb], [rr - a, bb], [rr, bb - a]]);
    let y = 110 + H + 62 + 22; g.text(J([d.place, d.month ? d.month.toLowerCase() + ' de ' + d.year : d.year], ', '), 540, y, { s: 36, f: 'si', al: 'center', max: 900 });
    y += 44; const s = J([d.cam, d.f, d.s0]); const lw = g.logoW(18), tw = g.meas(s, { s: 15, ls: 2.4, up: true }); let x = 540 - (tw + (lw ? lw + 10 : 0)) / 2;
    if (lw) { g.logo(x, y, 18); x += lw + 10; } g.text(s, x, y, { s: 15, ls: 2.4, up: true, c: T.m2 });
  });

  def('diario', 'Diario', 'Cabecera con el día en grande, como un diario', r => 200 + 40 + ph(960, r) + 96, (g, d, T, r) => {
    const yc = 100; const dw = g.text(d.day || '—', 60, yc + 4, { s: 118, w: 300, f: 'd', ls: -5 });
    g.text(J([d.month, d.year], ' '), 60 + dw + 26, yc - 14, { s: 28, w: 600, f: 'd' }); g.text(d.wd, 60 + dw + 26, yc + 22, { s: 18, c: T.m1 });
    g.text(d.time, 1020, yc - 14, { s: 30, al: 'right' }); g.text(d.place, 1020, yc + 22, { s: 15, ls: 1.6, up: true, c: T.m2, al: 'right', max: 360 });
    g.line(60, 200, 1020, 200, T.ink); const H = ph(960, r); g.photo(60, 240, 960, H); const y2 = 240 + H + 48;
    let x = 60; const lw = g.logo(x, y2, 19); x += lw ? lw + 10 : 0; g.text(d.cam, x, y2, { s: 15, ls: 1.8, up: true, c: T.m2 });
    g.text(EXP(d), 1020, y2, { s: 15, ls: 1.8, up: true, c: T.m2, al: 'right' });
  });

  def('cifras', 'Cifras', 'Los datos de exposición en números grandes', r => 40 + ph(1000, r) + 40 + 100 + 30 + 1 + 84, (g, d, T, r) => {
    const H = ph(1000, r); g.photo(40, 40, 1000, H); let y = 40 + H + 40;
    const c = [[d.mmN, 'mm', 'Focal'], [d.fn, 'ƒ', 'Apertura'], [d.sv, 's', 'Velocidad'], [d.isoN, 'ISO', 'Sensibilidad']];
    const ws = [1, 1, 1.25, 1], tw = 4.25; let x = 40;
    c.forEach((k, i) => { const cw = 1000 * ws[i] / tw; if (i) g.line(x, y, x, y + 100, T.ln); const px = x + (i ? 22 : 0);
      const nw = g.text(k[0] || '—', px, y + 40, { s: 70, w: 300, f: 'd', ls: -2.6 }); g.text(k[1], px + nw + 6, y + 58, { s: 19, w: 500, c: T.m1 });
      g.text(k[2], px, y + 96, { s: 13.5, ls: 1.6, up: true, c: T.m2 }); x += cw; });
    y += 130; g.line(40, y, 1040, y, T.ln); const yc = y + 42; let lx = 40; const lw = g.logo(lx, yc, 22); lx += lw ? lw + 12 : 0;
    g.text(d.cam, lx, yc, { s: 16, c: T.m1 }); g.text(J([d.date, d.place]), 1040, yc, { s: 16, c: T.m1, al: 'right' });
  });

  def('horizonte', 'Horizonte', 'Una línea de datos arriba y otra abajo', r => 84 + ph(1000, r) + 84, (g, d, T, r) => {
    g.text(d.place, 40, 42, { s: 15.4, ls: 2.2, up: true, w: 600 }); g.text(d.gps, 1040, 42, { s: 15.4, ls: 2.2, up: true, c: T.m1, al: 'right' });
    const H = ph(1000, r); g.photo(40, 84, 1000, H); const yc = 84 + H + 42;
    let x = 40; const lw = g.logo(x, yc, 19); x += lw ? lw + 10 : 0; g.text(d.cam, x, yc, { s: 15.4, ls: 2.2, up: true, w: 600 });
    g.text(EXP(d, '   '), 1040, yc, { s: 15.4, ls: 2.2, up: true, c: T.m1, al: 'right' });
  });

  def('etiqueta', 'Etiqueta', 'Una tarjeta con los datos que pisa la foto', r => 70 + ph(940, r) + 170, (g, d, T, r) => {
    g.rect(0, 0, 1080, 9999, T.pa); const H = ph(940, r); g.photo(70, 70, 940, H);
    const tw = 430, th = 204, tx = 70 + 940 + 26 - tw, ty = 70 + H + 110 - th;
    g.shadow(34, 14, T.sh, () => g.rect(tx, ty, tw, th, T.bg)); g.rect(tx, ty, tw, th, T.bg); g.x.strokeStyle = T.ln; g.x.lineWidth = 1; g.x.strokeRect(tx + .5, ty + .5, tw - 1, th - 1);
    let x = tx + 32; const lw = g.logo(x, ty + 46, 28); x += lw ? lw + 14 : 0; g.text(d.cam, x, ty + 46, { s: 24, w: 600, f: 'd', max: tx + tw - 32 - x });
    g.line(tx + 32, ty + 78, tx + tw - 32, ty + 78, T.ln);
    [['Exposición', EXP3(d)], ['Focal', d.mm], ['Fecha', d.date]].forEach((k, i) => { const yy = ty + 108 + i * 34; g.text(k[0], tx + 32, yy, { s: 14, ls: 1.4, up: true, c: T.m2 }); g.text(k[1] || '—', tx + tw - 32, yy, { s: 18, al: 'right' }); });
  });

  def('coordenadas', 'Coordenadas', 'La posición exacta en tipografía grande', r => 40 + ph(1000, r) + 44 + 168 + 46, (g, d, T, r) => {
    const H = ph(1000, r); g.photo(40, 40, 1000, H); const y = 40 + H + 44;
    g.text(d.place || 'Sin lugar', 40, y + 8, { s: 15, w: 500, ls: 2.2, up: true, c: T.m2, max: 600 });
    g.text(d.lat || '—', 40, y + 70, { s: 72, w: 300, f: 'd', ls: -2.6 }); g.text(d.lon || '', 40, y + 144, { s: 72, w: 300, f: 'd', ls: -2.6 });
    let ry = y + 40; if (g.logoW(28)) { g.logo(1040, ry, 28, undefined, 'right'); ry += 44; } else ry += 20;
    [J([d.date, d.time], ', '), d.cam, EXP3(d)].forEach(l => { g.text(l, 1040, ry, { s: 16.5, c: T.m1, al: 'right' }); ry += 30; });
  });

  function clock(g, T, cx, cy, time) {
    const [hh, mm] = (time || '0:0').split(':').map(Number); const R = 54;
    g.circle(cx, cy, R, T.m2, 1);
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; g.line(cx + 44 * Math.sin(a), cy - 44 * Math.cos(a), cx + 49 * Math.sin(a), cy - 49 * Math.cos(a), T.m2); }
    const ah = ((hh % 12) + mm / 60) * Math.PI / 6, am = mm * Math.PI / 30;
    g.line(cx, cy, cx + 27 * Math.sin(ah), cy - 27 * Math.cos(ah), T.ink, 2.4); g.line(cx, cy, cx + 40 * Math.sin(am), cy - 40 * Math.cos(am), T.ink, 1.3); g.circle(cx, cy, 2.8, CYAN);
  }

  def('reloj', 'Reloj', 'La hora de la foto en una esfera de líneas finas', r => ph(1080, r) + 210, (g, d, T, r) => {
    const H = ph(1080, r); g.photo(0, 0, 1080, H); const yc = H + 105; clock(g, T, 106, yc, d.time);
    g.text(d.time || '—', 192, yc - 16, { s: 56, w: 300, f: 'd', ls: -1.8 }); g.text(d.dlong, 192, yc + 34, { s: 17, c: T.m1 });
    let ry = yc - 32; if (g.logoW(26)) { g.logo(1030, ry - 4, 26, undefined, 'right'); ry += 34; } else ry += 16;
    g.text(d.cam, 1030, ry, { s: 14.5, ls: 1.6, up: true, c: T.m2, al: 'right' }); g.text(EXP3(d), 1030, ry + 29, { s: 14.5, ls: 1.6, up: true, c: T.m2, al: 'right' });
  });

  def('archivo', 'Archivo', 'Ficha mecanografiada de un archivo fotográfico', r => 80 + ph(920, r) + 46 + 270 + 80, (g, d, T, r) => {
    g.rect(0, 0, 1080, 9999, T.pa); const H = ph(920, r); g.photo(80, 80, 920, H); const y = 80 + H + 46;
    g.x.strokeStyle = T.ln; g.x.lineWidth = 1; g.x.strokeRect(80.5, y + .5, 919, 269);
    g.text('ARCHIVO FOTOGRÁFICO · N.º 0153', 114, y + 44, { s: 18.5, ls: 2, f: 'm', c: T.m1 }); g.logo(966, y + 44, 24, undefined, 'right');
    const rows = [['ROLLO', '15'], ['TOMA', '07'], ['FECHA', (d.stamp || '').slice(0, 10)], ['HORA', d.time], ['LUGAR', (d.place || '').toUpperCase()], ['CÁMARA', (d.cam || '').toUpperCase()], ['ÓPTICA', (d.mm || '').toUpperCase()], ['EXPOSICIÓN', EXP3(d, ' ').toUpperCase()]];
    rows.forEach((k, i) => { const cx = 114 + (i % 2) * 446, cy = y + 92 + (i >> 1) * 44; g.text(k[0], cx, cy, { s: 18.5, f: 'm', c: T.m2 }); g.text(k[1] || '—', cx + 164, cy, { s: 18.5, f: 'm', max: 260 }); g.line(cx, cy + 20, cx + 406, cy + 20, T.ln, 1, [4, 4]); });
  });

  def('postal', 'Postal', 'Reverso de postal con sello y dirección', r => 40 + ph(1000, r) + 300, (g, d, T, r) => {
    const H = ph(1000, r); g.photo(40, 40, 1000, H); const y = 40 + H + 34;
    g.text('Saludos desde', 50, y + 30, { s: 34, f: 'si' }); g.text(d.place || '', 50, y + 74, { s: 34, f: 'si', max: 560 });
    g.text(J([d.date, EXP(d)]), 50, y + 128, { s: 14.5, ls: 1.6, up: true, c: T.m2, max: 560 });
    g.line(630, y, 630, y + 226, T.ln);
    g.x.save(); g.x.setLineDash([3, 3]); g.x.strokeStyle = T.m2; g.x.lineWidth = 1; g.x.strokeRect(934.5, y + .5, 96, 116); g.x.restore(); g.logo(982, y + 58, 36, undefined, 'center');
    [d.sign, d.gps].forEach((t, i) => { const ly = y + 136 + 46 * (i + 1); g.text(t, 666, ly - 18, { s: 18, max: 360 }); g.line(666, ly, 1030, ly, T.ln); });
  });

  def('indice', 'Índice', 'Los datos con puntos guía, como un índice', r => 56 + ph(968, r) + 34 + 52 + 7 * 40 + 50, (g, d, T, r) => {
    const H = ph(968, r); g.photo(56, 56, 968, H); let y = 56 + H + 34 + 16;
    g.text('Datos de la toma', 56, y, { s: 26, w: 600, f: 'd' }); g.logo(1024, y, 26, undefined, 'right'); y += 52;
    [['Cámara', d.cam], ['Objetivo', d.lens || d.mm], ['Apertura', d.f], ['Velocidad', d.s], ['Sensibilidad', d.iso], ['Lugar', d.place], ['Fecha', J([d.date, d.time], ', ')]].forEach(([k, v]) => {
      const kw = g.text(k, 56, y, { s: 19.5, c: T.m1 }); const vw = g.text(v || '—', 1024, y, { s: 19.5, w: 500, al: 'right' });
      g.line(56 + kw + 12, y + 7, 1024 - vw - 12, y + 7, T.m2, 1.5, [1.5, 5]); y += 40;
    });
  });

  def('doble', 'Doble paspartú', 'Dos biseles alrededor y el pie grabado', r => 96 + 2 * (30 + 18) + ph(790, r) + 2 + 46 + 120 + 62, (g, d, T, r) => {
    g.rect(0, 0, 1080, 9999, T.pa); const H = ph(790, r), oh = H + 2 * 48 + 2;
    g.rect(96, 96, 888, oh, T.bg); g.x.strokeStyle = T.ln; g.x.lineWidth = 1; g.x.strokeRect(96.5, 96.5, 887, oh - 1); g.x.strokeRect(126.5, 126.5, 827, H + 37);
    g.photo(145, 145, 790, H); let y = 96 + oh + 46;
    if (g.logoW(28)) { g.logo(540, y + 14, 28, undefined, 'center'); y += 42; }
    g.text(d.sign, 540, y + 16, { s: 15, w: 600, ls: 3.6, up: true, al: 'center' }); g.text(J([J([d.place, d.year], ', '), EXP(d)], '  ·  '), 540, y + 50, { s: 15, ls: 3.2, up: true, c: T.m1, al: 'center', max: 940 });
  });

  def('escala', 'Escala', 'Escalas de exposición con el valor usado marcado', r => 40 + ph(1000, r) + 34 + 3 * 62 + 20 + 88, (g, d, T, r) => {
    const H = ph(1000, r); g.photo(40, 40, 1000, H); let y = 40 + H + 34;
    const near = (vals, v, num) => { if (!v) return -1; const t = num(v); let bi = 0; vals.forEach((x, i) => { if (Math.abs(Math.log(num(x)) - Math.log(t)) < Math.abs(Math.log(num(vals[bi])) - Math.log(t))) bi = i; }); return bi; };
    const nf = s => parseFloat(String(s).replace(',', '.')), ns = s => { s = String(s); return s.includes('/') ? 1 / parseFloat(s.split('/')[1]) : parseFloat(s.replace(',', '.')); };
    const rows = [['ƒ', ['1,4', '2', '2,8', '4', '5,6', '8', '11', '16'], near(['1,4', '2', '2,8', '4', '5,6', '8', '11', '16'], d.fn, nf)],
      ['s', ['1/30', '1/60', '1/125', '1/250', '1/500', '1/1000'], near(['1/30', '1/60', '1/125', '1/250', '1/500', '1/1000'], d.sv, ns)],
      ['ISO', ['32', '50', '100', '200', '400', '800'], near(['32', '50', '100', '200', '400', '800'], d.isoN, nf)]];
    rows.forEach(([u, vals, on]) => {
      const yc = y + 31; g.text(u, 40, yc, { s: 14, ls: 1.6, c: T.m2 });
      vals.forEach((v, i) => { const x = 130 + (1040 - 130 - 30) * i / (vals.length - 1) + 15; g.text(v, x, yc, { s: 19, w: i === on ? 600 : 400, c: i === on ? T.ink : T.m2, al: 'center' }); if (i === on) g.circle(x, yc + 21, 2.6, CYAN); });
      y += 62; g.line(40, y, 1040, y, T.ln);
    });
    const yc = y + 20 + 26; let x = 40; const lw = g.logo(x, yc, 22); x += lw ? lw + 12 : 0;
    g.text(J([d.cam, d.mm]), x, yc, { s: 16, c: T.m1 }); g.text(J([d.date, d.place]), 1040, yc, { s: 16, c: T.m1, al: 'right' });
  });

  // ---------------------------------------------------------------- render
  // P: foto procesada (canvas). o: {theme, ts, showLogo, logos, customLogo, blur, scale}
  function layout(frame, P) { const r = P.height / P.width; return { w: 1080, h: Math.ceil(frame.h(r)) }; }
  // into: canvas que se reutiliza (vídeo). Su alto se respeta; lo que sobre o falte es un píxel como mucho.
  function render(frame, P, d, o, outW, into) {
    const T = THEMES[o.theme || 'claro']; const { h } = layout(frame, P); const k = outW / 1080;
    const c = into || document.createElement('canvas');
    const W = Math.round(outW), H = into ? into.height : Math.round(h * k);
    if (c.width !== W) c.width = W; if (c.height !== H) c.height = H;
    const x = c.getContext('2d'); x.setTransform(k, 0, 0, k, 0, 0); x.imageSmoothingQuality = 'high';
    x.fillStyle = T.bg; x.fillRect(0, 0, 1080, Math.max(h, H / k));
    const oo = Object.assign({ scale: k }, o, { _ph: null });
    const g = new G(x, T, d, P, oo);
    frame.draw(g, d, T, P.height / P.width); x.setTransform(1, 0, 0, 1, 0, 0);
    c._ph = oo._ph; return c;
  }
  window.MetaFrames = { F, THEMES, render, layout };
})();
