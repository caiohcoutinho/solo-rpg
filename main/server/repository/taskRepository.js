import { Pool } from "pg";
import { LoggerFactory } from "../service/loggerFactory.js";

class TaskRepository {
    constructor(pool) {
        this.pool = pool;
        this.logger = LoggerFactory.createLogger("TaskRepository");
    }

    async insert(task) {
        this.logger.log("debug", `insert task: ${JSON.stringify(task)}`);
        const query = {
            text: 'INSERT INTO tasks (scene_id, resolution, campaign_id, goal, revealed, completed) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            values: [task.scene_id, task.resolution, task.campaign_id, task.goal, task.revealed, task.completed],
        };
        const result = await this.pool.query(query);
        this.logger.log("debug", `insert result: ${JSON.stringify(result.rows)}`);
        return result.rows[0];
    }

    async update(taskId, task){
        this.logger.log("debug", `update task: ${JSON.stringify(task)}`);
        const query = {
            text: 'UPDATE tasks SET resolution = $1, campaign_id = $2, goal = $3, revealed = $4, completed = $5 WHERE id = $6 RETURNING *',
            values: [task.resolution, task.campaign_id, task.goal, task.revealed, task.completed, taskId],
        };
        const result = await this.pool.query(query);
        this.logger.log("debug", `update result: ${JSON.stringify(result.rows)}`);
        return result.rows[0];
    }

    async findByIdAndStatus(id, status) {
        const query = {
            text: 'SELECT * FROM tasks WHERE id = $1 AND status = $2',
            values: [id, status],
        };

        const result = await this.pool.query(query);
        return result.rows[0];
    }

    async findById(id) {
        const query = {
            text: 'SELECT * FROM tasks WHERE id = $1',
            values: [id],
        };

        const result = await this.pool.query(query);
        return result.rows[0];
    }

    async findBySceneId(sceneId) {
        const query = {
            text: 'SELECT * FROM tasks WHERE scene_id = $1 ORDER BY created_at ASC',
            values: [sceneId],
        };

        const result = await this.pool.query(query);
        this.logger.log("debug", `findBySceneId result: ${JSON.stringify(result.rows)}`);
        return result.rows;
    }

    async updateCompleted(id, completed) {
        const query = {
            text: 'UPDATE tasks SET completed = $1 WHERE id = $2',
            values: [completed, id],
        };

        const result = await this.pool.query(query);
        return result.rowCount;
    }

    async delete(id) {
        const query = {
            text: 'DELETE FROM tasks WHERE id = $1',
            values: [id],
        };

        const result = await this.pool.query(query);
        return result.rowCount;
    }
}

export { TaskRepository };