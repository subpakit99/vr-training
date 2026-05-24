const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  content = content.replace(/emerald/g, 'blue');
  // Also fix the hex codes in globals.css
  if (filePath.endsWith('globals.css')) {
    content = content.replace('#059669', '#2563eb'); // blue-600
    content = content.replace('#10b981', '#3b82f6'); // blue-500
    content = content.replace('Emerald 600', 'Blue 600');
    content = content.replace('Emerald 500', 'Blue 500');
  }
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else {
      if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
        replaceInFile(fullPath);
      }
    }
  }
}

walk(path.join(__dirname, 'src'));
console.log('Theme changed from emerald to blue successfully.');
