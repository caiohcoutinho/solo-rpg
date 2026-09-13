import test from 'node:test';
import assert from 'node:assert/strict';
import sinon from 'sinon';
import { ExplorationExpertAgent } from './explorationExpertAgent.js';

test('Should create a new instance of ExplorationExpertAgent', () => {
  const agentHelperMock = { sendLlmRequest: sinon.stub() };
  const agent = new ExplorationExpertAgent(agentHelperMock);

  assert.ok(agent);
  assert.strictEqual(agent.agentHelper, agentHelperMock);
});

test('Should call agentHelper.sendLlmRequest with correct options', async () => {
  const contextManagerMock = { buildContext: sinon.stub().returns('mocked context') };

  const agentHelperMock = { sendLlmRequest: sinon.stub() };
  const agent = new ExplorationExpertAgent(agentHelperMock);
  
  const activeLore = 'active lore';
  const turns = { turns: 5 };
  const npcs = { npcs: ['npc1', 'npc2'] };
  const location = 'location';
  const userText = 'user text';
  const currentMode = 'current mode';
  const tasks = [{ id: 'task1', description: 'task 1' }, { id: 'task2', description: 'task 2' }];

  const context = await agent.buildContext(contextManagerMock, { activeLore, turns, npcs, location, tasks, userText, currentMode });

  await agent.sendLlmRequest(context, userText);

  assert.strictEqual(agentHelperMock.sendLlmRequest.callCount, 1);
  assert.strictEqual(agentHelperMock.sendLlmRequest.args[0][2].context, context);
});

test('Should build context with correct properties', async () => {
  const contextManagerMock = { buildContext: sinon.stub().returns('mocked context') };

  const agent = new ExplorationExpertAgent({});

  const lore = ['lore'];
  const turns = ['turn'];
  const npcs = ['npc'];
  const location = 'location';
  const tasks = [{ id: 'task1', description: 'task 1' }, { id: 'task2', description: 'task 2' }];

  const result = await agent.buildContext(contextManagerMock, { tasks, lore, turns, npcs, location });

  assert.strictEqual(result, 'mocked context');
  assert.strictEqual(contextManagerMock.buildContext.callCount, 1);
  assert.deepEqual(contextManagerMock.buildContext.firstCall.args[0], {
    system: [await agent.getInstructions()],
    tasks: agent.createTaskMessages(tasks),
    misc: lore,
    location: location,
    npcs: npcs,
    turns: turns
  });
});

test('Should create task messages with correct content', () => {
  const agent = new ExplorationExpertAgent({});

  const tasks = [
    { id: 'task1', description: 'task 1' },
    { id: 'task2', description: 'task 2' }
  ];

  const result = agent.createTaskMessages(tasks);

  assert.deepEqual(result[0], 
    {
      role: 'system',
      content: `TaskId: task1 . Task Description: task 1`
    },  
  );
  assert.deepEqual(result[1],
    {
      role: 'system',
      content: `TaskId: task2 . Task Description: task 2`
    },
  );
});