import { LoggerFactory } from "../service/loggerFactory.js";

export class SceneProcessor {
  constructor({ sceneRepository, messenger, errorHandler, contextProvider, contextManager, sceneCreator, taskRepository }) {
    this.logger = LoggerFactory.createLogger('SceneProcessor');
    this.repository = sceneRepository;
    this.messenger = messenger;
    this.errorHandler = errorHandler;
    this.contextProvider = contextProvider;
    this.contextManager = contextManager;
    this.sceneCreator = sceneCreator;
    this.taskRepository = taskRepository;
  }

  async generate(scene, socket) {
    try {
      // User contextProvider to create context using ContextManager
      this.logger.log("debug", `generate scene: ${JSON.stringify(scene)}`);

      const campaign_id = await this.contextProvider.campaignId();
      const location = await this.contextProvider.getCurrentLocation();
      const npcs = await this.contextProvider.getActiveNpcs();
      const lore = await this.contextProvider.getActiveLore();

      const context = await this.sceneCreator.buildContext(this.contextManager, { location, npcs, lore, userText: scene.setup });

      this.logger.log("debug", `context: ${JSON.stringify(context)}`);
      const generatedScene = await this.sceneCreator.sendLlmRequest(context, scene);

      this.logger.log("debug", `generated_scene: ${JSON.stringify(generatedScene)}`);
      this.messenger.broadcast({
        type: "scene.generated",
        generated_scene: generatedScene,
      });
    } catch (error) {
      this.errorHandler.handle(error, {
        stage: "scene.generate",
        scene: scene,
      }, socket);
    }
  }

  async delete(scene, socket) {
    try {
      this.logger.log("debug", `delete scene: ${JSON.stringify(scene)}`);
      const result = await this.repository.delete(scene.id);

      this.logger.log("debug", `delete result: ${JSON.stringify(result)}`);
      if (!result) {
        throw new Error(`scene not found: ${scene.id}`);
      }

      this.messenger.broadcast({
        type: "scene",
        scenes: await this.repository.findByCampaignId(scene.campaign_id),
      });
    } catch (error) {
      this.errorHandler.handle(error, {
        stage: "scene.delete",
        sceneId: scene.id,
      }, socket);
    }
  }

  async upsert(scene, socket) {
    try {
      this.logger.log("debug", `upsert scene: ${JSON.stringify(scene)}`);
      const campaign_id = await this.contextProvider.campaignId();
      this.logger.log("debug", `campaign_id: ${JSON.stringify(campaign_id)}`);

      const newScene = scene?.id ?
        await this.repository.update(scene.id, {
          campaign_id,
          name: scene.name,
          setup: scene.setup,
          escalation: scene.escalation,
          payoff: scene.payoff
        }) :
        await this.repository.insert({ campaign_id, ...scene });

      this.logger.log("debug", `new scene: ${JSON.stringify(newScene)}`);

      if (!newScene) {
        throw new Error(`scene not found: ${JSON.stringify(scene)}`);
      }

      for (const i in scene.tasks) {
        const task = scene.tasks[i];
        this.logger.log("debug", `task: ${JSON.stringify(task)}`);

        const taskObject = {
          id: task.id,
          scene_id: newScene.id,
          goal: task.goal,
          resolution: task.resolution,
          revealed: task.revealed,
          completed: task.completed
        };
        this.logger.log("debug", `taskObject: ${JSON.stringify(taskObject)}`);

        const taskResult = taskObject.id ?
          await this.taskRepository.update(taskObject.id, taskObject) :
          await this.taskRepository.insert(taskObject)
      }

      this.messenger.broadcast({
        type: "scene",
        scenes: await this.repository.findByCampaignId(campaign_id),
      });
    } catch (error) {
      this.errorHandler.handle(error, {
        stage: "scene.update",
        sceneId: scene.id,
      }, socket);
    }
  }
}
