import { getServerErrors } from "../service/errorState.js";

export class WebSocketMessageRouter {
  constructor({ processors, repositories, messenger }) {
    this.processors = processors;
    this.repositories = repositories;
    this.messenger = messenger;
  }

  async route(message, socket) {
    switch (message.type) {
      case "chat":
        return this.processors.chat.process(
          message.text,
          message.isChallenge,
          socket
        );

      case "quick_action":
        return this.processors.quickAction.process(message, socket);

      case "errors":
        return this.sendErrors(socket);

      case "turns":
        return await this.sendTurns(socket);

      case "state.update":
        return this.processors.gameState.update(message, socket);

      case "turn.update":
        return this.processors.turn.update(message, socket);

      case "turn.delete":
        return this.processors.turn.delete(message, socket);

      case "npc.fetch":
        return this.processors.npc.fetch(socket);

      case "npc.update":
        return this.processors.npc.update(message, socket);

      case "npc.delete":
        return this.processors.npc.delete(message, socket);

      case "lore.update":
        return await this.processors.lore.upsert(message, socket);

      case "lore.delete":
        return await this.processors.lore.delete(message, socket);

      case "scene.update":
        return await this.processors.scene.upsert(message, socket);

      case "scene.delete":
        return await this.processors.scene.delete(message, socket);

      case "scene.generate":
        return await this.processors.scene.generate(message, socket);

      case "tasks.insert":
        return await this.processors.task.insert(message.tasks, socket);

      default:
        return undefined;
    }
  }

  sendErrors(socket) {
    this.messenger.send(socket, {
      type: "server.errors",
      message: "Current server errors",
      errors: getServerErrors(),
      timestamp: new Date().toISOString(),
    });
  }

  async sendTurns(socket) {
    const gameState = await this.repositories.gameState.findByKey("current_campaign_id");
    const campaignId = gameState?.value;

    this.messenger.send(socket, {
      type: "turns",
      turns: await this.repositories.turn.findActiveByCampaignId(campaignId),
    });
  }
}
