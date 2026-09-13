import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "node:http";
import path from "node:path";
import pg from "pg";

import { NpcRepository } from "./repository/npcRepository.js";
import { TurnRepository } from "./repository/turnRepository.js";
import { GameStateRepository } from "./repository/gameStateRepository.js";
import { QuickActionRepository } from "./repository/quickActionRepository.js";
import { LoreRepository } from "./repository/loreRepository.js";
import { EnemyRepository } from "./repository/enemyRepository.js";
import { CharacterSheetRepository } from "./repository/characterSheetRepository.js";
import { TaskRepository } from "./repository/taskRepository.js";
import { SceneRepository } from "./repository/sceneRepository.js";
import { LocationRepository } from "./repository/locationRepository.js";
import { LlmRequestLogsRepository } from "./repository/llmRequestLogsRepository.js";
import { ContextManagerLogsRepository } from "./repository/contextManagerLogsRepository.js";
import { CampaignRepository } from "./repository/campaignRepository.js";

import { AzureWrapper } from "./engine/azureWrapper.js";
import { LlamaWrapper } from "./engine/llamaWrapper.js";
import { ContextManager } from "./service/contextManager.js";

import { GeminiEngine } from "./engine/geminiEngine.js";
import { GemmaEngine } from "./engine/gemmaEngine.js";
import { GithubEngine } from "./engine/githubEngine.js";
import { Phi4MiniEngine } from "./engine/phi4MiniEngine.js";
import { MockEngine } from "./engine/mockEngine.js";

import { AgentHelper } from "./agents/agentHelper.js";
import { TransitionRouterAgent } from "./agents/transitionRouterAgent.js";
import { DialogueExpertAgent } from "./agents/dialogueExpertAgent.js";
import { GameStateChangeAgent } from "./agents/GameStateChangeAgent.js";
import { ExplorationExpertAgent } from "./agents/explorationExpertAgent.js";
import { SceneCreatorAgent } from "./agents/sceneCreatorAgent.js";

import { DiceRoller } from "./service/diceRoller.js";
import { RageRoller } from "./service/rageRoller.js";
import { Encryption } from "./service/encryption.js";
import { LoggerFactory } from "./service/loggerFactory.js";

import { WebSocketClientRegistry } from "./websocket/webSocketClientRegistry.js";
import { WebSocketMessenger } from "./websocket/webSocketMessenger.js";
import { WebSocketMessageRouter } from "./websocket/webSocketMessageRouter.js";
import { WebSocketServer } from "./websocket/webSocketServer.js";

import { ServerErrorHandler } from "./errors/serverErrorHandler.js";
import { GameContextProvider } from "./context/gameContextProvider.js";

import { GameStateProcessor } from "./processors/gameStateProcessor.js";
import { TurnProcessor } from "./processors/turnProcessor.js";
import { NpcProcessor } from "./processors/npcProcessor.js";
import { LoreProcessor } from "./processors/loreProcessor.js";
import { DiceRollProcessor } from "./processors/diceRollProcessor.js";
import { NoteProcessor } from "./processors/noteProcessor.js";
import { ChallengeProcessor } from "./processors/challengeProcessor.js";
import { QuickActionProcessor } from "./processors/quickActionProcessor.js";
import { ModeTransitionProcessor } from "./game/modeTransitionProcessor.js";
import { TaskEventProcessor } from "./game/taskEventProcessor.js";
import { NpcEventProcessor } from "./game/npcEventProcessor.js";
import { GameStateChangeProcessor } from "./game/gameStateChangeProcessor.js";
import { QuickActionPersistence } from "./game/quickActionPersistence.js";
import { GameTurnProcessor } from "./game/gameTurnProcessor.js";
import { ChatProcessor } from "./processors/chatProcessor.js";
import { SceneProcessor } from "./processors/sceneProcessor.js";
import { RageProcessor } from "./processors/rageProcessor.js";

dotenv.config();

const logger = LoggerFactory.createLogger("server");
const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST || "127.0.0.1";
const databaseUrl = process.env.DATABASE_URL || "postgres://solorpg:solorpg@localhost:5432/solorpg";

const pool = new pg.Pool({ connectionString: databaseUrl });
const server = http.createServer(app);

