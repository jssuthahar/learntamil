/* Learn Tamil — certificates: 🖼 drawing the certificates and the tiny PDF writer.
   One copy, used in three places: the letter-level certificates (certificate.js), the Thirukkural certificates
   (kural-cert.js) and the "Check a certificate" page (verify-share.js), which redraws a checked certificate so anyone
   who scans its QR code can download it. So this file needs only TEXT (data/messages.js), QR (core/qr.js) and
   CertRecord (cert-record.js); everything else comes in as arguments.
   Certificates are drawn on a 2339 × 1654 canvas (A4 landscape, about 200 dpi): the browser shapes Tamil text correctly. */
'use strict';
const CertDraw = (() => {
  const W0 = 2339, H0 = 1654;
  const fill = (s, vars) => String(s).replace(/\{(\w+)\}/g, (m, k) => k in vars ? vars[k] : m);
  const fmtDate = d => new Date(d + (String(d).length === 10 ? 'T12:00' : '')).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const hasScore = (s, t) => typeof s === 'number' && typeof t === 'number' && t > 0;

  function fitText(g, text, x, y, maxW, size, weight, family, color){
    g.font = `${weight} ${size}px ${family}`;
    while (g.measureText(text).width > maxW && size > 24){ size -= 2; g.font = `${weight} ${size}px ${family}`; }
    g.fillStyle = color; g.fillText(text, x, y);
  }
  function roundRect(g, x, y, w, h, r){ g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }

  /* Letter-level certificate.
     L: a CERT_LEVELS entry (n, ic, ta, title, titleEn, en, total). c: { name, date: 'YYYY-MM-DD', id, score?, total? }.
     opts.qr: draw the "scan to check" QR code (only for a certificate that can be checked). No score → no score pill. */
  async function letters(cv, L, c, opts = {}){
    try { await Promise.all(['800 90px "Baloo Thambi 2"', '700 60px "Noto Sans Tamil"', '600 40px "Inter"'].map(f => document.fonts.load(f, 'அஆa'))); } catch (e) {}
    const g = cv.getContext('2d'), W = cv.width, H = cv.height;
    const kid = '"Baloo Thambi 2","Noto Sans Tamil",sans-serif', ta = '"Noto Sans Tamil",sans-serif', ui = '"Inter","Segoe UI",sans-serif';
    // background
    const bg = g.createLinearGradient(0, 0, W, H); bg.addColorStop(0, '#eef7ff'); bg.addColorStop(0.55, '#fffaf0'); bg.addColorStop(1, '#fff1e0');
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    const blob = (x, y, r, col) => { const rg = g.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, col); rg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = rg; g.fillRect(x - r, y - r, r * 2, r * 2); };
    blob(0, 0, 700, 'rgba(23,105,209,.18)'); blob(W, 0, 650, 'rgba(255,205,86,.35)'); blob(W, H, 700, 'rgba(255,138,101,.22)'); blob(0, H, 600, 'rgba(76,194,176,.2)');
    // faint floating letters
    g.save(); g.globalAlpha = 0.07; g.fillStyle = '#1769d1'; g.font = `800 150px ${kid}`;
    [['அ', 180, 360], ['க', 2050, 400], ['ழ', 230, 1420], ['ஆ', 2080, 1400], ['ம', 1150, 1560], ['இ', 1700, 260]].forEach(([l, x, y]) => g.fillText(l, x, y)); g.restore();
    // rainbow border
    const bd = g.createLinearGradient(0, 0, W, 0); ['#1769d1', '#7c3aed', '#ff5e7e', '#ff8a3d', '#2eb67d'].forEach((col, i) => bd.addColorStop(i / 4, col));
    g.lineWidth = 34; g.strokeStyle = bd; roundRect(g, 60, 60, W - 120, H - 120, 70); g.stroke();
    g.lineWidth = 4; g.strokeStyle = 'rgba(23,105,209,.35)'; g.setLineDash([18, 16]); roundRect(g, 110, 110, W - 220, H - 220, 50); g.stroke(); g.setLineDash([]);
    // corner decorations (a QR code takes the parrot's corner)
    const qr = !!opts.qr;
    g.font = `110px ${ui}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('⭐', 210, 220); g.fillText('🌟', W - 210, 220); g.fillText('🎈', 210, H - 230); if (!qr) g.fillText('🦜', W - 220, H - 240);
    // header
    g.fillStyle = '#0b1020'; g.font = `700 40px ${ui}`; g.fillText('LEARN TAMIL · MSDEVBUILD', W / 2, 230);
    const tg = g.createLinearGradient(W / 2 - 500, 0, W / 2 + 500, 0); tg.addColorStop(0, '#1769d1'); tg.addColorStop(0.55, '#7c3aed'); tg.addColorStop(1, '#e0480c');
    g.fillStyle = tg; g.font = `800 150px ${kid}`; g.fillText(TEXT.certificate.title, W / 2, 390);
    g.fillStyle = '#3b4256'; g.font = `600 52px ${ui}`; g.fillText('Certificate of Achievement', W / 2, 510);
    // presented to
    g.font = `500 40px ${ta}`; g.fillStyle = '#4a5163'; g.fillText(TEXT.certificate.presented, W / 2, 620);
    // name (shrink to fit)
    let size = 130; g.font = `800 ${size}px ${kid}`;
    while (g.measureText(c.name).width > W - 700 && size > 60){ size -= 6; g.font = `800 ${size}px ${kid}`; }
    g.fillStyle = '#0b1020'; g.fillText(c.name, W / 2, 770);
    g.strokeStyle = '#ffb020'; g.lineWidth = 6; g.beginPath(); g.moveTo(W / 2 - 600, 850); g.lineTo(W / 2 + 600, 850); g.stroke();
    // level
    g.fillStyle = '#4a5163'; g.font = `500 40px ${ui}`; g.fillText('for successfully completing', W / 2, 935);
    fitText(g, `${L.ic}  ${TEXT.certificate.level} ${L.n} · ${L.ta}`, W / 2, 1050, W - 500, 82, '800', kid, '#1769d1');
    fitText(g, `${L.title} · Level ${L.n} ${L.titleEn} — ${L.en}`, W / 2, 1150, W - 500, 50, '700', kid, '#e0480c');
    // score pill
    const outOf = c.total || L.total || 10;
    if (hasScore(c.score, outOf)){
      const pill = `Score ${c.score}/${outOf}  ·  ${Math.round(c.score / outOf * 100)}%`;
      g.font = `800 44px ${ui}`; const pw = g.measureText(pill).width + 90;
      g.fillStyle = '#fff3c4'; roundRect(g, W / 2 - pw / 2, 1205, pw, 84, 42); g.fill();
      g.fillStyle = '#7a5600'; g.fillText(pill, W / 2, 1249);
    }
    // footer: date, medal, certificate ID (no signature)
    const idX = qr ? W - 720 : W - 560;   // with a QR code in the corner, the ID column moves left to make room
    g.fillStyle = '#0b1020'; g.font = `700 40px ${ui}`; g.fillText(fmtDate(c.date), 560, 1395); g.fillText(c.id, idX, 1395);
    g.fillStyle = '#4a5163'; g.font = `500 32px ${ui}`; g.fillText(TEXT.certificate.date, 560, 1450); g.fillText(TEXT.certificate.id, idX, 1450);
    g.font = `190px ${ui}`; g.fillText('🏅', W / 2, 1400);
    if (qr) CertRecord.drawVerifyQR(g, c.id, W - 340, H - 480, 200, TEXT.certificate.verify.scan, true);   // 180 px, above the footer line
    g.fillStyle = '#6b7385'; g.font = `500 28px ${ui}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('Learn Tamil · MSDEVBUILD  ·  learntamil.msdevbuild.com', W / 2, H - 150);
  }

  /* Thirukkural certificate.
     X: { kind: 'level' | 'chapter', id, L (a KURAL_LEVELS entry, for a level), total }.
     rec: { d: 'YYYY-MM-DD', s: score or null, id }. k: { chapter: [Tamil, English] (for a chapter), couplet: [line 1, line 2] }.
     opts.qr: draw the "scan to check" QR code. */
  async function kural(cv, X, name, rec, k, opts = {}){
    try { await Promise.all(['800 90px "Noto Sans Tamil"', '600 60px "Noto Sans Tamil"'].map(f => document.fonts.load(f))); } catch (e) {}
    const C = TEXT.kural.cert;
    const g = cv.getContext('2d'), W = cv.width, H = cv.height, TA = '"Noto Sans Tamil","Latha","Tamil Sangam MN",sans-serif';
    g.textBaseline = 'alphabetic';
    const text = (s, y, size, color = '#3b2a12', weight = 600) => { g.font = `${weight} ${size}px ${TA}`; g.fillStyle = color; g.textAlign = 'center';
      while (g.measureText(s).width > W - 360 && size > 20){ size -= 2; g.font = `${weight} ${size}px ${TA}`; } g.fillText(s, W / 2, y); };
    const bg = g.createLinearGradient(0, 0, W, H); bg.addColorStop(0, '#fff8e6'); bg.addColorStop(1, '#fdebc8');
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    g.strokeStyle = '#0b8a6c'; g.lineWidth = 26; g.strokeRect(60, 60, W - 120, H - 120);
    g.strokeStyle = '#c9952b'; g.lineWidth = 6; g.strokeRect(110, 110, W - 220, H - 220);
    const lvl = X.kind === 'level' ? X.L : null, from = lvl ? lvl.from : X.id * 10 - 9, to = lvl ? lvl.to : X.id * 10;
    g.font = `130px ${TA}`; g.textAlign = 'center'; g.fillText(lvl ? lvl.ic : '📜', W / 2, 300);
    text(C.heading, 430, 92, '#0b5f4b', 800);
    text(C.presented, 560, 44, '#5b4a2e', 600);
    text(name || '…………………………', 720, 120, '#1f1a12', 800);
    g.strokeStyle = '#c9952b'; g.lineWidth = 4; g.beginPath(); g.moveTo(W / 2 - 600, 760); g.lineTo(W / 2 + 600, 760); g.stroke();
    if (lvl){
      text(fill(C.forLevel, { n: lvl.n }), 860, 50, '#5b4a2e');
      text(`${lvl.ta} · ${lvl.en}`, 965, 84, '#0b5f4b', 800);
    } else {
      text(fill(C.forChapter, { n: X.id }), 860, 50, '#5b4a2e');
      text(`${k.chapter[0]} · ${k.chapter[1]}`, 965, 74, '#0b5f4b', 800);
    }
    text(fill(C.kurals, { from, to }), 1045, 42, '#5b4a2e');
    const [l1, l2] = k.couplet;
    text(`“${l1}`, 1175, 50, '#3b2a12', 700); text(`${l2}”`, 1245, 50, '#3b2a12', 700);
    g.font = `600 36px ${TA}`; g.fillStyle = '#5b4a2e';
    g.textAlign = 'left'; g.fillText(`${TEXT.certificate.date}: ${rec.d}`, 200, H - 230);
    if (typeof rec.s === 'number') g.fillText(`${C.score[0]} · ${C.score[1]}: ${rec.s}/${X.total}`, 200, H - 180);
    g.textAlign = 'right'; g.fillText(`${TEXT.certificate.id}: ${rec.id}`, W - 200, H - 230);
    g.fillText('Learn Tamil · learntamil.msdevbuild.com', W - 200, H - 180);
    if (opts.qr) CertRecord.drawVerifyQR(g, rec.id, W / 2 - 90, H - 364, 180, TEXT.certificate.verify.scan, true);
  }

  /* ---------- tiny PDF writer: one A4 landscape page with the certificate as a JPEG ---------- */
  function jpegToPdf(jpeg, w, h, title){
    const enc = new TextEncoder(), parts = [], offs = []; let len = 0;
    const add = d => { const b = typeof d === 'string' ? enc.encode(d) : d; parts.push(b); len += b.length; };
    const obj = (n, body) => { offs[n] = len; add(`${n} 0 obj\n`); body(); add('\nendobj\n'); };
    const pdfStr = s => '(' + s.replace(/[\\()]/g, '\\$&').replace(/[^\x20-\x7e]/g, '') + ')';
    const PW = 842, PH = 595;   // A4 landscape in points
    add('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
    obj(1, () => add('<< /Type /Catalog /Pages 2 0 R >>'));
    obj(2, () => add('<< /Type /Pages /Kids [3 0 R] /Count 1 >>'));
    obj(3, () => add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PW} ${PH}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`));
    obj(4, () => { add(`<< /Type /XObject /Subtype /Image /Width ${w} /Height ${h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`); add(jpeg); add('\nendstream'); });
    const content = `q ${PW} 0 0 ${PH} 0 0 cm /Im0 Do Q`;
    obj(5, () => add(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`));
    obj(6, () => add(`<< /Title ${pdfStr(title)} /Author (Learn Tamil - MSDEVBUILD) /Creator (Learn Tamil) >>`));
    const xref = len;
    add(`xref\n0 7\n0000000000 65535 f \n${offs.slice(1).map(o => String(o).padStart(10, '0') + ' 00000 n \n').join('')}`);
    add(`trailer\n<< /Size 7 /Root 1 0 R /Info 6 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
    return new Blob(parts, { type: 'application/pdf' });
  }
  /* The drawn canvas as a PDF Blob. */
  const pdfOf = (cv, title) => new Promise(res => cv.toBlob(async b => res(jpegToPdf(new Uint8Array(await b.arrayBuffer()), cv.width, cv.height, title)), 'image/jpeg', 0.92));
  const pngOf = cv => new Promise(res => cv.toBlob(res, 'image/png'));
  const canvas = () => { const cv = document.createElement('canvas'); cv.width = W0; cv.height = H0; return cv; };

  return { letters, kural, jpegToPdf, pdfOf, pngOf, canvas, fitText, roundRect };
})();
