import { LoggerFactory } from "../service/loggerFactory.js";

export class GameContextProvider {
  constructor(repositories) {
    this._repositories = repositories;
    this.logger = LoggerFactory.createLogger("GameContextProvider");
  }

  async campaignId() {
    const gameState = await this.repositories.gameState.findByKey("current_campaign_id");
    this.logger.log("debug", `Retrieved game state for campaign ID: ${JSON.stringify(gameState)}`);
    const result = gameState?.value;
    this.logger.log("debug", `Retrieved campaign ID: ${result}`);
    return result;
  }

  async sceneId() {
    const gameState = await this.repositories.gameState.findByKey("current_scene_id");
    return gameState?.value;
  }

  async getLocationId() {
    const gameState = await this.repositories.gameState.findByKey("current_location");
    return gameState?.value;
  }

  async mode() {
    const gameState = await this.repositories.gameState.findByKey("mode");
    return gameState?.value || "exploration";
  }

  async mainCharacterId() {
    const gameState = await this.repositories.gameState.findByKey("main_character");
    return gameState?.value;
  }

  get repositories() {
    return this._repositories;
  }

  async getCurrentLocation() {
    const locationId = await this.getLocationId()
    this.logger.log("debug", `[getCurrentLocation] locationId = ${locationId}`);
    const location = await this.repositories.location.findById(locationId);
    this.logger.log("debug", `[getCurrentLocation] location = ${JSON.stringify(location)}`);
    return location;
  }

  async getActiveNpcs() {
    const campaignId = await this.campaignId();
    return await this.repositories.npc.findActiveByCampaignId(campaignId);
  }

  async allNpcs() {
    const campaignId = await this.campaignId();
    return await this.repositories.npc.findByCampaignId(campaignId);
  }

  async getActiveLore() {
    const activeLore = await this.repositories.lore.findActive();
    const sceneId = await this.sceneId();
    const scene = await this.repositories.scene.findByIdWithTasks(sceneId);
    if(!scene){
      return activeLore;
    }
    const solvedTasks = scene.tasks.filter((task) => task.solved).length;
    const sceneDetails = [{
      name: "Scene "+scene.name,
      description: scene.setup
    }];
    if (solvedTasks >= 1) {
      sceneDetails = [...sceneDetails, {
        name: "Scene "+scene.name,
        description: scene.escalation
      }];
    }
    if (solvedTasks >= 2) {
      sceneDetails = [...sceneDetails, {
        name: "Scene "+scene.name,
        description: scene.payoff
      }];
    }
    return [...activeLore, ...sceneDetails];
  }

  async turns() {
    const campaignId = await this.campaignId();
    return await this.repositories.turn.findActiveByCampaignId(campaignId);
  }

  async contextTurns() {
    const theTurns = await this.turns();
    return theTurns
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .filter((turn) => !turn.is_note)
      .reverse()
      .slice(0, 10)
      .reverse();
  }

  async getTasks() {
    const currentSceneId = await this.sceneId();
    return await this.repositories.task.findBySceneId(currentSceneId);
  }

  async getCurrentContext() {
    const tasks = await this.getTasks();

    return {
      campaignId: await this.campaignId(),
      sceneId: await this.sceneId(),
      locationId: await this.getLocationId(),
      location: await this.getCurrentLocation(),
      mode: await this.mode(),
      activeNpcs: await this.getActiveNpcs(),
      allNpcs: await this.allNpcs(),
      activeLore: await this.getActiveLore(),
      turns: await this.turns(),
      contextTurns: await this.contextTurns(),
      tasks
    };
  }
}
