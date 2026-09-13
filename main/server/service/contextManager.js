import { LoggerFactory } from "./loggerFactory.js";

const MAX_CONTEXT_LENGTH = 60000;
const MAX_SYSTEM_LENGTH = MAX_CONTEXT_LENGTH * 0.25;
const MAX_WORLD_LORE_LENGTH = MAX_CONTEXT_LENGTH * 0;
const MAX_ACTIVE_SCENE_STATE_LENGTH = MAX_CONTEXT_LENGTH * 0.25;
const MAX_RECENT_TURNS_LENGTH = MAX_CONTEXT_LENGTH * 0.4;
const MAX_MISC_LENGTH = MAX_CONTEXT_LENGTH * 0.1;

class ContextManager {
  constructor(contextManagerLogsRepository) {
    this.logger = LoggerFactory.createLogger("ContextManager");
    this.contextManagerLogsRepository = contextManagerLogsRepository;
  }

  addItemsWithinThreshold(items, threshold, roleTransform, contentTransform) {
    let result = [];
    let sum = 0;
    for (let item of items) {

        this.logger.log("debug", `item = ${JSON.stringify(item)}`);

        let role = roleTransform(item);
        this.logger.log("debug", `role = ${JSON.stringify(role)}`);

        let content = contentTransform(item);
        this.logger.log("debug", `content = ${JSON.stringify(content)}`);

        let itemLenght = content.length;

        if (sum + itemLenght <= threshold) {
            sum += itemLenght;
            result.push( {role, content} );   
            this.logger.log("debug", `[addItemsWithinThreshold] Item added. sum = ${sum}, itemLenght = ${itemLenght}, threshold = ${threshold}, content = ${JSON.stringify(content)}`);
            continue;
        } else {
            this.logger.log("debug", `[addItemsWithinThreshold] Item skipped. sum = ${sum}, itemLenght = ${itemLenght}, threshold = ${threshold}, content = ${JSON.stringify(content)}`);
        }
    }
    return { sum, result };
}

  buildContext({system = [], location = {}, npcs = [], turns = [], misc = [], tasks = []}){

    //this.logger.log("debug", `turns = ${JSON.stringify(turns)}`);

    let contextManagerLog = {
        system_element_count: system.length + tasks.length,
        lore_element_count: 0,
        active_scene_element_count: npcs.length + (location?.name ? 1 : 0),
        recent_turns_element_count: turns.length,
        misc_element_count: misc.length
    }

    const systemText = JSON.stringify(system);
    const tasksText = JSON.stringify(tasks);
    const worldLoreText = JSON.stringify(location);
    const activeSceneStateText = JSON.stringify(npcs)
    const recentTurnsText = JSON.stringify(turns);
    const miscText = JSON.stringify(misc);

    contextManagerLog = {
        ...contextManagerLog,
        system_actual_size: systemText.length + tasksText.length,
        lore_actual_size: worldLoreText.length,
        active_scene_actual_size: activeSceneStateText.length,
        recent_turns_actual_size: recentTurnsText.length,
        misc_actual_size: miscText.length
    }

    const transformedTasks = tasks.map((task) => {
        return `TaskId: ${task.id} . Task Goal: ${task.goal}`
    });

    const systemResult = this.addItemsWithinThreshold([...system, ...transformedTasks], MAX_SYSTEM_LENGTH, (item) => "system", (item) => item);
    
    const miscResult = this.addItemsWithinThreshold(misc, MAX_MISC_LENGTH, (item) => "user", (item) => `Lore name: ${item.name}, Description: ${item.description}`);

    let locationMessage = {
        role: "",
        content: ""
    };

    if(location?.name) {
        locationMessage = {
            role: "user",
            content: `Location name: ${location.name}, Background: ${location.background}`
        };
    }

    const npcsResult = this.addItemsWithinThreshold(npcs, MAX_ACTIVE_SCENE_STATE_LENGTH - locationMessage.content.length, (item) => "user", (item) => `NPC name: ${item.name}, Background: ${item.background}`);
    const turnsResult = this.addItemsWithinThreshold(turns, MAX_RECENT_TURNS_LENGTH, (item) => item.is_user_action ? "user" : "assistant", (item) => item.result);

    contextManagerLog = {
        ...contextManagerLog,
        system_clipped_size: systemResult.sum,
        lore_clipped_size: 0,
        active_scene_clipped_size: npcsResult.sum + locationMessage.content.length,
        recent_turns_clipped_size: turnsResult.sum,
        misc_clipped_size: miscResult.sum
    }

    try {
        this.contextManagerLogsRepository.insert(contextManagerLog);
    } catch (e) {
        this.logger.error(e);
    }
    
    return {
        system: systemResult.result,
        misc: miscResult.result,
        location: locationMessage,
        npcs: npcsResult.result,
        turns: turnsResult.result
    };
  }
}

export { ContextManager };