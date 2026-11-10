/* Learn Tamil — games: the games hub.
   Picks a game, resets the score and starts it. Games in their own files listen for "lt:game". */
'use strict';

/* =====================================================================
   GAMES HUB
   ===================================================================== */
let game = 'build';
function showGame(g){
  logEv('game_start', { game: g });
  game = g;
  Rewards.score.reset(g);
  $$('#gamePick .gcard').forEach(c=>c.setAttribute('aria-pressed', c.dataset.game===g));
  stopBalloon();
  const panelId = (g==='build' || g==='listen') ? 'g-quiz' : MCQ_INFO[g] ? 'g-mcq' : 'g-'+g;
  if (g==='little'){ location.hash = '/little'; return; }
  $$('#practice .game').forEach(x=>x.hidden = x.id !== panelId);
  if (g==='build' || g==='listen') setQuizMode(g);
  if (g==='spin') initSpin();
  if (g==='balloon') resetBalloon();
  if (g==='words') newWord();
  if (g==='memory') newMemory();
  if (MCQ_INFO[g]) startMcq(g);
  document.dispatchEvent(new CustomEvent('lt:game', {detail:g}));   // trace.js, colouring.js … start their own games
}
$$('#gamePick .gcard').forEach(c=>c.addEventListener('click', ()=>showGame(c.dataset.game)));
document.addEventListener('lt:section', e=>{
  if (e.detail === 'practice') showGame(game); else stopBalloon();
  if (e.detail === 'reading') renderRead();
});
