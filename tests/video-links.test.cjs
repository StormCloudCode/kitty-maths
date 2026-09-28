const assert=require('node:assert/strict'),C=require('../miso-lessons.js');require('../miso-story.js');
const catalog=require('../miso-video-catalog.js'),{normalise,validate}=require('../miso-videos.js'),scenes=require('../miso-scenes.js');
const ids=C.flatMap(c=>c.steps.map(s=>s.id)).sort();
assert.deepEqual(Object.keys(catalog.links).sort(),ids);assert.deepEqual(Object.keys(scenes.cues).sort(),ids);
assert.equal(Object.keys(catalog.videos).length,18);assert.equal(Object.keys(scenes.modes).length,14);
for(const [id,row]of Object.entries(catalog.links)){
 for(const key of row.slice(0,2)){const v=catalog.videos[key];assert.ok(v,id);assert.ok(v.likes>=1000);assert.ok(v.views>=v.likes);assert.ok(v.seconds>0);assert.equal(normalise('https://youtu.be/'+v.id),'https://www.youtube.com/watch?v='+v.id);}
 if(row[2])assert.ok(row[2]<catalog.videos[row[0]].seconds);
}
assert.equal(normalise('https://youtu.be/B4zejSI8zho?t=1m3s&si=tracking'),'https://www.youtube.com/watch?v=B4zejSI8zho&t=63s');
assert.equal(normalise('https://m.youtube.com/watch?v=B4zejSI8zho&start=351'),'https://www.youtube.com/watch?v=B4zejSI8zho&t=351s');
assert.equal(normalise('https://www.youtube.com/embed/B4zejSI8zho'),'https://www.youtube.com/watch?v=B4zejSI8zho');
for(const url of ['javascript:alert(1)','http://youtube.com/watch?v=B4zejSI8zho','https://youtube.com.evil.test/watch?v=B4zejSI8zho','https://evil.test/?v=B4zejSI8zho','https://www.youtube.com@evil.test/watch?v=B4zejSI8zho','https://user:pass@youtube.com/watch?v=B4zejSI8zho','https://youtube.com/results?search_query=math','https://youtube.com/playlist?list=abc','https://youtu.be/abc','https://youtu.be/B4zejSI8zho?t=-5','https://youtu.be/B4zejSI8zho?t=100000','https://youtu.be/B4zejSI8zho?t=bad'])assert.throws(()=>normalise(url),undefined,url);
assert.deepEqual(validate({schema:1,links:{line:{title:'New video',url:'https://youtu.be/B4zejSI8zho'}}}),{line:{title:'New video',url:'https://www.youtube.com/watch?v=B4zejSI8zho'}});
for(const x of [null,[],{schema:2,links:{}},{schema:1,links:[]},{schema:1,links:{bogus:{title:'a',url:'https://youtu.be/B4zejSI8zho'}}},JSON.parse('{"schema":1,"links":{"__proto__":{"title":"a","url":"https://youtu.be/B4zejSI8zho"}}}'),{schema:1,links:{line:{title:'',url:'https://youtu.be/B4zejSI8zho'}}},{schema:1,links:{line:{title:'a'.repeat(141),url:'https://youtu.be/B4zejSI8zho'}}}])assert.throws(()=>validate(x));
console.log('PASS: all 36 video pairs and picture cues, 18 evidence records, 14 scenes, chapter offsets, safe canonical URLs and strict atomic-import validation.');
