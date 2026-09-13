import test from 'node:test';
import assert from 'node:assert/strict';
import sinon from 'sinon';
import { SceneRepository } from './sceneRepository.js';

test('SceneRepository should throw an error if the pool.query method throws an error when create is called', async () => {
  const poolMockWithError = {
    query: sinon.stub().throws(new Error('Database error'))
  };
  const sceneRepository = new SceneRepository(poolMockWithError);
  try {
    await sceneRepository.insert({});
    assert.fail('Expected an error to be thrown');
  } catch (error) {
    assert.strictEqual(error.message, 'Database error');
  }
});

test('SceneRepository should throw an error if the pool.query method throws an error when update is called', async () => {
  const poolMockWithError = {
    query: sinon.stub().throws(new Error('Database error'))
  };
  const sceneRepository = new SceneRepository(poolMockWithError);
  try {
    await sceneRepository.update(1, { name: 'Updated Scene', description: 'Updated Description' });
    assert.fail('Expected an error to be thrown');
  } catch (error) {
    assert.strictEqual(error.message, 'Database error');
  }
});

test('SceneRepository should return the created scene when create is called', async () => {
  const poolMock = {
    query: sinon.stub().returns({ rows: [{ id: 1 }] })
  };
  const sceneRepository = new SceneRepository(poolMock);
  const scene = await sceneRepository.insert({});
  assert.strictEqual(scene.id, 1);
});

test('SceneRepository should return the updated scene when update is called', async () => {
  const poolMock = {
    query: sinon.stub().returns({ rowCount: 1 })
  };
  const sceneRepository = new SceneRepository(poolMock);
  const scene = await sceneRepository.update(1, { name: 'Updated Scene', description: 'Updated Description'   });
  assert.strictEqual(scene, true);
});

test('SceneRepository should return the number of affected rows when delete is called', async () => {
  const poolMock = {
    query: sinon.stub().returns({ rowCount: 1 })
  };
  const sceneRepository = new SceneRepository(poolMock);
  const result = await sceneRepository.delete('123');
  assert.strictEqual(result, 1);
});

test("FindById should return the scene when the pool.query method returns a result", async () => {
  const poolMock = {
    query: sinon.stub().returns({ rows: [{ id: '123', name: 'Test Scene' }] })
  };
  const sceneRepository = new SceneRepository(poolMock);
  const scene = await sceneRepository.findById('123');
  assert.strictEqual(scene.id, '123');
  assert.strictEqual(scene.name, 'Test Scene');
});

test("FindAll should return all scenes when the pool.query method returns results", async () => {
  const poolMock = {
    query: sinon.stub().returns({ rows: [{ id: '123', name: 'Test Scene' }, { id: '456', name: 'Another Scene' }] })
  };
  const sceneRepository = new SceneRepository(poolMock);
  const scenes = await sceneRepository.findAll();
  assert.strictEqual(scenes.length, 2);
  assert.strictEqual(scenes[0].id, '123');
  assert.strictEqual(scenes[1].id, '456');
});

test("FindByCampaignId should return properly", async () => {
  const poolMock = {
    query: sinon.stub().returns({ rows: [{ id: '123', name: 'Test Scene' }, { id: '456', name: 'Another Scene' }] })
  };
  const sceneRepository = new SceneRepository(poolMock);
  const scenes = await sceneRepository.findByCampaignId();
  assert.strictEqual(scenes.length, 2);
  assert.strictEqual(scenes[0].id, '123');
  assert.strictEqual(scenes[1].id, '456');
})