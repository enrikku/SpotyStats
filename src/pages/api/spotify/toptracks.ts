// export const runtime = "node";

// import type { APIRoute } from "astro";
// import { spotifyRequest } from "../../../utils/spotifyApi";

// export const GET: APIRoute = async ({ request }) => {
//     const cookie = request.headers.get("cookie");    
//     const sessionId = cookie?.match(/sessionId=([^;]+)/)?.[1];

//     if (!sessionId) {
//         return new Response("No session", { status: 401 });
//     }
//     const url = new URL(request.url);
//     const timeRange = url.searchParams.get("time_range") ?? "medium_term";

//     const data = await spotifyRequest(
//         sessionId,
//          `https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=${timeRange}`, 
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

    if (!sessionId) {
        return new Response("No session", { status: 401 });
    }

    const url = new URL(request.url);
    const timeRange = url.searchParams.get("time_range") ?? "medium_term";

    // --------------------------------------
    // 🔥 CACHE KEY única por usuario y rango
    // --------------------------------------
    const cacheKey = `toptracks:${sessionId}:${timeRange}`;
    const cached = getCache(cacheKey);

    if (cached) {
        console.log("Serving top tracks from cache for key:", cacheKey);
        return new Response(JSON.stringify(cached), {
            headers: { "Content-Type": "application/json", "X-Cache": "HIT" }
        });
    }

    // --------------------------------------
    // ❌ No está en caché → pedir a Spotify
    // --------------------------------------
    const data = await spotifyRequest(
        sessionId,
        `https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=${timeRange}`
    );

    // Guardamos cache 60 segundos
    setCache(cacheKey, data, 86400);

    return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json", "X-Cache": "MISS" }
    });
};
