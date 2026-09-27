/**
 * Formats an error into a standardized error message
 * @param error Any error object to format
 * @returns A formatted error message as a string
 */
export function formatError(error: unknown): string {
  const intuitTid = findIntuitTid(error);
  const suffix = intuitTid ? ` [intuit_tid: ${intuitTid}]` : '';
  if (error instanceof Error) {
    return `Error: ${error.message}${suffix}`;
  } else if (typeof error === 'string') {
    return `Error: ${error}${suffix}`;
  } else {
    const safeValue = error === null || error === undefined || typeof error !== 'object'
      ? String(error)
      : 'An unexpected error occurred';
    return `Unknown error: ${safeValue}${suffix}`;
  }
}

function findIntuitTid(error: unknown): string | undefined {
  const queue: unknown[] = [error];
  const seen = new Set<unknown>();
  for (let depth = 0; queue.length && depth < 12; depth++) {
    const current = queue.shift();
    if (!current || typeof current !== 'object' || seen.has(current)) continue;
    seen.add(current);
    const obj = current as Record<string, unknown>;
    const direct = obj.intuit_tid ?? obj['intuit-tid'];
    if (typeof direct === 'string' && direct.trim()) return direct.trim();

    const headers = obj.headers;
    if (headers && typeof headers === 'object') {
      const headerObj = headers as Record<string, unknown>;
      const headerValue = headerObj.intuit_tid ?? headerObj['intuit-tid'];
      if (typeof headerValue === 'string' && headerValue.trim()) return headerValue.trim();
    }
    queue.push(obj.cause, obj.authResponse, obj.response);
  }
  return undefined;
}
