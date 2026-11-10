/* Learn Tamil — games: small helpers shared by Reading and the games.
   say1 (say one letter, recording first), fb (show feedback), wordLevel (1–3 by letter count). */
'use strict';

const say1 = l => sayLetter(l, spokenForm(l));   // one letter, recording first
function fb(el, text, kind){ el.textContent = text; el.className = 'feedback' + (kind ? ' '+kind : ''); }
function wordLevel(w){ const n = lettersOf(w).length; return n <= 2 ? 1 : n === 3 ? 2 : 3; }
