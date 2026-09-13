import test from 'node:test';
import assert from 'node:assert/strict';
import { ContextManager } from './contextManager.js';

test('Should fail to add items if they exceed the threshold', async () => {
  const contextManagerLogsRepository = {}; // Mock the contextManagerLogsRepository
  const contextManager = new ContextManager(contextManagerLogsRepository);

  const items = ['item1', 'item2', 'item3']; // Mock the items
  const threshold = items[0].length + items[1].length; // Mock the threshold

  const result = contextManager.addItemsWithinThreshold(items, threshold, (item) => item, (item) => item);

  assert.strictEqual(result.result.length, 2);
});

test('Should add items if they do not exceed the threshold', async () => {
  const contextManagerLogsRepository = {}; // Mock the contextManagerLogsRepository
  const contextManager = new ContextManager(contextManagerLogsRepository);

  const items = ['item1', 'item2']; // Mock the items
  const threshold = 2; // Mock the threshold

  await contextManager.addItemsWithinThreshold(items, threshold, (item) => item, (item) => item);

  assert.notStrictEqual(contextManager.logger.error, 'Items exceed the threshold');
});

test('Should build context correctly', async () => {
  const contextManagerLogsRepository = {}; // Mock the contextManagerLogsRepository
  const contextManager = new ContextManager(contextManagerLogsRepository);

  const context = contextManager.buildContext({
    system: ['system1', 'system2'],
    location: { name: 'location1', background: 'background1' },
    npcs: [{ name: 'npc1', background: 'background1' }],
    turns: [{ isUserAction: false, result: 'turn1' }, { isUserAction: true, result: 'turn2' }],
    misc: [{ name: 'misc1', description: 'description1' }],
    tasks: ['task1', 'task2']
  });

  assert.strictEqual(context.system.length, 4);
  assert.strictEqual(context.misc.length, 1);
  assert.strictEqual(context.location.role, 'user');
  assert.strictEqual(context.location.content, 'Location name: location1, Background: background1');
  assert.strictEqual(context.npcs.length, 1);
  assert.strictEqual(context.npcs[0].role, 'user');
  assert.strictEqual(context.npcs[0].content, 'NPC name: npc1, Background: background1');
  assert.strictEqual(context.turns[0].role, "assistant");
  assert.strictEqual(context.turns[0].content, 'turn1');
  assert.strictEqual(context.turns[1].role, "user");
  assert.strictEqual(context.turns[1].content, 'turn2');
});

test('Should handle empty context correctly', async () => {
  const contextManagerLogsRepository = {}; // Mock the contextManagerLogsRepository
  const contextManager = new ContextManager(contextManagerLogsRepository);

  const context = contextManager.buildContext({
    system: [],
    location: {},
    npcs: [],
    turns: [],
    misc: [],
    tasks: []
  });

  assert.strictEqual(context.system.length, 0);
  assert.strictEqual(context.misc.length, 0);
  assert.strictEqual(context.location.role, "");
  assert.strictEqual(context.location.content, "");
  assert.strictEqual(context.npcs.length, 0);
  assert.strictEqual(context.turns.length, 0);
});