import { LoggerFactory } from "../service/loggerFactory.js";

const logger = LoggerFactory.createLogger("EnemyRepository");

class EnemyRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async findAll() {
    return await this.pool.query(`SELECT * FROM enemies ORDER BY name ASC;`);
  }

  async findByCampaignId(campaignId) {
    const query = {
      text: 'SELECT * FROM enemies WHERE campaign_id = $1 ORDER BY name ASC;',
      values: [campaignId],
    };

    try {
      const result = await this.pool.query(query);
      return result.rows;
    } catch (error) {
      this.logger.error('Error retrieving enemies by campaign ID:', error);
      throw error;
    }
  }
}

export { EnemyRepository };
