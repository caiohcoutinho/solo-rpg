import test from 'node:test';
import assert from 'node:assert/strict';
import sinon from 'sinon';
import { LoreRepository } from './loreRepository.js';

test('Should insert a new lore into the database', async () => {
  const pool = { query: sinon.stub().resolves({ rows: [{ id: 1 }], rowCount: 1 }) };
  const loreRepository = new LoreRepository(pool);

  const lore = {
    name: 'Test Lore',
    description: 'This is a test lore',
  };

  const result = await loreRepository.insert(lore);

  assert.ok(result);
  assert.strictEqual(result.id, 1);
});

test('Should throw and error if insert is not possible', async () => {
  const poolMock = {
    query: sinon.stub().throws(new Error('Database error'))
  };
  const loreRepository = new LoreRepository(poolMock);

  const lore = {
    name: 'Test Lore',
    description: 'This is a test lore',
  };

  try {
    await loreRepository.insert(lore);
    assert.fail('Expected an error to be thrown');
  } catch (error) {
    assert.strictEqual(error.message, 'Database error');
  }
});

test('Should update an existing lore in the database', async () => {
  const pool = { query: sinon.stub().resolves({ rows: [{ id: 1 }], rowCount: 1 }) };
  const loreRepository = new LoreRepository(pool);

  const lore = {
    id: 1,
    name: 'Updated Lore',
    description: 'This is an updated lore',
  };

  const result = await loreRepository.update(1, lore);

  assert.ok(result);
  assert.strictEqual(result.id, 1);
});

test('Should throw an error if the update is not possible', async () => {
  const poolMock = {
    query: sinon.stub().throws(new Error('Database error'))
  };
  const loreRepository = new LoreRepository(poolMock);

  const lore = {
    id: 1,
    name: 'Updated Lore',
    description: 'This is an updated lore',
  };

  try {
    await loreRepository.update(1, lore);
    assert.fail('Expected an error to be thrown');
  } catch (error) {
    assert.strictEqual(error.message, 'Database error');
  }
});

test('Should delete a lore from the database', async () => {
  const pool = { query: sinon.stub().resolves({ rows: [{ id: 1 }], rowCount: 1 }) };
  const loreRepository = new LoreRepository(pool);

  const loreId = 1;

  const result = await loreRepository.delete(loreId);

  assert.ok(result);
  assert.strictEqual(result, true);
});

test('Should find a lore by ID', async () => {
  const pool = {
    query: sinon.stub().resolves({
      rows: [{ id: 1, name: 'Test Lore', description: 'This is a test lore' }]
    })
  };
  const loreRepository = new LoreRepository(pool);

  const loreId = 1;

  const lore = await loreRepository.findById(loreId);

  assert.ok(lore);
  assert.strictEqual(lore.id, loreId);
  assert.strictEqual(lore.name, 'Test Lore');
  assert.strictEqual(lore.description, 'This is a test lore');
});

test('LoreRepository should throw an error if the pool is not provided', async () => {
  try {
    const loreRepository = new LoreRepository();
    assert.fail('Expected an error to be thrown');
  } catch (error) {
    assert.strictEqual(error.message, 'Pool not provided');
  }
});

test('LoreRepository should throw an error if the pool.query method throws an error', async () => {
  const poolMock = {
    query: sinon.stub().throws(new Error('Database error'))
  };
  const loreRepository = new LoreRepository(poolMock);

  try {
    await loreRepository.findAll();
    assert.fail('Expected an error to be thrown');
  } catch (error) {
    assert.strictEqual(error.message, 'Database error');
  }
});

test('LoreRepository should return an empty array if no lores are found in findAll', async () => {
  const poolMock = {
    query: sinon.stub().resolves({ rows: [] })
  };
  const loreRepository = new LoreRepository(poolMock);
  const lores = await loreRepository.findAll();
  assert.ok(Array.isArray(lores));
  assert.deepEqual(lores, []);
});

test('LoreRepository should return an array of active lores when findActive is called', async () => {
  const poolMock = {
    query: sinon.stub().resolves({
      rows: [{ id: 1, name: 'Active Lore', description: 'This is an active lore' }]
    })
  };
  const loreRepository = new LoreRepository(poolMock);

  const lores = await loreRepository.findActive();

  assert.ok(Array.isArray(lores));
  assert.deepEqual(lores, [{ id: 1, name: 'Active Lore', description: 'This is an active lore' }]);
});

test('LoreRepository should throw an error if the pool.query method throws an error when findActive is called', async () => {
  const poolMock = {
    query: sinon.stub().throws(new Error('Database error'))
  };
  const loreRepository = new LoreRepository(poolMock);

  try {
    await loreRepository.findActive();
    assert.fail('Expected an error to be thrown');
  } catch (error) {
    assert.strictEqual(error.message, 'Database error');
  }
});

test('LoreRepository should throw an error if the pool.query method throws an error when findById is called', async () => {
  const poolMock = {
    query: sinon.stub().throws(new Error('Database error'))
  };
  const loreRepository = new LoreRepository(poolMock);

  try {
    await loreRepository.findById(1);
    assert.fail('Expected an error to be thrown');
  } catch (error) {
    assert.strictEqual(error.message, 'Database error');
  }
});


test('LoreRepository should throw an error if the pool.query method throws an error when delete is called', async () => {
  const poolMock = {
    query: sinon.stub().throws(new Error('Database error'))
  };
  const loreRepository = new LoreRepository(poolMock);

  try {
    await loreRepository.delete(1);
    assert.fail('Expected an error to be thrown');
  } catch (error) {
    assert.strictEqual(error.message, 'Database error');
  }
});

test("FindByCampaignId should return properly", async () => {
  const poolMock = {
    query: sinon.stub().resolves({
      rows: [
        { id: 1, name: 'Lore 1', description: 'Description 1', active: true },
        { id: 2, name: 'Lore 2', description: 'Description 2', active: false }
      ]
    })
  };
  const loreRepository = new LoreRepository(poolMock);

  const campaignId = 123;
  const lores = await loreRepository.findByCampaignId(campaignId);

  assert.ok(Array.isArray(lores));
  assert.strictEqual(lores.length, 2);
  assert.deepEqual(lores[0], { id: 1, name: 'Lore 1', description: 'Description 1', active: true });
  assert.deepEqual(lores[1], { id: 2, name: 'Lore 2', description: 'Description 2', active: false });
});