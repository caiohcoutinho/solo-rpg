import fs from "node:fs/promises";
import path from "node:path";
import { LoggerFactory } from "../service/loggerFactory.js";

import dotenv from "dotenv";
const env = dotenv.config();

const outputJsonSchema = {
  name: "scene_creator_result",
  schema: {
    type: "object",
    properties: {
      scene_setup: {
        type: "string"
      },
      scene_escalation: {
        type: "string"
      },
      scene_payoff: {
        type: "string"
      },
      tasks: {
        type: "object",
        properties: {
          task1: {
            type: "object",
            properties: { goal: { type: "string" }, resolution: { type: "string" } },
            required: ["goal", "resolution"], additionalProperties: false
          },
          task2: {
            type: "object",
            properties: { goal: { type: "string" }, resolution: { type: "string" } },
            required: ["goal", "resolution"], additionalProperties: false
          },
          task3: {
            type: "object",
            properties: { goal: { type: "string" }, resolution: { type: "string" } },
            required: ["goal", "resolution"], additionalProperties: false
          },
        },
        required: ["task1", "task2", "task3"],
        additionalProperties: false
      }
    },
    required: [
      "scene_setup",
      "scene_escalation",
      "scene_payoff",
      "tasks"
    ],
    additionalProperties: false
  }
};

class SceneCreatorAgent {

  constructor(agentHelper) {
    this.agentHelper = agentHelper;
    this.logger = LoggerFactory.createLogger("SceneCreatorAgent");
  }

  async getInstructions() {
    if (!this.instructions) {
      this.instructions = (await fs.readFile(path.resolve("prompts/SceneCreatorAgentInstructions.md"), "utf8")).trim();
    }
    return this.instructions;
  }

  async buildContext(contextManager, { lore, npcs, location, userText }) {
    return contextManager.buildContext({
        system: [await this.getInstructions()],
        misc: lore,
        location: location,
        npcs: npcs,
        turns: [{
          is_user_action: true,
          result: userText
        }]
    });
  }

  async sendLlmRequest(context, userText) {
    const options = {
      max_completion_tokens: 1500,
      temperature: 0.8,
      context: context,
      userText,
      outputJsonSchema: outputJsonSchema.schema
    };

    this.logger.log("debug", "[sendLlmRequest] options = "+JSON.stringify(options));
    const responseData = await this.agentHelper.sendLlmRequest("SceneCreatorAgent", process.env.AGENT_MODEL_SCENE_CREATOR_AGENT, options);
    this.logger.log("debug", "[sendLlmRequest] responseData = "+JSON.stringify(responseData));

    return JSON.parse(responseData);
  }
}

export { SceneCreatorAgent };
