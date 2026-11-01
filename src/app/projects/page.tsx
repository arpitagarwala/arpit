import {pageMetadata} from '@/lib/page-metadata';
import {getSite} from '@/lib/site-server';
import {configuredProjects} from '@/lib/site-config';
import type { Metadata } from 'next';
import BackButton from '@/components/BackButton/BackButton';
import styles from './page.module.css';
import Footer from '@/components/Footer/Footer';
import ProjectsClient from './ProjectsClient';

export const metadata: Metadata = pageMetadata("/projects", {
  title: 'Projects – Arpit Agarwala | Finance Tools, Web Apps & Interactive Experiments',
  description:
    'Explore Arpit Agarwala’s projects: financial calculators, capital-market tools, investment planning, loans, position risk, a trade journal, productivity apps and interactive experiments.',
  alternates: { canonical: 'https://arpitagarwala.com/projects' },
});

export default async function ProjectsPage() {
  const site=await getSite();
  return (
    <main className={styles.page}>
      <BackButton />
      <div className={styles.shell}>
        <ProjectsClient projects={configuredProjects(site)}/>
        <Footer />
      </div>
    </main>
  );
}

