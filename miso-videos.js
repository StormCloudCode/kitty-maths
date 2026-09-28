/* Optional, user-chosen outbound video links. No embeds, trackers or automatic requests. */
(function(root){
 'use strict';
 const catalog=root.MISO_VIDEO_CATALOG||(typeof require==='function'?require('./miso-video-catalog.js'):null),KEY='kitty-teacher-videos-v1';
 function normalise(raw){
  const u=new URL(String(raw).trim());if(u.protocol!=='https:'||u.username||u.password||u.port)throw Error('Use an https:// YouTube video link.');
  const host=u.hostname.toLowerCase();let id;
  if(host==='youtu.be')id=u.pathname.slice(1);
  else if(['youtube.com','www.youtube.com','m.youtube.com'].includes(host)){
   if(u.pathname==='/watch')id=u.searchParams.get('v');
   else if(/^\/(embed|shorts)\/[\w-]{11}$/.test(u.pathname))id=u.pathname.split('/')[2];
  }
  if(!/^[\w-]{11}$/.test(id||''))throw Error('Paste a specific YouTube video, not a channel, playlist or search.');
  let rawTime=u.searchParams.get('t')||u.searchParams.get('start')||'0',seconds=0;
  if(/^\d+$/.test(rawTime))seconds=+rawTime;
  else{const m=rawTime.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);if(!m||!m[0])throw Error('Use a valid video start time.');seconds=+(m[1]||0)*3600+ +(m[2]||0)*60+ +(m[3]||0);}
  if(!Number.isSafeInteger(seconds)||seconds>86400)throw Error('Video start time is too large.');
  return `https://www.youtube.com/watch?v=${id}${seconds?'&t='+seconds+'s':''}`;
 }
 function validate(input){
  if(!input||input.schema!==1||!input.links||typeof input.links!=='object'||Array.isArray(input.links))throw Error('This is not a Kitty video-links file.');
  const clean={};for(const [id,entry]of Object.entries(input.links)){
   if(!Object.hasOwn(catalog.links,id)||!entry||typeof entry.title!=='string'||!entry.title.trim()||entry.title.length>140||typeof entry.url!=='string')throw Error('A lesson or video entry is invalid. Nothing was imported.');
   clean[id]={title:entry.title.trim(),url:normalise(entry.url)};
  }return clean;
 }
 const api={normalise,validate};if(typeof module!=='undefined')module.exports=api;if(typeof document==='undefined')return;
 const $=id=>document.getElementById(id),dialog=$('video-dialog');let current,opener,overrides={},storageOK=true;
 try{const raw=localStorage.getItem(KEY);if(raw)overrides=validate(JSON.parse(raw));}catch{storageOK=false;}
 function persist(next){try{localStorage.setItem(KEY,JSON.stringify({schema:1,links:next}));overrides=next;storageOK=true;return true;}catch{storageOK=false;$('video-status').textContent='Your browser could not save this change. It is not applied. Copy your new link somewhere safe before closing.';return false;}}
 const pause=()=>{document.dispatchEvent(new Event('miso:help-open'));root.MisoSound?.pause();};
 const duration=n=>`${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`;
 function entry(which=0){const row=catalog.links[current.id],v=catalog.videos[row[which]];return {...v,url:normalise(`https://www.youtube.com/watch?v=${v.id}${which===0&&row[2]?'&t='+row[2]+'s':''}`)};}
 function selected(){return overrides[current.id]?{...overrides[current.id],custom:true}:entry();}
 function render(){
  const v=selected(),other=entry(1);$('video-lesson').textContent=current.title;$('video-title').textContent=v.title;$('video-watch').href=v.url;
  $('video-teacher').textContent=v.custom?'Your replacement video · not reviewed by Kitty':`${v.teacher} · ${duration(v.seconds)} · human-led lesson`;
  $('video-note').textContent=v.custom?'You chose this video. Check the teaching, suitability and availability before sharing it.':v.note;
  $('video-evidence').textContent=v.custom?'Ratings and content have not been checked for your replacement.':`${v.likes.toLocaleString('en-IE')} likes · ${v.views.toLocaleString('en-IE')} views. Checked ${catalog.checked}. Popularity is not a teaching-quality score.`;
  $('video-caution').textContent=v.caution||'';$('video-caution').hidden=!v.caution;
  $('video-alternative').textContent=`Another explanation: ${other.teacher} — ${other.title} ↗`;$('video-alternative').href=other.url;
  $('video-alternative').title=other.caution||other.note;
  let warning=$('video-alternative-caution');if(!warning){warning=document.createElement('p');warning.id='video-alternative-caution';warning.className='fine-print video-caution';$('video-alternative').after(warning);}warning.textContent=other.caution?'Alternative video — '+other.caution:'';warning.hidden=!other.caution;
  $('video-url').value=v.url;$('video-label').value=v.title;$('video-reset').disabled=!overrides[current.id];
  $('video-status').textContent=storageOK?'':'Saved video preferences could not be loaded. Defaults are shown.';
  $('lesson-video').href=v.url;$('help-video').href=v.url;
  $('lesson-video').setAttribute('aria-label',`Watch a human teacher on YouTube: ${v.title}`);
 }
 function open(){if(!current)return;opener=document.activeElement;pause();render();$('video-edit').open=false;dialog.showModal();}
 $('video-options').onclick=open;$('help-video-options').onclick=open;$('video-close').onclick=()=>dialog.close();
 dialog.addEventListener('close',()=>opener?.isConnected&&opener.focus({preventScroll:true}));
 for(const id of ['lesson-video','help-video','video-watch','video-alternative'])$(id).addEventListener('click',pause);
 $('video-form').onsubmit=e=>{e.preventDefault();try{const title=$('video-label').value.trim();if(!title||title.length>140)throw Error('Add a short name for the video.');const next={...overrides,[current.id]:{title,url:normalise($('video-url').value)}};if(persist(next)){render();$('video-status').textContent='Saved for this lesson in this browser. Other learners are unchanged.';}}catch(err){$('video-status').textContent=err.message;}};
 $('video-reset').onclick=()=>{const next={...overrides};delete next[current.id];if(persist(next)){render();$('video-status').textContent='Kitty’s original video is restored for this lesson.';}};
 $('video-export').onclick=()=>{const blob=new Blob([JSON.stringify({schema:1,links:overrides},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='kitty-video-links.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('video-status').textContent='Exported your replacements. Import the file on another device to use them there.';};
 $('video-import').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{if(f.size>100000)throw Error('That file is too large for a video-links file.');const imported=validate(JSON.parse(await f.text()));const next={...overrides,...imported};if(persist(next)){render();$('video-status').textContent=`Imported ${Object.keys(imported).length} replacements into this browser.`;}}catch(err){$('video-status').textContent='Import failed: '+err.message;}finally{e.target.value='';}};
 root.MisoVideos={update(step){current=step;render();},open};
})(typeof window!=='undefined'?window:globalThis);
