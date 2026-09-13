export class WebSocketClientRegistry {
  constructor() {
    this.clients = new Set();
  }

  add(socket) {
    this.clients.add(socket);
  }

  remove(socket) {
    this.clients.delete(socket);
  }

  size() {
    return this.clients.size;
  }

  forEach(callback) {
    for (const client of this.clients) {
      callback(client);
    }
  }
}
