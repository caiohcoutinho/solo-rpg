import test from 'node:test';
import assert from 'node:assert/strict';
import { GemmaEngine } from './gemmaEngine.js';
import sinon from 'sinon';

test('GemmaEngine should be defined', async () => {
  assert.ok(GemmaEngine, 'GemmaEngine is not defined');
});

test('GemmaEngine should have a logger property', async () => {
  const engine = new GemmaEngine(new LlamaWrapperMock());
  assert.ok(engine.logger, 'GemmaEngine does not have a logger property');
});

test('GemmaEngine should have a llamaWrapper property', async () => {
  const engine = new GemmaEngine(new LlamaWrapperMock());
  assert.ok(engine.llamaWrapper, 'GemmaEngine does not have a llamaWrapper property');
});

test('GemmaEngine should have an init method', async () => {
  const engine = new GemmaEngine(new LlamaWrapperMock());
  await engine.init();
});

test('GemmaEngine should have a prompt method', async () => {
  const engine = new GemmaEngine(new LlamaWrapperMock());
  const result = await engine.prompt({ max_completion_tokens: 5, temperature: 0.5, context: {}, userText: 'test' });
  assert.ok(result, 'GemmaEngine.prompt did not return a result');
});

test('GemmaEngine should use the correct system prompt', async () => {
  const engine = new GemmaEngine(new LlamaWrapperMock());
  const userText = 'test';
  const context = { system: ['system prompt'] };
  const result = await engine.prompt({ max_completion_tokens: 5, temperature: 0.5, context, userText });
  assert.strictEqual(result, 'system prompt\n'+userText, 'GemmaEngine.prompt did not use the correct system prompt');
});

test('GemmaEngine should handle errors from llamaWrapper.prompt', async () => {
  const engine = new GemmaEngine({
    init: sinon.stub().resolves(),
    prompt: sinon.stub().throws(new Error('Error calling llamaWrapper.prompt'))
  });
  const userText = 'test';
  const context = { system: ['system prompt'] };
  try {
    await engine.prompt({ max_completion_tokens: 5, temperature: 0.5, context, userText });
    assert.fail('GemmaEngine should have thrown an error');
  } catch (error) {
    assert.ok(error instanceof Error, 'GemmaEngine did not throw an error');
    assert.strictEqual(error.message, 'Error calling llamaWrapper.prompt', 'GemmaEngine did not throw the expected error');
  }
});

class LlamaWrapperMock {
  constructor() {
    this.init = sinon.stub().resolves();
    this.prompt = sinon.stub().resolves('system prompt\ntest');
  }
}