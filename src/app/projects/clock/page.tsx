import {pageMetadata} from '@/lib/page-metadata';
import ClockClient from './ClockClient';

export const metadata = pageMetadata("/projects/clock", {
  title: 'Live Clock | Arpit Agarwala',
  description: 'A calm digital and analog clock with selectable timezones, six world clocks, a quiet view, and saved display preferences.',
});

export default function ClockPage() {
  return <ClockClient />;
}


