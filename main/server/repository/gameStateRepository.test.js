import test from "node:test";
import assert from "node:assert/strict";
import { GameStateRepository } from "./gameStateRepository.js";

test("game state repository creates, updates, deletes, and finds rows", async () => {
  const queries = [];
  const fakePool = {
    async query(sql, params) {
      queries.push({ sql, params });
      //console.log(`[query] sql: ${sql}, params: ${JSON.stringify(params)}`);

      if (sql.includes("create table if not exists game_state")) {
        return { rows: [] };
      }

      if ( 1==0
        || (sql.includes("from game_state") && sql.includes('where uuid = $1') && params[0] === "11111111-1111-1111-1111-111111111111") 
        || (sql.includes("where key = $1") && params[0] === "mode")
        || (sql.includes("from game_state") && !sql.includes("where key = $1") && params === undefined)
      ){
        return {
          rows: [
            {
              id: "11111111-1111-1111-1111-111111111111",
              key: "mode",
              value: "exploration",
            },
          ],
        };
      }

      if (sql.includes("insert into game_state")) {
        return {
          rows: [
            {
              id: "22222222-2222-2222-2222-222222222222",
              key: params[0],
              value: params[1],
            },
          ],
        };
      }

      if (sql.includes("update game_state")) {
        const updatedValue = params[1] ?? params[2];
        return {
          rows: [
            {
              id: params[0],
              key: "mode",
              value: updatedValue,
            },
          ],
        };
      }

      if (sql.includes("delete from game_state")) {
        return { rowCount: 1 };
      }

      return { rows: [] };
    },
  };

  const repository = new GameStateRepository(fakePool);

  const created = await repository.insert({ key: "quest", value: "active" });
  assert.equal(created.key, "quest");
  assert.equal(created.value, "active");

  let found = await repository.findById("11111111-1111-1111-1111-111111111111");
  assert.equal(found?.key, "mode");
  found = await repository.findByKey("mode");
  assert.equal(found?.value, "exploration");

  const updated = await repository.update("11111111-1111-1111-1111-111111111111", {
    value: "combat",
  });
  assert.equal(updated.value, "combat");

  const deleted = await repository.deleteById("11111111-1111-1111-1111-111111111111");
  assert.equal(deleted, true);
  const result = await repository.findAll();
  assert.equal(result?.length, 1);
  assert.equal(queries.some((entry) => entry.sql.includes("insert into game_state")), true);
  assert.equal(queries.some((entry) => entry.sql.includes("update game_state")), true);
  assert.equal(queries.some((entry) => entry.sql.includes("delete from game_state")), true);
});