import {pageMetadata} from '@/lib/page-metadata';
import AsmrClient from './AsmrClient';

export const metadata = pageMetadata("/productivity/rain", {
  title: 'Quiet Space',
  description: 'Layer rain, forest, wind, water, café ambience and brown noise into your own focused workspace.',
});

export default function AsmrPage() {
  return <AsmrClient />;
}
