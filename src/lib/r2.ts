import type { Env } from "../types";
import { uuid } from "./crypto";

export type R2Body =
  | ArrayBuffer
  | ArrayBufferView
  | ReadableStream
  | Blob
  | string;

/** Upload an object to R2 and return its key. */
export async function uploadFile(
  bucket: R2Bucket,
  key: string,
  body: R2Body,
  contentType?: string,
): Promise<string> {
  await bucket.put(key, body, {
    httpMetadata: contentType ? { contentType } : undefined,
  });
  return key;
}

/** Delete an object from R2 (no-op if the key is empty). */
export async function deleteFile(
  bucket: R2Bucket,
  key: string | null | undefined,
): Promise<void> {
  if (!key) return;
  await bucket.delete(key);
}

/** Build the public URL for an R2 key from R2_PUBLIC_URL. */
export function getPublicUrl(env: Env, key: string | null | undefined): string | null {
  if (!key) return null;
  const base = env.R2_PUBLIC_URL.replace(/\/+$/, "");
  return `${base}/${key}`;
}

/** Build a namespaced, collision-resistant R2 key for an upload. */
export function buildR2Key(prefix: string, filename: string): string {
  const safe = filename
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${prefix.replace(/\/+$/, "")}/${uuid()}-${safe || "file"}`;
}
