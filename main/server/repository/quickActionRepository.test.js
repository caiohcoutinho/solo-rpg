import test from 'node:test';
import assert from 'node:assert/strict';
import sinon from 'sinon';
import { QuickActionRepository } from './quickActionRepository.js';

test('QuickActionRepository should throw an error if the pool.query method throws an error when create is called', async () => {
  const poolMock = {
    query: sinon.stub().throws(new Error('Database error'))
  };
  const quickActionRepository = new QuickActionRepository(poolMock);
  try {
    await quickActionRepository.insert({});
    assert.fail('Expected an error to be thrown');
  } catch (error) {
    assert.strictEqual(error.message, 'Database error');
  }
});

test('QuickActionRepository should throw an error if the pool.query method throws an error when update is called', async () => {
  const poolMock = {
    query: sinon.stub().throws(new Error('Database error'))
  };
  const quickActionRepository = new QuickActionRepository(poolMock);
  try {
    await quickActionRepository.update({ id: 1 }, {});
    assert.fail('Expected an error to be thrown');
  } catch (error) {
    assert.strictEqual(error.message, 'Database error');
  }
});

test('QuickActionRepository should throw an error if the pool.query method throws an error when delete is called', async () => {
  const poolMock = {
    query: sinon.stub().throws(new Error('Database error'))
  };
  const quickActionRepository = new QuickActionRepository(poolMock);
  try {
    await quickActionRepository.delete({ id: 1 });
    assert.fail('Expected an error to be thrown');
  } catch (error) {
    assert.strictEqual(error.message, 'Database error');
  }
});

test('QuickActionRepository should return the created quick action when create is called', async () => {
  const poolMock = {
    query: sinon.stub().returns({ rows: [{ id: 1 }] })
  };
  const quickActionRepository = new QuickActionRepository(poolMock);
  const quickAction = await quickActionRepository.insert({});
  assert.strictEqual(quickAction.id, 1);
});

test('QuickActionRepository should return the updated quick action when update is called', async () => {
  const poolMock = {
    query: sinon.stub().returns({ rowCount: 1 })
  };
  const quickActionRepository = new QuickActionRepository(poolMock);
  const quickAction = await quickActionRepository.update(1);
  assert.strictEqual(quickAction, true);
});

test('QuickActionRepository should return the number of affected rows when delete is called', async () => {
  const poolMock = {
    query: sinon.stub().returns({ rowCount: 1 })
  };
  const quickActionRepository = new QuickActionRepository(poolMock);
  const result = await quickActionRepository.delete({ id: 1 });
  assert.strictEqual(result, true);
});

test("FindById should return the quick action when the pool.query method returns a result", async () => {
  const poolMock = {
    query: sinon.stub().returns({ rows: [{ id: 1, description: "Test action" }] })
  };
  const quickActionRepository = new QuickActionRepository(poolMock);
  const quickAction = await quickActionRepository.findById(1);
  assert.strictEqual(quickAction.id, 1);
  assert.strictEqual(quickAction.description, "Test action");
});

test("FindById should return undefined when the pool.query method returns no result", async () => {
  const poolMock = {
    query: sinon.stub().returns({ rows: [] })
  };
  const quickActionRepository = new QuickActionRepository(poolMock);
  const quickAction = await quickActionRepository.findById(1);
  assert.strictEqual(quickAction, null);
});

test("FindById should throw an error when the pool.query method throws an error", async () => {
  const poolMock = {
    query: sinon.stub().throws(new Error("Database error"))
  };
  const quickActionRepository = new QuickActionRepository(poolMock);
  try {
    await quickActionRepository.findById(1);
    assert.fail("Expected an error to be thrown");
  } catch (error) {
    assert.strictEqual(error.message, "Database error");
  }
});