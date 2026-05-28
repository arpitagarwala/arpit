import React from 'react';
import type { Metadata } from 'next';
import BackButton from '@/components/BackButton/BackButton';
import BgBlobs from '@/components/BgBlobs/BgBlobs';
import Footer from '@/components/Footer/Footer';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'About – Arpit Agarwala | UI/UX Designer & Front-End Developer',
  description:
    'Learn about Arpit Agarwala — BCom student, CA aspirant, UI/UX designer and front-end developer from Kolkata, India.',
  alternates: { canonical: 'https://arpitagarwala.online/about' },
};

const SKILLS = [
  { label: 'Financial Analysis', pct: 90 },
  { label: 'Excel & Automation', pct: 88 },
  { label: 'Web Design (Figma / HTML / CSS)', pct: 82 },
  { label: 'Operations Management', pct: 80 },
  { label: 'Stock Market (SMC / ICT)', pct: 75 },
  { label: 'Communication & Leadership', pct: 85 },
];

const TAGS = [
  { label: 'Accountancy', color: '#0891b2', bg: 'rgba(8,145,178,0.06)', border: 'rgba(8,145,178,0.18)' },
  { label: 'Front-End Dev', color: '#8b5cf6', bg: 'rgba(139,92,246,0.06)', border: 'rgba(139,92,246,0.18)' },
  { label: 'Market Analysis', color: '#d97706', bg: 'rgba(217,119,6,0.06)', border: 'rgba(217,119,6,0.18)' },
  { label: 'Automation', color: '#059669', bg: 'rgba(5,150,105,0.06)', border: 'rgba(5,150,105,0.18)' },
  { label: 'Photo & Video Editing', color: '#db2777', bg: 'rgba(219,39,119,0.06)', border: 'rgba(219,39,119,0.18)' },
  { label: 'Business Development', color: '#ea580c', bg: 'rgba(234,88,12,0.06)', border: 'rgba(234,88,12,0.18)' },
  { label: 'Leadership', color: '#94a3b8', bg: 'rgba(148,163,184,0.06)', border: 'rgba(148,163,184,0.18)' },
  { label: 'Workshop Facilitation', color: '#14b8a6', bg: 'rgba(20,184,166,0.06)', border: 'rgba(20,184,166,0.18)' },
];

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <BgBlobs color1="rgba(99,102,241,0.1)" color2="rgba(34,211,238,0.1)" />
      <BackButton />

      <div className={styles.container}>
        {/* Header */}
        <div className={`${styles.header} fade-up`}>
          <div>
            <h1 className={styles.title}>Profile</h1>
            <div className={`${styles.underline} shimmer-underline`} />
          </div>
          <p className={styles.subtitle}>The story, the mission, and the technical journey of Arpit Agarwala.</p>
        </div>

        <div className={styles.grid}>
          {/* Left Column */}
          <div className={styles.leftCol}>
            {/* Profile card */}
            <div className={`card ${styles.profileCard}`}>
              <div className={styles.profileBlob} />
              <img src="/assets/images/my-miniature.png" alt="Arpit Agarwala" className={styles.profileImg} />
              <h2 className={styles.profileName}>Arpit Agarwala</h2>
              <p className={styles.profileRole}>BCom (Hons) · CA Intermediate</p>
              <div className={styles.profileBadges}>
                <span className={styles.badgeLoc}><i className="ri-map-pin-line" /> Kolkata, India</span>
                <span className={styles.badgeAvail}><span className={`${styles.dot} animate-pulse`} />Available</span>
              </div>
              <p className={styles.profileBio}>Born in Rajasthan, raised in Assam, building in Kolkata. Bridging finance, technology and leadership.</p>
            </div>

            {/* Stats card */}
            <div className={`card ${styles.statsCard}`}>
              <p className={styles.sectionLabel}>At a Glance</p>
              <div className={styles.statsGrid}>
                {[['2+','Internships'],['40+','Students Mentored'],['₹10k+','Revenue Generated'],['CA','Foundation Cleared']].map(([val,lbl]) => (
                  <div key={lbl} className="stat">
                    <p style={{fontSize:'1.25rem',fontWeight:900,color:'#22d3ee'}}>{val}</p>
                    <p style={{fontSize:'0.625rem',color:'#64748b',marginTop:'0.125rem',fontWeight:500}}>{lbl}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Connect card */}
            <div className={`card ${styles.connectCard}`}>
              <p className={styles.sectionLabel}>Connect</p>
              <div className={styles.connectList}>
                {[
                  {href:'mailto:arpitagarwalms@gmail.com?subject=Hello%20Arpit!',icon:'ri-mail-send-line',color:'#22d3ee',label:'arpitagarwalms@gmail.com'},
                  {href:'https://wa.me/919957414146',icon:'ri-whatsapp-line',color:'#34d399',label:'WhatsApp',ext:true},
                  {href:'https://www.linkedin.com/in/arpitagarwala/',icon:'ri-linkedin-line',color:'#60a5fa',label:'linkedin.com/in/arpitagarwala',ext:true},
                  {href:'https://github.com/arpitagarwala',icon:'ri-github-line',color:'#cbd5e1',label:'github.com/arpitagarwala',ext:true},
                  {href:'https://www.instagram.com/arpit.agarwala_/',icon:'ri-instagram-line',color:'#f472b6',label:'arpit.agarwala_',ext:true},
                ].map((c) => (
                  <a key={c.href} href={c.href} target={c.ext?'_blank':undefined} rel={c.ext?'noopener':undefined} className="connect-row">
                    <i className={`${c.icon}`} style={{color:c.color,fontSize:'1rem'}} />
                    <span style={{fontSize:'0.75rem',fontWeight:500,color:'#94a3b8',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className={styles.rightCol}>
            {/* Who I Am */}
            <div className={`card ${styles.contentCard}`}>
              <p className={styles.sectionLabel}>Who I Am</p>
              <p className={styles.bodyText} style={{marginBottom:'0.75rem'}}>
                I&apos;m a <strong style={{color:'#fff'}}>BCom (Hons) student at Bhawanipur Education Society College</strong> and a{' '}
                <strong style={{color:'#fff'}}>CA Intermediate candidate</strong> — on a focused mission to become a Chartered Accountant while building real-world tools at the intersection of finance and technology.
              </p>
              <p className={styles.bodyText} style={{marginBottom:'0.75rem',color:'#94a3b8'}}>
                Having cleared the <strong style={{color:'#22d3ee'}}>CA Foundation exam (Dec 2023)</strong>, I&apos;m now deep in CA Intermediate preparation — running a structured high-intensity revision system built around Pareto analysis, speed learning, and zero-distraction focus blocks.
              </p>
              <p className={styles.bodyText} style={{color:'#94a3b8'}}>
                Outside the books, I build web tools, analyse markets using SMC/ICT methodology, automate workflows in Excel, and train 6 days a week. My edge is the ability to bridge analytical rigour with practical execution.
              </p>
            </div>

            {/* Experience */}
            <div className={`card ${styles.contentCard}`}>
              <p className={styles.sectionLabel}>Experience</p>
              <div className={styles.timeline}>
                <div className="tl-line" />
                {[
                  {
                    title:'Operations Management Intern',date:'May – Jul 2024',
                    org:'House of AC · Kolkata',orgColor:'#22d3ee',dotClass:'',
                    bullets:[
                      'Built automated invoicing system bridging HR and IT workflows, saving significant manual time',
                      'Designed master product sheet with auto-generated unique IDs and duplicate prevention logic',
                      'Integrated inventory system with purchase/sales automation and low-stock alert triggers',
                    ],
                  },
                  {
                    title:'Business Development & Research Intern',date:'May – Sep 2023',
                    org:'Younity.in · Remote',orgColor:'#0891b2',dotClass:'',
                    bullets:[
                      'Created marketing strategies and led promotions for a 50,000+ learner online platform',
                      'Generated ₹10k+ revenue in Month 1 — surpassing 80% of all teammates',
                      'Tenure extended an additional 3 months for exceptional contribution',
                    ],
                  },
                  {
                    title:'Head Boy & IT Club Founder',date:'Apr 2022 – Apr 2023',
                    org:'LK Singhania Education Centre · Rajasthan',orgColor:'#d97706',dotClass:'tl-dot-amber',
                    bullets:[
                      'Founded school IT Club — designed and ran workshops for 40+ students',
                      'Covered Photoshop, Premiere Pro, Figma, Photography, Arduino, and Coding',
                      'Led coordination for national and international online conferences',
                    ],
                  },
                ].map((exp, i) => (
                  <div key={i} className={styles.tlItem}>
                    <div className={styles.tlDotWrap}><div className={`tl-dot ${exp.dotClass}`} /></div>
                    <div className={styles.tlBody}>
                      <div className={styles.tlMeta}>
                        <p className={styles.tlTitle}>{exp.title}</p>
                        <span className={styles.tlDate}>{exp.date}</span>
                      </div>
                      <p style={{fontSize:'0.75rem',fontWeight:600,color:exp.orgColor,marginBottom:'0.5rem'}}>{exp.org}</p>
                      <ul className={styles.tlBullets}>
                        {exp.bullets.map((b,j)=>(
                          <li key={j} className={styles.tlBullet}><span style={{color:'rgba(34,211,238,0.5)',flexShrink:0,marginTop:'0.125rem'}}>▸</span>{b}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className={`card ${styles.contentCard}`}>
              <p className={styles.sectionLabel}>Education</p>
              <div className={styles.eduList}>
                {[
                  {icon:'ri-building-line',iconColor:'#0891b2',iconBg:'rgba(8,145,178,0.1)',title:'Chartered Accountant — CA Intermediate',org:'ICAI · 2023 – 2028',orgColor:'#0891b2',note:'Foundation cleared Dec 2023 · Currently preparing for Intermediate'},
                  {icon:'ri-graduation-cap-line',iconColor:'#8b5cf6',iconBg:'rgba(139,92,246,0.1)',title:'BCom (Hons)',org:'Bhawanipur Education Society College · 2023 – 2027',orgColor:'#8b5cf6',note:'Commerce · Kolkata, West Bengal'},
                  {icon:'ri-book-open-line',iconColor:'#d97706',iconBg:'rgba(217,119,6,0.1)',title:'Class XII — Commerce',org:'LK Singhania Education Centre · 2018 – 2023',orgColor:'#d97706',note:'Rajasthan'},
                ].map((e,i,arr)=>(
                  <React.Fragment key={i}>
                    <div className={styles.eduRow}>
                      <div style={{width:'2.25rem',height:'2.25rem',borderRadius:'0.5rem',background:e.iconBg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        <i className={e.icon} style={{color:e.iconColor}} />
                      </div>
                      <div>
                        <p style={{fontSize:'0.875rem',fontWeight:700,color:'#fff'}}>{e.title}</p>
                        <p style={{fontSize:'0.75rem',fontWeight:600,color:e.orgColor}}>{e.org}</p>
                        <p style={{fontSize:'0.75rem',color:'#64748b',marginTop:'0.125rem'}}>{e.note}</p>
                      </div>
                    </div>
                    {i < arr.length-1 && <div style={{height:'1px',background:'rgba(51,65,85,0.4)',marginLeft:'3rem'}} />}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className={`card ${styles.contentCard}`}>
              <p className={styles.sectionLabel}>Skills & Expertise</p>
              <div className={styles.skillsGrid}>
                {SKILLS.map((s)=>(
                  <div key={s.label}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.375rem'}}>
                      <span style={{fontSize:'0.75rem',fontWeight:600,color:'#cbd5e1'}}>{s.label}</span>
                      <span style={{fontSize:'0.625rem',color:'#64748b'}}>{s.pct}%</span>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{width:`${s.pct}%`}} />
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.tagList}>
                {TAGS.map((t)=>(
                  <span key={t.label} style={{fontSize:'0.625rem',fontWeight:600,padding:'0.25rem 0.625rem',borderRadius:'9999px',border:`1px solid ${t.border}`,color:t.color,background:t.bg}}>{t.label}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
