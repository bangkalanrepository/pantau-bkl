/** Helper fetch JSON yang aman + deteksi pembatalan (AbortController). */

export class ApiRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

export function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === 'AbortError') ||
    (error instanceof Error && error.name === 'AbortError')
  );
}

export async function requestJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new ApiRequestError('Tidak dapat menghubungi server');
  }

  if (!response.ok) {
    throw new ApiRequestError(`Server merespons dengan status ${response.status}`);
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiRequestError('Format respons tidak valid');
  }
}
