const FRIENDLY_ERRORS: Record<string, string> = {
  QuotaExceededError: "Browser storage is full. Free storage space and try again.",
  SecurityError: "Browser privacy settings prevented local data access.",
  NotAllowedError: "The browser did not allow access to this file.",
  DataError: "The import data could not be stored because it has an invalid format.",
};

export function normalizeImportError(error: unknown): Error {
  if (error instanceof DOMException) return new Error(FRIENDLY_ERRORS[error.name] ?? `Browser storage error: ${error.message}`);
  if (error instanceof Error) return error;
  return new Error("The import could not be completed. No data was changed.");
}
