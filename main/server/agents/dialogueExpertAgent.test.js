import test from 'node:test';
import assert from 'node:assert/strict';
import sinon from 'sinon';
import { DialogueExpertAgent } from './dialogueExpertAgent.js';

test('DialogueExpertAgent constructor sets agentHelper and logger properties', () => {
  const agentHelper = {};
  const dialogueExpertAgent = new DialogueExpertAgent(agentHelper);
  assert.strictEqual(dialogueExpertAgent.agentHelper, agentHelper);
  assert.ok(dialogueExpertAgent.logger);
});

test('DialogueExpertAgent buildContext includes instructions, open tasks, lore, location, npcs and turns', async () => {
  const agentHelper = {};
  const dialogueExpertAgent = new DialogueExpertAgent(agentHelper);
  const contextManager = {
    buildContext: sinon.stub().resolves('context')
  };
  const lore = ['lore'];
  const turns = ['turn'];
  const npcs = ['npc'];
  const location = 'location';
  const result = await dialogueExpertAgent.buildContext(contextManager, { lore, turns, npcs, location });
  assert.strictEqual(result, 'context');
  assert.strictEqual(contextManager.buildContext.callCount, 1);
  assert.strictEqual(contextManager.buildContext.firstCall.args[0].system.length, 1);
  assert.strictEqual(contextManager.buildContext.firstCall.args[0].system[0], await dialogueExpertAgent.getInstructions());
});

test('DialogueExpertAgent sendLlmRequest sends the correct options and parses the response', async () => {
  const agentHelper = {
    sendLlmRequest: sinon.stub().resolves({ quick_action_1: { description: 'Open the door' }, quick_action_2: { description: 'Search the room' }, tasks: [{ id: 'task-1', status: 'OPEN' }] })
  };
  const dialogueExpertAgent = new DialogueExpertAgent(agentHelper);
  const context = { system: ['instructions'], turns: [] };
  const userText = 'What should I do?';
  const result = await dialogueExpertAgent.sendLlmRequest(context, userText);
  assert.deepEqual(result, { quick_action_1: { description: 'Open the door' }, quick_action_2: { description: 'Search the room' }, tasks: [{ id: 'task-1', status: 'OPEN' }] });
  assert.strictEqual(agentHelper.sendLlmRequest.callCount, 1);
  assert.deepEqual(agentHelper.sendLlmRequest.firstCall.args[2], 
    {
      max_completion_tokens: 1500,
      temperature: 0.8,
      context: context,
      userText
    }
  );
});