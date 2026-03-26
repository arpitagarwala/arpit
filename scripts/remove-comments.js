const fs = require('fs');
const glob = require('glob');
const path = require('path');

const baseDir = path.resolve(__dirname, '..');
const files = glob.sync('**/*.html', { cwd: baseDir, ignore: ['node_modules/**', 'scripts/**'] });

files.forEach(relPath => {
  const file = path.join(baseDir, relPath);
  let content = fs.readFileSync(file, 'utf8');
  
  // Regex to exactly match the TAILWIND DARK comment block
  const oldContent = content;
  content = content.replace(/<!--\s*TAILWIND DARK: CLASSES ARE NOW CORRECT:[\s\S]*?-->\s*/gi, '');

  if (content !== oldContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log("Stripped comments from:", relPath);
  }
});
