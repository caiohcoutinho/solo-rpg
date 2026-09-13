import { LoggerFactory } from "../service/loggerFactory.js";

class GameStateRepository {
  constructor(databasePool) {
    this.pool = databasePool;
    this.logger = LoggerFactory.createLogger("GameStateRepository");
  }

  async insert({ key, value }) {
    const insert = await this.pool.query(
      `insert into game_state (key, value)
       values ($1, $2)
       returning
         uuid as id,
         key,
         value;
      `,
      [key, value],
    );

    if (insert.rowCount === 0) {
      return null;
    }

    return insert.rows[0];
  }

  async update(gameStateId, updates = {}) {
    const fields = [];
    const values = [];
    let index = 2;

    if (Object.prototype.hasOwnProperty.call(updates, "key")) {
      fields.push(`key = $${index}`);
      values.push(updates.key);
      index += 1;
    }

    if (Object.prototype.hasOwnProperty.call(updates, "value")) {
      fields.push(`value = $${index}`);
      values.push(updates.value);
      index += 1;
    }

    if (fields.length === 0) {
      return this.findById(gameStateId);
    }

    values.unshift(gameStateId);
    const update = await this.pool.query(
      `update game_state
       set ${fields.join(", ")}
       where uuid = $1
       returning
         uuid as id,
         key,
         value;
      `,
      values,
    );

    if (update.rowCount === 0) {
      return null;
    }

    const result = update.rows[0];
    this.logger.log("debug", "[updateGameState]: result = "+JSON.stringify(result));
    return result;
  }

  async updateByKey(key, value) {
    const update = await this.pool.query(
      `update game_state
       set value = '${value}'
       where key = '${key}'
       returning
         uuid as id,
         key,
         value;
      `);

    if (update.rowCount === 0) {
      return null;
    }

    const result = update.rows[0];
    this.logger.log("debug", "[updateGameStateByKey]: result = "+JSON.stringify(result));
    return result;
  }

  async deleteByKey(key){
    const deletion = await this.pool.query(`delete from game_state where key = $1;`, [key]);

    if (deletion.rowCount === 0) {
      return false;
    }

    return true;
  }

  async deleteById(gameStateId) {
    const deletion = await this.pool.query(`delete from game_state where uuid = $1;`, [gameStateId]);

    if (deletion.rowCount === 0) {
      return false;
    }

    return true;
  }

  async findById(gameStateId) {
    const result = await this.pool.query(
      `select
        uuid as id,
        key,
        value
      from game_state
      where uuid = $1;`,
      [gameStateId],
    );

    return result.rows[0];
  }

  async findByKey(key) {
    const result = await this.pool.query(
      `select
        uuid as id,
        key,
        value
      from game_state
      where key = $1;`,
      [key],
    );

    this.logger.log("debug", `findByKey result for key "${key}": ${JSON.stringify(result.rows)}`);

    return (
      result.rows.length > 0
        ? result.rows[0]
        : null
    )
  }

  async findAll() {
    const result = await this.pool.query(`
      select
        uuid as id,
        key,
        value
      from game_state
      order by key asc;
    `);

    return result.rows; 
  }
}

export { GameStateRepository };
