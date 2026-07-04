/**
 * Permission pattern matching.
 *
 * Rules:
 *  - Pattern "*" alone → matches any permission (superadmin)
 *  - Otherwise: split by ".", same number of segments required.
 *    Each segment is matched literally OR segment "*" matches any single value.
 *
 * Examples:
 *  matchesPattern("*", "store.abc.view")            → true
 *  matchesPattern("store.*.view", "store.abc.view") → true
 *  matchesPattern("store.*.view", "store.abc.delete") → false
 *  matchesPattern("store.abc.view", "store.abc.view") → true
 *  matchesPattern("store.*.products.*", "store.abc.products.create") → true
 */
export function matchesPattern(pattern: string, permission: string): boolean {
  if (pattern === "*") return true;
  const pp = pattern.split(".");
  const rp = permission.split(".");
  if (pp.length !== rp.length) return false;
  return pp.every((seg, i) => seg === "*" || seg === rp[i]);
}

/** Specificity score: more literal segments = higher specificity. */
export function specificity(pattern: string): number {
  if (pattern === "*") return -1;
  return pattern.split(".").filter((s) => s !== "*").length;
}
