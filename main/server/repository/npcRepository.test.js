import test from "node:test";
import assert from "node:assert/strict";
import { NpcRepository } from "./npcRepository.js";

test("npc repository loads, updates, deletes, and filters active npcs", async () => {
  const queries = [];
  const fakePool = {
    async query(sql, params) {
      queries.push({ sql, params });

      if (sql.includes("create table if not exists npcs")) {
        return { rows: [] };
      }

      if (sql.includes("from npcs") && !sql.includes("where in_scene = true")) {
        return {
          rows: [
            {
              id: "11111111-1111-1111-1111-111111111111",
              name: "Maria",
              gender: "F",
              portrait: "maria.png",
              createdAt: "2024-01-01T00:00:00.000Z",
              inScene: true,
            },
            {
              id: "22222222-2222-2222-2222-222222222222",
              name: "Aldric",
              gender: "M",
              portrait: "aldric.png",
              createdAt: "2024-01-02T00:00:00.000Z",
              inScene: false,
            },
          ],
        };
      }

            if (sql.includes("from npcs") && sql.includes("where in_scene = true")) {
        return {
          rows: [
            {
              id: "11111111-1111-1111-1111-111111111111",
              name: "Maria",
              gender: "F",
              portrait: "maria.png",
              createdAt: "2024-01-01T00:00:00.000Z",
              inScene: true,
            }
          ],
        };
      }

      if (sql.includes("update npcs")) {
        return {
          rows: [
            {
              id: params[0],
              name: params[1],
              gender: params[2],
              portrait: params[3],
              createdAt: "2024-01-03T00:00:00.000Z",
              inScene: params[4] ?? params[2],
            },
          ],
        };
      }

      if (sql.includes("delete from npcs")) {
        return { rowCount: 1 };
      }

      return { rows: [] };
    },
  };

  const repository = new NpcRepository(fakePool);

  let result = await repository.findActive();
  assert.equal(result.length, 1);
  assert.equal(result[0].name, "Maria");

  const updated = await repository.update(
    "11111111-1111-1111-1111-111111111111",
    { name: "María", inScene: false },
  );
  assert.equal(updated.name, "María");
  assert.equal(updated.inScene, false);

  const deleted = await repository.delete(
    "22222222-2222-2222-2222-222222222222",
  );
  assert.equal(deleted, true);
  assert.equal(queries.some((entry) => entry.sql.includes("update npcs")), true);
  assert.equal(queries.some((entry) => entry.sql.includes("delete from npcs")), true);
});

test("FindById returns correctly for existing and non-existing NPCs", async () => {
  const fakePool = {
    async query(sql, params) {
      if (sql.includes("from npcs") && params[0] === "11111111-1111-1111-1111-111111111111") {
        return {
          rows: [
            {
              id: "11111111-1111-1111-1111-111111111111",
              name: "Maria",
              gender: "F",
              portrait: "maria.png",
              createdAt: "2024-01-01T00:00:00.000Z",
              inScene: true,
            },
          ],
          rowCount: 1
        };
      }

      return { rows: [], rowCount: 0};
    },
  };

  const repository = new NpcRepository(fakePool);

  const existingNpc = await repository.findById("11111111-1111-1111-1111-111111111111");
  assert.equal(existingNpc.name, "Maria");

  const nonExistingNpc = await repository.findById("33333333-3333-3333-3333-333333333333");
  assert.equal(nonExistingNpc, null);
});

test("FindAll returns correctly for all NPCs", async () => {
  const fakePool = {
    async query(sql) {
      if (sql.includes("from npcs")) {
        return {
          rows: [
            {
              id: "11111111-1111-1111-1111-111111111111",
              name: "Maria",
              gender: "F",
              portrait: "maria.png",
              createdAt: "2024-01-01T00:00:00.000Z",
              inScene: true,
            },
            {
              id: "22222222-2222-2222-2222-222222222222",
              name: "Aldric",
              gender: "M",
              portrait: "aldric.png",
              createdAt: "2024-01-02T00:00:00.000Z",
              inScene: false,
            },
          ],
        };
      }

      return { rows: [] };
    },
  };

  const repository = new NpcRepository(fakePool);

  const allNpcs = await repository.findAll();
  assert.equal(allNpcs.length, 2);
  assert.equal(allNpcs[0].name, "Maria");
  assert.equal(allNpcs[1].name, "Aldric");
});

