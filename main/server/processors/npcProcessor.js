export class NpcProcessor {
  constructor({ npcRepository, messenger, errorHandler, contextProvider }) {
    this.repository = npcRepository;
    this.messenger = messenger;
    this.errorHandler = errorHandler;
    this.contextProvider = contextProvider;
  }

  async fetch(socket) {
    try {
      this.messenger.send(socket, {
        type: "npc.fetch",
        npcs: await this.repository.findActiveByCampaignId(await this.contextProvider.campaignId()),
      });
    } catch (error) {
      this.errorHandler.handle(error, { stage: "npc.fetch" }, socket);
    }
  }

  async update(message, socket) {
    try {
      const { id, updates } = message;
      if (!id) throw new Error("NPC update requires an id.");

      const updatedNpc = await this.repository.update(id, updates || {});
      if (!updatedNpc) throw new Error(`NPC not found: ${id}`);

      this.messenger.broadcastAndSend(socket, {
        type: "npc.update",
        npc: updatedNpc,
        npcs: await this.repository.findActiveByCampaignId(await this.contextProvider.campaignId()),
      });
    } catch (error) {
      this.errorHandler.handle(error, {
        stage: "npc.update",
        npcId: message.id,
      }, socket);
    }
  }

  async delete(message, socket) {
    try {
      const { id } = message;
      if (!id) throw new Error("NPC delete requires an id.");

      const deleted = await this.repository.deleteNpc(id);
      if (!deleted) throw new Error(`NPC not found: ${id}`);

      this.messenger.broadcastAndSend(socket, {
        type: "npc.delete",
        npcId: id,
        npcs: await this.repository.findActiveByCampaignId(await this.contextProvider.campaignId()),
      });
    } catch (error) {
      this.errorHandler.handle(error, {
        stage: "npc.delete",
        npcId: message.id,
      }, socket);
    }
  }
}
