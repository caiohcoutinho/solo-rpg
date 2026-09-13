import { LoggerFactory } from "../service/loggerFactory.js";

class CampaignRepository {
  constructor(databasePool) {
    this.pool = databasePool;
    this.logger = LoggerFactory.createLogger("CampaignRepository");
  }

  async findById(id){
    const result = await this.pool.query(`select * from campaign where id = $1;`, [id]);
    return result.rows[0] || null;
  }

  async findAll(){
    return this.pool.query(`select * from campaign order by id;`).then((result) => result.rows);
  }
}

export { CampaignRepository };
