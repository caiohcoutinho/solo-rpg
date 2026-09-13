import { LoggerFactory } from "../service/loggerFactory.js";

class QuickActionRepository {
  constructor(pool) {
    this.pool = pool;
    this.logger = LoggerFactory.createLogger("QuickActionRepository");
  }

  async insert({description, challenge, turnId}) {
    try {
      const result = await this.pool.query(
        `
          INSERT INTO quick_action (description, is_challenge, reasoning, attribute, ability, reward, cost, target, turn_id)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING *;
        `,
        [description, !!challenge, challenge?.reasoning, challenge?.attribute, challenge?.ability, challenge?.reward, challenge?.cost, challenge?.target, turnId]
      );
      return result.rows[0];
    } catch (error) {
      this.logger.error("Error creating quick action:", error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const result = await this.pool.query(
        `
          SELECT * FROM quick_action WHERE id = $1;
        `,
        [id]
      );
      if (result.rows.length === 0) {
        return null;
      }
      return result.rows[0];
    } catch (error) {
      this.logger.error("Error reading quick action:", error);
      throw error;
    }
  }


  async update(id, description, is_challenge, reasoning, attribute, ability, reward, cost, target) {
    try {
      const result = await this.pool.query(
        `
          UPDATE quick_action SET description = $1, is_challenge = $2, reasoning = $3, attribute = $4, ability = $5, reward = $6, cost = $7, target = $8 WHERE id = $9;
        `,
        [description, is_challenge, reasoning, attribute, ability, reward, cost, target, id]
      );
      return result.rowCount > 0;
    } catch (error) {
      this.logger.error("Error updating quick action:", error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const result = await this.pool.query(
        `
          DELETE FROM quick_action WHERE id = $1;
        `,
        [id]
      );
      return result.rowCount > 0;
    } catch (error) {
      this.logger.error("Error deleting quick action:", error);
      throw error;
    }
  }
}

export { QuickActionRepository };