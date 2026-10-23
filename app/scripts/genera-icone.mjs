// Genera le icone PNG semplici (foglia bianca su verde) senza dipendenze.
// Uso: npm run icone  (scrive in app/public)
import { deflateSync, crc32 } from 'node:zlib';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const VERDE = [0x1f, 0x7a, 0x4d];
const BIANCO = [255, 255, 255];

function png(size, scala) {
  const raw = Buffer.alloc(size * (size * 3 + 1));
  const SS = 3; // supercampionamento per bordi morbidi
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      let foglia = 0;
      let nervatura = 0;
      for (let sy = 0; sy < SS; sy++) for (let sx = 0; sx < SS; sx++) {
        const u = (((x + (sx + 0.5) / SS) / size) * 2 - 1) / scala;
        const v = (((y + (sy + 0.5) / SS) / size) * 2 - 1) / scala;
        const a = (u - v) / Math.SQRT2; // asse lungo
        const b = (u + v) / Math.SQRT2; // asse corto
        const R = 0.9, d = 0.55;
        if (a * a + (b + d) ** 2 <= R * R && a * a + (b - d) ** 2 <= R * R) {
          foglia++;
          if (Math.abs(b) < 0.018 && Math.abs(a) < 0.6) nervatura++;
        }
      }
      const f = (foglia - nervatura) / (SS * SS);
      const o = y * (size * 3 + 1) + 1 + x * 3;
      for (let c = 0; c < 3; c++) raw[o + c] = Math.round(VERDE[c] * (1 - f) + BIANCO[c] * f);
    }
  }
  const chunk = (tipo, dati) => {
    const t = Buffer.from(tipo);
    const len = Buffer.alloc(4); len.writeUInt32BE(dati.length);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, dati])) >>> 0);
    return Buffer.concat([len, t, dati, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0)),
  ]);
}

writeFileSync(join(OUT, 'icon-192.png'), png(192, 0.95));
writeFileSync(join(OUT, 'icon-512.png'), png(512, 0.95));
writeFileSync(join(OUT, 'icon-maskable-512.png'), png(512, 0.7));
writeFileSync(join(OUT, 'apple-touch-icon.png'), png(180, 0.95));
console.log('Icone generate in', OUT);
