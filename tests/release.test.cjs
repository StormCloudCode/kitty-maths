const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),out=path.join(root,'docs'),pkg=require('../package.json'),manifest=require('../docs/release-manifest.json');
assert.equal(manifest.version,pkg.version);
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.relative(out,path.join(dir,e.name)).replaceAll('\\','/')]);}
const actual=walk(out).sort(),expected=[...manifest.files.map(f=>f.path),'release-manifest.json'].sort();assert.deepEqual(actual,expected,'unlisted public build files');
for(const f of manifest.files){assert.doesNotMatch(f.path,/\.pdf$|source-review|\.env|node_modules|\.venv|\.key$|\.pem$/i);const bytes=fs.readFileSync(path.join(out,f.path));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),f.sha256);}
const build={window:{}};vm.runInNewContext(fs.readFileSync(path.join(out,'miso-build.js'),'utf8'),build);assert.equal(build.window.MISO_BUILD.sourcePages,false);assert.equal(build.window.MISO_BUILD.version,pkg.version);
const html=fs.readFileSync(path.join(out,'index.html'),'utf8');assert.doesNotMatch(html,/drone-play|youtube-dock|miso-youtube\.js|MISO-NOTES|Reading companion|Previous game/);assert.match(html,/id="lesson-google"/);assert.match(html,/id="help-dialog"/);assert.match(html,/id="lesson-video"/);
const C=require('../miso-lessons.js');require('../miso-story.js');const help=require('../miso-help.js');assert.deepEqual(Object.keys(help).sort(),C.flatMap(c=>c.steps.map(s=>s.id)).sort());
assert.doesNotMatch(fs.readFileSync(path.join(root,'miso-sound.js'),'utf8'),/createOscillator|AudioContext/);
console.log(`PASS: v${pkg.version}, complete allowlist and SHA256 manifest, no textbook/private files, source-page guard, 36 help cards, no drone engine.`);