const repositories = {
  turn: new TurnRepository(pool),
  npc: new NpcRepository(pool),
  gameState: new GameStateRepository(pool),
  location: new LocationRepository(pool),
  quickAction: new QuickActionRepository(pool),
  lore: new LoreRepository(pool),
  enemy: new EnemyRepository(pool),
  characterSheet: new CharacterSheetRepository(pool),
  task: new TaskRepository(pool),
  llmRequestLogs: new LlmRequestLogsRepository(pool),
  campaign: new CampaignRepository(pool),
  contextManagerLogs: new ContextManagerLogsRepository(pool)
};

repositories.scene = new SceneRepository(pool, repositories.task);

const llamaWrapperPhi4Mini = new LlamaWrapper();
llamaWrapperPhi4Mini.init("phi-4-mini-instruct-abliterated-Q4_K_M.gguf");
const llamaWrapperGemma = new LlamaWrapper();
llamaWrapperGemma.init("Gemma3-UNCENSORED-1B-Q4_K_M.gguf");

const azureWrapper = new AzureWrapper(process.env.GITHUB_TOKEN, process.env.GITHUB_HOST);

const contextManager = new ContextManager(repositories.contextManagerLogs);

const engines = {
  phi4Mini: new Phi4MiniEngine(llamaWrapperPhi4Mini),
  gemini: new GeminiEngine(),
  gemma: new GemmaEngine(llamaWrapperGemma),
  github: new GithubEngine(azureWrapper),
  mock: new MockEngine()
}

const agentHelper = new AgentHelper({
  phi4MiniEngine: engines.phi4Mini,
  geminiEngine: engines.gemini,
  gemmaEngine: engines.gemma,
  githubEngine: engines.github,
  mockEngine: engines.mock,
  llmRequestLogsRepository: repositories.llmRequestLogs
});

const agents = {
  transitionRouter: new TransitionRouterAgent(agentHelper),
  dialogue: new DialogueExpertAgent(agentHelper),
  exploration: new ExplorationExpertAgent(agentHelper),
  gameStateChange: new GameStateChangeAgent(agentHelper),
  sceneCreator: new SceneCreatorAgent(agentHelper)
};

const registry = new WebSocketClientRegistry();
const messenger = new WebSocketMessenger(registry, Encryption.encodeWebSocketMessage);
const errorHandler = new ServerErrorHandler({
  messenger,
  turnRepository: repositories.turn,
  gameStateRepository: repositories.gameState,
});

const contextProvider = new GameContextProvider(repositories);

const diceRoller = new DiceRoller();
const rageRoller = new RageRoller(diceRoller);

const diceRollProcessor = new DiceRollProcessor({
  diceRoller, 
  turnRepository: repositories.turn,
  contextProvider,
  messenger,
  errorHandler,
});

const noteProcessor = new NoteProcessor({
  turnRepository: repositories.turn,
  contextProvider,
  messenger,
  errorHandler,
});

const challengeProcessor = new ChallengeProcessor({
  rageRoller,
  characterSheetRepository: repositories.characterSheet,
  turnRepository: repositories.turn,
  contextProvider,
  messenger,
  errorHandler,
});

const taskEventProcessor = new TaskEventProcessor({
  taskRepository: repositories.task,
  turnRepository: repositories.turn,
  messenger,
  contextProvider
});

const npcEventProcessor = new NpcEventProcessor({
  npcRepository: repositories.npc,
  turnRepository: repositories.turn,
  messenger,
});

const quickActionPersistence = new QuickActionPersistence({
  quickActionRepository: repositories.quickAction,
});

const gameStateChangeProcessor = new GameStateChangeProcessor({
  taskEventProcessor,
  npcEventProcessor,
  quickActionPersistence,
});

const modeTransitionProcessor = new ModeTransitionProcessor({
  transitionRouterAgent: agents.transitionRouter,
  gameStateRepository: repositories.gameState,
  turnRepository: repositories.turn,
  messenger,
});

const gameTurnProcessor = new GameTurnProcessor({
  contextProvider,
  contextManager,
  turnRepository: repositories.turn,
  taskRepository: repositories.task,
  npcRepository: repositories.npc,
  quickActionRepository: repositories.quickAction,
  agents,
  gameStateChangeProcessor,
  modeTransitionProcessor,
  quickActionPersistence,
  messenger,
  errorHandler,
});

const rageProcessor = new RageProcessor({
  diceRoller, rageRoller, 
  contextProvider,
  turnRepository: repositories.turn,
  messenger,
  errorHandler,
  contextProvider,
  errorHandler,
  characterSheetRepository: repositories.characterSheet
})

