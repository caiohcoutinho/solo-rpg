import { LoggerFactory } from "../service/LoggerFactory.js";

export class GameTurnProcessor {
  constructor({
    contextProvider,
    contextManager,
    turnRepository,
    taskRepository,
    npcRepository,
    agents,
    gameStateChangeProcessor,
    modeTransitionProcessor,
    quickActionRepository,
    messenger,
    errorHandler,
  }) {
    this.contextProvider = contextProvider;
    this.contextManager = contextManager;
    this.turnRepository = turnRepository;
    this.taskRepository = taskRepository;
    this.npcRepository = npcRepository;
    this.agents = agents;
    this.gameStateChangeProcessor = gameStateChangeProcessor;
    this.modeTransitionProcessor = modeTransitionProcessor;
    this.quickActionRepository = quickActionRepository;
    this.messenger = messenger;
    this.errorHandler = errorHandler;
    this.logger = LoggerFactory.createLogger("GameTurnProcessor");
  }

  async process(text, socket) {
    try {
      let context = await this.contextProvider.getCurrentContext();
      const turns = context.contextTurns;
      const textContext = this.toTextContext(turns);

      await this.turnRepository.saveTurn({
        context: textContext,
        result: text,
        isUserAction: true,
        isNote: false,
        resultMetadata: { source: "user" },
        scene_id: context.sceneId,
        campaign_id: context.campaignId,
      });

      //const currentMode = await this.transition(context, text);
      const currentMode = await this.contextProvider.mode();

      context = await this.contextProvider.getCurrentContext();
      context.textContext = textContext;

      let llmResult = { content: null };
      let advice = null;

      const agentContext = {
        tasks: context.tasks,
        lore: context.activeLore,
        turns: context.contextTurns,
        npcs: context.activeNpcs,
        location: context.location,
        userText: text
      };

      this.logger.log("debug", `[process] agentContext = ${JSON.stringify(agentContext)}`);

      if (currentMode === "dialogue") {
        const theContext = await this.agents.dialogue.buildContext(this.contextManager, agentContext);
        llmResult.content = await this.agents.dialogue.sendLlmRequest(theContext, text);
      } else {
        const theContext = await this.agents.exploration.buildContext(this.contextManager, agentContext);
        llmResult.content = await this.agents.exploration.sendLlmRequest(theContext, text);

        agentContext.turns = [
          ...agentContext.turns,
          { result: llmResult.content, is_user_action: true }
        ];
        const gameStateChangeContext = await this.agents.gameStateChange.buildContext(this.contextManager, agentContext);

        this.logger.log("debug", `[process] gameStateChangeContext = ${JSON.stringify(gameStateChangeContext)}`);

        advice = await this.agents.gameStateChange.sendLlmRequest(agentContext.tasks, gameStateChangeContext, llmResult.content);

      }

      const newTurn = await this.turnRepository.saveTurn({
        context: `${textContext}\nYOU: ${text}`,
        result: this.limitResponse(llmResult.content),
        isUserAction: false,
        scene_id: context.sceneId,
        resultMetadata: { source: "llm" },
        campaign_id: context.campaignId,
      });

      if (currentMode === "exploration") {
        const actions = await this.gameStateChangeProcessor.process(
          advice,
          context,
          socket
        );

        this.logger.log("debug", `[process] actions = ${JSON.stringify(actions)}`);

        try {
          await this.quickActionRepository.insert({
            ...actions.quick_action_1,
            turnId: newTurn.id,
          });

          await this.quickActionRepository.insert({
            ...actions.quick_action_2,
            turnId: newTurn.id,
          });
        } catch (error) {
          console.error("Error creating quick actions:", error);
        }
      }

      this.messenger.broadcast({
        type: "llm.response",
        turns: await this.turnRepository.findActiveByCampaignId(context.campaignId),
      });
    } catch (error) {
      this.errorHandler.handle(error, { stage: "chat", text }, socket);
    }
  }

  async transition(context, text) {
    try {
      return await this.modeTransitionProcessor.process({
        activeLore: context.activeLore,
        contextTurns: context.contextTurns,
        activeNpcs: context.activeNpcs,
        location: context.location,
        text,
        mode: context.mode,
        campaignId: context.campaignId,
        sceneId: context.sceneId,
      });
    } catch (error) {
      console.error(`TransitionRouter Failed! ${error.message}`);
      return context.mode;
    }
  }

  toTextContext(turns) {
    return turns
      .map((turn) => (turn.isUserAction ? "YOU" : "LLM") + ": " + turn.result)
      .join("\n");
  }

  limitResponse(content) {
    const raw = content || "No response from the LLM.";
    return raw.length > 3000 ? raw.slice(0, 3000) : raw;
  }
}
