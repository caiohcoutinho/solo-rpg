import test from "node:test";
import assert from "node:assert/strict";
import { TurnRepository } from "./turnRepository.js";

const TURN_ID = "11111111-1111-1111-1111-111111111111";
const CAMPAIGN_ID = "22222222-2222-2222-2222-222222222222";

function createPool(queryHandler) {
  const queries = [];

  return {
    queries,

    async query(sql, params) {
      queries.push({ sql, params });
      return queryHandler(sql, params);
    },
  };
}

test("constructor stores the database pool", () => {
  const pool = createPool(() => ({ rows: [] }));
  const repository = new TurnRepository(pool);

  assert.equal(repository.pool, pool);
  assert.ok(repository.logger);
});

test("initialize is not available on TurnRepository", () => {
  const pool = createPool(() => ({ rows: [] }));
  const repository = new TurnRepository(pool);

  assert.equal(repository.initialize, undefined);
});

test("findActive logs and rethrows database errors", async () => {
  const databaseError = new Error("database unavailable");

  const pool = createPool(async () => {
    throw databaseError;
  });

  const repository = new TurnRepository(pool);

  await assert.rejects(
    () => repository.findActive(),
    (error) => {
      assert.equal(error, databaseError);
      return true;
    },
  );

  assert.equal(pool.queries.length, 1);
});

test("saveTurn inserts and returns the created turn", async () => {
  const savedTurn = {
    id: TURN_ID,
    context: "ctx",
    result: "hello",
    scene_id: "scene-1",
    isUserAction: true,
    isNote: false,
    resultMetadata: { foo: "bar" },
    createdAt: "2024-01-01T00:00:00.000Z",
  };

  const pool = createPool((sql, params) => {
    assert.match(sql, /insert into turns/i);
    assert.match(sql, /returning/i);

    assert.deepEqual(params, [
      "ctx",
      "hello",
      true,
      false,
      { foo: "bar" },
      "scene-1",
      CAMPAIGN_ID,
    ]);

    return {
      rows: [savedTurn],
    };
  });

  const repository = new TurnRepository(pool);

  const result = await repository.saveTurn({
    context: "ctx",
    result: "hello",
    isUserAction: true,
    isNote: false,
    resultMetadata: { foo: "bar" },
    scene_id: "scene-1",
    campaign_id: CAMPAIGN_ID,
  });

  assert.deepEqual(result, savedTurn);
  assert.equal(pool.queries.length, 1);
});

test("saveTurn uses an empty object when resultMetadata is omitted", async () => {
  const pool = createPool((sql, params) => {
    assert.deepEqual(params, [
      "ctx",
      "hello",
      false,
      true,
      {},
      undefined,
      undefined,
    ]);

    return {
      rows: [{ id: TURN_ID }],
    };
  });

  const repository = new TurnRepository(pool);

  const result = await repository.saveTurn({
    context: "ctx",
    result: "hello",
    isUserAction: false,
    isNote: true,
  });

  assert.deepEqual(result, { id: TURN_ID });
});

test("saveTurn returns undefined when insert returns no rows", async () => {
  const pool = createPool(() => ({
    rows: [],
  }));

  const repository = new TurnRepository(pool);

  const result = await repository.saveTurn({
    context: "ctx",
    result: "hello",
    isUserAction: true,
    isNote: false,
  });

  assert.equal(result, undefined);
});

test("update returns the updated turn", async () => {
  const updatedTurn = {
    id: TURN_ID,
    context: "ctx",
    result: "updated text",
    campaign_id: CAMPAIGN_ID,
    isUserAction: true,
    isNote: false,
    resultMetadata: {},
    createdAt: "2024-01-01T00:00:00.000Z",
  };

  const pool = createPool((sql, params) => {
    assert.match(sql, /update turns/i);
    assert.deepEqual(params, [TURN_ID, "updated text"]);

    return {
      rowCount: 1,
      rows: [updatedTurn],
    };
  });

  const repository = new TurnRepository(pool);

  const result = await repository.update(TURN_ID, "updated text");

  assert.deepEqual(result, updatedTurn);
});

test("update returns null when the turn does not exist", async () => {
  const pool = createPool(() => ({
    rowCount: 0,
    rows: [],
  }));

  const repository = new TurnRepository(pool);

  const result = await repository.update(TURN_ID, "updated text");

  assert.equal(result, null);
});

test("delete returns true when the turn is deleted", async () => {
  const pool = createPool((sql, params) => {
    assert.match(sql, /delete from turns/i);
    assert.deepEqual(params, [TURN_ID]);

    return {
      rowCount: 1,
    };
  });

  const repository = new TurnRepository(pool);

  const result = await repository.delete(TURN_ID);

  assert.equal(result, true);
});

test("delete returns false when the turn does not exist", async () => {
  const pool = createPool(() => ({
    rowCount: 0,
  }));

  const repository = new TurnRepository(pool);

  const result = await repository.delete(TURN_ID);

  assert.equal(result, false);
});

test("find active by campaign id should return properly", async () => {
  const rows = [
    {
      id: TURN_ID,
      context: "ctx 1",
      result: "hello",
      is_user_action: true,
      is_note: false,
      result_metadata: {},
      quick_actions: null,
      campaign_id: CAMPAIGN_ID,
    },
    {
      id: "33333333-3333-3333-3333-333333333333",
      context: "ctx 2",
      result: "world",
      is_user_action: false,
      is_note: true,
      result_metadata: {},
      quick_actions: null,
      campaign_id: CAMPAIGN_ID,
    }
  ];

  const pool = createPool((sql) => {
    assert.match(sql, /SELECT turns\.id/i);
    assert.match(sql, /WHERE turns\.archived = false/i);
    assert.match(sql, / AND turns\.campaign_id = /i);

    return { rows };
  });

  const repository = new TurnRepository(pool);

  const activeTurns = await repository.findActiveByCampaignId(CAMPAIGN_ID);

  assert.deepEqual(activeTurns, rows);
});