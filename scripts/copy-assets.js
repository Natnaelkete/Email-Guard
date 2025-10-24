// Copy static assets to dist folder after TypeScript compilation
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const distDir = path.join(__dirname, '..', 'dist');
const iconsDir = path.join(__dirname, '..', 'icons');

// Create dist directory if it doesn't exist
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy files from public to dist
function copyFile(src, dest) {
  try {
    fs.copyFileSync(src, dest);
    console.log(`✓ Copied: ${path.basename(src)}`);
  } catch (err) {
    console.error(`✗ Error copying ${src}:`, err.message);
  }
}

function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const files = fs.readdirSync(src);
  files.forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    
    if (fs.statSync(srcPath).isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  });
}

console.log('📦 Copying assets to dist/...\n');

// Copy HTML files
if (fs.existsSync(publicDir)) {
  const htmlFiles = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));
  htmlFiles.forEach(file => {
    copyFile(path.join(publicDir, file), path.join(distDir, file));
  });

  // Copy CSS files
  const cssFiles = fs.readdirSync(publicDir).filter(f => f.endsWith('.css'));
  cssFiles.forEach(file => {
    copyFile(path.join(publicDir, file), path.join(distDir, file));
  });

  // Copy manifest.json
  if (fs.existsSync(path.join(publicDir, 'manifest.json'))) {
    copyFile(path.join(publicDir, 'manifest.json'), path.join(distDir, 'manifest.json'));
  }
}

// Copy icons directory
if (fs.existsSync(iconsDir)) {
  copyDirectory(iconsDir, path.join(distDir, 'icons'));
}

console.log('\n✅ Assets copied successfully!');
