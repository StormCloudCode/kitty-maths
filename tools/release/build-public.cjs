/* Allowlist-only static build. Never copy the workspace or textbook directories. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),out=path.join(root,'docs'),pkg=require('../../package.json');
const files=['math.js','miso-lessons.js','miso-story.js','miso-course.js','miso-voice.js','miso-sound.js','miso-navigation.js','miso-help.js','miso.js','miso.css','miso-course.css','miso-help.css','CHANGELOG.md','CREDITS.md','assets/miso-no-glasses.png','assets/miso-petted-no-glasses.png','assets/purr.ogg'];
const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'miso-voice.js'),'utf8'),sandbox);
for(const e of Object.values(sandbox.window.MISO_VOICE)){
 if(!/^assets\/voice-sonia\/[a-z0-9-]+\.mp3$/.test(e.src))throw Error('Unexpected audio path');
 files.push(e.src);
}
if(new Set(files).size!==files.length)throw Error('Duplicate publish path');
fs.mkdirSync(out,{recursive:true});
// Remove only prior generated manifest entries that are no longer published.
const manifestPath=path.join(out,'release-manifest.json');
if(fs.existsSync(manifestPath))for(const old of JSON.parse(fs.readFileSync(manifestPath,'utf8')).files){
 if(files.includes(old.path)||['index.html','game.html','miso-build.js','.nojekyll'].includes(old.path))continue;
 const stale=path.resolve(out,old.path);if(!stale.startsWith(out+path.sep))throw Error('Unsafe prior build path');
 if(fs.existsSync(stale)&&fs.statSync(stale).isFile())fs.unlinkSync(stale);
}
for(const name of files){const dest=path.join(out,name);fs.mkdirSync(path.dirname(dest),{recursive:true});if(/\.(js|css|md)$/.test(name))fs.writeFileSync(dest,fs.readFileSync(path.join(root,name),'utf8').replaceAll('\r\n','\n'));else fs.copyFileSync(path.join(root,name),dest);}
let html=fs.readFileSync(path.join(root,'game.html'),'utf8').replaceAll('\r\n','\n');
html=html.replace('href="MISO-NOTES.md"','href="CREDITS.md"').replace(/<a href="index.html"[^>]*>Reading companion[^<]*<\/a>/,'').replace(/<a href="game-classic.html"[^>]*>Previous game[^<]*<\/a>/,'');
html=html.replace(/v=0\.1\.0/g,'v='+pkg.version).replace(/v0\.1\.0 · What changed/g,'v'+pkg.version+' · What changed');
fs.writeFileSync(path.join(out,'index.html'),html);fs.writeFileSync(path.join(out,'game.html'),html);
fs.writeFileSync(path.join(out,'miso-build.js'),`window.MISO_BUILD=${JSON.stringify({version:pkg.version,sourcePages:false})};\n`);
fs.writeFileSync(path.join(out,'.nojekyll'),'');
const entries=[...files,'index.html','game.html','miso-build.js','.nojekyll'].sort().map(name=>({path:name,sha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(out,name))).digest('hex')}));
fs.writeFileSync(path.join(out,'release-manifest.json'),JSON.stringify({version:pkg.version,files:entries},null,2)+'\n');
console.log(`Built v${pkg.version}: ${entries.length} allowlisted files. No PDF, scans, credentials or private notes.`);
