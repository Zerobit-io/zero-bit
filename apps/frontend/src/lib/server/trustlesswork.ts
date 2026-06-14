/**
 * lib/server/trustlesswork.ts
 * Server-side only — never imported by client components.
 * Provides a typed fetch wrapper for the TrustlessWork API.
 */

const BASE_URL =
  process.env.TRUSTLESS_WORK_BASE_URL ?? "https://api.trustlesswork.com";
const API_KEY = process.env.TRUSTLESS_WORK_API_KEY ?? "";

/** Thrown when TrustlessWork returns a non-2xx response. */
export class TrustlessWorkRequestError extends Error {
  readonly statusCode: number;
  readonly messages: string[];
  readonly payload: unknown;

  constructor(message: string, statusCode: number, messages: string[], payload: unknown) {
    super(message);
    this.name = "TrustlessWorkRequestError";
    this.statusCode = statusCode;
    this.messages = messages;
    this.payload = payload;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
}

/**
 * Typed fetch wrapper for TrustlessWork REST API.
 * All calls are server-side only (API key is never in NEXT_PUBLIC_*).
 */
export async function trustlessWorkRequest<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, headers = {} } = options;

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const data = (await response.json()) as Record<string, unknown>;

  if (!response.ok) {
    const messages: string[] = Array.isArray(data.messages)
      ? (data.messages as string[])
      : typeof data.error === "string"
        ? [data.error]
        : typeof data.message === "string"
          ? [data.message]
          : [`TrustlessWork API error ${response.status}`];

    throw new TrustlessWorkRequestError(
      messages[0] ?? "TrustlessWork error",
      response.status,
      messages,
      data,
    );
  }

  return data as T;
}

/**
 * Attempts to extract a Stellar transaction hash from a TrustlessWork
 * send-transaction response. Returns null if not found.
 */
export function extractTransactionHash(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const p = payload as Record<string, unknown>;
  if (typeof p.transactionHash === "string") return p.transactionHash;
  if (typeof p.hash === "string") return p.hash;
  if (typeof p.txHash === "string") return p.txHash;
  return null;
}
