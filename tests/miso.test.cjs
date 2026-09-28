const {chromium}=require('./runtime.cjs');
const assert=require('node:assert/strict');
const path=require('node:path');
const navigate=require('./navigation-helper.cjs');
const C=require('../miso-lessons.js'),M=require('../math.js');
require('../miso-story.js');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();
 const errors=[],external=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:8765/')&&!r.url().startsWith('data:'))external.push(r.url());});
 await page.goto('http://127.0.0.1:8765/tutor/game.html');await page.waitForLoadState('networkidle');
 assert.equal(await page.locator('#lesson-title').innerText(),C[0].steps[0].title);
 await page.screenshot({path:path.join(__dirname,'miso-desktop.png'),fullPage:true});
 // Petting has an actual media file, no oscillator. Quiet mode still gives visual affection.
 await page.locator('#quiet').click();await page.locator('#pet-miso').click();assert.match(await page.locator('#cat-caption').innerText(),/lovely/);
 let count=0;
 for(let c=0;c<C.length;c++)for(let i=0;i<C[c].steps.length;i++){
  const s=C[c].steps[i];assert.equal(await page.locator('#lesson-title').innerText(),s.title);
  assert.equal(await page.locator('.symbol').count(),s.tokens.length);
  assert.equal(await page.locator('#speech-text').innerText(),s.say);
  await page.locator('#smaller').click();assert.equal(await page.locator('#speech-text').innerText(),s.more);await page.locator('#smaller').click();
  if(['line','plane'].includes(s.kind)){
   for(const [dx,dy,n]of [[Math.sign(s.target[0]-s.start[0]),0,Math.abs(s.target[0]-s.start[0])],[0,Math.sign(s.target[1]-s.start[1]),Math.abs(s.target[1]-s.start[1])]])
    for(let k=0;k<n;k++)await page.locator(`[data-move="${dx},${dy}"]`).click();
  }else if(s.kind==='tiles'){for(let n=0;n<9;n++)await page.locator(`[data-tile="${n}"]`).click();}
  else if(s.kind==='rug'){await page.locator('[data-check-rug]').click();assert.equal(await page.locator('#next').isDisabled(),true);await page.locator('#rug-size').fill('3');assert.equal(await page.locator('.fabric-piece').count(),9);await page.locator('[data-check-rug]').click();await page.screenshot({path:path.join(__dirname,'miso-rug.png'),fullPage:true});}
  else if(s.kind==='choice'){await page.locator(`[data-choice="${(s.answer+1)%s.options.length}"]`).click();assert.equal(await page.locator('#next').isDisabled(),true);await page.locator(`[data-choice="${s.answer}"]`).click();}
  else if(s.kind==='multi'){await page.locator(`[data-choice="2"]`).click();await page.locator('[data-check-multi]').click();assert.equal(await page.locator('#next').isDisabled(),true);await page.locator(`[data-choice="2"]`).click();for(const n of s.answers)await page.locator(`[data-choice="${n}"]`).click();await page.locator('[data-check-multi]').click();}
  else if(s.kind==='turn'){for(let n=0;n<s.turns;n++)await page.locator('[data-turn]').click();}
  else if(s.kind==='power'){for(let n=0;n<s.times;n++)await page.locator('[data-power]').click();}
  else if(s.kind==='polar'){await page.locator('#angle').focus();for(let n=0;n<s.targetAngle/15;n++)await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#angle').inputValue(),String(s.targetAngle));}
  else if(s.kind==='distance'){await page.locator('[data-check-length]').click();assert.equal(await page.locator('#next').isDisabled(),true);await page.locator('#length').focus();for(let n=1;n<5;n++)await page.keyboard.press('ArrowRight');await page.locator('[data-check-length]').click();}
  else if(s.kind==='roots'){for(let n=0;n<s.n;n++)await page.locator(`#controls [data-root="${n}"]`).click();}
  else if(s.kind==='products'){for(const value of [M.complex(s.a*s.c,0),M.complex(0,s.a*s.d),M.complex(0,s.b*s.c),M.complex(-s.b*s.d,0)])await page.locator(`[data-product="${value}"]`).click();}
  assert.equal(await page.locator('#next').isDisabled(),false,s.id);
  assert.equal(await page.locator('#speech-text').innerText(),s.success,s.id);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,s.id+' overflow');
  if(s.id==='complex'||s.id==='twice'||s.id==='book-product')await page.screenshot({path:path.join(__dirname,`miso-${s.id}.png`),fullPage:true});
  count++;
  if(c<C.length-1||i<C[c].steps.length-1)await page.locator('#next').click();
 }
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('miso-maths-v1')).done.length),count);
 await page.reload();await page.waitForLoadState('networkidle');assert.equal(await page.locator('#next').isDisabled(),false);
 assert.equal(await page.locator('[data-chapter]').count(),C.length);await navigate(page,0);
 // Actual drag on SVG coordinates, not a state shortcut.
 async function svgPoint(x,y){return page.locator('#board svg').evaluate((el,[x,y])=>{const pt=el.createSVGPoint();pt.x=x;pt.y=y;const q=pt.matrixTransform(el.getScreenCTM());return {x:q.x,y:q.y};},[x,y]);}
 const start=await svgPoint(200,110),end=await svgPoint(317,110);await page.mouse.move(start.x,start.y);await page.mouse.down();await page.mouse.move(end.x,end.y,{steps:8});await page.mouse.up();assert.equal(await page.locator('#next').isDisabled(),false);
 await page.locator('#reset').click();await page.locator('#activity').focus();await page.keyboard.press('ArrowRight');await page.reload();await page.waitForLoadState('networkidle');assert.match(await page.locator('#board-status').innerText(),/at 1/);
 await page.locator('#book').click();await page.locator('#book-page').evaluate(img=>img.decode());assert.ok(await page.locator('#book-page').evaluate(img=>img.naturalWidth>500));await page.locator('[data-close="book-dialog"]').click();
 await page.locator('#menu').click();await page.locator('#motion').check();await page.locator('#large').check();await page.locator('#break').click();assert.equal(await page.locator('#break-dialog').isVisible(),true);await page.locator('[data-close="break-dialog"]').click();
 assert.equal(await page.locator('body').evaluate(b=>b.classList.contains('reduced')&&b.classList.contains('large')),true);
 const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'}),phone=await mobile.newPage();
 await phone.goto('http://127.0.0.1:8765/tutor/game.html');await phone.waitForLoadState('networkidle');await phone.screenshot({path:path.join(__dirname,'miso-mobile.png'),fullPage:true});
 for(let c=0;c<C.length;c++){
  await navigate(phone,c);
  assert.equal(await phone.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'mobile chapter '+c);
 }
 await navigate(phone,0);await phone.locator('[data-point="3,0"]').tap();assert.equal(await phone.locator('#next').isDisabled(),false);
 // Local-file mode has no fetch or module dependency.
 const local=await context.newPage();await local.goto('file:///'+path.resolve(__dirname,'../game.html').replace(/\\/g,'/'));await local.waitForLoadState('load');assert.match(await local.locator('h1').innerText(),/yarn/);
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 await browser.close();console.log(`PASS: ${count} guided steps, all correct paths, wrong choices, symbol labels, actual SVG drag, keyboard sliders, phone taps/layout, saving, source images, settings, local-file mode. No page errors or external requests.`);
})().catch(e=>{console.error(e);process.exit(1);});
