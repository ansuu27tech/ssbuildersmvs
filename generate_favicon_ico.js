const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

/**
 * Convert a PNG to a proper ICO file format.
 * ICO format: 
 *   - 6-byte header (ICONDIR)
 *   - 16-byte entry per image (ICONDIRENTRY)
 *   - Raw PNG data for each image
 */
async function createIco() {
  const sizes = [16, 32, 48];
  const pngBuffers = [];

  // Generate PNG buffers at each size from the source image
  const sourceImage = path.join(__dirname, 'android-chrome-512x512.png');
  
  for (const size of sizes) {
    const buf = await sharp(sourceImage)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    pngBuffers.push({ size, buffer: buf });
  }

  // Build ICO file
  // ICONDIR header: 6 bytes
  const headerSize = 6;
  const entrySize = 16;
  const numImages = pngBuffers.length;
  
  // Calculate total size
  let totalSize = headerSize + (entrySize * numImages);
  for (const { buffer } of pngBuffers) {
    totalSize += buffer.length;
  }

  const ico = Buffer.alloc(totalSize);
  let offset = 0;

  // ICONDIR header
  ico.writeUInt16LE(0, offset);       // Reserved, must be 0
  ico.writeUInt16LE(1, offset + 2);   // Type: 1 = ICO
  ico.writeUInt16LE(numImages, offset + 4); // Number of images
  offset += headerSize;

  // Calculate data offset (after all headers and entries)
  let dataOffset = headerSize + (entrySize * numImages);

  // ICONDIRENTRY for each image
  for (const { size, buffer } of pngBuffers) {
    ico.writeUInt8(size === 256 ? 0 : size, offset);      // Width (0 means 256)
    ico.writeUInt8(size === 256 ? 0 : size, offset + 1);   // Height
    ico.writeUInt8(0, offset + 2);    // Color palette (0 = no palette)
    ico.writeUInt8(0, offset + 3);    // Reserved
    ico.writeUInt16LE(1, offset + 4); // Color planes
    ico.writeUInt16LE(32, offset + 6); // Bits per pixel
    ico.writeUInt32LE(buffer.length, offset + 8); // Image data size
    ico.writeUInt32LE(dataOffset, offset + 12);   // Offset to image data
    
    offset += entrySize;
    dataOffset += buffer.length;
  }

  // Image data
  for (const { buffer } of pngBuffers) {
    buffer.copy(ico, offset);
    offset += buffer.length;
  }

  // Write the ICO file
  const outputPath = path.join(__dirname, 'favicon.ico');
  fs.writeFileSync(outputPath, ico);
  console.log(`✅ Created proper ICO file: ${outputPath} (${ico.length} bytes)`);
  console.log(`   Contains ${numImages} sizes: ${sizes.join('x, ')}x`);

  // Also regenerate the 16x16 and 32x32 PNGs to ensure they match
  for (const { size, buffer } of pngBuffers) {
    if (size === 16) {
      fs.writeFileSync(path.join(__dirname, 'favicon-16x16.png'), buffer);
      console.log(`✅ Regenerated favicon-16x16.png (${buffer.length} bytes)`);
    }
    if (size === 32) {
      fs.writeFileSync(path.join(__dirname, 'favicon-32x32.png'), buffer);
      console.log(`✅ Regenerated favicon-32x32.png (${buffer.length} bytes)`);
    }
  }
}

createIco().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
