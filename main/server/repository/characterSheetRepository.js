import { LoggerFactory } from "../service/loggerFactory.js";

class CharacterSheetRepository {
  constructor(pool) {
    this.pool = pool;
    this.logger = LoggerFactory.createLogger("CharacterSheetRepository");
  }

  async insert(name) {
    this.logger.log("debug", "Creating character sheet with name: " + name);
    try {
      const result = await this.pool.query(`
        INSERT INTO character_sheet (name)
        VALUES ($1)
        RETURNING *;
      `, [name]);
      return result.rows[0].id;
    } catch (error) {
      this.logger.error(`Error creating character sheet with name: ${name}: ${JSON.stringify(error)}`);
      throw error;
    }
  }

  async findById(id) {
    this.logger.log("debug", "Reading character sheet with id: " + id);
    try {
      const result = await this.pool.query(`
        SELECT * FROM character_sheet WHERE id = $1;
      `, [id]);
      if (result.rows.length === 0) {
        return null;
      }
      return result.rows[0];
    } catch (error) {
      this.logger.error(`Error reading character sheet with id: ${id}: ${JSON.stringify(error)}`);
      throw error;
    }
  }

  async findByCampaignId(campaignId) {
    this.logger.log("debug", "Reading character sheets by campaign id: " + campaignId);
    try {
      const result = await this.pool.query(`
        SELECT * FROM character_sheet WHERE campaign_id = $1;
      `, [campaignId]);
      return result.rows;
    } catch (error) {
      this.logger.error(`Error reading character sheets by campaign id: ${campaignId}: ${JSON.stringify(error)}`);
      throw error;
    }
  }

  async update(id, updates) {
    this.logger.log("debug", "Updating character sheet with id: " + id);
    try {
      const updateKeys = Object.keys(updates);
      const updateValues = Object.values(updates);
      const updateValuesWithDefaults = updateValues.map(value => {
        if (typeof value === 'undefined') {
          return 0;
        }
        return value;
      });
      const updateQuery = `
        UPDATE character_sheet SET
          ${updateKeys.map((key, index) => `${key} = COALESCE($${index + 2}, ${updateValuesWithDefaults[index]})`).join(', ')}
        WHERE id = $1
        RETURNING *;
      `;
      this.logger.log("debug", `[update] updateQuery: ${updateQuery}`);
      this.logger.log("debug", `[update] updateValues: ${updateValues}`);
      const result = await this.pool.query(updateQuery, [id, ...updateValues]);
      return result.rows[0];
    } catch (error) {
      this.logger.error(`Error updating character sheet with id: ${id}: ${JSON.stringify(error)}`);
      throw error;
    }
  }

  async delete(id) {
    this.logger.log("debug", "Deleting character sheet with id: " + id);
    try {
      const result = await this.pool.query(`
        DELETE FROM character_sheet WHERE id = $1
        RETURNING *;
      `, [id]);
      return result.rows[0];
    } catch (error) {
      this.logger.error(`Error deleting character sheet with id: ${id}: ${JSON.stringify(error)}`);
      throw error;
    }
  }
}

export { CharacterSheetRepository };