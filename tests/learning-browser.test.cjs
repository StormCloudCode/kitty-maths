const {chromium}=require('./runtime.cjs'),assert=require('node:assert/strict'),{spawn}=require('node:child_process'),path=require('node:path'),fs=require('node:fs');
const root=path.resolve(__dirname,'..'),remote=process.env.MISO_PUBLIC_URL,base=remote||'http://127.0.0.1:8766/';
const server=remote?null:spawn(process.execPath,[path.join(root,'tools/release/serve.cjs')],{stdio:['ignore','pipe','inherit']});
async function ready(){for(let n=0;n<60;n++){try{if((await fetch(base)).ok)return;}catch{}await new Promise(r=>setTimeout(r,250));}throw Error('App server did not start');}
(async()=>{let browser;try{
 await ready();browser=await chromium.launch({headless:true,channel:process.env.CI?undefined:'chrome'});
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith(new URL(base).origin)&&!r.url().startsWith('blob:'))external.push(r.url());});
 await page.goto(base);await page.waitForLoadState('networkidle');
 assert.equal(await page.locator('#transcript').evaluate(d=>d.open),false);
 assert.match(await page.locator('#scene-purpose').innerText(),/shelf/);
 await page.screenshot({path:path.join(__dirname,'learning-desktop.png'),fullPage:true});
 await page.locator('#listen').click();await page.waitForFunction(()=>!!document.querySelector('.spoken-now'));
 assert.equal(await page.locator('#speech-text').isVisible(),true);
 await page.locator('#transcript summary').click();await page.waitForFunction(()=>document.querySelector('#listen').textContent==='Resume Kitty');
 await page.locator('#listen').click();assert.equal(await page.locator('#transcript').evaluate(d=>d.open),true);
 await page.locator('#video-options').click();assert.equal(await page.locator('#listen').innerText(),'Resume Kitty');
 assert.match(await page.locator('#video-title').innerText(),/Number Line/);
 assert.match(await page.locator('#video-evidence').textContent(),/8,620 likes/);
 await page.locator('#video-edit summary').click();
 await page.locator('#video-label').fill('My better explanation');await page.locator('#video-url').fill('https://example.com/not-youtube');await page.locator('#video-form button[type=submit]').click();
 assert.match(await page.locator('#video-status').innerText(),/specific YouTube/);
 await page.locator('#video-url').fill('https://youtu.be/B4zejSI8zho?t=60&si=remove');await page.locator('#video-form button[type=submit]').click();
 assert.match(await page.locator('#video-status').innerText(),/Other learners are unchanged/);assert.match(await page.locator('#video-teacher').innerText(),/not reviewed/);assert.doesNotMatch(await page.locator('#video-evidence').textContent(),/likes/);
 const expected='https://www.youtube.com/watch?v=B4zejSI8zho&t=60s';assert.equal(await page.locator('#lesson-video').getAttribute('href'),expected);
 const downloadEvent=page.waitForEvent('download');await page.locator('#video-export').click();const download=await downloadEvent;const exported=JSON.parse(fs.readFileSync(await download.path(),'utf8'));assert.equal(exported.links.line.url,expected);
 await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>document.activeElement.id),'video-options');await page.reload();await page.waitForLoadState('networkidle');assert.equal(await page.locator('#lesson-video').getAttribute('href'),expected);
 await page.locator('#video-options').click();await page.locator('#video-edit summary').click();await page.locator('#video-reset').click();assert.match(await page.locator('#lesson-video').getAttribute('href'),/RSJOTBJlKNA/);
 const upload=async obj=>page.locator('#video-import').setInputFiles({name:'links.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(obj))});
 await upload(exported);await page.waitForFunction(()=>document.querySelector('#video-status').textContent.startsWith('Imported'));assert.equal(await page.locator('#lesson-video').getAttribute('href'),expected);
 const before=await page.evaluate(()=>localStorage.getItem('kitty-teacher-videos-v1'));
 await upload({schema:1,links:{line:{title:'Not applied',url:'https://youtu.be/OAoLCXpao6s'},negative:{title:'Bad',url:'javascript:alert(1)'}}});await page.waitForFunction(()=>document.querySelector('#video-status').textContent.startsWith('Import failed'));
 assert.equal(await page.evaluate(()=>localStorage.getItem('kitty-teacher-videos-v1')),before,'invalid import must not partially apply');
 await page.keyboard.press('Escape');
 // Exercise the real anchor/new-tab behaviour without contacting YouTube.
 await page.context().route('https://www.youtube.com/**',route=>route.fulfill({contentType:'text/html',body:'External teacher navigation test'}));
 const popupEvent=page.waitForEvent('popup');await page.locator('#lesson-video').click();const popup=await popupEvent;await popup.waitForLoadState();assert.equal(popup.url(),expected);await popup.close();
 await page.locator('#quick-help').click();await page.locator('#help-video-options').click();await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>document.activeElement.id),'help-video-options');await page.keyboard.press('Escape');
 // Navigate through the real menu; test every lesson link and each added manipulative.
 const rows=await page.evaluate(()=>MISO_COURSE.chapters.flatMap(c=>c.sections).flatMap((s,ci)=>s.steps.map((st,si)=>({id:st.id,ci,si}))));
 async function navigate(row){await require('./navigation-helper.cjs')(page,row.ci,row.si);}
 let visuals=0;for(const row of rows){await navigate(row);assert.ok(await page.locator('#scene-purpose').innerText(),row.id);assert.match(await page.locator('#lesson-video').getAttribute('href'),/^https:\/\/www.youtube.com\/watch\?v=/);assert.match(await page.locator('#lesson-google').getAttribute('href'),/^https:\/\/www.google.com\/search/);
  if(await page.locator('.mini-scene').count()){visuals++;const prior=await page.locator('#scene-drawing').innerHTML();if(await page.locator('[data-scene-action]').count())await page.locator('[data-scene-action]').click();else await page.locator('[data-scene-slider]').fill('60');assert.notEqual(await page.locator('#scene-drawing').innerHTML(),prior,row.id+' picture changes');assert.equal(await page.locator('#next').isDisabled(),true,'exploration does not auto-complete quiz');}
  if(row.id==='define-i'){await page.locator('[data-scene-action]').click();assert.match(await page.locator('#scene-caption').innerText(),/i \* i = −1/);await page.screenshot({path:path.join(__dirname,'learning-imaginary.png'),fullPage:true});}
  if(row.id==='surd')await page.screenshot({path:path.join(__dirname,'learning-rug.png'),fullPage:true});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,row.id);
 }
 assert.equal(visuals,14);
 await page.setViewportSize({width:390,height:844});for(const id of ['line','define-i','divide','surd','identity']){await navigate(rows.find(r=>r.id===id));assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'mobile '+id);}
 await page.screenshot({path:path.join(__dirname,'learning-mobile.png'),fullPage:true});await page.locator('#video-options').click();await page.locator('#video-edit summary').click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.equal(await page.locator('#video-dialog').evaluate(d=>d.scrollWidth>d.clientWidth),false);await page.keyboard.press('Escape');
 // Storage unavailable: don't pretend the edit was saved, and keep the live link unchanged.
 await page.locator('#video-options').click();await page.locator('#video-edit summary').click();const original=await page.locator('#lesson-video').getAttribute('href');
 await page.evaluate(()=>{Storage.prototype.setItem=function(){throw new DOMException('No storage','QuotaExceededError');};});await page.locator('#video-label').fill('Unsaved');await page.locator('#video-url').fill(expected);await page.locator('#video-form button[type=submit]').click();assert.match(await page.locator('#video-status').innerText(),/not applied/);assert.equal(await page.locator('#lesson-video').getAttribute('href'),original);
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 console.log('PASS: 36 lesson links/cues, 14 responsive manipulatives, visible transcript during speech, close-to-pause, edit/reload/reset/export/import, atomic bad import, custom evidence labels, focus restoration, mobile, storage failure, no external requests or JS errors.');
}finally{await browser?.close();server?.kill();}})().catch(e=>{console.error(e);process.exitCode=1;});
