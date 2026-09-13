export class DiceRollProcessor {
  constructor({ diceRoller, turnRepository, contextProvider, messenger, errorHandler }) {
    this.diceRoller = diceRoller;
    this.turnRepository = turnRepository;
    this.contextProvider = contextProvider;
    this.messenger = messenger;
    this.errorHandler = errorHandler;
  }

  async process(request, socket) {
    try {
      const values = request.trim().split(/\s+/).filter(Boolean);
      if (!values.length || values.length > 2) {
        throw new Error("Roll requires one or two numeric arguments.");
      }

      const first = parseInt(values[0], 10);
      const second = values.length === 2 ? parseInt(values[1], 10) : undefined;

      if (Number.isNaN(first) || (values.length === 2 && Number.isNaN(second))) {
        throw new Error("Roll arguments must be numbers.");
      }

      const roll = second === undefined
        ? this.diceRoller.roll(first)
        : this.diceRoller.roll(first, second);

      await this.saveRoll(roll);

      this.notify();
    } catch (error) {
      this.errorHandler.handle(error, { stage: "dice.roll", request }, socket);
    }
  }

  async saveRoll(roll) {
    const turns = await this.contextProvider.contextTurns();
    const context = turns
      .map((turn) => (turn.isUserAction ? "YOU" : "LLM") + ": " + turn.result)
      .join("\n");

    const result =
      roll.ones > roll.successes
        ? "Critical Failure"
        : roll.successes === 0
          ? "Failure"
          : `Success (${roll.successes})`;

    await this.turnRepository.saveTurn({
      context,
      result: `${result}! Diff: ${roll.difficulty}, Rolls: ${roll.rolls.join(", ")}`,
      isUserAction: true,
      isNote: true,
      resultMetadata: { source: "user" },
      scene_id: await this.contextProvider.sceneId(),
      campaign_id: await this.contextProvider.campaignId(),
    });
  }

  async notify() {
    this.messenger.broadcast({
      type: "llm.response",
      turns: await this.turnRepository.findActiveByCampaignId(await this.contextProvider.campaignId()),
    });
  }
}
