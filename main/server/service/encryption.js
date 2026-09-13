import crypto from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const DEFAULT_KEY = "solo-rpg-default-encryption-key";

class Encryption {
  
  static createWebSocketAcceptKey(key) {
    return crypto
      .createHash("sha1")
      .update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
      .digest("base64");
  }

  static encodeWebSocketMessage(data) {
    const payload = Buffer.from(JSON.stringify(data));
    const payloadLength = payload.length;

    if (payloadLength < 126) {
      return Buffer.concat([Buffer.from([0x81, payloadLength]), payload]);
    }

    if (payloadLength <= 65535) {
      const header = Buffer.alloc(4);
      header[0] = 0x81;
      header[1] = 126;
      header.writeUInt16BE(payloadLength, 2);
      return Buffer.concat([header, payload]);
    }

    const header = Buffer.alloc(10);
    header[0] = 0x81;
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(payloadLength), 2);
    return Buffer.concat([header, payload]);
  }

  static decodeWebSocketMessage(buffer) {
    const opcode = buffer[0] & 0x0f;

    if (opcode === 0x8) {
      return { type: "close" };
    }

    if (opcode !== 0x1) {
      return null;
    }

    let offset = 2;
    let payloadLength = buffer[1] & 0x7f;

    if (payloadLength === 126) {
      payloadLength = buffer.readUInt16BE(offset);
      offset += 2;
    } else if (payloadLength === 127) {
      payloadLength = Number(buffer.readBigUInt64BE(offset));
      offset += 8;
    }

    const isMasked = Boolean(buffer[1] & 0x80);
    const mask = isMasked ? buffer.subarray(offset, offset + 4) : null;
    offset += isMasked ? 4 : 0;

    const payload = buffer.subarray(offset, offset + payloadLength);

    if (mask) {
      for (let index = 0; index < payload.length; index += 1) {
        payload[index] ^= mask[index % 4];
      }
    }

    try {
      return JSON.parse(payload.toString("utf8"));
    } catch {
      return { type: "chat", text: payload.toString("utf8") };
    }
  }

}

export { Encryption };
