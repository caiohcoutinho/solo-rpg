export class QuickActionProcessor {
  constructor({ challengeProcessor, chatProcessor, errorHandler }) {
    this.challengeProcessor = challengeProcessor;
    this.chatProcessor = chatProcessor;
    this.errorHandler = errorHandler;
  }

  async process(message, socket) {
    try {
      if (!message || typeof message !== "object") {
        throw new Error("Quick action message must be an object.");
      }

      if (message.isChallenge) {
        const nextText = await this.challengeProcessor.process(message, socket);
        if (nextText) {
          return this.chatProcessor.process(nextText, true, socket);
        }
        return;
      }

      return this.chatProcessor.process(
        message.description,
        message.isChallenge,
        socket
      );
    } catch (error) {
      this.errorHandler.handle(error, {
        stage: "quick_action",
        quickActionMessage: message,
      }, socket);
    }
  }
}
