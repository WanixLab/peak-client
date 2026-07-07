import { appConfig } from '@/config';

/**
 * Thin typed wrapper around `fetch`, shared by all services.
 *
 * - Prefixes requests with a base URL.
 * - Serializes JSON bodies and parses JSON responses (204 → undefined).
 * - Throws `ApiError` (with the HTTP status) on non-2xx responses.
 * - Aborts requests that exceed `appConfig.api.timeoutMs`.
 *
 * Use `apiClient` for your own backend (`appConfig.api.baseUrl`) or
 * `createApiClient(baseUrl)` to talk to a different host — e.g. the demo
 * users service points at a public API.
 */
export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

type Query = Record<string, string | number | boolean | undefined | null>;

interface RequestOptions extends Omit<RequestInit, 'body'> {
  /** Plain object serialized to a JSON body. */
  body?: unknown;
  /** Appended as a query string (undefined/null values are skipped). */
  query?: Query;
}

function buildUrl(baseUrl: string, path: string, query?: Query): string {
  const url = `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null) params.append(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

export function createApiClient(baseUrl: string) {
  async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { body, query, headers, ...rest } = options;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), appConfig.api.timeoutMs);

    let response: Response;
    try {
      response = await fetch(buildUrl(baseUrl, path, query), {
        ...rest,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch (err) {
      clearTimeout(timeout);
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new ApiError('Request timed out', 408);
      }
      throw new ApiError('Network error', 0, err);
    }
    clearTimeout(timeout);

    const isJson = response.headers.get('content-type')?.includes('application/json');
    const payload = response.status === 204 ? undefined : isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const message =
        (payload && typeof payload === 'object' && 'message' in payload
          ? String((payload as { message: unknown }).message)
          : undefined) ?? `Request failed with status ${response.status}`;
      throw new ApiError(message, response.status, payload);
    }

    return payload as T;
  }

  return {
    get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'GET' }),
    post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
      request<T>(path, { ...options, method: 'POST', body }),
    put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
      request<T>(path, { ...options, method: 'PUT', body }),
    patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
      request<T>(path, { ...options, method: 'PATCH', body }),
    delete: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'DELETE' }),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;

/** Default client pointed at the app's own backend. */
export const apiClient = createApiClient(appConfig.api.baseUrl);
