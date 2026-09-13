export class NpcEventProcessor {
  constructor({ npcRepository, turnRepository, messenger }) {
    this.npcRepository = npcRepository;
    this.turnRepository = turnRepository;
    this.messenger = messenger;
  }

  async process(events, context, socket) {
    for (const event of events || []) {
      if (event.leaving) {
        await this.leave(event, context, socket);
      } else if (event.entering) {
        await this.enter(event, context, socket);
      }
    }
  }

  async leave(event, context, socket) {
    const npc = context.activeNpcs.find(
      (item) => item.name === event.npc_name
    );

    if (!npc) return;

    await this.npcRepository.updateNpc(npc.id, { inScene: false });

    this.messenger.send(socket, {
      type: "npc.update",
      npcs: this.npcRepository.findActive(),
    });

    await this.saveEventNote(`${npc.name} has left the scene.`, context);
  }

  async enter(event, context, socket) {
    const alreadyActive = context.activeNpcs.find(
      (item) => item.name === event.npc_name
    );

    if (alreadyActive) return;

    const npc = this.npcRepository.findByName(event.npc_name);
    if (!npc) return;

    await this.npcRepository.updateNpc(npc.id, { inScene: true });

    this.messenger.send(socket, {
      type: "npc.update",
      npcs: this.npcRepository.findActive(),
    });

    await this.saveEventNote(`${npc.name} has entered the scene.`, context);
  }

  async saveEventNote(result, context) {
    await this.turnRepository.saveTurn({
      context: context.textContext,
      result,
      isUserAction: false,
      isNote: true,
      resultMetadata: { source: "user" },
      scene_id: context.sceneId,
      campaign_id: context.campaignId,
    });

    this.messenger.broadcast({
      type: "llm.response",
      turns: await this.turnRepository.findActiveByCampaignId(context.campaignId),
    });
  }
}
