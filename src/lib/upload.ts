/**
 * Structural helpers for multipart uploads. We avoid depending on the global
 * `File`/`instanceof File` (not reliably typed under the Workers runtime types)
 * by duck-typing the Blob/File-like shape returned by `FormData`.
 */
export interface UploadedFile {
  arrayBuffer(): Promise<ArrayBuffer>;
  name: string;
  type: string;
}

export function asUploadedFile(value: unknown): UploadedFile | null {
  if (
    value &&
    typeof value === "object" &&
    typeof (value as { arrayBuffer?: unknown }).arrayBuffer === "function"
  ) {
    return value as UploadedFile;
  }
  return null;
}

/** Collect uploaded files from the given form fields (in order). */
export function collectUploads(
  form: FormData,
  fields: string[],
): UploadedFile[] {
  const out: UploadedFile[] = [];
  for (const field of fields) {
    for (const entry of form.getAll(field)) {
      const file = asUploadedFile(entry);
      if (file) out.push(file);
    }
  }
  return out;
}
