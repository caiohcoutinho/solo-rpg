import { LoggerFactory } from "../service/loggerFactory.js";
import { LlamaWrapper } from "./llamaWrapper.js";
import dotenv from "dotenv";

const env = dotenv.config();
const MODEL = process.env.GEMMA_MODEL;

class Phi4MiniEngine {

  constructor(llamaWrapper) {
    this.logger = LoggerFactory.createLogger("Phi4MiniEngine");
    this.llamaWrapper = llamaWrapper;
  }

  async init() {
    await this.llamaWrapper.init(MODEL);
  }

  async prompt({ max_completion_tokens, temperature, context, userText, outputJsonSchema }) {
    try {

      this.logger.log("debug", `[sendLlmRequest] userText = ${JSON.stringify(userText)}`);
      this.logger.log("debug", `[sendLlmRequest] context = ${JSON.stringify(context)}`);

      const systemPrompt = context.system?.join("\n");

      const chatHistory = [];
      chatHistory.push(context.misc?.map(i => i.content));
      chatHistory.push(context.location?.content);
      chatHistory.push(context.npcs?.map(i => i.content));
      chatHistory.push(context.turns?.map(i => i.content));

      return await this.llamaWrapper.prompt({ systemPrompt, chatHistory, outputJsonSchema, userText, temperature, max_completion_tokens });
    
    } catch (error) {
      this.logger.error("[sendLlmRequest] error: "+JSON.stringify(error));
      this.logger.error("[sendLlmRequest] error.stack: "+error.stack);
      throw error;
    }
  }
}

export { Phi4MiniEngine };