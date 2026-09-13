import fs from "node:fs/promises";
import path from "node:path";
import { LoggerFactory } from "../service/loggerFactory.js";
import { AzureWrapper } from "./azureWrapper.js";

import dotenv from "dotenv";
const env = dotenv.config();

const TOKEN = process.env["GITHUB_TOKEN"];
const MODEL = process.env["GITHUB_MODEL"];
const ENDPOINT = process.env["GITHUB_ENDPOINT"];

class GithubEngine {

  constructor(azureWrapper) {
    this.logger = LoggerFactory.createLogger("GithubEngine");
    this.azureWrapper = azureWrapper;
  }

  buildMessages({system = [], location = {}, npcs = [], turns = [], misc = []}) {
    const messages = [];
    system.forEach((item) => messages.push({role: "system", content: item.content}));
    misc.forEach((item) => messages.push({role: "user", content: item.content}));
    messages.push({role: "user", content: location.content});
    npcs.forEach((item) => messages.push({role: "user", content: item.content}));
    turns.forEach((item) => messages.push({role: item.role, content: item.content}));
    return messages;
  }

  async prompt({ max_completion_tokens, temperature, context, userText, outputJsonSchema }) {
    try {
      this.logger.info("[prompt] githubEngine prompt starting...");
      this.logger.log("debug", `[prompt] MODEL = ${JSON.stringify(MODEL)}`);

      const body = {
        temperature: temperature,
        max_tokens: max_completion_tokens,
        model: MODEL
      };

      const messages = this.buildMessages(context);

      body.messages = messages;

      if(outputJsonSchema) {
        body.response_format = {
            type: "json_schema",
            json_schema: {
                name: "json_schema_name",
                schema: outputJsonSchema
            }
        }
      }

      this.logger.log("debug", `body = ${JSON.stringify(body)}`);

      return await this.azureWrapper.call(body);
    
    } catch (error) {
      this.logger.error("[prompt] error: "+JSON.stringify(error));
      this.logger.error("[prompt] error.stack: "+error.stack);
      throw error;
    }
  }
}

export { GithubEngine };