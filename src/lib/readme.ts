export const SECTION_NAMES = { about: 'About', skills: 'Skills & tools', projects: 'Featured projects', contact: 'Find me', setup: 'Installation', usage: 'Usage', contributing: 'Contributing', license: 'License', card: 'Optional image card' };
export type Section = keyof typeof SECTION_NAMES;
export type ReadmeProject = { name: string; description: string; url: string };
export type ReadmeDraft = {
  mode: 'profile' | 'repository'; template: 'minimal' | 'portfolio' | 'project';
  username: string; title: string; description: string; about: string; skills: string;
  portfolio: string; contact: string; repo: string; install: string; usage: string;
  contributing: string; license: string; card: string; badges: boolean;
  projects: ReadmeProject[]; order: Section[]; enabled: Section[]; manual: string | null;
};
export const README_DEFAULTS: ReadmeDraft = {
  mode: 'profile', template: 'portfolio', username: '', title: 'Hi, I’m Alex',
  description: 'I build thoughtful tools that make everyday work a little easier.',
  about: 'Currently exploring web development and open-source collaboration.', skills: 'TypeScript, React, Python',
  portfolio: '', contact: '', repo: 'project-atlas', install: 'npm install', usage: 'npm run dev',
  contributing: 'Issues and pull requests are welcome. Please open an issue to discuss larger changes first.',
  license: 'None', card: '', badges: false, projects: [],
  order: ['about', 'skills', 'projects', 'contact', 'setup', 'usage', 'contributing', 'license', 'card'],
  enabled: ['about', 'skills', 'projects', 'contact'], manual: null,
};
export function validUsername(value: string): boolean { return /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(value) && !value.includes('--'); }
export function safeUrl(value: string): string | null {
  if (!value.trim()) return null;
  try { const url = new URL(value.trim()); return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null; } catch { return null; }
}
export function markdownText(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/([\\`*_{}\[\]()#+.!|~\-])/g, '\\$1');
}
function link(text: string, raw: string): string {
  const url = safeUrl(raw); return url ? `[${markdownText(text)}](<${url.replace(/>/g, '%3E').replace(/</g, '%3C')}>)` : markdownText(text);
}
function code(value: string): string { const longest = Math.max(0, ...(value.match(/`+/g) || []).map(s => s.length)); const fence = '`'.repeat(Math.max(3, longest + 1)); return `${fence}sh\n${value}\n${fence}`; }
export function readmeIssues(d: ReadmeDraft): string[] {
  const issues: string[] = [];
  if (!d.title.trim()) issues.push('Add a title.');
  if (d.mode === 'profile' && !validUsername(d.username)) issues.push('Enter a valid GitHub username (1–39 letters, digits, or single hyphens).');
  if (d.mode === 'repository' && !/^[\w.-]{1,100}$/.test(d.repo)) issues.push('Use a repository name with letters, numbers, dots, underscores, or hyphens.');
  const links = [...(d.enabled.includes('contact') ? [['Portfolio', d.portfolio], ['Contact link', d.contact]] : []), ...(d.enabled.includes('card') ? [['Image card', d.card]] : [])];
  for (const [label, url] of links) if (url.trim() && !safeUrl(url)) issues.push(`${label}: use a full http:// or https:// URL.`);
  if (d.enabled.includes('projects')) for (const [index, p] of d.projects.entries()) {
    if (!p.name.trim()) issues.push(`Add a name for project ${index + 1}, or remove its empty card.`);
    if (p.url.trim() && !safeUrl(p.url)) issues.push(`Project ${p.name || '(untitled)'}: enter a full web URL.`);
  }
  return issues;
}
export function generateReadme(d: ReadmeDraft): string {
  const sections: Partial<Record<Section, string>> = {
    about: d.about.trim() ? `## About\n\n${markdownText(d.about.trim())}` : '',
    skills: d.skills.trim() ? `## Skills & tools\n\n${d.skills.split(',').map(s => s.trim()).filter(Boolean).map(s => d.badges ? `![${markdownText(s)}](https://img.shields.io/badge/${encodeURIComponent(s.replaceAll('-', '--').replaceAll('_', '__'))}-334155?style=flat-square)` : `- ${markdownText(s)}`).join(d.badges ? ' ' : '\n')}` : '',
    projects: d.projects.some(p => p.name.trim()) ? `## Featured projects\n\n${d.projects.filter(p => p.name.trim()).map(p => `- **${link(p.name, p.url)}**${p.description.trim() ? ` — ${markdownText(p.description)}` : ''}`).join('\n')}` : '',
    contact: d.portfolio || d.contact || validUsername(d.username) ? `## ${d.mode === 'profile' ? 'Find me' : 'Links'}\n\n${[d.portfolio ? link(d.mode === 'profile' ? 'Portfolio' : 'Live demo', d.portfolio) : '', d.contact ? link('Contact', d.contact) : '', validUsername(d.username) ? link('GitHub', `https://github.com/${d.username}${d.mode === 'repository' ? `/${encodeURIComponent(d.repo)}` : ''}`) : ''].filter(Boolean).join(' · ')}` : '',
    setup: d.install.trim() ? `## Installation\n\n${code(d.install)}` : '',
    usage: d.usage.trim() ? `## Usage\n\n${code(d.usage)}` : '',
    contributing: d.contributing.trim() ? `## Contributing\n\n${markdownText(d.contributing)}` : '',
    license: d.license.trim() && d.license !== 'None' ? `## License\n\n${markdownText(d.license)}. See the LICENSE file for the full terms.` : '',
    card: safeUrl(d.card) ? `## More\n\n![Profile card](<${safeUrl(d.card)!.replace(/>/g, '%3E').replace(/</g, '%3C')}>)` : '',
  };
  return `# ${markdownText(d.title.trim())}\n\n${markdownText(d.description.trim())}\n\n${d.order.filter(s => d.enabled.includes(s)).map(s => sections[s]).filter(Boolean).join('\n\n')}\n`;
}
export function readmeTemplate(d: ReadmeDraft, template: ReadmeDraft['template']): ReadmeDraft {
  return { ...d, template, mode: template === 'project' ? 'repository' : 'profile', manual: null,
    enabled: template === 'minimal' ? ['about', 'contact'] : template === 'project' ? ['about', 'skills', 'contact', 'setup', 'usage', 'contributing', 'license'] : ['about', 'skills', 'projects', 'contact'],
    title: template === 'project' ? 'Project Atlas' : d.mode === 'repository' ? 'Hi, I’m Alex' : d.title,
  };
}
export function restoreReadme(raw: unknown): ReadmeDraft {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('Choose a README Studio draft JSON file.');
  const source = raw as Partial<ReadmeDraft>;
  const draft = { ...README_DEFAULTS };
  const keys = ['username', 'title', 'description', 'about', 'skills', 'portfolio', 'contact', 'repo', 'install', 'usage', 'contributing', 'license', 'card'] as const;
  for (const key of keys) { if (typeof source[key] !== 'string') throw new Error(`Draft is missing ${key}.`); draft[key] = source[key].slice(0, key === 'install' || key === 'usage' ? 20000 : 3000); }
  if (source.mode !== 'profile' && source.mode !== 'repository') throw new Error('Choose a valid draft type.');
  draft.mode = source.mode; draft.template = source.template === 'minimal' || source.template === 'project' ? source.template : 'portfolio';
  draft.badges = source.badges === true;
  draft.manual = typeof source.manual === 'string' ? source.manual.slice(0, 100000) : null;
  draft.projects = Array.isArray(source.projects) ? source.projects.slice(0, 12).filter(p => p && typeof p.name === 'string' && typeof p.description === 'string' && typeof p.url === 'string').map(p => ({ name: p.name.slice(0, 160), description: p.description.slice(0, 1000), url: p.url.slice(0, 3000) })) : [];
  const all = Object.keys(SECTION_NAMES) as Section[];
  const allowed = (v: unknown): v is Section => typeof v === 'string' && v in SECTION_NAMES && all.includes(v as Section);
  draft.order = [...new Set(Array.isArray(source.order) ? source.order.filter(allowed) : []), ...all].filter((s, i, a) => a.indexOf(s) === i);
  draft.enabled = Array.isArray(source.enabled) ? [...new Set(source.enabled.filter(allowed))] : [...README_DEFAULTS.enabled];
  return draft;
}
