(() => {
 'use strict';
 const $=id=>document.getElementById(id),course=window.MISO_COURSE,dialog=$('contents-dialog');
 const desktop=matchMedia('(min-width:1100px)');
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let saved={};try{saved=JSON.parse(localStorage.getItem('miso-contents-v1')||'{}');}catch{}
 let expanded={...saved.expanded},state={ci:0,si:0,done:[]},initialised=false;
 const allGroups=course.chapters.flatMap(c=>c.sections),lookup=new Map();
 allGroups.forEach((g,ci)=>g.steps.forEach((s,si)=>lookup.set(s.id,{s,ci,si})));
 const persist=()=>{if(desktop.matches)saved.collapsed=!dialog.open;try{localStorage.setItem('miso-contents-v1',JSON.stringify({expanded,collapsed:saved.collapsed}));}catch{}};
 function sync(){const open=dialog.open;$('contents-toggle').setAttribute('aria-expanded',String(open));document.body.classList.toggle('contents-visible',open&&desktop.matches);if(!open)window.MisoYouTube?.pause();}
 function open(){if(dialog.open)return;if(desktop.matches)dialog.show();else{window.MisoYouTube?.pause();dialog.showModal();}sync();persist();}
 function close(){dialog.close();sync();persist();$('contents-toggle').focus({preventScroll:true});}
 $('contents-toggle').onclick=()=>dialog.open?close():open();$('contents-close').onclick=close;
 dialog.addEventListener('close',()=>{sync();persist();});
 window.addEventListener('pagehide',()=>{$('course-tree').querySelectorAll('details[data-tree]').forEach(d=>expanded[d.dataset.tree]=d.open);persist();});
 desktop.addEventListener('change',()=>{const wasOpen=dialog.open;if(wasOpen)dialog.close();if(desktop.matches&&!saved.collapsed)dialog.show();sync();});
 dialog.addEventListener('click',e=>{const b=e.target.closest('[data-nav-step]');if(!b)return;const [ci,si]=b.dataset.navStep.split(':').map(Number);document.dispatchEvent(new CustomEvent('miso:navigate',{detail:{ci,si}}));if(!desktop.matches)close();});
 function progress(steps,done){const count=steps.filter(s=>done.has(s.id)).length;return {count,total:steps.length,percent:steps.length?Math.round(count/steps.length*100):0};}
 function bookReference(section,ch){
  if(!section.page)return '<p class="section-note">Extra foundations, before the book. Next follows Kitty’s gentle teaching path.</p>';
  if(window.MISO_BUILD?.sourcePages===false)return `<p class="section-note">Your textbook · printed page ${section.page}</p>`;
  return `<a class="section-source" href="${ch.source}#page=${section.page+ch.sourcePageOffset}" target="_blank" rel="noopener">Book page ${section.page} ↗</a>`;
 }
 function bar(p,label){return `<span class="contents-bar" role="progressbar" aria-label="${esc(label)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${p.percent}" aria-valuetext="${p.total?`${p.count} of ${p.total} guided steps explored`:'Not built yet'}"><span style="width:${p.percent}%"></span></span>`;}
 function update(next){
  const changed=initialised&&(state.ci!==next.ci||state.si!==next.si);initialised=true;state=next;const done=new Set(next.done),current=allGroups[state.ci].steps[state.si];let currentChapter;
  $('course-tree').querySelectorAll('details[data-tree]').forEach(d=>expanded[d.dataset.tree]=d.open);
  const html=course.chapters.map(ch=>{
   const steps=ch.sections.flatMap(s=>s.steps),p=progress(steps,done),active=steps.some(s=>s.id===current.id),built=steps.length>0;
   if(active)currentChapter={ch,p};
   const chapterKey='chapter:'+ch.id;
   if(expanded[chapterKey]===undefined)expanded[chapterKey]=active;
   if(changed&&active)expanded[chapterKey]=true;
   const sections=ch.outline.map((section,j)=>{
    const entries=section.lessons.map(id=>lookup.get(id)).filter(Boolean),sp=progress(entries.map(e=>e.s),done),sectionKey='section:'+ch.id+':'+j,selected=entries.some(e=>e.s.id===current.id);
    if(expanded[sectionKey]===undefined)expanded[sectionKey]=selected;
    if(changed&&selected)expanded[sectionKey]=true;
    const title=(section.number?section.number+' ':'')+section.title;
    if(!built)return `<li class="future-section">${esc(title)}<small>Book page ${section.page} · Not built yet</small></li>`;
    return `<details class="contents-section" data-tree="${sectionKey}" ${expanded[sectionKey]?'open':''}><summary><span class="section-heading"><span>${esc(title)}</span><small>${sp.total?sp.percent+'%':'Book'}</small></span>${sp.total?bar(sp,title+' guided progress'):''}</summary>${bookReference(section,ch)}${sp.total?`<ol>${entries.map(({s,ci,si})=>`<li><button data-nav-step="${ci}:${si}" data-step-id="${s.id}" ${si===0?`data-chapter="${ci}"`:''} ${s.id===current.id?'aria-current="step"':''}><span class="step-check" aria-label="${done.has(s.id)?'Explored':'Not yet explored'}">${done.has(s.id)?'✓':'○'}</span><span>${esc(s.title)}</span></button></li>`).join('')}</ol>`:'<p class="section-note">Read these in your own textbook. Interactive revision is not built yet.</p>'}</details>`;
   }).join('');
   return `<details class="contents-chapter ${built?'':'future-chapter'}" data-tree="${chapterKey}" ${expanded[chapterKey]?'open':''}><summary><span class="book-label">CHAPTER ${ch.number} <span class="chapter-chevron" aria-hidden="true">›</span></span><span class="chapter-heading"><strong>${esc(ch.title)}</strong><b class="chapter-percent">${p.percent}%</b></span>${bar(p,ch.title+' chapter progress')}<small>${built?`${p.count} / ${p.total} guided steps explored`:'Not built yet · contents preview only'}</small></summary>${built?sections:`<p class="section-note">We’re starting with Complex Numbers. These chapter pages are not in this PDF yet.</p><ul class="future-outline">${sections}</ul>`}</details>`;
  }).join('');
  $('course-tree').innerHTML=html;
  $('course-tree').querySelectorAll('details[data-tree]').forEach(d=>d.addEventListener('toggle',()=>{if(!d.isConnected)return;expanded[d.dataset.tree]=d.open;persist();}));
  if(currentChapter){const {ch,p}=currentChapter;$('chapter-name').textContent=`Chapter ${ch.number} · ${ch.title}`;$('chapter-percent').textContent=p.percent+'%';$('chapter-progress-note').textContent=`${p.count} of ${p.total} guided steps explored`;$('progress-fill').style.width=p.percent+'%';$('progress').setAttribute('aria-valuenow',p.percent);$('progress').setAttribute('aria-valuemax','100');$('progress').setAttribute('aria-valuetext',`${p.percent}% · ${p.count} of ${p.total} guided steps explored`);}
 }
 window.MisoNavigation={update,open,close};
 if(desktop.matches&&!saved.collapsed)dialog.show();sync();
})();
