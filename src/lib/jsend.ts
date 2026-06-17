/**
 * JSend response helpers.
 * https://github.com/omniti-labs/jsend
 *
 * - success: everything went well; `data` carries the payload.
 * - fail:    request rejected due to client input/business rule; `data` carries details.
 * - error:   the server failed to process the request; `message` describes it.
 */

export type JSendSuccess<T> = { status: "success"; data: T; message?: string };
export type JSendFail<T> = { status: "fail"; data: T; message?: string };
export type JSendError = { status: "error"; message: string; data?: unknown };
export type JSend<T = unknown> = JSendSuccess<T> | JSendFail<T> | JSendError;

export const success = <T>(data: T, message?: string): JSendSuccess<T> => ({
  status: "success",
  data,
  ...(message ? { message } : {}),
});

export const fail = <T>(data: T, message?: string): JSendFail<T> => ({
  status: "fail",
  data,
  ...(message ? { message } : {}),
});

export const error = (message: string, data?: unknown): JSendError => ({
  status: "error",
  message,
  ...(data !== undefined ? { data } : {}),
});
