const {chromium}=require('./runtime.cjs');
const assert=require('node:assert/strict'),path=require('node:path');
const navigate=require('./navigation-helper.cjs');
const C=require('../miso-lessons.js');require('../miso-story.js');const help=require('../miso-help.js');
(async()=>{
 assert.deepEqual(Object.keys(help).sort(),C.flatMap(c=>c.steps.map(s=>s.id)).sort());
 const b=await chromium.launch({headless:true,channel:process.env.CI?undefined:'chrome'});
 try{
  const p=await b.newPage({viewport:{width:1440,height:1000}}),requests=[],errors=[];
  p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>requests.push(r.url()));
  await p.goto('http://127.0.0.1:8765/tutor/game.html');await p.waitForLoadState('networkidle');
  for(let ci=0;ci<C.length;ci++)for(let si=0;si<C[ci].steps.length;si++){
   const s=C[ci].steps[si];await navigate(p,ci,si);
   const url=new URL(await p.locator('#lesson-google').getAttribute('href'));
   assert.equal(url.hostname,'www.google.com');assert.equal(url.searchParams.get('q'),help[s.id][3]);
   await p.locator('#quick-help').click();assert.equal(await p.locator('#help-title').innerText(),help[s.id][0]);assert.equal(await p.locator('#help-example').innerText(),help[s.id][2]);await p.keyboard.press('Escape');
   assert.equal(await p.locator('#quick-help').evaluate(b=>document.activeElement===b),true);
   await p.locator('[data-help-token="0"]').click();assert.match(await p.locator('#help-title').innerText(),new RegExp(s.tokens[0][1].replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));await p.locator('#help-close').click();
  }
  await navigate(p,1,3);await p.locator('#listen').click();await p.waitForFunction(()=>document.querySelector('#listen').getAttribute('aria-pressed')==='true');await p.locator('#quick-help').click();assert.equal(await p.locator('#listen').innerText(),'Resume Kitty');assert.match(await p.locator('#help-example').innerText(),/−i/);
  await p.screenshot({path:path.join(__dirname,'miso-help-desktop.png'),fullPage:true});
  // Verify a real popup target without contacting Google during the test.
  await p.context().route('https://www.google.com/**',route=>route.fulfill({contentType:'text/html',body:'Search navigation test'}));
  const popupEvent=p.waitForEvent('popup');await p.locator('#help-google').click();const popup=await popupEvent;await popup.waitForLoadState();assert.equal(new URL(popup.url()).searchParams.get('q'),help['define-i'][3]);await popup.close();
  await p.setViewportSize({width:390,height:844});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);const box=await p.locator('#help-dialog').boundingBox();assert.ok(box.x>=0&&box.x+box.width<=390);await p.screenshot({path:path.join(__dirname,'miso-help-phone.png'),fullPage:true});await p.keyboard.press('Escape');
  assert.equal(requests.some(url=>/google\.com/.test(url)),false,'no Google request before following external link (popup intercepted separately)');assert.deepEqual(errors,[]);
  console.log('PASS: all 36 contextual Google queries and pop-ups, tappable symbols, focus return/Escape, narration pause, i and -i explanation, intercepted search-tab navigation, phone layout.');
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exit(1);});
