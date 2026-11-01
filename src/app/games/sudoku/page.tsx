import {pageMetadata} from '@/lib/page-metadata';
import GameProgressBridge from '@/components/training/GameProgressBridge';
import SudokuClient from './SudokuClient';

export const metadata = pageMetadata("/games/sudoku", {
  title: 'Sudoku | Arpit Agarwala',
  description: 'Play Sudoku – Fill the grid with 1–9. Built by Arpit Agarwala.',
});

export default function SudokuPage() {
  return <><SudokuClient/><GameProgressBridge slug="sudoku"/></>;
}
