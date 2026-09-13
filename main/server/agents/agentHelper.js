import fs from "node:fs/promises";
import path from "node:path";
import { LoggerFactory } from "../service/loggerFactory.js";
import { LlmRequestLogsRepository } from "../repository/llmRequestLogsRepository.js";
import { getLlama, LlamaChatSession } from "node-llama-cpp";
import { fileURLToPath } from "url";

import { Phi4MiniEngine } from "../engine/phi4MiniEngine.js";
import { GeminiEngine } from "../engine/geminiEngine.js";
import { GemmaEngine } from "../engine/gemmaEngine.js";
import { GithubEngine } from "../engine/githubEngine.js";

import dotenv from "dotenv";
const env = dotenv.config();

const PHI_4_MINI = "phi_4_mini";
const GEMINI = "gemini";
const GEMMA = "gemma";
const GITHUB = "github";
const MOCK = "mock";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class AgentHelper {

  constructor({phi4MiniEngine, geminiEngine, gemmaEngine, githubEngine, mockEngine, llmRequestLogsRepository}) {
    this.logger = LoggerFactory.createLogger("AgentHelper");
    this.phi4MiniEngine = phi4MiniEngine;
    this.geminiEngine = geminiEngine;
    this.gemmaEngine = gemmaEngine;
    this.githubEngine = githubEngine;
    this.mockEngine = mockEngine;
    this.llmRequestLogsRepository = llmRequestLogsRepository;
  }

  async callModel(agent, model, options){
    this.logger.log("debug", `[callModel] agent = ${JSON.stringify(agent)}`);
    this.logger.log("debug", `[callModel] model = ${JSON.stringify(model)}`);
    let result;
    if(model == GEMINI){
      result = await this.geminiEngine.sendLlmRequest(options);
    } else if (model == GEMMA){
      result = await this.gemmaEngine.prompt(options);
    } else if (model == GITHUB){
      result = await this.githubEngine.prompt(options);
    } else if (model == PHI_4_MINI){
      result = await this.phi4MiniEngine.prompt(options);
    } else if (model == MOCK){
      result = await this.mockEngine.prompt(agent, options);
    }

    this.logger.log("debug", `[callModel] result = ${JSON.stringify(result)}`);
    this.isDone = true;
    return result;
  }

  async sendLlmRequest(agent, model, options) {

    let response = null;

    let startTime = Date.now();

    const log = {
      duration: 0,
      agent: agent,
      model: model,
      max_tokens: options.max_completion_tokens,
      context_size: JSON.stringify(options.context).length
    };

    this.isDone = false;

    try {
      this.logger.info(`[sendLlmRequest][${agent}][${model}] Sending request to model... `);
      const frames = ["-", "\\", "|", "/"];
      let i = 0;
      
      let start = Date.now();

      // Ticker loop
      const ticker = (async () => {
        while (!this.isDone && i < 600) {
          process.stdout.write(`\r${frames[i++ % frames.length]} Waiting for response for ${Math.floor((Date.now() - start) / 1000)}s `);
          await sleep(100);
        }
      })();

      const result = await Promise.all([this.callModel(agent, model, options), ticker]);
      response = result[0];
      this.logger.log("debug", `[sendLlmRequest] response = ${JSON.stringify(response)}`);
      
      this.logger.info(`[sendLlmRequest][${agent}][${model}] Response received from model... `);
    } catch (error) {
      this.isDone = true;
      this.logger.error("[sendLlmRequest] error: "+JSON.stringify(error));
      this.logger.error("[sendLlmRequest] error.stack: "+error.stack);
      throw error;
    } finally {
      process.stdout.write("\r\x1b[K"); // Clear the line
      this.logger.info(`[sendLlmRequest][${agent}][${model}] Saving llm request log... `);
      log.duration = Date.now() - startTime;
      await this.llmRequestLogsRepository.insert(log);
    }

    this.logger.info(`[sendLlmRequest][${agent}][${model}] DONE`);

    this.logger.log("debug", `[sendLlmRequest] response = ${JSON.stringify(response)}`);
    return response;
  }
}

export { AgentHelper };