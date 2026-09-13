import test from 'node:test';
import assert from 'node:assert/strict';
import { AzureWrapper } from './azureWrapper.js';

test('Should define AzureWrapper', async () => {
  assert.notStrictEqual(AzureWrapper, undefined);
});

test('Should define AzureWrapper.call', async () => {
  assert.notStrictEqual(AzureWrapper?.call, undefined);
});