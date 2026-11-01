import {PUZZLES} from './puzzles.ts';
export interface Game {
  href: string;
  title: string;
  sub: string;
  icon: string;
  gradient: string;
  genre: string;
  featured: boolean;
  players: string;
  tags: string[];
}

export const GAMES: Game[] = [
  {
    "href": "/games/2048",
    "title": "2048",
    "sub": "Slide & merge number tiles",
    "icon": "ri-grid-fill",
    "gradient": "from-orange-400 to-amber-500",
    "genre": "Arithmetic",
    "featured": true,
    "players": "1",
    "tags": [
      "Brain",
      "Logic",
      "Undo",
      "Swipe"
    ]
  },
  {
    "href": "/games/memory",
    "title": "Memory Cards",
    "sub": "Match emoji pairs vs timer",
    "icon": "ri-stack-line",
    "gradient": "from-violet-500 to-purple-600",
    "genre": "Patterns",
    "featured": true,
    "players": "1",
    "tags": [
      "Solo",
      "Brain",
      "Combos"
    ]
  },
  {
    "href": "/games/sudoku",
    "title": "Sudoku",
    "sub": "Logic puzzles with hints",
    "icon": "ri-pencil-ruler-2-line",
    "gradient": "from-teal-400 to-emerald-500",
    "genre": "Deduction",
    "featured": true,
    "players": "1",
    "tags": [
      "Logic",
      "Notes Mode",
      "Timer"
    ]
  },
  {
    "href": "/games/tictactoe",
    "title": "Infinity Tic Tac Toe",
    "sub": "Three marks each. Play until someone wins.",
    "icon": "ri-layout-grid-line",
    "gradient": "from-cyan-500 to-blue-600",
    "genre": "Deduction",
    "featured": true,
    "players": "1-2",
    "tags": [
      "2 Player",
      "vs AI",
      "Strategy"
    ]
  }
];
GAMES.push(...PUZZLES.map(p=>({href:'/games/'+p.slug,title:p.title,sub:p.description,icon:p.icon,gradient:'from-cyan-500 to-blue-600',genre:p.skill,featured:['keen','bridges','pattern'].includes(p.slug),players:'1',tags:[p.skill,'Logic','Undo','Save progress']})));

GAMES.unshift({href:'/games/math-sprint',title:'Math Sprint',sub:'60 seconds. Four operations. Your next personal best.',icon:'ri-flashlight-line',gradient:'from-cyan-500 to-blue-600',genre:'Arithmetic',featured:true,players:'1',tags:['Timed','Daily challenge','Accuracy','Progress']});
