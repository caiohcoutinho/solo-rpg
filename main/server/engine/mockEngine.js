import fs from "node:fs/promises";
import path from "node:path";
import dotenv from "dotenv";
import { LoggerFactory } from "../service/loggerFactory.js";

class MockEngine {

  constructor(httpClient) {
    this.logger = LoggerFactory.createLogger("MockEngine");
  }

  async prompt(agent, options) {
    this.logger.log("debug", `[prompt] agent = ${JSON.stringify(agent)}`);
    const mockPath = path.join(process.cwd(), "mocks", agent + "Mock.md");
    const content = (await fs.readFile(mockPath, "utf8")).trim();
    this.logger.log("debug", `[prompt] content = ${JSON.stringify(content)}`);
    return content;
  }
}

export { MockEngine };