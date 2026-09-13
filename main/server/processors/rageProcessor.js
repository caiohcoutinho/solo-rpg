import { LoggerFactory } from "../service/loggerFactory.js";

export class RageProcessor {
  constructor({ diceRoller, rageRoller, turnRepository, contextProvider, messenger, errorHandler, characterSheetRepository }) {
    this.diceRoller = diceRoller;
    this.rageRoller = rageRoller;
    this.turnRepository = turnRepository;
    this.contextProvider = contextProvider;
    this.messenger = messenger;
    this.errorHandler = errorHandler;
    this.characterSheetRepository = characterSheetRepository;
    this.logger = LoggerFactory.createLogger("RageProcessor");
  }

  validateParams(request) {
    const values = request.trim().split(/\s+/).filter(Boolean);
    const length = values?.length;
    if (!length && length !== 0 && length !== 1 && length !== 2) {
      throw new Error("Rage requires less than two arguments. Total: " + values.length);
    }
    return values;
  }

  async rollRageCheck(mainCharacterId, mainCharacterSheet, currentRage) {

    if (currentRage === 0) {
      return `You've Lost The Wolf and can't make Rage checks (Rage: ${currentRage}).`;
    }

    const roll = this.diceRoller.roll(1);

    if (roll.successes === 0) {
      await this.characterSheetRepository.update(mainCharacterId, { rage: currentRage - 1 });

      return `Rage check! Fails: ${roll.rolls.join(", ")} (Rage: ${currentRage - 1}).`;
    }

    return `Rage check! Pass: ${roll.rolls.join(", ")} (Rage: ${currentRage}).`;
  }

  rollRageDice(diceParam, difficultyParam, mainCharacterId, mainCharacterSheet, currentRage) {
    const difficulty = difficultyParam ? parseInt(difficultyParam) : 6;
    const dice = diceParam ? parseInt(diceParam) : 0;
    const rageRoll = this.rageRoller.roll({dice, difficulty, rage: currentRage});
    this.logger.log("debug", `rageRoll: ${JSON.stringify(rageRoll)}`);
    return `${rageRoll.result}. Diff: ${rageRoll.difficulty}, Regular: ${rageRoll.rolls.join(", ")}, Rage: ${rageRoll.rageRolls.join(", ")}`;
  }

  async process(request, socket) {
    try {
      const params = this.validateParams(request);

      const mainCharacterId = await this.contextProvider.mainCharacterId();
      if (!mainCharacterId) {
        throw new Error("Rage requires a main character.");
      }
      const mainCharacterSheet = await this.characterSheetRepository.findById(mainCharacterId);
      if (!mainCharacterSheet) {
        throw new Error("Rage requires a main character sheet.");
      }
      const rage = mainCharacterSheet["rage"];
      if (!rage && rage !== 0) {
        throw new Error("The main character sheet does not have a rage trait.");
      }

      let message;

      if (params.length === 0) {
        message = await this.rollRageCheck(mainCharacterId, mainCharacterSheet, rage);
      } else if (params[0] === "?") {
        message = `Current rage value is ${rage}.`;
      } else {
        message = await this.rollRageDice(params[0], params[1], mainCharacterId, mainCharacterSheet, rage);
      }

      const turns = await this.contextProvider.contextTurns();
      const context = turns
        .map((turn) => (turn.isUserAction ? "YOU" : "LLM") + ": " + turn.result)
        .join("\n");

      await this.turnRepository.saveTurn({
        context,
        result: message,
        isUserAction: true,
        isNote: true,
        resultMetadata: { source: "user" },
        scene_id: await this.contextProvider.sceneId(),
        campaign_id: await this.contextProvider.campaignId(),
      });

      await this.notify();
    } catch (error) {
      this.errorHandler.handle(error, { stage: "dice.roll", request }, socket);
    }
  }

  async notify() {
    this.messenger.broadcast({
      type: "llm.response",
      turns: await this.turnRepository.findActiveByCampaignId(await this.contextProvider.campaignId()),
    });
  }
}
