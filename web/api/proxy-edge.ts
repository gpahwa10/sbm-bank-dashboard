/// <reference lib="dom" />
/// <reference types="node" />
/**
 * Proxies /api/* to API_PROXY_ORIGIN so the static SPA can keep calling /api
 * without VITE_API_BASE_URL at build time. Set API_PROXY_ORIGIN in Vercel
 * (e.g. https://your-api.railway.app — no trailing slash).
 */
const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
]);

export async function proxyApi(request: Request): Promise<Response> {
  const base = process.env.API_PROXY_ORIGIN?.trim().replace(/\/+$/, "");
  if (!base) {
    return new Response(
      JSON.stringify({
        message:
          "API_PROXY_ORIGIN is not set. Add it in Vercel project env (origin of your Express API, no trailing slash).",
      }),
      { status: 503, headers: { "content-type": "application/json" } },
    );
  }

  const url = new URL(request.url);
  const upstreamUrl = `${base}${url.pathname}${url.search}`;

  const headers = new Headers();
  request.headers.forEach((value: string, key: string) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  const init: RequestInit = {
    method: request.method,
    headers,
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = request.body;
  }

  const upstream = await fetch(upstreamUrl, init);

  const outHeaders = new Headers(upstream.headers);
  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: outHeaders,
  });
}
