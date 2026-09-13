import { LoggerFactory } from "../service/loggerFactory.js";

class LoreRepository {
  constructor(pool) {
    if (!pool) {
      throw new Error('Pool not provided');
    }
    this.pool = pool;
    this.logger = LoggerFactory.createLogger('LoreRepository');
  }

  async update(loreId, lore) {
    const keys = Object.keys(lore);
    const values = Object.values(lore);

    const assignments = keys
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');

    const query = {
      text: `
        UPDATE lore
        SET ${assignments}
        WHERE id = $${keys.length + 1}
        RETURNING *
      `,
      values: [...values, loreId],
    };

    this.logger.log('debug', `updateLore query: ${query.text}`);
    this.logger.log('debug', `updateLore values: ${JSON.stringify(query.values)}`);

    try {
      const result = await this.pool.query(query);
      this.logger.log('debug', `result: ${JSON.stringify(result)}`);
      return result.rows[0];
    } catch (error) {
      this.logger.error('Error updating lore:', error);
      this.logger.error(`Error stacktrace: ${error.stack}`);
      throw error;
    }
  }

  async insert(lore) {
    this.logger.log('debug', `insert lore: ${JSON.stringify(lore)}`);
    const query = {
      text: 'INSERT INTO lore (active, name, description, campaign_id) VALUES ($1, $2, $3, $4) RETURNING *',
      values: [!!lore.active, lore.name, lore.description, lore.campaign_id],
    };

    try {
      const result = await this.pool.query(query);
      this.logger.log('debug', `result: ${JSON.stringify(result)}`);
      return result.rows[0];
    } catch (error) {
      this.logger.error('Error inserting lore:', error);
      throw error;
    }
  }

  async delete(id) {
    const query = {
      text: 'DELETE FROM lore WHERE id = $1',
      values: [id],
    };

    try {
      const result = await this.pool.query(query);
      return result.rowCount > 0;
    } catch (error) {
      this.logger.error('Error deleting lore:', error);
      throw error;
    }
  }

  async findById(id) {
    const query = {
      text: 'SELECT * FROM lore WHERE id = $1',
      values: [id],
    };

    try {
      const result = await this.pool.query(query);
      return result.rows[0] || null;
    } catch (error) {
      this.logger.error('Error finding lore by ID:', error);
      throw error;
    }
  }

  async findAll() {
    const query = {
      text: 'SELECT * FROM lore',
    };

    try {
      const result = await this.pool.query(query);
      return result.rows;
    } catch (error) {
      this.logger.error('Error retrieving active lore:', error);
      throw error;
    }
  }


  async findActive(){
    const query = {
      text: 'SELECT * FROM lore WHERE active = true ORDER BY name ASC',
    };

    try {
      const result = await this.pool.query(query);
      return result.rows;
    } catch (error) {
      this.logger.error('Error retrieving active lore:', error);
      throw error;
    }
  }

  async findByCampaignId(campaignId) {
    const query = {
      text: 'SELECT * FROM lore WHERE campaign_id = $1 ORDER BY name ASC',
      values: [campaignId],
    };

    try {
      const result = await this.pool.query(query);
      return result.rows;
    } catch (error) {
      this.logger.error('Error retrieving active lore:', error);
      throw error;
    }
  }
}

export { LoreRepository }