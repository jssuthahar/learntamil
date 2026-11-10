/* Learn Tamil — data: colouring pictures (Games → Colouring).
   Each picture: w = Tamil word (spoken when it is finished), e = emoji, en = meaning, svg = line art
   (viewBox 0 0 200 200). Parts with class "cr" can be coloured; class "cl" lines are just drawn.
   PAINT maps the Tamil colour names from the Colours topic (data/words.js) to the colour on screen. */

const PICTURES = [
  { w: 'மீன்', e: '🐟', en: 'fish', svg: `
    <path class="cr" d="M148 100 L188 66 L180 100 L188 134 Z"/>
    <path class="cr" d="M72 66 Q96 32 124 64 Z"/>
    <ellipse class="cr" cx="95" cy="100" rx="60" ry="38"/>
    <circle class="cr" cx="62" cy="92" r="9"/>
    <path class="cl" d="M118 76 Q130 100 118 124"/>
    <circle class="cl" cx="30" cy="60" r="5"/><circle class="cl" cx="22" cy="40" r="7"/>` },
  { w: 'வீடு', e: '🏠', en: 'house', svg: `
    <rect class="cr" x="128" y="44" width="16" height="34"/>
    <path class="cr" d="M28 98 L100 36 L172 98 Z"/>
    <rect class="cr" x="46" y="98" width="108" height="80"/>
    <rect class="cr" x="88" y="128" width="26" height="50"/>
    <rect class="cr" x="58" y="112" width="22" height="22"/>
    <rect class="cr" x="122" y="112" width="22" height="22"/>
    <path class="cl" d="M10 178 L190 178"/>` },
  { w: 'மரம்', e: '🌳', en: 'tree', svg: `
    <path class="cr" d="M90 118 L110 118 L116 182 L84 182 Z"/>
    <circle class="cr" cx="66" cy="100" r="30"/>
    <circle class="cr" cx="134" cy="100" r="30"/>
    <circle class="cr" cx="100" cy="70" r="42"/>
    <circle class="cr" cx="86" cy="62" r="7"/>
    <circle class="cr" cx="118" cy="84" r="7"/>
    <path class="cl" d="M14 182 L186 182"/>` },
  { w: 'பூ', e: '🌸', en: 'flower', svg: `
    <rect class="cr" x="96" y="104" width="8" height="78"/>
    <ellipse class="cr" cx="122" cy="150" rx="20" ry="9" transform="rotate(-30 122 150)"/>
    <circle class="cr" cx="100" cy="50" r="22"/>
    <circle class="cr" cx="128" cy="71" r="22"/>
    <circle class="cr" cx="117" cy="104" r="22"/>
    <circle class="cr" cx="83" cy="104" r="22"/>
    <circle class="cr" cx="72" cy="71" r="22"/>
    <circle class="cr" cx="100" cy="80" r="17"/>` },
  { w: 'பட்டம்', e: '🪁', en: 'kite', svg: `
    <path class="cr" d="M100 18 L48 80 L100 80 Z"/>
    <path class="cr" d="M100 18 L152 80 L100 80 Z"/>
    <path class="cr" d="M48 80 L100 152 L100 80 Z"/>
    <path class="cr" d="M152 80 L100 152 L100 80 Z"/>
    <path class="cl" d="M100 152 Q80 166 100 176 Q120 186 100 196"/>
    <path class="cr" d="M96 166 L82 158 L82 174 Z"/>
    <path class="cr" d="M104 184 L118 176 L118 192 Z"/>` },
  { w: 'குடை', e: '☂️', en: 'umbrella', svg: `
    <path class="cl" d="M100 100 L100 170 Q100 184 86 178"/>
    <path class="cr" d="M100 100 L30 100 A70 70 0 0 1 65 39.4 Z"/>
    <path class="cr" d="M100 100 L65 39.4 A70 70 0 0 1 135 39.4 Z"/>
    <path class="cr" d="M100 100 L135 39.4 A70 70 0 0 1 170 100 Z"/>
    <circle class="cr" cx="100" cy="28" r="6"/>` }
];
const PAINT = { 'சிவப்பு': '#ef4444', 'நீலம்': '#3b82f6', 'பச்சை': '#22c55e', 'மஞ்சள்': '#facc15', 'ஆரஞ்சு': '#f97316',
  'ஊதா': '#a855f7', 'பழுப்பு': '#92400e', 'இளஞ்சிவப்பு': '#f9a8d4', 'கறுப்பு': '#1f2937', 'வெள்ளை': '#ffffff' };
