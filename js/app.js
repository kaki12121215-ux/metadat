/* Metadat · app */
(function () {
  'use strict';
  const VERSION = '1.1.0';
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const FR = MetaFrames.F, FILMS = MetaImg.FILMS, ADJ = MetaImg.ADJ;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const J = (a, s = ' · ') => a.filter(Boolean).join(s);

  // ------------------------------------------------------------ iconos
  const IC = {
    back: '<path d="M15 5l-7 7 7 7"/>', share: '<path d="M12 3v12M7.5 7.5L12 3l4.5 4.5"/><path d="M5 12v8h14v-8"/>',
    compare: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M12 4v16"/>', gear: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
    hist: '<path d="M4 20V14M8 20V9M12 20V5M16 20V11M20 20V15"/>', meter: '<circle cx="12" cy="12" r="8"/><path d="M12 12l4-3"/>',
    book: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/>', cam: '<rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="12" cy="13.5" r="3.5"/><path d="M8 7l1.5-3h5L16 7"/>',
    split: '<rect x="3" y="6" width="18" height="12" rx="1.5"/><path d="M9 6v12M15 6v12"/>', layout: '<rect x="3" y="4" width="8" height="16" rx="1.5"/><rect x="13" y="4" width="8" height="7" rx="1.5"/><rect x="13" y="13" width="8" height="7" rx="1.5"/>',
    stack: '<rect x="6" y="6" width="14" height="14" rx="1.5"/><path d="M4 16V4h12"/>', shield: '<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path d="M9 12l2 2 4-4"/>',
    grid: '<rect x="3" y="3" width="18" height="18" rx="1.5"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>', recipe: '<path d="M6 3h12v18l-6-4-6 4z"/>',
    tag: '<rect x="3" y="7" width="18" height="10" rx="2"/><path d="M7 12h10"/>', plus: '<path d="M12 5v14M5 12h14"/>', check: '<path d="M5 12l4.5 4.5L19 7"/>',
    pin: '<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>', chev: '<path d="M9 5l7 7-7 7"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>', aperture: '<circle cx="12" cy="12" r="9"/><path d="M12 3l4.5 7.8M21 12h-9M16.5 19.8L12 12M7.5 19.8L12 12M3 12h9M7.5 4.2L12 12"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>', trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>', down: '<path d="M12 4v12M7 11l5 5 5-5"/><path d="M5 20h14"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    contrast: '<circle cx="12" cy="12" r="9"/><path d="M12 3v18" /><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>', drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
    temp: '<path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0z"/>', tint: '<circle cx="9" cy="12" r="6"/><circle cx="15" cy="12" r="6"/>', shadow: '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18"/>',
    grain: '<circle cx="7" cy="7" r="1.2"/><circle cx="13" cy="6" r="1.2"/><circle cx="18" cy="9" r="1.2"/><circle cx="9" cy="12" r="1.2"/><circle cx="15" cy="13" r="1.2"/><circle cx="6" cy="17" r="1.2"/><circle cx="12" cy="18" r="1.2"/><circle cx="18" cy="17" r="1.2"/>',
    vig: '<rect x="3" y="4" width="18" height="16" rx="2"/><ellipse cx="12" cy="12" rx="5" ry="4"/>', ratio: '<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M5 15h14"/>',
    text: '<path d="M5 6V4h14v2M12 4v16M9 20h6"/>', logo: '<path d="M12 7c1-2 3-3 4-3 0 2-1.5 3.5-3 4"/><path d="M16 9c-1.5 0-2.5.8-4 .8S9.5 9 8 9c-2 0-4 1.8-4 5 0 3.5 2.5 7 4.5 7 1.2 0 2-.7 3.5-.7s2.3.7 3.5.7c2 0 4.5-3.5 4.5-6-2-1-2.5-3-2.5-4 0-1 .5-1.8 1-2.3"/>',
    sun2: '<circle cx="12" cy="12" r="5"/>', theme: '<circle cx="12" cy="12" r="9"/><path d="M12 3v18M12 3a9 9 0 0 1 0 18" fill="currentColor"/>', save: '<path d="M6 3h12v18l-6-4-6 4z"/><path d="M9.5 9.5l2 2 3.5-3.5"/>',
    map: '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>', bw: '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor"/>',
    roll: '<rect x="4" y="5" width="12" height="14" rx="2"/><path d="M16 8h4v8h-4M7 5V3M13 5V3M7 21v-2M13 21v-2"/>', lens: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/>',
    cloud: '<path d="M7 18h10a4 4 0 0 0 .5-8 6 6 0 0 0-11.4 1.6A3.3 3.3 0 0 0 7 18z"/>', moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>', bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
    undo: '<path d="M8 5L4 9l4 4"/><path d="M4 9h10a5.5 5.5 0 0 1 0 11h-4"/>', redo: '<path d="M16 5l4 4-4 4"/><path d="M20 9H10a5.5 5.5 0 0 0 0 11h4"/>',
    expo: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 20L20 4M7.5 9.5h4M9.5 7.5v4M13 15.5h4"/>', hil: '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18" fill="currentColor" fill-opacity=".0"/><path d="M12 7v10M15 8.5v7M18 11v2"/>', whi: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/>', bla: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4" fill="currentColor"/>',
    vib: '<path d="M12 3l2.6 6.2L21 10l-5 4.2L17.5 21 12 17.3 6.5 21 8 14.2 3 10l6.4-.8z"/>', split2: '<circle cx="12" cy="12" r="9"/><path d="M5.6 18.4L18.4 5.6"/><path d="M12 3a9 9 0 0 0-6.4 15.4z" fill="currentColor"/>', cla: '<path d="M12 3l9 16H3z"/><path d="M12 10v4"/>', shp: '<path d="M12 3l8 18-8-5-8 5z"/>', fad: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 16h8M8 12h8M8 8h8" stroke-opacity=".5"/>', blu: '<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8" stroke-dasharray="2 3"/>',
    tree: '<path d="M12 3l6 9h-4l4 6H6l4-6H6z"/><path d="M12 18v3"/>', edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>'
  };
  const ic = (n, s = 22, w = 2) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${IC[n] || ''}</svg>`;
  const fillIcons = (root = document) => $$('[data-i]', root).forEach(e => { if (!e.dataset.done) { e.insertAdjacentHTML('afterbegin', ic(e.dataset.i, +(e.dataset.s || 22))); e.dataset.done = 1; } });

  // ------------------------------------------------------------ almacenamiento
  const LS = {
    get(k, d) { try { const v = localStorage.getItem('metadat.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('metadat.' + k, JSON.stringify(v)); } catch (e) { toast('No se ha podido guardar: memoria llena'); } }
  };
  const DEF = { frame: 'banda', theme: 'claro', film: 'none', filmAmt: 100, adj: {}, ratio: 0, ts: 1, showLogo: true, darkComp: true, size: 2160, fmt: 'jpeg', sign: '', defCam: 'iPhone 13 Pro' };
  const S = Object.assign({}, DEF, LS.get('settings', {}), { film: 'none', filmAmt: 100, adj: {}, ratio: 0 });
  // la edición (película, ajustes, proporción) no se guarda: cada foto empieza limpia
  const saveS = () => { const { film, filmAmt, adj, ratio, ...rest } = S; LS.set('settings', rest); };
  let COUNT = LS.get('count', 0);
  const DB = {
    open() { return new Promise((res, rej) => { const r = indexedDB.open('metadat', 1); r.onupgradeneeded = () => r.result.createObjectStore('kv'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); },
    async put(k, v) { try { const db = await this.open(); await new Promise((res, rej) => { const t = db.transaction('kv', 'readwrite'); t.objectStore('kv').put(v, k); t.oncomplete = res; t.onerror = rej; }); } catch (e) { } },
    async get(k) { try { const db = await this.open(); return await new Promise((res) => { const t = db.transaction('kv').objectStore('kv').get(k); t.onsuccess = () => res(t.result); t.onerror = () => res(null); }); } catch (e) { return null; } }
  };

  // logos de marca
  const LOGOS = {}; const loadImg = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
  Promise.all([loadImg('img/logo_negro.png'), loadImg('img/logo_blanco.png')]).then(([a, b]) => { LOGOS.negro = a; LOGOS.blanco = b; }).catch(() => { });
  const CUSTOM = { claro: null, oscuro: null }; try { localStorage.removeItem('metadat.customLogo'); } catch (e) { }
  ['claro', 'oscuro'].forEach(k => { const u = LS.get('logo_' + k, null); if (u) loadImg(u).then(i => CUSTOM[k] = i).catch(() => { }); });

  // ------------------------------------------------------------ avisos
  let tT; function toast(msg, dots) { const t = $('#toast'); t.innerHTML = (dots ? '<span class="dots"><i></i><i></i><i></i></span>' : '') + esc(msg); t.classList.add('on'); clearTimeout(tT); tT = setTimeout(() => t.classList.remove('on'), 2600); }
  function flash() { const f = $('#flash'); f.classList.remove('go'); void f.offsetWidth; f.classList.add('go'); }

  // ------------------------------------------------------------ segmentados con píldora
  function seg(el, onChange) {
    let pill = $('.pill', el); if (!pill) { pill = document.createElement('i'); pill.className = 'pill'; el.prepend(pill); }
    const place = (anim = true) => { const b = $('button.on', el); if (!b) return; if (!anim) pill.style.transition = 'none'; pill.style.left = b.offsetLeft + 'px'; pill.style.width = b.offsetWidth + 'px'; if (!anim) { void pill.offsetWidth; pill.style.transition = ''; } };
    $$('button', el).forEach(b => b.onclick = () => { if (b.classList.contains('on')) return; $$('button', el).forEach(x => x.classList.toggle('on', x === b)); place(); onChange && onChange(b.dataset.v, b); });
    requestAnimationFrame(() => place(false)); el._place = place; return el;
  }
  function setSeg(el, v) { $$('button', el).forEach(x => x.classList.toggle('on', x.dataset.v == v)); el._place && el._place(); }
  const segHTML = (opts, val, cls = 'seg') => `<div class="${cls}">${opts.map(([v, l]) => `<button data-v="${v}" class="${v == val ? 'on' : ''}">${l}</button>`).join('')}</div>`;

  // ------------------------------------------------------------ navegación
  const stack = ['vHome'];
  function show(id) {
    const el = $('#' + id), prev = $('#' + stack[stack.length - 1]); if (el === prev) return;
    el.classList.add('noanim'); el.classList.remove('off'); el.classList.add('going'); void el.offsetWidth; el.classList.remove('noanim'); el.classList.remove('going');
    prev.classList.add('under'); stack.push(id); el.scrollTop = 0;
  }
  function back() {
    if (stack.length < 2) return; const id = stack.pop(), el = $('#' + id), prev = $('#' + stack[stack.length - 1]);
    el.classList.add('going'); prev.classList.remove('under');
    if (el._onLeave) { el._onLeave(); el._onLeave = null; }
    setTimeout(() => { el.classList.add('off'); el.classList.remove('going'); if (prev.id === 'vHome') renderHome(); }, 430);
  }
  document.addEventListener('click', e => { const b = e.target.closest('[data-back]'); if (b) back(); const g = e.target.closest('[data-go]'); if (g) TOOLS[g.dataset.go] && openTool(g.dataset.go); });
  // gesto de volver desde el borde izquierdo
  (function () {
    let sx = null, sy = 0, el = null;
    addEventListener('touchstart', e => { const t = e.touches[0]; if (t.clientX < 22 && stack.length > 1 && !$('#sheet').classList.contains('on')) { sx = t.clientX; sy = t.clientY; el = $('#' + stack[stack.length - 1]); } else sx = null; }, { passive: true });
    addEventListener('touchmove', e => { if (sx == null) return; const t = e.touches[0], dx = t.clientX - sx; if (Math.abs(t.clientY - sy) > 60 && dx < 30) { sx = null; el.style.transform = ''; return; } if (dx > 0) { el.style.transition = 'none'; el.style.transform = `translateX(${dx}px)`; } }, { passive: true });
    addEventListener('touchend', e => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; el.style.transition = ''; el.style.transform = ''; if (dx > 90) back(); sx = null; });
  })();
  function toolView(dark) {
    // alterna entre dos contenedores para poder apilar una herramienta sobre otra
    const cur = stack[stack.length - 1]; const id = cur === 'vTool' ? 'vTool2' : 'vTool';
    const el = $('#' + id); el.className = 'view off' + (dark ? ' dark' : ''); el.innerHTML = ''; el._onLeave = null; return el;
  }
  const hdr = (title, right = '', big = true) => big
    ? `<div class="hdr"><button class="ib tap" data-back aria-label="Volver">${ic('back')}</button><div class="ttl">${esc(title)}</div><div class="sp"></div>${right}</div>`
    : `<div class="hdr"><button class="ib tap" data-back aria-label="Volver">${ic('back')}</button><div class="ctr">${esc(title)}</div><div class="sp"></div>${right}</div>`;

  // ------------------------------------------------------------ hojas
  let sheetClose = null;
  function sheet(html, { dark = false, onClose } = {}) {
    const sh = $('#sheet'), sc = $('#scrim');
    sh.className = 'sheet' + (dark ? ' dark' : ''); sh.innerHTML = '<div class="grab"></div>' + html; fillIcons(sh);
    void sh.offsetWidth; sh.classList.add('on'); sc.classList.add('on'); sheetClose = onClose || null;
    $$('.light-seg', sh).forEach(s => seg(s, s._cb));
    return sh;
  }
  function closeSheet() { const sh = $('#sheet'); if (!sh.classList.contains('on')) return; sh.classList.add('closing'); sh.classList.remove('on'); $('#scrim').classList.remove('on'); setTimeout(() => sh.classList.remove('closing'), 320); const c = sheetClose; sheetClose = null; c && c(); }
  $('#scrim').onclick = closeSheet;
  (function () { // arrastrar hacia abajo para cerrar
    const sh = $('#sheet'); let y0 = null;
    sh.addEventListener('touchstart', e => { const b = $('.body', sh); if (b && b.scrollTop > 0 && e.target.closest('.body')) return; y0 = e.touches[0].clientY; }, { passive: true });
    sh.addEventListener('touchmove', e => { if (y0 == null) return; const dy = e.touches[0].clientY - y0; if (dy > 0) { sh.style.transition = 'none'; sh.style.transform = `translateY(${dy}px)`; } }, { passive: true });
    sh.addEventListener('touchend', e => { if (y0 == null) return; const dy = e.changedTouches[0].clientY - y0; sh.style.transition = ''; sh.style.transform = ''; y0 = null; if (dy > 110) closeSheet(); });
  })();
  function pickList(title, opts, val, cb, sub) {
    const sh = sheet(`<h3>${esc(title)}</h3>${sub ? `<div class="sub">${esc(sub)}</div>` : ''}<div class="body">${opts.map(o => `<button class="opt" data-v="${esc(o.v)}"><span>${esc(o.l)}${o.d ? `<small>${esc(o.d)}</small>` : ''}</span>${ic('check', 20, 2.4)}</button>`).join('')}</div>`);
    $$('.opt', sh).forEach(b => { b.classList.toggle('on', b.dataset.v == String(val)); b.onclick = () => { $$('.opt', sh).forEach(x => x.classList.toggle('on', x === b)); setTimeout(() => { closeSheet(); cb(b.dataset.v); }, 180); }; });
  }
  function askText(title, val, cb, { sub, type = 'text', sugg = [], placeholder = '', mode } = {}) {
    const sh = sheet(`<h3>${esc(title)}</h3>${sub ? `<div class="sub">${esc(sub)}</div>` : ''}<input class="field" type="${type}" ${mode ? `inputmode="${mode}"` : ''} value="${esc(val)}" placeholder="${esc(placeholder)}">${sugg.length ? `<div class="sugg">${sugg.map(s => `<button class="tap">${esc(s)}</button>`).join('')}</div>` : ''}<div class="acts"><button class="btn tap" id="okT">Guardar</button></div>`);
    const inp = $('.field', sh); setTimeout(() => { inp.focus(); try { inp.select(); } catch (e) { } }, 380);
    $$('.sugg button', sh).forEach(b => b.onclick = () => { inp.value = b.textContent; });
    const ok = () => { closeSheet(); cb(inp.value.trim()); };
    $('#okT', sh).onclick = ok; inp.onkeydown = e => { if (e.key === 'Enter') ok(); };
  }
  function confirmSheet(title, sub, okLabel, cb) {
    const sh = sheet(`<h3>${esc(title)}</h3><div class="sub">${esc(sub)}</div><div class="acts"><button class="btn tap" id="okC" style="background:#D23B3B">${esc(okLabel)}</button><button class="btn ghost tap" id="noC">Cancelar</button></div>`);
    $('#okC', sh).onclick = () => { closeSheet(); cb(); }; $('#noC', sh).onclick = closeSheet;
  }

  // ------------------------------------------------------------ fechas y formatos
  const MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];
  const MESL = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const DIA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const cap1 = s => s ? s[0].toUpperCase() + s.slice(1) : s;
  const n2 = n => String(n).padStart(2, '0');
  const numES = (v, dec = 1) => { const r = Math.round(v * 10 ** dec) / 10 ** dec; return String(r).replace('.', ','); };
  function parseExifDate(s) { if (!s) return null; const m = String(s).match(/(\d{4})[:\-](\d{2})[:\-](\d{2})[ T](\d{2}):(\d{2}):?(\d{2})?/); if (!m) return null; return new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +(m[6] || 0)); }
  const fmtShutter = t => { if (!t) return ''; if (t >= .3) return numES(t, 1) + '"'; return '1/' + Math.round(1 / t); };
  const fmtCoord = (v, pos, neg) => numES(Math.abs(v), 4).replace(/,(\d)$/, ',$1') + '° ' + (v >= 0 ? pos : neg);

  // ------------------------------------------------------------ foto actual
  let PH = null; // { file, img, ex, R (datos crudos), on (visibles), name }
  async function readPhoto(file) {
    const buf = await file.arrayBuffer().catch(() => null);
    let ex = {}; try { ex = buf ? MetaExif.parse(buf) : {}; } catch (e) { ex = {}; }
    const url = URL.createObjectURL(file); const img = await loadImg(url);
    try { await img.decode(); } catch (e) { }
    return { file, img, ex, url };
  }
  function rawFromExif(ex, file, img) {
    const make = (ex.Make || '').trim(), model = (ex.Model || '').trim();
    let cam = model;
    if (make && model && !/apple/i.test(make) && !model.toLowerCase().startsWith(make.split(' ')[0].toLowerCase())) cam = cap1(make.split(' ')[0].toLowerCase()) + ' ' + model;
    const mm35 = ex.FocalLength35 || 0, mm = ex.FocalLength || 0, mmN = mm35 ? Math.round(mm35) : mm ? Math.round(mm) : '';
    let lens = ex.LensModel || '';
    if (/iphone|ipad/i.test(lens) || /apple/i.test(make)) { const f = mm35 || mm; lens = f ? (f < 20 ? 'Gran angular' : f < 40 ? 'Principal' : 'Teleobjetivo') + ' ' + Math.round(f) + ' mm' : ''; if (/front/i.test(ex.LensModel || '')) lens = 'Frontal ' + (f ? Math.round(f) + ' mm' : ''); }
    const dt = parseExifDate(ex.DateTimeOriginal || ex.DateTime);
    const iso = Array.isArray(ex.ISO) ? ex.ISO[0] : ex.ISO;
    return {
      make: make ? cap1(make.toLowerCase()) : '', cam, lens, mmN: mmN ? String(mmN) : '', fn: ex.FNumber ? numES(ex.FNumber, 1) : '', sv: fmtShutter(ex.ExposureTime), isoN: iso ? String(iso) : '',
      dt: dt ? dt.toISOString() : null, dtFromExif: !!dt, place: '', lat: ex.lat ?? null, lon: ex.lon ?? null, sign: S.sign || '', title: '', note: '',
      w: ex.PixelX || img.naturalWidth, h: ex.PixelY || img.naturalHeight, fmt: /heic|heif/i.test(file.type || file.name) ? 'HEIF' : (file.type || '').split('/')[1]?.toUpperCase().replace('JPEG', 'JPEG') || 'JPEG',
      software: ex.Software || ''
    };
  }
  function rawOf(ex, file, img) {
    const R = rawFromExif(ex, file, img);
    R.read = [R.cam, R.mmN, R.fn, R.sv, R.isoN, R.dtFromExif, R.lat != null].filter(Boolean).length;
    if (!R.cam && S.defCam) { R.cam = S.defCam; R.camDefault = true; }
    if (/iphone|ipad/i.test(R.cam)) R.make = 'Apple';
    return R;
  }
  async function reverse(lat, lon) {
    try {
      const ctl = new AbortController(); setTimeout(() => ctl.abort(), 6000);
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=16&accept-language=es`, { signal: ctl.signal });
      const j = await r.json(); const a = j.address || {};
      return j.name && (a.tourism || a.historic || a.attraction || a.natural || a.leisure) ? j.name : (a.village || a.town || a.city || a.municipality || a.county || j.name || '');
    } catch (e) { return ''; }
  }
  function frameData(R, on) {
    const v = k => on[k] !== false ? (R[k] || '') : '';
    const d = { make: R.make };
    d.cam = v('cam'); d.lens = v('lens');
    d.mmN = v('mmN'); d.mm = d.mmN ? d.mmN + ' mm' : '';
    d.fn = v('fn'); d.f = d.fn ? 'f/' + d.fn : '';
    d.sv = v('sv'); d.s0 = d.sv; d.s = d.sv ? d.sv + (d.sv.includes('"') ? '' : ' s') : '';
    d.isoN = v('isoN'); d.iso = d.isoN ? 'ISO ' + d.isoN : '';
    const dt = R.dt ? new Date(R.dt) : null;
    if (dt && on.dt !== false) {
      d.date = `${dt.getDate()} ${MES[dt.getMonth()]} ${dt.getFullYear()}`; d.dlong = `${DIA[dt.getDay()]}, ${dt.getDate()} de ${MESL[dt.getMonth()]} de ${dt.getFullYear()}`;
      d.day = String(dt.getDate()); d.month = cap1(MESL[dt.getMonth()]); d.wd = cap1(DIA[dt.getDay()]); d.year = String(dt.getFullYear());
      d.stamp = `${dt.getFullYear()}-${n2(dt.getMonth() + 1)}-${n2(dt.getDate())}` + (on.time !== false ? ` ${n2(dt.getHours())}:${n2(dt.getMinutes())}:${n2(dt.getSeconds())}` : '');
    } else { d.date = d.dlong = d.day = d.month = d.wd = d.stamp = ''; d.year = String(new Date().getFullYear()); }
    d.time = dt && on.time !== false ? `${n2(dt.getHours())}:${n2(dt.getMinutes())}` : '';
    d.place = v('place');
    if (R.lat != null && on.gps !== false) { d.lat = fmtCoord(R.lat, 'N', 'S'); d.lon = fmtCoord(R.lon, 'E', 'O'); d.gps = d.lat.replace('°', '') + ' · ' + d.lon.replace('°', ''); } else d.lat = d.lon = d.gps = '';
    d.sign = v('sign');
    let t = on.title !== false ? (R.title || '') : '';
    if (t && !t.includes('/')) { const w = t.split(' '); if (w.length > 2) { const h = Math.ceil(w.length / 2); t = w.slice(0, h).join(' ') + '\n' + w.slice(h).join(' '); } }
    d.title = t.replace(/\s*\/\s*/, '\n') || (on.title !== false ? 'Sin\ntítulo' : '');
    d.issue = d.month ? `N.º ${dt.getMonth() + 1} · ${d.month}` : '';
    d.note = on.note !== false ? (R.note || J([d.place, d.month ? d.month.toLowerCase() : ''], ', ')) : '';
    d.dims = R.w && R.h ? `${R.w}×${R.h}` : ''; d.fmt = R.fmt || '';
    d.focus = [.5, .45];
    return d;
  }

  // ------------------------------------------------------------ compositor
  const C = { P: null, P0: null, blur: null, pal: null, palN: null, cvs: null, hist: false };
  const stageEl = $('#stage'), cvw = $('#cvw');
  const TSIZES = [[.88, 'Pequeño'], [1, 'Mediano'], [1.15, 'Grande'], [1.32, 'Muy grande']];
  const tsName = v => (TSIZES.find(t => Math.abs(t[0] - v) < .01) || TSIZES[1])[1];
  function ratioOf(v) { return +v || 0; }
  function stParams() { return { film: S.film, filmAmt: S.filmAmt, adj: S.adj }; }
  async function buildBase(q = 1) {
    const r = ratioOf(S.ratio), side = q === 1 ? 1500 : 720;
    const P = MetaImg.crop(PH.img, r, side); MetaImg.process(P, stParams()); C.P = P;
    if (q === 1) { C.P0 = MetaImg.crop(PH.img, r, 1100); C.blur = MetaImg.blurred(P); C.pal = MetaImg.palette(P); C.palN = C.pal.map(MetaImg.colorName); }
  }
  function opts(theme) { return { theme: theme || S.theme, ts: S.ts, showLogo: S.showLogo, logos: LOGOS, customLogo: CUSTOM, blur: C.blur }; }
  function curFrame() { return FR.find(f => f.id === S.frame) || FR[0]; }
  function dataNow() { const d = frameData(PH.R, PH.on); d.pal = C.pal; d.palN = C.palN; return d; }
  function drawStage(anim) {
    if (!PH || !C.P) return;
    const f = curFrame(); const W = Math.min(1080, Math.round(cvw.clientWidth * (devicePixelRatio || 2)));
    const src = C.comparing ? C.P0 : C.P;
    const c = MetaFrames.render(f, src, dataNow(), opts(), Math.max(400, W));
    fit(c);
    const old = C.cvs; C.cvs = c;
    if (anim && old && !RM) { c.classList.add('in'); cvw.appendChild(c); void c.offsetWidth; c.classList.remove('in'); old.classList.add('out'); setTimeout(() => old.remove(), 420); }
    else { cvw.innerHTML = ''; cvw.appendChild(c); }
    if (C.hist) drawHist();
  }
  // la foto nunca se estira: el tamaño se calcula siempre con su proporción
  function fit(c) { const bw = cvw.clientWidth, bh = cvw.clientHeight; if (!bw || !bh) return; const k = Math.min(bw / c.width, bh / c.height); c.style.width = Math.floor(c.width * k) + 'px'; c.style.height = Math.floor(c.height * k) + 'px'; }
  const refit = () => $$('canvas', cvw).forEach(fit);
  if (window.ResizeObserver) new ResizeObserver(refit).observe(cvw);
  addEventListener('resize', refit);
  let rq = null, rqQ = 1;
  function refresh(q = 1, anim = false) { // recalcula película/ajustes y dibuja
    rqQ = Math.min(rqQ, q); if (rq) return;
    $('#busy').classList.add('on');
    rq = requestAnimationFrame(() => setTimeout(async () => { const qq = rqQ; rq = null; rqQ = 1; await buildBase(qq); drawStage(anim); $('#busy').classList.remove('on'); }, 0));
  }
  function drawHist() { const h = MetaImg.histogram(C.P); const el = $('#hist'); if (!el.children.length) el.innerHTML = h.map(() => '<i></i>').join(''); h.forEach((v, i) => el.children[i].style.height = Math.max(2, v * 38) + 'px'); }
  $('#btnHist').onclick = () => { C.hist = !C.hist; $('#hist').classList.toggle('on', C.hist); $('#btnHist').classList.toggle('on', C.hist); if (C.hist) drawHist(); };
  (function () { // comparar: mantener pulsado
    const b = $('#btnCmp'); const on = e => { e.preventDefault(); C.comparing = true; stageEl.classList.add('comparing'); drawStage(); }; const off = () => { if (!C.comparing) return; C.comparing = false; stageEl.classList.remove('comparing'); drawStage(); };
    b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointerleave', off); b.addEventListener('pointercancel', off);
    b.onclick = () => { if (!C.comparing) toast('Mantén pulsado para ver la original'); };
  })();

  // ---- deshacer / rehacer / borrar cambios
  const HI = { st: [], i: -1 };
  const snap = () => JSON.stringify({ film: S.film, filmAmt: S.filmAmt, adj: S.adj, ratio: S.ratio });
  function pushH() { const s = snap(); if (HI.st[HI.i] === s) return; HI.st = HI.st.slice(0, HI.i + 1); HI.st.push(s); if (HI.st.length > 60) HI.st.shift(); HI.i = HI.st.length - 1; syncH(); }
  function syncH() { $('#btnUndo').disabled = HI.i <= 0; $('#btnRedo').disabled = HI.i >= HI.st.length - 1; $('#btnReset').disabled = snap() === CLEAN; }
  const CLEAN = JSON.stringify({ film: 'none', filmAmt: 100, adj: {}, ratio: 0 });
  function applyH(s) { const o = JSON.parse(s), rch = o.ratio !== S.ratio; Object.assign(S, o); syncEditUI(); refresh(1, true); if (rch) setTimeout(thumbsFrames, 200); syncH(); }
  function syncEditUI() { thumbsFilm(false); renderFilmCap(); rulerFilm.sync(); renderAdj(); renderEstOpts(); }
  $('#btnUndo').onclick = () => { if (HI.i > 0) applyH(HI.st[--HI.i]); };
  $('#btnRedo').onclick = () => { if (HI.i < HI.st.length - 1) applyH(HI.st[++HI.i]); };
  $('#btnReset').onclick = () => { if (snap() === CLEAN) return; applyH(CLEAN); pushH(); toast('Cambios borrados'); };

  async function openComposer(file, preset) {
    toast('Leyendo la foto…', true);
    let p; try { p = await readPhoto(file); } catch (e) { toast('No se ha podido abrir esta foto'); return; }
    const R = rawOf(p.ex, file, p.img);
    PH = { file, img: p.img, ex: p.ex, R, on: { place: true }, name: file.name || 'foto' };
    // cada foto empieza limpia: sin película, sin ajustes y en su proporción
    Object.assign(S, { film: 'none', filmAmt: 100, adj: {}, ratio: 0 });
    if (preset) Object.assign(S, preset);
    HI.st = []; HI.i = -1; filmCat = 'all';
    $('#vComp').classList.toggle('dark', S.darkComp);
    show('vComp');
    await wait(60);
    await buildBase(1); drawStage(); thumbsFrames(); renderCats(); thumbsFilm(true); renderEstOpts(); renderAdj(); renderDatos(); renderFilmCap(); rulerFilm.sync(); pushH();
    setSeg($('#segTabs'), 'pEstilo'); showPane('pEstilo');
    if (!R.read) setTimeout(() => toast('Esta foto ha llegado sin datos de cámara'), 700);
    else $('#toast').classList.remove('on');
    if (R.lat != null && !R.place) reverse(R.lat, R.lon).then(pl => { if (pl && PH && PH.R === R && !R.place) { R.place = pl; drawStage(); renderDatos(); } });
    try { const th = MetaImg.crop(p.img, 1.25, 360).toDataURL('image/jpeg', .8); LS.set('last', { th, cam: R.cam, dt: R.dt, w: R.w, h: R.h, name: PH.name }); DB.put('lastFile', file); } catch (e) { }
  }

  // pestañas
  function showPane(id) { $$('.panel .pane').forEach(p => p.classList.toggle('on', p.id === id)); $$('#' + id + ' .seg').forEach(x => x._place && x._place(false)); if (id === 'pImagen') { rulerFilm.sync(); rulerAdj.sync(); } }
  seg($('#segTabs'), v => showPane(v));
  seg($('#segImg'), v => { $('#imgFilm').style.display = v === 'film' ? '' : 'none'; $('#imgAdj').style.display = v === 'adj' ? '' : 'none'; (v === 'film' ? rulerFilm : rulerAdj).sync(); });

  // miniaturas de marcos
  let thumbJob = 0;
  function thumbsFrames() {
    const strip = $('#frStrip'); const job = ++thumbJob;
    strip.innerHTML = FR.map(f => `<button class="fr-it tap ${f.id === S.frame ? 'on' : ''}" data-id="${f.id}"><div class="th"></div><span>${esc(f.name)}</span></button>`).join('');
    $$('.fr-it', strip).forEach(b => b.onclick = () => { if (S.frame === b.dataset.id) return; S.frame = b.dataset.id; saveS(); $$('.fr-it', strip).forEach(x => x.classList.toggle('on', x === b)); drawStage(true); b.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', inline: 'center', block: 'nearest' }); });
    const Pt = MetaImg.crop(PH.img, ratioOf(S.ratio), 420); MetaImg.process(Pt, stParams());
    const o = opts(); o.blur = MetaImg.blurred(Pt); const d = dataNow();
    let i = 0; const step = () => { if (job !== thumbJob || i >= FR.length) return; const b = strip.children[i]; const c = MetaFrames.render(FR[i], Pt, d, o, 150); b.firstChild.appendChild(c); i++; setTimeout(step, 8); };
    step();
    setTimeout(() => { const on = $('.fr-it.on', strip); on && on.scrollIntoView({ inline: 'center', block: 'nearest' }); }, 50);
  }
  // opciones de estilo
  const RATIOS = [['0', 'Original'], ['1', '1:1'], ['1.25', '4:5'], ['1.3333', '3:4'], ['1.5', '2:3'], ['1.7778', '9:16'], ['0.6667', '3:2'], ['0.5625', '16:9']];
  function renderEstOpts() {
    const el = $('#estOpts');
    el.innerHTML = `${segHTML([['claro', 'Claro'], ['oscuro', 'Oscuro']], S.theme)}
      <button class="chip tap" id="oRatio">${ic('ratio', 16)}<span>${RATIOS.find(r => r[0] == String(S.ratio))?.[1] || 'Original'}</span></button>
      <button class="chip tap" id="oText">${ic('text', 16)}<span>${tsName(S.ts)}</span></button>
      <button class="chip tap ${S.showLogo ? 'on' : ''}" id="oLogo">${ic('logo', 16)}<span>Logo</span></button>
      <button class="chip tap" id="oRec">${ic('save', 16)}<span>Guardar receta</span></button><i style="flex:none;width:8px;height:1px"></i>`;
    seg($('.seg', el), v => { S.theme = v; saveS(); drawStage(true); thumbsFrames(); });
    $('#oRatio').onclick = () => pickList('Proporción', RATIOS.map(([v, l]) => ({ v, l, d: { '1': 'Cuadrada', '1.25': 'Para Instagram', '1.7778': 'Historias', '0': 'La de la foto' }[v] })), String(S.ratio), v => { S.ratio = +v; renderEstOpts(); refresh(1, true); setTimeout(thumbsFrames, 200); pushH(); });
    $('#oText').onclick = () => pickList('Tamaño de los datos', TSIZES.map(([v, l]) => ({ v: String(v), l })), String((TSIZES.find(t => Math.abs(t[0] - S.ts) < .01) || TSIZES[1])[0]), v => { S.ts = +v; saveS(); renderEstOpts(); drawStage(); thumbsFrames(); });
    $('#oLogo').onclick = () => { S.showLogo = !S.showLogo; saveS(); renderEstOpts(); drawStage(); thumbsFrames(); };
    $('#oRec').onclick = () => saveRecipe();
  }
  // películas
  let filmJob = 0, filmCat = 'all';
  function renderCats() {
    const el = $('#filmCats'); el.innerHTML = MetaImg.CATS.map(([k, l]) => `<button class="chip sm tap ${k === filmCat ? 'on' : ''}" data-c="${k}">${l}</button>`).join('');
    $$('button', el).forEach(b => b.onclick = () => { filmCat = b.dataset.c; renderCats(); thumbsFilm(true); $('#filmStrip').scrollLeft = 0; });
  }
  function thumbsFilm(rebuild) {
    const strip = $('#filmStrip');
    if (rebuild || !strip.children.length) {
      const list = FILMS.filter(f => f.id === 'none' || filmCat === 'all' || f.cat === filmCat);
      strip.innerHTML = list.map(f => `<button class="film-it tap ${f.id === S.film ? 'on' : ''}" data-id="${f.id}"><div class="sw"></div><span>${esc(f.name)}</span></button>`).join('');
      $$('.film-it', strip).forEach(b => b.onclick = () => { S.film = b.dataset.id; if (S.film !== 'none' && S.filmAmt === 0) S.filmAmt = 100; $$('.film-it', strip).forEach(x => x.classList.toggle('on', x === b)); renderFilmCap(); rulerFilm.sync(); refresh(1); pushH(); });
      const job = ++filmJob; const base = MetaImg.crop(PH.img, 1, 150); let i = 0;
      const step = () => { if (job !== filmJob || i >= list.length) return; const c = document.createElement('canvas'); c.width = base.width; c.height = base.height; c.getContext('2d').drawImage(base, 0, 0); MetaImg.process(c, { film: list[i].id, filmAmt: 100, adj: {} }); strip.children[i].firstChild.appendChild(c); i++; setTimeout(step, 10); };
      step();
    } else $$('.film-it', strip).forEach(x => x.classList.toggle('on', x.dataset.id === S.film));
  }
  function renderFilmCap() { const f = FILMS.find(x => x.id === S.film) || FILMS[0]; $('#filmCap').innerHTML = `<span><b>${esc(f.name)}</b>. ${esc(f.desc)}</span>`; $('#rulerFilm').style.opacity = S.film === 'none' ? .3 : 1; $('#rulerFilm').style.pointerEvents = S.film === 'none' ? 'none' : ''; }

  // regla deslizable. Doble toque: vuelve al valor de reposo
  function ruler(el, { min, max, get, set, label, step = 1, rest = 0 }) {
    el.innerHTML = '<div class="tk"></div><i class="nd"></i><div class="lab"></div>';
    const tk = $('.tk', el), lab = $('.lab', el), PX = 8; let cfg = { min, max };
    const build = () => { let h = ''; for (let v = cfg.min; v <= cfg.max; v += 5) h += `<i class="${v === rest ? 'z' : v % 25 === 0 ? 'l' : ''}"></i>`; tk.innerHTML = h; };
    const pos = v => { tk.style.transform = `translateX(${-(v - cfg.min) / 5 * PX}px)`; lab.textContent = label(v); };
    build();
    let x0 = null, v0 = 0, last = 0, moved = 0, lastTap = 0;
    el.addEventListener('pointerdown', e => { x0 = e.clientX; v0 = get(); last = v0; moved = 0; try { el.setPointerCapture(e.pointerId); } catch (x) { } tk.style.transition = 'none'; });
    el.addEventListener('pointermove', e => { if (x0 == null) return; moved = Math.max(moved, Math.abs(e.clientX - x0)); let v = Math.round((v0 - (e.clientX - x0) / PX * 5 / 2.2) / step) * step; v = Math.max(cfg.min, Math.min(cfg.max, v)); if (v !== last) { last = v; set(v, true); pos(v); } });
    const up = () => {
      if (x0 == null) return; x0 = null; tk.style.transition = 'transform .35s var(--entrar)';
      if (moved < 5) { const now = Date.now(); if (now - lastTap < 380) { const z = Math.max(cfg.min, Math.min(cfg.max, rest)); set(z, false); pos(z); lastTap = 0; return; } lastTap = now; return; }
      set(get(), false);
    };
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    return { sync() { pos(get()); }, range(a, b) { cfg = { min: a, max: b }; build(); pos(get()); } };
  }
  const rulerFilm = ruler($('#rulerFilm'), { min: 0, max: 100, rest: 100, get: () => S.filmAmt, label: v => 'Intensidad ' + v + ' %', set: (v, live) => { S.filmAmt = v; refresh(live ? .5 : 1); if (!live) pushH(); } });
  let adjOn = 'exp', adjTap = 0;
  const ADJ_IC = { exp: 'expo', bri: 'sun', con: 'contrast', hil: 'hil', sha: 'shadow', whi: 'whi', bla: 'bla', sat: 'drop', vib: 'vib', tem: 'temp', tin: 'tint', spl: 'split2', cla: 'cla', shp: 'shp', fad: 'fad', gra: 'grain', vig: 'vig', blu: 'blu' };
  const sgn = v => (v > 0 ? '+' : '') + v;
  function setAdj(id, v, live) { S.adj = Object.assign({}, S.adj); if (v) S.adj[id] = v; else delete S.adj[id]; const b = $(`.adj[data-id="${id}"] .v`); if (b) { b.textContent = sgn(v); b.classList.toggle('show', !!v); } refresh(live ? .5 : 1); if (!live) pushH(); }
  function renderAdj() {
    const row = $('#adjRow');
    row.innerHTML = ADJ.map(a => `<button class="adj tap ${a.id === adjOn ? 'on' : ''}" data-id="${a.id}"><span class="c">${ic(ADJ_IC[a.id], 19)}<span class="v ${S.adj[a.id] ? 'show' : ''}">${sgn(S.adj[a.id] || 0)}</span></span><span class="n">${a.name}</span></button>`).join('');
    $$('.adj', row).forEach(b => b.onclick = () => {
      const now = Date.now(), id = b.dataset.id;
      if (adjOn === id && now - adjTap < 400) { adjTap = 0; if (S.adj[id]) { setAdj(id, 0, false); rulerAdj.sync(); toast(ADJ.find(x => x.id === id).name + ' a 0'); } return; }
      adjTap = now; adjOn = id; $$('.adj', row).forEach(x => x.classList.toggle('on', x === b)); const a = ADJ.find(x => x.id === adjOn); rulerAdj.range(a.min, a.max);
    });
    const a = ADJ.find(x => x.id === adjOn); rulerAdj.range(a.min, a.max);
  }
  const rulerAdj = ruler($('#rulerAdj'), { min: -100, max: 100, get: () => S.adj[adjOn] || 0, label: v => (ADJ.find(a => a.id === adjOn).name) + ' ' + sgn(v), set: (v, live) => setAdj(adjOn, v, live) });

  // datos
  const FIELDS = [
    ['cam', 'Cámara'], ['lens', 'Objetivo'], ['mmN', 'Focal'], ['fn', 'Apertura'], ['sv', 'Velocidad'], ['isoN', 'ISO'],
    ['dt', 'Fecha'], ['time', 'Hora'], ['place', 'Lugar'], ['gps', 'Coordenadas'], ['sign', 'Firma'], ['title', 'Título (Revista, Museo)'], ['note', 'Nota (Instantánea)']
  ];
  function showVal(k) {
    const R = PH.R, d = frameData(R, {});
    return { cam: R.cam, lens: R.lens, mmN: d.mm, fn: d.f, sv: d.s, isoN: d.iso, dt: d.date, time: d.time, place: R.place, gps: d.gps, sign: R.sign ? '© ' + R.sign : '', title: R.title, note: R.note }[k] || '';
  }
  function renderDatos() {
    const el = $('#dList'), R = PH.R;
    $('#dStat').innerHTML = R.read ? `<b>Leídos de la foto: ${R.read} de 7 datos.</b> Toca uno para cambiarlo; el interruptor lo muestra u oculta.` : `<b>Esta foto ha llegado sin datos de cámara</b> (editada en otra app o compartida).${R.camDefault ? ' Se usa tu cámara de Ajustes.' : ''} Puedes escribirlos tocando cada uno.`;
    el.innerHTML = FIELDS.map(([k, l]) => { const v = showVal(k), on = PH.on[k] !== false; return `<div class="drow ${on ? '' : 'off'}" data-k="${k}"><div class="t tap soft"><small>${l}</small><b class="${v ? '' : 'empty'}">${esc(v || 'Añadir')}</b></div><button class="tog ${on ? 'on' : ''}" aria-label="Mostrar ${l}"><i></i></button></div>`; }).join('');
    $$('.drow', el).forEach(r => {
      const k = r.dataset.k;
      $('.tog', r).onclick = () => { PH.on[k] = PH.on[k] === false; r.classList.toggle('off', PH.on[k] === false); $('.tog', r).classList.toggle('on', PH.on[k] !== false); drawStage(); };
      $('.t', r).onclick = () => editField(k);
    });
  }
  function editField(k) {
    const R = PH.R, dt = R.dt ? new Date(R.dt) : new Date();
    const done = () => { renderDatos(); drawStage(); };
    const L = FIELDS.find(f => f[0] === k)[1];
    if (k === 'cam') askText(L, R.cam, v => { R.cam = v; R.make = /iphone|ipad/i.test(v) ? 'Apple' : (v.split(' ')[0] || ''); done(); });
    else if (k === 'lens') askText(L, R.lens, v => { R.lens = v; done(); });
    else if (k === 'mmN') askText('Focal (mm)', R.mmN, v => { R.mmN = v.replace(/[^\d.,]/g, ''); done(); }, { mode: 'decimal', sugg: ['13', '26', '77'] });
    else if (k === 'fn') askText('Apertura (f/)', R.fn, v => { R.fn = v.replace(/[^\d.,]/g, '').replace('.', ','); done(); }, { mode: 'decimal', sugg: ['1,5', '1,8', '2,8'] });
    else if (k === 'sv') askText('Velocidad', R.sv, v => { R.sv = v.replace(/\s*s$/, ''); done(); }, { sugg: ['1/30', '1/60', '1/125', '1/250', '1/500'], sub: 'Escribe por ejemplo 1/250, o 2" para dos segundos' });
    else if (k === 'isoN') askText('ISO', R.isoN, v => { R.isoN = v.replace(/\D/g, ''); done(); }, { mode: 'numeric', sugg: ['50', '100', '400', '800'] });
    else if (k === 'dt') askText('Fecha', `${dt.getFullYear()}-${n2(dt.getMonth() + 1)}-${n2(dt.getDate())}`, v => { if (!v) return; const [y, m, dd] = v.split('-').map(Number); const n = R.dt ? new Date(R.dt) : new Date(); n.setFullYear(y, m - 1, dd); R.dt = n.toISOString(); done(); }, { type: 'date' });
    else if (k === 'time') askText('Hora', `${n2(dt.getHours())}:${n2(dt.getMinutes())}`, v => { if (!v) return; const [h, m] = v.split(':').map(Number); const n = R.dt ? new Date(R.dt) : new Date(); n.setHours(h, m, 0); R.dt = n.toISOString(); done(); }, { type: 'time' });
    else if (k === 'place') askText(L, R.place, v => { R.place = v; done(); }, { sub: R.lat != null ? 'Buscado a partir de las coordenadas de la foto' : 'Esta foto no trae ubicación' });
    else if (k === 'gps') askText('Coordenadas', R.lat != null ? `${R.lat.toFixed(5)}, ${R.lon.toFixed(5)}` : '', v => { const m = v.replace(/;/g, ',').match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/); if (m) { R.lat = +m[1]; R.lon = +m[2]; } else if (!v) { R.lat = R.lon = null; } done(); }, { sub: 'Latitud y longitud con punto decimal, separadas por coma. Por ejemplo 43.44730, -2.78470' });
    else if (k === 'sign') askText('Firma', R.sign, v => { R.sign = v; if (v && !S.sign) { S.sign = v; saveS(); } done(); }, { placeholder: 'Tu nombre' });
    else if (k === 'title') askText('Título', R.title, v => { R.title = v; done(); }, { sub: 'Usa / para elegir dónde se parte en dos líneas' });
    else if (k === 'note') askText('Nota', R.note, v => { R.note = v; done(); }, { sub: 'Se escribe en cursiva en el marco Instantánea' });
  }

  // elegir marco viéndolo (con una foto de muestra)
  function pickFrame(title, cur, img, R, theme, cb) {
    const sh = sheet(`<h3>${esc(title)}</h3><div class="body"><div class="fgrid">${FR.map(f => `<button class="fcell tap ${f.id === cur ? 'on' : ''}" data-id="${f.id}"><div class="th"></div><span>${esc(f.name)}</span></button>`).join('')}</div></div>`);
    const Pt = MetaImg.crop(img, 0, 360), d = frameData(R, { place: true }); d.pal = MetaImg.palette(Pt); d.palN = d.pal.map(MetaImg.colorName);
    const o = { theme, ts: S.ts, showLogo: S.showLogo, logos: LOGOS, customLogo: CUSTOM, blur: MetaImg.blurred(Pt) };
    const cells = $$('.fcell', sh); let i = 0; const step = () => { if (i >= FR.length || !sh.classList.contains('on')) return; cells[i].firstChild.appendChild(MetaFrames.render(FR[i], Pt, d, o, 200)); i++; setTimeout(step, 6); }; setTimeout(step, 250);
    cells.forEach(b => b.onclick = () => { cells.forEach(x => x.classList.toggle('on', x === b)); setTimeout(() => { closeSheet(); cb(b.dataset.id); }, 160); });
  }

  // ------------------------------------------------------------ exportar
  function outSizes() { return [[1080, '1080'], [2160, '2160'], [3240, 'Máximo']]; }
  async function renderFull(img, R, on, st, frameId, theme, size) {
    const r = ratioOf(st.ratio); const P = MetaImg.crop(img, r, 3024); MetaImg.process(P, st);
    const f = FR.find(x => x.id === frameId) || FR[0];
    const d = frameData(R, on); d.pal = MetaImg.palette(P); d.palN = d.pal.map(MetaImg.colorName);
    const o = { theme, ts: st.ts, showLogo: st.showLogo, logos: LOGOS, customLogo: CUSTOM, blur: MetaImg.blurred(P) };
    const L = MetaFrames.layout(f, P); let W = size; const area = W * W * L.h / 1080; if (area > 16e6) W = Math.floor(Math.sqrt(16e6 * 1080 / L.h));
    return MetaFrames.render(f, P, d, o, W);
  }
  const toBlob = (c, type = 'image/jpeg', q = .93) => new Promise(r => c.toBlob(r, type, q));
  const baseName = n => (n || 'foto').replace(/\.[^.]+$/, '');
  async function shareFiles(files, title = 'Metadat') {
    try { if (navigator.canShare && navigator.canShare({ files })) { await navigator.share({ files, title }); return true; } } catch (e) { if (e.name === 'AbortError') return false; }
    files.forEach((f, i) => setTimeout(() => { const a = document.createElement('a'); a.href = URL.createObjectURL(f); a.download = f.name; document.body.appendChild(a); a.click(); a.remove(); }, i * 400));
    return true;
  }
  function bump(n = 1) { COUNT += n; LS.set('count', COUNT); }
  $('#btnExport').onclick = () => {
    let rec = false;
    const sh = sheet(`<h3>Exportar</h3><div class="sub">La copia sale sin metadatos ocultos: solo lleva lo que se ve en el marco.</div>
      <div class="srow"><div class="t"><b>Formato</b></div><div class="light-seg" id="eFmt">${[['jpeg', 'JPG'], ['png', 'PNG']].map(([v, l]) => `<button data-v="${v}" class="${S.fmt === v ? 'on' : ''}">${l}</button>`).join('')}</div></div>
      <div class="srow"><div class="t"><b>Tamaño</b><small>Ancho en píxeles</small></div><div class="light-seg" id="eSize">${outSizes().map(([v, l]) => `<button data-v="${v}" class="${S.size == v ? 'on' : ''}">${l}</button>`).join('')}</div></div>
      <div class="srow"><div class="t"><b>Guardar como receta</b><small>Marco, película y ajustes, para repetirlos</small></div><button class="tog" id="eRec"><i></i></button></div>
      <div class="prog" id="eProg"><i></i></div>
      <div class="acts"><button class="btn tap" id="eGo">${ic('share', 20)}Guardar o compartir</button></div>`, { dark: S.darkComp });
    seg($('#eFmt', sh), v => { S.fmt = v; saveS(); }); seg($('#eSize', sh), v => { S.size = +v; saveS(); });
    $('#eRec', sh).onclick = e => { rec = !rec; e.currentTarget.classList.toggle('on', rec); };
    $('#eGo', sh).onclick = async e => {
      const b = e.currentTarget; b.disabled = true; b.innerHTML = 'Preparando…'; const pr = $('#eProg', sh); pr.classList.add('on'); setTimeout(() => $('i', pr).style.width = '70%', 30);
      await wait(40);
      try {
        const c = await renderFull(PH.img, PH.R, PH.on, Object.assign(stParams(), { ratio: S.ratio, ts: S.ts, showLogo: S.showLogo }), S.frame, S.theme, S.size);
        const type = S.fmt === 'png' ? 'image/png' : 'image/jpeg'; const blob = await toBlob(c, type);
        $('i', pr).style.width = '100%';
        const file = new File([blob], `${baseName(PH.name)}_metadat.${S.fmt === 'png' ? 'png' : 'jpg'}`, { type });
        if (rec) saveRecipe(true);
        closeSheet(); flash(); await wait(250);
        const ok = await shareFiles([file]); if (ok) { bump(); toast('Foto lista'); }
      } catch (err) { console.error(err); toast('No se ha podido exportar. Prueba con un tamaño menor'); closeSheet(); }
    };
  };

  // ------------------------------------------------------------ recetas
  function saveRecipe(silent) {
    const f = curFrame(), film = FILMS.find(x => x.id === S.film);
    const def = `${f.name} ${S.theme} · ${film.name}`;
    const doSave = name => { const R = LS.get('recipes', []); R.unshift({ id: Date.now(), name: name || def, frame: S.frame, theme: S.theme, film: S.film, filmAmt: S.filmAmt, adj: Object.assign({}, S.adj), ratio: S.ratio, ts: S.ts, showLogo: S.showLogo }); LS.set('recipes', R); toast('Receta guardada'); };
    if (silent) doSave(def); else askText('Nombre de la receta', def, doSave);
  }

  // ------------------------------------------------------------ herramientas
  const pickOne = () => new Promise(res => { const i = $('#fileOne'); i.value = ''; i.onchange = () => res(i.files[0] || null); i.click(); });
  const pickMany = () => new Promise(res => { const i = $('#fileMany'); i.value = ''; i.onchange = () => res([...i.files]); i.click(); });
  const thumbURL = async (file, side = 300, ratio = 1.25) => { const p = await readPhoto(file); return { p, url: MetaImg.crop(p.img, ratio, side).toDataURL('image/jpeg', .82) }; };

  const TOOLS = {
    fotometro: { name: 'Fotómetro', sub: 'Mide la luz', icon: 'meter', open: toolMeter },
    carretes: { name: 'Carretes', sub: 'Rollos y tomas', icon: 'book', open: toolRolls },
    carrusel: { name: 'Carrusel', sub: 'Una foto en varias', icon: 'split', open: toolCarousel },
    composicion: { name: 'Composición', sub: 'Varias en una', icon: 'layout', open: toolCompose },
    lote: { name: 'Lote', sub: 'Varias a la vez', icon: 'stack', open: toolBatch, isNew: true },
    privacidad: { name: 'Privacidad', sub: 'Qué dice tu foto', icon: 'shield', open: toolPrivacy, isNew: true },
    contactos: { name: 'Contactos', sub: 'Hoja de carrete', icon: 'grid', open: toolContacts, isNew: true },
    recetas: { name: 'Recetas', sub: 'Estilos guardados', icon: 'recipe', open: toolRecipes, isNew: true },
    ajustes: { name: 'Ajustes', icon: 'gear', open: toolSettings, hidden: true }
  };
  function openTool(id) { TOOLS[id].open(); }

  // Lote
  function toolBatch() {
    const v = toolView(false); let items = []; const st = { frame: S.frame, theme: S.theme, film: S.film, recipe: null };
    const draw = () => {
      const f = FR.find(x => x.id === st.frame), film = FILMS.find(x => x.id === st.film), sel = items.filter(i => i.on);
      v.innerHTML = hdr('Lote') + `<div class="scroll"><div class="wrap"><p class="intro-t">El mismo marco y la misma película para varias fotos. Cada una lleva sus propios datos, leídos de la foto.</p>
        ${items.length ? `<div class="grid3">${items.map((it, i) => `<button class="thumb tap ${it.on ? '' : 'off'}" data-i="${i}" style="animation-delay:${i * 40}ms"><img src="${it.url}"><span class="ck">${ic('check', 14, 3)}</span><span class="tg ${it.R.read ? 'ok' : ''}">${it.R.read ? 'Con datos' : 'Sin datos'}</span></button>`).join('')}</div>
        <button class="btn ghost tap" id="bAdd" style="margin-top:12px">${ic('plus', 18)}Añadir más fotos</button>` : `<div class="empty-st"><div class="ico">${ic('stack', 28)}</div>Elige las fotos que quieras enmarcar a la vez.</div>`}
        <div class="glab">Estilo para todas</div><div class="group">
          <button class="row tap soft" id="bRec"><div class="t"><b>Receta</b></div><span class="v">${st.recipe ? esc(st.recipe.name) : 'Ninguna'}</span><span class="chev">${ic('chev', 18)}</span></button>
          <button class="row tap soft" id="bFr"><div class="t"><b>Marco</b></div><span class="v">${esc(f.name)}</span><span class="chev">${ic('chev', 18)}</span></button>
          <button class="row tap soft" id="bTh"><div class="t"><b>Tema</b></div><span class="v">${st.theme === 'claro' ? 'Claro' : 'Oscuro'}</span><span class="chev">${ic('chev', 18)}</span></button>
          <button class="row tap soft" id="bFi"><div class="t"><b>Película</b></div><span class="v">${esc(film.name)}</span><span class="chev">${ic('chev', 18)}</span></button>
        </div></div></div>
        <div class="bottom"><div class="prog" id="bProg"><i></i></div>${items.length ? `<button class="btn tap" id="bGo" ${sel.length ? '' : 'disabled'}>Exportar ${sel.length} foto${sel.length === 1 ? '' : 's'}</button>` : `<button class="btn tap" id="bPick">Elegir fotos</button>`}</div>`;
      $$('.thumb', v).forEach(t => t.onclick = () => { items[+t.dataset.i].on = !items[+t.dataset.i].on; t.classList.toggle('off'); const n = items.filter(i => i.on).length; const g = $('#bGo', v); g.textContent = `Exportar ${n} foto${n === 1 ? '' : 's'}`; g.disabled = !n; });
      const add = async () => { const fs = await pickMany(); if (!fs.length) return; toast('Preparando miniaturas…', true); for (const f of fs) { try { const t = await thumbURL(f, 260); items.push({ file: f, url: t.url, on: true, img: t.p.img, R: rawOf(t.p.ex, f, t.p.img) }); } catch (e) { } } $('#toast').classList.remove('on'); draw(); };
      $('#bPick', v) && ($('#bPick', v).onclick = add); $('#bAdd', v) && ($('#bAdd', v).onclick = add);
      $('#bFr', v).onclick = () => { const cb = x => { st.frame = x; st.recipe = null; draw(); }; if (items.length) pickFrame('Marco', st.frame, items[0].img, items[0].R, st.theme, cb); else pickList('Marco', FR.map(x => ({ v: x.id, l: x.name, d: x.desc })), st.frame, cb); };
      $('#bTh', v).onclick = () => pickList('Tema', [{ v: 'claro', l: 'Claro' }, { v: 'oscuro', l: 'Oscuro' }], st.theme, x => { st.theme = x; draw(); });
      $('#bFi', v).onclick = () => pickList('Película', FILMS.map(x => ({ v: x.id, l: x.name, d: x.desc })), st.film, x => { st.film = x; st.recipe = null; draw(); });
      $('#bRec', v).onclick = () => { const R = LS.get('recipes', []); if (!R.length) return toast('Todavía no tienes recetas'); pickList('Receta', [{ v: '', l: 'Ninguna' }, ...R.map(r => ({ v: String(r.id), l: r.name }))], st.recipe ? String(st.recipe.id) : '', x => { st.recipe = R.find(r => String(r.id) === x) || null; if (st.recipe) { st.frame = st.recipe.frame; st.theme = st.recipe.theme; st.film = st.recipe.film; } draw(); }); };
      const go = $('#bGo', v); if (go) go.onclick = async () => {
        const list = items.filter(i => i.on); go.disabled = true; const pr = $('#bProg', v); pr.classList.add('on'); const out = [];
        const base = st.recipe ? st.recipe : { film: st.film, filmAmt: 100, adj: {}, ratio: 0, ts: S.ts, showLogo: S.showLogo };
        for (let k = 0; k < list.length; k++) {
          go.textContent = `Preparando ${k + 1} de ${list.length}…`;
          try { const p = await readPhoto(list[k].file); const R = rawOf(p.ex, list[k].file, p.img); if (R.lat != null) R.place = await reverse(R.lat, R.lon);
            const c = await renderFull(p.img, R, { place: true }, Object.assign({}, base, { film: st.film }), st.frame, st.theme, S.size);
            const blob = await toBlob(c); out.push(new File([blob], `${baseName(list[k].file.name)}_metadat.jpg`, { type: 'image/jpeg' })); URL.revokeObjectURL(p.url);
          } catch (e) { console.error(e); }
          $('i', pr).style.width = ((k + 1) / list.length * 100) + '%'; await wait(20);
        }
        flash(); const ok = await shareFiles(out); if (ok) { bump(out.length); toast(`${out.length} fotos listas`); }
        go.disabled = false; draw();
      };
    };
    draw(); show(v.id);
  }

  // Privacidad
  function toolPrivacy() {
    const v = toolView(false); let P = null;
    const draw = () => {
      if (!P) { v.innerHTML = hdr('Privacidad') + `<div class="scroll"><div class="wrap"><p class="intro-t">Mira qué dice una foto de ti antes de compartirla: dónde estabas, con qué móvil, a qué hora. Y crea una copia limpia, sin nada de eso.</p><div class="empty-st"><div class="ico">${ic('shield', 28)}</div>La foto no sale de tu móvil.</div></div></div><div class="bottom"><button class="btn tap" id="pPick">Elegir una foto</button></div>`; $('#pPick', v).onclick = async () => { const f = await pickOne(); if (!f) return; const p = await readPhoto(f); const R = rawOf(p.ex, f, p.img); P = { f, p, R }; draw(); if (R.lat != null) reverse(R.lat, R.lon).then(pl => { if (pl) { R.place = pl; draw(); } }); }; return; }
      const { R, p } = P, d = frameData(R, {}), ex = p.ex;
      const items = [
        ['Ubicación', R.lat != null ? J([R.place, d.gps]) : '', 'pin'], ['Dispositivo', J([R.cam, R.lens]), 'cam'], ['Fecha y hora', d.dlong ? cap1(d.dlong) + ', ' + d.time : '', 'book'],
        ['Ajustes de cámara', J([d.mm, d.f, d.s, d.iso]), 'aperture'], ['Programa', R.software, 'gear'], ['Tamaño original', d.dims, 'image']
      ];
      const found = items.filter(i => i[1]).length;
      v.innerHTML = hdr('Privacidad') + `<div class="scroll"><div class="wrap">
        ${R.lat != null ? `<div class="mapc"><svg viewBox="0 0 390 200" preserveAspectRatio="xMidYMid slice"><rect width="390" height="200" fill="#E3E8E8"/><g stroke="#fff" stroke-width="10" fill="none"><path d="M-10 70 C80 90 160 40 250 70 S360 110 400 90"/><path d="M120 -10 C110 80 150 140 130 210"/></g><g stroke="#fff" stroke-width="4" fill="none" opacity=".8"><path d="M-10 150 C100 140 200 170 400 150"/><path d="M280 -10 L250 210"/><path d="M40 -10 L70 210"/></g><path d="M200 -10 C230 60 300 80 400 60" stroke="#CFE3E6" stroke-width="18" fill="none"/></svg><i class="pulse"></i><span class="pin">${ic('pin', 36, 2.2)}</span><div class="lbl"><span>Tu foto dice dónde estabas</span><a href="https://maps.apple.com/?ll=${R.lat},${R.lon}&q=Foto" target="_blank" rel="noopener">Abrir en Mapas</a></div></div>`
        : `<div style="margin-bottom:16px"><span class="badge ok">${ic('check', 14, 3)}Esta foto no lleva ubicación</span></div>`}
        <p class="intro-t">${found ? `Esta foto lleva <b>${found} dato${found === 1 ? '' : 's'}</b> escondido${found === 1 ? '' : 's'}. La copia limpia no lleva ninguno. La original no se toca.` : 'Esta foto no lleva datos escondidos.'}</p>
        <div class="group">${items.map(([k, val, i]) => `<div class="row"><span style="color:${val ? 'var(--magenta)' : '#B4B8BA'}">${ic(i, 20)}</span><div class="t"><b>${k}</b><small>${esc(val || 'No lo lleva')}</small></div></div>`).join('')}</div>
        <button class="btn ghost tap" id="pOther" style="margin-top:14px">Elegir otra foto</button></div></div>
        <div class="bottom"><button class="btn tap" id="pClean">${ic('shield', 20)}Crear copia limpia</button></div>`;
      $('#pOther', v).onclick = () => { P = null; draw(); $('#pPick', v)?.click(); };
      $('#pClean', v).onclick = async () => {
        const c = document.createElement('canvas'); const k = Math.min(1, 4096 / Math.max(p.img.naturalWidth, p.img.naturalHeight)); c.width = Math.round(p.img.naturalWidth * k); c.height = Math.round(p.img.naturalHeight * k); c.getContext('2d').drawImage(p.img, 0, 0, c.width, c.height);
        const blob = await toBlob(c, 'image/jpeg', .94); flash(); await shareFiles([new File([blob], baseName(P.f.name) + '_limpia.jpg', { type: 'image/jpeg' })]); toast('Copia limpia lista, sin datos');
      };
    };
    draw(); show(v.id);
  }

  // Hoja de contactos
  function toolContacts() {
    const v = toolView(true); let items = []; let fav = new Set(); let bw = false;
    const num = i => (i % 2 ? (i + 1) + 'A' : String(i + 1));
    const now = new Date();
    const draw = () => {
      v.innerHTML = hdr('Hoja de contactos', items.length ? `<button class="ib tap ${bw ? 'cian' : ''}" id="cBw" aria-label="Blanco y negro">${ic('bw', 22)}</button>` : '', false) + `<div class="scroll"><div class="wrap">
        ${items.length ? `<div class="sheetc"><div class="hd"><span>METADAT 400</span><span>CARRETE ${now.getMonth() + 1}, ${MESL[now.getMonth()].toUpperCase()} ${now.getFullYear()}</span></div><div class="g">${items.map((it, i) => `<div class="c tap soft" data-i="${i}"><img src="${it.url}" style="${bw ? 'filter:grayscale(1) contrast(1.1)' : ''}"><span>${num(i)}</span>${fav.has(i) ? '<svg viewBox="0 0 120 100"><path d="M60 6 C100 4 116 30 112 55 C108 84 76 96 50 94 C20 92 4 70 8 46 C12 20 34 8 66 8" fill="none" stroke="#D4357C" stroke-width="3.2" stroke-linecap="round"/></svg>' : ''}</div>`).join('')}</div></div>
        <p class="intro-t" style="margin-top:14px">${items.length} foto${items.length === 1 ? '' : 's'}. Toca una para marcarla con un círculo, como la buena del carrete.</p><button class="btn ghost tap" id="cAdd">${ic('plus', 18)}Añadir fotos</button>`
          : `<p class="intro-t">Junta varias fotos como un carrete revelado, con números de fotograma, y marca la buena con un círculo.</p><div class="empty-st"><div class="ico">${ic('grid', 28)}</div>Hasta 36 fotos.</div>`}
        </div></div><div class="bottom">${items.length ? `<button class="btn tap" id="cGo">Exportar hoja</button>` : `<button class="btn tap" id="cPick">Elegir fotos</button>`}</div>`;
      const add = async () => { const fs = (await pickMany()).slice(0, 36 - items.length); if (!fs.length) return; toast('Revelando…', true); for (const f of fs) { try { const t = await thumbURL(f, 420, 2 / 3); items.push({ file: f, url: t.url, img: t.p.img }); } catch (e) { } } $('#toast').classList.remove('on'); draw(); };
      $('#cPick', v) && ($('#cPick', v).onclick = add); $('#cAdd', v) && ($('#cAdd', v).onclick = add);
      $('#cBw', v) && ($('#cBw', v).onclick = () => { bw = !bw; draw(); });
      $$('.c', v).forEach(c => c.onclick = () => { const i = +c.dataset.i; fav.has(i) ? fav.delete(i) : fav.add(i); draw(); });
      $('#cGo', v) && ($('#cGo', v).onclick = async () => {
        const W = 2400, pad = 90, gap = 34, cols = 3, cw = (W - pad * 2 - gap * (cols - 1)) / cols, chh = cw * 2 / 3, rows = Math.ceil(items.length / cols), H = pad + 70 + rows * (chh + 64) + pad - 30;
        const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'); x.fillStyle = '#121110'; x.fillRect(0, 0, W, H);
        x.fillStyle = '#E0892F'; x.font = '30px MMono'; x.textBaseline = 'middle'; x.fillText('METADAT 400', pad, pad); x.textAlign = 'right'; x.fillText(`CARRETE ${now.getMonth() + 1}, ${MESL[now.getMonth()].toUpperCase()} ${now.getFullYear()}`, W - pad, pad); x.textAlign = 'left';
        items.forEach((it, i) => {
          const cx = pad + (i % cols) * (cw + gap), cy = pad + 70 + Math.floor(i / cols) * (chh + 64); const P = MetaImg.crop(it.img, 2 / 3, 1200); if (bw) MetaImg.process(P, { film: 'plata400', filmAmt: 100, adj: {} });
          x.drawImage(P, cx, cy, cw, chh); x.fillStyle = '#E0892F'; x.font = '24px MMono'; x.fillText(num(i), cx, cy + chh + 26);
          if (fav.has(i)) { x.save(); x.strokeStyle = '#D4357C'; x.lineWidth = 8; x.lineCap = 'round'; x.beginPath(); x.ellipse(cx + cw / 2, cy + chh / 2, cw * .56, chh * .62, -.06, .2, Math.PI * 2 + .05); x.stroke(); x.restore(); }
        });
        const blob = await toBlob(c); flash(); const ok = await shareFiles([new File([blob], 'hoja_de_contactos.jpg', { type: 'image/jpeg' })]); if (ok) { bump(); toast('Hoja lista'); }
      });
    };
    draw(); show(v.id);
  }

  // Fotómetro
  function toolMeter() {
    const v = toolView(true); let stream = null, timer = null, mode = 'cam', iso = 400, ev = 11, scene = 'sol';
    const SCENES = [['sol', 'Sol fuerte', 15, 'sun'], ['nubes', 'Nublado', 13, 'cloud'], ['sombra', 'Sombra', 12, 'tree'], ['interior', 'Interior', 8, 'bulb'], ['noche', 'Calle de noche', 5, 'moon']];
    const STD = [1 / 4000, 1 / 2000, 1 / 1000, 1 / 500, 1 / 250, 1 / 125, 1 / 60, 1 / 30, 1 / 15, 1 / 8, 1 / 4, 1 / 2, 1, 2, 4, 8, 15, 30];
    const fmtT = t => { const n = STD.reduce((a, b) => Math.abs(Math.log(b) - Math.log(t)) < Math.abs(Math.log(a) - Math.log(t)) ? b : a); return n >= 1 ? n + '"' : '1/' + Math.round(1 / n); };
    const AP = [2.8, 5.6, 8, 16];
    const table = () => { const e = ev + Math.log2(iso / 100); return AP.map((N, i) => `<div class="${i === 1 ? 'on' : ''}"><small>f/${numES(N)}</small><b>${fmtT(N * N / Math.pow(2, e))}</b></div>`).join(''); };
    const upd = () => { $('#evN', v).textContent = 'EV ' + numES(ev, 1).replace(',0', ''); $('#etbl', v).innerHTML = table(); };
    const stop = () => { clearInterval(timer); timer = null; if (stream) stream.getTracks().forEach(t => t.stop()); stream = null; };
    v._onLeave = stop;
    const draw = () => {
      v.innerHTML = hdr('Fotómetro', '', false) + `<div class="meter" id="mBox">${mode === 'cam' ? '<video playsinline muted autoplay id="mVid"></video><div class="spot"></div>' : `<div style="position:absolute;inset:0;display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:20px;align-content:center">${SCENES.map(([k, l, e, i]) => `<button class="chip tap ${scene === k ? 'on' : ''}" data-s="${k}" style="height:54px;justify-content:flex-start;font-size:15px">${ic(i, 18)}${l}</button>`).join('')}</div>`}</div>
        <div style="flex:none;padding-bottom:calc(var(--sb) + 12px)"><div style="display:flex;justify-content:center;padding-top:12px"><div class="seg" id="mMode"><button data-v="cam" class="${mode === 'cam' ? 'on' : ''}">Cámara</button><button data-v="esc" class="${mode === 'esc' ? 'on' : ''}">Escena</button></div></div>
        <div class="ev"><b id="evN">EV</b><small>${mode === 'cam' ? 'Medido en el punto central · orientativo' : 'Valor típico para esa luz'}</small></div><div class="etbl" id="etbl"></div>
        <div class="isos">${[100, 200, 400, 800, 1600, 3200].map(n => `<button class="chip tap ${n === iso ? 'on' : ''}" data-iso="${n}">ISO ${n}</button>`).join('')}</div></div>`;
      seg($('#mMode', v), m => { mode = m; stop(); if (m === 'esc') ev = SCENES.find(s => s[0] === scene)[2]; draw(); });
      $$('[data-iso]', v).forEach(b => b.onclick = () => { iso = +b.dataset.iso; $$('[data-iso]', v).forEach(x => x.classList.toggle('on', x === b)); upd(); });
      $$('[data-s]', v).forEach(b => b.onclick = () => { scene = b.dataset.s; ev = SCENES.find(s => s[0] === scene)[2]; $$('[data-s]', v).forEach(x => x.classList.toggle('on', x === b)); upd(); });
      upd();
      if (mode === 'cam') start();
    };
    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
        const vid = $('#mVid', v); vid.srcObject = stream; await vid.play().catch(() => { });
        const c = document.createElement('canvas'); c.width = 48; c.height = 48; const x = c.getContext('2d', { willReadFrequently: true });
        timer = setInterval(() => { if (!vid.videoWidth) return; const s = Math.min(vid.videoWidth, vid.videoHeight) * .18; x.drawImage(vid, (vid.videoWidth - s) / 2, (vid.videoHeight - s) / 2, s, s, 0, 0, 48, 48); const p = x.getImageData(0, 0, 48, 48).data; let L = 0; for (let i = 0; i < p.length; i += 4) L += .2126 * p[i] + .7152 * p[i + 1] + .0722 * p[i + 2]; L /= p.length / 4; const e = 11 + Math.log2((L + 2) / 118) * 2.4; ev = Math.round((ev * .6 + e * .4) * 3) / 3; upd(); }, 280);
      } catch (e) { toast('Sin acceso a la cámara. Usa el modo Escena'); mode = 'esc'; ev = 15; draw(); }
    };
    draw(); show(v.id);
  }

  // Libro de carretes
  function toolRolls() {
    const v = toolView(false);
    const draw = () => {
      const R = LS.get('rolls', []);
      v.innerHTML = hdr('Carretes', `<button class="ib tap cian" id="rAdd" aria-label="Nuevo carrete">${ic('plus', 24)}</button>`) + `<div class="scroll"><div class="wrap">
        ${R.length ? R.map(r => `<button class="row tap soft group" data-id="${r.id}" style="margin-bottom:8px;border-radius:18px"><span style="color:var(--cian)">${ic('roll', 24)}</span><div class="t"><b>${esc(r.film)}</b><small>${esc(J([r.iso ? 'ISO ' + r.iso : '', r.cam, r.date]))}</small></div><span class="v">${r.shots.length} tomas</span><span class="chev">${ic('chev', 18)}</span></button>`).join('')
          : `<div class="empty-st"><div class="ico">${ic('book', 28)}</div>Apunta cada carrete y lo que disparas, para recordar cómo hiciste cada foto.</div>`}</div></div>
        <div class="bottom"><button class="btn tap" id="rAdd2">Nuevo carrete</button></div>`;
      const add = () => newRoll(draw); $('#rAdd', v).onclick = add; $('#rAdd2', v).onclick = add;
      $$('[data-id]', v).forEach(b => b.onclick = () => rollDetail(+b.dataset.id, draw));
    };
    draw(); show(v.id);
  }
  function newRoll(cb) {
    const g = { cams: S.defCam ? [{ name: S.defCam }] : [] };
    const sh = sheet(`<h3>Nuevo carrete</h3><div class="sub">Película, sensibilidad y cámara.</div>
      <input class="field" id="nf" placeholder="Película, por ejemplo Plata 400"><input class="field" id="ni" inputmode="numeric" placeholder="ISO, por ejemplo 400"><input class="field" id="nc" placeholder="Cámara" value="${esc(g.cams[0]?.name || '')}">
      <div class="acts"><button class="btn tap" id="nOk">Crear carrete</button></div>`);
    $('#nOk', sh).onclick = () => { const film = $('#nf', sh).value.trim() || 'Carrete'; const R = LS.get('rolls', []); const d = new Date(); R.unshift({ id: Date.now(), film, iso: $('#ni', sh).value.replace(/\D/g, ''), cam: $('#nc', sh).value.trim(), date: `${d.getDate()} ${MES[d.getMonth()]} ${d.getFullYear()}`, shots: [] }); LS.set('rolls', R); closeSheet(); cb(); };
  }
  function rollDetail(id, onBack) {
    const v = toolView(false);
    const draw = () => {
      const R = LS.get('rolls', []), r = R.find(x => x.id === id); if (!r) return back();
      v.innerHTML = hdr(r.film, `<button class="ib tap" id="rDel" aria-label="Borrar carrete">${ic('trash', 21)}</button>`) + `<div class="scroll"><div class="wrap"><p class="intro-t">${esc(J([r.iso ? 'ISO ' + r.iso : '', r.cam, 'empezado el ' + r.date]))}</p>
        ${r.shots.length ? `<div class="group">${r.shots.map((s, i) => `<div class="row"><span class="disp" style="width:34px;font-size:20px;color:var(--cian)">${s.n}</span><div class="t"><b>${esc(J([s.f ? 'f/' + s.f : '', s.s]))  || 'Sin datos'}</b><small>${esc(J([s.note, s.date]))}</small></div><button class="ib tap" data-del="${i}" aria-label="Borrar toma">${ic('x', 18)}</button></div>`).join('')}</div>`
          : `<div class="empty-st"><div class="ico">${ic('aperture', 28)}</div>Todavía no hay tomas. Apunta cada disparo.</div>`}</div></div>
        <div class="bottom"><button class="btn tap" id="sAdd">${ic('plus', 18)}Apuntar toma ${r.shots.length + 1}</button></div>`;
      $('#sAdd', v).onclick = () => {
        const sh = sheet(`<h3>Toma ${r.shots.length + 1}</h3><input class="field" id="sf" inputmode="decimal" placeholder="Apertura, por ejemplo 5,6"><div class="sugg" id="sfs">${['2', '2,8', '4', '5,6', '8', '11'].map(x => `<button class="tap">${x}</button>`).join('')}</div><input class="field" id="ss" placeholder="Velocidad, por ejemplo 1/125"><div class="sugg" id="sss">${['1/30', '1/60', '1/125', '1/250', '1/500'].map(x => `<button class="tap">${x}</button>`).join('')}</div><input class="field" id="sn" placeholder="Nota (opcional)"><div class="acts"><button class="btn tap" id="sOk">Apuntar</button></div>`);
        $$('#sfs button', sh).forEach(b => b.onclick = () => $('#sf', sh).value = b.textContent); $$('#sss button', sh).forEach(b => b.onclick = () => $('#ss', sh).value = b.textContent);
        $('#sOk', sh).onclick = () => { const d = new Date(); r.shots.push({ n: r.shots.length + 1, f: $('#sf', sh).value.trim(), s: $('#ss', sh).value.trim(), note: $('#sn', sh).value.trim(), date: `${d.getDate()} ${MES[d.getMonth()]}, ${n2(d.getHours())}:${n2(d.getMinutes())}` }); LS.set('rolls', R); closeSheet(); draw(); };
      };
      $$('[data-del]', v).forEach(b => b.onclick = () => { r.shots.splice(+b.dataset.del, 1); r.shots.forEach((s, i) => s.n = i + 1); LS.set('rolls', R); draw(); });
      $('#rDel', v).onclick = () => confirmSheet('¿Borrar este carrete?', 'Se borran también sus tomas. No se puede deshacer.', 'Borrar carrete', () => { LS.set('rolls', R.filter(x => x.id !== id)); back(); setTimeout(onBack, 450); });
    };
    v._onLeave = () => setTimeout(onBack, 50);
    draw(); show(v.id);
  }

  // Carrusel
  function toolCarousel() {
    const v = toolView(false); let P = null, n = 3, ratio = 1.25;
    const draw = () => {
      if (!P) { v.innerHTML = hdr('Carrusel') + `<div class="scroll"><div class="wrap"><p class="intro-t">Parte una foto panorámica en varias para publicarlas seguidas y que, al deslizar, se vea entera.</p><div class="empty-st"><div class="ico">${ic('split', 28)}</div>Funciona mejor con fotos horizontales.</div></div></div><div class="bottom"><button class="btn tap" id="kPick">Elegir una foto</button></div>`; $('#kPick', v).onclick = async () => { const f = await pickOne(); if (!f) return; P = await readPhoto(f); P.f = f; draw(); }; return; }
      const totalRatio = ratio / n; const prev = MetaImg.crop(P.img, totalRatio, 1400);
      v.innerHTML = hdr('Carrusel') + `<div class="scroll"><div class="wrap"><div class="cprev" id="kPrev"></div>
        <div class="glab">Número de partes</div><div class="opts" style="padding:0">${segHTML([2, 3, 4, 5].map(x => [x, x]), n, 'seg light-seg')}</div>
        <div class="glab">Formato de cada parte</div><div class="opts" style="padding:0">${segHTML([['1.25', '4:5'], ['1', '1:1']], String(ratio), 'seg light-seg')}</div>
        <button class="btn ghost tap" id="kOther" style="margin-top:18px">Elegir otra foto</button></div></div><div class="bottom"><button class="btn tap" id="kGo">Exportar ${n} partes</button></div>`;
      const box = $('#kPrev', v); box.appendChild(prev); prev.style.width = '100%';
      for (let i = 1; i < n; i++) box.insertAdjacentHTML('beforeend', `<i class="cut" style="left:${i / n * 100}%"></i>`);
      for (let i = 0; i < n; i++) box.insertAdjacentHTML('beforeend', `<span class="num" style="left:${(i + .5) / n * 100}%">${i + 1}</span>`);
      const sgs = $$('.light-seg', v); seg(sgs[0], x => { n = +x; draw(); }); seg(sgs[1], x => { ratio = +x; draw(); });
      $('#kOther', v).onclick = () => { P = null; draw(); };
      $('#kGo', v).onclick = async () => {
        const full = MetaImg.crop(P.img, totalRatio, 1080 * n); const pw = full.width / n, out = [];
        for (let i = 0; i < n; i++) { const c = document.createElement('canvas'); c.width = 1080; c.height = Math.round(1080 * ratio); c.getContext('2d').drawImage(full, i * pw, 0, pw, full.height, 0, 0, c.width, c.height); out.push(new File([await toBlob(c)], `${baseName(P.f.name)}_${i + 1}.jpg`, { type: 'image/jpeg' })); }
        flash(); const ok = await shareFiles(out); if (ok) { bump(n); toast(`${n} partes listas`); }
      };
    };
    draw(); show(v.id);
  }

  // Composición
  function toolCompose() {
    const v = toolView(false); let items = [], lay = 0, gap = 24, bg = '#FFFFFF';
    const LAYS = { 2: [[[0, 0, .5, 1], [.5, 0, .5, 1]], [[0, 0, 1, .5], [0, .5, 1, .5]]], 3: [[[0, 0, .6, 1], [.6, 0, .4, .5], [.6, .5, .4, .5]], [[0, 0, 1, .5], [0, .5, .5, .5], [.5, .5, .5, .5]], [[0, 0, 1 / 3, 1], [1 / 3, 0, 1 / 3, 1], [2 / 3, 0, 1 / 3, 1]]], 4: [[[0, 0, .5, .5], [.5, 0, .5, .5], [0, .5, .5, .5], [.5, .5, .5, .5]], [[0, 0, .6, 1], [.6, 0, .4, 1 / 3], [.6, 1 / 3, .4, 1 / 3], [.6, 2 / 3, .4, 1 / 3]]] };
    const render = (W) => {
      const H = Math.round(W * 1.25), c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'); x.fillStyle = bg; x.fillRect(0, 0, W, H);
      const L = LAYS[items.length][lay] || LAYS[items.length][0], g = gap * W / 1080;
      L.forEach(([a, b, w, h], i) => { const X = a * (W - g) + g, Y = b * (H - g) + g, ww = w * (W - g) - g, hh = h * (H - g) - g; const P = MetaImg.crop(items[i].img, hh / ww, Math.max(ww, hh) * 1.2); x.drawImage(P, X, Y, ww, hh); });
      return c;
    };
    const draw = () => {
      const ok = items.length >= 2 && items.length <= 4;
      v.innerHTML = hdr('Composición') + `<div class="scroll"><div class="wrap">${ok ? `<div class="cprev" id="mPrev" style="background:none"></div>
        <div class="glab">Distribución</div><div class="lay">${LAYS[items.length].map((L, i) => `<button class="tap ${i === lay ? 'on' : ''}" data-l="${i}"><svg viewBox="0 0 40 50" width="34" height="42">${L.map(([a, b, w, h]) => `<rect x="${a * 40 + 1.5}" y="${b * 50 + 1.5}" width="${w * 40 - 3}" height="${h * 50 - 3}" rx="2" fill="#15171A" opacity=".75"/>`).join('')}</svg></button>`).join('')}</div>
        <div class="glab">Separación</div><div class="opts" style="padding:0">${segHTML([[0, 'Sin'], [24, 'Fina'], [60, 'Ancha']], gap, 'seg light-seg')}</div><div class="glab">Fondo</div><div class="opts" style="padding:0">${segHTML([['#FFFFFF', 'Blanco'], ['#15171A', 'Negro'], ['#F7F6F2', 'Papel']], bg, 'seg light-seg')}</div>
        <button class="btn ghost tap" id="mAgain" style="margin-top:18px">Elegir otras fotos</button>`
        : `<p class="intro-t">Junta de 2 a 4 fotos en una sola imagen, con la separación y el fondo que quieras.</p><div class="empty-st"><div class="ico">${ic('layout', 28)}</div>Elige entre 2 y 4 fotos.</div>`}</div></div>
        <div class="bottom">${ok ? '<button class="btn tap" id="mGo">Exportar composición</button>' : '<button class="btn tap" id="mPick">Elegir fotos</button>'}</div>`;
      const pick = async () => { const fs = (await pickMany()).slice(0, 4); if (fs.length < 2) { if (fs.length) toast('Elige al menos 2 fotos'); return; } items = []; for (const f of fs) items.push(await readPhoto(f)); lay = 0; draw(); };
      $('#mPick', v) && ($('#mPick', v).onclick = pick); $('#mAgain', v) && ($('#mAgain', v).onclick = pick);
      if (!ok) return;
      const c = render(900); c.style.width = '100%'; c.style.borderRadius = '6px'; c.style.boxShadow = '0 10px 30px rgba(21,23,26,.12)'; $('#mPrev', v).appendChild(c);
      $$('[data-l]', v).forEach(b => b.onclick = () => { lay = +b.dataset.l; draw(); });
      const sgs = $$('.light-seg', v); seg(sgs[0], x => { gap = +x; draw(); }); seg(sgs[1], x => { bg = x; draw(); });
      $('#mGo', v).onclick = async () => { const c2 = render(2160); flash(); const okk = await shareFiles([new File([await toBlob(c2)], 'composicion_metadat.jpg', { type: 'image/jpeg' })]); if (okk) { bump(); toast('Composición lista'); } };
    };
    draw(); show(v.id);
  }

  // Recetas
  function toolRecipes() {
    const v = toolView(false);
    const draw = () => {
      const R = LS.get('recipes', []);
      v.innerHTML = hdr('Recetas') + `<div class="scroll"><div class="wrap"><p class="intro-t">Un estilo guardado: marco, tema, película y ajustes. Úsalo con otra foto y queda igual.</p>
        ${R.length ? `<div class="group">${R.map(r => { const f = FR.find(x => x.id === r.frame), fi = FILMS.find(x => x.id === r.film); return `<div class="row"><span style="color:var(--cian)">${ic('recipe', 22)}</span><div class="t"><b>${esc(r.name)}</b><small>${esc(J([f && f.name, r.theme === 'claro' ? 'Claro' : 'Oscuro', fi && fi.name]))}</small></div><button class="chip tap" data-use="${r.id}" style="background:var(--fijador)">Usar</button><button class="ib tap" data-del="${r.id}" aria-label="Borrar">${ic('x', 18)}</button></div>`; }).join('')}</div>`
          : `<div class="empty-st"><div class="ico">${ic('recipe', 28)}</div>Todavía no hay recetas. Guárdalas desde Componer, en Estilo o al exportar.</div>`}</div></div>`;
      $$('[data-use]', v).forEach(b => b.onclick = async () => { const r = R.find(x => x.id === +b.dataset.use); const f = await pickOne(); if (!f) return; back(); await wait(300); openComposer(f, { frame: r.frame, theme: r.theme, film: r.film, filmAmt: r.filmAmt, adj: Object.assign({}, r.adj), ratio: r.ratio, ts: r.ts, showLogo: r.showLogo }); });
      $$('[data-del]', v).forEach(b => b.onclick = () => { LS.set('recipes', R.filter(x => x.id !== +b.dataset.del)); draw(); });
    };
    draw(); show(v.id);
  }

  // Ajustes
  function toolSettings() {
    const v = toolView(false);
    const draw = () => {
      const f = FR.find(x => x.id === S.frame), fi = FILMS.find(x => x.id === S.film);
      v.innerHTML = hdr('Ajustes') + `<div class="scroll"><div class="wrap">
        <div class="glab">Apariencia</div><div class="group"><div class="row"><div class="t"><b>Compositor oscuro</b><small>La foto se ve mejor sobre fondo oscuro</small></div><button class="tog ${S.darkComp ? 'on' : ''}" id="aDark"><i></i></button></div></div>
        <div class="glab">Al abrir una foto</div><div class="group">
          <button class="row tap soft" id="aFr"><div class="t"><b>Marco</b></div><span class="v">${esc(f.name)}</span><span class="chev">${ic('chev', 18)}</span></button>
          <button class="row tap soft" id="aTh"><div class="t"><b>Tema del marco</b></div><span class="v">${S.theme === 'claro' ? 'Claro' : 'Oscuro'}</span><span class="chev">${ic('chev', 18)}</span></button>
          <button class="row tap soft" id="aTs"><div class="t"><b>Tamaño de los datos</b></div><span class="v">${tsName(S.ts)}</span><span class="chev">${ic('chev', 18)}</span></button>
          <button class="row tap soft" id="aCam"><div class="t"><b>Mi cámara</b><small>Se usa solo si la foto llega sin datos</small></div><span class="v">${esc(S.defCam || 'Ninguna')}</span><span class="chev">${ic('chev', 18)}</span></button>
          <button class="row tap soft" id="aSi"><div class="t"><b>Firma</b></div><span class="v">${S.sign ? '© ' + esc(S.sign) : 'Sin firma'}</span><span class="chev">${ic('chev', 18)}</span></button>
          <div class="row"><div class="t"><b>Logo de la marca</b><small>El de tu cámara, si Metadat lo conoce</small></div><button class="tog ${S.showLogo ? 'on' : ''}" id="aLo"><i></i></button></div>
          <button class="row tap soft" id="aCuC"><div class="t"><b>Logo propio para marcos claros</b><small>PNG con fondo transparente. Si no pones ninguno, se usa la manzana</small></div><span class="v">${CUSTOM.claro ? 'Quitar' : 'Elegir'}</span><span class="chev">${ic('chev', 18)}</span></button>
          <button class="row tap soft" id="aCuO"><div class="t"><b>Logo propio para marcos oscuros</b></div><span class="v">${CUSTOM.oscuro ? 'Quitar' : 'Elegir'}</span><span class="chev">${ic('chev', 18)}</span></button>
        </div>
        <div class="glab">Tus números</div><div class="group"><div class="row"><div class="t"><b>Fotos exportadas</b></div><span class="v disp" id="aCount" style="color:var(--haluro);font-size:20px">0</span></div></div>
        <div class="glab">Copia de seguridad</div><div class="group">
          <button class="row tap soft" id="aBk"><div class="t"><b>Descargar copia</b><small>Ajustes, recetas y carretes</small></div><span class="chev">${ic('down', 18)}</span></button>
          <button class="row tap soft" id="aRs"><div class="t"><b>Restaurar una copia</b></div><span class="chev">${ic('chev', 18)}</span></button></div>
        <p class="foot">Metadat, versión ${VERSION}<br>Las fotos no salen de tu móvil. Solo se consulta el nombre del lugar a partir de las coordenadas.</p></div></div>`;
      $('#aDark', v).onclick = e => { S.darkComp = !S.darkComp; saveS(); e.currentTarget.classList.toggle('on', S.darkComp); };
      $('#aLo', v).onclick = e => { S.showLogo = !S.showLogo; saveS(); e.currentTarget.classList.toggle('on', S.showLogo); };
      $('#aFr', v).onclick = () => pickList('Marco por defecto', FR.map(x => ({ v: x.id, l: x.name, d: x.desc })), S.frame, x => { S.frame = x; saveS(); draw(); });
      $('#aTh', v).onclick = () => pickList('Tema por defecto', [{ v: 'claro', l: 'Claro' }, { v: 'oscuro', l: 'Oscuro' }], S.theme, x => { S.theme = x; saveS(); draw(); });
      $('#aTs', v).onclick = () => pickList('Tamaño de los datos', TSIZES.map(([x, l]) => ({ v: String(x), l })), String((TSIZES.find(t => Math.abs(t[0] - S.ts) < .01) || TSIZES[1])[0]), x => { S.ts = +x; saveS(); draw(); });
      $('#aCam', v).onclick = () => askText('Mi cámara', S.defCam, x => { S.defCam = x; saveS(); draw(); }, { sub: 'Solo se usa cuando la foto llega sin datos de cámara. Déjalo vacío para no usar ninguna.', sugg: ['iPhone 13 Pro'] });
      $('#aSi', v).onclick = () => askText('Tu firma', S.sign, x => { S.sign = x; saveS(); draw(); }, { placeholder: 'Tu nombre', sub: 'Aparece en los marcos Firma, Revista, Museo y otros' });
      const setLogo = k => async () => { if (CUSTOM[k]) { CUSTOM[k] = null; LS.set('logo_' + k, null); draw(); return; } const f = await pickOne(); if (!f) return; const p = await readPhoto(f); const c = document.createElement('canvas'); const kk = Math.min(1, 400 / p.img.naturalHeight); c.width = p.img.naturalWidth * kk; c.height = p.img.naturalHeight * kk; c.getContext('2d').drawImage(p.img, 0, 0, c.width, c.height); const url = c.toDataURL('image/png'); LS.set('logo_' + k, url); CUSTOM[k] = await loadImg(url); draw(); toast('Logo guardado'); };
      $('#aCuC', v).onclick = setLogo('claro'); $('#aCuO', v).onclick = setLogo('oscuro');
      $('#aBk', v).onclick = async () => { const data = { app: 'metadat', version: VERSION, settings: S, recipes: LS.get('recipes', []), rolls: LS.get('rolls', []), count: COUNT }; const d = new Date(); await shareFiles([new File([JSON.stringify(data, null, 1)], `metadat_copia_${d.getFullYear()}-${n2(d.getMonth() + 1)}-${n2(d.getDate())}.json`, { type: 'application/json' })]); };
      $('#aRs', v).onclick = () => { const i = $('#fileAny'); i.value = ''; i.onchange = async () => { try { const j = JSON.parse(await i.files[0].text()); if (j.app !== 'metadat') throw 0; Object.assign(S, j.settings || {}); saveS(); LS.set('recipes', j.recipes || []); LS.set('rolls', j.rolls || []); COUNT = j.count || COUNT; LS.set('count', COUNT); draw(); toast('Copia restaurada'); } catch (e) { toast('Ese archivo no es una copia de Metadat'); } }; i.click(); };
      countUp($('#aCount', v), COUNT);
    };
    draw(); show(v.id);
  }
  function countUp(el, to) { if (RM || to < 2) { el.textContent = to; return; } const t0 = performance.now(), D = 900; const f = t => { const k = Math.min(1, (t - t0) / D), e = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(to * e); if (k < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); }

  // ------------------------------------------------------------ inicio
  function renderHome() {
    const last = LS.get('last', null), b = $('#homeBody');
    const dt = last && last.dt ? new Date(last.dt) : null;
    const when = dt ? `${dt.getDate()} ${MES[dt.getMonth()]} ${dt.getFullYear()}, ${n2(dt.getHours())}:${n2(dt.getMinutes())}` : '';
    b.innerHTML = `<div class="stagger">
      <div class="hero">${last ? `<div class="last"><img src="${last.th}" alt=""><div><b>Tu última foto</b><small>${esc(J([when, last.cam]) || 'Sin datos')}</small></div></div>
        <div class="meta"><div><small>Cámara</small><b>${esc(last.cam || '—')}</b></div><div><small>Tamaño</small><b>${last.w ? last.w + ' × ' + last.h : '—'}</b></div></div>
        <div class="btn2"><button class="btn ghost tap" id="hLast">Seguir con ella</button><button class="btn tap" id="hPick">Otra foto</button></div>`
        : `<button class="pick tap soft" id="hPick"><span class="ico">${ic('image', 26)}</span><b>Elige una foto</b><small>Metadat lee sus datos y los pone en un marco. Todo ocurre en tu móvil.</small></button>`}</div>
      <div class="sec">Herramientas<small>${Object.values(TOOLS).filter(t => t.isNew).length} nuevas</small></div>
      <div class="tools">${Object.entries(TOOLS).filter(([, t]) => !t.hidden).map(([k, t]) => `<button class="tool tap" data-go="${k}"><span class="ti">${ic(t.icon, 20)}</span><span><b>${t.name}</b><small>${t.sub}</small></span>${t.isNew ? '<i class="new"></i>' : ''}</button>`).join('')}</div>
      <p class="foot">${COUNT ? `Has exportado ${COUNT} foto${COUNT === 1 ? '' : 's'}. ` : ''}El punto azul marca lo nuevo.</p></div>`;
    if (renderHome.done) { b.firstElementChild.classList.remove('stagger'); }
    else { const d0 = $('#intro') && !RM && !window.__metadatSinIntro ? 1500 : 0; $$('.stagger > *', b).forEach((e, i) => e.style.animationDelay = (d0 + i * 70) + 'ms'); $$('.tool', b).forEach((e, i) => { e.style.opacity = 0; e.style.transform = 'translateY(10px)'; e.style.animation = `up .55s var(--entrar) ${d0 + 200 + i * 45}ms forwards`; }); }
    renderHome.done = true;
    $('#hPick').onclick = async () => { const f = await pickOne(); if (f) openComposer(f); };
    const hl = $('#hLast'); if (hl) hl.onclick = async () => { const f = await DB.get('lastFile'); if (f) openComposer(f); else { toast('Ya no está guardada. Elígela otra vez'); const ff = await pickOne(); if (ff) openComposer(ff); } };
  }

  // ------------------------------------------------------------ arranque
  fillIcons();
  function intro() {
    const el = $('#intro');
    if (!el) return;
    if (RM || window.__metadatSinIntro) { el.remove(); return; }
    const w = $('#introW'), ex = $('#introEx');
    w.insertAdjacentHTML('afterbegin', 'metadat'.split('').map((c, i) => `<span class="l" style="--i:${i}">${c}</span>`).join(''));
    w.style.marginLeft = (-w.offsetWidth / 2) + 'px';
    ex.innerHTML = 'F/<span id="xa" style="width:2.4em"></span> ·  1/<span id="xb" style="width:3.4em"></span> ·  ISO <span id="xc" style="width:2.6em"></span>';
    const F = ['2,8', '4', '5,6', '8', '2', '1,8'], Sx = ['60', '250', '500', '1000', '30', '125'], N = ['400', '200', '800', '1600', '64', '100']; let k = 0;
    const t = setInterval(() => { $('#xa').textContent = k < 9 ? F[k % 5] : F[5]; $('#xb').textContent = k < 11 ? Sx[(k + 2) % 5] : Sx[5]; $('#xc').textContent = k < 13 ? N[(k + 1) % 5] : N[5]; if (++k > 14) clearInterval(t); }, 75);
    let done = false;
    const fly = () => {
      if (done || !el.isConnected) return; done = true; clearInterval(t);
      // el nombre vuela exactamente al sitio del nombre de la cabecera
      const a = w.getBoundingClientRect(), tg = $('.home-top .word').getBoundingClientRect(), sc = 30 / 46;
      w.style.transformOrigin = '0 0'; w.style.transition = 'transform .7s cubic-bezier(.5,0,.1,1)';
      w.style.transform = `translate(${tg.left - a.left}px,${tg.top - a.top}px) scale(${sc})`;
      el.classList.add('fly'); setTimeout(() => { el.classList.add('end'); setTimeout(() => el.remove(), 220); }, 760);
    };
    setTimeout(fly, 1650); el.onclick = fly;
  }
  document.fonts && document.fonts.load('600 30px MInterD').then(() => { }).catch(() => { });
  Promise.all(['400 16px MInter', '500 16px MInter', '600 16px MInter', '300 40px MInterD', '600 30px MInterD', '400 30px MLora', 'italic 400 30px MLoraI', '400 16px MMono'].map(f => document.fonts ? document.fonts.load(f) : 0)).catch(() => { }).finally(() => { if (C.cvs) drawStage(); });
  renderHome(); intro();
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => { });
  window.__metadat = { openComposer, S, FR, toolOpen: openTool, back, renderFrame: (id, th, w = 1080) => MetaFrames.render(FR.find(f => f.id === id), C.P, dataNow(), opts(th), w) };
})();
