import { LoggerFactory } from "../service/loggerFactory.js";

export class ChallengeProcessor {
  constructor({
    rageRoller,
    characterSheetRepository,
    turnRepository,
    contextProvider,
    messenger,
    errorHandler,
  }) {
    this.rageRoller = rageRoller;
    this.characterSheetRepository = characterSheetRepository;
    this.turnRepository = turnRepository;
    this.contextProvider = contextProvider;
    this.messenger = messenger;
    this.errorHandler = errorHandler;
    this.logger = LoggerFactory.createLogger("ChallengeProcessor");
  }

  async process(message, socket) {
    try {
      this.logger.log("debug", `message: ${JSON.stringify(message)}`);

      const characterSheetId = await this.contextProvider.mainCharacterId();
      this.logger.log("debug", `characterSheetId: ${characterSheetId}`);

      if (!characterSheetId) {
        throw new Error("Main character is not configured.");
      }

      const characterSheet =
        await this.characterSheetRepository.findById(characterSheetId);
      this.logger.log("debug", `characterSheet: ${JSON.stringify(characterSheet)}`);

      const dicePool =
        characterSheet[message.attribute] + characterSheet[message.ability];
      this.logger.log("debug", `dicePool: ${JSON.stringify(dicePool)}`);

      let target;
      try {
        target = parseInt(message?.target || "1");
      } catch(error){
        this.logger.error(`Error parsing target: ${JSON.stringify(message?.target)}`, error);  
        target = 1;
      }
      this.logger.log("debug", `target: ${JSON.stringify(target)}`);

      const rageRoll = this.rageRoller.roll({ dice: dicePool, rage: characterSheet["rage"], target });
      this.logger.log("debug", `rageRoll: ${JSON.stringify(rageRoll)}`);

      this.logger.log("debug", `result: ${JSON.stringify(rageRoll.result)}`);

      await this.turnRepository.saveTurn({
        context: null,
        result: `${rageRoll.result}! Target: ${target}, Diff: ${rageRoll.difficulty}, Regular: ${rageRoll.rolls?.join(", ")}, Rage: ${rageRoll.rageRolls?.join(", ")}`,
        isUserAction: true,
        isNote: true,
        resultMetadata: { source: "user" },
        campaign_id: await this.contextProvider.campaignId(),
      });

      this.messenger.broadcast({
        type: "llm.response",
        turns: await this.turnRepository.findActiveByCampaignId(await this.contextProvider.campaignId()),
      });

      return rageRoll.successes < target
        ? message.cost
        : message.reward;
    } catch (error) {
      this.errorHandler.handle(error, {
        stage: "quick_action.challenge",
        quickActionMessage: message,
      }, socket);
      return null;
    }
  }
}
