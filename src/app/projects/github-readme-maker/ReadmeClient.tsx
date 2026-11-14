'use client';
import {toolStorage} from '@/lib/account-storage';

import { useEffect, useMemo, useState } from 'react';
import { marked } from 'marked';
import BackButton from '@/components/BackButton/BackButton';
import { README_DEFAULTS, SECTION_NAMES, generateReadme, readmeIssues, readmeTemplate, restoreReadme, safeUrl, validUsername, type ReadmeDraft, type Section } from '@/lib/readme';
import styles from './readme.module.css';

type SavedDraft = { id: string; name: string; draft: ReadmeDraft };
export default function ReadmeClient() {
  const [draft, setDraft] = useState<ReadmeDraft>(README_DEFAULTS);
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<'preview' | 'markdown' | 'publish'>('preview');
  const [light, setLight] = useState(false);
  const [images, setImages] = useState(false);
  const [notice, setNotice] = useState('');
  const [storageNotice, setStorageNotice] = useState('Preparing your workspace…');
  const [saved, setSaved] = useState<SavedDraft[]>([]);
  const [draftName, setDraftName] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const raw = toolStorage.getItem('readme-studio:current');
        if (raw) setDraft(restoreReadme(JSON.parse(raw)));
        const records: unknown = JSON.parse(toolStorage.getItem('readme-studio:saved') || '[]');
        if (Array.isArray(records)) setSaved(records.slice(0, 20).flatMap(s => { try { return s && typeof s.id === 'string' && typeof s.name === 'string' ? [{ id: s.id, name: s.name.slice(0,80), draft: restoreReadme(s.draft) }] : []; } catch { return []; } }));
        setStorageNotice('Draft autosaves in this browser');
      } catch { setStorageNotice('Could not read saved work. You can still build and download a README.'); }
      setReady(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (!ready) return;
    const persist = () => { try { toolStorage.setItem('readme-studio:current', JSON.stringify(draft)); setStorageNotice('Draft autosaved in this browser'); } catch { setStorageNotice('Browser storage is unavailable or full. Download a draft backup to keep your work.'); } };
    const timer = setTimeout(persist, 300);
    window.addEventListener('pagehide', persist);
    return () => { clearTimeout(timer); window.removeEventListener('pagehide', persist); };
  }, [draft, ready]);
  const generated = useMemo(() => generateReadme(draft), [draft]);
  const markdown = draft.manual ?? generated;
  const issues = draft.manual === null ? readmeIssues(draft) : markdown.trim() ? [] : ['Your Markdown is empty.'];
  const preview = useMemo(() => {
    const body = marked.parse(markdown, { async: false });
    const background = light ? '#ffffff' : '#12110e', foreground = light ? '#26221d' : '#f4eade', border = light ? '#e7d4ba' : '#3a342d';
    return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${images ? 'https: http:' : "'none'"}; style-src 'unsafe-inline'; form-action 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'"><base target="_blank"><style>html{color-scheme:${light ? 'light' : 'dark'}}::-webkit-scrollbar{width:7px}::-webkit-scrollbar-thumb{background:${border};border-radius:8px}body{background:${background};color:${foreground};font:16px/1.8 system-ui,sans-serif;padding:28px;margin:0;overflow-wrap:anywhere}h1,h2{border-bottom:1px solid ${border};padding-bottom:12px;line-height:1.4}h1{font-size:28px}h2{font-size:21px;margin-top:28px}h3{font-size:17px}a{color:${light ? '#7d6950' : '#d6b588'};pointer-events:none}img{max-width:100%;height:auto}pre{background:${light ? '#fbf7f3' : '#1d1b17'};padding:16px;border-radius:8px;overflow:auto}code{font:15px/1.7 ui-monospace,monospace}table{border-collapse:collapse;display:block;overflow:auto}td,th{border:1px solid ${border};padding:8px}blockquote{border-left:3px solid ${border};padding-left:16px;opacity:.8}li{margin:5px 0}</style></head><body>${body}</body></html>`;
  }, [markdown, light, images]);
  function change<K extends keyof ReadmeDraft>(key: K, value: ReadmeDraft[K]) { setDraft(old => ({ ...old, [key]: value })); setNotice(''); }
  function field(key: 'username' | 'title' | 'description' | 'about' | 'skills' | 'portfolio' | 'contact' | 'repo' | 'install' | 'usage' | 'contributing' | 'card', label: string, help?: string, multiline = false) {
    return <label className={styles.field}><span>{label}</span>{multiline ? <textarea aria-label={label} aria-describedby={help ? `readme-help-${key}` : undefined} rows={key === 'install' || key === 'usage' ? 4 : 3} maxLength={key === 'install' || key === 'usage' ? 20000 : 3000} value={draft[key]} onChange={e => change(key, e.target.value)} /> : <input aria-label={label} aria-describedby={help ? `readme-help-${key}` : undefined} value={draft[key]} maxLength={key === 'username' ? 39 : 3000} onChange={e => change(key, e.target.value)} />}{help && <small id={`readme-help-${key}`}>{help}</small>}</label>;
  }
  function download(content: string, filename: string, type: string) {
    const url = URL.createObjectURL(new Blob([content], { type })); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice(`${filename} download requested.`);
  }
  async function copy() {
    try { await navigator.clipboard.writeText(markdown); setNotice('Markdown copied. Ready to paste into README.md.'); }
    catch { setView('markdown'); setNotice('Clipboard access is unavailable. Select the Markdown to copy it, or download README.md.'); }
  }
  function saveDraft() {
    if (saved.length >= 20) { setNotice('You have 20 saved drafts. Remove a saved draft before adding another.'); return; }
    const next = [{ id: crypto.randomUUID(), name: draftName.trim() || draft.title || 'Untitled draft', draft: { ...draft } }, ...saved];
    try { toolStorage.setItem('readme-studio:saved', JSON.stringify(next)); setSaved(next); setNotice('Named draft saved in this browser.'); } catch { setNotice('Could not save. Download a JSON backup instead.'); }
  }
  async function importGithub() {
    if (!validUsername(draft.username)) { setNotice('Enter a valid GitHub username first.'); return; }
    if (draft.mode === 'repository' && !/^[\w.-]{1,100}$/.test(draft.repo)) { setNotice('Enter a valid repository name first.'); return; }
    setBusy(true);
    const requestDraft = { ...draft };
    const abort = new AbortController(); const timeout = setTimeout(() => abort.abort(), 15000);
    try {
      const user = encodeURIComponent(requestDraft.username);
      const endpoint = requestDraft.mode === 'profile' ? `https://api.github.com/users/${user}` : `https://api.github.com/repos/${user}/${encodeURIComponent(requestDraft.repo)}`;
      const response = await fetch(endpoint, { headers: { Accept: 'application/vnd.github+json' }, signal: abort.signal, credentials: 'omit' });
      if (!response.ok) throw new Error(response.status === 404 ? 'Public profile or repository not found.' : response.status === 403 || response.status === 429 ? 'GitHub’s public API limit was reached. Try later or enter details manually.' : 'GitHub could not load this information.');
      const info = await response.json();
      if (requestDraft.mode === 'profile') {
        const title = `Hi, I’m ${typeof info.name === 'string' && info.name ? info.name : requestDraft.username}`;
        const description = typeof info.bio === 'string' ? info.bio : '';
        let portfolio = typeof info.blog === 'string' ? info.blog : '';
        if (portfolio && !/^https?:\/\//i.test(portfolio)) portfolio = `https://${portfolio}`;
        setDraft(old => ({ ...old, title: title.slice(0,3000), description: description.slice(0,3000), portfolio: safeUrl(portfolio) || '' }));
      } else setDraft(old => ({ ...old, title: typeof info.name === 'string' ? info.name.slice(0,3000) : old.title, description: typeof info.description === 'string' ? info.description.slice(0,3000) : '', portfolio: safeUrl(typeof info.homepage === 'string' ? info.homepage : '') || '', skills: typeof info.language === 'string' ? info.language : old.skills, license: typeof info.license?.spdx_id === 'string' && info.license.spdx_id !== 'NOASSERTION' ? info.license.spdx_id : 'None' }));
      setNotice('Public details imported. Review the copy and commands before exporting. Your other sections were kept.');
    } catch (error) { setNotice(error instanceof Error && error.name === 'AbortError' ? 'GitHub took too long to respond. Your draft is unchanged.' : error instanceof Error ? error.message : 'Unable to import. Enter details manually.'); }
    finally { clearTimeout(timeout); setBusy(false); }
  }
  function move(section: Section, direction: -1 | 1) { const order = [...draft.order]; const index = order.indexOf(section); [order[index], order[index+direction]] = [order[index+direction],order[index]]; change('order',order); }
  if (!ready) return <main className={styles.page}><p>Opening your README workspace…</p></main>;
  return <main className={styles.page}><BackButton /><div className={styles.shell}>
    <header className={styles.header}><div><p className={styles.eyebrow}>YOUR WORK DESERVES A GOOD INTRODUCTION</p><h1>README Studio<span>.</span></h1><p>A thoughtful profile. A useful project guide. Ready for GitHub.</p></div><div className={styles.headerActions}><button className={styles.secondary} disabled={!!issues.length} onClick={copy}>Copy Markdown</button><button className={styles.primary} disabled={!!issues.length} onClick={() => download(markdown,'README.md','text/markdown;charset=utf-8')}>↓ Download README</button></div></header>
    <a className={styles.jump} href="#readme-output">Jump to your README ↓</a><div className={styles.status}><span>{storageNotice}</span><span>{markdown.split('\n').length} lines · {new TextEncoder().encode(markdown).length.toLocaleString()} bytes</span></div>
    <p className={styles.notice} role="status">{notice}</p>
    <div className={styles.layout}><aside className={styles.builder} aria-label="README builder"><h2>Make it yours</h2><div className={styles.templates}>{(['minimal','portfolio','project'] as const).map(t => <button key={t} disabled={busy} aria-pressed={draft.template===t} onClick={() => { if (draft.manual !== null && !window.confirm('Switch to builder output? Your manual Markdown will be replaced. Download it first if you want to keep it.')) return; setDraft(readmeTemplate(draft,t)); setNotice('Template updated. Your reusable details were kept.'); }}>{({ minimal:'Minimal profile',portfolio:'Portfolio profile',project:'Project guide' })[t]}</button>)}</div>
      {draft.manual !== null && <div className={styles.manualNote}>You are editing Markdown directly. Builder changes stay saved but will not appear until you choose “Use builder output”.</div>}
      <fieldset disabled={busy} className={styles.identity}>
        {field('username',draft.mode === 'profile' ? 'GitHub username' : 'Repository owner','Used for public import and the publishing guide.')}
        {draft.mode === 'repository' && field('repo','Repository name','Import public metadata from owner/repository.')}
        <button className={styles.importButton} disabled={busy || !validUsername(draft.username)} onClick={importGithub}>{busy ? 'Importing…' : `Import public ${draft.mode === 'profile' ? 'profile' : 'repository'}`}</button><p className={styles.help}>Only runs when you click. No login or token needed. GitHub may limit public requests.</p>
        {field('title','Heading')}{field('description','Short introduction',undefined,true)}
      </fieldset>
      <details open className={styles.details}><summary>Story & skills</summary>{field('about','About this profile or project',undefined,true)}{field('skills','Skills & tools','Comma-separated names. Text by default; badges are optional.')}<label className={styles.check}><input type="checkbox" checked={draft.badges} onChange={e => change('badges',e.target.checked)} /> Use skill badges</label></details>
      <details className={styles.details} open={draft.mode === 'profile'}><summary>Featured projects</summary><p className={styles.help}>Give readers a few strong examples of your work.</p>{draft.projects.map((project,index) => <div className={styles.project} key={index}>{(['name','description','url'] as const).map(key => <label className={styles.field} key={key}><span>Project {index+1} {key === 'url' ? 'link' : key}</span><input maxLength={key==='description'?1000:key==='url'?3000:160} value={project[key]} onChange={e => change('projects',draft.projects.map((p,i) => i===index ? {...p,[key]:e.target.value} : p))} /></label>)}<button className={styles.remove} onClick={() => change('projects',draft.projects.filter((_,i) => i!==index))}>Remove project {index+1}</button></div>)}<button className={styles.secondary} disabled={draft.projects.length>=12} onClick={() => change('projects',[...draft.projects,{name:'',description:'',url:''}])}>+ Add project</button></details>
      <details className={styles.details}><summary>Links & optional image</summary>{field('portfolio','Portfolio or live demo URL','Full https:// URL.')}{field('contact','Contact or social URL','Link to your preferred contact page.')}{field('card','Optional image card URL','Bring your own hosted card. No hosted stats service is assumed.')}</details>
      {draft.mode === 'repository' && <details className={styles.details} open><summary>Help someone use your project</summary>{field('install','Installation commands','Example commands: replace them with steps verified for your project.',true)}{field('usage','Usage commands','Explain how to run the project.',true)}{field('contributing','Contribution guidance',undefined,true)}<label className={styles.field}><span>License label</span><input value={draft.license} maxLength={100} onChange={e => change('license',e.target.value)} /><small>Use None to omit. This label does not create a license file; choose terms you are authorized to apply.</small></label></details>}
      <details className={styles.details}><summary>Sections & reading order</summary><p className={styles.help}>Include only what helps your reader. Move sections to tell the right story.</p><ol className={styles.sections}>{draft.order.map((section,index) => <li key={section}><label><input type="checkbox" checked={draft.enabled.includes(section)} onChange={e => change('enabled',e.target.checked ? [...draft.enabled,section] : draft.enabled.filter(s => s!==section))} />{SECTION_NAMES[section]}</label><button disabled={index===0} aria-label={`Move ${SECTION_NAMES[section]} up`} onClick={() => move(section,-1)}>↑</button><button disabled={index===draft.order.length-1} aria-label={`Move ${SECTION_NAMES[section]} down`} onClick={() => move(section,1)}>↓</button></li>)}</ol></details>
      <details className={styles.details}><summary>Reusable drafts & backups</summary><label className={styles.field}><span>Draft name</span><input value={draftName} maxLength={80} onChange={e => setDraftName(e.target.value)} /></label><button className={styles.secondary} onClick={saveDraft}>Save named draft</button><ul className={styles.saved}>{saved.map(s => <li key={s.id}><button onClick={() => { setDraft(restoreReadme(s.draft));setDraftName(s.name);setNotice(`Loaded ${s.name}.`); }}>{s.name}</button><button aria-label={`Remove saved draft ${s.name}`} onClick={() => { const next=saved.filter(d => d.id!==s.id);try { toolStorage.setItem('readme-studio:saved',JSON.stringify(next));setSaved(next);setNotice('Saved copy removed. Your current document is unchanged.'); } catch { setNotice('Could not update saved drafts.'); } }}>×</button></li>)}</ul><div className={styles.backups}><button onClick={() => download(JSON.stringify(draft,null,2),'readme-draft.json','application/json')}>Export draft JSON</button><label className={styles.fileLabel}>Import draft JSON<input type="file" accept="application/json,.json" onChange={async e => { const file=e.target.files?.[0];if(!file)return; if(file.size>300000){setNotice('Choose a draft smaller than 300 KB.');return;}try{setDraft(restoreReadme(JSON.parse(await file.text())));setNotice('Draft imported.');}catch(error){setNotice(error instanceof Error?error.message:'Invalid draft file.');} e.target.value=''; }} /></label></div></details>
    </aside><section className={styles.document} id="readme-output" aria-label="README output"><div className={styles.previewToolbar}><div className={styles.tabs}>{(['preview','markdown','publish'] as const).map(v => <button key={v} aria-pressed={view===v} onClick={() => setView(v)}>{({preview:'Preview',markdown:'Markdown',publish:'Use on GitHub'})[v]}</button>)}</div>{view==='preview' && <button className={styles.themeButton} aria-pressed={light} onClick={() => setLight(!light)}>{light ? 'Dark preview' : 'Light preview'}</button>}</div>
      {!!issues.length && <div className={styles.checklist} role="status"><h3>Before you export</h3><ul>{issues.map(issue => <li key={issue}>{issue}</li>)}</ul></div>}
      {view === 'preview' && <><div className={styles.previewHint}><p>GitHub-style preview. Images stay off until you enable them; links are inactive here.</p><label><input type="checkbox" checked={images} onChange={e => setImages(e.target.checked)} /> Load external images</label></div><iframe title="README preview" sandbox="" referrerPolicy="no-referrer" srcDoc={preview} className={styles.preview} /></>}
      {view === 'markdown' && <div className={styles.codePanel}><div className={styles.codeToolbar}><span>{draft.manual===null ? 'Generated by your builder' : 'Manual Markdown override'}</span>{draft.manual===null ? <button onClick={() => change('manual',generated)}>Edit Markdown directly</button> : <button onClick={() => { if(window.confirm('Replace manual Markdown with your saved builder output?'))change('manual',null); }}>Use builder output</button>}</div><textarea aria-label="README Markdown" spellCheck={false} readOnly={draft.manual===null} value={markdown} maxLength={100000} onChange={e => change('manual',e.target.value)} /><p className={styles.help}>Direct edits are saved with the draft. They do not update builder fields. Download uses exactly the Markdown shown here.</p></div>}
      {view === 'publish' && <div className={styles.publish}><p className={styles.eyebrow}>FROM DRAFT TO A USEFUL README</p><h2>{draft.mode==='profile' ? 'Put your profile in the spotlight' : 'Give your repository a clear starting point'}</h2><ol>{draft.mode==='profile' ? <><li>Create a public repository named <code>{draft.username || 'your-username'}</code>, exactly matching your GitHub username.</li><li>Add <code>README.md</code> at the root. Paste the Markdown or upload your downloaded file.</li><li>Commit the file. GitHub displays it on your profile when the public repository and username match.</li></> : <><li>Open <code>{draft.username || 'owner'}/{draft.repo || 'repository'}</code> on GitHub.</li><li>Add or edit the root <code>README.md</code>. Paste the exported Markdown.</li><li>Verify the installation commands, links, and license against your project, then commit.</li></>}</ol><h3>A quick quality check</h3><ul><li>Replace example text with your own story.</li><li>Show a small number of projects with useful descriptions.</li><li>Use correct installation steps and a LICENSE file when applicable.</li><li>Check the final rendering on GitHub; styles can differ slightly from this preview.</li><li>Third-party badges and image cards can become unavailable. Keep essential information in text.</li></ul><a href="https://docs.github.com/en/account-and-profile/how-tos/profile-customization/managing-your-profile-readme" target="_blank" rel="noopener noreferrer">GitHub’s profile README guide ↗</a><p className={styles.help}>Drafts stay in your browser. JSON backups keep the builder fields; README.md is the file you publish. No account credentials are requested.</p></div>}
    </section></div>
  </div></main>;
}






