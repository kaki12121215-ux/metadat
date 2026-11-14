/* Metadat · lector de metadatos EXIF (JPEG y HEIC), sin librerías. Todo ocurre en el móvil. */
(function () {
  const TAGS = {
    0x010F: 'Make', 0x0110: 'Model', 0x0112: 'Orientation', 0x0131: 'Software', 0x0132: 'DateTime',
    0x8769: 'ExifIFD', 0x8825: 'GPSIFD',
    0x829A: 'ExposureTime', 0x829D: 'FNumber', 0x8827: 'ISO', 0x9003: 'DateTimeOriginal', 0x9011: 'OffsetTimeOriginal',
    0x920A: 'FocalLength', 0xA405: 'FocalLength35', 0xA434: 'LensModel', 0xA433: 'LensMake',
    0xA002: 'PixelX', 0xA003: 'PixelY', 0x9209: 'Flash', 0xA402: 'ExposureMode', 0x9204: 'ExposureBias'
  };
  const GPS = { 1: 'LatRef', 2: 'Lat', 3: 'LonRef', 4: 'Lon', 5: 'AltRef', 6: 'Alt' };

  function findTiff(dv) {
    const n = dv.byteLength;
    // JPEG: buscar APP1 Exif
    if (dv.getUint16(0) === 0xFFD8) {
      let o = 2;
      while (o < n - 4) {
        if (dv.getUint8(o) !== 0xFF) { o++; continue; }
        const m = dv.getUint8(o + 1), len = dv.getUint16(o + 2);
        if (m === 0xE1 && dv.getUint32(o + 4) === 0x45786966) return o + 10;
        if (m === 0xDA) break;
        o += 2 + len;
      }
    }
    // Genérico (HEIC y otros): buscar "Exif\0\0" seguido de cabecera TIFF
    const lim = Math.min(n - 12, 4 * 1024 * 1024);
    for (let i = 0; i < lim; i++) {
      if (dv.getUint32(i) === 0x45786966 && dv.getUint16(i + 4) === 0) {
        const t = i + 6, b = dv.getUint16(t);
        if ((b === 0x4949 || b === 0x4D4D)) return t;
      }
    }
    for (let i = 0; i < lim; i++) {
      const b = dv.getUint16(i);
      if ((b === 0x4949 && dv.getUint16(i + 2, true) === 42) || (b === 0x4D4D && dv.getUint16(i + 2) === 42)) return i;
    }
    return -1;
  }

  function readIFD(dv, t, off, le, map, out) {
    if (t + off + 2 > dv.byteLength) return;
    const cnt = dv.getUint16(t + off, le);
    for (let i = 0; i < cnt; i++) {
      const e = t + off + 2 + i * 12;
      if (e + 12 > dv.byteLength) break;
      const tag = dv.getUint16(e, le), type = dv.getUint16(e + 2, le), num = dv.getUint32(e + 4, le);
      const name = map[tag];
      if (!name) continue;
      const size = [0, 1, 1, 2, 4, 8, 1, 1, 2, 4, 8, 4, 8][type] || 1;
      const vo = size * num > 4 ? t + dv.getUint32(e + 8, le) : e + 8;
      let v;
      try {
        if (type === 2) { v = ''; for (let k = 0; k < num - 1 && vo + k < dv.byteLength; k++) v += String.fromCharCode(dv.getUint8(vo + k)); v = v.replace(/\0+$/, '').trim(); }
        else if (type === 3) v = num === 1 ? dv.getUint16(vo, le) : Array.from({ length: num }, (_, k) => dv.getUint16(vo + 2 * k, le));
        else if (type === 4) v = dv.getUint32(vo, le);
        else if (type === 9) v = dv.getInt32(vo, le);
        else if (type === 5 || type === 10) {
          const rd = k => { const a = type === 5 ? dv.getUint32(vo + 8 * k, le) : dv.getInt32(vo + 8 * k, le); const b = type === 5 ? dv.getUint32(vo + 8 * k + 4, le) : dv.getInt32(vo + 8 * k + 4, le); return b ? a / b : 0; };
          v = num === 1 ? rd(0) : Array.from({ length: num }, (_, k) => rd(k));
        } else if (type === 1 || type === 7) v = dv.getUint8(vo);
      } catch (x) { continue; }
      out[name] = v;
    }
  }

  function parse(buf) {
    const dv = new DataView(buf);
    const t = findTiff(dv);
    if (t < 0) return {};
    const le = dv.getUint16(t) === 0x4949;
    const out = {};
    readIFD(dv, t, dv.getUint32(t + 4, le), le, TAGS, out);
    if (out.ExifIFD) readIFD(dv, t, out.ExifIFD, le, TAGS, out);
    if (out.GPSIFD) {
      const g = {}; readIFD(dv, t, out.GPSIFD, le, GPS, g);
      const dms = a => Array.isArray(a) ? a[0] + a[1] / 60 + a[2] / 3600 : a;
      if (g.Lat && g.Lon) {
        out.lat = dms(g.Lat) * (g.LatRef === 'S' ? -1 : 1);
        out.lon = dms(g.Lon) * (g.LonRef === 'W' ? -1 : 1);
        if (!isFinite(out.lat) || !isFinite(out.lon) || (out.lat === 0 && out.lon === 0)) { delete out.lat; delete out.lon; }
      }
      if (typeof g.Alt === 'number') out.alt = g.Alt;
    }
    delete out.ExifIFD; delete out.GPSIFD;
    return out;
  }

  window.MetaExif = { parse };
})();
