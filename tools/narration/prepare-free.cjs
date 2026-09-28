const fs=require('node:fs'),path=require('node:path');
const C=require('../../miso-lessons.js');require('../../miso-story.js');
function number(n){const a=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'],b=['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];if(n<20)return a[n];if(n<100)return b[Math.floor(n/10)]+(n%10?' '+a[n%10]:'');if(n<1000)return a[Math.floor(n/100)]+' hundred'+(n%100?' and '+number(n%100):'');return String(n);}
function pieces(text){let inBars=false;const parts=text.match(/\s+|[A-Za-z]+(?:['’][A-Za-z]+)*|\d+(?:\.\d+)?|[^\s]/gu)||[];
 return parts.map((text,i)=>{let spoken=text;const symbols={'*':' times ','×':' times ','+':' plus ','−':' minus ','=':' equals ','/':' divided by ','÷':' divided by ','√':' square root of ','∛':' cube root of ','²':' squared ','³':' cubed ','⁴':' to the fourth power ','⁵':' to the fifth power ','θ':' theta ','π':' pi ','±':' plus or minus ','°':' degrees ','→':' then ','̄':' bar ','[':' the quantity ',']':',','(':'',')':'','“':'','”':'','·':'. '};
 if(Object.hasOwn(symbols,text))spoken=symbols[text];
 // Removing brackets must not glue words together ("two" + "cosine").
 if(text==='('||text===')')spoken=' ';
 if(text==='|'){spoken=inBars?'':' the modulus of ';inBars=!inBars;}
 if(text==='-')spoken=/^\d/.test(parts[i+1]||'')?' minus ':' ';
 if(/^\d+(\.\d+)?$/.test(text))spoken=text.includes('.')?text.split('.').map((x,k)=>k?x.split('').map(x=>number(+x)).join(' '):number(+x)).join(' point '):number(+text);
 const names={i:'eye',z:'zed',x:'ex',r:'ar',n:'en',a:'a',b:'bee',bi:'bee eye',cos:'cosine',sin:'sine',cis:'siss'};if(Object.hasOwn(names,text))spoken=names[text];
 // Adjacent maths factors such as 2i still need a spoken word boundary.
 if(/^[A-Za-z\d]/.test(spoken)&&i&&/\d/.test(parts[i-1].slice(-1)))spoken=' '+spoken;
 return {text,spoken};});
}
const clips=C.flatMap(c=>c.steps.flatMap(s=>['say','more','success'].map(part=>({id:s.id+'-'+part,text:s[part],pieces:pieces(s[part])}))));
fs.writeFileSync(path.join(__dirname,'free-scripts.json'),JSON.stringify(clips,null,2));
console.log('Prepared '+clips.length+' exact scripts; no paid API calls.');
