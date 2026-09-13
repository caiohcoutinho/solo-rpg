import test from 'node:test';
import assert from 'node:assert/strict';
import { addServerError, buildErrorEvent, clearServerErrors, getServerErrors } from './errorState.js';

test('buildErrorEvent includes recent errors in timestamp order', () => {
  clearServerErrors();

  addServerError(new Error('first failure'), { stage: 'chat' });
  addServerError('second failure', { stage: 'llm' });

  const errors = getServerErrors();
  assert.equal(errors.length, 2);
  assert.equal(errors[0].message, 'first failure');
  assert.equal(errors[1].message, 'second failure');

  const payload = buildErrorEvent({
    message: 'Oops, we screwed it!',
    context: { stage: 'chat' },
  });

  assert.equal(payload.type, 'server.errors');
  assert.equal(payload.message, 'Oops, we screwed it!');
  assert.equal(payload.errors.length, 2);
  assert.equal(payload.errors[0].message, 'first failure');
});

test('addServerError adds 101 errors to the serverErrors array', () => {
  clearServerErrors();

  for (let i = 0; i < 101; i++) {
    addServerError(new Error(`Error ${i}`));
  }

  const errors = getServerErrors();
  assert.equal(errors.length, 100);

  for (let i = 0; i < 100; i++) {
    assert.equal(errors[i].message, `Error ${i+1}`);
  }
});

test('normalizeError returns default error object for unknown type', () => {
  const unknownType = {};
  const result = addServerError(unknownType);
  assert.equal(result.message, 'Unknown error');
  assert.equal(result.name, 'Error');
});