const {chromium}=require('./runtime.cjs');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const C=require('../miso-lessons.js');require('../miso-story.js');
const root=path.resolve(__dirname,'..'),sandbox={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'miso-voice.js'),'utf8'),sandbox);
const voices=sandbox.window.MISO_VOICE,clips=C.flatMap(c=>c.steps.flatMap(s=>['say','more','success'].map(part=>({id:s.id+'-'+part,text:s[part]}))));
(async()=>{
 assert.equal(Object.keys(voices).length,108);
 for(const {id,text}of clips){const e=voices[id];assert.equal(e.text,text,id);assert.equal(e.words.map(w=>w.text).join(''),text,id);assert.equal(e.timing,'provider WordBoundary');assert.ok(fs.statSync(path.join(root,e.src)).size>1000);let last=0;for(const w of e.words){if(w.start<0)continue;assert.ok(w.start>=last-.001&&w.end>w.start,id);last=w.end;}}
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 try{
  const p=await browser.newPage({viewport:{width:1440,height:1000}});
  await p.addInitScript(()=>{window.__media=[];const Native=Audio;window.Audio=function(...a){const audio=new Native(...a);window.__media.push(audio);return audio;};window.Audio.prototype=Native.prototype;});
  await p.goto('http://127.0.0.1:8765/tutor/game.html');await p.waitForLoadState('networkidle');
  // Browser decodes the complete file, not just its header, for every recording.
  const decoded=await p.evaluate(async()=>{const ac=new AudioContext();const results=[];for(const [id,e]of Object.entries(MISO_VOICE)){const bytes=await(await fetch(e.src)).arrayBuffer();const buffer=await ac.decodeAudioData(bytes);results.push({id,duration:buffer.duration,last:Math.max(...e.words.map(w=>w.end))});}await ac.close();return results;});
  for(const e of decoded)assert.ok(e.duration>=e.last-.1,e.id+' timing exceeds recording');
  await p.locator('#listen').click();await p.waitForFunction(()=>document.querySelector('#speech-text .spoken-now')?.textContent==='yarn');
  await p.locator('#listen').click();const held=await p.evaluate(()=>({time:__media.at(-1).currentTime,word:document.querySelector('.spoken-now')?.textContent}));
  await p.waitForTimeout(300);assert.equal(await p.evaluate(()=>__media.at(-1).currentTime),held.time);
  const count=await p.evaluate(()=>__media.length);await p.locator('#listen').click();await p.waitForFunction(t=>__media.at(-1).currentTime>t+.25,held.time);assert.equal(await p.evaluate(()=>__media.length),count);
  // Seek to the provider boundary for a written number. It must highlight that number.
  await p.evaluate(()=>{const w=MISO_VOICE['line-say'].words.find(w=>w.text==='3');__media.at(-1).currentTime=(w.start+w.end)/2;});
  await p.waitForFunction(()=>document.querySelector('.spoken-now')?.textContent==='3');await p.locator('#listen').click();
  // Exact script guard: a mismatched recording must not be used.
  const before=await p.evaluate(()=>__media.length);await p.evaluate(()=>MISO_VOICE['line-more'].text='stale script');await p.locator('#smaller').click();await p.locator('#listen').click();assert.match(await p.locator('#audio-status').innerText(),/unavailable/);assert.equal(await p.evaluate(()=>__media.length),before);
  console.log(`PASS: ${decoded.length} exact scripts, real provider timing mappings, all MP3s fully decoded, live word/number highlighting, same-player pause/resume, stale-script guard. No subjective voice-quality claim.`);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
