const sharp = require('sharp');
const fs = require('fs');

async function generateIcons() {
    const inputFile = 'SS BUILDERS LOGO.jpeg';
    
    if (!fs.existsSync(inputFile)) {
        console.error(`Input file ${inputFile} not found!`);
        return;
    }

    try {
        console.log('Generating favicon-16x16.png...');
        await sharp(inputFile).resize(16, 16).png().toFile('favicon-16x16.png');
        
        console.log('Generating favicon-32x32.png...');
        await sharp(inputFile).resize(32, 32).png().toFile('favicon-32x32.png');
        
        console.log('Generating favicon.ico (fallback as 32x32)...');
        await sharp(inputFile).resize(32, 32).png().toFile('favicon.ico');
        
        console.log('Generating apple-touch-icon.png...');
        await sharp(inputFile).resize(180, 180).png().toFile('apple-touch-icon.png');
        
        console.log('Generating android-chrome-192x192.png...');
        await sharp(inputFile).resize(192, 192).png().toFile('android-chrome-192x192.png');
        
        console.log('Generating android-chrome-512x512.png...');
        await sharp(inputFile).resize(512, 512).png().toFile('android-chrome-512x512.png');
        
        console.log('Successfully generated all icons!');
    } catch (err) {
        console.error('Error generating icons:', err);
    }
}

generateIcons();
