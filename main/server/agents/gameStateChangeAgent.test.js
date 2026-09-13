import test from 'node:test';
import assert from 'node:assert/strict';
import { GameStateChangeAgent } from './GameStateChangeAgent.js';

test('constructor stores agentHelper and creates logger', () => {
  const agentHelper = {};

  const expert = new GameStateChangeAgent(agentHelper);

  assert.equal(expert.agentHelper, agentHelper);
  assert.ok(expert.logger);
});

test('getOutputJsonSchema returns the expected output schema', () => {
  const expert = new GameStateChangeAgent({});

  const schema = expert.getOutputJsonSchema();

  assert.equal(schema.name, 'game_state_change_advice_result');
  assert.equal(schema.schema.type, 'object');

  assert.deepEqual(
    Object.keys(schema.schema.properties),
    ['quick_action_1', 'quick_action_2', 'tasks']
  );

  assert.deepEqual(schema.schema.required, [
    'quick_action_1',
    'quick_action_2',
    'tasks'
  ]);

  assert.equal(schema.schema.additionalProperties, false);

  const tasks = schema.schema.properties.tasks;

  assert.equal(tasks.type, 'array');
  assert.equal(tasks.items.type, 'object');
  assert.deepEqual(tasks.items.required, ['id', 'status']);
  assert.equal(tasks.items.additionalProperties, false);
  assert.equal(tasks.items.properties.id.type, 'string');
  assert.deepEqual(tasks.items.properties.status.enum, ['OPEN', 'CLOSED']);
});

test('getInstructions reads instructions and caches the result', async () => {
  const expert = new GameStateChangeAgent({});

  const first = await expert.getInstructions();
  const second = await expert.getInstructions();

  assert.equal(typeof first, 'string');
  assert.ok(first.length > 0);
  assert.equal(second, first);

  // Verify the cached value is actually being returned.
  assert.equal(expert.instructions, first);
});

test('buildContext includes instructions, open tasks, lore, location, npcs and turns', async () => {
  const agentHelper = {};
  const expert = new GameStateChangeAgent(agentHelper);

  const calls = [];

  const contextManager = {
    buildContext(options) {
      calls.push(options);
      return 'built-context';
    }
  };

  const tasks = [
    {
      id: 'task-1',
      description: 'Find the missing key',
      status: 'OPEN'
    },
    {
      id: 'task-2',
      description: 'Talk to the bartender',
      status: 'CLOSED'
    },
    {
      id: 'task-3',
      description: 'Search the basement',
      status: 'OPEN'
    }
  ];

  const lore = ['The city is old'];
  const turns = [{ role: 'user', content: 'I enter the room.' }];
  const npcs = [{ name: 'Marcus' }];
  const location = { name: 'Old Tavern' };
  const userText = 'I search for clues.';

  const result = await expert.buildContext(contextManager, {
    lore,
    turns,
    npcs,
    tasks,
    location,
    userText
  });

  assert.equal(result, 'built-context');
  assert.equal(calls.length, 1);

  const options = calls[0];

  assert.equal(options.misc, lore);
  assert.equal(options.location, location);
  assert.equal(options.npcs, npcs);
  assert.equal(options.turns, turns);

  assert.equal(options.system.length, 3);

  assert.equal(typeof options.system[0], 'string');
  assert.ok(options.system[0].length > 0);

  assert.deepEqual(options.system[1], {
    role: 'system',
    content: 'TaskId: undefined . Task Description: undefined'
  });

  assert.deepEqual(options.system[2], {
    role: 'system',
    content: 'TaskId: undefined . Task Description: undefined'
  });

  // Closed tasks must not be included.
  assert.equal(
    options.system.some(
      item => item.content?.includes('Talk to the bartender')
    ),
    false
  );
});

test('buildContext handles an empty task list', async () => {
  const expert = new GameStateChangeAgent({});

  let capturedOptions;

  const contextManager = {
    buildContext(options) {
      capturedOptions = options;
      return 'empty-task-context';
    }
  };

  const result = await expert.buildContext(contextManager, {
    lore: [],
    turns: [],
    npcs: [],
    tasks: [],
    location: null,
    userText: 'Nothing happens.'
  });

  assert.equal(result, 'empty-task-context');
  assert.ok(capturedOptions);
  assert.equal(capturedOptions.system.length, 1);
  assert.equal(typeof capturedOptions.system[0], 'string');
});

test('sendLlmRequest sends the correct options and parses the response', async () => {
  const response = {
    quick_action_1: {
      description: 'Open the door',
      challenge: {
        reasoning: 'The door is locked.',
        attribute: 'strength',
        ability: 'athletics',
        reward: 'Access',
        cost: 'Noise'
      }
    },
    quick_action_2: {
      description: 'Search the room'
    },
    tasks: [
      {
        id: 'task-1',
        status: 'OPEN'
      }
    ]
  };

  const calls = [];

  const agentHelper = {
    async sendLlmRequest(agent, model, options) {
      calls.push(options);
      return JSON.stringify(response);
    }
  };

  const expert = new GameStateChangeAgent(agentHelper);

  const context = {
    system: ['instructions'],
    turns: []
  };

  const userText = 'What should I do?';

  const result = await expert.sendLlmRequest(context, userText);

  assert.deepEqual(result, response);
  assert.equal(calls.length, 1);

  assert.deepEqual(calls[0], {
    max_completion_tokens: 600,
    temperature: 0.8,
    context,
    userText,
    outputJsonSchema: expert.getOutputJsonSchema().schema
  });
});

test('sendLlmRequest parses responses without optional challenge data', async () => {
  const response = {
    quick_action_1: {
      description: 'Wait'
    },
    quick_action_2: {
      description: 'Leave'
    },
    tasks: []
  };

  const agentHelper = {
    async sendLlmRequest(agent, model, options) {
      assert.equal(options.max_completion_tokens, 600);
      assert.equal(options.temperature, 0.8);
      return JSON.stringify(response);
    }
  };

  const expert = new GameStateChangeAgent(agentHelper);

  const result = await expert.sendLlmRequest(
    'some-context',
    'I do nothing.'
  );

  assert.deepEqual(result, response);
});

test('sendLlmRequest propagates agentHelper errors', async () => {
  const expectedError = new Error('LLM unavailable');

  const agentHelper = {
    async sendLlmRequest() {
      throw expectedError;
    }
  };

  const expert = new GameStateChangeAgent(agentHelper);

  await assert.rejects(
    expert.sendLlmRequest('context', 'user text'),
    error => {
      assert.equal(error, expectedError);
      return true;
    }
  );
});

test('sendLlmRequest propagates invalid JSON responses', async () => {
  const agentHelper = {
    async sendLlmRequest() {
      return 'not valid json';
    }
  };

  const expert = new GameStateChangeAgent(agentHelper);

  await assert.rejects(
    expert.sendLlmRequest('context', 'user text'),
    SyntaxError
  );
});
