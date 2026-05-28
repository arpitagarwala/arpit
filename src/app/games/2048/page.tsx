import Game2048Client from './Game2048Client';

export const metadata = {
  title: '2048 | Arpit Agarwala',
  description: 'Play 2048 – Slide tiles to reach 2048. Built by Arpit Agarwala.',
};

export default function Game2048Page() {
  return <Game2048Client />;
}
