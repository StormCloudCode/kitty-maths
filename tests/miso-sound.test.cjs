const {chromium}=require('./runtime.cjs');
const assert=require('node:assert/strict');
const path=require('node:path');
const navigate=require('./navigation-helper.cjs');
function wav(){const n=24000*12,b=Buffer.alloc(44+n*2);b.write('RIFF');b.writeUInt32LE(36+n*2,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(24000,24);b.writeUInt32LE(48000,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(n*2,40);for(let i=0;i<n;i++)b.writeInt16LE(Math.round(1800*Math.sin(2*Math.PI*220*i/24000)),44+i*2);return b;}
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 try{
 const context=await browser.newContext({viewport:{width:1280,height:900}});
 await context.addInitScript(()=>{window.__media=[];const Actual=Audio;window.Audio=function(...args){const a=new Actual(...args);window.__media.push(a);return a;};window.Audio.prototype=Actual.prototype;window.__osc=[];const Original=AudioContext.prototype.createOscillator;AudioContext.prototype.createOscillator=function(){const o=Original.call(this);window.__osc.push(o);return o;};window.speechSynthesis.speak=()=>{throw Error('Device voice is forbidden');};});
 const p=await context.newPage(),errors=[],external=[];p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>{if(!/^(http:\/\/127\.0\.0\.1:8765\/|blob:|data:)/.test(r.url()))external.push(r.url());});
 await p.goto('http://127.0.0.1:8765/tutor/game.html');await p.waitForLoadState('networkidle');
 assert.match(await p.locator('#lesson-title').innerText(),/3 spaces/);assert.equal(await p.evaluate(()=>__media.filter(a=>!a.paused).length),0);
 await p.locator('#listen').click();await p.waitForFunction(()=>__media.some(a=>a.src.endsWith('line-say.mp3')&&!a.paused));await p.locator('#listen').click();
 await p.locator('#sound-open').click();await p.locator('#music-file').setInputFiles({name:'My private music.wav',mimeType:'audio/wav',buffer:wav()});
 await p.waitForFunction(()=>!document.querySelector('#music-play').disabled);
 assert.equal(await p.locator('#music-name').innerText(),'My private music.wav');assert.equal(await p.evaluate(()=>__media.at(-1).paused),true,'file selection must not autoplay');
 await p.locator('#music-volume').fill('0.37');await p.locator('#volume').fill('0.66');await p.locator('#music-play').click();await p.waitForFunction(()=>__media.find(a=>a.src.startsWith('blob:'))?.currentTime>.35);
 assert.equal(await p.evaluate(()=>__media.find(a=>a.src.startsWith('blob:')).volume),.37);
 await p.locator('#music-play').click();const held=await p.evaluate(()=>__media.find(a=>a.src.startsWith('blob:')).currentTime);await p.waitForTimeout(300);assert.equal(await p.evaluate(()=>__media.find(a=>a.src.startsWith('blob:')).currentTime),held);
 const mediaCount=await p.evaluate(()=>__media.length);await p.locator('#music-play').click();await p.waitForFunction(t=>__media.find(a=>a.src.startsWith('blob:')).currentTime>t+.2,held);assert.equal(await p.evaluate(()=>__media.length),mediaCount,'resume reuses player');
 await p.locator('#music-seek').fill('4');assert.ok(await p.evaluate(()=>__media.find(a=>a.src.startsWith('blob:')).currentTime>=4));
 await p.locator('#music-loop').uncheck();assert.equal(await p.evaluate(()=>__media.find(a=>a.src.startsWith('blob:')).loop),false);await p.locator('#music-loop').check();
 assert.equal(await p.locator('[id^="drone-"]').count(),0);assert.deepEqual(await p.evaluate(()=>__osc.map(o=>o.frequency.value)),[],'no drone oscillators');
 await p.screenshot({path:path.join(__dirname,'miso-sound-panel.png'),fullPage:true});
 await p.locator('[data-close="sound-dialog"]').click();assert.equal(await p.evaluate(()=>__media.find(a=>a.src.startsWith('blob:')).paused),false,'closing controls preserves background');
 await p.locator('[data-point="3,0"]').click();await p.locator('#next').click();assert.equal(await p.evaluate(()=>__media.find(a=>a.src.startsWith('blob:')).paused),false,'music continues through lessons');
 await p.locator('#quiet').click();assert.equal(await p.evaluate(()=>__media.filter(a=>!a.paused).length),0);await p.locator('#sound-open').click();await p.locator('#music-play').click();assert.match(await p.locator('#music-status').innerText(),/muted/);await p.locator('[data-close="sound-dialog"]').click();await p.locator('#quiet').click();assert.equal(await p.evaluate(()=>__media.filter(a=>!a.paused).length),0,'unmute does not unexpectedly restart');
 // A real existing recording with unchanged text checks genuine voice resume.
 await navigate(p,2);await p.locator('#demo').click();await p.waitForFunction(()=>!document.querySelector('#next').disabled);
 if(await p.locator('#listen').getAttribute('aria-pressed')!=='true')await p.locator('#listen').click();await p.waitForFunction(()=>__media.some(a=>a.src.endsWith('addition-success.mp3')&&!a.paused&&a.currentTime>.25));
 await p.locator('#listen').click();const voiceTime=await p.evaluate(()=>__media.find(a=>a.src.endsWith('addition-success.mp3')).currentTime);await p.waitForTimeout(300);assert.equal(await p.evaluate(()=>__media.find(a=>a.src.endsWith('addition-success.mp3')).currentTime),voiceTime);assert.equal(await p.locator('#listen').innerText(),'Resume Kitty');
 const countBefore=await p.evaluate(()=>__media.length);await p.locator('#listen').click();await p.waitForFunction(t=>__media.find(a=>a.src.endsWith('addition-success.mp3')).currentTime>t+.2,voiceTime);assert.equal(await p.evaluate(()=>__media.length),countBefore,'voice resumes same Audio object');
 await p.locator('#sound-open').click();await p.locator('#music-play').click();assert.ok(Math.abs(await p.evaluate(()=>__media.find(a=>a.src.startsWith('blob:')).volume)-.37*.25)<.0001,'music ducks under narration');assert.equal(await p.evaluate(()=>__media.find(a=>a.src.endsWith('addition-success.mp3')).volume),.66,'voice volume independent');await p.locator('[data-close="sound-dialog"]').click();
 await p.locator('#listen').click();assert.equal(await p.evaluate(()=>__media.find(a=>a.src.startsWith('blob:')).volume),.37,'music level restored at pause');
 await p.locator('#voice-restart').click();await p.waitForFunction(()=>__media.filter(a=>a.src.endsWith('addition-success.mp3')).at(-1).currentTime>0);assert.ok(await p.evaluate(()=>__media.filter(a=>a.src.endsWith('addition-success.mp3')).at(-1).currentTime<1));
 await p.locator('#pet-miso').click();await p.waitForFunction(()=>__media.some(a=>a.src.endsWith('purr.ogg')&&!a.paused));assert.equal(await p.evaluate(()=>__media.filter(a=>a.src.endsWith('addition-success.mp3')).every(a=>a.paused)),true);
 await p.locator('#menu').click();await p.locator('#break').click();assert.equal(await p.evaluate(()=>__media.filter(a=>!a.paused).length),0);await p.locator('[data-close="break-dialog"]').click();
 await p.locator('#sound-open').click();await p.locator('#music-file').setInputFiles({name:'broken.mp3',mimeType:'audio/mpeg',buffer:Buffer.from('not audio')});await p.waitForFunction(()=>document.querySelector('#music-status').textContent.includes('could not'));assert.equal(await p.locator('#music-play').isDisabled(),true);await p.locator('#music-remove').click();assert.equal(await p.locator('#music-name').innerText(),'No music loaded');
 await p.reload();await p.waitForLoadState('networkidle');await p.locator('#sound-open').click();assert.equal(await p.locator('#music-volume').inputValue(),'0.37');assert.equal(await p.locator('#volume').inputValue(),'0.66');assert.equal(await p.locator('#music-name').innerText(),'No music loaded');assert.equal(await p.evaluate(()=>__media.filter(a=>!a.paused).length),0);
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 await p.setViewportSize({width:390,height:844});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await p.screenshot({path:path.join(__dirname,'miso-sound-mobile.png'),fullPage:true});
 console.log('PASS: local upload; no external requests; no autoplay; music pause/resume/seek/loop/remove/error; independent saved levels; no drone; mute and break; genuine recorded-voice pause/resume/restart; ducking; stale-script protection; mobile layout.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
