import { ZodError } from "zod";

/**
 * Application error carrying an HTTP status. Caught by the global Hono
 * `onError` handler and rendered as JSend (`fail` for <500, `error` for >=500).
 */
export class AppError extends Error {
  readonly status: number;
  readonly data?: unknown;

  constructor(message: string, status = 400, data?: unknown) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.data = data;
  }
}

/** 422 with a `{ field: messages[] }` map built from a Zod error. */
export class ValidationError extends AppError {
  constructor(err: ZodError) {
    super("Validation failed", 422, { errors: formatZodError(err) });
    this.name = "ValidationError";
  }
}

export function formatZodError(err: ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of err.issues) {
    const key = issue.path.map(String).join(".") || "_";
    (fieldErrors[key] ??= []).push(issue.message);
  }
  return fieldErrors;
}

/** Convenience throwers used across services. */
export const notFound = (entity = "Resource") =>
  new AppError(`${entity} not found`, 404);

export const forbidden = (message = "Forbidden") =>
  new AppError(message, 403);

export const unauthorized = (message = "Unauthorized") =>
  new AppError(message, 401);

export const conflict = (message: string, data?: unknown) =>
  new AppError(message, 409, data);

export const badRequest = (message: string, data?: unknown) =>
  new AppError(message, 400, data);
