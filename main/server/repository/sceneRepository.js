import { Pool } from "pg";
import { LoggerFactory } from "../service/loggerFactory.js";

class SceneRepository {
    constructor(pool, taskRepository) {
        this.pool = pool;
        this.logger = LoggerFactory.createLogger("SceneRepository");
        this.taskRepository = taskRepository;
    }

    async findById(id) {
        const query = {
            text: 'SELECT * FROM scene WHERE id = $1',
            values: [id],
        };

        const result = await this.pool.query(query);
        return result.rows[0];
    }

    async findByIdWithTasks(id){
        const query = {
            text: 'SELECT * FROM scene WHERE id = $1',
            values: [id],
        };

        const result = await this.pool.query(query);
        const scene = result.rows[0];

        scene.tasks = await this.taskRepository.findBySceneId(id);

        return scene;
    }

    async delete(id) {
        const query = {
            text: 'DELETE FROM scene WHERE id = $1',
            values: [id],
        };

        const result = await this.pool.query(query);
        return result.rowCount;
    }

    async update(id, scene) {
        const query = {
            text: 'UPDATE scene SET name = $1, setup = $2, escalation = $3, payoff = $4 WHERE id = $5 RETURNING *',
            values: [scene.name, scene.setup, scene.escalation, scene.payoff, id],
        };

        const result = await this.pool.query(query);
        return result.rows[0];
    }

    async insert(scene) {
        const query = {
            text: 'INSERT INTO scene (name, setup, escalation, payoff, campaign_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            values: [scene.name, scene.setup, scene.escalation, scene.payoff, scene.campaign_id],
        };

        const result = await this.pool.query(query);
        return result.rows[0];
    }

    async findAll(){
        const result = await this.pool.query(`select * from scene order by name`);
        return result.rows;
    }

    async findByCampaignId(campaignId) {
        const query = {
            text: 'SELECT * FROM scene WHERE campaign_id = $1 ORDER BY name',
            values: [campaignId],
        };

        const result = await this.pool.query(query);
        // for each row, get the tasks
        result.rows.forEach(row => {
            row.tasks = this.taskRepository.findBySceneId(row.id);
        });

        return result.rows
    }
}

export { SceneRepository };