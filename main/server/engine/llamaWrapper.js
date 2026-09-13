import path from "node:path";
import { LoggerFactory } from "../service/loggerFactory.js";
import { getLlama, LlamaChatSession } from "node-llama-cpp";

class LlamaWrapper {

    constructor() {
        this.logger = LoggerFactory.createLogger("LlamaWrapper");
    }

    async init(model) {
        this.llama = await getLlama();
        const __dirname = process.cwd()
        this.model = await this.llama.loadModel({
            modelPath: path.join(__dirname, "models", model)
        });
    }

    async prompt({ systemPrompt, chatHistory, outputJsonSchema, userText, temperature, max_completion_tokens }) {

        if (!this.model) {
            throw new Error("Model is not loaded. Please call init() first.");
        }

        const modelContext = await this.model.createContext();

        const session = new LlamaChatSession({
            contextSequence: modelContext.getSequence(),
            systemPrompt: systemPrompt
        })

        session.setChatHistory(chatHistory);

        if (outputJsonSchema) {

            const grammar = await this.llama.createGrammarForJsonSchema(outputJsonSchema);

            const promptResult = await session.prompt(userText, { grammar, temperature, maxTokens: max_completion_tokens });

            const cleaned = promptResult
                .replace(/^```(?:json)?\s*/i, "")
                .replace(/\s*```$/, "");

            return grammar.parse(cleaned);
        }

        return await session.prompt(userText);
    }
}

export { LlamaWrapper };