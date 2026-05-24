const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(/bg-white/g, 'bg-bg-card');
content = content.replace(/text-slate-800/g, 'text-text-primary');
content = content.replace(/text-slate-700/g, 'text-text-primary');
content = content.replace(/text-slate-500/g, 'text-text-secondary');
content = content.replace(/text-slate-400/g, 'text-text-secondary/70');
content = content.replace(/bg-slate-50/g, 'bg-bg-primary');
content = content.replace(/bg-slate-100/g, 'bg-bg-primary border border-border-color');
content = content.replace(/bg-slate-200/g, 'bg-border-color');
content = content.replace(/border-slate-100/g, 'border-border-color/50');
content = content.replace(/border-slate-200/g, 'border-border-color');

fs.writeFileSync(filePath, content, 'utf8');
console.log('File updated successfully.');
