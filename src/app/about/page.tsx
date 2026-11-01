import {pageMetadata} from '@/lib/page-metadata';
/* eslint-disable @next/next/no-img-element -- Owner-controlled profile image. */
import type {Metadata} from 'next';
import BackButton from '@/components/BackButton/BackButton';
import Footer from '@/components/Footer/Footer';
import {getSite} from '@/lib/site-server';
import {personalPhotos,photoUrl,PRIMARY_PHOTO} from '@/lib/personal-photos';
import {sitePathEnabled} from '@/lib/site-config';
import s from './page.module.css';
import SectionNavigation from './SectionNavigation';
export async function generateMetadata():Promise<Metadata>{const c=await getSite();const photo=sitePathEnabled(c,'/gallery')?personalPhotos(c.gallery.photos)[0]:undefined;return pageMetadata('/about',{title:c.about.title+' – '+c.profile.name,description:c.about.subtitle,...(photo?{openGraph:{images:[{url:photoUrl(photo),alt:c.profile.name+' — '+photo.alt}]}}:{})});}
function socialColor(icon:string){return icon.includes('whatsapp')?'#65d49a':icon.includes('instagram')?'#eaa2c6':icon.includes('linkedin')?'#79b9f5':icon.includes('github')?'#e0e6ee':'#9ac8f1';}
const ICONS:Record<string,string>={text:'ri-user-3-line',experience:'ri-briefcase-4-line',education:'ri-graduation-cap-line',skills:'ri-compasses-2-line'};
export default async function AboutPage(){
 const site=await getSite(),{profile,about}=site,sections=about.sections.filter(sec=>sec.enabled);
 const photo=sitePathEnabled(site,'/gallery')?personalPhotos(site.gallery.photos)[0]:undefined;
 const portrait=photo?.src||profile.portrait;
 return <div className={s.page}><BackButton/><div className={s.container}>
 <header className={s.header}><p className={s.eyebrow}>THE PERSON BEHIND THE WORK</p><h1>{about.title}</h1><p className={s.subtitle}>{about.subtitle}</p></header>
 {sections.length>0&&<SectionNavigation sections={sections.map(sec=>({id:sec.id,title:sec.title,icon:ICONS[sec.type]||'ri-article-line'}))}/>}
 <div className={s.grid}><aside className={s.leftCol}><section className={s.profileCard} aria-label="Profile"><div className={s.profileTop}>{portrait&&<span className={s.portraitFrame}><img src={portrait} alt={photo?profile.name+' — '+photo.alt:profile.name} className={`${s.profileImg} ${portrait===PRIMARY_PHOTO?s.studioPortrait:''}`}/></span>}<div><h2 className={s.profileName}>{profile.name}</h2><p className={s.profileRole}>{profile.role}</p></div></div><div className={s.profileBadges}><span><i className="ri-map-pin-line" aria-hidden="true"/>{profile.location}</span>{profile.available&&<span className={s.available}><span className={s.dot}/>Available</span>}</div><p className={s.profileBio}>{profile.bio}</p></section>
 {about.showGlance&&<section className={s.sideCard}><h2 className={s.sectionLabel}>{about.glanceTitle}</h2><div className={s.statsGrid}>{about.stats.filter(v=>v.enabled).map(v=><div key={v.id}><strong>{v.subtitle}</strong><span>{v.title}</span></div>)}</div></section>}
 {about.showConnect&&<section className={s.sideCard}><h2 className={s.sectionLabel}>{about.connectTitle}</h2><div className={s.connectList}>{about.connect.filter(c=>c.enabled).map(c=><a key={c.id} href={c.href} target={c.href.startsWith('https:')?'_blank':undefined} rel="noopener noreferrer"><i className={c.icon} style={{color:socialColor(c.icon)}} aria-hidden="true"/><span>{c.label}</span><span aria-hidden="true">↗</span></a>)}</div></section>}</aside>
 <div className={s.rightCol}>{sections.map((sec,index)=><section tabIndex={-1} id={'about-'+sec.id} data-analytics-section={'about/'+sec.type} className={s.contentCard} key={sec.id}><div className={s.sectionHeading}><span className={s.sectionNumber}>{String(index+1).padStart(2,'0')}</span><h2>{sec.title}</h2><i className={ICONS[sec.type]||'ri-article-line'} aria-hidden="true"/></div>{sec.body&&<p className={s.bodyText}>{sec.body}</p>}
 {sec.type==='experience'&&<div className={s.timeline}>{sec.items.filter(i=>i.enabled).map(i=><article className={s.timelineItem} key={i.id}><div className={s.itemHeading}><h3>{i.title}</h3>{i.period&&<span className={s.period}>{i.period}</span>}</div>{i.subtitle&&<p className={s.itemSubtitle}>{i.subtitle}</p>}<ul className={s.bullets}>{i.detail.split(/\n|\\n/).filter(Boolean).map((b,j)=><li key={j}>{b}</li>)}</ul></article>)}</div>}
 {sec.type==='education'&&<div className={s.education}>{sec.items.filter(i=>i.enabled).map(i=><article key={i.id}><div className={s.eduIcon}><i className="ri-graduation-cap-line" aria-hidden="true"/></div><div><h3>{i.title}</h3><p className={s.itemSubtitle}>{i.subtitle}</p>{i.period&&<span className={s.period}>{i.period}</span>}{i.detail&&<p className={s.bodyText}>{i.detail}</p>}</div></article>)}</div>}
 {sec.type==='skills'&&<><div className={s.skillsGrid}>{sec.items.filter(i=>i.enabled).map(i=><div key={i.id}><div className={s.skillLabel}><span>{i.title}</span><span>{i.score}%</span></div><div className={s.skillTrack} role="meter" aria-label={i.title} aria-valuenow={i.score} aria-valuemin={0} aria-valuemax={100}><span style={{width:Math.max(0,Math.min(100,i.score||0))+'%'}}/></div></div>)}</div><div className={s.tagList}>{about.tags.filter(Boolean).map(t=><span key={t}>{t}</span>)}</div></>}
 </section>)}</div></div><Footer/></div></div>;
}
