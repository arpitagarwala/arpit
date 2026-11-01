import {pageMetadata} from '@/lib/page-metadata';
import GameProgressBridge from '@/components/training/GameProgressBridge';
import MemoryClient from './MemoryClient';

export const metadata = pageMetadata("/games/memory", {
  title: 'Memory Game | Arpit Agarwala',
  description: 'A free card-matching memory game built by Arpit Agarwala. Flip cards, find pairs, and beat your best time.',
});

export default function MemoryPage() {
  return <><MemoryClient/><GameProgressBridge slug="memory"/></>;
}
