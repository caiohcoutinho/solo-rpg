import fs from "node:fs/promises";
import path from "node:path";
import { LoggerFactory } from "../service/loggerFactory.js";

import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

import dotenv from "dotenv";
const env = dotenv.config();

class AzureWrapper {

  constructor(token, endpoint) {
    this.logger = LoggerFactory.createLogger("AzureWrapper");
    this.client = ModelClient(endpoint, new AzureKeyCredential(token));
  }

  async call(body){
    const response = await this.client.path("/chat/completions").post({ body });
    if (isUnexpected(response)) {
      this.logger.error(response);
      throw response.body.error.message;
    }
    return response.body.choices[0].message.content;
  }
}

export { AzureWrapper };