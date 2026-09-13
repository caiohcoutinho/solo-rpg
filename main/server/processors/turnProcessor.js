export class TurnProcessor {
  constructor({ turnRepository, contextProvider, messenger, errorHandler }) {
    this.repository = turnRepository;
    this.contextProvider = contextProvider;
    this.messenger = messenger;
    this.errorHandler = errorHandler;
  }

  async update(message, socket) {
    try {
      const { id, text } = message;
      if (!id || typeof text !== "string") {
        throw new Error("Turn update requires an id and text.");
      }

      const updatedTurn = await this.repository.update(id, text);
      if (!updatedTurn) throw new Error(`Turn not found: ${id}`);

      this.notify(socket, id);
    } catch (error) {
      this.errorHandler.handle(error, {
        stage: "turn.update",
        turnId: message.id,
      }, socket);
    }
  }

  async delete(message, socket) {
    try {
      const { id } = message;
      if (!id) throw new Error("Turn delete requires an id.");

      const deleted = await this.repository.delete(id);
      if (!deleted) throw new Error(`Turn not found: ${id}`);

      this.notify(socket, id);
    } catch (error) {
      this.errorHandler.handle(error, {
        stage: "turn.delete",
        turnId: message.id,
      }, socket);
    }
  }

  async notify(socket, turnId) {
    this.messenger.broadcastAndSend(socket, {
      type: "turn.change.success",
      turnId,
      turns: await this.repository.findActiveByCampaignId(await this.contextProvider.campaignId()),
    });
  }
}
