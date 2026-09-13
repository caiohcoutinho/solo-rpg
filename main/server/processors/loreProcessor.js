import { LoggerFactory } from "../service/loggerFactory.js";

export class LoreProcessor {
  constructor({ loreRepository, messenger, errorHandler, contextProvider }) {
    this.logger = LoggerFactory.createLogger('LoreProcessor');
    this.repository = loreRepository;
    this.messenger = messenger;
    this.errorHandler = errorHandler;
    this.contextProvider = contextProvider;
  }

  async delete(lore, socket){
    try {
      this.logger.log("debug", `delete lore: ${JSON.stringify(lore)}`);
      const result = await this.repository.delete(lore.id);

      this.logger.log("debug", `delete result: ${JSON.stringify(result)}`);
      if (!result) {
        throw new Error(`Lore not found: ${lore.id}`);
      }

      this.messenger.broadcast({
        type: "lore",
        lore: await this.repository.findByCampaignId(lore.campaign_id),
      });
    } catch (error) {
      this.errorHandler.handle(error, {
        stage: "lore.delete",
        loreId: lore.id,
      }, socket);
    }
  }

  async upsert(lore, socket) {
    try {
      this.logger.log("debug", `upsert lore: ${JSON.stringify(lore)}`);
      const campaign_id = await this.contextProvider.campaignId();
      this.logger.log("debug", `campaign_id: ${JSON.stringify(campaign_id)}`);

      const newLore = lore?.id ?
        await this.repository.update(lore.id, {campaign_id, 
          active: lore.active,
          name: lore.name,
          description: lore.description
        }) :
        await this.repository.insert({campaign_id, ...lore});

      this.logger.log("debug", `newLore: ${JSON.stringify(newLore)}`);

      if (!newLore){
        throw new Error(`Lore not found: ${JSON.stringify(lore)}`);
      } 

      this.messenger.broadcast({
        type: "lore",
        lore: await this.repository.findByCampaignId(campaign_id),
      });
    } catch (error) {
      this.errorHandler.handle(error, {
        stage: "lore.update",
        loreId: lore.id,
      }, socket);
    }
  }
}
