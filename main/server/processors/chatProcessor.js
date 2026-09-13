export class ChatProcessor {
  constructor({contextProvider, diceRollProcessor, noteProcessor, gameTurnProcessor, errorHandler, rageProcessor}) {
    this.contextProvider = contextProvider;
    this.diceRollProcessor = diceRollProcessor;
    this.noteProcessor = noteProcessor;
    this.gameTurnProcessor = gameTurnProcessor;
    this.errorHandler = errorHandler;
    this.rageProcessor = rageProcessor;
  }

  async process(text, isChallenge, socket) {
    try {
      if (!text || typeof text !== "string") {
        throw new Error("Chat message text must be a string.");
      }

      const echo = this.maybeUseTestEcho(text);

      if (text.startsWith("/rage")) {
        return this.rageProcessor.process(text.slice(6), socket);
      }

      if (text.startsWith("/roll ")) {
        return this.diceRollProcessor.process(text.slice(6), socket);
      }

      if (text.startsWith("/note ")) {
        return this.noteProcessor.process(text.slice(6), socket);
      }

      if (echo !== null) {
        return this.processTestEcho(echo);
      }

      return this.gameTurnProcessor.process(text, socket);
    } catch (error) {
      this.errorHandler.handle(error, { stage: "chat", text }, socket);
    }
  }

  maybeUseTestEcho(text) {
    if (
      text === "[TEST][TEST][TEST][TEST][TEST]" ||
      text === "[test] updating own block"
    ) {
      return text;
    }

    return null;
  }

  async processTestEcho(text) {
    const context = await this.contextProvider.getCurrentContext();

    await this.gameTurnProcessor.turnRepository.saveTurn({
      context: `${this.gameTurnProcessor.toTextContext(context.contextTurns)}\nYOU: ${text}`,
      result: text,
      isUserAction: false,
      isNote: false,
      resultMetadata: {
        source: "llm",
        finishReason: "test-echo",
      },
      scene_id: context.sceneId,
      campaign_id: context.campaignId,
    });

    this.gameTurnProcessor.messenger.broadcast({
      type: "llm.response",
      turns: await this.gameTurnProcessor.turnRepository.findActiveByCampaignId(context.campaignId),
    });
  }
}
