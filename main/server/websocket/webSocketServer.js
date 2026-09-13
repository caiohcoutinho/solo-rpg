export class WebSocketServer {
  constructor({ server, router, registry, encryption, logger }) {
    this.server = server;
    this.router = router;
    this.registry = registry;
    this.encryption = encryption;
    this.logger = logger;
  }

  start() {
    this.server.on("upgrade", (req, socket) => {
      if (req.url !== "/ws") {
        socket.destroy();
        return;
      }

      const websocketKey = req.headers["sec-websocket-key"];
      if (!websocketKey) {
        socket.destroy();
        return;
      }

      const socketAcceptKey =
        this.encryption.createWebSocketAcceptKey(websocketKey);

      socket.write([
        "HTTP/1.1 101 Switching Protocols",
        "Upgrade: websocket",
        "Connection: Upgrade",
        `Sec-WebSocket-Accept: ${socketAcceptKey}`,
        "",
        "",
      ].join("\r\n"));

      this.handleConnection(socket);
    });
  }

  handleConnection(socket) {
    this.registry.add(socket);

    this.logger.log(
      "debug",
      `WebSocket client connected (${this.registry.size()} total)`
    );

    this.sendReady(socket);

    socket.on("data", (buffer) => {
      const message = this.encryption.decodeWebSocketMessage(buffer);
      if (!message) return;

      if (message.type === "close") {
        socket.end();
        return;
      }

      void this.router.route(message, socket);
    });

    socket.on("close", () => {
      this.registry.remove(socket);
      this.logger.log(
        "debug",
        `WebSocket client disconnected (${this.registry.size()} total)`
      );
    });

    socket.on("error", (error) => {
      this.registry.remove(socket);
      this.logger.log("debug", `WebSocket client error: ${error.message}`);
      this.logger.log("debug", `Stacktrace: ${error.stack}`);
    });
  }

  sendReady(socket) {
    this.router.messenger.send(socket, {
      type: "connection.ready",
      message: "WebSocket connection ready.",
      connectedClients: this.registry.size(),
    });
  }
}
