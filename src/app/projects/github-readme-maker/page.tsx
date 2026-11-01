import {pageMetadata} from '@/lib/page-metadata';
import ReadmeClient from './ReadmeClient';
export const metadata = pageMetadata("/projects/github-readme-maker", {
  title: 'README Studio | Arpit Agarwala',
  description: 'Build GitHub profile and project READMEs with templates, public GitHub import, safe previews, reusable drafts, and Markdown downloads.',
});
export default function ReadmePage() { return <ReadmeClient />; }

