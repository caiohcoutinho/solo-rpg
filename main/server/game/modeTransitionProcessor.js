export class ModeTransitionProcessor {
  constructor({
    transitionRouterAgent,
    gameStateRepository,
    turnRepository,
    messenger,
  }) {
    this.agent = transitionRouterAgent;
    this.gameStateRepository = gameStateRepository;
    this.turnRepository = turnRepository;
    this.messenger = messenger;
  }

  async process({ activeLore, contextTurns, activeNpcs, location, text, mode, campaignId, sceneId }) {
    const enabled =
      this.gameStateRepository.findByKey("enable_auto_transition")?.value === "true";

    if (!enabled) return mode;

    const suggestion = await this.agent.sendLlmRequest(
      activeLore,
      contextTurns,
      activeNpcs,
      location,
      text,
      mode
    );

    if (
      suggestion.confidenceScore <= 0.8 ||
      suggestion.suggestedMode === mode
    ) {
      return mode;
    }

    const suggestedMode = suggestion.suggestedMode;

    await this.gameStateRepository.updateGameStateByKey(
      "mode",
      suggestedMode
    );

    try {
      await this.turnRepository.saveTurn({
        context: contextTurns.map((turn) => turn.result).join("\n"),
        result: `Transitioning mode from ${mode} to ${suggestedMode}.`,
        isUserAction: false,
        isNote: true,
        resultMetadata: { source: "user" },
        scene_id: sceneId,
        campaign_id: campaignId,
      });

      this.messenger.broadcast({
        type: "llm.response",
        turns: await this.turnRepository.findActiveByCampaignId(campaignId),
      });
    } catch {
      // Preserve the original behavior: transition itself succeeds even
      // when the transition note cannot be persisted.
    }

    this.messenger.broadcast({
      type: "state.change",
      key: "mode",
      value: suggestedMode,
    });

    return suggestedMode;
  }
}
