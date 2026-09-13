import test from 'node:test';
import assert from 'node:assert/strict';
import { Phi4MiniEngine } from './Phi4MiniEngine.js';
import sinon from 'sinon';

test('Phi4MiniEngine should be defined', async () => {
  assert.ok(Phi4MiniEngine, 'Phi4MiniEngine is not defined');
});

test('Phi4MiniEngine should have a logger property', async () => {
  const engine = new Phi4MiniEngine(new LlamaWrapperMock());
  assert.ok(engine.logger, 'Phi4MiniEngine does not have a logger property');
});

test('Phi4MiniEngine should have a llamaWrapper property', async () => {
  const engine = new Phi4MiniEngine(new LlamaWrapperMock());
  assert.ok(engine.llamaWrapper, 'Phi4MiniEngine does not have a llamaWrapper property');
});

test('Phi4MiniEngine should have an init method', async () => {
  const engine = new Phi4MiniEngine(new LlamaWrapperMock());
  await engine.init();
});

test('Phi4MiniEngine should have a prompt method', async () => {
  const engine = new Phi4MiniEngine(new LlamaWrapperMock());
  const result = await engine.prompt({ max_completion_tokens: 5, temperature: 0.5, context: {}, userText: 'test' });
  assert.ok(result, 'Phi4MiniEngine.prompt did not return a result');
});

test('Phi4MiniEngine should use the correct system prompt', async () => {
  const engine = new Phi4MiniEngine(new LlamaWrapperMock());
  const userText = 'test';
  const context = { system: ['system prompt'] };
  const result = await engine.prompt({ max_completion_tokens: 5, temperature: 0.5, context, userText });
  assert.strictEqual(result, 'system prompt\n'+userText, 'Phi4MiniEngine.prompt did not use the correct system prompt');
});

test('Phi4MiniEngine should handle errors from llamaWrapper.prompt', async () => {
  const engine = new Phi4MiniEngine({
    init: sinon.stub().resolves(),
    prompt: sinon.stub().throws(new Error('Error calling llamaWrapper.prompt'))
  });
  const userText = 'test';
  const context = { system: ['system prompt'] };
  try {
    await engine.prompt({ max_completion_tokens: 5, temperature: 0.5, context, userText });
    assert.fail('Phi4MiniEngine should have thrown an error');
  } catch (error) {
    assert.ok(error instanceof Error, 'Phi4MiniEngine did not throw an error');
    assert.strictEqual(error.message, 'Error calling llamaWrapper.prompt', 'Phi4MiniEngine did not throw the expected error');
  }
});

class LlamaWrapperMock {
  constructor() {
    this.init = sinon.stub().resolves();
    this.prompt = sinon.stub().resolves('system prompt\ntest');
  }
}