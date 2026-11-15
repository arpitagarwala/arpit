import {mkdir, readFile, writeFile} from 'node:fs/promises';
import sharp from 'sharp';

const output = new URL('../public/app-icons/', import.meta.url);
const master = await readFile(
  new URL('../public/app-icons/brand-master.png', import.meta.url),
);
await mkdir(output, {recursive: true});

for (const [name, size] of [
  ['brand-16.png', 16],
  ['brand-32.png', 32],
  ['brand-192.png', 192],
  ['brand-512.png', 512],
  ['brand-touch-180.png', 180],
]) {
  await writeFile(
    new URL(name, output),
    await sharp(master).resize(size, size).png().toBuffer(),
  );
}
const inset = await sharp(master).resize(410, 410).png().toBuffer();
await sharp({
  create: {width: 512, height: 512, channels: 3, background: '#111315'},
})
  .composite([{input: inset, gravity: 'centre'}])
  .png()
  .toBuffer()
  .then((buffer) =>
    writeFile(new URL('brand-maskable-512.png', output), buffer),
  );
const sizes = [16, 32, 48, 256];
const pngs = await Promise.all(
  sizes.map((size) => sharp(master).resize(size, size).png().toBuffer()),
);
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
await writeFile(
  new URL('./App.ico', import.meta.url),
  Buffer.concat([header, ...pngs]),
);
