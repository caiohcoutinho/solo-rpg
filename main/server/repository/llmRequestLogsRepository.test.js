import test from 'node:test';
import assert from 'node:assert/strict';
import sinon from 'sinon';
import { LlmRequestLogsRepository } from './llmRequestLogsRepository.js';

test('Should create a new instance of LlmRequestLogsRepository', async () => {
  const pool = {}; // Mock the pool object
  const llmRequestLogsRepository = new LlmRequestLogsRepository(pool);

  assert.ok(llmRequestLogsRepository);
});

test('Should insert a new log into the database', async () => {
  const pool = { query: sinon.stub().resolves({ rows: [{ id: 1 }] }) }; // Mock the pool object with a stubbed query method
  const llmRequestLogsRepository = new LlmRequestLogsRepository(pool);

  const log = {
    duration: 1000,
    agent: 'test-agent',
    max_tokens: 100,
    context_size: 50,
    model: 'test-model',
  };

  const result = await llmRequestLogsRepository.insert(log);

  assert.ok(result);
  assert.strictEqual(result, 1);
});

test('Should retrieve a log by ID from the database', async () => {
  const pool = { query: sinon.stub().resolves({ rows: [{ id: 1, duration: 1000, agent: 'test-agent', max_tokens: 100, context_size: 50, model: 'test-model' }] }) }; // Mock the pool object with a stubbed query method
  const llmRequestLogsRepository = new LlmRequestLogsRepository(pool);

  const logId = 1;

  const result = await llmRequestLogsRepository.findById(logId);

  assert.ok(result);
  assert.strictEqual(result.id, logId);
  assert.strictEqual(result.duration, 1000);
  assert.strictEqual(result.agent, 'test-agent');
  assert.strictEqual(result.max_tokens, 100);
  assert.strictEqual(result.context_size, 50);
  assert.strictEqual(result.model, 'test-model');
});

test('Should update a log in the database', async () => {
  const pool = { query: sinon.stub().resolves({ rowCount: 1, rows: [{ id: 1, duration: 1000, agent: 'test-agent', max_tokens: 100, context_size: 50, model: 'test-model' }] }) }; // Mock the pool object with a stubbed query method
  const llmRequestLogsRepository = new LlmRequestLogsRepository(pool);

  const logId = 1;
  const updatedLog = {
    duration: 2000,
    agent: 'test-agent-2',
    max_tokens: 200,
    context_size: 100,
    model: 'test-model-2',
  };

  const result = await llmRequestLogsRepository.update(logId, updatedLog);

  assert.ok(result);
});

test('Should delete a log from the database', async () => {
  const pool = { query: sinon.stub().resolves({ rowCount: 1 }) }; // Mock the pool object with a stubbed query method
  const llmRequestLogsRepository = new LlmRequestLogsRepository(pool);

  const logId = 1;

  const result = await llmRequestLogsRepository.delete(logId);

  assert.ok(result);
});