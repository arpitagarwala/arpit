const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname, '..');

const replacements = [
  {
    file: 'projects.html',
    replacements: [
      { from: /text-emerald-600 dark:text-emerald-400 active-chip/g, to: 'text-emerald-400 active-chip' },
      { from: /border-gray-200 dark:border-slate-700\/50 bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400/g, to: 'border-slate-700/50 bg-slate-800 text-slate-400' }
    ]
  },
  {
    file: 'games.html',
    replacements: [
      { from: /text-cyan-600 dark:text-cyan-400 active-chip/g, to: 'text-cyan-400 active-chip' },
      { from: /border-gray-200 dark:border-slate-700\/50 bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400/g, to: 'border-slate-700/50 bg-slate-800 text-slate-400' }
    ]
  },
  {
    file: 'projects/sip.html',
    replacements: [
      { from: /bg-slate-50 dark:bg-slate-700\/20/g, to: 'bg-slate-700/20' },
      { from: /'dark:bg-slate-300'/g, to: "'bg-slate-300'" }
    ]
  },
  {
    file: 'projects/expense-splitter.html',
    replacements: [
      { from: /'text-green-600 dark:text-green-400'/g, to: "'text-green-400'" },
      { from: /'text-red-500 dark:text-red-400'/g, to: "'text-red-400'" },
      { from: /'text-slate-500 dark:text-slate-400'/g, to: "'text-slate-400'" },
      { from: /'bg-green-50 dark:bg-green-900\/20'/g, to: "'bg-green-900/20'" },
      { from: /'bg-red-50 dark:bg-red-900\/20'/g, to: "'bg-red-900/20'" },
      { from: /'bg-slate-100 dark:bg-slate-700\/30'/g, to: "'bg-slate-700/30'" }
    ]
  },
  {
    file: 'projects/budget.html',
    replacements: [
      { from: /hover:bg-slate-100 dark:hover:bg-slate-800\/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-700/g, to: 'hover:bg-slate-800/50 border border-transparent hover:border-slate-700' }
    ]
  },
  {
    file: 'articles.html',
    replacements: [
      { from: /bg-indigo-50 dark:bg-indigo-500\/10/g, to: 'bg-indigo-500/10' },
      { from: /text-indigo-500 dark:text-indigo-400/g, to: 'text-indigo-400' },
      { from: /bg-slate-100 dark:bg-slate-500\/10/g, to: 'bg-slate-500/10' },
      { from: /text-slate-600 dark:text-slate-400/g, to: 'text-slate-400' },
      { from: /bg-violet-500 dark:bg-violet-50\/10/g, to: 'bg-violet-50/10' },
      { from: /text-violet-500 dark:text-violet-400/g, to: 'text-violet-400' },
      { from: /bg-amber-500 dark:bg-amber-50\/10/g, to: 'bg-amber-50/10' },
      { from: /text-amber-500 dark:text-amber-400/g, to: 'text-amber-400' },
      { from: /bg-cyan-500 dark:bg-cyan-50\/10/g, to: 'bg-cyan-50/10' },
      { from: /text-cyan-500 dark:text-cyan-400/g, to: 'text-cyan-400' }
    ]
  }
];

replacements.forEach(entry => {
  const filePath = path.join(baseDir, entry.file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  entry.replacements.forEach(repl => {
    content = content.replace(repl.from, repl.to);
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Fixed JS strings in:", entry.file);
  } else {
    console.log("Nothing changed in:", entry.file);
  }
});
