export type Tool = {href: string; title: string; icon: string};
export const WIDGETS = [
  {id: 'clock', title: 'Clock', href: '/projects/clock', icon: 'ri-time-line'},
  {
    id: 'focus',
    title: 'Focus timer',
    href: '/productivity/pomodoro',
    icon: 'ri-timer-line',
  },
  {
    id: 'tasks',
    title: 'Today’s tasks',
    href: '/productivity/todo',
    icon: 'ri-checkbox-circle-line',
  },
  {
    id: 'calculator',
    title: 'Calculator',
    href: '/projects/calculator',
    icon: 'ri-calculator-line',
  },
  {
    id: 'game',
    title: 'Tic Tac Toe',
    href: '/games/tictactoe',
    icon: 'ri-gamepad-line',
  },
] as const;
export type WidgetId = (typeof WIDGETS)[number]['id'];
export const WORKSPACE_CHANGE = 'workspace-preferences-change';

export function calculate(expression: string): number {
  const tokens = expression
    .replace(/\s/g, '')
    .match(/(?:\d+(?:\.\d*)?|\.\d+)|[+\-*/()]/g);
  if (
    !tokens ||
    tokens.join('') !== expression.replace(/\s/g, '') ||
    tokens.length > 100
  ) {
    throw new Error('Enter a valid calculation.');
  }
  let position = 0;
  function factor(): number {
    const token = tokens![position++];
    if (token === '-') return -factor();
    if (token === '+') return factor();
    if (token === '(') {
      const value = sum();
      if (tokens![position++] !== ')') throw new Error('Close the bracket.');
      return value;
    }
    if (!token || !/^(?:\d|\.)/.test(token))
      throw new Error('Finish the calculation.');
    return Number(token);
  }
  function product(): number {
    let value = factor();
    while (tokens![position] === '*' || tokens![position] === '/') {
      const operator = tokens![position++];
      const next = factor();
      if (operator === '/' && next === 0)
        throw new Error('Cannot divide by zero.');
      value = operator === '*' ? value * next : value / next;
    }
    return value;
  }
  function sum(): number {
    let value = product();
    while (tokens![position] === '+' || tokens![position] === '-') {
      const operator = tokens![position++];
      const next = product();
      value = operator === '+' ? value + next : value - next;
    }
    return value;
  }
  const value = sum();
  if (position !== tokens.length || !Number.isFinite(value))
    throw new Error('Check the calculation.');
  return Number(value.toPrecision(12));
}

export function gameWinner(board: string[]): string {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const [a, b, c] of lines)
    if (board[a] && board[a] === board[b] && board[a] === board[c])
      return board[a];
  return board.every(Boolean) ? 'draw' : '';
}
