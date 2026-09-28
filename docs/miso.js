(() => {
'use strict';
const $=id=>document.getElementById(id), course=window.MISO_COURSE, C=course.chapters.flatMap(c=>c.sections), M=window.MathLab;
const esc=s=>String(s).replaceAll('×','*').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const key='miso-maths-v1';
let saved={};try{saved=JSON.parse(localStorage.getItem(key)||'{}')||{};}catch{}
const prefs={quiet:false,auto:true,reduce:matchMedia('(prefers-reduced-motion: reduce)').matches,large:false,volume:.75,rate:1,...saved.prefs};
prefs.volume=Number.isFinite(+prefs.volume)?clamp(+prefs.volume,0,1):.75;
prefs.rate=[.85,1,1.1].includes(+prefs.rate)?+prefs.rate:1;
let ci=Number.isInteger(saved.ci)?clamp(saved.ci,0,C.length-1):0;
let si=Number.isInteger(saved.si)?clamp(saved.si,0,C[ci].steps.length-1):0;
let done=new Set(Array.isArray(saved.done)?saved.done.filter(x=>typeof x==='string'):[]), st, speaking='say',voiceEnabled=false;
let narrator=null,narrationId=null,narrationEntry=null,highlightFrame=0,playAttempt=0,purr=null,petTimeout, demoTimers=[], drag=null, painting=false, suppressClick=false;
const chapter=()=>C[ci], step=()=>chapter().steps[si], bookChapter=()=>course.chapters.find(c=>c.sections.includes(chapter()));
const updateContents=()=>window.MisoNavigation?.update({ci,si,done:[...done]});
function fresh(){const s=step();return {a:s.start?.[0]||0,b:s.start?.[1]||0,turn:0,angle:s.angle||0,length:1,tiles:[],selected:[],products:0,roots:[],solved:false,assisted:false};}
function persist(){try{localStorage.setItem(key,JSON.stringify({ci,si,prefs,done:[...done],draft:st,id:step().id}));}catch{$('save-note').textContent='Storage unavailable. Your place is kept for this visit only.';}}
function voiceLabel(text,playing=false){$('listen').textContent=text;$('listen').setAttribute('aria-pressed',String(playing));}
function pauseVoice(){playAttempt++;narrator?.pause();cancelAnimationFrame(highlightFrame);window.MisoSound?.setNarrating(false);voiceLabel(narrator&&!narrator.ended?'Resume Kitty':'Listen to Kitty');}
function stopVoice(){pauseVoice();if(narrator){narrator.onended=null;narrator.onerror=null;narrator=null;}narrationId=null;narrationEntry=null;document.querySelectorAll('.spoken-now').forEach(el=>el.classList.remove('spoken-now'));voiceLabel('Listen to Kitty');}
function stopAll(background=true){pauseVoice();if(background)window.MisoSound?.pause();if(purr){purr.pause();purr=null;}clearTimeout(petTimeout);$('pet-miso').classList.remove('petted');$('cat-caption').innerHTML='Kitty · your maths companion<br><small>You can pet me ♡</small>';}
function highlight(){
 cancelAnimationFrame(highlightFrame);if(!narrator||!narrationEntry?.words)return;
 const time=narrator.currentTime;document.querySelectorAll('#speech-text [data-word]').forEach(el=>{const w=narrationEntry.words[+el.dataset.word];el.classList.toggle('spoken-now',!!w&&time>=w.start&&time<w.end);});
 if(!narrator.paused)highlightFrame=requestAnimationFrame(highlight);
}
function voiceEntry(part){const id=`${step().id}-${part}`,e=window.MISO_VOICE?.[id];return e?.text===step()[part]?e:null;}
async function speak(part=speaking){
 if(purr){purr.pause();purr=null;}if(prefs.quiet)return;
 const id=`${step().id}-${part}`,entry=voiceEntry(part);
 if(!entry){stopVoice();$('audio-status').textContent='This recording is unavailable. You can still read the explanation; no different script or device voice will play.';return;}
 if(narrationId!==id||!narrator){stopVoice();narrationEntry=entry;narrationId=id;narrator=new Audio(entry.src);}
 const audio=narrator;if(audio.ended)audio.currentTime=0;audio.volume=prefs.volume;audio.playbackRate=prefs.rate;
 $('audio-status').textContent='';voiceLabel('Pause Kitty',true);
 audio.onended=()=>{if(narrator===audio){pauseVoice();voiceLabel('Replay Kitty');highlight();}};
 const attempt=++playAttempt;
 try{await audio.play();if(narrator!==audio||attempt!==playAttempt||audio.paused)return;window.MisoSound?.setNarrating(true);highlight();}catch(error){if(narrator!==audio||attempt!==playAttempt)return;if(error.name==='AbortError'){pauseVoice();return;}stopVoice();$('audio-status').textContent='This voice clip could not play. The explanation stays here to read; no device voice will replace it.';}
}
function setSpeech(part,read=true){stopVoice();speaking=part;const entry=voiceEntry(part);$('speech-text').textContent=step()[part];
 if(entry?.words?.length&&entry.words.map(w=>w.text).join('')===entry.text)$('speech-text').innerHTML=entry.words.map((w,i)=>`<span data-word="${i}">${esc(w.text)}</span>`).join('');
 $('speech-label').textContent=part==='success'?'WHAT YOU JUST FOUND':part==='more'?'ONE SMALL PIECE AT A TIME':'LET’S START WITH SOMETHING YOU CAN SEE';$('smaller').textContent=part==='more'?'Back to the short explanation':'Break this down for me';$('audio-status').textContent=entry?'':'Recording unavailable for this explanation.';$('voice-restart').disabled=!entry;if(read&&voiceEnabled&&prefs.auto&&!prefs.quiet)speak(part);
}
function complete(){if(st.solved)return;st.solved=true;done.add(step().id);setSpeech('success');document.querySelector('.lesson-card').classList.add('complete');$('next').disabled=false;$('next').innerHTML=isLast()?'Explore the contents ↗':'I get it. Let’s keep going <span aria-hidden="true">→</span>';$('board-status').textContent=st.assisted?'Explored together. You can replay it yourself, or keep going.':'You found it. Stay and explore, or take the next little step.';persist();updateContents();}
const isLast=()=>ci===C.length-1&&si===chapter().steps.length-1;
function status(text){$('board-status').textContent=text;}
function cancelDemo(){demoTimers.forEach(clearTimeout);demoTimers=[];$('demo').disabled=false;}
function go(c,i){cancelDemo();stopAll(false);drag=null;painting=false;ci=c;si=i;st=fresh();render();persist();$('lesson-title').focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
function render(){const s=step();document.body.classList.toggle('reduced',!!prefs.reduce);document.body.classList.toggle('large',!!prefs.large);document.querySelector('.lesson-card').classList.toggle('complete',st.solved);
 $('step-count').textContent=`Guided step ${C.slice(0,ci).reduce((n,g)=>n+g.steps.length,0)+si+1} of ${C.flatMap(g=>g.steps).length}`;
 updateContents();
 $('chapter-tag').textContent=chapter().name;$('lesson-title').textContent=s.title;$('task').textContent=s.task;$('board').dataset.kind=s.kind;
 $('symbol-strip').innerHTML=s.tokens.map(([symbol,name],i)=>`<button type="button" class="symbol" data-help-token="${i}" aria-haspopup="dialog" aria-label="Explain ${esc(symbol)}: ${esc(name)}"><b>${esc(symbol)}</b><span>${esc(name)}</span></button>`).join('');
 window.MisoHelp?.update(s);
 $('back').disabled=ci===0&&si===0;$('next').disabled=!st.solved;$('next').innerHTML=st.solved?(isLast()?'Choose another discovery ↗':'I get it. Let’s keep going →'):'Try the little activity first →';
 $('quiet').textContent=prefs.quiet?'Sound off':'Sound on';$('quiet').setAttribute('aria-pressed',String(prefs.quiet));$('audio-status').textContent='';
 setSpeech(st.solved?'success':'say');draw();
}
function yarn(x,y,draggable=true){return `<g transform="translate(${x} ${y})" ${draggable?'data-drag="yarn"':''}><circle r="24" fill="transparent"/><circle r="15" fill="#d58556" stroke="#9f5932" stroke-width="1.5"/><path d="M-12 -6 Q5 -15 11 8 M-14 0 Q0 -8 14 4 M-11 9 Q0 -1 14 -3 M-7 -12 Q-14 1 0 14 M0 -14 Q-7 0 8 12" fill="none" stroke="#f4c49a" stroke-width="1.8"/><path d="M10 12 Q22 23 30 14" fill="none" stroke="#b97143" stroke-width="2"/></g>`;}
function svg(body,label,box='0 0 400 270'){return `<svg viewBox="${box}" role="img" aria-label="${esc(label)}">${body}</svg>`;}
function arrowButton(dx,dy,label){return `<button data-move="${dx},${dy}" aria-label="${label}">${label}</button>`;}
function drawLine(){const s=step(), scale=39, y=123, x=a=>200+a*scale;let body='<path d="M30 151 Q200 162 370 151" fill="none" stroke="#d7e2cf" stroke-width="26" stroke-linecap="round"/>';
 body+=`<line x1="${x(-4)}" y1="${y}" x2="${x(4)}" y2="${y}" stroke="#c2d0b6" stroke-width="3"/>`;
 for(let a=-4;a<=4;a++)body+=`<g data-point="${a},0"><rect x="${x(a)-19}" y="${y-19}" width="38" height="61" rx="12" fill="transparent"/><ellipse cx="${x(a)}" cy="${y+3}" rx="16" ry="11" fill="${a===s.target[0]?'#f1d9a6':'#e5e8d9'}" stroke="${a===s.target[0]?'#b18642':'#ccd4c0'}"/><text x="${x(a)}" y="${y+40}" text-anchor="middle" font-weight="${a===0?700:400}">${M.fmt(a)}</text></g>`;
 body+=`<text x="${x(s.target[0])}" y="73" text-anchor="middle" class="axis-label">toy’s home</text><path d="M${x(s.target[0])} 81 v14" stroke="#b18642" stroke-width="2"/>${yarn(x(st.a),y-13)}<text x="200" y="205" text-anchor="middle" class="axis-label">← negative · zero · positive →</text>`;
 $('board').innerHTML=svg(body,'A number line from minus four to four. Move the yarn to '+s.target[0],'0 53 400 169');
 $('controls').innerHTML=arrowButton(-1,0,'← One left')+arrowButton(1,0,'One right →');status(`The yarn is at ${M.fmt(st.a)}.`);
}
function planeBase(range=4){const unit=95/range,x=a=>200+a*unit,y=b=>133-b*unit;let body='';
 for(let a=-range;a<=range;a++){body+=`<line x1="${x(a)}" y1="${y(-range)}" x2="${x(a)}" y2="${y(range)}" stroke="#dce5d4"/><line x1="${x(-range)}" y1="${y(a)}" x2="${x(range)}" y2="${y(a)}" stroke="#dce5d4"/>`;if(a)body+=`<text class="tick" x="${x(a)}" y="${y(0)+18}" text-anchor="middle">${M.fmt(a)}</text><text class="tick" x="${x(0)-10}" y="${y(a)+4}" text-anchor="end">${M.fmt(a)}</text>`;}
 body+=`<line x1="89" y1="133" x2="312" y2="133" stroke="#aa6b3d" stroke-width="2"/><line x1="200" y1="241" x2="200" y2="22" stroke="#8969a6" stroke-width="2"/><text x="315" y="132" class="axis-label">across</text><text x="205" y="18" class="axis-label">up</text><text x="190" y="151" class="tick">0</text>`;
 return {unit,x,y,body};
}
function drawPlane(){const s=step(),p=planeBase(s.range),{x,y}=p;let body=p.body;
 if(s.mirror)body+=`<circle cx="${x(s.start[0])}" cy="${y(s.start[1])}" r="11" fill="#e6d4bf" stroke="#a98c67"/><path d="M${x(s.start[0])} ${y(s.start[1])} V${y(s.target[1])}" stroke="#b29478" stroke-dasharray="4 4"/>`;
 body+=`<path d="M200 133 H${x(st.a)} V${y(st.b)}" fill="none" stroke="#b16b39" stroke-width="4" opacity=".4"/><path d="M${x(st.a)} 133 V${y(st.b)}" stroke="#8969a6" stroke-width="4" opacity=".7"/>`;
 if(s.route)body+=`<circle cx="${x(s.start[0])}" cy="${y(s.start[1])}" r="5" fill="#344f40"/>`;
 body+=`<circle cx="${x(s.target[0])}" cy="${y(s.target[1])}" r="19" stroke="#80945b" stroke-width="2" stroke-dasharray="5 3" fill="#f4e5bf99"/>${yarn(x(st.a),y(st.b))}`;
 $('board').innerHTML=svg(body,'Coordinate map. Yarn at '+M.complex(st.a,st.b));
 $('controls').innerHTML=arrowButton(-1,0,'← Left')+arrowButton(1,0,'Right →')+arrowButton(0,1,'↑ Up')+arrowButton(0,-1,'↓ Down');
 status(s.plain?`${M.fmt(st.a)} across, ${M.fmt(st.b)} up.`:`Yarn: ${M.complex(st.a,st.b)} · real part ${M.fmt(st.a)}, imaginary part ${M.fmt(st.b)}.`);
}
function roundBoard(angle,radius,label,mode){const a=angle*Math.PI/180,px=200+92*Math.cos(a),py=132-92*Math.sin(a);let body=`<circle cx="200" cy="132" r="92" fill="#fffdf450" stroke="#d3dfc6" stroke-width="2"/><line x1="90" y1="132" x2="310" y2="132" stroke="#c7d3bc"/><line x1="200" y1="22" x2="200" y2="242" stroke="#c7d3bc"/>`;
 const labels=mode==='turn'?['1','i','−1','−i']:['0°','90°','180°','270°'];[[320,138],[200,18],[76,138],[200,263]].forEach(([x,y],i)=>body+=`<text x="${x}" y="${y}" text-anchor="middle">${labels[i]}</text>`);
 if(step().shadows)body+=`<path d="M200 132 H${px}" stroke="#b16b39" stroke-width="5"/><path d="M${px} 132 V${py}" stroke="#8969a6" stroke-width="5"/><path d="M200 ${py} H${px}" stroke="#b0bc9e" stroke-dasharray="4 4"/>`;
 body+=`<line x1="200" y1="132" x2="${px}" y2="${py}" stroke="#326d57" stroke-width="5" stroke-linecap="round"/><circle cx="200" cy="132" r="6" fill="#326d57"/><text x="208" y="154" class="tick">0</text>${yarn(px,py)}<text x="200" y="290" text-anchor="middle">${esc(label)}</text>`;
 return svg(body,`Turn dial at ${angle} degrees. ${label}`,'0 0 400 305');
}
function drawTurn(){const s=step();$('board').innerHTML=roundBoard(st.turn*90,1,M.complex(...M.polar(1,st.turn*90)),'turn')+`<div class="turn-trail">${Array.from({length:s.turns+1},(_,i)=>`<span class="${i<=st.turn?'hit':''}">${i===0?'start':i+' turn'+(i>1?'s':'')}</span>`).join('')}</div>`;
 $('controls').innerHTML='<button class="turn-control" data-turn="1">↶ Quarter-turn · * i</button>';status(`${st.turn} of ${s.turns} turns. Multiply by i each time.`);
}
function drawPolar(keepControls=false){const s=step(),z=M.polar(s.radius,st.angle);$('board').innerHTML=roundBoard(st.angle,s.radius,`${st.angle}° · radius ${s.radius}`,'polar');
 if(!keepControls)$('controls').innerHTML=`<button data-angle="-15" aria-label="Turn clockwise 15 degrees">−15°</button><label>Angle <input id="angle" type="range" min="0" max="345" step="15" value="${st.angle}" aria-label="Angle in degrees"></label><button data-angle="15" aria-label="Turn anticlockwise 15 degrees">+15°</button>`;
 status(`Across ${M.fmt(z[0])}, up ${M.fmt(z[1])} (rounded).`);
}
function drawPower(){const s=step(),r=s.radius**st.turn,deg=s.angle*st.turn;const x=200+11*r*Math.cos(deg*Math.PI/180),y=135-11*r*Math.sin(deg*Math.PI/180);let body='<line x1="90" y1="135" x2="310" y2="135" stroke="#c4d1b9"/><line x1="200" y1="25" x2="200" y2="245" stroke="#c4d1b9"/>';
 for(let k=0;k<=s.times;k++){const rr=s.radius**k;body+=`<circle cx="200" cy="135" r="${rr*11}" fill="none" stroke="#d2dec8" stroke-dasharray="3 4"/>`;}
 body+=`<line x1="200" y1="135" x2="${x}" y2="${y}" stroke="#326d57" stroke-width="3"/>${yarn(x,y)}<text x="200" y="266" text-anchor="middle">length ${r} · angle ${deg}°</text>`;
 $('board').innerHTML=svg(body,'Repeated turns and stretches','0 0 400 285');$('controls').innerHTML='<button class="turn-control" data-power>↶ Turn 30° & stretch * 2</button>';status(`${st.turn} of ${s.times} multiplications. Start at 1.`);
}
function drawRoots(){const s=step();let body='<circle cx="200" cy="132" r="89" fill="#fff9e955" stroke="#c8d7bc" stroke-width="2"/><line x1="93" y1="132" x2="307" y2="132" stroke="#ccd7be"/><line x1="200" y1="25" x2="200" y2="239" stroke="#ccd7be"/>';
 const labels=s.n===4?['1','i','−1','−i']:['√3 + i','−√3 + i','−2i'];
 for(let k=0;k<s.n;k++){const deg=s.baseAngle+k*360/s.n,a=deg*Math.PI/180,x=200+89*Math.cos(a),y=132-89*Math.sin(a),lx=200+122*Math.cos(a),ly=132-115*Math.sin(a);body+=`<g data-root="${k}"><circle cx="${x}" cy="${y}" r="23" fill="transparent"/><circle cx="${x}" cy="${y}" r="16" fill="${st.roots.includes(k)?'#66905c':'#fbedd0'}" stroke="#90a376" stroke-width="2"/><text x="${x}" y="${y+5}" text-anchor="middle" style="font-size:13px">${st.roots.includes(k)?'✓':k+1}</text><text x="${lx}" y="${ly+4}" text-anchor="middle">${labels[k]}</text></g>`;}
 $('board').innerHTML=svg(body,'Equally spaced roots on a circle');$('controls').innerHTML=labels.map((l,k)=>`<button data-root="${k}" aria-pressed="${st.roots.includes(k)}">${esc(l)}</button>`).join('');status(`${st.roots.length} of ${s.n} roots explored. Radius ${s.radius}.`);
}
function drawDistance(keepControls=false){const p=planeBase(5),{x,y}=p;const body=p.body+`<path d="M200 133 H${x(3)} V${y(4)} Z" fill="#d9e6c399" stroke="#8fa871" stroke-width="2"/><line x1="200" y1="133" x2="${x(3)}" y2="${y(4)}" stroke="#326d57" stroke-width="4"/>${yarn(x(3),y(4),false)}<text x="${x(1.5)}" y="157" text-anchor="middle">3</text><text x="${x(3)+15}" y="${y(2)}">4</text><text x="${x(1)-20}" y="${y(2)}" style="font-size:25px">${st.length}</text>`;
 $('board').innerHTML=svg(body,'Right triangle with sides three and four. Choose the straight-line distance.');if(!keepControls)$('controls').innerHTML=`<label>Ribbon length <input id="length" type="range" min="1" max="8" value="${st.length}" aria-label="Straight-line distance"></label><button data-check-length>Check length</button>`;status(`Your guess: ${st.length}. Calculation: 3 * 3 + 4 * 4 = 25. √25 = 5.`);
}
function choiceOrder(count){const shift=(ci+si)%count;return Array.from({length:count},(_,i)=>(i+shift)%count);}
function drawChoice(){const s=step();$('board').innerHTML=(s.id==='negative-square'?'<div class="number-experiment"><label>Try a number <input id="number-experiment" type="range" min="-3" max="3" value="1" aria-label="Number to square"></label><output id="number-result">1 * 1 = 1</output><span>Whatever you choose here, the result is never negative.</span></div>':'')+`<p class="choice-question">${esc(s.question)}</p><div class="options">${choiceOrder(s.options.length).map(i=>`<button class="option ${st.selected.includes(i)?'selected':''}" data-choice="${i}" ${s.kind==='multi'?`aria-pressed="${st.selected.includes(i)}"`:''}>${esc(s.options[i])}</button>`).join('')}</div>`;$('controls').innerHTML=s.kind==='multi'?'<button data-check-multi>Check my two choices</button>':'';status(s.kind==='multi'?`${st.selected.length} of 2 choices selected.`:'There is no penalty for trying.');}
function products(){const s=step();return [{label:`${s.a} × ${s.c}`,value:M.complex(s.a*s.c,0)},{label:`${s.a} × ${M.complex(0,s.d)}`,value:M.complex(0,s.a*s.d)},{label:`${M.complex(0,s.b)} × ${s.c}`,value:M.complex(0,s.b*s.c)},{label:`${M.complex(0,s.b)} × ${M.complex(0,s.d)}`,value:M.complex(-s.b*s.d,0)}];}
function drawProducts(){const s=step(),p=products(),j=Math.min(st.products,3),value=p[j].value,opts=[...new Set([value,M.complex(s.a+s.c,s.b+s.d),value==='−1'?'1':'−1',value+'i'])].slice(0,3);let matrix='<div class="products-grid"><div class="header">×</div>'+`<div class="header">${s.c}</div><div class="header">${M.complex(0,s.d)}</div>`;
 [0,1].forEach(row=>{matrix+=`<div class="header">${row?M.complex(0,s.b):s.a}</div>`;[0,1].forEach(col=>{const n=row*2+col;matrix+=`<div class="product-cell ${n<st.products?'filled':n===st.products?'current':''}">${n<st.products?esc(p[n].value):'?'}</div>`;});});matrix+='</div>';
 $('board').innerHTML=matrix+`<p class="product-prompt">${st.products===4?'Four little products. Now add them.':esc(p[j].label)+' = ?'}</p>`+(st.products<4?`<div class="options products-options">${choiceOrder(opts.length).map(i=>`<button class="option" data-product="${esc(opts[i])}">${esc(opts[i])}</button>`).join('')}</div>`:`<p class="live-value">${p.map(x=>esc(x.value)).join(' , ')} → ${M.complex(...M.mul(s.a,s.b,s.c,s.d))}</p>`);
 $('controls').innerHTML='';status(`${st.products} of 4 pairs multiplied. The highlighted cell is the pair to do now.`);
}
function drawTiles(){const s=step();$('board').innerHTML=`<p class="rug-caption">A square rug · 3 pieces along each edge</p><div class="tiles">${Array.from({length:s.size*s.size},(_,i)=>`<button class="tile ${st.tiles.includes(i)?'filled':''}" data-tile="${i}" aria-label="Tile ${i+1}" aria-pressed="${st.tiles.includes(i)}"></button>`).join('')}</div><div class="equation-live">3 rows * 3 pieces = 9 pieces</div>`;$('controls').innerHTML='';status(`${st.tiles.length} of 9 fabric pieces placed.`);}
function drawRug(keepControls=false){const n=clamp(st.length,1,5),area=n*n;
 $('board').innerHTML=`<div class="rug-scene"><span class="rug-edge">${n} pieces along this edge</span><div class="rug-grid" style="--side:${n};--rug-size:${90+n*24}px">${Array.from({length:area},(_,i)=>`<span class="fabric-piece" style="--patch:${i%3}" aria-hidden="true"></span>`).join('')}</div><p class="equation-live">${n} * ${n} = ${area}</p><p class="rug-verdict">${area===9?'All 9 pieces fit. None left over.':area<9?`${9-area} of your 9 pieces would be left over.`:`You would need ${area-9} more pieces than you have.`}</p></div>`;
 if(!keepControls)$('controls').innerHTML=`<label>Side length <input id="rug-size" type="range" min="1" max="5" step="1" value="${n}" aria-label="Rug side length"></label><button data-check-rug>Check my rug</button>`;
 status(`You have 9 pieces. This rug uses ${area}.`);
}
function draw(){const kind=step().kind;({line:drawLine,plane:drawPlane,turn:drawTurn,polar:drawPolar,power:drawPower,roots:drawRoots,distance:drawDistance,choice:drawChoice,multi:drawChoice,products:drawProducts,tiles:drawTiles,rug:drawRug}[kind])();if(st.solved)status(st.assisted?'Explored with Kitty. Replay any time.':'You found it. Stay here, or take the next little step.');}
function move(a,b){const s=step();st.a=clamp(Math.round(a),-(s.range||4),s.range||4);st.b=s.kind==='line'?0:clamp(Math.round(b),-s.range,s.range);draw();if(st.a===s.target[0]&&st.b===s.target[1])complete();persist();}
function turn(){const previous=st.turn;st.turn=Math.min(st.turn+1,step().turns);draw();if(!prefs.reduce&&st.turn!==previous){const ball=$('board').querySelector('[data-drag]');ball?.animate([{opacity:.3},{opacity:1}],{duration:450});}if(st.turn===step().turns)complete();persist();}
function angle(value,keepControls=false){st.angle=((Math.round(value/15)*15)%360+360)%360;drawPolar(keepControls);if(st.angle===step().targetAngle)complete();persist();}
function tile(i){if(st.tiles.includes(i))return;st.tiles.push(i);const b=document.querySelector(`[data-tile="${i}"]`);b?.classList.add('filled');b?.setAttribute('aria-pressed','true');status(`${st.tiles.length} of 9 tiles. Three rows, three in each row.`);if(st.tiles.length===9)complete();persist();}
function root(i){if(!st.roots.includes(i))st.roots.push(i);draw();if(st.roots.length===step().n)complete();else status(`Root ${i+1}: angle ${step().baseAngle+i*360/step().n}°. Raising to power ${step().n} returns the target.`);persist();}
function retry(){setSpeech('more');status('Not this one yet. Read Kitty’s explanation, then try another. Nothing is lost.');}
function choose(i){const s=step();if(s.kind==='multi'){st.selected=st.selected.includes(i)?st.selected.filter(k=>k!==i):[...st.selected,i];draw();}else{st.selected=[i];draw();if(i===s.answer)complete();else{document.querySelector(`[data-choice="${i}"]`)?.classList.add('try');retry();}}persist();}
function product(value){if(st.products>=4)return;if(value===products()[st.products].value){st.products++;draw();if(st.products===4)complete();}else retry();persist();}
function demo(){cancelDemo();st.assisted=true;setSpeech('more');const s=step();if(['line','plane'].includes(s.kind)){
 const moves=[];let a=st.a,b=st.b;while(a!==s.target[0]){a+=Math.sign(s.target[0]-a);moves.push([a,b]);}while(b!==s.target[1]){b+=Math.sign(s.target[1]-b);moves.push([a,b]);}
 $('demo').disabled=true;moves.forEach(([a,b],i)=>demoTimers.push(setTimeout(()=>{move(a,b);if(i===moves.length-1)$('demo').disabled=false;},prefs.reduce?0:600*(i+1))));if(!moves.length){complete();$('demo').disabled=false;}
 }else if(s.kind==='turn')turn();else if(s.kind==='power')power();else if(s.kind==='polar')angle(s.targetAngle);else if(s.kind==='tiles'){for(let i=0;i<9;i++)tile(i);}else if(s.kind==='roots')root(Array.from({length:s.n},(_,i)=>i).find(i=>!st.roots.includes(i))??0);else if(s.kind==='products')product(products()[Math.min(st.products,3)].value);else if(s.kind==='rug'){st.length=3;drawRug();complete();}else if(s.kind==='distance'){st.length=5;draw();complete();}else if(s.kind==='multi'){st.selected=[...s.answers];draw();complete();}else choose(s.answer);persist();}
function power(){st.turn=Math.min(step().times,st.turn+1);draw();if(st.turn===step().times)complete();persist();}
function pet(){pauseVoice();const cat=$('pet-miso');cat.classList.remove('petted');void cat.offsetWidth;cat.classList.add('petted');$('cat-caption').innerHTML='Mrrr… that’s lovely ♡<br><small>I’m right here with you.</small>';clearTimeout(petTimeout);if(!prefs.quiet){if(!purr)purr=new Audio('assets/purr.ogg');purr.currentTime=0;purr.volume=Math.min(.5,prefs.volume*.65);purr.play().catch(()=>{$('audio-status').textContent='The purr could not play. Kitty still enjoys the cuddle.';});}petTimeout=setTimeout(()=>{purr?.pause();cat.classList.remove('petted');$('cat-caption').innerHTML='Kitty · your maths companion<br><small>You can pet me ♡</small>';},4000);}
function menu(){stopAll(false);window.MisoYouTube?.pause();cancelDemo();$('voice-auto').checked=!!prefs.auto;$('motion').checked=!!prefs.reduce;$('large').checked=!!prefs.large;$('volume').value=prefs.volume;$('rate').value=prefs.rate;$('menu-dialog').showModal();}
document.addEventListener('miso:navigate',e=>{const {ci:c,si:i}=e.detail;if(Number.isInteger(c)&&Number.isInteger(i)&&C[c]?.steps[i])go(c,i);});
document.addEventListener('miso:help-open',()=>{pauseVoice();cancelDemo();});
document.addEventListener('click',e=>{if(suppressClick&&e.target.closest('#board')){suppressClick=false;return;}const b=e.target.closest('button,[data-point],[data-root]');if(!b)return;
 if(b.dataset.close){$(b.dataset.close).close();return;}
 if(b.dataset.move){const [a,c]=b.dataset.move.split(',').map(Number);move(st.a+a,st.b+c);}if(b.dataset.point){const[a,c]=b.dataset.point.split(',').map(Number);move(a,c);}
 if(b.dataset.turn)turn();if(b.dataset.angle)angle(st.angle+Number(b.dataset.angle));if(b.hasAttribute('data-power'))power();if(b.dataset.root!==undefined)root(+b.dataset.root);if(b.dataset.tile!==undefined)tile(+b.dataset.tile);if(b.dataset.choice!==undefined)choose(+b.dataset.choice);if(b.dataset.product!==undefined)product(b.dataset.product);
 if(b.hasAttribute('data-check-multi')){const s=step();if(st.selected.length===s.answers.length&&s.answers.every(i=>st.selected.includes(i)))complete();else retry();}
 if(b.hasAttribute('data-check-length')){if(st.length===step().targetLength)complete();else retry();}
 if(b.hasAttribute('data-check-rug')){if(st.length===3)complete();else{setSpeech('more');status('Try a different side length. We need exactly 9 pieces.');}}
});
document.addEventListener('input',e=>{if(e.target.id==='angle')angle(+e.target.value,true);if(e.target.id==='length'){st.length=+e.target.value;drawDistance(true);persist();}if(e.target.id==='rug-size'){st.length=+e.target.value;drawRug(true);persist();}if(e.target.id==='number-experiment'){const n=+e.target.value,label=n<0?`(−${Math.abs(n)})`:String(n);$('number-result').textContent=`${label} * ${label} = ${n*n}`;}});
function pointerPosition(e){const el=$('board').querySelector('svg');if(!el)return null;const pt=el.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;return pt.matrixTransform(el.getScreenCTM().inverse());}
document.addEventListener('pointerdown',e=>{suppressClick=false;if(e.target.closest('[data-tile]')){painting=true;tile(+e.target.closest('[data-tile]').dataset.tile);return;}if(e.target.closest('[data-drag]')){drag={kind:step().kind,lastAngle:st.turn*90,accum:0,ci,si};e.preventDefault();}});
document.addEventListener('pointermove',e=>{if(painting){const el=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-tile]');if(el)tile(+el.dataset.tile);}if(!drag)return;const p=pointerPosition(e);if(!p)return;const s=step();if(s.kind==='line')move((p.x-200)/39,0);if(s.kind==='plane')move((p.x-200)/(95/s.range),(133-p.y)/(95/s.range));if(['polar','turn'].includes(s.kind)){const deg=(Math.atan2(132-p.y,p.x-200)*180/Math.PI+360)%360;if(s.kind==='polar')angle(deg);else{let d=(deg-drag.lastAngle+540)%360-180;drag.accum+=d;drag.lastAngle=deg;if(drag.accum>=65){turn();drag.accum-=90;}}}});
document.addEventListener('pointerup',()=>{if(drag||painting)suppressClick=true;drag=null;painting=false;});document.addEventListener('pointercancel',()=>{drag=null;painting=false;});
// Sliders, buttons and arrow keys give a non-drag path through every activity.
document.addEventListener('keydown',e=>{if(document.querySelector('dialog:modal')||/INPUT|SELECT|BUTTON/.test(e.target.tagName)||e.altKey||e.ctrlKey||e.metaKey)return;const s=step();if(['line','plane'].includes(s.kind)&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();const dx=e.key==='ArrowLeft'?-1:e.key==='ArrowRight'?1:0,dy=e.key==='ArrowUp'?1:e.key==='ArrowDown'?-1:0;move(st.a+dx,st.b+dy);}if(s.kind==='turn'&&e.key==='ArrowLeft'){e.preventDefault();turn();}if(s.kind==='polar'&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();angle(st.angle+(e.key==='ArrowLeft'?15:-15));}});
$('pet-miso').onclick=pet;$('listen').onclick=()=>{if(narrator&&!narrator.paused){pauseVoice();return;}prefs.quiet=false;window.MisoSound?.setMuted(false);voiceEnabled=true;$('quiet').textContent='Sound on';$('quiet').setAttribute('aria-pressed','false');speak();persist();};
$('voice-restart').onclick=()=>{stopVoice();prefs.quiet=false;window.MisoSound?.setMuted(false);$('quiet').textContent='Sound on';$('quiet').setAttribute('aria-pressed','false');voiceEnabled=true;speak();persist();};
$('smaller').onclick=()=>setSpeech(speaking==='more'?(st.solved?'success':'say'):'more');$('demo').onclick=demo;
$('quiet').onclick=()=>{prefs.quiet=!prefs.quiet;if(prefs.quiet)stopAll();window.MisoSound?.setMuted(prefs.quiet);$('quiet').textContent=prefs.quiet?'Sound off':'Sound on';$('quiet').setAttribute('aria-pressed',String(prefs.quiet));persist();};
$('next').onclick=()=>{if(!st.solved)return;if(isLast())return window.MisoNavigation.open();if(si+1<chapter().steps.length)go(ci,si+1);else go(ci+1,0);};
$('back').onclick=()=>{if(si>0)go(ci,si-1);else if(ci>0)go(ci-1,C[ci-1].steps.length-1);};$('reset').onclick=()=>go(ci,si);$('menu').onclick=menu;
$('book').onclick=()=>{stopAll();cancelDemo();const n=chapter().page,local=window.MISO_BUILD?.sourcePages!==false;$('book-title').textContent=`${bookChapter().title} · book page ${n}`;$('book-page').hidden=!local;$('book-pdf').hidden=!local;if(local){$('book-page').src=`source-review/page-${String(n).padStart(2,'0')}.png`;$('book-pdf').href=`${bookChapter().source}#page=${n+bookChapter().sourcePageOffset}`;}else{$('book-note').textContent=`Look at printed page ${n} in your own Complex Numbers chapter. Textbook scans and the PDF are not included in this online app. These guided activities introduce the ideas; they do not replace every book exercise.`;}$('book-dialog').showModal();};
$('break').onclick=()=>{stopAll();cancelDemo();$('menu-dialog').close();$('break-dialog').showModal();};
for(const [id,name]of [['voice-auto','auto'],['motion','reduce'],['large','large']])$(id).onchange=e=>{prefs[name]=e.target.checked;document.body.classList.toggle('reduced',!!prefs.reduce);document.body.classList.toggle('large',!!prefs.large);persist();};
$('volume').value=prefs.volume;$('voice-level').textContent=Math.round(prefs.volume*100)+'%';$('rate').value=prefs.rate;
$('volume').oninput=e=>{prefs.volume=+e.target.value;$('voice-level').textContent=Math.round(prefs.volume*100)+'%';if(narrator)narrator.volume=prefs.volume;if(purr)purr.volume=Math.min(.5,prefs.volume*.65);persist();};$('rate').onchange=e=>{prefs.rate=+e.target.value;if(narrator)narrator.playbackRate=prefs.rate;persist();};
window.MisoSound?.setMuted(prefs.quiet);
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopAll();cancelDemo();}});window.addEventListener('pagehide',()=>{stopAll();cancelDemo();});
st=fresh();if(saved.id===step().id&&saved.draft&&typeof saved.draft==='object'){
 const d=saved.draft;for(const field of ['a','b','turn','angle','length','products'])if(Number.isFinite(d[field]))st[field]=d[field];
 for(const field of ['tiles','selected','roots'])if(Array.isArray(d[field]))st[field]=[...new Set(d[field].filter(Number.isInteger))];
 st.solved=d.solved===true;st.assisted=d.assisted===true;st.turn=clamp(st.turn,0,step().turns||step().times||4);st.angle=((st.angle%360)+360)%360;st.products=clamp(st.products,0,4);st.length=clamp(st.length,1,8);st.a=clamp(st.a,-5,5);st.b=clamp(st.b,-5,5);
}
render();
})();
