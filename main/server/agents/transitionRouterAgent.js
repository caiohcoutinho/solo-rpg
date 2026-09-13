import fs from "node:fs/promises";
import path from "node:path";
import { LoggerFactory } from "../service/loggerFactory.js";

import dotenv from "dotenv";
const env = dotenv.config();

const outputJsonSchema = {
  name: "transition_suggestion",
  strict: true,
  schema: {
    type: "object",
    properties: {
      suggestedMode: {
        type: "string",
        enum: [
          "exploration",
          "dialogue",
          "dungeon",
          "combat"
        ]
      },
      confidenceScore: {
        type: "number",
        minimum: 0,
        maximum: 1
      }
    },
    required: [
      "suggestedMode",
      "confidenceScore"
    ],
    additionalProperties: false
  }
};

class TransitionRouterAgent {
  constructor(agentHelper) {
    this.agentHelper = agentHelper;
    this.logger = LoggerFactory.createLogger("TransitionRouterAgent");
  }

  getOutputJsonSchema() {
    return outputJsonSchema;
  }

  async getInstructions() {
    if (!this.instructions) {
      this.instructions = (await fs.readFile(path.resolve("prompts/TransitionRouterInstructions.md"), "utf8")).trim();
    }
    return this.instructions;
  }

  async buildContext(contextManager, { lore, turns, npcs, location, userText, currentMode }) {
    return contextManager.buildContext({
        system: [await this.getInstructions()],
        misc: [],
        location: location,
        npcs: npcs,
        turns: turns
      });
  }

  async sendLlmRequest(context, userText) {
    const options = {
      max_completion_tokens: 600,
      temperature: 0.6,
      context: context,
      userText,
      outputJsonSchema
    };

    this.logger.log("debug", "sendLlmRequest options = " + JSON.stringify(options));
    const result = this.agentHelper.sendLlmRequest("TransitionRouterAgent", process.env.AGENT_MODEL_TRANSITION_ROUTER, options);
    this.logger.log("debug", "sendLlmRequest", "result = " + JSON.stringify(result));
    return result;
  }
}

export { TransitionRouterAgent };
