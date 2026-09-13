import fs from "node:fs/promises";
import path from "node:path";
import { LoggerFactory } from "../service/loggerFactory.js";

import dotenv from "dotenv";
const env = dotenv.config();

class DialogueExpertAgent {

  constructor(agentHelper) {
    this.agentHelper = agentHelper;
    this.logger = LoggerFactory.createLogger("DialogueExpertAgent");
  }

  async getInstructions() {
    if (!this.instructions) {
      this.instructions = (await fs.readFile(path.resolve("prompts/DialogueExpertInstructions.md"), "utf8")).trim();
    }
    return this.instructions;
  }

  async buildContext(contextManager, { lore, turns, npcs, location }) {
    return contextManager.buildContext({
        system: [await this.getInstructions()],
        misc: lore,
        location: location,
        npcs: npcs,
        turns: turns
    });
  }

  async sendLlmRequest(context, userText) {
    const options = {
      max_completion_tokens: 3000,
      temperature: 0.8,
      context: context,
      userText
    };

    this.logger.log("debug", "[sendLlmRequest] options = "+JSON.stringify(options));
    const responseData = await this.agentHelper.sendLlmRequest("DialogueExpertAgent", process.env.AGENT_MODEL_DIALOGUE_EXPERT_AGENT, options);
    this.logger.log("debug", "[sendLlmRequest] responseData = "+JSON.stringify(responseData));

    return responseData;
  }
}

export { DialogueExpertAgent };
