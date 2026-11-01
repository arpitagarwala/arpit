import {pageMetadata} from '@/lib/page-metadata';
import GameProgressBridge from '@/components/training/GameProgressBridge';
import TicTacToeClient from './TicTacToeClient';

export const metadata = pageMetadata("/games/tictactoe", {
  title: 'Infinity Tic Tac Toe | Arpit Agarwala',
  description: 'Play Infinity Tic Tac Toe against a friend or AI. Keep three marks each; the oldest disappears on your next move. Rounds continue until a player wins.',
});

export default function TicTacToePage() {
  return <><TicTacToeClient/><GameProgressBridge slug="tictactoe"/></>;
}
