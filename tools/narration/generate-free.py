"""Generate local MP3s and real provider word boundaries, without API credits.
Only original lesson scripts go to Edge's online speech service. No keys used.
"""
import asyncio, hashlib, json, re, sys
from pathlib import Path
import edge_tts

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
OUT = ROOT / 'assets' / 'voice-sonia'
VOICE = 'en-GB-SoniaNeural'
RATE = '-5%'
LEX = re.compile(r"[A-Za-z]+(?:['’][A-Za-z]+)*|\d+", re.UNICODE)

def lex(text):
    return [s.lower().replace('’', "'") for s in LEX.findall(text)]

def align(clip, boundaries):
    expected = [(word, i) for i, p in enumerate(clip['pieces']) for word in lex(p['spoken'])]
    received = [(word, b) for b in boundaries for word in lex(b['text'])]
    if [w for w, _ in expected] != [w for w, _ in received]:
        # Fail visibly instead of fabricating evenly spaced word times.
        a, b = [w for w, _ in expected], [w for w, _ in received]
        j = next((j for j, (x,y) in enumerate(zip(a,b)) if x != y), min(len(a),len(b)))
        raise ValueError(f"Word alignment mismatch in {clip['id']} near {j}: {a[j:j+5]} / {b[j:j+5]}")
    words = [dict(text=p['text'], start=-1, end=-1) for p in clip['pieces']]
    for (_, i), (_, b) in zip(expected, received):
        start, end = b['offset']/10_000_000, (b['offset']+b['duration'])/10_000_000
        w = words[i]
        w['start'] = start if w['start'] < 0 else min(start,w['start'])
        w['end'] = max(end,w['end'])
    return words

async def main():
    OUT.mkdir(parents=True,exist_ok=True)
    clips=json.loads((HERE/'free-scripts.json').read_text(encoding='utf-8'))
    if '--sample' in sys.argv: clips=clips[:1]
    limit=asyncio.Semaphore(3)
    async def generate(clip):
        spoken=''.join(p['spoken'] for p in clip['pieces'])
        digest=hashlib.sha256((VOICE+RATE+clip['text']+spoken).encode()).hexdigest()
        stem=OUT/clip['id']; meta=stem.with_suffix('.json'); mp3=stem.with_suffix('.mp3')
        if meta.exists() and mp3.exists():
            cached=json.loads(meta.read_text(encoding='utf-8'))
            if cached.get('hash')==digest and cached.get('words'):
                print('Cached',clip['id'],flush=True);return clip['id'],cached
        async with limit:
            raw=stem.with_suffix('.boundaries.json'); data=stem.with_suffix('.pending.mp3')
            # Reuse an exact completed recording if only alignment needs repairing.
            old=json.loads(raw.read_text(encoding='utf-8')) if raw.exists() else {}
            if mp3.exists() and old.get('hash')==digest:
                boundaries=old['boundaries']
            else:
                boundaries=[]
                comm=edge_tts.Communicate(spoken,VOICE,rate=RATE,boundary='WordBoundary',connect_timeout=15,receive_timeout=60)
                with data.open('wb') as f:
                    async for chunk in comm.stream():
                        if chunk['type']=='audio':f.write(chunk['data'])
                        elif chunk['type']=='WordBoundary':boundaries.append(chunk)
                if data.stat().st_size<1000 or not boundaries:raise ValueError('Empty output: '+clip['id'])
                data.replace(mp3)
                raw.write_text(json.dumps({'hash':digest,'boundaries':boundaries},ensure_ascii=False),encoding='utf-8')
            words=align(clip,boundaries)
            result={'hash':digest,'text':clip['text'],'spoken':spoken,'src':'assets/voice-sonia/'+mp3.name,'voice':VOICE,'provider':'Edge online speech via edge-tts','rate':RATE,'timing':'provider WordBoundary','words':words}
            meta.write_text(json.dumps(result,ensure_ascii=False),encoding='utf-8')
            print('Recorded',clip['id'],len(boundaries),'timed words',flush=True)
            return clip['id'],result
    results=await asyncio.gather(*(generate(c) for c in clips),return_exceptions=True)
    errors=[str(r) for r in results if isinstance(r,Exception)]
    manifest={r[0]:r[1] for r in results if not isinstance(r,Exception)}
    if errors:
        for e in errors:print('ERROR',e,flush=True)
        print('No app manifest published; fix incomplete clips before enabling.',flush=True)
        sys.exit(1)
    if '--sample' not in sys.argv:
        # This is a generated asset, not an API client in the browser.
        (ROOT/'miso-voice.js').write_text('// Generated from exact scripts and actual Edge WordBoundary metadata.\nwindow.MISO_VOICE = '+json.dumps(manifest,ensure_ascii=False)+';\n',encoding='utf-8')
        print('Published',len(manifest),'complete recordings with provider timestamps.',flush=True)

asyncio.run(main())
