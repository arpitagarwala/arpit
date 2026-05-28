'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { marked } from 'marked';
import BackButton from '@/components/BackButton/BackButton';
import styles from './readme.module.css';

export default function ReadmeClient() {
  const [isClient, setIsClient] = useState(false);
  
  const [username, setUsername] = useState('arpitagarwala');
  const [title, setTitle] = useState('Hi there! I am Arpit 👋');
  const [description, setDescription] = useState('BCom (Hons) student and aspiring CA from Kolkata. I build things with tech.');
  
  const [stats, setStats] = useState({
    githubStats: true,
    topLangs: true,
    streak: true,
    trophies: false,
    visitors: true,
    theme: 'radical'
  });
  
  const [techStack, setTechStack] = useState<string[]>(['react', 'python', 'javascript', 'html5', 'tailwindcss']);
  const [newTech, setNewTech] = useState('');
  
  const [socials, setSocials] = useState({
    linkedin: 'https://linkedin.com/in/arpitagarwala',
    twitter: '',
    portfolio: 'https://arpitagarwala.online',
    youtube: '',
    medium: '',
    devto: ''
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const addTech = () => {
    if (newTech && !techStack.includes(newTech)) {
      setTechStack([...techStack, newTech]);
      setNewTech('');
    }
  };

  const removeTech = (index: number) => {
    setTechStack(prev => prev.filter((_, i) => i !== index));
  };

  const generatedMarkdown = useMemo(() => {
    const u = username || 'username';
    const themeStr = `&theme=${stats.theme}`;

    let md = `<h1 align="center">${title}</h1>\n\n`;
    md += `<p align="center">${description}</p>\n\n`;
    
    // Visitor Badge
    if (stats.visitors) {
      md += `<p align="center"><img src="https://profile-counter.glitch.me/${u}/count.svg" alt="Visitors" /></p>\n\n`;
    }

    // Socials
    md += `<p align="center">\n`;
    if (socials.linkedin) md += `<a href="${socials.linkedin}"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/></a> `;
    if (socials.twitter) md += `<a href="https://twitter.com/${socials.twitter}"><img src="https://img.shields.io/badge/Twitter-000000?style=for-the-badge&logo=x&logoColor=white" alt="Twitter"/></a> `;
    if (socials.portfolio) md += `<a href="${socials.portfolio}"><img src="https://img.shields.io/badge/Portfolio-2563EB?style=for-the-badge&logo=Web&logoColor=white" alt="Portfolio"/></a> `;
    if (socials.youtube) md += `<a href="${socials.youtube}"><img src="https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white" alt="YouTube"/></a> `;
    if (socials.medium) md += `<a href="${socials.medium}"><img src="https://img.shields.io/badge/Medium-000000?style=for-the-badge&logo=medium&logoColor=white" alt="Medium"/></a> `;
    if (socials.devto) md += `<a href="https://dev.to/${socials.devto}"><img src="https://img.shields.io/badge/dev.to-0A0A0A?style=for-the-badge&logo=dev.to&logoColor=white" alt="Dev.to"/></a> `;
    md += `\n</p>\n\n`;

    // Tech Stack
    if (techStack.length > 0) {
      md += `## 🛠️ Languages & Tools\n<p align="left">\n`;
      techStack.forEach(t => {
        md += `<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${t}/${t}-original.svg" alt="${t}" width="40" height="40"/> `;
      });
      md += `\n</p>\n\n`;
    }

    // Trophies
    if (stats.trophies) {
      md += `## 🏆 GitHub Trophies\n`;
      md += `[![trophy](https://github-profile-trophy.vercel.app/?username=${u}${themeStr}&row=1&column=7&no-frame=true&no-bg=true)](https://github.com/ryo-ma/github-profile-trophy)\n\n`;
    }

    // Stats Layout
    if (stats.githubStats || stats.topLangs) {
      md += `## 📈 GitHub Analytics\n\n`;
      md += `<div>\n`;
      if (stats.githubStats) {
        md += `  <img align="left" height="195" src="https://github-readme-stats.vercel.app/api?username=${u}&show_icons=true&hide_border=true${themeStr}" alt="${u}'s Github Stats" />\n`;
      }
      if (stats.topLangs) {
        md += `  <img align="left" height="195" src="https://github-readme-stats.vercel.app/api/top-langs/?username=${u}&layout=compact&hide_border=true${themeStr}" alt="Top Langs" />\n`;
      }
      md += `</div>\n<br clear="both"/>\n\n`;
    }

    if (stats.streak) {
      md += `## 🔥 Current Streak\n`;
      md += `[![GitHub Streak](https://streak-stats.demolab.com?user=${u}${themeStr}&hide_border=true)](https://git.io/streak-stats)\n\n`;
    }

    return md;
  }, [username, title, description, stats, techStack, socials]);

  const compiledMarkdown = useMemo(() => {
    return marked.parse(generatedMarkdown) as string;
  }, [generatedMarkdown]);

  const copyCode = () => {
    navigator.clipboard.writeText(generatedMarkdown).then(() => {
      alert('Markdown successfully copied to your clipboard!');
    });
  };

  if (!isClient) return <div className="bg-slate-950 min-h-screen"></div>;

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen flex flex-col pt-16 lg:pt-0">
      
      {/* Absolute Back Button to avoid affecting layout much */}
      <div className="fixed lg:hidden top-4 left-4 z-50">
        <BackButton />
      </div>

      <header className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="hidden lg:block"><BackButton /></div>
          <i className="ri-github-fill text-2xl ml-2 lg:ml-0"></i>
          <span className="text-sm font-bold tracking-tight">GitHub Profile README Maker</span>
        </div>
        <div className="flex gap-3">
          <button onClick={copyCode} className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 lg:px-5 py-2 rounded-lg font-bold transition flex items-center gap-2 shadow-lg text-xs lg:text-sm">
            <i className="ri-file-copy-line"></i> <span className="hidden lg:inline">Copy Markdown Code</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Sidebar / Form */}
        <aside className={`w-full lg:w-[400px] bg-slate-900 border-r border-slate-800 overflow-y-auto p-6 flex flex-col gap-8 shadow-inner shrink-0 ${styles.customScroll}`}>
          
          {/* Identity */}
          <div>
            <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-3">Core Identity</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-400">GitHub Username</label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="e.g. arpitagarwala" className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-sm focus:ring-2 ring-indigo-500 outline-none transition font-mono" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-400">Greeting Header</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-sm focus:ring-2 ring-indigo-500 outline-none transition" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-400">Short Bio</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-sm focus:ring-2 ring-indigo-500 outline-none transition"></textarea>
              </div>
            </div>
          </div>

          {/* Dynamic Stats & Cards */}
          <div>
            <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-3">Dynamic Analytics (Vercel)</h2>
            <div className="flex flex-col gap-3 bg-slate-800 p-4 rounded-xl border border-slate-700">
              <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer text-slate-200">
                <input type="checkbox" checked={stats.githubStats} onChange={e => setStats({...stats, githubStats: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded" /> Enable Main Stats Card
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                <input type="checkbox" checked={stats.topLangs} onChange={e => setStats({...stats, topLangs: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded" /> Top Languages Chart
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                <input type="checkbox" checked={stats.streak} onChange={e => setStats({...stats, streak: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded" /> GitHub Streak Tracker
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                <input type="checkbox" checked={stats.trophies} onChange={e => setStats({...stats, trophies: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded" /> GitHub Trophies UI
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer text-slate-200">
                <input type="checkbox" checked={stats.visitors} onChange={e => setStats({...stats, visitors: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded" /> Analytics Visitor Counter
              </label>
              
              <div className="mt-2 pt-3 border-t border-slate-700">
                <label className="block text-xs font-bold mb-1 text-slate-400">Card Theme</label>
                <select value={stats.theme} onChange={e => setStats({...stats, theme: e.target.value})} className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-1.5 text-sm outline-none">
                  <option value="radical">Radical</option>
                  <option value="tokyonight">Tokyo Night</option>
                  <option value="dark">Dark</option>
                  <option value="dracula">Dracula</option>
                  <option value="transparent">Transparent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tech Stack */}
          <div>
            <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-3">Tech Skills (DevIcons)</h2>
            <div className="flex gap-2 mb-2">
              <select value={newTech} onChange={e => setNewTech(e.target.value)} className="flex-1 bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-sm outline-none">
                <option value="">Select a tech...</option>
                <option value="react">React</option>
                <option value="vuejs">Vue.js</option>
                <option value="angularjs">Angular</option>
                <option value="svelte">Svelte</option>
                <option value="typescript">TypeScript</option>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cplusplus">C++</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
                <option value="html5">HTML5</option>
                <option value="css3">CSS3</option>
                <option value="nodejs">Node.js</option>
                <option value="express">Express</option>
                <option value="nextjs">Next.js</option>
                <option value="tailwindcss">Tailwind CSS</option>
                <option value="sass">SASS</option>
                <option value="mongodb">MongoDB</option>
                <option value="mysql">MySQL</option>
                <option value="postgresql">PostgreSQL</option>
                <option value="firebase">Firebase</option>
                <option value="aws">AWS</option>
                <option value="docker">Docker</option>
                <option value="kubernetes">Kubernetes</option>
                <option value="git">Git</option>
                <option value="linux">Linux</option>
              </select>
              <button onClick={addTech} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 rounded-lg font-bold"><i className="ri-add-line"></i> Add</button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {techStack.map((t, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold px-2 py-1 rounded-md">
                  <span>{t}</span>
                  <i className="ri-close-circle-fill text-slate-400 hover:text-red-500 cursor-pointer" onClick={() => removeTech(idx)}></i>
                </span>
              ))}
            </div>
          </div>
          
          {/* Socials */}
          <div>
            <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-3">Connect / Socials</h2>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <i className="ri-linkedin-box-fill text-blue-600 text-xl"></i>
                <input type="text" value={socials.linkedin} onChange={e => setSocials({...socials, linkedin: e.target.value})} placeholder="LinkedIn URL" className="flex-1 bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-3 py-1.5 text-sm outline-none" />
              </div>
              <div className="flex items-center gap-2">
                <i className="ri-twitter-x-line text-slate-300 text-xl"></i>
                <input type="text" value={socials.twitter} onChange={e => setSocials({...socials, twitter: e.target.value})} placeholder="Twitter/X Username" className="flex-1 bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-3 py-1.5 text-sm outline-none" />
              </div>
              <div className="flex items-center gap-2">
                <i className="ri-links-line text-emerald-600 text-xl"></i>
                <input type="text" value={socials.portfolio} onChange={e => setSocials({...socials, portfolio: e.target.value})} placeholder="Portfolio Website URL" className="flex-1 bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-3 py-1.5 text-sm outline-none" />
              </div>
              <div className="flex items-center gap-2">
                <i className="ri-youtube-fill text-red-600 text-xl"></i>
                <input type="text" value={socials.youtube} onChange={e => setSocials({...socials, youtube: e.target.value})} placeholder="YouTube Channel URL" className="flex-1 bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-3 py-1.5 text-sm outline-none" />
              </div>
              <div className="flex items-center gap-2">
                <i className="ri-medium-fill text-slate-200 text-xl"></i>
                <input type="text" value={socials.medium} onChange={e => setSocials({...socials, medium: e.target.value})} placeholder="Medium Profile URL" className="flex-1 bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-3 py-1.5 text-sm outline-none" />
              </div>
              <div className="flex items-center gap-2">
                <i className="ri-terminal-box-fill text-slate-400 text-xl"></i>
                <input type="text" value={socials.devto} onChange={e => setSocials({...socials, devto: e.target.value})} placeholder="Dev.to Username" className="flex-1 bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-3 py-1.5 text-sm outline-none" />
              </div>
            </div>
          </div>

        </aside>

        {/* Preview Window */}
        <main className={`flex-1 bg-slate-950 p-8 overflow-y-auto relative w-full ${styles.customScroll}`}>
          <div className="absolute top-4 right-4 bg-slate-800 shadow-md border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-300 flex items-center gap-2 z-10">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            Live Render
          </div>
          
          <div 
            className={`bg-slate-900 text-slate-200 rounded-xl shadow-2xl border border-slate-800 p-10 max-w-4xl mx-auto w-full overflow-hidden ${styles.markdownBody}`}
            dangerouslySetInnerHTML={{ __html: compiledMarkdown }}
          />
        </main>
      </div>
    </div>
  );
}
