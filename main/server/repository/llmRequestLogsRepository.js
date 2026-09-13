import { Pool } from "pg";
import { LoggerFactory } from "../service/loggerFactory.js";

class LlmRequestLogsRepository {
  constructor(pool) {
    this.pool = pool;
    this.logger = LoggerFactory.createLogger("LlmRequestLogsRepository");
  }

  async insert(log) {
    const query = {
      text: 'INSERT INTO llm_request_logs (duration, agent, max_tokens, context_size, model) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      values: [log.duration, log.agent, log.max_tokens, log.context_size, log.model],
    };

    const result = await this.pool.query(query);
    return result.rows[0].id;
  }

  async findById(id) {
    const query = {
      text: 'SELECT * FROM llm_request_logs WHERE id = $1',
      values: [id],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async update(id, log) {
    const query = {
      text: 'UPDATE llm_request_logs SET duration = $1, agent = $2, max_tokens = $3, context_size = $4, model = $5 WHERE id = $6',
      values: [log.duration, log.agent, log.max_tokens, log.context_size, log.model, id],
    };

    const result = await this.pool.query(query);
    return result.rowCount;
  }

  async delete(id) {
    const query = {
      text: 'DELETE FROM llm_request_logs WHERE id = $1',
      values: [id],
    };

    const result = await this.pool.query(query);
    return result.rowCount;
  }
}

export { LlmRequestLogsRepository };