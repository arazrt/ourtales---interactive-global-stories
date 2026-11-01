const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const sourceIcon = path.join(__dirname, '../public/logo.png');
const outputDir = path.join(__dirname, '../public/icons');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate icons for each size
async function generateIcons() {
  try {
    for (const size of sizes) {
      const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
      
      await sharp(sourceIcon)
        .resize(size, size)
        .toFile(outputPath);
      
      console.log(`Generated icon: ${outputPath}`);
    }

    // Generate badge icon for notifications
    await sharp(sourceIcon)
      .resize(72, 72)
      .toFile(path.join(outputDir, 'badge-72x72.png'));
    
    // Generate placeholder for offline images
    await sharp({
      create: {
        width: 200,
        height: 200,
        channels: 4,
        background: { r: 197, g: 153, b: 182, alpha: 0.1 }
      }
    })
    .composite([{
      input: Buffer.from(
        `<svg><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#C599B6" font-family="Arial" font-size="24">Offline</text></svg>`
      ),
      gravity: 'center'
    }])
    .toFile(path.join(outputDir, 'placeholder.png'));

    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons(); 