/**
 * Extracts actual game assets from the mockup sheets.
 * Each PNG is 1728x2304 with a text label at top and the real asset centered
 * on a white background. This script:
 *   1. Skips the top 15% of each image (label area) when finding content bounds
 *   2. Crops to the content bounding box
 *   3. For SPRITES (portrait/square): makes white pixels transparent
 *   4. For BACKGROUNDS (wide landscape): keeps colours intact (no transparency)
 *
 * Background detection: cropWidth > 1300px AND aspect ratio > 1.6
 */
import sharp from 'sharp';
import { readdir } from 'fs/promises';
import { join } from 'path';

const SRC          = '../context';
const DST          = 'assets';
const WHITE_THRESH = 240;   // channels all >= this → background white
const LABEL_SKIP   = 0.15;  // skip top 15% to avoid label text
const PAD          = 8;

function isBackground(w, h) {
  return w > 1300 && w / h > 1.6;
}

// For backgrounds: trim columns from left/right where >60% of pixels are near-white.
// This removes the white-sky fringe at the image edges that creates a visible seam when tiled.
function trimWhiteEdgeCols(data, fullWidth, colLeft, colRight, rowTop, rowBottom) {
  const rows = rowBottom - rowTop;

  function colIsWhiteDominated(x) {
    let white = 0;
    for (let y = rowTop; y < rowBottom; y++) {
      const i = (y * fullWidth + x) * 4;
      if (data[i] >= WHITE_THRESH && data[i + 1] >= WHITE_THRESH && data[i + 2] >= WHITE_THRESH) white++;
    }
    return white / rows > 0.6;
  }

  let l = colLeft;
  while (l < colRight && colIsWhiteDominated(l)) l++;

  let r = colRight;
  while (r > l && colIsWhiteDominated(r)) r--;

  return { left: l, right: r };
}

async function processAsset(srcPath, dstPath) {
  const { data, info } = await sharp(srcPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  const skipRows = Math.floor(height * LABEL_SKIP);

  // Find bounding box of non-white content, skipping label rows at top
  let top = height, bottom = 0, left = width, right = 0;

  for (let y = skipRows; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];

      const isBg =
        a < 10 || (r >= WHITE_THRESH && g >= WHITE_THRESH && b >= WHITE_THRESH);

      if (!isBg) {
        if (y < top)    top    = y;
        if (y > bottom) bottom = y;
        if (x < left)   left   = x;
        if (x > right)  right  = x;
      }
    }
  }

  if (top > bottom || left > right) {
    console.log(`  SKIP (no content found): ${srcPath}`);
    return;
  }

  const bg = isBackground(right - left + 1, bottom - top + 1);
  if (bg) {
    // First: trim white-dominated columns from edges
    ({ left, right } = trimWhiteEdgeCols(data, width, left, right, top, bottom + 1));
    // Then: fixed 40px inset each side to remove any remaining edge artifacts / seam pixels
    left  = Math.min(left  + 40, right);
    right = Math.max(right - 40, left);
  }

  const cropLeft   = Math.max(0,     left   - PAD);
  const cropTop    = Math.max(0,     top    - PAD);
  const cropWidth  = Math.min(width  - cropLeft, right  - left + 1 + PAD * 2);
  const cropHeight = Math.min(height - cropTop,  bottom - top  + 1 + PAD * 2);

  if (bg) {
    // Background scenes: crop only — keep all colours, no transparency
    await sharp(srcPath)
      .extract({ left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight })
      .png()
      .toFile(dstPath);
  } else {
    // Sprites: crop then make white pixels transparent
    const { data: cd, info: ci } = await sharp(srcPath)
      .extract({ left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    for (let i = 0; i < cd.length; i += 4) {
      const r = cd[i], g = cd[i + 1], b = cd[i + 2];
      if (r >= WHITE_THRESH && g >= WHITE_THRESH && b >= WHITE_THRESH) {
        cd[i + 3] = 0;
      }
    }

    await sharp(cd, { raw: { width: ci.width, height: ci.height, channels: 4 } })
      .png()
      .toFile(dstPath);
  }

  const tag = bg ? '[bg]' : '[sprite]';
  console.log(`  ${tag} ${srcPath.split('/').pop()} → ${cropWidth}×${cropHeight}`);
}

const files = (await readdir(SRC)).filter(f => f.endsWith('.png'));
console.log(`Processing ${files.length} assets…`);

for (const file of files) {
  await processAsset(join(SRC, file), join(DST, file));
}

console.log('Done.');
