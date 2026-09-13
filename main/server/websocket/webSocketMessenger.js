export class WebSocketMessenger {
  constructor(registry, encoder = null) {
    this.registry = registry;
    this.encoder = encoder;
  }

  send(socket, data) {
    if (!socket || socket.destroyed) return;

    const payload = this.encoder
      ? this.encoder(data)
      : data;

    socket.write(payload);
  }

  broadcast(data) {
    this.registry.forEach((socket) => this.send(socket, data));
  }

  broadcastAndSend(socket, data) {
    this.broadcast(data);
    if (socket) this.send(socket, data);
  }
}
