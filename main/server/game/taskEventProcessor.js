import { LoggerFactory } from "../service/LoggerFactory.js";

export class TaskEventProcessor {
  constructor({ taskRepository, turnRepository, sceneRepository, contextProvider, messenger }) {
    this.logger = LoggerFactory.createLogger("TaskEventProcessor");
    this.taskRepository = taskRepository;
    this.turnRepository = turnRepository;
    this.messenger = messenger;
    this.contextProvider = contextProvider;
  }

  async process(tasks, context) {
    const originalTasks = await this.contextProvider.getTasks();

    this.logger.log("debug", `[process] tasks = ${JSON.stringify(tasks)}`);
    this.logger.log("debug", `[process] originalTasks = ${JSON.stringify(originalTasks)}`);
    for (const taskId of Object.keys(tasks) || []) {
      const task = tasks[taskId];
      this.logger.log("debug", `[process] task = ${JSON.stringify(task)}`);

      const originalTask = originalTasks.find((item) => item.id === taskId);
      this.logger.log("debug", `[process] originalTask = ${JSON.stringify(originalTask)}`);

      if (!originalTask) {
        this.logger.log("warn", `[process] originalTask not found. task = ${JSON.stringify(task)}`);
        continue;
      }

      if (!task?.completed || originalTask?.completed) {
        this.logger.log("debug", `[process] no status change, nothing to do. task.completed = ${JSON.stringify(task?.completed)}, originalTask.completed = ${JSON.stringify(originalTask?.completed)}`);
        this.logger.info(`[process][${taskId}] Task still not completed...`);
        continue;
      }

      this.logger.log("debug", `[process] updating completed...`);
      await this.taskRepository.updateCompleted(taskId, true);

      this.logger.log("debug", `[process] creating new turn with completed task note...`);
      await this.turnRepository.saveTurn({
        context: context.textContext,
        result: `Completed task! Description: ${originalTask.goal}.`,
        isUserAction: false,
        isNote: true,
        resultMetadata: { source: "user" },
        scene_id: context.sceneId,
        campaign_id: context.campaignId,
      });

      const currentTasks = await this.taskRepository.findBySceneId(context.sceneId);
      this.logger.log("debug", `[process] currentTasks = ${JSON.stringify(currentTasks)}`);

      const closedTasks = currentTasks.filter((item) => item.completed);

      await this.turnRepository.saveTurn({
        context: context.textContext,
        result: `Tasks completed: ${closedTasks.length}/${currentTasks.length}.`,
        isUserAction: false,
        isNote: true,
        resultMetadata: { source: "user" },
        scene_id: context.sceneId,
        campaign_id: context.campaignId,
      });
    }

    const sceneId = await this.contextProvider.sceneId();
    const updatedTasks = await this.taskRepository.findBySceneId(sceneId);
    this.logger.log("debug", `[process] tasks = ${JSON.stringify(tasks)}`);

    this.messenger.broadcast({
      type: "scene.tasks",
      tasks: updatedTasks
    });

    this.messenger.broadcast({
      type: "llm.response",
      turns: await this.turnRepository.findActiveByCampaignId(context.campaignId),
    });
  }
}
