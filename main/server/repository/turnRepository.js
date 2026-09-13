import { LoggerFactory } from "../service/loggerFactory.js";

class TurnRepository {
  constructor(databasePool) {
    this.pool = databasePool;
    this.logger = LoggerFactory.createLogger("TurnRepository");
  }

  async findActiveByCampaignId(campaignId) {
    try {
      const result = await this.pool.query(`
        SELECT turns.id, turns.context, turns.result, turns.is_user_action, turns.is_note, turns.result_metadata, json_agg(quick_actions.*) as quick_actions, turns.campaign_id
        FROM turns
        LEFT JOIN quick_action AS quick_actions ON turns.id = quick_actions.turn_id
        WHERE turns.archived = false AND turns.campaign_id = $1
        GROUP BY turns.id, turns.context, turns.result, turns.is_user_action, turns.result_metadata, turns.campaign_id
        ORDER BY turns.created_at ASC;
      `, [campaignId]);
      return result.rows.map(row => {
        const quickActions = row.quick_actions ? row.quick_actions.filter(quickAction => quickAction !== null).map(quickAction => {
          return {
            id: quickAction.id,
            description: quickAction.description,
            isChallenge: quickAction.is_challenge,
            reasoning: quickAction.reasoning,
            attribute: quickAction.attribute,
            ability: quickAction.ability,
            reward: quickAction.reward,
            cost: quickAction.cost,
            target: quickAction.target || 1
          };
        }) : [];
        this.logger.log("debug", `quickActions: ${JSON.stringify(quickActions)}`);
        row.quickAction1 = quickActions[0] || null;
        row.quickAction2 = quickActions[1] || null;

        return row;
      });
    } catch (error) {
      this.logger.error(`Error loading turns for campaign ${campaignId}: ${JSON.stringify(error)}`);
      throw error;
    }
  }
  
  async findActive() {
    try {
      const result = await this.pool.query(`
        SELECT turns.id, turns.context, turns.result, turns.is_user_action, turns.is_note, turns.result_metadata, json_agg(quick_actions.*) as quick_actions, turns.campaign_id
        FROM turns
        LEFT JOIN quick_action AS quick_actions ON turns.id = quick_actions.turn_id
        WHERE turns.archived = false
        GROUP BY turns.id, turns.context, turns.result, turns.is_user_action, turns.result_metadata, turns.campaign_id
        ORDER BY turns.created_at DESC;
      `);
      return rows.forEach(row => {
        const quickActions = row.quick_actions ? row.quick_actions.filter(quickAction => quickAction !== null).map(quickAction => {
          return {
            id: quickAction.id,
            description: quickAction.description,
            isChallenge: quickAction.is_challenge,
            reasoning: quickAction.reasoning,
            attribute: quickAction.attribute,
            ability: quickAction.ability,
            reward: quickAction.reward,
            cost: quickAction.cost,
            target: quickAction.target || 1
          };
        }) : [];
        this.logger.log("debug", `quickActions: ${JSON.stringify(quickActions)}`);
        row.quickAction1 = quickActions[0] || null;
        row.quickAction2 = quickActions[1] || null;

      });
    } catch (error) {
      this.logger.error(`Error loading turns: ${JSON.stringify(error)}`);
      throw error;
    }
  }

  async saveTurn({ context, result, isUserAction, isNote, resultMetadata = {}, scene_id, campaign_id }) {
    const insert = await this.pool.query(
      `insert into turns (context, result, is_user_action, is_note, result_metadata, scene_id, campaign_id)
         values ($1, $2, $3, $4, $5, $6, $7)
         returning
           id,
           context,
           result,
           scene_id,
           is_user_action as "isUserAction",
           is_note as "isNote",
           result_metadata as "resultMetadata",
           created_at as "createdAt";
      `,
      [context, result, isUserAction, isNote, resultMetadata, scene_id, campaign_id],
    );

    return insert.rows[0];
  }

  async update(turnId, result) {
    const update = await this.pool.query(
      `update turns
       set result = $2
       where id = $1
       returning
         id,
         context,
         result,
         campaign_id,
         is_user_action as "isUserAction",
         is_note as "isNote",
         result_metadata as "resultMetadata",
         created_at as "createdAt";
      `,
      [turnId, result],
    );

    if (update.rowCount === 0) {
      return null;
    }

    return update.rows[0];
  }

  async delete(turnId) {
    const deletion = await this.pool.query(`delete from turns where id = $1;`, [turnId]);

    if (deletion.rowCount === 0) {
      return false;
    }

    return true;
  }
}

export { TurnRepository };
