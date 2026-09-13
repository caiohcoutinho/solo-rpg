import fs from "node:fs/promises";
import path from "node:path";
import dotenv from "dotenv";
import { LoggerFactory } from "../service/loggerFactory.js";

const env = dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_HOST = process.env.GEMINI_HOST;
const GEMINI_MODEL = process.env.GEMINI_MODEL;

class GeminiEngine {

  constructor(httpClient) {
    this.logger = LoggerFactory.createLogger("GeminiEngine");
    this.httpClient = httpClient ? httpClient : async(url, body) => await fetch(url, body);
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

  extractResponseText(responseData) {
    try {
      this.logger.log("debug", "[extractResponseText] responseData = "+JSON.stringify(responseData));
      const choices = responseData?.choices || []
      if( choices === undefined || choices.length === 0) {
        return "";
      }
      const raw = choices[0]?.message?.content || "";
      const cleaned = raw.replace(/^```(?:json)?\s/i, "").replace(/\s*```$/, "").trim();
      this.logger.log("debug", "[extractResponseText] cleaned = "+JSON.stringify(cleaned));
      return cleaned;
    } catch (error) {
      this.logger.error("[extractResponseText] Failed to extract response text:", JSON.stringify(responseData));
      throw error;
    }
  }


  async sendLlmRequest(options) {
    const url = GEMINI_HOST + `/chat/completions`;
    this.logger.log("debug", "[sendLlmRequest] url = "+url);
    const headers = {
        "Content-Type": "application/json"
    };
    if (GEMINI_API_KEY) {
        headers["x-goog-api-key"] = GEMINI_API_KEY;
        headers["Authorization"] = `Bearer ${GEMINI_API_KEY}`;
    }

    let body = {
        temperature: options.temperature,
        max_completion_tokens: options.max_completion_tokens,
        model: GEMINI_MODEL
    }

    const messages = this.buildMessages(options.context);

    body.messages = messages;

    if(options.outputJsonSchema) {
        body.response_format = {
            type: "json_schema",
            json_schema: {
                strict: "true",
                schema: options.outputJsonSchema
            }
        }
    }

    this.logger.log("debug", `body = ${JSON.stringify(body)}`);

    const response = await this.httpClient(
        url,
        {
            method: "POST",
            headers: headers,
            body: JSON.stringify(body)
        }
    );

    const responseData = await response.json();

    if (!response.ok) {
        const message = responseData.error?.message || "OpenAi request failed.";
        this.logger.error("error in sendLlmRequest", responseData.error);
        this.logger.error(`error in sendLlmRequest ${JSON.stringify(responseData)}`);
        throw new Error(message);
    }

    this.logger.log("debug", "[sendLlmRequest] responseData = "+JSON.stringify(responseData));

    const responseText = await this.extractResponseText(responseData);

    this.logger.log("debug", "[sendLlmRequest] responseText = "+JSON.stringify(responseText));

    return responseText;
  }
}

export { GeminiEngine };