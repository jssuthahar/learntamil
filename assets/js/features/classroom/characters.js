/* Learn Tamil — classroom: 👩‍🏫 the characters.
   Malar Akka (the teacher) and three classmates, drawn as inline SVG so they stay sharp, light and offline.
   Each drawing has named parts that CSS moves (features/classroom → 90-kids.css "Classroom"):
   .cr-arm-l / .cr-arm-r (gestures), .cr-eyes (blink), .cr-eyes-happy, .cr-mouth-smile / .cr-mouth-open (talking), .cr-head (tilt).
   States are classes on the wrapper: talk, wave, point, open, happy, raise, cheer. No text here: names are in TEXT.classroom. */
'use strict';

const CRArt = (() => {
  const face = (cx, cy, s, skin) => {
    const e = 16 * s, ey = cy + 2 * s;
    return `<g class="cr-eyes" style="transform-origin:${cx}px ${ey}px">
        <ellipse cx="${cx - e}" cy="${ey}" rx="${6.5 * s}" ry="${7.5 * s}" fill="#fff"/><ellipse cx="${cx + e}" cy="${ey}" rx="${6.5 * s}" ry="${7.5 * s}" fill="#fff"/>
        <circle class="cr-pupil" cx="${cx - e + s}" cy="${ey + s}" r="${4.2 * s}" fill="#2a1a12"/><circle class="cr-pupil" cx="${cx + e + s}" cy="${ey + s}" r="${4.2 * s}" fill="#2a1a12"/>
        <circle cx="${cx - e + 2.6 * s}" cy="${ey - 1.4 * s}" r="${1.5 * s}" fill="#fff"/><circle cx="${cx + e + 2.6 * s}" cy="${ey - 1.4 * s}" r="${1.5 * s}" fill="#fff"/>
      </g>
      <g class="cr-eyes-happy" fill="none" stroke="#2a1a12" stroke-width="${2.6 * s}" stroke-linecap="round">
        <path d="M${cx - e - 6 * s} ${ey + 2 * s} Q${cx - e} ${ey - 6 * s} ${cx - e + 6 * s} ${ey + 2 * s}"/><path d="M${cx + e - 6 * s} ${ey + 2 * s} Q${cx + e} ${ey - 6 * s} ${cx + e + 6 * s} ${ey + 2 * s}"/>
      </g>
      <g fill="none" stroke="#3a2418" stroke-width="${2.2 * s}" stroke-linecap="round" class="cr-brows">
        <path d="M${cx - e - 7 * s} ${ey - 12 * s} Q${cx - e} ${ey - 16 * s} ${cx - e + 7 * s} ${ey - 12 * s}"/><path d="M${cx + e - 7 * s} ${ey - 12 * s} Q${cx + e} ${ey - 16 * s} ${cx + e + 7 * s} ${ey - 12 * s}"/>
      </g>
      <circle cx="${cx - e - 6 * s}" cy="${ey + 14 * s}" r="${5.5 * s}" fill="#ff7a8a" opacity=".35"/><circle cx="${cx + e + 6 * s}" cy="${ey + 14 * s}" r="${5.5 * s}" fill="#ff7a8a" opacity=".35"/>
      <path d="M${cx - 2 * s} ${ey + 8 * s} Q${cx} ${ey + 12 * s} ${cx + 3 * s} ${ey + 9 * s}" fill="none" stroke="${shade(skin)}" stroke-width="${1.8 * s}" stroke-linecap="round"/>
      <path class="cr-mouth-smile" d="M${cx - 9 * s} ${ey + 18 * s} Q${cx} ${ey + 27 * s} ${cx + 9 * s} ${ey + 18 * s}" fill="none" stroke="#7a2531" stroke-width="${2.6 * s}" stroke-linecap="round"/>
      <g class="cr-mouth-open" style="transform-origin:${cx}px ${ey + 21 * s}px">
        <ellipse cx="${cx}" cy="${ey + 21 * s}" rx="${7.5 * s}" ry="${6 * s}" fill="#7a2531"/><ellipse cx="${cx}" cy="${ey + 24 * s}" rx="${4.5 * s}" ry="${2.4 * s}" fill="#ff8d9b"/>
      </g>`;
  };
  // A slightly darker skin tone for the nose line.
  function shade(hex){ const n = parseInt(hex.slice(1), 16), f = c => Math.round(c * .72);
    return '#' + [n >> 16, (n >> 8) & 255, n & 255].map(f).map(c => c.toString(16).padStart(2, '0')).join(''); }
  // An arm hanging from (x, y): sleeve, skin, hand. Rotated by CSS around the shoulder.
  const arm = (cls, x, y, len, w, sleeve, sleeveLen, skin, extra = '') =>
    `<g class="${cls}" style="transform-origin:${x}px ${y}px">
      <rect x="${x - w / 2}" y="${y - 2}" width="${w}" height="${len}" rx="${w / 2}" fill="${skin}"/>
      <rect x="${x - w / 2 - 1}" y="${y - 4}" width="${w + 2}" height="${sleeveLen}" rx="${w / 2}" fill="${sleeve}"/>
      ${extra}<circle cx="${x}" cy="${y + len}" r="${w * .62}" fill="${skin}"/>
    </g>`;

  /* Malar Akka: long braid, pink kurta with a yellow dupatta, a pointer stick in her right hand. viewBox 200×360. */
  function teacher(){
    const skin = '#c98a5e', hair = '#24150e', kurta = '#e8508a', dup = '#ffc83d';
    return `<svg class="cr-svg" viewBox="0 0 200 360" aria-hidden="true" focusable="false">
      <ellipse cx="100" cy="346" rx="62" ry="9" fill="#000" opacity=".12"/>
      <g class="cr-body">
        <g fill="${hair}">${[0, 1, 2, 3, 4, 5, 6].map(i => `<ellipse cx="${138 + i * 1.6}" cy="${110 + i * 19}" rx="${10 - i * .5}" ry="12"/>`).join('')}</g>
        <circle cx="${150}" cy="${246}" r="5" fill="#ff5b8a"/>
        <rect x="74" y="266" width="22" height="66" rx="9" fill="#4a3a78"/><rect x="104" y="266" width="22" height="66" rx="9" fill="#4a3a78"/>
        <ellipse cx="82" cy="336" rx="16" ry="7" fill="#b2384f"/><ellipse cx="118" cy="336" rx="16" ry="7" fill="#b2384f"/>
        <path d="M60 144 Q100 128 140 144 L158 272 Q100 286 42 272 Z" fill="${kurta}"/>
        <path d="M54 236 Q100 250 148 236 L150 248 Q100 262 52 248Z" fill="#fff" opacity=".35"/>
        <rect x="90" y="116" width="20" height="24" rx="6" fill="${skin}"/>
        <path d="M62 146 Q100 168 140 146 L146 162 Q100 186 58 164Z" fill="${dup}"/>
        ${arm('cr-arm cr-arm-l', 62, 152, 74, 17, kurta, 34, skin)}
        ${arm('cr-arm cr-arm-r', 138, 152, 74, 17, kurta, 34, skin,
          `<line x1="138" y1="${152 + 74}" x2="138" y2="${152 + 150}" stroke="#8a5a2b" stroke-width="4" stroke-linecap="round"/><circle cx="138" cy="${152 + 150}" r="4" fill="#ffd34d"/>`)}
        <g class="cr-head" style="transform-origin:100px 118px">
          <circle cx="58" cy="86" r="7" fill="${skin}"/><circle cx="142" cy="86" r="7" fill="${skin}"/>
          <circle cx="58" cy="97" r="3.4" fill="#f2b705"/><circle cx="142" cy="97" r="3.4" fill="#f2b705"/>
          <circle cx="100" cy="82" r="42" fill="${skin}"/>
          <path d="M56 86 Q52 30 100 32 Q150 30 145 88 Q138 56 112 50 Q96 64 66 62 Q58 72 56 86Z" fill="${hair}"/>
          <circle cx="100" cy="60" r="2.6" fill="#d61f3c"/>
          ${face(100, 82, 1, skin)}
        </g>
      </g>
    </svg>`;
  }

  /* The three classmates. viewBox 120×200. */
  const KIDS = [
    { skin: '#a86a43', hair: '#1e130c', shirt: '#ffc93c', low: '#ff7a59', style: 'pigtails' },   // Nila
    { skin: '#8d5532', hair: '#140c08', shirt: '#22b8a7', low: '#2c3e7a', style: 'short' },      // Kavin
    { skin: '#c48555', hair: '#2a1810', shirt: '#9b6bff', low: '#9b6bff', style: 'bob' }         // Yazhini
  ];
  function kid(i){
    const k = KIDS[i], { skin, hair, shirt, low } = k;
    const back = k.style === 'pigtails' ? `<circle cx="22" cy="58" r="13" fill="${hair}"/><circle cx="98" cy="58" r="13" fill="${hair}"/><circle cx="30" cy="48" r="4" fill="#ff5b8a"/><circle cx="90" cy="48" r="4" fill="#ff5b8a"/>`
      : k.style === 'bob' ? `<path d="M24 60 Q20 18 60 20 Q100 18 96 60 L98 84 Q90 92 84 80 L36 80 Q30 92 22 84Z" fill="${hair}"/>` : '';
    const top = k.style === 'short' ? `<path d="M27 56 Q24 20 60 22 Q96 20 93 56 Q88 40 70 38 Q60 46 40 42 Q30 46 27 56Z" fill="${hair}"/>`
      : k.style === 'bob' ? `<path d="M27 56 Q30 26 60 26 Q90 26 93 56 Q80 40 60 42 Q42 38 27 56Z" fill="${hair}"/><circle cx="84" cy="34" r="6" fill="#ffd34d"/><circle cx="84" cy="34" r="2.4" fill="#ff7a59"/>`
      : `<path d="M27 58 Q26 22 60 24 Q94 22 93 58 Q84 38 60 40 Q36 38 27 58Z" fill="${hair}"/>`;
    const lower = k.style === 'short' ? `<rect x="36" y="154" width="48" height="20" rx="6" fill="${low}"/>`
      : `<path d="M30 150 L90 150 L96 176 L24 176Z" fill="${low}"/>`;
    return `<svg class="cr-svg" viewBox="0 0 120 200" aria-hidden="true" focusable="false">
      <ellipse cx="60" cy="194" rx="34" ry="5" fill="#000" opacity=".12"/>
      <g class="cr-body">
        <rect x="42" y="168" width="13" height="22" rx="5" fill="${skin}"/><rect x="65" y="168" width="13" height="22" rx="5" fill="${skin}"/>
        <ellipse cx="47" cy="191" rx="10" ry="5" fill="#3b3b5c"/><ellipse cx="73" cy="191" rx="10" ry="5" fill="#3b3b5c"/>
        ${lower}
        <path d="M32 112 Q60 100 88 112 L92 156 Q60 164 28 156Z" fill="${shirt}"/>
        ${arm('cr-arm cr-arm-l', 34, 116, 40, 12, shirt, 16, skin)}
        ${arm('cr-arm cr-arm-r', 86, 116, 40, 12, shirt, 16, skin)}
        <g class="cr-head" style="transform-origin:60px 100px">
          ${back}
          <circle cx="26" cy="64" r="6" fill="${skin}"/><circle cx="94" cy="64" r="6" fill="${skin}"/>
          <circle cx="60" cy="62" r="34" fill="${skin}"/>
          ${top}
          ${face(60, 60, .78, skin)}
        </g>
      </g>
    </svg>`;
  }
  // A small round face for the speech bubble.
  function badge(i){
    const c = i === 't' ? '#e8508a' : i === 'all' ? '#0b8a6c' : i === 'you' ? '#1769d1' : KIDS[i].shirt;
    return `<i class="cr-dot" style="background:${c}" aria-hidden="true"></i>`;
  }
  return { teacher, kid, badge, count: KIDS.length };
})();
