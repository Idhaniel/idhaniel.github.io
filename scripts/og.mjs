// Builds public/og.png (1200x630), the image shown when the site is shared.
// Run with `npm run og` after changing the name, photo or colours.
import fs from 'node:fs';
import satori from 'satori';
import sharp from 'sharp';

const W = 1200, H = 630;
const c = { ink: '#0c100e', edge: '#36413b', bone: '#eef1e8', stone: '#c8cec4', ash: '#8f9891', accent: '#c4f04a', amber: '#ffb547' };
const font = (w) => fs.readFileSync(`node_modules/@fontsource/schibsted-grotesk/files/schibsted-grotesk-latin-${w}-normal.woff`);

// Faint network map, same idea as the site's backdrop.
let seed = 11;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const nodes = [];
for (let r = 0; r < 6; r++) for (let q = 0; q < 10; q++) {
  if (rand() < 0.3) continue;
  nodes.push([Math.round((q + 0.5 + (rand() - 0.5) * 0.8) * (W / 10)), Math.round((r + 0.5 + (rand() - 0.5) * 0.8) * (H / 6))]);
}
const links = [];
nodes.forEach((n, i) => {
  nodes.map((m, j) => [j, (m[0] - n[0]) ** 2 + (m[1] - n[1]) ** 2]).filter(([j]) => j !== i)
    .sort((a, b) => a[1] - b[1]).slice(0, 2).forEach(([j]) => links.push([n, nodes[j]]));
});
const lit = new Set([3, 11, 19]);
const net = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs><radialGradient id="f" cx="0.85" cy="0.25" r="0.9"><stop offset="0.1" stop-color="#fff"/><stop offset="0.75" stop-color="#fff" stop-opacity="0"/></radialGradient>
  <mask id="m"><rect width="${W}" height="${H}" fill="url(#f)"/></mask></defs>
  <g mask="url(#m)">
    ${links.map(([a, b], i) => `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${lit.has(i) ? c.accent : c.edge}" stroke-width="${lit.has(i) ? 2 : 1}"/>`).join('')}
    ${nodes.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i % 9 === 0 ? 5 : 3}" fill="${i % 9 === 0 ? c.accent : c.ash}"/>`).join('')}
  </g></svg>`;

const photo = await sharp('src/assets/daniel.jpg').resize(320, 400).modulate({ saturation: 0.7 }).jpeg({ quality: 85 }).toBuffer();

const h = (type, style, children) => ({ type, props: children === undefined ? { style } : { style, children } });
const tree = h('div', { width: W, height: H, display: 'flex', position: 'relative', background: c.ink, color: c.bone, fontFamily: 'Schibsted' }, [
  { type: 'img', props: { src: `data:image/svg+xml;base64,${Buffer.from(net).toString('base64')}`, width: W, height: H, style: { position: 'absolute', left: 0, top: 0 } } },
  h('div', { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '64px 72px', width: '100%' }, [
    h('div', { display: 'flex', fontSize: 26, color: c.stone }, ['Software developer, Lagos']),
    h('div', { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }, [
      h('div', { display: 'flex', flexDirection: 'column', gap: 28 }, [
        h('div', { display: 'flex', flexDirection: 'column', fontSize: 128, lineHeight: 0.9, letterSpacing: '-0.045em' }, [h('div', { display: 'flex' }, ['Daniel']), h('div', { display: 'flex' }, ['Uwandu'])]),
        h('div', { display: 'flex', fontSize: 26, color: c.ash }, ['idhaniel.github.io']),
      ]),
      { type: 'img', props: { src: `data:image/jpeg;base64,${photo.toString('base64')}`, width: 240, height: 300, style: { borderRadius: 18, objectFit: 'cover' } } },
    ]),
  ]),
]);

const svg = await satori(tree, {
  width: W,
  height: H,
  fonts: [
    { name: 'Schibsted', data: font(400), weight: 400, style: 'normal' },
    { name: 'Schibsted', data: font(500), weight: 500, style: 'normal' },
  ],
});
await sharp(Buffer.from(svg)).png().toFile('public/og.png');
console.log('Wrote public/og.png');
