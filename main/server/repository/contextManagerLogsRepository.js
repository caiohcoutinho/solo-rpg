import { Pool } from "pg";
import { LoggerFactory } from "../service/loggerFactory.js";

const logger = LoggerFactory.createLogger("ContextManagerLogsRepository");

const COLUMNS = `
        system_actual_size,
        system_clipped_size,
        lore_actual_size,
        lore_clipped_size,
        active_scene_actual_size,
        active_scene_clipped_size,
        recent_turns_actual_size,
        recent_turns_clipped_size,
        misc_actual_size,
        misc_clipped_size,
        system_element_count,
        lore_element_count,
        active_scene_element_count,
        recent_turns_element_count,
        misc_element_count
`;

class ContextManagerLogsRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async insert(contextManagerLog) {
    const insert = await this.pool.query(`
        insert into context_manager_logs (${COLUMNS})
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        returning *;
    `, [
        contextManagerLog.system_actual_size,
        contextManagerLog.system_clipped_size,
        contextManagerLog.lore_actual_size,
        contextManagerLog.lore_clipped_size,
        contextManagerLog.active_scene_actual_size,
        contextManagerLog.active_scene_clipped_size,
        contextManagerLog.recent_turns_actual_size,
        contextManagerLog.recent_turns_clipped_size,
        contextManagerLog.misc_actual_size,
        contextManagerLog.misc_clipped_size,
        contextManagerLog.system_element_count,
        contextManagerLog.lore_element_count,
        contextManagerLog.active_scene_element_count,
        contextManagerLog.recent_turns_element_count,
        contextManagerLog.misc_element_count
    ]);

    if (insert.rowCount === 0) {
        return null;
    }

    return insert.rows[0];
  }

  async delete(contextManagerLogId) {
    const deletion = await this.pool.query(`
      delete from context_manager_logs
      where id = $1
      returning id;
    `, [contextManagerLogId]);

    if (deletion.rowCount === 0) {
      return false;
    }

    return true;
  }

  async findAll() {
    const result = await this.pool.query(`select * from context_manager_logs`);
    return result.rows;
  }
}

export { ContextManagerLogsRepository };