'use client';

import { useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { BUILT_APPS } from '@/data/apps';
import { appEnquiryLinks, ENQUIRY_INTENTS, type EnquiryIntent } from '@/lib/app-enquiry';
import s from './page.module.css';
import AppThumbnail from './AppThumbnail';

const categories = ['All apps', 'Study', 'Business', 'Lifestyle', 'Finance', 'Personal'] as const;
const tileRotations = [-12, 8, -5, 6, -9, 12];
const appCount = String(BUILT_APPS.length).padStart(2, '0');

export default function AppsClient({ email, whatsapp }: { email: string; whatsapp?: string }) {
  const [category, setCategory] = useState<string>('All apps');
  const [app, setApp] = useState('');
  const [intent, setIntent] = useState<EnquiryIntent>(ENQUIRY_INTENTS[0]);
  const [draft, setDraft] = useState<ReturnType<typeof appEnquiryLinks> | null>(null);
  const enquiry = useRef<HTMLElement>(null);
  const appSelect = useRef<HTMLSelectElement>(null);
  const visible = BUILT_APPS.filter(item => category === 'All apps' || item.category === category);

  function enquire(selected = '', purpose: EnquiryIntent = ENQUIRY_INTENTS[0]) {
    setApp(selected);
    setIntent(purpose);
    setDraft(null);
    enquiry.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
    appSelect.current?.focus({ preventScroll: true });
  }

  function prepare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    setDraft(appEnquiryLinks({ app, intent, name: String(fields.get('name') ?? ''), reply: String(fields.get('reply') ?? ''), message: String(fields.get('message') ?? '') }, email, whatsapp));
  }

  return <>
    <header className={s.hero}>
      <div className={s.heroCopy}>
        <p className={s.eyebrow}><span /> THE APP COLLECTION / BY ARPIT</p>
        <h1>Built with curiosity.<br /><em>Made for real life.</em></h1>
        <p className={s.intro}>A collection of apps I’ve imagined, built and brought to the web. From study companions to business tools, each one starts with a problem worth solving.</p>
        <div className={s.heroActions}><a href="#collection" className={s.primary}>Explore the apps <span aria-hidden="true">↓</span></a><button type="button" className={s.textButton} onClick={() => enquire('', 'Build a custom app')}>Let’s build yours <span aria-hidden="true">↗</span></button></div>
        <div className={s.heroNote}><span>{appCount}</span><p>Dedicated creations.<br />One curious mind.</p></div>
      </div>
      <div className={s.art} aria-hidden="true">
        <div className={s.orbit} /><div className={s.orbitInner} />
        <div className={s.artCaption}>IDEA → BUILD → LAUNCH</div>
        <div className={s.appCluster}>{BUILT_APPS.map((item, index) => <div key={item.id} className={s.appTile} style={{ '--app-color': item.color, '--rotation': `${tileRotations[index % tileRotations.length]}deg` } as CSSProperties}><i className={item.icon} /><small>{item.monogram}</small></div>)}</div>
        <div className={s.artSignature}><span>Made by a human.</span><span>Powered by curiosity. ↗</span></div>
      </div>
    </header>

    <section id="collection" className={s.collection} aria-labelledby="collection-title" data-analytics-section="apps/collection">
      <div className={s.sectionHeading}><div><p className={s.eyebrow}>THE THINGS I BUILD</p><h2 id="collection-title">Different ideas. Same dedication.</h2></div><span className={s.collectionCount}>01 — {appCount} / SELECTED APPS</span></div>
      <div className={s.filters} role="group" aria-label="Filter apps by category">{categories.map(item => <button type="button" key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}{item === 'All apps' && <span>{BUILT_APPS.length}</span>}</button>)}</div>
      <p className={s.srOnly} role="status">Showing {visible.length} {visible.length === 1 ? 'app' : 'apps'}</p>
      <div className={s.appGrid}>{visible.map(item => <article key={item.id} className={s.appCard} style={{ '--app-color': item.color } as CSSProperties}>
        <div className={s.cardArt} aria-hidden="true"><AppThumbnail id={item.id}/></div>
        <div className={s.cardBody}><span className={s.category}>{item.category}</span><h3>{item.name}</h3><p className={s.tagline}>{item.line}</p><p className={s.description}>{item.description}</p><div className={s.cardActions}>{item.href ? <a href={item.href} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${item.name} (opens in a new tab)`}>Visit app <span aria-hidden="true">↗</span></a> : <span className={s.pending}>Public link coming soon</span>}<button type="button" onClick={() => enquire(item.name)} aria-label={`Enquire about ${item.name}`}>Enquire <span aria-hidden="true">↗</span></button></div></div>
      </article>)}</div>
    </section>

    <section className={s.collaborate} aria-labelledby="collaborate-title">
      <p className={s.eyebrow}>YOUR IDEA COULD BE NEXT</p>
      <div className={s.collaborateHeading}><h2 id="collaborate-title">Something caught your eye?<br /><span>Let’s talk possibilities.</span></h2><p>Try an app. Make it part of your work.<br />Or bring a completely new idea to life.</p></div>
      <div className={s.paths}>{[
        { number: '01', title: 'Curious about an app?', text: 'Ask how it works, discuss a feature or share your feedback.', intent: ENQUIRY_INTENTS[0], icon: 'ri-chat-3-line' },
        { number: '02', title: 'Want it for your business?', text: 'Discuss purchasing, licensing or adapting an app to your needs.', intent: ENQUIRY_INTENTS[1], icon: 'ri-shopping-bag-3-line' },
        { number: '03', title: 'Have an idea of your own?', text: 'Tell me what you want to build. We can work out the next step together.', intent: ENQUIRY_INTENTS[2], icon: 'ri-lightbulb-line' },
      ].map(path => <button key={path.number} type="button" onClick={() => enquire('', path.intent)} className={s.path}><span className={s.pathTop}><i className={path.icon} aria-hidden="true" /><small>{path.number} /</small></span><strong>{path.title}</strong><span>{path.text}</span><span className={s.pathArrow} aria-hidden="true">↗</span></button>)}</div>
    </section>

    <section id="enquiry" ref={enquiry} className={s.enquiry} aria-labelledby="enquiry-title" data-analytics-section="apps/enquiry">
      <div className={s.enquiryIntro}><p className={s.eyebrow}>DIRECT TO THE BUILDER</p><h2 id="enquiry-title">Good things start<br />with a <em>hello.</em></h2><p>Tell me a little about what you have in mind. Whether it’s an app question, a purchase enquiry or a fresh idea, the conversation starts here.</p><a href={`mailto:${email}`} className={s.email}>{email} <span aria-hidden="true">↗</span></a><div className={s.contactNote}><i className="ri-chat-smile-2-line" aria-hidden="true" /><p>No middlemen. You’ll be talking<br />directly with Arpit.</p></div></div>
      <form className={s.form} onSubmit={prepare} onChange={() => setDraft(null)}>
        <div className={s.formRow}><label>I’m interested in<select ref={appSelect} value={app} onChange={event => setApp(event.target.value)}><option value="">A new project / not sure yet</option>{BUILT_APPS.map(item => <option key={item.id} value={item.name}>{item.name}</option>)}</select></label><label>I’d like to<select value={intent} onChange={event => setIntent(event.target.value as EnquiryIntent)}>{ENQUIRY_INTENTS.map(item => <option key={item}>{item}</option>)}</select></label></div>
        <div className={s.formRow}><label>Your name<input name="name" autoComplete="name" placeholder="What should I call you?" required maxLength={100} pattern=".*\S.*" /></label><label>Your email <span className={s.optional}>(optional)</span><input name="reply" type="email" autoComplete="email" placeholder="you@example.com" maxLength={200} /></label></div>
        <label>A little about what you need<textarea name="message" placeholder="Which app caught your eye? What would you like to build or discuss?" rows={4} required minLength={10} maxLength={2000} /></label>
        <button type="submit" className={s.primary}>Prepare my enquiry <span aria-hidden="true">↗</span></button>
        <p className={s.formNote}>Choose email{whatsapp ? ' or WhatsApp' : ''} in the next step. You review and send the message there. This page doesn’t store your enquiry.</p>
        {draft && <div className={s.draft}><p role="status">Your message is ready. Choose how to send it.</p><pre>{draft.body}</pre><div>{draft.whatsapp && <a className={s.primary} href={draft.whatsapp} target="_blank" rel="noopener noreferrer">Continue on WhatsApp ↗</a>}<a className={s.emailDraft} href={draft.email}>Open email draft ↗</a></div><small>Nothing has been sent yet. If your email app doesn’t open, copy the message above and email {email}.</small></div>}
      </form>
    </section>
    <div className={s.signoff}><span>Thoughtfully built. Personally maintained.</span><span>Arpit Agarwala <span aria-hidden="true">↗</span></span></div>
  </>;
}
