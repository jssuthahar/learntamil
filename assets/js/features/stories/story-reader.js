/* Learn Tamil — stories: the read-aloud story reader.
   Also opens festival stories (features/stories/rhymes.js). Tap a word to see its letters. */
'use strict';

let story=null, pageIdx=0, reading=false;
STORIES.forEach(s=>{
  const b = document.createElement('button'); b.className = 'book glass';
  b.innerHTML = `<div class="cover" aria-hidden="true">${s.cover}</div><div class="bt" lang="ta">${s.title}</div><div class="be">${s.en} · ${s.pages.length} pages</div><span class="badge">${s.lvl}</span>`;
  b.addEventListener('click', ()=>openStory(s));
  $('#shelf').appendChild(b);
});
function openStory(s){ story=s; pageIdx=0; $('#shelfView').hidden=true; $('#readerView').hidden=false; $('#rTitle').textContent=s.title; renderPage(); window.scrollTo({top:$('#app').offsetTop-120,behavior:'smooth'}); }
$('#backShelf').addEventListener('click', ()=>{ stopReading(); $('#readerView').hidden=true; $('#shelfView').hidden=false; });

const BD_HINT = '<span class="muted">Tap any word to hear it and see its letters</span>';
function renderPage(){
  const [pic,text,en] = story.pages[pageIdx];
  $('#pic').textContent = pic;
  $('#pageNo').textContent = `${pageIdx+1} / ${story.pages.length}`;
  $('#pen').textContent = en; $('#pen').hidden = !$('#showEn').checked;
  $('#theEnd').hidden = true;
  const box = $('#ptext'); box.innerHTML = '';
  const sentences = text.match(/[^.!?]+[.!?]?[”"]?/g) || [text];
  sentences.forEach(st=>{
    st = st.trim(); if (!st) return;
    const sp = document.createElement('span'); sp.className = 'sent'; sp.dataset.text = st;
    let offset = 0;
    st.split(' ').forEach(w=>{
      const ws = document.createElement('span'); ws.className='w'; ws.textContent=w; ws.dataset.start=offset; offset += w.length+1;
      ws.addEventListener('click', ()=>tapWord(w, ws));
      sp.append(ws, document.createTextNode(' '));
    });
    box.appendChild(sp);
  });
  $('#breakdown').innerHTML = BD_HINT;
  $('#prev').disabled = pageIdx===0;
  $('#next').disabled = false; // on the last page ▶ shows The End
  const pg = $('#page'); pg.classList.remove('turn'); void pg.offsetWidth; pg.classList.add('turn');
}
function tapWord(w, el){
  stopReading();
  $$('.w.now').forEach(x=>x.classList.remove('now')); el.classList.add('now');
  const clean = tamilOnly(w);
  speak(clean, ()=>el.classList.remove('now'));
  const bd = $('#breakdown'); bd.innerHTML = '';
  lettersOf(w).forEach((l,i)=>{
    if (i){ const p=document.createElement('span'); p.className='plus'; p.textContent='+'; bd.appendChild(p); }
    const c = document.createElement('button'); c.className='chip'; c.lang='ta';
    c.innerHTML = `${l}<small>${explain(l)}</small>`;
    c.addEventListener('click', ()=>sayLetter(l, spokenForm(l)));
    bd.appendChild(c);
  });
  const eq = document.createElement('span'); eq.className='plus'; eq.lang='ta'; eq.textContent = '= '+clean; bd.appendChild(eq);
}
function speakSentence(sp, done){
  const words = [...sp.querySelectorAll('.w')];
  sp.classList.add('reading');
  const finish = ()=>{ sp.classList.remove('reading'); words.forEach(w=>w.classList.remove('now')); done && done(); };
  try{
    speechSynthesis.cancel();
    const u = utter(sp.dataset.text.replace(/[“”"]/g,''));
    u.onboundary = e=>{ let cur=words[0]; words.forEach(w=>{ if (+w.dataset.start <= e.charIndex) cur=w; }); words.forEach(w=>w.classList.toggle('now', w===cur)); };
    u.onend = finish; u.onerror = finish;
    speechSynthesis.speak(u);
  }catch(e){ finish(); }
}
function readPage(){
  const sents = $$('#ptext .sent'); let k = 0;
  reading = true; $('#readMe').innerHTML = `<span class="ta">${TEXT.stop[0]}</span> · ${TEXT.stop[1]}`;
  const step = ()=>{
    if (!reading) return;
    if (k < sents.length){ speakSentence(sents[k++], ()=>setTimeout(step, 350)); return; }
    if ($('#autoTurn').checked && pageIdx < story.pages.length-1){ pageIdx++; if (typeof Rewards !== 'undefined') Rewards.sfx.page(); renderPage(); setTimeout(readPage, 700); return; }
    stopReading();
    if (pageIdx === story.pages.length-1){ $('#theEnd').hidden = false; confetti(); if (typeof Rewards !== 'undefined') Rewards.sfx.win(); track('story', story.id); }
  };
  step();
}
function stopReading(){
  reading = false; seqToken++;
  stopAudio();
  try{ speechSynthesis.cancel(); }catch(e){}
  $('#readMe').innerHTML = `<span class="ta">${TEXT.readToMe}</span>`;
  $$('.sent.reading').forEach(s=>s.classList.remove('reading'));
}
$('#readMe').addEventListener('click', ()=> reading ? stopReading() : readPage());
$('#prev').addEventListener('click', ()=>{ stopReading(); if (pageIdx>0){ pageIdx--; renderPage(); } });
$('#next').addEventListener('click', ()=>{ stopReading(); if (pageIdx<story.pages.length-1){ pageIdx++; renderPage(); } else if ($('#theEnd').hidden){ $('#theEnd').hidden=false; confetti(); if (typeof Rewards !== 'undefined') Rewards.sfx.win(); track('story', story.id); } });
$('#again').addEventListener('click', ()=>{ pageIdx=0; renderPage(); });
$('#showEn').addEventListener('change', e=>{ $('#pen').hidden = !e.target.checked; });