const chatProcessor = new ChatProcessor({
  contextProvider,
  diceRollProcessor,
  noteProcessor,
  gameTurnProcessor,
  errorHandler,
  rageProcessor
});

const sceneProcessor = new SceneProcessor({
  sceneRepository: repositories.scene,
  messenger,
  errorHandler,
  contextProvider,
  contextManager,
  sceneCreator: agents.sceneCreator,
  taskRepository: repositories.task
})

const quickActionProcessor = new QuickActionProcessor({
  challengeProcessor,
  chatProcessor,
  errorHandler,
});

const processors = {
  chat: chatProcessor,
  scene: sceneProcessor,
  quickAction: quickActionProcessor,
  gameState: new GameStateProcessor({
    gameStateRepository: repositories.gameState,
    messenger,
    errorHandler,
  }),
  turn: new TurnProcessor({
    turnRepository: repositories.turn,
    contextProvider,
    messenger,
    errorHandler,
  }),
  npc: new NpcProcessor({
    npcRepository: repositories.npc,
    messenger,
    errorHandler,
    contextProvider
  }),
  lore: new LoreProcessor({
    loreRepository: repositories.lore,
    messenger,
    errorHandler,
    contextProvider
  }),
  tasks: taskEventProcessor,
  rage: rageProcessor
};

const messageRouter = new WebSocketMessageRouter({
  processors,
  repositories,
  messenger,
});

const webSocketServer = new WebSocketServer({
  server,
  router: messageRouter,
  registry,
  encryption: Encryption,
  logger,
});

app.use(cors());
app.use(express.json());
app.use("/portraits", express.static(path.resolve("portraits")));

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("select 1");
    res.json({ ok: true, database: "connected" });
  } catch (error) {
    res.status(503).json({
      ok: false,
      database: "unavailable",
      error: error.message,
    });
  }
});

app.get("/api/npcs/active", async (_req, res) => res.json(await repositories.npc.findActiveByCampaignId(await contextProvider.campaignId())));
app.get("/api/npcs", async (_req, res) => res.json(await repositories.npc.findByCampaignId(await contextProvider.campaignId())));
app.get("/api/game-state", async (_req, res) => res.json(await repositories.gameState.findAll()));
app.get("/api/locations", async (_req, res) => res.json(await repositories.location.findByCampaignId(await contextProvider.campaignId())));
app.get("/api/lore", async (_req, res) => res.json(await repositories.lore.findByCampaignId(await contextProvider.campaignId())));
app.get("/api/enemies", async (_req, res) => res.json(await repositories.enemy.findByCampaignId(await contextProvider.campaignId())));
app.get("/api/tasks", async (_req, res) => res.json(await repositories.task.findBySceneId(await contextProvider.sceneId())));
app.get("/api/characters", async (_req, res) => res.json(await repositories.characterSheet.findByCampaignId(await contextProvider.campaignId())));
app.get("/api/campaign", async (_req, res) => res.json(await repositories.campaign.findById(await contextProvider.campaignId())));
app.get("/api/campaigns", async (_req, res) => res.json(await repositories.campaign.findAll()));
app.get("/api/turns", async (_req, res) => res.json(await contextProvider.turns()));

// Fetching scenes, we also need to add a field called tasks, with the resulting of calling taskRepository.findBySceneId
app.get("/api/scenes", async (_req, res) => {
  const scenes = await repositories.scene.findByCampaignId(await contextProvider.campaignId());
  for (const scene of scenes) {
    scene.tasks = await repositories.task.findBySceneId(scene.id);
  }
  res.json(scenes);
});

app.get("/api/scene", async (_req, res) => {
  const currentSceneId = await contextProvider.sceneId();
  logger.log("debug", `currentSceneId: ${currentSceneId}`);
  const scene = await repositories.scene.findById(currentSceneId);
  logger.log("debug", `scene: ${JSON.stringify(scene)}`);
  if ( scene ) {
    scene.tasks = await repositories.task.findBySceneId(scene?.id);
  }
  res.json(scene);
});

async function startServer() {
  webSocketServer.start();

  server.listen(port, host, () => {
    logger.info(`[startServer] Express API listening on http://${host}:${port}`);
  });
}

startServer().catch((error) => {
  logger.error(`[startServer] Failed to start server: ${error.message}`);
  logger.error(`[startServer] Stacktrace: ${error.stack}`);
  process.exit(1);
});