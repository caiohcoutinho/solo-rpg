import test from 'node:test';
import assert from 'node:assert/strict';
import sinon from 'sinon';
import { EnemyRepository } from './enemyRepository.js';

test('EnemyRepository should be an instance of a class', async () => {
  const enemyRepository = new EnemyRepository();
  assert.ok(enemyRepository instanceof EnemyRepository);
});

test('EnemyRepository should have a constructor', async () => {
  const enemyRepository = new EnemyRepository();
  assert.ok(enemyRepository.constructor === EnemyRepository);
});

test('EnemyRepository should have a findAll method', async () => {
  const enemyRepository = new EnemyRepository();
  assert.ok(typeof enemyRepository.findAll === 'function');
});

test('EnemyRepository should return an array of enemies when findAll is called', async () => {
  const poolMock = {
    query: sinon.stub().resolves([{ id: 1, name: 'Enemy 1' }, { id: 2, name: 'Enemy 2' }])
  };
  const enemyRepository = new EnemyRepository(poolMock);
  const enemies = await enemyRepository.findAll();
  assert.ok(Array.isArray(enemies));
  assert.deepEqual(enemies, [{ id: 1, name: 'Enemy 1' }, { id: 2, name: 'Enemy 2' }]);
  assert.ok(poolMock.query.called);
});

test("FindByCampaignId should return properly", async () => {
  const poolMock = {
    query: sinon.stub().resolves({ rows: [{ id: 1, name: 'Enemy 1' }, { id: 2, name: 'Enemy 2' }] })
  };
  const enemyRepository = new EnemyRepository(poolMock);
  const enemies = await enemyRepository.findByCampaignId(1);
  assert.ok(Array.isArray(enemies));
  assert.deepEqual(enemies, [{ id: 1, name: 'Enemy 1' }, { id: 2, name: 'Enemy 2' }]);
  assert.ok(poolMock.query.called);
});