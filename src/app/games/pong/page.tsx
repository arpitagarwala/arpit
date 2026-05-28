import PongClient from './PongClient';

export const metadata = {
  title: 'Neon Pong | Arpit Agarwala',
  description: 'Play Neon Pong against a reactive AI paddle. Built by Arpit Agarwala.',
};

export default function PongPage() {
  return <PongClient />;
}
