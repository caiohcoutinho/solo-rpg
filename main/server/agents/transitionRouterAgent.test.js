import test from 'node:test';
import assert from 'node:assert/strict';
import sinon from 'sinon';
import { TransitionRouterAgent } from './transitionRouterAgent.js';

test('Should create a new instance of TransitionRouterAgent', async () => {
  const agentHelperMock = { sendLlmRequest: sinon.stub() };
  const agent = new TransitionRouterAgent(agentHelperMock);

  assert.ok(agent);
  assert.strictEqual(agent.agentHelper, agentHelperMock);
});

test('Should call agentHelper.sendLlmRequest with correct options', async () => {
  const contextManagerMock = { buildContext: sinon.stub().returns('mocked context') };

  const agentHelperMock = { sendLlmRequest: sinon.stub() };
  const agent = new TransitionRouterAgent(agentHelperMock);
  
  const activeLore = 'active lore';
  const turns = { turns: 5 };
  const npcs = { npcs: ['npc1', 'npc2'] };
  const location = 'location';
  const userText = 'user text';
  const currentMode = 'current mode';

  const context = await agent.buildContext(contextManagerMock, { activeLore, turns, npcs, location, userText, currentMode });

  await agent.sendLlmRequest(context, userText);

  assert.strictEqual(agentHelperMock.sendLlmRequest.callCount, 1);
  assert.strictEqual(agentHelperMock.sendLlmRequest.args[0][2].context, context);
  assert.strictEqual(agentHelperMock.sendLlmRequest.args[0][2].outputJsonSchema, agent.getOutputJsonSchema());
});

