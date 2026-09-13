import fs from "node:fs/promises";
import path from "node:path";
import { LoggerFactory } from "../service/loggerFactory.js";

import dotenv from "dotenv";
const env = dotenv.config();

const quick_action_schema = {
  type: "object",
  properties: {
    description: { type: "string" },
    challenge: {
      type: "object",
      properties: {
        reasoning: {
          type: "string"
        },
        attribute: {
          type: "string",
          enum: [
            "strength", "dexterity", "stamina",
            "charisma", "manipulation", "composure",
            "intelligence", "wits", "resolve"
          ]
        },
        ability: {
          type: "string",
          enum: [
            // Talents
            "athletics", "brawl", "craft", "driving", "firearms", "larceny", "melee", "stealth", "survival",

            // Skills
            "animal_ken", "etiquette", "insight", "intimidation", "leadership", "performance", "persuasion", "streetwise", "subterfuge",

            // Knowledges
            "academics", "awareness", "finance", "investigation", "medicine", "occult", "politics", "science", "technology"
          ]
        },
        reward: {
          type: "string"
        },
        cost: {
          type: "string"
        },
        target: {
          type: "number",
          enum: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
        }
      },
      required: [
        "reasoning",
        "attribute",
        "ability",
        "reward",
        "cost",
        "target"
      ],
      additionalProperties: false
    }
  },
  required: ["description"],
  additionalProperties: false
}

const outputJsonSchema = {
  name: "game_state_change_advice_result",
  schema: {
    type: "object",
    properties: {
      quick_action_1: quick_action_schema,
      quick_action_2: quick_action_schema,
      tasks: {
        type: "object",
        items: {
          // To be populated by the processor
          required: [],
          additionalProperties: false
        }
      }
    },
    required: [
      "quick_action_1",
      "quick_action_2",
      "tasks"
    ],
    additionalProperties: false
  }
};

class GameStateChangeAgent {
  constructor(agentHelper) {
    this.logger = LoggerFactory.createLogger("GameStateChangeAgent");
    this.agentHelper = agentHelper;
  }

  getOutputJsonSchema() {
    return outputJsonSchema;
  }

  async getInstructions() {
    if (!this.instructions) {
      this.instructions = (await fs.readFile(path.resolve("prompts/GameStateChangeAgentInstructions.md"), "utf8")).trim();
    }
    return this.instructions;
  }

  async buildContext(contextManager, { lore, turns, npcs, tasks, location, userText }) {
    this.logger.log("debug", `[buildContext] tasks = ${JSON.stringify(tasks)}`);
    const transformedTasks = tasks.filter(t => t.revealed && !t.completed).map((task) => {
      return {
        role: 'system',
        content: `TaskId: ${task.id} . Task Goal: ${task.goal}`
      }
    });
    this.logger.log("debug", `[buildContext] transformedTasks = ${JSON.stringify(transformedTasks)}`);
    const result = contextManager.buildContext({
      system: [await this.getInstructions()],
      misc: lore,
      location: location,
      npcs: npcs,
      turns: turns,
      tasks: transformedTasks
    });
    this.logger.log("debug", `[buildContext] result = ${JSON.stringify(result)}`);
    return result;
  }

  createTasksSchema(tasks) {
    const properties = Object.fromEntries(
      tasks.map(task => [
        task.id,
        {
          type: "object",
          properties: {
            description: {
              type: "string",
              enum: [task.goal]
            },
            completed: {
              type: "boolean"
            }
          },
          required: ["description", "completed"],
          additionalProperties: false
        }
      ])
    );


    const result = {
      type: "object",
      properties,
      required: tasks.map(task => task.id),
      additionalProperties: false
    };
    this.logger.log("debug", `[createTasksSchema] result = ${JSON.stringify(result)}`);
    return result;
  }


  async sendLlmRequest(tasks, context, userText) {
    this.logger.log("debug", "[sendLlmRequest] starting...");

    const schema = { ...outputJsonSchema.schema };
    schema.properties.tasks = this.createTasksSchema(tasks);

    this.logger.log("debug", "[sendLlmRequest] schema = " + JSON.stringify(schema));

    const options = {
      max_completion_tokens: 600,
      temperature: 0.8,
      context: context,
      userText,
      outputJsonSchema: schema
    };

    this.logger.log("debug", "[sendLlmRequest] context = " + JSON.stringify(context));
    this.logger.log("debug", "[sendLlmRequest] options = " + JSON.stringify(options));
    const responseData = await this.agentHelper.sendLlmRequest("GameStateChangeAgent", process.env.AGENT_MODEL_GAME_STATE_CHANGE_EXPERT, options);
    this.logger.log("debug", "[sendLlmRequest] responseData = " + JSON.stringify(responseData));

    return JSON.parse(responseData);
  }
}

export { GameStateChangeAgent };

