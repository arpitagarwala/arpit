import {mkdir, writeFile} from 'node:fs/promises';
import sharp from 'sharp';

const output = new URL('../public/app-icons/', import.meta.url);
await mkdir(output, {recursive: true});

function artwork(size, maskable) {
  const scale = maskable ? 0.76 : 1;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#111111"/>
  <g fill="#fff" font-family="Arial, sans-serif" font-weight="700" text-anchor="middle"
     transform="translate(256 256) scale(${scale}) translate(-256 -256)">
    <text x="256" y="257" font-size="116">Arpit</text>
    <text x="256" y="334" font-size="66">Agarwala</text>
  </g>
</svg>`);
}

for (const [name, size, maskable] of [
  ['icon-192.png', 192, false],
  ['icon-512.png', 512, false],
  ['maskable-512.png', 512, true],
  ['apple-touch-180.png', 180, false],
]) {
  await writeFile(new URL(name, output), await sharp(artwork(size, maskable)).png().toBuffer());
}

const sizes = [16, 32, 48, 256];
const pngs = await Promise.all(sizes.map(size => sharp(artwork(size, false)).png().toBuffer()));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
for (const [index, png] of pngs.entries()) {
  const entry = 6 + 16 * index;
  header[entry] = sizes[index] % 256;
  header[entry + 1] = sizes[index] % 256;
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(png.length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += png.length;
}
await writeFile(new URL('./App.ico', import.meta.url), Buffer.concat([header, ...pngs]));
