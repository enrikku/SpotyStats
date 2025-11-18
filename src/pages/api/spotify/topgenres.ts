// src/pages/api/spotify/topgenres.ts
export const runtime = "node";

import type { APIRoute } from "astro";
import { getValidSpotifyToken } from "../../../utils/spotifyAuth";
import { getCache, setCache } from "../../../utils/cache";

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const timeRange = url.searchParams.get("time_range") ?? "medium_term";
  const limit = parseInt(url.searchParams.get("limit") ?? "50");

  // Obtener token válido (auto-refresh si hace falta)
  const { accessToken, setCookies, error } = await getValidSpotifyToken(request);
  if (error) {
    return new Response("NO_AUTH", { status: 401 });
  }

  // -----------------------------
  // 🔥 KEY DE CACHE ÚNICA
  // -----------------------------
  const cacheKey = `topgenres:${accessToken}:${timeRange}:${limit}`;

  const cached = getCache(cacheKey);
  if (cached) {
    const res = new Response(JSON.stringify(cached), {
      headers: {
        "Content-Type": "application/json",
        "X-Cache": "HIT",
      },
    });

    // Reaplicar cookies si se generaron al refrescar token
    if (setCookies) {
      for (const c of setCookies) {
        res.headers.append("Set-Cookie", c);
      }
    }

    return res;
  }

  // Llamada a Spotify
  const spotifyRes = await fetch(`https://api.spotify.com/v1/me/top/artists?limit=50&time_range=${timeRange}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await spotifyRes.json();

  const artists = data.items ?? [];

  // Contar géneros
  const genreCount = new Map<string, number>();

  for (const artist of artists) {
    for (const genre of artist.genres ?? []) {
      genreCount.set(genre, (genreCount.get(genre) ?? 0) + 1);
    }
  }

  const sorted = Array.from(genreCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([genre, count]) => ({ genre, count }));

  // Guardar cache → 24 horas
  setCache(cacheKey, sorted, 86400);

  const res = new Response(JSON.stringify(sorted), {
    headers: {
      "Content-Type": "application/json",
      "X-Cache": "MISS",
    },
  });

  // Si el token se refrescó, enviamos nuevas cookies
  if (setCookies) {
    for (const c of setCookies) {
      res.headers.append("Set-Cookie", c);
    }
  }

  return res;
};