test("FindByName should return the correct NPC when it exists and null when it doesn't", async () => {
  const fakePool = {
    async query(sql, params) {
      if (sql.includes("from npcs") && params[0] === "Maria") {
        return {
          rows: [
            {
              id: "11111111-1111-1111-1111-111111111111",
              name: "Maria",
              gender: "F",
              portrait: "maria.png",
              createdAt: "2024-01-01T00:00:00.000Z",
              inScene: true,
            },
          ],
          rowCount: 1
        };
      }

      return { rows: [], rowCount: 0};
    },
  };

  const repository = new NpcRepository(fakePool);

  const existingNpc = await repository.findByName("Maria");
  assert.equal(existingNpc.name, "Maria");

  const nonExistingNpc = await repository.findByName("NonExistentNPC");
  assert.equal(nonExistingNpc, null);
});

test("Delete should return false when trying to delete a non-existing NPC", async () => {
  const fakePool = {
    async query(sql, params) {
      if (sql.includes("delete from npcs") && params[0] === "non-existing-id") {
        return { rowCount: 0 };
      }
      return { rowCount: 1 };
    },
  };

  const repository = new NpcRepository(fakePool);

  const deleteResult = await repository.delete("non-existing-id");
  assert.equal(deleteResult, false);
});

test("FindActiveByCampaignId should return properly", async () => {
  const fakePool = {
    async query(sql, params) {
      if (sql.includes("from npcs") && params[0] === "campaign-123") {
        return {
          rows: [
            {
              id: "11111111-1111-1111-1111-111111111111",
              name: "Maria",
              gender: "F",
              portrait: "maria.png",
              createdAt: "2024-01-01T00:00:00.000Z",
              inScene: true,
              campaignId: "campaign-123"
            },
          ],
        };
      }
      return { rows: [] };
    },
  };

  const repository = new NpcRepository(fakePool);

  const activeNpcs = await repository.findActiveByCampaignId("campaign-123");
  assert.equal(activeNpcs.length, 1);
  assert.equal(activeNpcs[0].name, "Maria");

  const noActiveNpcs = await repository.findActiveByCampaignId("non-existing-campaign");
  assert.equal(noActiveNpcs.length, 0);
});

test("FindByCampaignId should return properly", async () => {
  const fakePool = {
    async query(sql, params) {
      if (sql.includes("from npcs") && params[0] === "campaign-123") {
        return {
          rows: [
            {
              id: "11111111-1111-1111-1111-111111111111",
              name: "Maria",
              gender: "F",
              portrait: "maria.png",
              createdAt: "2024-01-01T00:00:00.000Z",
              inScene: true,
              campaignId: "campaign-123"
            },
            {
              id: "22222222-2222-2222-2222-222222222222",
              name: "Aldric",
              gender: "M",
              portrait: "aldric.png",
              createdAt: "2024-01-02T00:00:00.000Z",
              inScene: false,
              campaignId: "campaign-123"
            },
          ],
        };
      }
      return { rows: [] };
    },
  };

  const repository = new NpcRepository(fakePool);

  const npcsByCampaign = await repository.findByCampaignId("campaign-123");
  assert.equal(npcsByCampaign.length, 2);
  assert.equal(npcsByCampaign[0].name, "Maria");
  assert.equal(npcsByCampaign[1].name, "Aldric");

  const noNpcsByCampaign = await repository.findByCampaignId("non-existing-campaign");
  assert.equal(noNpcsByCampaign.length, 0);
});