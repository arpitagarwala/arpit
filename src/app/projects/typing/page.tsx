import {pageMetadata} from '@/lib/page-metadata';
import TypingClient from './TypingClient';

export const metadata = pageMetadata("/projects/typing", {
  title: 'Typing Speed Test | Arpit Agarwala',
  description: 'Test your typing speed (WPM) and accuracy in a 30-second sprint.',
});

export default function TypingPage() {
  return <TypingClient />;
}

