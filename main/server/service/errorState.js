const MAX_STORED_ERRORS = 100;
const serverErrors = [];

function normalizeError(error) {
  if (error instanceof Error) {
    return {
      message: error.message || "Unknown error",
      name: error.name || "Error",
      stack: error.stack,
    };
  }

  if (typeof error === "string") {
    return {
      message: error,
      name: "Error",
    };
  }

  return {
    message: "Unknown error",
    name: "Error",
  };
}

function addServerError(error, context = {}) {
  const normalizedError = normalizeError(error);
  const entry = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    timestamp: new Date().toISOString(),
    message: normalizedError.message,
    name: normalizedError.name,
    stack: normalizedError.stack,
    context,
  };

  serverErrors.push(entry);

  if (serverErrors.length > MAX_STORED_ERRORS) {
    serverErrors.splice(0, serverErrors.length - MAX_STORED_ERRORS);
  }

  return entry;
}

function getServerErrors() {
  return [...serverErrors].sort((left, right) => {
    return new Date(left.timestamp) - new Date(right.timestamp);
  });
}

function clearServerErrors() {
  serverErrors.length = 0;
}

function buildErrorEvent({ message = "Oops, we screwed it!", context = {}, error = null } = {}) {
  return {
    type: "server.errors",
    message,
    context,
    error,
    errors: getServerErrors(),
    timestamp: new Date().toISOString(),
  };
}

export { addServerError, buildErrorEvent, clearServerErrors, getServerErrors };
