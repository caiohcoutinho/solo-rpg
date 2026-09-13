import test from 'node:test';
import assert from 'node:assert/strict';
import { CharacterSheetRepository } from './characterSheetRepository.js';

test('Should pass when character sheet is inserted', async () => {
  const poolMock = {
    query: async (query, values) => {
      if (query.includes('INSERT INTO character_sheet')) {
        return { rows: [{ id: 1 }] };
      }
      return { rows: [] };
    },
  };
  const repo = new CharacterSheetRepository(poolMock);
  const result = await repo.insert('Test Character');
  assert.equal(result, 1);
});

test('Should pass when character sheet is found by id', async () => {
  const poolMock = {
    query: async (query, values) => {
      if (query.includes('SELECT * FROM character_sheet WHERE id = $1')) {
        return { rows: [{ id: 1, name: 'Test Character' }] };
      }
      return { rows: [] };
    },
  };
  const repo = new CharacterSheetRepository(poolMock);
  const result = await repo.findById(1);
  assert.deepEqual(result, { id: 1, name: 'Test Character' });
});

test('Should pass when character sheet is updated', async () => {
  const poolMock = {
    query: async (query, values) => {
      if (query.includes('UPDATE character_sheet SET')) {
        return { rows: [{ id: 1, name: 'Updated Character' }] };
      }
      return { rows: [] };
    },
  };
  const repo = new CharacterSheetRepository(poolMock);
  const result = await repo.update(1, { name: 'Updated Character' });
  assert.deepEqual(result, { id: 1, name: 'Updated Character' });
});

test('Should pass when character sheet is not found by id', async () => {
  const poolMock = {
    query: async (query, values) => {
      if (query.includes('SELECT * FROM character_sheet WHERE id = $1')) {
        return { rows: [] };
      }
      return { rows: [] };
    },
  };
  const repo = new CharacterSheetRepository(poolMock);
  const result = await repo.findById(1);
  assert.strictEqual(result, null);
});

test('Should pass when character sheet is deleted', async () => {
  const poolMock = {
    query: async (query, values) => {
      if (query.includes('DELETE FROM character_sheet WHERE id = $1')) {
        return { rows: [{ id: 1 }] };
      }
      return { rows: [] };
    },
  };
  const repo = new CharacterSheetRepository(poolMock);
  const result = await repo.delete(1);
  assert.deepEqual(result, { id: 1 });
});

test('Should throw an error when inserting character sheet fails', async () => {
  const poolMock = {
    query: async (query, values) => {
      if (query.includes('INSERT INTO character_sheet')) {
        throw new Error('Something went wrong');
      }
      return { rows: [] };
    },
  };
  const repo = new CharacterSheetRepository(poolMock);
  try {
    await repo.insert('Test Character');
    assert.fail('Expected an error to be thrown');
  } catch (error) {
    assert.equal(error.message, 'Something went wrong');
  }
});

test('Should throw an error when updating character sheet fails', async () => {
  const poolMock = {
    query: async (query, values) => {
      if (query.includes('UPDATE character_sheet SET')) {
        throw new Error('Something went wrong');
      }
      return { rows: [] };
    },
  };
  const repo = new CharacterSheetRepository(poolMock);
  try {
    await repo.update(1, { name: 'Updated Character' });
    assert.fail('Expected an error to be thrown');
  } catch (error) {
    assert.equal(error.message, 'Something went wrong');
  }
});

test('Should throw an error when finding character sheet by id fails', async () => {
  const poolMock = {
    query: async (query, values) => {
      if (query.includes('SELECT * FROM character_sheet WHERE id = $1')) {
        throw new Error('Something went wrong');
      }
      return { rows: [] };
    },
  };
  const repo = new CharacterSheetRepository(poolMock);
  try {
    await repo.findById(1);
    assert.fail('Expected an error to be thrown');
  } catch (error) {
    assert.equal(error.message, 'Something went wrong');
  }
});

test('Should throw an error when deleting character sheet fails', async () => {
  const poolMock = {
    query: async (query, values) => {
      if (query.includes('DELETE FROM character_sheet WHERE id = $1')) {
        throw new Error('Something went wrong');
      }
      return { rows: [] };
    },
  };
  const repo = new CharacterSheetRepository(poolMock);
  try {
    await repo.delete(1);
    assert.fail('Expected an error to be thrown');
  } catch (error) {
    assert.equal(error.message, 'Something went wrong');
  }
});