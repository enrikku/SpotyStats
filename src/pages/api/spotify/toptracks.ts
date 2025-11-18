export const runtime = "node";

import type { APIRoute } from "astro";
import { getValidSpotifyToken } from "../../../utils/spotifyAuth";
import { getCache, setCache } from "../../../utils/cache";

export const GET: APIRoute = async ({ request }) => {
  const { accessToken, setCookies, error } = await getValidSpotifyToken(request);

  if (error) {
    return new Response("NO_AUTH", { status: 401 });
  }

  const url = new URL(request.url);
  const timeRange = url.searchParams.get("time_range") ?? "medium_term";

  // --------------------------------------
  // 🔥 Cache Key
  // --------------------------------------
  const cacheKey = `toptracks:${accessToken}:${timeRange}`;
  const cached = getCache(cacheKey);

  if (cached) {
    console.log("Serving top tracks from cache:", cacheKey);

    const res = new Response(JSON.stringify(cached), {
      headers: { "Content-Type": "application/json", "X-Cache": "HIT" },
    });

    // reenviar cookies si hubo refresh
    if (setCookies) {
      for (const c of setCookies) {
        res.headers.append("Set-Cookie", c);
      }
    }

    return res;
  }

  // --------------------------------------
  // ❌ No está en caché → pedir a Spotify
  // --------------------------------------
  const spotifyRes = await fetch(`https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=${timeRange}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await spotifyRes.json();

  // Guardar en cache 24h
  setCache(cacheKey, data, 86400);

  const res = new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json", "X-Cache": "MISS" },
  });

  // reenviar cookies si hubo refresh
  if (setCookies) {
    for (const c of setCookies) {
      res.headers.append("Set-Cookie", c);
    }
  }
  return res;
};
