import { getValidSpotifyToken } from "./spotifyAuth";
import { getCache, setCache } from "./cache";

export type AuthOk = { accessToken: string; userId: string; setCookies: string[] };

export async function requireSpotifyAuth(request: Request): Promise<AuthOk | Response> {
  const { accessToken, setCookies, error, userId } = await getValidSpotifyToken(request);
  if (error) return new Response("NO_AUTH", { status: 401 });
  return { accessToken: accessToken!, userId: userId!, setCookies: setCookies ?? [] };
}

export function jsonResponse(
  data: unknown,
  setCookies: string[],
  extraHeaders?: Record<string, string>
): Response {
  const res = new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json", ...extraHeaders },
  });
  for (const c of setCookies) res.headers.append("Set-Cookie", c);
  return res;
}

type SpotifyGetOptions = {
  url: string;
  cacheKey?: string;
  ttl?: number;
  transform?: (data: any) => any;
};

export async function spotifyGet(
  request: Request,
  buildOptions: (userId: string) => SpotifyGetOptions
): Promise<Response> {
  const auth = await requireSpotifyAuth(request);
  if (auth instanceof Response) return auth;

  const { url, cacheKey, ttl = 86400, transform } = buildOptions(auth.userId);

  if (cacheKey) {
    const cached = getCache(cacheKey);
    if (cached) return jsonResponse(cached, auth.setCookies, { "X-Cache": "HIT" });
  }

  const spotifyRes = await fetch(url, {
    headers: { Authorization: `Bearer ${auth.accessToken}` },
  });
  const raw = await spotifyRes.json();
  const data = transform ? transform(raw) : raw;

  if (cacheKey) setCache(cacheKey, data, ttl);
  return jsonResponse(data, auth.setCookies, cacheKey ? { "X-Cache": "MISS" } : undefined);
}
