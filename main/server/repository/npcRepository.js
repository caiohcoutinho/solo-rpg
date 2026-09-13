import { LoggerFactory } from "../service/loggerFactory.js";

class NpcRepository {
  constructor(databasePool) {
    this.pool = databasePool;
    this.logger = LoggerFactory.createLogger("NpcRepository");
  }

  async update(npcId, updates = {}) {
    this.logger.log("debug", `updateNpc updates: ${JSON.stringify(updates)}`);
    const fields = [];
    const values = [];
    let index = 2;

    if (Object.prototype.hasOwnProperty.call(updates, "name")) {
      fields.push(`name = $${index}`);
      values.push(updates.name);
      index += 1;
    }

    if (Object.prototype.hasOwnProperty.call(updates, "gender")) {
      fields.push(`gender = $${index}`);
      values.push(updates.gender);
      index += 1;
    }

    if (Object.prototype.hasOwnProperty.call(updates, "portrait")) {
      fields.push(`portrait = $${index}`);
      values.push(updates.portrait);
      index += 1;
    }

    if (Object.prototype.hasOwnProperty.call(updates, "inScene")) {
      this.logger.log("debug", `updateNpc inScene: ${updates.inScene}`);
      fields.push(`in_scene = $${index}`);
      values.push(Boolean(updates.inScene));
      index += 1;
    }

    if (Object.prototype.hasOwnProperty.call(updates, "in_scene")) {
      this.logger.log("debug", `updateNpc in_scene: ${updates.in_scene}`);
      fields.push(`in_scene = $${index}`);
      values.push(Boolean(updates.in_scene));
      index += 1;
    }

    if (fields.length === 0) {
      return this.getNpcById(npcId);
    }

    values.unshift(npcId);
    const update = await this.pool.query(
      `update npcs
       set ${fields.join(", ")}
       where uuid = $1
       returning
         uuid as id,
         name,
         gender,
         portrait,
         created_at as "createdAt",
         in_scene as "inScene";
      `,
      values,
    );

    if (update.rowCount === 0) {
      return null;
    }

    return update.rows[0];
  }

  async delete(npcId) {
    const deletion = await this.pool.query(`delete from npcs where uuid = $1;`, [npcId]);

    if (deletion.rowCount === 0) {
      return false;
    }

    return true;
  }

  async findByCampaignId(campaignId) {
    const result = await this.pool.query(
      `select
        uuid as id,
        name,
        gender,
        portrait,
        created_at as "createdAt",
        in_scene as "inScene",
        background
      from npcs
       where campaign_id = $1;`,
      [campaignId],
    );

    return result.rows;
  }

  async findById(npcId) {
    const result = await this.pool.query(
      `select
        uuid as id,
        name,
        gender,
        portrait,
        created_at as "createdAt",
        in_scene as "inScene",
        background
      from npcs
       where uuid = $1;`,
      [npcId],
    );

    if (result.rowCount === 0) {
      return null;
    }

    return result.rows[0];
  }

  async findActive() {
    const result = await this.pool.query(
      `select
        uuid as id,
        name,
        gender,
        portrait,
        created_at as "createdAt",
        in_scene as "inScene",
        background
      from npcs
       where in_scene = true;`
    );

    return result.rows;
  }

  async findAll() {
    const result = await this.pool.query(
      `select
        uuid as id,
        name,
        gender,
        portrait,
        created_at as "createdAt",
        in_scene as "inScene",
        background
      from npcs;`
    );

    return result.rows;
  }

  async findActiveByCampaignId(campaignId) {
    const result = await this.pool.query(
      `select
        uuid as id,
        name,
        gender,
        portrait,
        created_at as "createdAt",
        in_scene as "inScene",
        background
      from npcs
       where in_scene = true and campaign_id = $1;`,
      [campaignId],
    );

    return result.rows;
  }

  async findByName(name) {
    const result = await this.pool.query(
      `select
        uuid as id,
        name,
        gender,
        portrait,
        created_at as "createdAt",
        in_scene as "inScene",
        background
      from npcs
       where name = $1;`,
      [name],
    );

    if (result.rowCount === 0) {
      return null;
    }

    return result.rows[0];
  }
}

export { NpcRepository };
