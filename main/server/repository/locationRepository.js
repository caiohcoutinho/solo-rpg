import { LoggerFactory } from "../service/loggerFactory.js";

class LocationRepository {
  constructor(pool) {
    this.pool = pool;
    this.logger = LoggerFactory.createLogger("LocationRepository");
  }

  async insert({ name, portrait, background }) {
    const insert = await this.pool.query(
      `insert into location (name, portrait, background)
       values ($1, $2, $3)
       returning
         id,
         name, 
         portrait,
         background,
         created_at;
      `,
      [name, portrait, background],
    );

    if (insert.rowCount === 0) {
      return null;
    }

    return insert.rows[0];
  }

  async update(locationId, updates = {}) {
    const fields = [];
    const values = [];
    let index = 2;

    if (Object.prototype.hasOwnProperty.call(updates, "portrait")) {
      fields.push(`portrait = $${index}`);
      values.push(updates.portrait);
      index += 1;
    }

    if (Object.prototype.hasOwnProperty.call(updates, "background")) {
      fields.push(`background = $${index}`);
      values.push(updates.background);
      index += 1;
    }

    if (fields.length === 0) {
      return this.findById(locationId);
    }

    values.unshift(locationId);
    const update = await this.pool.query(
      `update location
       set ${fields.join(", ")}
       where id = $1
       returning
         id,
         portrait,
         background,
         created_at;
      `,
      values,
    );

    if (update.rowCount === 0) {
      return null;
    }

    const result = update.rows[0];
    return result;
  }

  async delete(locationId) {
    const result = await this.pool.query(`delete from location where id = $1;`, [locationId]);
    return result.rowCount > 0;
  }

  async findById(locationId) {
    const result = await this.pool.query(`select * from location where id = $1;`, [locationId]);
    return result.rows[0] || null;
  }

  async findAll(){
    return this.pool.query(`select * from location order by id;`).then((result) => result.rows);
  }

  async findByCampaignId(campaignId) {
    const result = await this.pool.query(
      `select * from location where campaign_id = $1 order by id;`,
      [campaignId]
    );
    return result.rows;
  }
  
}

export { LocationRepository };
