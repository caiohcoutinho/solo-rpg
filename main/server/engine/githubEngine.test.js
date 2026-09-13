import test from 'node:test';
import assert from 'node:assert/strict';
import sinon from 'sinon';
import { GithubEngine } from './githubEngine.js';

import dotenv from "dotenv";
const env = dotenv.config();

const MODEL = process.env["GITHUB_MODEL"];

// Stub the call method outside of the test suite
const azureWrapperStub = sinon.stub().resolves('This is the response text');
const azureWrapper = {
  call: azureWrapperStub
};

test('GithubEngine should be defined', async () => {
  assert.ok(GithubEngine, 'GithubEngine is not defined');
});

test('GithubEngine should have a logger property', async () => {
  const engine = new GithubEngine(azureWrapper);
  assert.ok(engine.logger, 'GithubEngine does not have a logger property');
});

test('GithubEngine should have an azureWrapper property', async () => {
  const engine = new GithubEngine(azureWrapper);
  assert.ok(engine.azureWrapper, 'GithubEngine does not have an azureWrapper property');
});

test('GithubEngine should have a buildMessages method', async () => {
  const engine = new GithubEngine(azureWrapper);
  const result = engine.buildMessages({ system: [], location: {}, npcs: [], turns: [], misc: [] });
  assert.ok(Array.isArray(result), 'GithubEngine.buildMessages does not return an array');
  assert.strictEqual(result.length, 1, 'GithubEngine.buildMessages did not return an empty array');
});

test('GithubEngine should have a prompt method', async () => {
  const engine = new GithubEngine(azureWrapper);
  const options = {
    max_completion_tokens: 50,
    temperature: 0.5,
    context: [],
    userText: 'test',
    outputJsonSchema: {}
  };
  const result = await engine.prompt(options);
  assert.strictEqual(result, 'This is the response text');
  sinon.assert.calledWith(azureWrapperStub, {
    temperature: options.temperature,
    max_tokens: options.max_completion_tokens,
    model: MODEL,
    messages: engine.buildMessages(options.context),
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: "json_schema_name",
        schema: options.outputJsonSchema
      }
    }
  });
});

test('GithubEngine should handle errors when azureWrapper throws an error', async () => {
  const errorStub = sinon.stub().rejects(new Error('Test error'));
  const errorAzureWrapper = {
    call: errorStub
  };
  const engine = new GithubEngine(errorAzureWrapper);
  const options = {
    max_completion_tokens: 50,
    temperature: 0.5,
    context: [],
    userText: 'test',
    outputJsonSchema: {}
  };
  await assert.rejects(async () => {
    await engine.prompt(options);
  }, {
    message: 'Test error'
  });
});