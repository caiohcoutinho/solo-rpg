import test from 'node:test';
import assert from 'node:assert/strict';
import sinon from 'sinon';
import { GeminiEngine } from './geminiEngine.js';
import dotenv from "dotenv";

const env = dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_HOST = process.env.GEMINI_HOST;
const GEMINI_MODEL = process.env.GEMINI_MODEL;

test('GeminiEngine should be defined', async () => {
  assert.ok(GeminiEngine, 'GeminiEngine is not defined');
});

test('GeminiEngine should have a logger property', async () => {
  const engine = new GeminiEngine();
  assert.ok(engine.logger, 'GeminiEngine does not have a logger property');
});

test('GeminiEngine should have an httpClient property', async () => {
  const engine = new GeminiEngine();
  assert.ok(engine.httpClient, 'GeminiEngine does not have an httpClient property');
});

test('GeminiEngine should have a buildMessages method', async () => {
  const engine = new GeminiEngine();
  const result = engine.buildMessages({ system: [], location: {}, npcs: [], turns: [], misc: [] });
  assert.ok(Array.isArray(result), 'GeminiEngine.buildMessages does not return an array');
  assert.strictEqual(result.length, 1, 'GeminiEngine.buildMessages did not return an empty array');
});

test('GeminiEngine.extractResponseText should return an empty string if responseData is undefined', async () => {
  const responseData = undefined;
  const engine = new GeminiEngine();
  const result = engine.extractResponseText(responseData);
  assert.strictEqual(result, "");
});

test('GeminiEngine.extractResponseText should return an empty string if responseData.choices is undefined', async () => {
  const engine = new GeminiEngine();
  const responseData = { choices: undefined };
  const result = engine.extractResponseText(responseData);
  assert.strictEqual(result, "");
});

test('GeminiEngine.extractResponseText should return an empty string if responseData.choices.length is 0', async () => {
  const engine = new GeminiEngine();
  const responseData = { choices: [] };
  const result = engine.extractResponseText(responseData);
  assert.strictEqual(result, "");
});

test('GeminiEngine.extractResponseText should return an empty string if responseData.choices[0].message.content is undefined', async () => {
  const engine = new GeminiEngine();
  const responseData = {
    choices: [
      {
        message: {
          content: undefined
        }
      }
    ]
  };
  const result = engine.extractResponseText(responseData);
  assert.strictEqual(result, "");
});

test('GeminiEngine.sendLlmRequest should return the response text if the response is successful', async () => {
  const options = {
    temperature: 0.5,
    max_completion_tokens: 100,
    context: { system: [], location: {content: "test"}, npcs: [], turns: [], misc: [] },
    outputJsonSchema: null
  };

  const mockedResponse = {
    ok: true,
    json: () => Promise.resolve({ choices: [{ message: { content: "This is the response text" } }] })
  };

  const httpClient = sinon.stub().resolves(mockedResponse);
  const engine = new GeminiEngine(httpClient);

  const result = await engine.sendLlmRequest(options);

  assert.strictEqual(result, "This is the response text");
  sinon.assert.calledWith(httpClient, GEMINI_HOST+"/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": GEMINI_API_KEY,
      "Authorization": `Bearer ${GEMINI_API_KEY}`
    },
    body: JSON.stringify({
      temperature: options.temperature,
      max_completion_tokens: options.max_completion_tokens,
      model: GEMINI_MODEL,
      messages: [{ role: "user", content: "test" }]
    })
  });
});

test('GeminiEngine.sendLlmRequest should throw an error if the response is not successful', async () => {
  const options = {
    temperature: 0.5,
    max_completion_tokens: 100,
    context: { system: [], location: {content: "test"}, npcs: [], turns: [], misc: [] },
    outputJsonSchema: null
  };

  const mockedResponse = {
    ok: false,
    json: () => Promise.resolve({ error: { message: "OpenAi request failed." } })
  };

  const httpClient = sinon.stub().resolves(mockedResponse);
  const engine = new GeminiEngine(httpClient);

  await assert.rejects(() => engine.sendLlmRequest(options), /OpenAi request failed./);
  sinon.assert.calledWith(httpClient, GEMINI_HOST+"/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": GEMINI_API_KEY,
      "Authorization": `Bearer ${GEMINI_API_KEY}`
    },
    body: JSON.stringify({
      temperature: options.temperature,
      max_completion_tokens: options.max_completion_tokens,
      model: GEMINI_MODEL,
      messages: [{ role: "user", content: "test" }]
    })
  });
});

test('GeminiEngine.sendLlmRequest should return the response text if the response is successful with outputJsonSchema', async () => {
  const options = {
    temperature: 0.5,
    max_completion_tokens: 100,
    context: { system: [], location: { content: "test" }, npcs: [], turns: [], misc: [] },
    outputJsonSchema: { type: "object", properties: { key: { type: "string" } } }
  };

  const mockedResponse = {
    ok: true,
    json: () => Promise.resolve({ choices: [{ message: { content: "This is the response text" } }] })
  };

  const httpClient = sinon.stub().resolves(mockedResponse);
  const engine = new GeminiEngine(httpClient);

  const result = await engine.sendLlmRequest(options);

  assert.strictEqual(result, "This is the response text");
  sinon.assert.calledWith(httpClient, GEMINI_HOST+"/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": GEMINI_API_KEY,
      "Authorization": `Bearer ${GEMINI_API_KEY}`
    },
    body: JSON.stringify({
      temperature: options.temperature,
      max_completion_tokens: options.max_completion_tokens,
      model: GEMINI_MODEL,
      messages: [{ role: "user", content: "test" }],
      response_format: {
        type: "json_schema",
        json_schema: {
          strict: "true",
          schema: options.outputJsonSchema
        }
      }
    })
  });
});