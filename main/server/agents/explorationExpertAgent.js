import fs from "node:fs/promises";
import path from "node:path";
import { LoggerFactory } from "../service/loggerFactory.js";

import dotenv from "dotenv";
const env = dotenv.config();

class ExplorationExpertAgent {
  constructor(agentHelper) {
    this.logger = LoggerFactory.createLogger("ExplorationExpertAgent");
    this.agentHelper = agentHelper;
  }

  async getInstructions() {
    if (!this.instructions) {
      this.instructions = (await fs.readFile(path.resolve("prompts/ExplorationExpertInstructions.md"), "utf8")).trim();
    }
    return this.instructions;
  }

  async buildContext(contextManager, { lore, tasks, turns, npcs, location }) {
    return contextManager.buildContext({
        system: [await this.getInstructions()],
        tasks: this.createTaskMessages(tasks),
        misc: lore,
        location: location,
        npcs: npcs,
        turns: turns
    });
  }

  createTaskMessages(tasks){
    return tasks.map((task) => {
      return {
        role: "system",
        content: `TaskId: ${task.id} . Task Description: ${task.goal}`
      }
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
    const responseData = await this.agentHelper.sendLlmRequest("ExplorationExpertAgent", process.env.AGENT_MODEL_EXPLORATION_EXPERT_AGENT, options);
    this.logger.log("debug", "[sendLlmRequest] responseData = "+JSON.stringify(responseData));

    return responseData;
  }
}

export { ExplorationExpertAgent };
