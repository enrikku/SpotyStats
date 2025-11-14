// export const runtime = "node";

// import type { APIRoute } from "astro";
// import { spotifyRequest } from "../../../utils/spotifyApi";

// export const GET: APIRoute = async ({ request }) => {
//   const cookie = request.headers.get("cookie");
//   const sessionId = cookie?.match(/sessionId=([^;]+)/)?.[1];

//   if (!sessionId) {
//     return new Response("No session", { status: 401 });
//   }

//   // Leer parámetros de la URL
//   const url = new URL(request.url);
//   const timeRange = url.searchParams.get("time_range") ?? "medium_term";
//   const limit = parseInt(url.searchParams.get("limit") ?? "50");

//   // Llamada a Spotify
//   const data = await spotifyRequest(
//     sessionId,
//     `https://api.spotify.com/v1/me/top/artists?limit=50&time_range=${timeRange}`
//   );

//   const artists = data.items ?? [];

//   // Contar géneros
//   const genreCount = new Map<string, number>();

//   for (const artist of artists) {
//     for (const genre of artist.genres ?? []) {
//       genreCount.set(genre, (genreCount.get(genre) ?? 0) + 1);
//     }
//   }

//   // Ordenar por más escuchados
//   const sorted = Array.from(genreCount.entries())
//     .sort((a, b) => b[1] - a[1])
//     .slice(0, limit)
//     .map(([genre, count]) => ({ genre, count }));

//   return new Response(JSON.stringify(sorted), {
//     headers: { "Content-Type": "application/json" }
//   });
// };


export const runtime = "node";

import type { APIRoute } from "astro";
import { spotifyRequest } from "../../../utils/spotifyApi";
import { getCache, setCache } from "../../../utils/cache";

export const GET: APIRoute = async ({ request }) => {
  const cookie = request.headers.get("cookie");
  const sessionId = cookie?.match(/sessionId=([^;]+)/)?.[1];

  if (!sessionId) {
    return new Response("No session", { status: 401 });
  }

  const url = new URL(request.url);
  const timeRange = url.searchParams.get("time_range") ?? "medium_term";
  const limit = parseInt(url.searchParams.get("limit") ?? "50");

  // -----------------------------
  // 🔥 KEY DE CACHE ÚNICA
  // -----------------------------
  const cacheKey = `topgenres:${sessionId}:${timeRange}:${limit}`;

  const cached = getCache(cacheKey);
  if (cached) {
    console.log("Serving top genres from cache for key:", cacheKey);
    return new Response(JSON.stringify(cached), {
      headers: { "Content-Type": "application/json", "X-Cache": "HIT" }
    });
  }

  // -----------------------------
  // ❌ No está en caché → pedir a Spotify
  // -----------------------------
  const data = await spotifyRequest(
    sessionId,
    `https://api.spotify.com/v1/me/top/artists?limit=50&time_range=${timeRange}`
  );

  const artists = data.items ?? [];

  // Contar géneros
  const genreCount = new Map<string, number>();

  for (const artist of artists) {
    for (const genre of artist.genres ?? []) {
      genreCount.set(genre, (genreCount.get(genre) ?? 0) + 1);
    }
  }

  // Ordenar por cantidad
  const sorted = Array.from(genreCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([genre, count]) => ({ genre, count }));

  // Guardar cache → 60 segundos
  setCache(cacheKey, sorted, 86400);

  return new Response(JSON.stringify(sorted), {
    headers: { "Content-Type": "application/json", "X-Cache": "MISS" }
  });
};
