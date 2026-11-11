/* Tell Bing (which also feeds ChatGPT search and Copilot), Yandex, Seznam and Naver that pages changed,
   using IndexNow (https://www.indexnow.org). Run it AFTER the site is deployed, so the new pages are live.

     npm run indexnow            pages whose content changed today (from tools/page-dates.json)
     npm run indexnow -- 2026-11-10   pages changed on or after that date
     npm run indexnow -- --all   every URL in sitemap.xml (use once, after first setup)

   The key is public by design: IndexNow checks that https://learntamil.msdevbuild.com/<KEY>.txt holds it.
   Never rename or delete that file. Sends only page URLs — nothing about any child or visitor. */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SITE = 'https://learntamil.msdevbuild.com/';
const KEY = '4140fc78b075cd96dcad049738dbc15f';
const arg = process.argv[2] || new Date().toISOString().slice(0, 10);

const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
const all = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
let urls = all;
if (arg !== '--all') {
  const dates = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools', 'page-dates.json'), 'utf8'));
  const changed = new Set(Object.entries(dates).filter(([, v]) => v.date >= arg).map(([f]) => SITE + (f === 'index.html' ? '' : f)));
  urls = all.filter(u => changed.has(u));
}
if (!urls.length) { console.log(`No pages changed since ${arg}. Nothing to send.`); process.exit(0); }

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: new URL(SITE).host, key: KEY, keyLocation: `${SITE}${KEY}.txt`, urlList: urls.slice(0, 10000) })
});
console.log(`IndexNow: sent ${urls.length} URL(s) → HTTP ${res.status} ${res.statusText}`);
if (res.status >= 400) { console.log(await res.text()); process.exit(1); }
