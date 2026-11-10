/* Learn Tamil — games: small helpers shared by Reading and the games.
    */
'use strict';

const praise = ()=>PRAISE[rand(PRAISE.length)];
const say1 = l => sayLetter(l, l.endsWith(PULLI) ? 'இ'+l : l);   // one letter, recording first
function fb(el, text, kind){ el.textContent = text; el.className = 'feedback' + (kind ? ' '+kind : ''); }
function wordLevel(w){ const n = lettersOf(w).length; return n <= 2 ? 1 : n === 3 ? 2 : 3; }
