import test from 'node:test';
import assert from 'node:assert/strict';
import { LlamaWrapper } from './llamaWrapper.js';

test('LlamaWrapper should be defined', async () => {
  assert.notStrictEqual(LlamaWrapper, undefined, 'LlamaWrapper is not defined');
});

test('LlamaWrapper constructor should be defined', async () => {
  const llamaWrapper = new LlamaWrapper('test-model');
  assert.notStrictEqual(llamaWrapper, undefined, 'LlamaWrapper instance is not defined');
});

test('LlamaWrapper throw error if prompt is called without calling init', async () => {
    const llamaWrapper = new LlamaWrapper('test-model');
    await assert.rejects(
        async () => {
            await llamaWrapper.prompt({
                systemPrompt: "Test system prompt",
                chatHistory: [],
                outputJsonSchema: null,
                userText: "Test user text",
                temperature: 0.7,
                max_completion_tokens: 100
            });
        },
        {
            name: 'Error',
            message: 'Model is not loaded. Please call init() first.'
        }
    );
});