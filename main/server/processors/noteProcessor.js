export class NoteProcessor {
  constructor({ turnRepository, contextProvider, messenger, errorHandler }) {
    this.turnRepository = turnRepository;
    this.contextProvider = contextProvider;
    this.messenger = messenger;
    this.errorHandler = errorHandler;
  }

  async process(note, socket) {
    try {
      const turns = await this.contextProvider.contextTurns();
      const context = turns
        .map((turn) => (turn.isUserAction ? "YOU" : "LLM") + ": " + turn.result)
        .join("\n");

      await this.turnRepository.saveTurn({
        context,
        result: note,
        isUserAction: true,
        isNote: true,
        resultMetadata: { source: "user" },
        scene_id: await this.contextProvider.sceneId(),
        campaign_id: await this.contextProvider.campaignId(),
      });

      this.messenger.broadcast({
        type: "llm.response",
        turns: await this.turnRepository.findActiveByCampaignId(await this.contextProvider.campaignId()),
      });
    } catch (error) {
      this.errorHandler.handle(error, { stage: "note", note }, socket);
    }
  }
}
