import {test} from 'node:test';
import assert from 'node:assert/strict';
import {calculate, gameWinner} from '../src/lib/widget-tools.ts';

test('compact calculator preserves precedence, brackets and unary signs', () => {
  for (const [input, expected] of [
    ['2+3*4', 14],
    ['(125+75)/4', 50],
    ['-3*-2', 6],
    ['1--2', 3],
    ['.5+.25', 0.75],
    ['2*(3+4)', 14],
  ]) {
    assert.equal(calculate(input), expected);
  }
});
test('compact calculator rejects malformed or unsafe input', () => {
  for (const input of [
    '',
    '1/0',
    '1+',
    '1..2',
    '2(3)',
    'alert(1)',
    '1e3',
    '('.repeat(101),
  ]) {
    assert.throws(() => calculate(input));
  }
});
test('compact game distinguishes winning, unfinished and drawn boards', () => {
  assert.equal(gameWinner(['X', 'X', 'X', 'O', '', 'O', '', '', '']), 'X');
  assert.equal(
    gameWinner(['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X']),
    'draw',
  );
  assert.equal(gameWinner(Array(9).fill('')), '');
});
