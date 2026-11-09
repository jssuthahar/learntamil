#!/usr/bin/env python3
"""
Generate a natural-sounding audio file for each of the 247 Tamil letters with
Azure AI Speech (neural voice ta-IN-PallaviNeural by default), and write
audio/manifest.js so the site plays them instead of the device voice.

Usage
  export AZURE_SPEECH_KEY=<your key>
  export AZURE_SPEECH_REGION=<region, e.g. centralindia>
  python3 tools/generate_audio.py              # all 247 letters
  python3 tools/generate_audio.py --only vowels
  python3 tools/generate_audio.py --only problem   # உ ஊ ஒ ஓ forms + ஞ row
  python3 tools/generate_audio.py --voice ta-IN-ValluvarNeural

Letters you recorded yourself with record.html (.wav) are kept unless you pass --force.
Only the Python standard library is needed. Listen to the results before publishing.
"""
import argparse, json, os, re, sys, time, urllib.request, urllib.error
from xml.sax.saxutils import escape

PULLI = '்'
VOWELS = ['அ','ஆ','இ','ஈ','உ','ஊ','எ','ஏ','ஐ','ஒ','ஓ','ஔ']
SIGNS  = ['','ா','ி','ீ','ு','ூ','ெ','ே','ை','ொ','ோ','ௌ']
CONS   = ['க','ங','ச','ஞ','ட','ண','த','ந','ப','ம','ய','ர','ல','வ','ழ','ள','ற','ன']
PROBLEM_VOWEL_IDX = {4, 5, 9, 10}          # உ ஊ ஒ ஓ

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIO = os.path.join(ROOT, 'audio')
MANIFEST = os.path.join(AUDIO, 'manifest.js')

def key_of(letter):
    return '-'.join(f'{ord(c):04x}' for c in letter)

def letters():
    """(letter, text to speak, group) — same set and order as the site."""
    out = [(v, v, 'vowel', i in PROBLEM_VOWEL_IDX) for i, v in enumerate(VOWELS)]
    # A pure consonant is taught with a short இ before it (க் → "இக்"), as on the site.
    out += [(c + PULLI, 'இ' + c + PULLI, 'mei', c == 'ஞ') for c in CONS]
    out += [('ஃ', 'எஃகு', 'aytham', False)]
    out += [(c + s, c + s, 'uyirmei', c == 'ஞ' or i in PROBLEM_VOWEL_IDX)
            for c in CONS for i, s in enumerate(SIGNS)]
    return out

def read_manifest():
    if not os.path.exists(MANIFEST):
        return {}
    m = re.search(r'window\.LT_AUDIO\s*=\s*(\{.*?\})\s*;', open(MANIFEST, encoding='utf-8').read(), re.S)
    return json.loads(m.group(1)) if m else {}

def write_manifest(man):
    with open(MANIFEST, 'w', encoding='utf-8') as f:
        f.write('// Maps each letter (hex code points) to its audio file in this folder.\n')
        f.write('// Made by tools/generate_audio.py and/or record.html.\n')
        f.write('window.LT_AUDIO = ' + json.dumps(dict(sorted(man.items())), ensure_ascii=False) + ';\n')

def synth(text, voice, key, region, rate):
    ssml = (f"<speak version='1.0' xml:lang='ta-IN'><voice name='{voice}'>"
            f"<prosody rate='{rate}'>{escape(text)}</prosody></voice></speak>")
    req = urllib.request.Request(
        f'https://{region}.tts.speech.microsoft.com/cognitiveservices/v1',
        data=ssml.encode('utf-8'), method='POST',
        headers={'Ocp-Apim-Subscription-Key': key,
                 'Content-Type': 'application/ssml+xml',
                 'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
                 'User-Agent': 'learntamil-audio-generator'})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code == 429 and attempt < 3:      # rate limited → wait and retry
                time.sleep(2 ** attempt); continue
            raise SystemExit(f'Azure returned HTTP {e.code}: {e.read()[:300]!r}')

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--only', choices=['all', 'vowels', 'problem'], default='all')
    ap.add_argument('--voice', default='ta-IN-PallaviNeural')
    ap.add_argument('--rate', default='-15%', help='speaking rate, e.g. -15%% (slower is clearer for children)')
    ap.add_argument('--force', action='store_true', help='also replace your own record.html recordings')
    a = ap.parse_args()

    key, region = os.environ.get('AZURE_SPEECH_KEY'), os.environ.get('AZURE_SPEECH_REGION')
    if not key or not region:
        sys.exit('Set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION first (Azure portal → your Speech resource → Keys and Endpoint).')

    os.makedirs(AUDIO, exist_ok=True)
    man = read_manifest()
    todo = [x for x in letters()
            if a.only == 'all' or (a.only == 'vowels' and x[2] == 'vowel') or (a.only == 'problem' and x[3])]
    made = kept = 0
    for i, (letter, text, group, _) in enumerate(todo, 1):
        k = key_of(letter)
        if man.get(k, '').endswith('.wav') and not a.force:
            kept += 1; continue                     # keep the teacher's own recording
        audio = synth(text, a.voice, key, region, a.rate)
        fname = k + '.mp3'
        with open(os.path.join(AUDIO, fname), 'wb') as f:
            f.write(audio)
        man[k] = fname; made += 1
        print(f'[{i}/{len(todo)}] {letter}  ({group})  → {fname}')
        if made % 20 == 0:
            write_manifest(man)                     # save progress
    write_manifest(man)
    print(f'\nDone: {made} generated, {kept} of your own recordings kept. Open index.html and listen before publishing.')

if __name__ == '__main__':
    main()
