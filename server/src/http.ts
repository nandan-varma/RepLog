export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export function html(markup: string): Response {
  return new Response(markup, {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}

export async function readJson<T = unknown>(request: Request): Promise<T> {
  return request.json() as Promise<T>;
}
