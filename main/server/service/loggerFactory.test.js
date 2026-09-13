import test from 'node:test';
import assert from 'node:assert/strict';
import { LoggerFactory } from './loggerFactory.js';

test('Should create a logger and log a message', async () => {
  const logger = LoggerFactory.createLogger("testLogger");
  const logMessage = "This is a test message";

  logger.info(logMessage);
});