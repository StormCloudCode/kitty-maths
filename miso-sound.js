/* Local-only music player. No file bytes or names are sent to a server. */
(() => {
 'use strict';
 const $=id=>document.getElementById(id);
 let settings={music:.25,duck:true};
 try{Object.assign(settings,JSON.parse(localStorage.getItem('miso-sound-v1')||'{}'));}catch{}
 delete settings.drone;
 settings.music=Number.isFinite(+settings.music)?Math.min(1,Math.max(0,+settings.music)):.25;
 let music=null,url=null,muted=false,talking=false,loadId=0;
 const save=()=>{try{localStorage.setItem('miso-sound-v1',JSON.stringify(settings));}catch{}};
 const duck=()=>talking && settings.duck ? .25 : 1;
 function gains(){
  if(music)music.volume=muted?0:settings.music*duck();
  window.MisoYouTube?.setMix({muted,talking,duck:settings.duck});
 }
 function musicState(){const playing=music&&!music.paused;$('music-play').textContent=playing?'Pause music':'Play music';$('music-play').setAttribute('aria-pressed',String(!!playing));}
 function clock(seconds){if(!Number.isFinite(seconds))return '0:00';return `${Math.floor(seconds/60)}:${String(Math.floor(seconds%60)).padStart(2,'0')}`;}
 function pause(includeYouTube=true){music?.pause();musicState();gains();if(includeYouTube)window.MisoYouTube?.pause();}
 function clear(){loadId++;if(music){music.pause();music.removeAttribute('src');music.load();music=null;}if(url)URL.revokeObjectURL(url);url=null;$('music-file').value='';$('music-name').textContent='No music loaded';$('music-status').textContent='Choose an audio file from your device. It is not uploaded.';$('music-time').textContent='0:00 / 0:00';$('music-seek').value=0;for(const id of ['music-play','music-remove','music-seek'])$(id).disabled=true;musicState();}
 $('sound-open').onclick=()=>{window.MisoYouTube?.pause();$('sound-dialog').showModal();};
 $('music-file').onchange=()=>{
  const file=$('music-file').files[0];if(!file)return;
  clear();const id=loadId;url=URL.createObjectURL(file);music=new Audio(url);const audio=music;
  audio.loop=$('music-loop').checked;audio.preload='metadata';gains();$('music-name').textContent=file.name;
  $('music-remove').disabled=false;$('music-status').textContent='Loading locally…';
  audio.onloadedmetadata=()=>{if(id!==loadId)return;$('music-play').disabled=false;$('music-seek').disabled=!Number.isFinite(audio.duration);$('music-seek').max=audio.duration||0;$('music-status').textContent='Ready. Press Play music when you want to hear it.';audio.ontimeupdate();};
  audio.ontimeupdate=()=>{if(id!==loadId)return;$('music-seek').value=audio.currentTime;$('music-time').textContent=`${clock(audio.currentTime)} / ${clock(audio.duration)}`;};
  audio.onpause=audio.onplay=audio.onended=musicState;
  audio.onerror=()=>{if(id!==loadId)return;$('music-play').disabled=true;$('music-seek').disabled=true;$('music-status').textContent='This file could not be played. Try an MP3, WAV, M4A or OGG file supported by your browser.';};
 };
 $('music-play').onclick=async()=>{if(!music)return;if(!music.paused){music.pause();return;}if(muted){$('music-status').textContent='Sound is muted. Use Sound on at the top of the lesson first.';return;}try{await music.play();$('music-status').textContent='Playing your local file. Closing this panel keeps the music playing.';}catch{$('music-status').textContent='Could not play this file. Try another audio file.';}musicState();};
 $('music-remove').onclick=clear;
 $('music-seek').oninput=e=>{if(music&&Number.isFinite(music.duration))music.currentTime=Math.min(music.duration,+e.target.value);};
 $('music-loop').onchange=e=>{if(music)music.loop=e.target.checked;};
 for(const k of ['music']){const slider=$(k+'-volume');slider.value=settings[k];$(k+'-level').textContent=Math.round(settings[k]*100)+'%';slider.oninput=e=>{settings[k]=+e.target.value;$(k+'-level').textContent=Math.round(settings[k]*100)+'%';gains();save();};}
 $('music-duck').checked=!!settings.duck;$('music-duck').onchange=e=>{settings.duck=e.target.checked;gains();save();};
 window.MisoSound={pause,setMuted(value){muted=!!value;if(muted)pause();gains();},setNarrating(value){talking=!!value;gains();}};
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
 window.addEventListener('pagehide',()=>{pause();if(url)URL.revokeObjectURL(url);});
})();
