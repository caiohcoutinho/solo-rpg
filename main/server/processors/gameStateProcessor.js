export class GameStateProcessor {
  constructor({ gameStateRepository, messenger, errorHandler }) {
    this.repository = gameStateRepository;
    this.messenger = messenger;
    this.errorHandler = errorHandler;
  }

  async update(message, socket) {
    try {
      const { key, value } = message;

      if (!key) throw new Error("State update requires a key.");

      let payload;

      if (!value) {
        await this.repository.deleteByKey(key);
        payload = {
          type: "state.change",
          key,
          value: null,
          gameStates: this.repository.findAll(),
        };
      } else {
        const existingState = await this.repository.findByKey(key);
        const updatedState = existingState
          ? await this.repository.update(existingState.id, { key, value })
          : await this.repository.insert({ key, value });

        if (!updatedState) {
          throw new Error(`Failed to persist game state: ${key}`);
        }

        payload = {
          type: "state.change",
          key: updatedState.key,
          value: updatedState.value,
          gameStates: this.repository.findAll(),
        };
      }

      this.messenger.broadcastAndSend(socket, payload);
    } catch (error) {
      this.errorHandler.handle(error, {
        stage: "state.update",
        key: message.key,
        value: message.value,
      }, socket);
    }
  }
}
