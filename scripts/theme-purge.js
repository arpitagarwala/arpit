const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { twMerge } = require('tailwind-merge');

const baseDir = path.resolve(__dirname, '..');
const filesToProcess = glob.sync('**/*.html', { cwd: baseDir, ignore: ['node_modules/**', 'scripts/**'] });

console.log(`Found ${filesToProcess.length} HTML files.`);

const classAttrRegex = /class="([^"]*)"/g;

// Files that purposely used inverted logic (base=dark, dark:=light)
const invertedFiles = ['about.html'];

let modifiedCount = 0;

filesToProcess.forEach(relPath => {
  const filePath = path.join(baseDir, relPath);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  const isInverted = invertedFiles.includes(relPath);

  // 1. Process classes inside class="..."
  content = content.replace(classAttrRegex, (match, classStr) => {
    let classes = classStr.split(/\s+/).filter(Boolean);
    if (classes.length === 0) return match;

    if (isInverted) {
      // Drop all `dark:` classes outright
      const newClasses = classes.filter(cls => !cls.startsWith('dark:'));
      return `class="${newClasses.join(' ')}"`;
    } else {
      // Preserve dark classes (stripped), merge them to drop conflicting base classes
      const darkClasses = [];
      const baseClasses = [];

      classes.forEach(cls => {
        if (cls.startsWith('dark:')) {
          darkClasses.push(cls.replace(/^dark:/, ''));
        } else {
          baseClasses.push(cls);
        }
      });

      if (darkClasses.length > 0) {
        const combined = [...baseClasses, ...darkClasses].join(' ');
        const merged = twMerge(combined);
        return `class="${merged}"`;
      }
      return `class="${baseClasses.join(' ')}"`;
    }
  });

  // 2. Remove standalone 'dark' class from html tags (e.g., `<html class="dark">`)
  content = content.replace(/class="([^"]*)\bdark\b([^"]*)"/g, (match, p1, p2) => {
    const newClass = (p1 + p2).replace(/\s+/g, ' ').trim();
    if (newClass) return `class="${newClass}"`;
    return `class=""`; 
  });

  // 3. Remove tailwind.config blocks
  const configRegex = /<script>\s*tailwind\.config\s*=\s*\{[\s\S]*?\}\s*<\/script>/g;
  if(configRegex.test(content)) {
    content = content.replace(configRegex, '');
  }

  // 4. Also remove the whitespace left behind by the removed script (optional cleanup)
  content = content.replace(/\n\s*\n\s*<link rel="stylesheet"/g, '\n  <link rel="stylesheet"');

  const originalContent = fs.readFileSync(filePath, 'utf-8');
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    modifiedCount++;
    console.log(`Updated: ${relPath}`);
  }
});

console.log(`Processing complete. Modified ${modifiedCount} files.`);
