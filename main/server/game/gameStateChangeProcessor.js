import { LoggerFactory } from "../service/LoggerFactory.js";

export class GameStateChangeProcessor {
  constructor({
    taskEventProcessor,
    npcEventProcessor,
    quickActionPersistence,
  }) {
    this.logger = LoggerFactory.createLogger("GameStateChangeProcessor");
    this.taskEventProcessor = taskEventProcessor;
    this.npcEventProcessor = npcEventProcessor;
    this.quickActionPersistence = quickActionPersistence;
  }

  normalizeTarget(target, aggression = 4) {
    const normalized = 1 + 9 * Math.pow((target - 1) / 9, aggression);
    const result = Math.max(1, Math.min(10, Math.round(normalized)));
    this.logger.log("debug", `Normalized target: ${target} to ${result} with aggression: ${aggression}`);
    return result;
  }

  async process(advice, context, socket) {
    if (!advice) {
      return {
        quick_action_1: null,
        quick_action_2: null,
      };
    }

    await this.taskEventProcessor.process(advice.tasks, context);
    await this.npcEventProcessor.process(advice.npc_events, context, socket);

    const quick_action_1 = advice.quick_action_1;
    const quick_action_2 = advice.quick_action_2;

    quick_action_1.target = this.normalizeTarget(quick_action_1.target);
    quick_action_2.target = this.normalizeTarget(quick_action_2.target);

    this.logger.log("debug", `Quick action 1: ${JSON.stringify(quick_action_1)}`);
    this.logger.log("debug", `Quick action 2: ${JSON.stringify(quick_action_2)}`);

    return {
      quick_action_1,
      quick_action_2,
    };
  }
}
