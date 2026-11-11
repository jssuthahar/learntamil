/* QR codes for the build tools. The encoder itself is assets/js/core/qr.js (a classic browser script, so the
   certificates can draw the same codes); it is run here in a Node VM, exactly as load-data.mjs runs the data files. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { ROOT } from './load-data.mjs';

const ctx = { TextEncoder }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'assets/js/core/qr.js'), 'utf8') + ';this.QR = QR;', ctx);

export const qrMatrix = text => ctx.QR.matrix(text);
/* SVG with a 4-module quiet zone. Colours are fixed dark-on-white so every camera can read it in dark mode too. */
export const qrSvg = (text, opts) => ctx.QR.svg(text, opts);
