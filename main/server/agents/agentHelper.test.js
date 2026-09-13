import test from "node:test";
import assert from "node:assert/strict";
import sinon from "sinon";
import { AgentHelper } from "./agentHelper.js";

const createDependencies = () => ({
  phi4MiniEngine: {
    prompt: sinon.stub(),
  },
  geminiEngine: {
    sendLlmRequest: sinon.stub(),
  },
  gemmaEngine: {
    prompt: sinon.stub(),
  },
  githubEngine: {
    prompt: sinon.stub(),
  },
  llmRequestLogsRepository: {
    insert: sinon.stub().resolves(),
  },
});

const createAgentHelper = () => {
  const dependencies = createDependencies();
  const agentHelper = new AgentHelper(dependencies);

  return {
    agentHelper,
    dependencies,
  };
};

test("should create a new instance of AgentHelper", () => {
  const { agentHelper } = createAgentHelper();

  assert.ok(agentHelper);
});

test("should initialize all dependencies", () => {
  const { agentHelper, dependencies } = createAgentHelper();

  assert.equal(agentHelper.phi4MiniEngine, dependencies.phi4MiniEngine);
  assert.equal(agentHelper.geminiEngine, dependencies.geminiEngine);
  assert.equal(agentHelper.gemmaEngine, dependencies.gemmaEngine);
  assert.equal(agentHelper.githubEngine, dependencies.githubEngine);
  assert.equal(
    agentHelper.llmRequestLogsRepository,
    dependencies.llmRequestLogsRepository
  );
});

test("callModel should call Gemini engine for gemini model", async () => {
  const { agentHelper, dependencies } = createAgentHelper();

  const expected = { response: "gemini response" };
  dependencies.geminiEngine.sendLlmRequest.resolves(expected);

  const options = {
    prompt: "hello",
    max_completion_tokens: 100,
  };

  const result = await agentHelper.callModel(
    "test-agent",
    "gemini",
    options
  );

  assert.deepEqual(result, expected);
  assert.equal(
    dependencies.geminiEngine.sendLlmRequest.calledOnce,
    true
  );
  assert.deepEqual(
    dependencies.geminiEngine.sendLlmRequest.firstCall.args,
    [options]
  );

  assert.equal(dependencies.gemmaEngine.prompt.notCalled, true);
  assert.equal(dependencies.githubEngine.prompt.notCalled, true);
  assert.equal(dependencies.phi4MiniEngine.prompt.notCalled, true);
});

test("callModel should call Gemma engine for gemma model", async () => {
  const { agentHelper, dependencies } = createAgentHelper();

  const expected = { response: "gemma response" };
  dependencies.gemmaEngine.prompt.resolves(expected);

  const options = {
    prompt: "hello",
    max_completion_tokens: 100,
  };

  const result = await agentHelper.callModel(
    "test-agent",
    "gemma",
    options
  );

  assert.deepEqual(result, expected);
  assert.equal(dependencies.gemmaEngine.prompt.calledOnce, true);
  assert.deepEqual(
    dependencies.gemmaEngine.prompt.firstCall.args,
    [options]
  );

  assert.equal(dependencies.geminiEngine.sendLlmRequest.notCalled, true);
  assert.equal(dependencies.githubEngine.prompt.notCalled, true);
  assert.equal(dependencies.phi4MiniEngine.prompt.notCalled, true);
});

test("callModel should call Github engine for github model", async () => {
  const { agentHelper, dependencies } = createAgentHelper();

  const expected = { response: "github response" };
  dependencies.githubEngine.prompt.resolves(expected);

  const options = {
    prompt: "hello",
    max_completion_tokens: 100,
  };

  const result = await agentHelper.callModel(
    "test-agent",
    "github",
    options
  );

  assert.deepEqual(result, expected);
  assert.equal(dependencies.githubEngine.prompt.calledOnce, true);
  assert.deepEqual(
    dependencies.githubEngine.prompt.firstCall.args,
    [options]
  );

  assert.equal(dependencies.geminiEngine.sendLlmRequest.notCalled, true);
  assert.equal(dependencies.gemmaEngine.prompt.notCalled, true);
  assert.equal(dependencies.phi4MiniEngine.prompt.notCalled, true);
});

test("callModel should call Phi-4 Mini engine for phi_4_mini model", async () => {
  const { agentHelper, dependencies } = createAgentHelper();

  const expected = { response: "phi response" };
  dependencies.phi4MiniEngine.prompt.resolves(expected);

  const options = {
    prompt: "hello",
    max_completion_tokens: 100,
  };

  const result = await agentHelper.callModel(
    "test-agent",
    "phi_4_mini",
    options
  );

  assert.deepEqual(result, expected);
  assert.equal(dependencies.phi4MiniEngine.prompt.calledOnce, true);
  assert.deepEqual(
    dependencies.phi4MiniEngine.prompt.firstCall.args,
    [options]
  );

  assert.equal(dependencies.geminiEngine.sendLlmRequest.notCalled, true);
  assert.equal(dependencies.gemmaEngine.prompt.notCalled, true);
  assert.equal(dependencies.githubEngine.prompt.notCalled, true);
});

