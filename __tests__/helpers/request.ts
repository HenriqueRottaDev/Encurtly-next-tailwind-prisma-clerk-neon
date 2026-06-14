export function createRequest(url: string, init?: RequestInit): Request {
  return new (globalThis.Request as any)(url, init)
}