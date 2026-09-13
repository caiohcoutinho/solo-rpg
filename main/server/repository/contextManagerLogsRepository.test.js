import test from 'node:test';
import assert from 'node:assert/strict';
import sinon from 'sinon';
import { ContextManagerLogsRepository } from './contextManagerLogsRepository.js';

test('Should create a new instance of ContextManagerLogsRepository', async () => {
  const pool = {}; // Mock the pool object
  const contextManagerLogsRepository = new ContextManagerLogsRepository(pool);

  assert.ok(contextManagerLogsRepository);
});

test('Should insert a new context manager log into the database', async () => {
  const pool = { query: sinon.stub().resolves({ rows: [{ id: 1 }] }) }; // Mock the pool object with a stubbed query method
  const contextManagerLogsRepository = new ContextManagerLogsRepository(pool);

  const contextManagerLog = {
    system_actual_size: 10,
    system_clipped_size: 5,
    lore_actual_size: 20,
    lore_clipped_size: 10,
    // ... other properties
  };

  const result = await contextManagerLogsRepository.insert(contextManagerLog);

  assert.ok(result);
  assert.strictEqual(result.id, 1); // Assuming the ID is auto-incremented
});

test('Should delete a context manager log from the database', async () => {
  const pool = { query: sinon.stub().resolves({ rowCount: 1 }) }; // Mock the pool object with a stubbed query method
  const contextManagerLogsRepository = new ContextManagerLogsRepository(pool);

  const contextManagerLogId = 1; // Assuming the ID of the log to be deleted

  const result = await contextManagerLogsRepository.delete(contextManagerLogId);

  assert.ok(result);
  assert.strictEqual(result, true);
});

test('Should retrieve all context manager logs from the database', async () => {
  const pool = { query: sinon.stub().resolves({ rows: [] }) }; // Mock the pool object with a stubbed query method
  const contextManagerLogsRepository = new ContextManagerLogsRepository(pool);

  const result = await contextManagerLogsRepository.findAll();

  assert.ok(result);
  assert.strictEqual(result.length, 0); // Assuming there are no logs in the database
});