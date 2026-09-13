import test from 'node:test';
import assert from 'node:assert/strict';
import { DiceRoller } from './diceRoller.js';

test('Simple dice roller test', async () => {
  const diceRoller = new DiceRoller();
  const result = diceRoller.roll(6);

  assert.strictEqual(result.dice, 6);
  assert.strictEqual(result.difficulty, 6);
  assert.notStrictEqual(result.rolls, undefined)
  assert.notStrictEqual(result.successes, undefined)
  assert.notStrictEqual(result.failures, undefined)
  assert.notStrictEqual(result.ones, undefined)
});
