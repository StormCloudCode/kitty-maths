const {chromium}=require('./runtime.cjs'),assert=require('node:assert/strict'),{spawn}=require('node:child_process'),path=require('node:path');
const root=path.resolve(__dirname,'..'),remote=process.env.MISO_PUBLIC_URL,base=remote||'http://127.0.0.1:8766/';
const server=remote?null:spawn(process.execPath,[path.join(root,'tools/release/serve.cjs')],{stdio:['ignore','pipe','inherit']});
async function ready(){for(let n=0;n<60;n++){try{if((await fetch(base)).ok)return;}catch{}await new Promise(r=>setTimeout(r,250));}throw Error('Published build did not start');}
(async()=>{
 let browser;
 try{
  await ready();browser=await chromium.launch({headless:true,channel:process.env.CI?undefined:'chrome'});
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],missing=[],external=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)missing.push(r.url());});page.on('request',r=>{if(!r.url().startsWith(new URL(base).origin))external.push(r.url());});
  await page.goto(base);await page.waitForLoadState('networkidle');assert.match(await page.title(),/Kitty/);assert.doesNotMatch(await page.locator('body').innerText(),/\bMiso\b/i);assert.ok((await page.locator('.app-version').innerText()).startsWith('v'+require('../package.json').version));assert.equal(await page.locator('.contents-chapter').count(),10);
  assert.equal(await page.locator('[id^="drone-"], [id^="youtube-"]').count(),0);assert.equal(await page.locator('[data-nav-step]').count(),36);
  await page.locator('#quick-help').click();assert.match(await page.locator('#help-title').innerText(),/number line/);await page.keyboard.press('Escape');
  await page.locator('#listen').click();await page.waitForFunction(()=>document.querySelector('.spoken-now'));await page.locator('#listen').click();assert.equal(await page.locator('#listen').innerText(),'Resume Kitty');
  await page.locator('[data-point="3,0"]').click();assert.equal(await page.locator('#chapter-percent').innerText(),'3%');await page.reload();await page.waitForLoadState('networkidle');assert.equal(await page.locator('#chapter-percent').innerText(),'3%');
  await page.locator('#book').click();assert.match(await page.locator('#book-note').innerText(),/not included/);assert.equal(await page.locator('#book-page').isVisible(),false);await page.locator('[data-close="book-dialog"]').click();
  assert.equal(await page.locator('a[href*=".pdf"]').evaluateAll(a=>a.filter(el=>!el.hidden).length),0,'no visible broken textbook links');
  await page.setViewportSize({width:390,height:844});await page.locator('#contents-toggle').click();assert.equal(await page.locator('#contents-dialog').evaluate(d=>d.matches(':modal')),true);await page.keyboard.press('Escape');
  await page.locator('#quick-help').click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.keyboard.press('Escape');
  for(const href of await page.locator('a[href]').evaluateAll(links=>links.filter(a=>!a.hidden).map(a=>a.getAttribute('href')))){
   if(/^(https?:|#)/.test(href))continue;assert.equal((await page.request.get(new URL(href,base).href)).ok(),true,href);
  }
  assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);assert.deepEqual(external,[]);console.log('PASS: public build version, lesson/help/navigation, real narration/highlighting/pause, saved progress, private-textbook fallback, mobile drawer, local links, no missing assets/errors or unexpected external requests.');
 }finally{await browser?.close();server?.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
