/* Load the app's data files (assets/js/data/*.js) in a Node VM, exactly as the browser
   runs them, and return the constants the build tools need. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { DATA, KURAL_DATA } from './assets.mjs';

export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');

export function loadData(names){
  const ctx = {}; vm.createContext(ctx);
  const code = [...DATA, ...KURAL_DATA].map(f => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n;\n');
  vm.runInContext(code + `;this.D={${names.join(',')}};`, ctx);
  return ctx.D;
}
