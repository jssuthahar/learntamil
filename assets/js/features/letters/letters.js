/* Learn Tamil — letters: the four letter sections.
   Floating letters, Kili, the now-playing panel, letter tiles, the uyirmei table and Build a letter. */
'use strict';

// floating letters behind the hero
(function(){
  const f = $('#floaters'); if (!f) return;
  const ls = FLOATING_LETTERS;
  ls.forEach((l,i)=>{
    const s = document.createElement('span'); s.textContent = l;
    s.style.left = (4 + (i*61)%92) + '%'; s.style.top = (6 + (i*37)%80) + '%';
    s.style.fontSize = (34 + (i*13)%46) + 'px';
    s.style.setProperty('--t', (7 + i%5) + 's'); s.style.setProperty('--dl', (-i*0.7) + 's');
    f.appendChild(s);
  });
})();

// Kili the parrot
const HELLO = TEXT.hello;
$('#mascot').addEventListener('click', ()=>{ sparkle($('#mascot .bird')); speak(HELLO); });

/* ---------- Now-playing panel ---------- */
const P = {big:$('#big'), roman:$('#roman'), kind:$('#kind'), hint:$('#hint'), ex:$('#ex'), exPic:$('#exPic'), exWord:$('#exWord'), exMean:$('#exMean')};
let current = uyir[0];
function famColor(f){ return getComputedStyle(document.documentElement).getPropertyValue('--c-'+f).trim(); }
function display(item){
  current = item;
  P.big.textContent = item.l;
  P.big.style.setProperty('--fam', famColor(item.fam));
  P.roman.textContent = item.r;
  P.kind.textContent = item.kind;
  P.hint.textContent = (item.hint || '') + (inWord(item) ? ` · 🔊 ${item.l}, then ${item.ex[1]}` : '');
  if (item.ex){ P.ex.hidden = false; [P.exPic.textContent, P.exWord.textContent, P.exMean.textContent] = item.ex; }
  else P.ex.hidden = true;
  P.big.classList.remove('pop'); void P.big.offsetWidth; P.big.classList.add('pop');
  P.big.onanimationend = e=>{ if (e.animationName==='pop') P.big.classList.remove('pop'); };
}
function play(item, tileEl){
  display(item);
  $$('.tile.playing').forEach(t=>t.classList.remove('playing'));
  if (tileEl){ tileEl.classList.add('playing'); sparkle(tileEl); }
  track('letter', item.l);
  sayItem(item, ()=>tileEl && tileEl.classList.remove('playing'));
}
$('#replay').addEventListener('click', ()=>sayItem(current));
P.ex.addEventListener('click', ()=>current.ex && speak(current.ex[1]));

function makeTile(item, opts={}){
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'tile f-'+item.fam;
  b.setAttribute('aria-label', `${item.l} — ${item.r}`);
  b.innerHTML = `<span class="l" lang="ta">${item.l}</span><span class="r">${item.r}</span>` +
    (opts.pic && item.ex ? `<span class="e" aria-hidden="true">${item.ex[0]}</span>` : '');
  b.addEventListener('click', ()=>play(item, b));
  return b;
}

/* ---------- Render letter sections ---------- */
uyir.forEach(i=>$(i.len===LETTER_LABELS.short ? '#gKuril' : '#gNedil').appendChild(makeTile(i,{pic:true})));
['v','m','i'].forEach(g=>{
  const h = document.createElement('div'); h.className = 'group';
  h.innerHTML = `${GROUPS[g].ta} <span class="chip-s">${GROUPS[g].en} · 6</span>`;
  const grid = document.createElement('div'); grid.className = 'grid';
  mei.filter(m=>m.g===g).forEach(i=>grid.appendChild(makeTile(i,{pic:true})));
  $('#gMei').append(h, grid);
});
aytham.forEach(i=>$('#gAy').appendChild(makeTile(i,{pic:true})));

// Uyirmei table
const tUm = $('#tUm');
const thead = document.createElement('thead');
thead.innerHTML = '<tr><th></th><th></th>' + VOWELS.map(v=>`<th scope="col" lang="ta">${v.l}</th>`).join('') + '</tr>';
tUm.appendChild(thead);
const tbody = document.createElement('tbody');
const PLAY_SVG = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4v16l13-8z"/></svg>';
uyirmei.forEach((row,ri)=>{
  const tr = document.createElement('tr');
  const tdBtn = document.createElement('td');
  const btn = document.createElement('button'); btn.className = 'rowplay'; btn.innerHTML = PLAY_SVG;
  btn.setAttribute('aria-label', `Play the ${CONS[ri].c} row`);
  tdBtn.appendChild(btn); tr.appendChild(tdBtn);
  const th = document.createElement('th'); th.scope = 'row'; th.lang = 'ta'; th.textContent = CONS[ri].c + PULLI; tr.appendChild(th);
  const pairs = row.map(i=>{ const td = document.createElement('td'); const b = makeTile(i); td.appendChild(b); tr.appendChild(td); return [i,b]; });
  btn.addEventListener('click', ()=>playSeq(pairs));
  tbody.appendChild(tr);
});
tUm.appendChild(tbody);

let seqToken = 0;
function playSeq(list){
  const token = ++seqToken; let k = 0;
  const step = ()=>{
    if (token !== seqToken || k >= list.length) return;
    const [i,b] = list[k++];
    display(i);
    $$('.tile.playing').forEach(x=>x.classList.remove('playing')); b.classList.add('playing');
    b.scrollIntoView({block:'nearest', inline:'center', behavior:'smooth'});
    sayItem(i, ()=>{ b.classList.remove('playing'); setTimeout(step, 250); });
  };
  step();
}

// Builder
let bC = 0, bV = 0;
function renderBuilder(){
  const item = uyirmei[bC][bV];
  $('#eqM').textContent = CONS[bC].c + PULLI;
  $('#eqU').textContent = VOWELS[bV].l;
  $('#eqR').textContent = item.l;
  $('#eqNote').textContent = `${item.r}  ·  ${VOWELS[bV].len === LETTER_LABELS.short ? `short (${LETTER_LABELS.short})` : `long (${LETTER_LABELS.long})`}`;
  $$('#pickCons .pick').forEach((b,i)=>b.setAttribute('aria-pressed', i===bC));
  $$('#pickVow .pick').forEach((b,i)=>b.setAttribute('aria-pressed', i===bV));
}
CONS.forEach((k,i)=>{ const b=document.createElement('button'); b.className='pick'; b.lang='ta'; b.textContent=k.c+PULLI;
  b.addEventListener('click',()=>{ bC=i; renderBuilder(); play(uyirmei[bC][bV]); }); $('#pickCons').appendChild(b); });
VOWELS.forEach((v,i)=>{ const b=document.createElement('button'); b.className='pick'; b.lang='ta'; b.textContent=v.l;
  b.addEventListener('click',()=>{ bV=i; renderBuilder(); play(uyirmei[bC][bV]); }); $('#pickVow').appendChild(b); });
const eqR = $('#eqR');
eqR.addEventListener('click', ()=>play(uyirmei[bC][bV]));
eqR.addEventListener('keydown', e=>{ if (e.key==='Enter'||e.key===' '){ e.preventDefault(); play(uyirmei[bC][bV]); } });
renderBuilder();
