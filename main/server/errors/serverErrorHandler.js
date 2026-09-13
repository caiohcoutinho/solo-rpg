import { addServerError, buildErrorEvent, getServerErrors } from "../service/errorState.js";

export class ServerErrorHandler {
  constructor({ messenger }) {
    this.messenger = messenger;
  }


  handle(error, context = {}, socket) {
    const serverError = addServerError(error, context);
    const warningMessage = "Oops, we screwed it!";

    const errorEvent = buildErrorEvent({
      message: warningMessage,
      context,
      error: serverError,
    });

    const clientEvent = {
      type: "llm.error",
      error: warningMessage,
      errors: getServerErrors(),
      timestamp: new Date().toISOString(),
    };

    this.messenger.broadcast(clientEvent);
    this.messenger.broadcast(errorEvent);

    if (socket && !socket.destroyed) {
      this.messenger.send(socket, clientEvent);
      this.messenger.send(socket, errorEvent);
    }

    console.error("WebSocket processing error:", serverError.message);
    console.error("Stacktrace:", serverError.stack);
  }
}
