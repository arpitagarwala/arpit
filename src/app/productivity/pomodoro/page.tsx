import {pageMetadata} from '@/lib/page-metadata';
import PomodoroClient from './PomodoroClient';

export const metadata = pageMetadata("/productivity/pomodoro", {
  title: 'Focus Room · Pomodoro',
  description: 'Plan study tasks and build focus habits with a reliable Pomodoro timer, daily goals, restorative breaks, and saved progress.',
});

export default function PomodoroPage() {
  return <PomodoroClient />;
}


