// export const runtime = "node";


// import type { APIRoute } from "astro";
// import { spotifyRequest } from "../../../utils/spotifyApi";
// import { getSession, refreshAccessToken } from "../../../utils/spotifySession";

// export const GET: APIRoute = async ({ request }) => {
//     const cookie = request.headers.get("cookie");
//     const sessionId = cookie?.match(/sessionId=([^;]+)/)?.[1];

//     const url = new URL(request.url);
//     const timeRange = url.searchParams.get("time_range") ?? "medium_term";


//     if (!sessionId) {
//         return new Response("No session", { status: 401 });
//     }

//     const data = await spotifyRequest(
//         sessionId,
//         `https://api.spotify.com/v1/me/top/artists?limit=50&time_range=${timeRange}`,
//     );

//     return new Response(JSON.stringify(data), {
//         headers: { "Content-Type": "application/json" }
//     });
// };
export const runtime = "node";

import type { APIRoute } from "astro";
import { spotifyRequest } from "../../../utils/spotifyApi";
import { getCache, setCache } from "../../../utils/cache";

export const GET: APIRoute = async ({ request }) => {
  const cookie = request.headers.get("cookie");
  const sessionId = cookie?.match(/sessionId=([^;]+)/)?.[1];

  const url = new URL(request.url);
  const timeRange = url.searchParams.get("time_range") ?? "medium_term";

  if (!sessionId) {
    return new Response("No session", { status: 401 });
  }

  // ---- 🔥 CACHE KEY ----
  const cacheKey = `topartists:${sessionId}:${timeRange}`;

  // ---- 🔥 Intentar obtener desde caché ----
  const cached = getCache(cacheKey);
  if (cached) {
    console.log("Serving top artists from cache for key:", cacheKey);
    return new Response(JSON.stringify(cached), {
      headers: { "Content-Type": "application/json", "X-Cache": "HIT" }
    });
  }

  // ---- ❌ No está en caché → pedir a Spotify ----
  const data = await spotifyRequest(
    sessionId,
    `https://api.spotify.com/v1/me/top/artists?limit=50&time_range=${timeRange}`
  );

  // ---- 💾 Guardar en caché por 60s ----
  setCache(cacheKey, data, 60);

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json", "X-Cache": "MISS" }
  });
};
