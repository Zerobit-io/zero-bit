/**
 * trustlesswork-errors.ts
 * Utility to extract human-readable error messages from TrustlessWork
 * API responses, fetch errors, and unknown thrown values.
 */

type MaybeErrorPayload = {
  error?: string;
  message?: string;
  messages?: string[];
  [key: string]: unknown;
};

/**
 * Extracts an array of error message strings from any thrown value or
 * structured API error response.
 *
 * @param error   - The caught value (Error, object, string, etc.)
 * @param fallback - Default message when nothing useful can be extracted
 */
export function getErrorMessages(
  error: unknown,
  fallback = "An unexpected error occurred.",
): string[] {
  if (!error) return [fallback];

  // Standard Error object
  if (error instanceof Error) return [error.message || fallback];

  // Structured API error object
  if (typeof error === "object") {
    const e = error as MaybeErrorPayload;

    if (Array.isArray(e.messages) && e.messages.length > 0) {
      return e.messages.filter((m): m is string => typeof m === "string");
    }
    if (typeof e.error === "string" && e.error.trim()) return [e.error];
    if (typeof e.message === "string" && e.message.trim()) return [e.message];
  }

  // Plain string
  if (typeof error === "string" && error.trim()) return [error];

  return [fallback];
}
